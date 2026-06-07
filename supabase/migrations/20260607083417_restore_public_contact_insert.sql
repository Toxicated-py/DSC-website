alter table public.contact_messages enable row level security;

grant insert on public.contact_messages to anon, authenticated;

drop policy if exists "Public can submit valid contact messages" on public.contact_messages;
create policy "Public can submit valid contact messages" on public.contact_messages
  for insert
  to anon, authenticated
  with check (
    length(trim(name)) between 2 and 120
    and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    and length(trim(subject)) between 2 and 180
    and length(trim(message)) between 5 and 5000
  );
