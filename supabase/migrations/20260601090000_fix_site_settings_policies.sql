create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
  for select
  using (true);

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings" on public.site_settings
  for all
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
  );

insert into public.site_settings (key, value)
values (
  'site',
  '{
    "siteName": "Data Science Club - SMS TU",
    "tagline": "Empowering Students Through Data",
    "contactEmail": "contact@datascienceclub.sms.tu.edu.np",
    "contactPhone": "+977-1-4331976",
    "address": "School of Mathematical Sciences, SMS, TU, Kathmandu, Nepal",
    "socialLinks": {
      "github": "#",
      "linkedin": "#",
      "twitter": "#",
      "facebook": "#",
      "instagram": "#",
      "discord": "#"
    }
  }'::jsonb
)
on conflict (key) do nothing;

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

notify pgrst, 'reload schema';
