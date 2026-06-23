alter table public.gallery_submissions
  add column if not exists tags text[] not null default '{}';
