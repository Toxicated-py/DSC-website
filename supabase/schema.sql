create extension if not exists "pgcrypto";
create schema if not exists private;

create type public.user_role as enum ('student', 'member', 'organizer', 'admin');
create type public.review_status as enum ('draft', 'submitted', 'pending', 'approved', 'rejected', 'published', 'archived');
create type public.event_type as enum ('WORKSHOP', 'SEMINAR', 'COMPETITION', 'COMMUNITY');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null default '',
  avatar_url text,
  batch_year int,
  role public.user_role not null default 'student',
  roles text[] not null default array['member'],
  membership_status public.review_status not null default 'pending',
  is_sms_student boolean not null default false,
  student_email text,
  student_email_status public.review_status not null default 'pending',
  bio text,
  designation text,
  designation_status public.review_status not null default 'pending',
  major text,
  github_username text,
  linkedin_username text,
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.designation_options (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references public.profiles(id) on delete cascade,
  motivation text not null,
  interests text[] not null default '{}',
  notes text,
  status public.review_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  review_notes text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  event_type public.event_type not null default 'WORKSHOP',
  description text not null default '',
  short_description text not null default '',
  start_time timestamptz,
  end_time timestamptz,
  venue text,
  capacity int not null default 40,
  registration_open boolean not null default true,
  status public.review_status not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_proposals (
  id uuid primary key default gen_random_uuid(),
  proposed_by uuid references public.profiles(id),
  title text not null,
  event_type public.event_type not null default 'WORKSHOP',
  proposed_date date,
  proposed_time time,
  venue text,
  capacity int,
  host text,
  coordinator_emails text[] not null default '{}',
  summary text not null,
  prerequisites text,
  outcomes text,
  status public.review_status not null default 'pending',
  submitted_at timestamptz not null default now()
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  ticket_code text unique not null default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'registered',
  waitlist_position int,
  registered_at timestamptz not null default now(),
  checked_in_at timestamptz,
  unique(event_id, user_id)
);

create table public.event_staff (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  email text not null,
  staff_role text not null default 'coordinator',
  can_scan boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique(event_id, email)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  category text not null default 'Machine Learning',
  team text,
  technologies text[] not null default '{}',
  summary text not null,
  content text not null default '',
  thumbnail_url text,
  status public.review_status not null default 'submitted',
  author_id uuid references public.profiles(id),
  submitted_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  summary text not null,
  tags text[] not null default '{}',
  cover_image_url text,
  content text not null,
  status public.review_status not null default 'published',
  author_id uuid references public.profiles(id),
  published_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  issued_by uuid references public.profiles(id),
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  certificate_type text not null default 'Workshop',
  issuer_name text not null default 'Data Science Club',
  description text,
  status public.review_status not null default 'approved',
  issued_at date,
  verification_code text unique,
  recipient_name_snapshot text,
  event_title_snapshot text,
  template_style text not null default 'event',
  revoked_at timestamptz,
  certificate_url text,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  event_name text,
  submitted_by uuid references public.profiles(id),
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

create table public.partner_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website_url text,
  logo_url text,
  category text,
  description text,
  submitted_by uuid references public.profiles(id),
  status public.review_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

create table public.learning_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  resource_url text not null,
  category text not null default 'General',
  status public.review_status not null default 'published',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role, roles, membership_status, is_sms_student, student_email, student_email_status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, ''),
    new.raw_user_meta_data->>'avatar_url',
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

create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if private.current_user_is_admin() then
    return new;
  end if;

  new.role := old.role;
  new.membership_status := old.membership_status;

  if new.designation is distinct from old.designation then
    new.designation_status := 'pending';
  else
    new.designation_status := old.designation_status;
  end if;

  return new;
end;
$$;

revoke execute on function public.protect_profile_admin_fields() from anon, authenticated, public;

create or replace function private.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

grant usage on schema private to authenticated;
grant execute on function private.current_user_role() to authenticated;

create or replace function private.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public, private
stable
as $$
  select coalesce(private.current_user_role() = 'admin', false)
$$;

grant execute on function private.current_user_is_admin() to authenticated;

create or replace function private.current_user_is_admin_or_organizer()
returns boolean
language sql
security definer
set search_path = public, private
stable
as $$
  select coalesce(private.current_user_role() in ('admin', 'organizer'), false)
$$;

grant execute on function private.current_user_is_admin_or_organizer() to authenticated;

create or replace function private.current_user_can_manage_event(target_event_id uuid)
returns boolean
language sql
security definer
set search_path = public, private
stable
as $$
  select coalesce(
    private.current_user_is_admin()
    or exists (
      select 1 from public.events e
      where e.id = target_event_id and e.created_by = auth.uid()
    )
    or exists (
      select 1
      from public.event_staff staff
      join auth.users u on u.id = auth.uid()
      where staff.event_id = target_event_id
        and staff.can_scan = true
        and (staff.user_id = auth.uid() or lower(staff.email) = lower(u.email))
    ),
    false
  )
$$;

grant execute on function private.current_user_can_manage_event(uuid) to authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger protect_profile_admin_fields_before_update
  before update on public.profiles
  for each row execute function public.protect_profile_admin_fields();

insert into public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name', users.email, ''),
  users.raw_user_meta_data->>'avatar_url',
  coalesce(users.created_at, now()),
  now()
from auth.users as users
where users.email is not null
on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      updated_at = now();

alter table public.profiles enable row level security;
alter table public.designation_options enable row level security;
alter table public.membership_applications enable row level security;
alter table public.events enable row level security;
alter table public.event_proposals enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_staff enable row level security;
alter table public.projects enable row level security;
alter table public.blog_posts enable row level security;
alter table public.certificates enable row level security;
alter table public.gallery_submissions enable row level security;
alter table public.partner_submissions enable row level security;
alter table public.learning_materials enable row level security;
alter table public.site_settings enable row level security;

create index if not exists membership_applications_applicant_id_idx on public.membership_applications(applicant_id);
create index if not exists membership_applications_reviewed_by_idx on public.membership_applications(reviewed_by);
create index if not exists events_created_by_idx on public.events(created_by);
create index if not exists event_proposals_proposed_by_idx on public.event_proposals(proposed_by);
create index if not exists event_registrations_event_id_idx on public.event_registrations(event_id);
create index if not exists event_registrations_user_id_idx on public.event_registrations(user_id);
create index if not exists event_staff_user_id_idx on public.event_staff(user_id);
create index if not exists event_staff_created_by_idx on public.event_staff(created_by);
create index if not exists projects_author_id_idx on public.projects(author_id);
create index if not exists blog_posts_author_id_idx on public.blog_posts(author_id);
create index if not exists certificates_recipient_id_idx on public.certificates(recipient_id);
create index if not exists certificates_issued_by_idx on public.certificates(issued_by);
create index if not exists certificates_event_id_idx on public.certificates(event_id);
create unique index if not exists certificates_unique_event_recipient
  on public.certificates(event_id, recipient_id)
  where event_id is not null and status <> 'archived';
create index if not exists gallery_submissions_submitted_by_idx on public.gallery_submissions(submitted_by);
create index if not exists gallery_submissions_reviewed_by_idx on public.gallery_submissions(reviewed_by);
create index if not exists partner_submissions_submitted_by_idx on public.partner_submissions(submitted_by);
create index if not exists partner_submissions_reviewed_by_idx on public.partner_submissions(reviewed_by);
create index if not exists learning_materials_created_by_idx on public.learning_materials(created_by);

create unique index if not exists event_proposals_unique_active_user_title
  on public.event_proposals(proposed_by, lower(title))
  where status in ('draft', 'submitted', 'pending', 'approved', 'published');

create unique index if not exists projects_unique_active_author_title
  on public.projects(author_id, lower(title))
  where status in ('draft', 'submitted', 'pending', 'approved', 'published');

create unique index if not exists blog_posts_unique_active_author_title
  on public.blog_posts(author_id, lower(title))
  where status in ('draft', 'submitted', 'pending', 'approved', 'published');

create unique index if not exists gallery_submissions_unique_active_user_image
  on public.gallery_submissions(submitted_by, lower(image_url))
  where status in ('submitted', 'pending', 'approved', 'published');

create policy "Public can read published events" on public.events
  for select using (status in ('approved', 'published'));

create policy "Users can read own profile" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "Admins can read all profiles" on public.profiles
  for select using ((select private.current_user_is_admin()));

create policy "Users can update own profile" on public.profiles
  for update using ((select auth.uid()) = id);

create policy "Admins can update profiles" on public.profiles
  for update using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Anyone can read active designation options" on public.designation_options
  for select using (is_active = true or (select private.current_user_is_admin()));

create policy "Admins can manage designation options" on public.designation_options
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

insert into public.designation_options (label, sort_order) values
  ('President', 10),
  ('Vice President', 20),
  ('Secretary', 30),
  ('Treasurer', 40),
  ('Event Coordinator', 50),
  ('Project Lead', 60),
  ('ML Lead', 70),
  ('Design Lead', 80),
  ('Content Lead', 90),
  ('Community Lead', 100)
on conflict (label) do nothing;

create policy "Users can create membership applications" on public.membership_applications
  for insert with check ((select auth.uid()) = applicant_id);

create policy "Users can read own membership applications" on public.membership_applications
  for select using ((select auth.uid()) = applicant_id);

create policy "Users can read and submit own event proposals" on public.event_proposals
  for all using ((select auth.uid()) = proposed_by)
  with check ((select auth.uid()) = proposed_by);

create policy "Admins can manage event proposals" on public.event_proposals
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Users can create and read own registrations" on public.event_registrations
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Event managers can read registrations" on public.event_registrations
  for select using (private.current_user_can_manage_event(event_id));

create policy "Event managers can update registrations" on public.event_registrations
  for update using (private.current_user_can_manage_event(event_id))
  with check (private.current_user_can_manage_event(event_id));

create policy "Admins manage event staff" on public.event_staff
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Staff can read own event staff row" on public.event_staff
  for select using (
    (select auth.uid()) = user_id
    or lower(email) = lower((select email from auth.users where id = auth.uid()))
    or (select private.current_user_is_admin())
  );

create policy "Event managers can read event staff" on public.event_staff
  for select using (private.current_user_can_manage_event(event_id));

create policy "Event managers can manage event staff" on public.event_staff
  for all using (private.current_user_can_manage_event(event_id))
  with check (private.current_user_can_manage_event(event_id));

create policy "Public and owners can read projects" on public.projects
  for select using (status = 'published' or (select auth.uid()) = author_id);

create policy "Users can submit own projects" on public.projects
  for insert with check ((select auth.uid()) = author_id);

create policy "Users can update own projects" on public.projects
  for update using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Admins can manage events" on public.events
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Event managers can update own events" on public.events
  for update using (private.current_user_can_manage_event(id))
  with check (private.current_user_can_manage_event(id));

create policy "Admins can manage projects" on public.projects
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Public and owners can read blog posts" on public.blog_posts
  for select using (status = 'published' or (select auth.uid()) = author_id);

create policy "Users can write own blog posts" on public.blog_posts
  for insert with check ((select auth.uid()) = author_id);

create policy "Users can update own blog posts" on public.blog_posts
  for update using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "Admins can manage blog posts" on public.blog_posts
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Users can read own certificates" on public.certificates
  for select using ((select auth.uid()) = recipient_id);

create policy "Public can verify active certificates" on public.certificates
  for select using (verification_code is not null and revoked_at is null and status in ('approved', 'published'));

create policy "Admins can manage certificates" on public.certificates
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Event managers can manage certificates" on public.certificates
  for all using (private.current_user_can_manage_event(event_id))
  with check (private.current_user_can_manage_event(event_id));

create policy "Public can read approved gallery submissions" on public.gallery_submissions
  for select using (status in ('approved', 'published') or (select private.current_user_is_admin()) or submitted_by = (select auth.uid()));

create policy "Users can submit gallery" on public.gallery_submissions
  for insert with check (submitted_by = (select auth.uid()));

create policy "Admins manage gallery" on public.gallery_submissions
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Public can read approved partner submissions" on public.partner_submissions
  for select using (status in ('approved', 'published') or (select private.current_user_is_admin()) or submitted_by = (select auth.uid()));

create policy "Users can submit partners" on public.partner_submissions
  for insert with check (submitted_by = (select auth.uid()));

create policy "Admins manage partners" on public.partner_submissions
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Public can read learning materials" on public.learning_materials
  for select using (status in ('approved', 'published'));

create policy "Admins manage learning materials" on public.learning_materials
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));

create policy "Public can read site settings" on public.site_settings
  for select using (true);

create policy "Admins manage site settings" on public.site_settings
  for all using ((select private.current_user_is_admin()))
  with check ((select private.current_user_is_admin()));
