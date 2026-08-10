create extension if not exists pgcrypto;

create table if not exists public.actors (
  actor_id uuid primary key default gen_random_uuid(),
  email_norm text not null unique,
  display_name text not null check (char_length(display_name) between 1 and 120),
  organisation text check (organisation is null or char_length(organisation) <= 160),
  role_type text not null default 'PERSON' check (role_type in ('PERSON','ORG_CONTACT')),
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  marketing_consent_version text,
  marketing_consent_source text,
  deletion_requested_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email_norm = lower(btrim(email_norm))),
  check ((marketing_consent = false) or marketing_consent_at is not null)
);

create table if not exists public.interest_enquiries (
  enquiry_id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actors(actor_id) on delete cascade,
  interest_type text not null check (interest_type in (
    'FOLLOW','PRODUCT_TEST','EXPERTISE_DATA','CREATIVE','PARTNERSHIP','FUNDING','FUTURE_MEMBERSHIP'
  )),
  message text check (message is null or char_length(message) <= 1200),
  source_route text not null check (char_length(source_route) <= 200),
  source_channel text not null default 'DIRECT' check (source_channel in (
    'DIRECT','SOCIAL','PRESS','PARTNER','CAMPAIGN','REFERRAL','EVENT','UNKNOWN'
  )),
  source_detail jsonb not null default '{}'::jsonb,
  privacy_notice_version text not null,
  privacy_acknowledged_at timestamptz not null,
  request_basis text not null default 'USER_REQUESTED_CONTACT' check (request_basis in ('USER_REQUESTED_CONTACT')),
  status text not null default 'RECEIVED' check (status in ('RECEIVED','TRIAGED','ACTIVE','QUALIFIED','CLOSED','ARCHIVED')),
  owner text,
  last_contact_at timestamptz,
  next_action_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists interest_enquiries_actor_created_idx on public.interest_enquiries (actor_id, created_at desc);
create index if not exists interest_enquiries_status_created_idx on public.interest_enquiries (status, created_at desc);

create table if not exists public.consent_events (
  consent_event_id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.actors(actor_id) on delete cascade,
  enquiry_id uuid references public.interest_enquiries(enquiry_id) on delete set null,
  consent_type text not null check (consent_type in ('MARKETING_UPDATES')),
  granted boolean not null,
  notice_version text not null,
  source_route text not null check (char_length(source_route) <= 200),
  occurred_at timestamptz not null default now()
);
create index if not exists consent_events_actor_occurred_idx on public.consent_events (actor_id, occurred_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists actors_touch_updated_at on public.actors;
create trigger actors_touch_updated_at
before update on public.actors
for each row execute function public.touch_updated_at();

drop trigger if exists interest_enquiries_touch_updated_at on public.interest_enquiries;
create trigger interest_enquiries_touch_updated_at
before update on public.interest_enquiries
for each row execute function public.touch_updated_at();

alter table public.actors enable row level security;
alter table public.interest_enquiries enable row level security;
alter table public.consent_events enable row level security;

revoke all on public.actors, public.interest_enquiries, public.consent_events from anon, authenticated;
grant all on public.actors, public.interest_enquiries, public.consent_events to service_role;

comment on table public.actors is 'Canonical first-party identity spine for bounded 4Planet enquiries. Email is normalized for deduplication. No user account is created.';
comment on table public.interest_enquiries is 'A specific user-requested contact or register-interest event. This is not membership, partnership, funding, payment, or marketing consent.';
comment on table public.consent_events is 'Separate event ledger for optional marketing-updates consent. Contact-request acknowledgement is stored on the enquiry and is not treated as newsletter consent.';
comment on column public.actors.marketing_consent is 'Current operational marketing-consent state. False by default; absence of a checked optional box never creates consent.';
comment on column public.actors.deletion_requested_at is 'Operational deletion-request state. Fulfilment remains an authorised internal privacy operation.';
