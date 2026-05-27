delete from public.certificates a
using public.certificates b
where a.id > b.id
  and a.event_id is not null
  and a.event_id = b.event_id
  and a.recipient_id = b.recipient_id
  and a.status <> 'archived'
  and b.status <> 'archived';

drop index if exists public.certificates_unique_event_recipient_type;

create unique index if not exists certificates_unique_event_recipient
  on public.certificates(event_id, recipient_id)
  where event_id is not null and status <> 'archived';
