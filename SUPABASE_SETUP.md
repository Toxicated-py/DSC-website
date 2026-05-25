# Supabase Setup

## 1. Create Project

Create a Supabase project at https://supabase.com.

## 2. Add Database Schema

Open Supabase SQL Editor and run:

```sql
-- paste the contents of supabase/schema.sql here
```

The schema creates:

- profiles
- membership_applications
- events
- event_proposals
- event_registrations
- projects
- blog_posts

## 3. Add Environment Variables

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Fill in:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Find these in Supabase:

Project Settings -> API -> Project URL and publishable key.

## 4. Restart Dev Server

```powershell
& 'C:\Program Files\nodejs\node.exe' .\node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173
```

## Current Connected Forms

These forms now save to Supabase when env keys are configured:

- `/events/propose` -> `event_proposals`
- `/projects/submit` -> `projects`
- `/blog/write` -> `blog_posts`

Without Supabase keys, they fall back to local browser storage for development.
