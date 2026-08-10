-- 4PLANET PUBLIC PRODUCTION CORE v1
-- Internal pre-production hardening. No public intake or payment activation is implied.
-- Sensitive records remain server-side only. BRAIN remains authority for canon and learning.

create table if not exists public.public_registrations (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique check (char_length(idempotency_key) between 16 and 160),
  dedupe_key text not null unique check (char_length(dedupe_key) between 32 and 128),
  lead_type text not null check (lead_type in ('4people','4brands','4partners','4funders')),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  organisation text check (organisation is null or char_length(organisation) <= 160),
  role text check (role is null or char_length(role) <= 120),
  website text check (website is null or char_length(website) <= 200),
  work_area text check (work_area is null or char_length(work_area) <= 300),
  funding_interest text check (funding_interest is null or char_length(funding_interest) <= 300),
  interest text not null check (char_length(interest) between 1 and 600),
  interests text[] not null default '{}',
  message text check (message is null or char_length(message) <= 1200),
  consent_scope text not null default 'registration_contact_v1',
  consent_at timestamptz not null,
  marketing_permission boolean not null default false,
  source_route text not null check (char_length(source_route) between 1 and 200),
  attribution jsonb not null default '{}'::jsonb,
  relationship_status text not null default 'RECEIVED' check (relationship_status in (
    'RECEIVED','ACKNOWLEDGED','QUALIFICATION_PENDING','QUALIFIED','ACTIVE_RELATIONSHIP',
    'CLOSED','UNSUBSCRIBED','DELETION_REQUESTED'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  retention_until timestamptz not null default (now() + interval '180 days'),
  deletion_requested_at timestamptz,
  last_contact_at timestamptz,
  check (jsonb_typeof(attribution) = 'object'),
  check (octet_length(attribution::text) <= 4096),
  check (retention_until >= created_at)
);

create index if not exists public_registrations_status_idx
  on public.public_registrations (relationship_status, created_at desc);
create index if not exists public_registrations_retention_idx
  on public.public_registrations (retention_until)
  where relationship_status not in ('DELETION_REQUESTED');
create index if not exists public_registrations_email_lower_idx
  on public.public_registrations (lower(email));

create table if not exists public.public_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('ACCESS','EXPORT','CORRECTION','DELETION','WITHDRAW_CONSENT')),
  email text not null check (char_length(email) between 3 and 254),
  registration_id uuid references public.public_registrations(id) on delete set null,
  verification_state text not null default 'PENDING' check (verification_state in ('PENDING','VERIFIED','FAILED','EXPIRED')),
  request_status text not null default 'RECEIVED' check (request_status in ('RECEIVED','IN_REVIEW','COMPLETED','REJECTED')),
  request_note text check (request_note is null or char_length(request_note) <= 600),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  -- Public requests never trigger automatic disclosure or deletion before identity verification.
  check (completed_at is null or completed_at >= created_at)
);
create index if not exists public_privacy_requests_email_idx
  on public.public_privacy_requests (lower(email), created_at desc);
create index if not exists public_privacy_requests_status_idx
  on public.public_privacy_requests (request_status, created_at desc);

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique check (char_length(idempotency_key) between 16 and 160),
  event_name text not null check (event_name in (
    'landing',
    'gold_vertical_entry',
    'atlas_interaction',
    'species_interaction',
    'source_open',
    'relationship_reveal',
    'impact_member_cta',
    'signup_start',
    'signup_completion',
    'contact_enquiry',
    'return_visit',
    'content_referral',
    'payment_intent',
    'checkout',
    'payment_success',
    'payment_failure',
    'payment_refund'
  )),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  environment text not null check (environment in ('PREVIEW','PRODUCTION')),
  session_id text check (session_id is null or char_length(session_id) <= 80),
  source_route text not null check (char_length(source_route) between 1 and 300),
  entity_type text check (entity_type is null or char_length(entity_type) <= 80),
  entity_id text check (entity_id is null or char_length(entity_id) <= 200),
  channel text check (channel is null or char_length(channel) <= 100),
  campaign text check (campaign is null or char_length(campaign) <= 160),
  content_id text check (content_id is null or char_length(content_id) <= 160),
  story_id text check (story_id is null or char_length(story_id) <= 160),
  gold_vertical_id text check (gold_vertical_id is null or char_length(gold_vertical_id) <= 160),
  outreach_actor_id text check (outreach_actor_id is null or char_length(outreach_actor_id) <= 160),
  utm_source text check (utm_source is null or char_length(utm_source) <= 160),
  utm_medium text check (utm_medium is null or char_length(utm_medium) <= 160),
  utm_campaign text check (utm_campaign is null or char_length(utm_campaign) <= 160),
  utm_content text check (utm_content is null or char_length(utm_content) <= 160),
  referrer_host text check (referrer_host is null or char_length(referrer_host) <= 253),
  release_sha text check (release_sha is null or char_length(release_sha) <= 80),
  properties jsonb not null default '{}'::jsonb,
  check (jsonb_typeof(properties) = 'object'),
  check (octet_length(properties::text) <= 4096)
);
create index if not exists product_events_name_time_idx
  on public.product_events (event_name, occurred_at desc);
create index if not exists product_events_campaign_time_idx
  on public.product_events (utm_campaign, occurred_at desc)
  where utm_campaign is not null;
create index if not exists product_events_story_time_idx
  on public.product_events (story_id, occurred_at desc)
  where story_id is not null;

alter table public.public_registrations enable row level security;
alter table public.public_privacy_requests enable row level security;
alter table public.product_events enable row level security;

-- Server-side only until a dedicated founder/admin authorization model exists.
-- No anon/authenticated policy is intentionally created.
revoke all on public.public_registrations from anon, authenticated;
revoke all on public.public_privacy_requests from anon, authenticated;
revoke all on public.product_events from anon, authenticated;

grant select, insert, update, delete on public.public_registrations to service_role;
grant select, insert, update, delete on public.public_privacy_requests to service_role;
grant select, insert, update, delete on public.product_events to service_role;

comment on table public.public_registrations is
  'Server-side public interest lifecycle. Not membership, funding, partnership or impact evidence. Default retention is a reversible pre-production minimum and requires privacy/legal approval before activation.';
comment on column public.public_registrations.marketing_permission is
  'Never inferred from registration consent. Separate marketing permission must be explicit.';
comment on table public.public_privacy_requests is
  'Privacy requests require identity verification before export, correction, consent withdrawal or deletion is executed.';
comment on table public.product_events is
  'First-party bounded product measurement. Never store IP address, full referrer URL, user-agent, fingerprint or sensitive personal data here.';
