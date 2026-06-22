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
npm run supabase:pull
npm run supabase:push
```

Migrations under `supabase/migrations` remain the source of truth for database structure.

## Google Login

Google login is handled through Supabase Auth. The frontend uses the existing Supabase client, so no Google client secret belongs in this repository.

Supabase dashboard:

1. Open `Authentication` -> `Providers` -> `Google`.
2. Enable Google.
3. Add the Google OAuth Client ID and Client Secret from Google Cloud Console.
4. Save.

Google Cloud Console:

1. Create an OAuth Client ID with application type `Web application`.
2. Add local JavaScript origins:

```text
http://localhost:5173
http://127.0.0.1:5173
```

3. Add production JavaScript origins when the domain is final:

```text
https://datasarathi.org.np
https://www.datasarathi.org.np
```

4. Add the Supabase callback URL:

```text
https://<your-project-ref>.supabase.co/auth/v1/callback
```

For the current Mumbai project, replace `<your-project-ref>` with the project ref from the Supabase dashboard.

Supabase URL configuration:

1. Set `Site URL` to the deployed frontend URL.
2. Add redirect URLs:

```text
http://localhost:5173/**
http://127.0.0.1:5173/**
https://datasarathi.org.np/**
https://www.datasarathi.org.np/**
```

After setup, test `/login`, click `Sign In with Google`, and confirm the app returns to `/dashboard` or the original protected route.

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
