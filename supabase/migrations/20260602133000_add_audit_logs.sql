create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  action text not null,
  resource text not null,
  resource_id text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists audit_logs_resource_idx on public.audit_logs (resource, created_at desc);
create index if not exists audit_logs_actor_id_idx on public.audit_logs (actor_id, created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "Admins can read audit logs" on public.audit_logs;
create policy "Admins can read audit logs" on public.audit_logs
  for select using (
    exists (
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

drop policy if exists "Admins can insert audit logs" on public.audit_logs;
create policy "Admins can insert audit logs" on public.audit_logs
  for insert with check (
    exists (
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

grant select, insert on public.audit_logs to authenticated;
notify pgrst, 'reload schema';
