# psych-site
Сэтгэл зүйн сайт — React + Vite frontend, Express backend, MySQL database.

## Бүтэц

- `frontend/` — React + Vite веб интерфэйс
- `backend/` — Express API ба MySQL холболт
- `database/init/` — MySQL эхлүүлэх SQL скрипт
- `docker-compose.yml` — локал MySQL сервер

## Шаардлага

- Node.js 20+
- Docker Desktop (эсвэл локал MySQL 8+)

## Эхлүүлэх

1. Орчны тохиргооны файлууд үүсгэнэ:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

2. MySQL-ийг асаана:

   ```bash
   docker compose up -d
   ```

   MySQL анх эхлэхэд `database/init/001_schema.sql` автоматаар ажиллана.

3. Backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   API: `http://localhost:3000/api/health`

4. Шинэ terminal нээгээд frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Веб: `http://localhost:5173`

## MySQL тохиргоо

`backend/.env` дахь `DB_*` утгууд Docker Compose-ийн тохиргоотой таарах ёстой. Локал хөгжүүлэлтийн анхны утгуудыг `.env.example` болон `docker-compose.yml`-ээс харна уу. Бодит нууц үг болон `.env` файлыг GitHub-д commit хийж болохгүй.

Өгөгдлийг Docker volume-д хадгална. MySQL-ийг зогсоохдоо `docker compose down` ашиглана. Өгөгдлийг бүрэн устгаж дахин эхлүүлэх шаардлагатай бол `docker compose down -v` ажиллуулна (энэ нь локал өгөгдлийг устгана).
