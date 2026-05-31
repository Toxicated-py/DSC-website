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
end $$;

notify pgrst, 'reload schema';
