alter table public.certificates
  add column if not exists template_data jsonb not null default '{}'::jsonb;

drop view if exists public.public_certificates;
create view public.public_certificates
with (security_invoker = true)
as
select
  id,
  certificate_title,
  certificate_type,
  template,
  description,
  issuer_name,
  issued_date,
  signature_data,
  template_data,
  verification_code,
  event_title_snapshot,
  recipient_name_snapshot,
  status,
  created_at
from public.certificates
where verification_code is not null;

grant select on public.public_certificates to anon, authenticated;

notify pgrst, 'reload schema';
