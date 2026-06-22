-- Remove launch/QA dummy content only. Keep this narrow so real club content is not touched.
delete from public.event_registrations
where event_id in (
  select id from public.events
  where lower(coalesce(title, '')) like 'test qa%'
     or lower(coalesce(slug, '')) like 'test-qa%'
     or lower(coalesce(title, '')) like 'test event%'
     or lower(coalesce(slug, '')) like 'test-event%'
);

delete from public.events
where lower(coalesce(title, '')) like 'test qa%'
   or lower(coalesce(slug, '')) like 'test-qa%'
   or lower(coalesce(title, '')) like 'test event%'
   or lower(coalesce(slug, '')) like 'test-event%';

delete from public.projects
where lower(coalesce(title, '')) in ('wzd', 'test qa project')
   or lower(coalesce(slug, '')) in ('wzd', 'test-qa-project')
   or lower(coalesce(summary, '')) like 'test qa project%';
