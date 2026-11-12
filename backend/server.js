
const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            success: true,
            message: "Mindcheck API is running",
            database: "Connected"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// Get all tests
app.get("/api/tests", async (req, res) => {
    try {
        const [tests] = await db.query(
            "SELECT * FROM tests"
        );

        res.json({
            success: true,
            data: tests
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve tests"
        });
    }
});

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to Mindcheck.mn API");
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Mindcheck API running at http://localhost:${PORT}`);
});
