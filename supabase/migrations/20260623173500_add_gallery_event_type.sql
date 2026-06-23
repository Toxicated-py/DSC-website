alter table public.gallery_submissions
  add column if not exists event_type text not null default 'social';
