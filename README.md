# Portfolio Library (Art Gallery + Professional Writing Library)

This repo contains:
- `backend/` Node/Express API + SQLite + JWT auth + file uploads (multer)
- `frontend/` React (Vite + TypeScript) + Tailwind + artistic styling

## Quick Start (Local)

### 1) Backend
```bash
cd backend
npm install
cp .env.example .env
# Set ADMIN_EMAIL and ADMIN_PASSWORD in .env
npm run dev
