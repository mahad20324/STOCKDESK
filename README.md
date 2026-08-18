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

## Notes

- The app stores shop settings and currency in the `settings` table.
- Sales create receipts and update product stock.
- Admin users can manage users, products, and system settings.
- See `docs/sunmi-pos-local-printing.md` for handheld POS rollout and local printer bridge guidance.

## API Endpoints

### Authentication (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new shop |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/verify-email` | Verify email with token |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/refresh` | Refresh JWT token |

### Products (authenticated)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | All | List products |
| GET | `/api/products/low-stock` | All | Low stock alerts |
| GET | `/api/products/:id` | All | Get product details |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| POST | `/api/products/:id/restock` | Admin | Restock product |
| GET | `/api/products/:id/stock-history` | All | View stock history |
| POST | `/api/products/restock-category` | Admin | Bulk restock category |

### Sales (authenticated)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/sales` | All | List sales |
| GET | `/api/sales/:id` | All | Get sale details |
| GET | `/api/sales/:id/receipt` | All | Get receipt |
| POST | `/api/sales` | All | Create sale |
| POST | `/api/sales/:id/return` | Admin | Process return |
| GET | `/api/sales/returns` | Admin | List returns |
| GET | `/api/sales/day-closures` | Admin | Day closures |
| POST | `/api/sales/close-day` | Admin | Close business day |

### Customers (authenticated)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/customers` | All | List customers |
| GET | `/api/customers/:id` | All | Get customer |
| POST | `/api/customers` | Admin, Staff | Create customer |
| PUT | `/api/customers/:id` | Admin, Staff | Update customer |
| DELETE | `/api/customers/:id` | Admin | Delete customer |

### Users (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| GET | `/api/users/:id` | Get user |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| POST | `/api/users/:id/reset-password` | Reset user password |

### Expenses (authenticated)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/expenses` | All | List expenses |
| POST | `/api/expenses` | Admin | Create expense |
| PUT | `/api/expenses/:id` | Admin | Update expense |
| DELETE | `/api/expenses/:id` | Admin | Delete expense |

### Reports (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/summary` | Sales summary |
| GET | `/api/reports/daily` | Daily report |
| GET | `/api/reports/monthly` | Monthly report |
| GET | `/api/reports/best-selling` | Best selling products |
| GET | `/api/reports/by-cashier` | Sales by cashier |
| GET | `/api/reports/range` | Date range report |
| GET | `/api/reports/customer/:customerId` | Customer history |

### Settings, Profile & Shop (authenticated)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/settings` | All | Get shop settings |
| PUT | `/api/settings` | Admin | Update settings |
| GET | `/api/profile` | Admin, SuperAdmin | Get profile |
| PUT | `/api/profile` | Admin, SuperAdmin | Update profile |
| POST | `/api/profile/change-password` | Admin, SuperAdmin | Change password |
| GET | `/api/shops/me` | All | Get my shop |
| PUT | `/api/shops/me` | Admin | Update my shop |

### Platform Admin (SuperAdmin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/overview` | Platform overview |
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/shops/:id` | Shop details |
| DELETE | `/api/admin/shops/:id` | Delete shop |

### Stock Reconciliation (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stock-reconciliation/products` | Products for reconciliation |
| GET | `/api/stock-reconciliation/history` | Reconciliation history |
| GET | `/api/stock-reconciliation/summary` | Reconciliation summary |
| POST | `/api/stock-reconciliation/create` | Create reconciliation |

### Audit Logs (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit/logs` | Audit log entries |
| GET | `/api/audit/users` | User activity |
| GET | `/api/audit/stats` | Audit statistics |

### Printer (authenticated)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/printer/configure` | Admin | Configure printer |
| GET | `/api/printer/status` | All | Printer status |
| POST | `/api/printer/test` | Admin | Test print |
| POST | `/api/printer/print-receipt` | All | Print receipt |
| POST | `/api/printer/disconnect` | Admin | Disconnect printer |
| POST | `/api/printer/send-whatsapp` | All | Send receipt via WhatsApp |

## Testing

```bash
# Backend tests
cd backend
npm test

# With coverage
npm run test:coverage

# Lint
npm run lint
```

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

### WhatsApp receipts (Twilio + S3)

This project supports sending receipts over WhatsApp using Twilio (server global credentials) and storing generated PDFs on S3 (or any public URL).

Required environment variables (backend):

- `TWILIO_ACCOUNT_SID` — Twilio Account SID
- `TWILIO_AUTH_TOKEN` — Twilio Auth Token
- `TWILIO_WHATSAPP_NUMBER` — Twilio-provisioned WhatsApp sender (e.g. whatsapp:+1415xxxxxxx)
- `S3_BUCKET` — S3 bucket name for hosted PDFs (or set `MEDIA_BASE_URL` to a public host)
- `S3_REGION` — S3 region (required if `S3_BUCKET` set)
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — AWS credentials for S3
- Optional: `MEDIA_BASE_URL` — public base URL to use instead of S3-generated URL

Quick setup steps:

1. Create a Twilio account and enable the WhatsApp sandbox or request WhatsApp access. Copy `Account SID`, `Auth Token`, and the WhatsApp-enabled Twilio number.
2. Create an S3 bucket, make objects public (or use a presigned URL flow), and note `S3_BUCKET` and `S3_REGION`. Set AWS credentials in the environment.
3. Install backend deps and run the DB migration to add WhatsApp columns:

```bash
cd backend
npm install
node scripts/add-whatsapp-columns.js
```

4. Start the backend and frontend. In the app Settings (Admin), save the shop WhatsApp sender number and click "Verify & Enable" to send a test message to the configured shop phone.
5. From the POS receipt, click "Send via WhatsApp" and enter the customer's phone number.

Notes:
- The migration script uses `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` and is safe to run multiple times. For production, prefer a proper migration tool.
- Messages sent to customers may require WhatsApp template approval depending on your Twilio/Meta configuration.
- Monitor Twilio usage and message costs.

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

- `EMAIL_PROVIDER=resend`
- `RESEND_API_KEY=<your Resend API key>`
- `RESEND_FROM_EMAIL=<your verified Resend sender email>`
- `RESEND_FROM_NAME=StockDesk`

If `EMAIL_PROVIDER=resend` is set, the backend sends verification and password reset emails through Resend's HTTP API. Use a verified Resend sender/domain for `RESEND_FROM_EMAIL`; `onboarding@resend.dev` is only suitable for limited testing.

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
