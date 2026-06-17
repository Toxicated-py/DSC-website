drop policy if exists "Public can submit valid contact messages" on public.contact_messages;

notify pgrst, 'reload schema';
