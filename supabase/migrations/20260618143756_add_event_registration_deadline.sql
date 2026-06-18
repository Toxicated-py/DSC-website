alter table public.events
  add column if not exists registration_deadline timestamp with time zone;
