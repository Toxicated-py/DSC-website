alter table public.profiles
  add column if not exists profile_links jsonb not null default '[]'::jsonb;

notify pgrst, 'reload schema';
