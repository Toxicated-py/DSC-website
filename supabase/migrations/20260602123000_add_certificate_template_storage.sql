insert into storage.buckets (id, name, public)
values ('certificate-templates', 'certificate-templates', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Admins can upload certificate templates" on storage.objects;
create policy "Admins can upload certificate templates" on storage.objects
  for insert
  with check (
    bucket_id = 'certificate-templates'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or 'admin' = any(coalesce(p.roles, array[]::text[]))
          or 'president' = any(coalesce(p.roles, array[]::text[]))
        )
    )
  );

drop policy if exists "Admins can update certificate templates" on storage.objects;
create policy "Admins can update certificate templates" on storage.objects
  for update
  using (
    bucket_id = 'certificate-templates'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or 'admin' = any(coalesce(p.roles, array[]::text[]))
          or 'president' = any(coalesce(p.roles, array[]::text[]))
        )
    )
  )
  with check (
    bucket_id = 'certificate-templates'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or 'admin' = any(coalesce(p.roles, array[]::text[]))
          or 'president' = any(coalesce(p.roles, array[]::text[]))
        )
    )
  );

drop policy if exists "Admins can delete certificate templates" on storage.objects;
create policy "Admins can delete certificate templates" on storage.objects
  for delete
  using (
    bucket_id = 'certificate-templates'
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and (
          p.role = 'admin'
          or 'admin' = any(coalesce(p.roles, array[]::text[]))
          or 'president' = any(coalesce(p.roles, array[]::text[]))
        )
    )
  );

drop policy if exists "Public can read certificate templates" on storage.objects;
create policy "Public can read certificate templates" on storage.objects
  for select
  using (bucket_id = 'certificate-templates');

notify pgrst, 'reload schema';
