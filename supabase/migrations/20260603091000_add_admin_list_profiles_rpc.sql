create extension if not exists pgcrypto with schema extensions;

drop function if exists public.admin_list_profiles();

create or replace function public.admin_list_profiles(request_secret text)
returns setof public.profiles
language sql
security definer
set search_path = public, private, extensions
stable
as $$
  select p.*
  from public.profiles p
  where encode(extensions.digest(coalesce(request_secret, ''), 'sha256'), 'hex')
    = '8efb68e538f5c3509fabd856a8ce490b23657645b2684f625f898676a2733682'
  order by p.created_at desc nulls last
$$;

revoke all on function public.admin_list_profiles(text) from public, anon;
grant execute on function public.admin_list_profiles(text) to authenticated;
