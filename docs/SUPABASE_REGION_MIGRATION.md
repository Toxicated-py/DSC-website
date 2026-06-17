# Supabase Region Migration: Seoul to Mumbai

This document tracks the DSC website migration from the original Supabase project in `ap-northeast-2` / Seoul to a new project in South Asia Mumbai / `ap-south-1`.

Do not delete or pause the old Seoul project until the Mumbai project is fully tested in production-like hosting and the team has a rollback path.

## Migration Status

- Old Seoul project ref: `oiqsxwzlgdfyselcpnco`
- New Mumbai project ref: `tpfyvmezktigmtyzixez`
- New Mumbai project URL: `https://tpfyvmezktigmtyzixez.supabase.co`
- Mumbai project status: created and healthy.
- Schema status: all committed migrations have been applied to the Mumbai project.
- Safe seed/default data status: default rows from migrations are present, including `designation_options` and `site_settings`.
- Production data status: not migrated yet.
- Auth user status: not migrated yet.
- Storage file status: buckets exist, but files have not been copied yet.

The Supabase CLI could not be linked from this workstation without an access token or database password, so the schema was applied through the Supabase management connector. Future local CLI work can use:

```bash
npx supabase login
npm run supabase:link
```

## Current Supabase Inventory

### Project refs and scripts

- `package.json`
  - `supabase:start`, `supabase:stop`, `supabase:status`, `supabase:reset`
  - `supabase:link` links to the Mumbai project ref: `tpfyvmezktigmtyzixez`
  - `supabase:pull`, `supabase:push`
  - `sync:*` scripts call `scripts/supabase-sync.ps1`
- `scripts/supabase-sync.ps1`
  - Uses the Mumbai project ref in `pull-schema`, `push-schema`, and `dump-public-data`
  - Dumps public schema data to `supabase/.temp/remote-public-data.sql`
  - Has confirmation prompts for pushing schema and copying public data

### Environment examples

- `.env.example`
  - Frontend variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- `.env.api.example`
  - Backend variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`
  - Optional backend-only `SUPABASE_SERVICE_ROLE_KEY`
- `.env.local.supabase.example`
  - Local Supabase URL and local anon/publishable key placeholder
- `.env.remote.supabase.example`
  - Points at the Mumbai project URL
  - Keeps key values as placeholders

Never commit real `.env`, `.env.local`, `.env.api`, service role keys, database passwords, JWT secrets, or exported private user data.

### Frontend Supabase client

- `src/lib/supabase.ts`
  - Reads `VITE_SUPABASE_URL`
  - Reads `VITE_SUPABASE_PUBLISHABLE_KEY`, with fallback to `VITE_SUPABASE_ANON_KEY`
  - Creates the browser Supabase client with `@supabase/supabase-js`
- `src/lib/apiClient.ts`
  - Reads the current Supabase session and forwards bearer tokens to FastAPI for protected requests

### Backend Supabase config and client

- `backend/app/config.py`
  - Reads `.env`, `.env.local`, `.env.api`
  - Reads `SUPABASE_URL` or `VITE_SUPABASE_URL`
  - Reads `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_ANON_KEY`, or frontend key fallbacks
  - Reads backend-only `SUPABASE_SERVICE_ROLE_KEY`
  - Reads `ADMIN_RPC_SECRET`
  - Reads comma-separated `ALLOWED_ORIGINS`
- `backend/app/supabase_rest.py`
  - Calls Supabase REST endpoints under `/rest/v1`
  - Uses publishable/anon key for normal REST calls
  - Uses service role key only when `use_service_role=True`
- `backend/app/auth.py`
  - Calls `/auth/v1/user` to verify bearer tokens
- `backend/app/main.py`
  - Uses Supabase for public content, authenticated member actions, admin actions, contact messages, tickets, certificates, and audit logs

### Auth-related frontend code

- `src/app/AuthAndAdmin.tsx`
  - Email/password signup and login
  - Google OAuth login
  - Auth session redirect handling
- `src/app/auth/ProtectedRoute.tsx`
  - Requires an authenticated Supabase user
- `src/app/auth/AdminRoute.tsx`
  - Reads `profiles.role` and `profiles.roles` to allow admin, president, or organizer access
- `src/app/layout/Nav.tsx`
  - Reads Supabase session and profile data for nav state and logout
- Other pages call `supabase.auth.getUser()` for profile-specific flows.

### Storage-related code

- `src/services/certificateService.ts`
  - Uploads signature images to the `signatures` bucket
  - Uploads certificate template images to the `certificate-templates` bucket
  - Uses public URLs returned by Supabase Storage
- Storage buckets and policies are created in migrations:
  - `supabase/migrations/20260531100000_full_certificate_system.sql`
  - `supabase/migrations/20260602123000_add_certificate_template_storage.sql`
  - `supabase/migrations/20260606100000_release_security_hardening.sql`

### Database migrations and seed

- `supabase/migrations/`
  - Source of truth for schema, RLS policies, grants, functions, views, storage buckets, and storage policies
  - Includes contact-message policy fixes and release security hardening
- `supabase/schema.sql`
  - Snapshot/reference schema
- `supabase/seed.sql`
  - Currently safe local-only seed comments, with no production data
- `supabase/config.toml`
  - Local Supabase config
  - Local database major version is `17`
  - Storage is enabled
  - Auth is enabled
  - Public API schemas are `public` and `graphql_public`

### Public tables and important data domains

The app uses these public tables through migrations and backend/admin flows:

- `profiles`
- `designation_options`
- `membership_applications`
- `events`
- `event_proposals`
- `event_registrations`
- `event_staff`
- `projects`
- `blog_posts`
- `certificates`
- `gallery_submissions`
- `gallery_likes`
- `partner_submissions`
- `learning_materials`
- `site_settings`
- `contact_messages`
- `audit_logs`

## Migration Checklist

### 1. Prepare and freeze risky changes

- Confirm there are no unmerged schema changes in Supabase Dashboard.
- Merge or pause app changes that alter auth, database schema, storage, or environment handling.
- Decide whether there will be a maintenance window.
- Export a backup of the old Seoul project before making any changes.
- Record current production environment variables without pasting secrets into the repo.
- Keep the old Seoul project active until the Mumbai project is tested and the DNS/hosting switch is complete.

### 2. Create the new Mumbai project

- Created a new Supabase project in South Asia Mumbai / `ap-south-1`.
- New project ref: `tpfyvmezktigmtyzixez`.
- Save the new API URL, publishable key, service role key, database password, and connection strings in a secure password manager or hosting secret store.
- Match important dashboard settings from the Seoul project:
  - Auth providers
  - Email confirmation settings
  - Redirect URLs
  - Site URL
  - SMTP settings, if used
  - Password/security settings
  - Storage settings
  - API exposed schemas/settings

### 3. Link CLI to the Mumbai project

After the new project ref is known, link locally with:

```bash
npx supabase link --project-ref tpfyvmezktigmtyzixez
```

The repo now points non-secret Supabase CLI references at the Mumbai project:

- `package.json`
- `scripts/supabase-sync.ps1`
- `.env.remote.supabase.example`

### 4. Apply schema migrations

Apply committed migrations to the Mumbai project:

```bash
npx supabase db push
```

Then verify:

```bash
npx supabase migration list --linked
```

Important: recent Supabase projects may not expose newly created public tables to the Data API automatically. Confirm that grants from migrations are sufficient for `anon`, `authenticated`, and `service_role` access. RLS still controls rows; grants control whether the Data API can reach the table at all.

Applied migrations in Mumbai:

- `20260527093000_add_site_settings`
- `20260527094500_prevent_duplicate_event_certificates`
- `20260528090000_coursera_style_certificates`
- `20260531100000_full_certificate_system`
- `20260531234000_certificate_event_manager_policies`
- `20260531235000_drop_legacy_certificate_recipient_not_null`
- `20260531235500_drop_legacy_certificate_not_nulls`
- `20260601090000_fix_site_settings_policies`
- `20260601093000_add_contact_messages`
- `20260602120000_add_certificate_template_data`
- `20260602123000_add_certificate_template_storage`
- `20260602130000_add_profile_links`
- `20260602133000_add_audit_logs`
- `20260602180000_allow_users_insert_own_profile`
- `20260603090000_fix_admin_role_helpers`
- `20260603091000_add_admin_list_profiles_rpc`
- `20260606100000_release_security_hardening`
- `20260607081325_add_gallery_likes_and_event_links`
- `20260607082030_remove_event_manager_certificate_policy`
- `20260607083417_restore_public_contact_insert`
- `20260607092644_remote_schema`
- `20260607201336_fix_contact_message_public_insert`
- `20260607201619_fix_contact_message_public_role_policy`
- `20260607201819_fix_contact_message_email_policy_regex`
- `20260607202012_fix_contact_message_explicit_anon_policy`
- `20260617153612_cleanup_contact_message_legacy_policy`

### 5. Verify schema, policies, and functions

- Confirm all expected public tables exist.
- Confirm RLS is enabled on exposed public tables.
- Confirm policies exist for:
  - Public event/project/blog/gallery reads
  - User-owned profiles, applications, registrations, certificates, and submissions
  - Admin/organizer operations
  - Contact message insert
- Confirm private helper functions and public RPCs exist:
  - `private.current_user_role`
  - `private.current_user_is_admin`
  - `private.current_user_is_admin_or_organizer`
  - `private.current_user_can_manage_event`
  - `public.admin_list_profiles`
- Confirm grants on views/functions, especially:
  - `public.public_certificates`
  - `public.admin_list_profiles`

Verified in Mumbai:

- Expected public tables exist.
- RLS is enabled on app tables.
- Storage buckets exist: `signatures`, `certificate-templates`.
- Contact message insert policy exists for `anon` and `authenticated`.
- Public content tables are empty until production data is copied.

Supabase advisors currently report:

- Security: `public.public_certificates` is flagged as a security-definer view. Review before launch: https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view
- Performance: existing RLS policies and indexes have optimization warnings, including auth function init-plan warnings, multiple permissive policies, duplicate certificate verification-code indexes, and unused indexes. These are follow-up schema hardening tasks, not blockers for creating the Mumbai project.

### 6. Copy safe seed data only

The committed `supabase/seed.sql` does not contain production data. Prefer adding or importing only safe public defaults first:

- `site_settings`
- `designation_options`
- Public `learning_materials`, if safe
- Public `events`, `projects`, `blog_posts`, `gallery_submissions`, and `partner_submissions`, if the team wants them preserved

Do not copy private user data into local files. If exporting data, write exports under `supabase/.temp/`, which is gitignored.

### 7. Migrate public tables if needed

If production content must move from Seoul to Mumbai:

- Export only required public-table data from the old project.
- Review the export before import.
- Remove private or unnecessary rows from the transfer set.
- Import into Mumbai in dependency order, for example:
  - `profiles` only if auth users are also migrated and IDs are preserved
  - `designation_options`
  - `site_settings`
  - `events`
  - `event_staff`
  - `event_registrations`
  - `projects`
  - `blog_posts`
  - `certificates`
  - `gallery_submissions`
  - `gallery_likes`
  - `partner_submissions`
  - `learning_materials`
  - `membership_applications`
  - `event_proposals`
  - `contact_messages`, only if there is a real operational reason
  - `audit_logs`, usually optional

Be careful with foreign keys to `auth.users`. Rows that reference user IDs require matching users in the new project.

### 8. Handle auth users carefully

Auth users are sensitive. Do not export auth data into the repo.

Choose one approach:

- Clean launch: do not migrate existing auth users; ask members/admins to create accounts again.
- Controlled migration: use Supabase-supported auth export/import or admin APIs, preserving user IDs where application rows depend on them.

Before switching production:

- Configure email templates and SMTP, if used.
- Configure Google OAuth credentials and callback URLs for the new project.
- Add production redirect URLs for the frontend domain.
- Recreate admin/president/organizer roles in `profiles`.
- Test email/password signup, email confirmation, login, logout, and Google login.

### 9. Handle storage buckets and files

Migrations create these buckets:

- `signatures`
- `certificate-templates`

For each bucket:

- Confirm the bucket exists in Mumbai after migrations.
- Confirm bucket privacy/public settings match the intended release state.
- Confirm upload/read/update/delete policies match the migration expectations.
- Copy only required files from the old project.
- Preserve object paths if database rows store public URLs or paths.
- After copying, test uploading a new signature and a new certificate template from the admin UI.

### 10. Update frontend environment variables

In the frontend hosting provider, update:

```bash
VITE_SUPABASE_URL=https://NEW_MUMBAI_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=NEW_MUMBAI_PUBLISHABLE_KEY
VITE_BASE_URL=https://your-production-domain
```

Do not expose service role keys in frontend variables.

### 11. Update backend environment variables

In the backend hosting provider, update:

```bash
APP_ENV=production
SUPABASE_URL=https://NEW_MUMBAI_PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=NEW_MUMBAI_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=NEW_MUMBAI_SERVICE_ROLE_KEY
ADMIN_RPC_SECRET=YOUR_ADMIN_RPC_SECRET
ALLOWED_ORIGINS=https://datasarathi.org.np,https://www.datasarathi.org.np
```

Keep `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_RPC_SECRET` server-only.

### 12. Update repo references after validation

Non-secret repo references now point at the Mumbai project:

- `package.json` `supabase:link`
- `scripts/supabase-sync.ps1`
- `.env.remote.supabase.example`

### 13. Build and test

Run:

```bash
npm run build
python -c "from backend.app.main import app; print(app.title)"
```

Smoke test:

- Homepage loads public content.
- Login works.
- Signup works.
- Google OAuth works, if enabled.
- Event list and public event detail pages work for normal users.
- Event registration works for authenticated users.
- Event proposal submission works.
- Project submission works.
- Blog read/write flows work.
- Admin panel loads for admin/president/organizer.
- Admin can manage events, projects, blog posts, users, certificates, gallery, partners, resources, and contact messages.
- Certificate verification works publicly.
- Signature upload works.
- Certificate template upload works.
- Contact form sends successfully.
- Existing public content displays correctly.

### 14. Cutover and rollback

- Deploy backend with Mumbai environment variables.
- Deploy frontend with Mumbai environment variables.
- Test production domain.
- Monitor backend logs, Supabase API logs, auth logs, and contact submissions.
- Keep the old Seoul project running during the observation window.
- If critical issues appear, roll frontend/backend env vars back to the Seoul project and redeploy.
- Delete or pause the old project only after the team confirms that Mumbai is stable and all required data has been moved.

## Notes From Supabase Changelog Review

- Newer Supabase projects may require explicit grants/Data API exposure for public schema tables. This repo has several grants in migrations, but Mumbai should still be verified after `db push`.
- Avoid putting `service_role` keys or database passwords into frontend code, docs, commits, screenshots, or issue comments.
- Storage policies need explicit upload and read/update/delete coverage. This matters for signature and certificate-template workflows.
