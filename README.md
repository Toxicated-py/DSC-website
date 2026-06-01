
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

  Use migrations as the sync source of truth:

  - Local testing: write migration SQL in `supabase/migrations`, then run
    `npm run supabase:reset`.
  - Push schema changes to the linked remote project:

    ```bash
    npm run supabase:link
    npm run supabase:push
    ```

  - If you changed the remote database directly in Supabase Dashboard, pull the
    remote schema back into a migration before continuing:

    ```bash
    npm run supabase:pull
    npm run supabase:reset
    ```

  Do not use production user data for local testing. Add safe sample rows to
  `supabase/seed.sql` instead.
  
