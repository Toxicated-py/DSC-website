
  # DSC

  This is a code bundle for DSC. The original project is available at https://www.figma.com/design/9Cf6TxC4BTcBmXIy1RnmN8/DSC.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Local Supabase development

  This project can run against a local Supabase database for offline-safe
  development and testing. You need Docker Desktop running before starting
  Supabase locally.

  1. Start local Supabase:

     ```bash
     npm run supabase:start
     ```

  2. Copy `.env.local.supabase.example` to `.env.local`.

  3. Get the local anon key:

     ```bash
     npm run supabase:status
     ```

     Paste the printed anon key into `VITE_SUPABASE_PUBLISHABLE_KEY` in
     `.env.local`.

  4. Apply all migrations to your local database:

     ```bash
     npm run supabase:reset
     ```

  5. Start the Vite app:

     ```bash
     npm run dev
     ```

  Local Supabase Studio opens at `http://127.0.0.1:54323`.

  ## Syncing local and remote Supabase

  Migrations are the source of truth for database structure. Local Docker
  Supabase is for development and testing; the hosted Supabase project is for
  production.

  ### Everyday offline/local work

  Rebuild your local database from committed migrations:

  ```bash
  npm run sync:local-reset
  npm run dev
  ```

  ### Bring hosted schema changes into local

  Use this after changing tables, views, policies, or functions in the Supabase
  Dashboard:

  ```bash
  npm run sync:pull-schema
  ```

  This creates a new migration from the hosted schema and then rebuilds local
  Supabase with it.

  ### Push local schema changes to hosted Supabase

  Use this only when your local migrations are tested and ready:

  ```bash
  npm run sync:push-schema
  ```

  This applies migration files to the hosted project. It does not upload local
  rows or test users.

  ### Optional public data copy for development

  Prefer adding fake rows to `supabase/seed.sql`. If you need a one-time copy of
  hosted public-table data for testing:

  ```bash
  npm run sync:dump-public-data
  npm run sync:restore-public-data
  ```

  The dump is written under `supabase/.temp`, which is ignored by git. Do not
  use real private user data for local testing.
  
