create table if not exists public.gallery_comments (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.gallery_submissions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null check (char_length(trim(text)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists gallery_comments_gallery_id_idx
  on public.gallery_comments(gallery_id);

create index if not exists gallery_comments_user_id_idx
  on public.gallery_comments(user_id);

alter table public.gallery_comments enable row level security;

grant select on public.gallery_comments to anon;
grant select, insert, delete on public.gallery_comments to authenticated;
grant select, insert, update, delete on public.gallery_comments to service_role;

drop policy if exists "Public can read gallery comments" on public.gallery_comments;
create policy "Public can read gallery comments" on public.gallery_comments
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.gallery_submissions gallery
      where gallery.id = gallery_comments.gallery_id
        and gallery.status in ('approved', 'published')
    )
  );

drop policy if exists "Users can add gallery comments" on public.gallery_comments;
create policy "Users can add gallery comments" on public.gallery_comments
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own gallery comments" on public.gallery_comments;
create policy "Users can delete own gallery comments" on public.gallery_comments
  for delete
  to authenticated
  using ((select auth.uid()) = user_id or (select private.current_user_is_admin()));
