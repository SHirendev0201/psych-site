const path = require("node:path");
const express = require("express");
const db = require("./db");

const app = express();

app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");
        res.json({
            success: true,
            message: "Mindcheck API is running",
            database: "Connected"
        });
    } catch (error) {
        console.error("MySQL health check failed:", error.code || error.name);
        res.status(503).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

app.get("/api/tests", async (req, res) => {
    try {
        const [tests] = await db.query(
            `SELECT id, title, description, test_type, time_limit_seconds
             FROM tests
             WHERE is_active = 1
             ORDER BY id`
        );
        res.json({ success: true, data: tests });
    } catch (error) {
        console.error("Assessment catalog query failed:", error.code || error.name);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve tests"
        });
    }
});

async function loadIqQuestions(testId, includeScores = false) {
    const [rows] = await db.execute(
        `SELECT q.id AS question_id, q.question_text, q.category,
                o.id AS option_id, o.option_text${includeScores ? ", o.score" : ""}
         FROM questions q
         JOIN tests t ON t.id = q.test_id
         LEFT JOIN options o ON o.question_id = q.id
         WHERE t.id = ? AND t.is_active = 1 AND t.test_type = 'iq'
         ORDER BY q.sort_order, q.id, o.sort_order, o.id`,
        [testId]
    );

    const questions = new Map();
    for (const row of rows) {
        if (!questions.has(row.question_id)) {
            questions.set(row.question_id, {
                id: row.question_id,
                text: row.question_text,
                category: row.category,
                options: []
            });
        }
        if (row.option_id != null) {
            const option = { id: row.option_id, text: row.option_text };
            if (includeScores) option.score = row.score;
            questions.get(row.question_id).options.push(option);
        }
    }
    return questions;
}

app.get("/api/tests/:id/questions", async (req, res) => {
    try {
        const questions = [...(await loadIqQuestions(req.params.id)).values()];
        if (!questions.length || questions.some((question) => !question.options.length)) {
            return res.status(404).json({ success: false, message: "IQ questions unavailable" });
        }
        res.json({ success: true, data: questions });
    } catch (error) {
        console.error("IQ question query failed:", error.code || error.name);
        res.status(500).json({ success: false, message: "Failed to load IQ questions" });
    }
});

app.post("/api/tests/:id/score", express.json(), async (req, res) => {
    const answers = req.body?.answers;
    if (!Array.isArray(answers)) {
        return res.status(400).json({ success: false, message: "Answers must be an array" });
    }

    try {
        const questions = await loadIqQuestions(req.params.id, true);
        if (!questions.size || [...questions.values()].some((question) => !question.options.length)) {
            return res.status(404).json({ success: false, message: "IQ questions unavailable" });
        }

        const selected = new Map();
        for (const answer of answers) {
            const question = questions.get(answer?.questionId);
            const option = question?.options.find((choice) => choice.id === answer.optionId);
            if (!option || selected.has(question.id)) {
                return res.status(400).json({ success: false, message: "Invalid or duplicate answer" });
            }
            selected.set(question.id, option.score);
        }

        let raw = 0;
        let max = 0;
        const breakdown = new Map();
        for (const question of questions.values()) {
            const points = selected.get(question.id) ?? 0;
            const possible = Math.max(...question.options.map((option) => option.score));
            raw += points;
            max += possible;
            const category = question.category || "other";
            const totals = breakdown.get(category) || { points: 0, possible: 0 };
            totals.points += points;
            totals.possible += possible;
            breakdown.set(category, totals);
        }
        const cats = Object.fromEntries([...breakdown].map(([category, totals]) => [
            category, totals.possible ? Math.round(totals.points / totals.possible * 100) : 0
        ]));
        const [results] = await db.execute(
            `SELECT title, description, advice FROM results
             WHERE test_id = ? AND ? BETWEEN min_score AND max_score
             ORDER BY min_score DESC, id LIMIT 1`,
            [req.params.id, raw]
        );
        const pct = max ? Math.round(raw / max * 100) : 0;
        const band = pct < 46 ? "dev" : pct < 69 ? "avg" : pct < 89 ? "above" : "high";
        res.json({ success: true, data: { raw, max, pct, band, cats, feedback: results[0] || null } });
    } catch (error) {
        console.error("IQ scoring failed:", error.code || error.name);
        res.status(500).json({ success: false, message: "Failed to score IQ test" });
    }
});

app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API route not found" });
});

app.use(express.static(path.join(__dirname, "..", "public")));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    console.log(`Mindcheck is running at http://localhost:${port}`);
});
