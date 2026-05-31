do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'certificates' and column_name = 'recipient_id'
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
    update public.certificates
    set certificate_title = coalesce(certificate_title, title)
    where certificate_title is null;

    alter table public.certificates
      alter column title drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'certificates' and column_name = 'template_style'
  ) then
    update public.certificates
    set template = coalesce(template, template_style)
    where template is null;

    alter table public.certificates
      alter column template_style drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'certificates' and column_name = 'certificate_url'
  ) then
    update public.certificates
    set external_pdf_url = coalesce(external_pdf_url, certificate_url)
    where external_pdf_url is null;

    alter table public.certificates
      alter column certificate_url drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'certificates' and column_name = 'issued_at'
  ) then
    update public.certificates
    set issued_date = coalesce(issued_date, issued_at)
    where issued_date is null;

    alter table public.certificates
      alter column issued_at drop not null;
  end if;
end $$;

notify pgrst, 'reload schema';
