# Data Science Club Website

Official website for the Data Science Club at the School of Mathematical Sciences, Tribhuvan University.

The site supports club announcements, events, projects, blog posts, certificates, gallery pages, member areas, admin tools, and contact submissions. It uses a Vite/React frontend, a FastAPI backend, and the hosted Supabase project for database and auth.

## Tech Stack

- Frontend: React, Vite, TypeScript-style TSX, Tailwind utility classes
- Backend: FastAPI under `backend/`
- Database/Auth: hosted Supabase
- Database tooling: Supabase CLI for linking, migrations, pull, and push

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

The API runs at `http://127.0.0.1:8001`.

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

## Supabase Workflow

This project is configured for the hosted Mumbai Supabase project. Local/offline Supabase Docker workflows are not part of the supported launch setup.

Copy `.env.example` values into your own `.env.local` and `.env.api`, then set the hosted Supabase URL and keys. Never commit real `.env` files.

Useful hosted-project commands:

```bash
npm run supabase:link
npm run supabase:migrations
```

Migrations under `supabase/migrations` remain the source of truth for the hosted database structure. Apply production schema changes intentionally through the linked hosted project; do not start or reset a local Supabase database for this site.

## Production Deployment

Deploy the frontend and backend separately, with Supabase as the hosted database/auth provider.

Frontend environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BASE_URL` or the configured API base URL used by the frontend host

Backend environment variables:

- `APP_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for server-only privileged operations
- `ADMIN_RPC_SECRET` for protected admin RPC calls, if enabled
- `ALLOWED_ORIGINS`, comma-separated, for production CORS origins

Example:

```bash
ALLOWED_ORIGINS=https://dscsms.com,https://www.dscsms.com
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
