create extension if not exists pgcrypto;

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  certificate_title text,
  certificate_type text,
  template text,
  description text,
  issuer_name text,
  issued_date date,
  external_pdf_url text,
  signature_data jsonb not null default '[]'::jsonb,
  verification_code text unique,
  event_title_snapshot text,
  recipient_name_snapshot text,
  status text not null default 'valid',
  created_at timestamptz not null default now()
);

alter table public.certificates
  add column if not exists member_id uuid references public.profiles(id) on delete cascade,
  add column if not exists event_id uuid references public.events(id) on delete set null,
  add column if not exists certificate_title text,
  add column if not exists certificate_type text,
  add column if not exists template text,
  add column if not exists description text,
  add column if not exists issuer_name text,
  add column if not exists issued_date date,
  add column if not exists external_pdf_url text,
  add column if not exists signature_data jsonb not null default '[]'::jsonb,
  add column if not exists verification_code text unique,
  add column if not exists event_title_snapshot text,
  add column if not exists recipient_name_snapshot text,
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'certificates'
      and column_name = 'recipient_id'
  ) then
    update public.certificates
    set member_id = coalesce(member_id, recipient_id)
    where member_id is null;

    alter table public.certificates
      alter column recipient_id drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'certificates' and column_name = 'title'
  ) then
    update public.certificates set certificate_title = coalesce(certificate_title, title)
    where certificate_title is null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'certificates' and column_name = 'template_style'
  ) then
    update public.certificates set template = coalesce(template, template_style)
    where template is null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'certificates' and column_name = 'certificate_url'
  ) then
    update public.certificates set external_pdf_url = coalesce(external_pdf_url, certificate_url)
    where external_pdf_url is null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'certificates' and column_name = 'issued_at'
  ) then
    update public.certificates set issued_date = coalesce(issued_date, issued_at)
    where issued_date is null;
  end if;
end $$;

update public.certificates
set
  certificate_title = coalesce(certificate_title, 'Certificate'),
  certificate_type = coalesce(certificate_type, 'Participation'),
  template = coalesce(template, 'modern'),
  issuer_name = coalesce(issuer_name, 'Data Science Club'),
  description = coalesce(description, 'For actively participating in this program and demonstrating commitment and enthusiasm.'),
  issued_date = coalesce(issued_date, created_at::date);

alter table public.certificates
  alter column certificate_title set not null,
  alter column certificate_type set not null,
  alter column template set not null,
  alter column issuer_name set not null;

drop policy if exists "Public can verify active certificates" on public.certificates;
drop policy if exists "Users can read own certificates" on public.certificates;
drop policy if exists "Admins can manage certificates" on public.certificates;
drop policy if exists "Event managers can manage certificates" on public.certificates;
drop policy if exists "Authenticated users can read own certificates" on public.certificates;
drop policy if exists "Public can verify certificates" on public.certificates;

alter table public.certificates
  alter column status drop default;

alter table public.certificates
  alter column status type text using (
    case
      when status::text in ('approved', 'published', 'valid') then 'valid'
      when status::text in ('archived', 'revoked', 'rejected') then 'revoked'
      else coalesce(status::text, 'valid')
    end
  );

alter table public.certificates
  alter column status set default 'valid';

alter table public.certificates
  drop constraint if exists certificates_status_check;

alter table public.certificates
  add constraint certificates_status_check check (status in ('valid', 'revoked'));

with numbered_certificates as (
  select id, row_number() over (order by created_at, id) as sequence_number
  from public.certificates
  where verification_code is null
)
update public.certificates c
set verification_code = concat('CLUB-', extract(year from now())::int, '-', lpad(n.sequence_number::text, 5, '0'))
from numbered_certificates n
where c.id = n.id;

update public.certificates c
set recipient_name_snapshot = coalesce(nullif(p.full_name, ''), p.email, c.recipient_name_snapshot)
from public.profiles p
where c.member_id = p.id
  and c.recipient_name_snapshot is null;

update public.certificates c
set event_title_snapshot = coalesce(e.title, c.event_title_snapshot)
from public.events e
where c.event_id = e.id
  and c.event_title_snapshot is null;

create unique index if not exists certificates_member_event_unique
  on public.certificates(member_id, event_id)
  where member_id is not null and event_id is not null;

create unique index if not exists certificates_verification_code_unique
  on public.certificates(verification_code)
  where verification_code is not null;

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
  verification_code,
  event_title_snapshot,
  recipient_name_snapshot,
  status,
  created_at
from public.certificates
where verification_code is not null;

alter table public.certificates enable row level security;

drop policy if exists "Admins can manage certificates" on public.certificates;
create policy "Admins can manage certificates" on public.certificates
  for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "Authenticated users can read own certificates" on public.certificates;
create policy "Authenticated users can read own certificates" on public.certificates
  for select
  using (auth.uid() = member_id);

drop policy if exists "Public can verify certificates" on public.certificates;
create policy "Public can verify certificates" on public.certificates
  for select
  using (verification_code is not null);

grant select on public.public_certificates to anon, authenticated;
grant select, insert, update, delete on public.certificates to authenticated;

insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Admins can upload signatures" on storage.objects;
create policy "Admins can upload signatures" on storage.objects
  for insert
  with check (
    bucket_id = 'signatures'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

drop policy if exists "Public can read signatures" on storage.objects;
create policy "Public can read signatures" on storage.objects
  for select
  using (bucket_id = 'signatures');

notify pgrst, 'reload schema';
