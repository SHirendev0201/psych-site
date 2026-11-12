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

app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API route not found" });
});

app.use(express.static(path.join(__dirname, "public")));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    console.log(`Mindcheck is running at http://localhost:${port}`);
});
