alter table public.certificates enable row level security;

drop policy if exists "Event managers can manage certificates" on public.certificates;
create policy "Event managers can manage certificates" on public.certificates
  for all
  using (
    exists (
      select 1
      from public.events e
      where e.id = certificates.event_id
        and e.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.event_staff es
      where es.event_id = certificates.event_id
        and (
          es.user_id = auth.uid()
          or lower(coalesce(es.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
        and coalesce(es.staff_role, '') in ('organizer', 'coordinator')
    )
  )
  with check (
    exists (
      select 1
      from public.events e
      where e.id = certificates.event_id
        and e.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.event_staff es
      where es.event_id = certificates.event_id
        and (
          es.user_id = auth.uid()
          or lower(coalesce(es.email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
        and coalesce(es.staff_role, '') in ('organizer', 'coordinator')
    )
  );

notify pgrst, 'reload schema';
