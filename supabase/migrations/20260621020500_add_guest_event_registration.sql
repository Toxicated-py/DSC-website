alter table public.events
  add column if not exists registration_mode text not null default 'individual',
  add column if not exists team_min_size integer not null default 1,
  add column if not exists team_max_size integer not null default 1;

alter table public.event_registrations
  alter column user_id drop not null,
  add column if not exists registration_kind text not null default 'individual',
  add column if not exists guest_name text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text,
  add column if not exists guest_institution text,
  add column if not exists team_name text,
  add column if not exists team_members jsonb not null default '[]'::jsonb;

create index if not exists event_registrations_guest_email_idx
  on public.event_registrations(event_id, guest_email)
  where guest_email is not null;
