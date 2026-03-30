# StockDesk

Inventory + POS web application built with React, Tailwind CSS, Node.js, Express, PostgreSQL, and Sequelize.

## Structure

- `backend/` — Express API, Sequelize models, JWT auth, receipt PDF generation
- `frontend/` — Vite + React + Tailwind dashboard UI

## Setup

1. Install PostgreSQL and create a database named `stockdesk`.
2. Copy `backend/.env.example` to `backend/.env` and fill in your database connection settings.
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
5. Start backend:
   ```bash
   cd ../backend
   npm run dev
   ```
6. Start frontend:
   ```bash
   cd ../frontend
   npm run dev
   ```

### Workspace helper scripts

You can also run common commands from the repository root:

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
npm run start:backend
npm run start:frontend
npm run build:frontend
```

## Default admin login

- Email: `admin@stockdesk.local`
- Password: `Admin@123`

## Notes

- The app stores shop settings and currency in the `settings` table.
- Sales create receipts and update product stock.
- Admin users can manage users, products, and system settings.

## Deployment

### GitHub

Initialize the repo locally from the workspace root:

```bash
git init
git branch -M main
git add .
git commit -m "Initial StockDesk setup"
```

Create an empty GitHub repository, then connect and push:

```bash
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

### Backend on Railway

Deploy the `backend` folder as the Railway service root directory.

Required Railway environment variables:

- `PORT`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `CORS_ORIGINS`
- `CORS_ORIGIN_PATTERNS`
- `VERIFY_EMAIL_BASE_URL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

Recommended production values:

- `CORS_ORIGINS=https://<your-vercel-domain>`
- `CORS_ORIGIN_PATTERNS=https://*.vercel.app`
- `VERIFY_EMAIL_BASE_URL=https://<your-railway-domain>/api/auth/verify-email`

Railway start command:

```bash
npm start
```

The file `backend/railway.json` is included and sets the service start command and `/api` health check.

Health check URL:

```text
/api
```

### Frontend on Vercel

Deploy the `frontend` folder as the Vercel project root.

Required Vercel environment variable:

- `VITE_API_URL=https://<your-railway-domain>/api`

Build settings:

- Framework preset: `Vite`
- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

The file `frontend/vercel.json` already rewrites all routes to `index.html` so React Router works on refresh.

### Deployment Order

1. Push this codebase to GitHub.
2. Deploy `backend/` to Railway.
3. Copy the Railway public URL into:
   - Vercel `VITE_API_URL`
   - Railway `VERIFY_EMAIL_BASE_URL`
4. Deploy `frontend/` to Vercel.
5. Update Railway `CORS_ORIGINS` with your main Vercel domain.
6. Keep `CORS_ORIGIN_PATTERNS=https://*.vercel.app` if you want Vercel preview deployments to work without changing backend config.
