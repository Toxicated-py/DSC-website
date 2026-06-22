alter table public.profiles
  add column if not exists phone text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, phone, role, roles, membership_status, is_sms_student, student_email, student_email_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, ''),
    new.raw_user_meta_data->>'avatar_url',
    nullif(new.raw_user_meta_data->>'phone', ''),
    'member',
    case
      when lower(new.email) like '%@sms.tu.edu.np' then array['member', 'student']
      else array['member']
    end,
    'approved',
    lower(new.email) like '%@sms.tu.edu.np',
    case
      when lower(new.email) like '%@sms.tu.edu.np' then lower(new.email)
      when lower(nullif(new.raw_user_meta_data->>'student_email', '')) like '%@sms.tu.edu.np'
      then lower(nullif(new.raw_user_meta_data->>'student_email', ''))
      else null
    end,
    case
      when lower(new.email) like '%@sms.tu.edu.np' then 'approved'::public.review_status
      else 'pending'::public.review_status
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        phone = coalesce(excluded.phone, public.profiles.phone),
        role = case when public.profiles.role = 'student' then 'member'::public.user_role else public.profiles.role end,
        roles = array(select distinct unnest(public.profiles.roles || excluded.roles)),
        membership_status = case when public.profiles.membership_status = 'pending' then 'approved'::public.review_status else public.profiles.membership_status end,
        is_sms_student = public.profiles.is_sms_student or excluded.is_sms_student,
        student_email = coalesce(excluded.student_email, public.profiles.student_email),
        student_email_status = case
          when excluded.student_email_status = 'approved' then 'approved'::public.review_status
          else public.profiles.student_email_status
        end,
        updated_at = now();

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
