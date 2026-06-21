alter table public.events
  add column if not exists google_form_url text;
