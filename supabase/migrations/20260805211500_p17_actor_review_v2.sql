-- P17 Megasprint 04: secure review and geography-role hardening.
-- Schema candidate only. This migration does not activate public profiles or external submissions.

alter table public.actor_geographies
  drop constraint if exists actor_geographies_geography_role_check;
alter table public.actor_geographies
  add constraint actor_geographies_geography_role_check
  check (geography_role in (
    'HEADQUARTERS_REFERENCE',
    'OPERATING_GEOGRAPHY',
    'PROGRAMME_GEOGRAPHY',
    'DOCUMENTED_PROJECT_SITE',
    'PARTNER_GEOGRAPHY'
  ));

alter table public.actor_geographies
  drop constraint if exists actor_geographies_precision_check;
alter table public.actor_geographies
  add constraint actor_geographies_precision_check
  check (precision in ('CITY_REFERENCE','COUNTRY','REGION','SITE_REFERENCE','DOCUMENTED_SITE'));

alter table public.actor_profile_requests
  add column if not exists affected_section text,
  add column if not exists authorisation_context text,
  add column if not exists attachment_reference text,
  add column if not exists privacy_acknowledged boolean not null default false,
  add column if not exists urgent boolean not null default false,
  add column if not exists retention_until timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists deletion_reason text,
  add column if not exists last_status_changed_at timestamptz not null default now();

alter table public.actor_profile_requests
  drop constraint if exists actor_profile_requests_request_type_check;
alter table public.actor_profile_requests
  add constraint actor_profile_requests_request_type_check
  check (request_type in ('CLAIM','CORRECTION','URGENT_CORRECTION','REMOVAL','DISPUTE','APPEAL'));

alter table public.actor_profile_requests
  drop constraint if exists actor_profile_requests_status_check;
alter table public.actor_profile_requests
  add constraint actor_profile_requests_status_check
  check (status in (
    'RECEIVED',
    'IDENTITY_VERIFICATION_PENDING',
    'EVIDENCE_REQUESTED',
    'UNDER_EDITORIAL_REVIEW',
    'APPROVED',
    'PARTIALLY_APPROVED',
    'REJECTED',
    'URGENT_SUSPENSION',
    'RESOLVED',
    'APPEALED',
    'CLOSED'
  ));

alter table public.actor_profile_requests
  add constraint actor_profile_requests_privacy_acknowledged_check
  check (privacy_acknowledged = true) not valid;

create index if not exists actor_profile_requests_actor_status_idx
  on public.actor_profile_requests (actor_id, status, created_at desc)
  where deleted_at is null;

create index if not exists actor_profile_requests_domain_idx
  on public.actor_profile_requests (lower(organisation_domain), created_at desc)
  where deleted_at is null;

alter table public.actor_review_events
  add column if not exists request_type text,
  add column if not exists affected_section text,
  add column if not exists submitted_evidence text,
  add column if not exists reviewer_notes text,
  add column if not exists visibility text not null default 'INTERNAL',
  add column if not exists immutable_hash text;

alter table public.actor_review_events
  add constraint actor_review_events_visibility_check
  check (visibility in ('INTERNAL','RESTRICTED')) not valid;

create or replace function public.p17_record_actor_review_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.actor_review_events (
      actor_id,
      request_id,
      request_type,
      affected_section,
      event_type,
      previous_state,
      next_state,
      reason,
      submitted_evidence,
      created_by,
      immutable_hash
    ) values (
      new.actor_id,
      new.id,
      new.request_type,
      new.affected_section,
      'STATUS_CHANGED',
      old.status,
      new.status,
      coalesce(new.deletion_reason, 'Internal review transition'),
      new.evidence_references,
      auth.uid(),
      encode(digest(concat_ws('|', new.id::text, old.status, new.status, now()::text), 'sha256'), 'hex')
    );
    new.last_status_changed_at = now();
  end if;
  return new;
end;
$$;

revoke all on function public.p17_record_actor_review_event() from public, anon, authenticated;

create trigger p17_actor_review_event_trigger
before update of status on public.actor_profile_requests
for each row execute function public.p17_record_actor_review_event();

-- No browser or anonymous queue access. Internal operations require service-role or a later reviewed staff policy.
revoke all on public.actor_profile_requests, public.actor_review_events from anon, authenticated;

comment on column public.actor_profile_requests.authorisation_context is
  'Why the requestor is authorised to speak for the organisation. Review evidence; do not auto-approve.';
comment on column public.actor_profile_requests.retention_until is
  'Retention deadline for private requestor contact and submitted evidence.';
comment on function public.p17_record_actor_review_event() is
  'Creates an internal audit event for status transitions. It cannot change profile content or partnership state.';
