import 'dotenv/config';
import express from 'express';
import pool from './db.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error.message);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
