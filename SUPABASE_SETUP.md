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
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase:

Project Settings -> API -> Project URL and anon key.

## 4. Restart Dev Server

```bash
npm run dev
```

## Current Connected Forms

These forms now save to Supabase when env keys are configured:

- `/events/propose` -> `event_proposals`
- `/projects/submit` -> `projects`
- `/blog/write` -> `blog_posts`

Without Supabase keys, authenticated submissions are disabled. Do not store student data in browser localStorage as a fallback.
