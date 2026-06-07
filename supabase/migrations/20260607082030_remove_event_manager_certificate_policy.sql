drop policy if exists "Event managers can manage certificates" on public.certificates;

-- Certificates are issued only through admin/server endpoints. Authenticated
-- users can still read their own certificates through the existing own-read
-- policy, and public verification goes through the service-backed API.
revoke insert, update, delete on public.certificates from authenticated;
grant select on public.certificates to authenticated;
