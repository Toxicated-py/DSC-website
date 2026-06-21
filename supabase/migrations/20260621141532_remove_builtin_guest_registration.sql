drop index if exists public.event_registrations_guest_email_idx;

alter table public.event_registrations
  drop column if exists registration_kind,
  drop column if exists guest_name,
  drop column if exists guest_email,
  drop column if exists guest_phone,
  drop column if exists guest_institution,
  drop column if exists team_name,
  drop column if exists team_members;

alter table public.events
  drop column if exists registration_mode,
  drop column if exists team_min_size,
  drop column if exists team_max_size;
