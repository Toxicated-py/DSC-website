alter table public.certificates
  add column if not exists verification_code text,
  add column if not exists recipient_name_snapshot text,
  add column if not exists event_title_snapshot text,
  add column if not exists template_style text not null default 'event',
  add column if not exists revoked_at timestamptz;

update public.certificates
set verification_code = upper(substr(encode(gen_random_bytes(9), 'hex'), 1, 12))
where verification_code is null;

update public.certificates c
set recipient_name_snapshot = coalesce(nullif(p.full_name, ''), p.email, c.recipient_name_snapshot)
from public.profiles p
where c.recipient_id = p.id
  and c.recipient_name_snapshot is null;

update public.certificates c
set event_title_snapshot = coalesce(e.title, c.event_title_snapshot)
from public.events e
where c.event_id = e.id
  and c.event_title_snapshot is null;

create unique index if not exists certificates_verification_code_key
  on public.certificates(verification_code)
  where verification_code is not null;

drop policy if exists "Public can verify active certificates" on public.certificates;
create policy "Public can verify active certificates" on public.certificates
  for select using (verification_code is not null and revoked_at is null and status in ('approved', 'published'));
