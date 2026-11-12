# Mindcheck local setup

Install Node.js and start your local MySQL server. This project uses the
existing `psych_site` database and its `tests` table. Use a MySQL account
with SELECT access to that table.

In PowerShell, open the extracted `Mindcheck` folder and run:

```powershell
Copy-Item .env.example .env
notepad .env
npm ci
npm start
```

Replace `DB_USER` and `DB_PASSWORD` in `.env` with your MySQL credentials
before starting the server. Update the host, port, or database name if your
MySQL setup uses different settings. Keep `.env` in the project root.

| Address | Expected result |
| --- | --- |
| http://localhost:3000/ | Mindcheck homepage |
| http://localhost:3000/api/health | JSON with `database: "Connected"` |
| http://localhost:3000/api/tests | JSON containing active assessments |

Open the homepage using the server address. If the database health check fails,
verify that MySQL is running and the configured account can connect. If the
assessment list is empty, check for rows with `is_active = 1` in
`psych_site.tests`.

The assessment screens currently use the browser demo data in `public/data.js`.
The API provides a database health check and a read-only assessment catalog.
Question delivery, scoring, and submission storage still need server endpoints.
