# Data Science Club Website

Official website for the Data Science Club at the School of Mathematical Sciences, Tribhuvan University.

The site supports club announcements, events, projects, blog posts, certificates, gallery pages, member areas, admin tools, and contact submissions. It uses a Vite/React frontend, a FastAPI backend, and Supabase for database, auth, and local development workflows.

## Tech Stack

- Frontend: React, Vite, TypeScript-style TSX, Tailwind utility classes
- Backend: FastAPI under `backend/`
- Database/Auth: Supabase
- Local tooling: Supabase CLI and Docker Desktop

## Frontend Setup

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` by default. During local development, Vite proxies `/api/*` and `/health` to the FastAPI backend.

## FastAPI Backend Setup

Install backend dependencies:

```bash
npm run api:install
```

Start the API:

```bash
npm run api:dev
```

The API runs at `http://127.0.0.1:8000`.

Useful endpoints:

- `GET /health`
- `GET /api/site-settings`
- `GET /api/home-summary`
- `GET /api/events`
- `GET /api/events/{event_id}`
- `GET /api/projects`
- `GET /api/blog-posts`
- `POST /api/contact-messages`
- `GET /api/certificates/verify/{code}`

## Local Supabase Development

Docker Desktop must be running before starting Supabase locally.

Start local Supabase:

```bash
npm run supabase:start
```

Copy `.env.local.supabase.example` to `.env.local`, then get the local anon/publishable key:

```bash
npm run supabase:status
```

Paste the printed local key into `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env.local`.

Apply all migrations to the local database:

```bash
npm run supabase:reset
```

Local Supabase Studio opens at `http://127.0.0.1:54323`.

## Supabase Sync Workflow

Migrations are the source of truth for database structure. Local Supabase is for development and testing; the hosted Supabase project is for production.

The hosted Supabase region migration from Seoul `ap-northeast-2` to Mumbai `ap-south-1` is tracked in [docs/SUPABASE_REGION_MIGRATION.md](docs/SUPABASE_REGION_MIGRATION.md). Do not commit secrets or private exported data while completing the remaining data, auth, storage, and hosting cutover steps.

Rebuild local Supabase from committed migrations:

```bash
npm run sync:local-reset
```

Bring hosted schema changes into local after dashboard edits:

```bash
npm run sync:pull-schema
```

Push tested local migrations to hosted Supabase:

```bash
npm run sync:push-schema
```

Optional public-table data copy for development:

```bash
npm run sync:dump-public-data
npm run sync:restore-public-data
```

The dump is written under `supabase/.temp`, which is ignored by git. Do not use real private user data for local testing.

## Production Deployment

Deploy the frontend and backend separately, with Supabase as the hosted database/auth provider.

Frontend environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_BASE_URL` or the configured API base URL used by the frontend host

Backend environment variables:

- `APP_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for server-only privileged operations
- `ADMIN_RPC_SECRET` for protected admin RPC calls, if enabled
- `ALLOWED_ORIGINS`, comma-separated, for production CORS origins

Example:

```bash
ALLOWED_ORIGINS=https://datasarathi.org.np,https://www.datasarathi.org.np
```

Never expose service role keys, admin secrets, `.env` files, or private user data in frontend code, logs, commits, screenshots, or public hosting settings.

## Quality Checks

Build the frontend:

```bash
npm run build
```

Check that the FastAPI app imports:

```bash
python -c "from backend.app.main import app; print(app.title)"
```
