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

- `JWT_SECRET`
- `CORS_ORIGINS`

Database configuration, choose one:

- Preferred: link a Railway PostgreSQL service so Railway injects `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, and `PGPASSWORD`
- Or set `DATABASE_URL` manually

Do not set these local fallback variables on Railway unless you intentionally want to override the linked database:

- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USER`
- `DATABASE_PASSWORD`

If those are set to values like `localhost`, the backend will fail to boot on Railway with a refused database connection.

Recommended production values:

- `CORS_ORIGINS=https://<your-vercel-domain>`
- `CORS_ORIGIN_PATTERNS=https://*.vercel.app`
- `VERIFY_EMAIL_BASE_URL=https://<your-railway-domain>/api/auth/verify-email`

Recommended email configuration on Railway:

- `SMTP_FROM_EMAIL=<your verified sender email>`
- `SMTP_FROM_NAME=StockDesk`
- `BREVO_API_KEY=<your Brevo API key>`

If `BREVO_API_KEY` is present, the backend sends verification emails through Brevo's HTTP API instead of SMTP. This is recommended on Railway if SMTP connections time out.

Optional for temporary hosting with existing profiles only:

- `VERIFY_EMAIL_BASE_URL`
- all `SMTP_*` variables

Optional for platform management:

- `SUPERADMIN_NAME`
- `SUPERADMIN_USERNAME`
- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`

If the frontend is deployed with `VITE_ENABLE_SIGNUP=false`, existing users can sign in without SMTP being configured.

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
- `VITE_ENABLE_SIGNUP=false`

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

### Super Admin

If you want platform-wide access to all registered shops, set these Railway environment variables and redeploy the backend:

- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`
- optional `SUPERADMIN_NAME`
- optional `SUPERADMIN_USERNAME`

On boot, StockDesk will create or normalize that account as a `SuperAdmin`. Super admins are not attached to a specific shop and can access the platform-wide shops screen.
