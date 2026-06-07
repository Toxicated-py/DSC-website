alter table public.gallery_submissions
  add column if not exists event_id uuid references public.events(id) on delete set null;

create index if not exists gallery_submissions_event_id_idx
  on public.gallery_submissions(event_id);

create table if not exists public.gallery_likes (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.gallery_submissions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (gallery_id, user_id)
);

create index if not exists gallery_likes_gallery_id_idx
  on public.gallery_likes(gallery_id);

create index if not exists gallery_likes_user_id_idx
  on public.gallery_likes(user_id);

alter table public.gallery_likes enable row level security;

drop policy if exists "Users can read gallery likes" on public.gallery_likes;
create policy "Users can read gallery likes" on public.gallery_likes
  for select
  to authenticated
  using (true);

drop policy if exists "Users can like gallery items" on public.gallery_likes;
create policy "Users can like gallery items" on public.gallery_likes
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can unlike own gallery items" on public.gallery_likes;
create policy "Users can unlike own gallery items" on public.gallery_likes
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, delete on public.gallery_likes to authenticated;
