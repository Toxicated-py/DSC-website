drop extension if exists "pg_net";

drop policy "Public and owners can read blog posts" on "public"."blog_posts";

drop policy "Admins can manage designation options" on "public"."designation_options";

drop policy "Anyone can read active designation options" on "public"."designation_options";

drop policy "Admins manage event staff" on "public"."event_staff";

drop policy "Staff can read own event staff row" on "public"."event_staff";

drop policy "Admins manage gallery" on "public"."gallery_submissions";

drop policy "Public can read approved gallery submissions" on "public"."gallery_submissions";

drop policy "Admins manage learning materials" on "public"."learning_materials";

drop policy "Admins manage partners" on "public"."partner_submissions";

drop policy "Public can read approved partner submissions" on "public"."partner_submissions";

drop policy "Public and owners can read projects" on "public"."projects";

alter table "public"."certificates" drop constraint "certificates_verification_code_key";

drop view if exists "public"."public_certificates";

drop index if exists "public"."certificates_verification_code_key";

CREATE UNIQUE INDEX certificates_verification_code_key ON public.certificates USING btree (verification_code) WHERE (verification_code IS NOT NULL);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.current_user_is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role::text in ('admin', 'president')
        or 'admin' = any(coalesce(p.roles, '{}'::text[]))
        or 'president' = any(coalesce(p.roles, '{}'::text[]))
      )
  )
$function$
;

CREATE OR REPLACE FUNCTION private.current_user_is_admin_or_organizer()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role::text in ('admin', 'president', 'organizer')
        or 'admin' = any(coalesce(p.roles, '{}'::text[]))
        or 'president' = any(coalesce(p.roles, '{}'::text[]))
        or 'organizer' = any(coalesce(p.roles, '{}'::text[]))
      )
  )
$function$
;

CREATE OR REPLACE FUNCTION public.admin_list_profiles(request_secret text)
 RETURNS SETOF public.profiles
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'private', 'extensions'
AS $function$
  select p.*
  from public.profiles p
  where encode(extensions.digest(coalesce(request_secret, ''), 'sha256'), 'hex')
    = '8efb68e538f5c3509fabd856a8ce490b23657645b2684f625f898676a2733682'
  order by p.created_at desc nulls last
$function$
;

create or replace view "public"."public_certificates" as  SELECT id,
    certificate_title,
    certificate_type,
    template,
    description,
    issuer_name,
    issued_date,
    signature_data,
    template_data,
    verification_code,
    event_title_snapshot,
    recipient_name_snapshot,
    status,
    created_at
   FROM public.certificates
  WHERE (verification_code IS NOT NULL);



  create policy "Public and owners can read blog posts"
  on "public"."blog_posts"
  as permissive
  for select
  to public
using (((status = ANY (ARRAY['approved'::public.review_status, 'published'::public.review_status])) OR (auth.uid() = author_id)));



  create policy "Admins can manage designation options"
  on "public"."designation_options"
  as permissive
  for all
  to public
using (private.current_user_is_admin())
with check (private.current_user_is_admin());



  create policy "Anyone can read active designation options"
  on "public"."designation_options"
  as permissive
  for select
  to public
using (((is_active = true) OR private.current_user_is_admin()));



  create policy "Admins manage event staff"
  on "public"."event_staff"
  as permissive
  for all
  to public
using (private.current_user_is_admin())
with check (private.current_user_is_admin());



  create policy "Staff can read own event staff row"
  on "public"."event_staff"
  as permissive
  for select
  to public
using (((( SELECT auth.uid() AS uid) = user_id) OR (lower(email) = lower((( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text)) OR private.current_user_is_admin()));



  create policy "Admins manage gallery"
  on "public"."gallery_submissions"
  as permissive
  for all
  to public
using (private.current_user_is_admin())
with check (private.current_user_is_admin());



  create policy "Public can read approved gallery submissions"
  on "public"."gallery_submissions"
  as permissive
  for select
  to public
using (((status = ANY (ARRAY['approved'::public.review_status, 'published'::public.review_status])) OR private.current_user_is_admin() OR (submitted_by = ( SELECT auth.uid() AS uid))));



  create policy "Admins manage learning materials"
  on "public"."learning_materials"
  as permissive
  for all
  to public
using (private.current_user_is_admin())
with check (private.current_user_is_admin());



  create policy "Admins manage partners"
  on "public"."partner_submissions"
  as permissive
  for all
  to public
using (private.current_user_is_admin())
with check (private.current_user_is_admin());



  create policy "Public can read approved partner submissions"
  on "public"."partner_submissions"
  as permissive
  for select
  to public
using (((status = ANY (ARRAY['approved'::public.review_status, 'published'::public.review_status])) OR private.current_user_is_admin() OR (submitted_by = ( SELECT auth.uid() AS uid))));



  create policy "Public and owners can read projects"
  on "public"."projects"
  as permissive
  for select
  to public
using (((status = ANY (ARRAY['approved'::public.review_status, 'published'::public.review_status])) OR (auth.uid() = author_id)));



