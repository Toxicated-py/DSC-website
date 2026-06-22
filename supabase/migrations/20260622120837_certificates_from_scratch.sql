create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  certificate_id text not null unique,
  recipient_name text not null,
  recipient_email text not null,
  certificate_type text not null,
  event_id uuid null references public.events(id) on delete set null,
  event_name text not null,
  issued_at timestamptz not null default now(),
  imported_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.certificates
  add column if not exists certificate_id text,
  add column if not exists recipient_name text,
  add column if not exists recipient_email text,
  add column if not exists event_name text,
  add column if not exists imported_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists certificates_certificate_id_unique_idx
  on public.certificates (certificate_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_certificates_updated_at on public.certificates;
create trigger set_certificates_updated_at
  before update on public.certificates
  for each row execute function public.set_updated_at();

alter table public.certificates enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.certificates to anon, authenticated;

drop policy if exists "Admins can read imported certificates" on public.certificates;
create policy "Admins can read imported certificates" on public.certificates
  for select using ((select private.current_user_is_admin()));

drop policy if exists "Admins can import certificates" on public.certificates;
create policy "Admins can import certificates" on public.certificates
  for insert with check ((select private.current_user_is_admin()));

drop policy if exists "Admins can update imported certificates" on public.certificates;
create policy "Admins can update imported certificates" on public.certificates
  for update using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

drop policy if exists "Admins can delete imported certificates" on public.certificates;
create policy "Admins can delete imported certificates" on public.certificates
  for delete using ((select private.current_user_is_admin()));
