create or replace function private.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public, private
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role::text in ('admin', 'president')
        or 'admin' = any(coalesce(p.roles, '{}'::text[]))
        or 'president' = any(coalesce(p.roles, '{}'::text[]))
      )
  )
$$;

grant execute on function private.current_user_is_admin() to authenticated;

create or replace function private.current_user_is_admin_or_organizer()
returns boolean
language sql
security definer
set search_path = public, private
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role::text in ('admin', 'president', 'organizer')
        or 'admin' = any(coalesce(p.roles, '{}'::text[]))
        or 'president' = any(coalesce(p.roles, '{}'::text[]))
        or 'organizer' = any(coalesce(p.roles, '{}'::text[]))
      )
  )
$$;

grant execute on function private.current_user_is_admin_or_organizer() to authenticated;
