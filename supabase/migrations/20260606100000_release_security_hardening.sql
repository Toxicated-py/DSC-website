drop policy if exists "Public can verify certificates" on public.certificates;

revoke all on public.certificates from anon;
revoke all on public.public_certificates from anon, authenticated;
grant select on public.public_certificates to service_role;

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Public can submit valid contact messages" on public.contact_messages
  for insert
  with check (
    length(trim(name)) between 2 and 120
    and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    and length(trim(subject)) between 2 and 180
    and length(trim(message)) between 5 and 5000
  );

drop policy if exists "Public can read certificate templates" on storage.objects;
drop policy if exists "Public can read signatures" on storage.objects;

revoke all on function public.admin_list_profiles(text) from anon, authenticated, public;
grant execute on function public.admin_list_profiles(text) to service_role;
