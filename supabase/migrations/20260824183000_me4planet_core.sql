-- ME4PLANET 01 — operational identity/account layer.
-- Supabase Auth owns identity. Stripe owns financial provider truth.
-- Ecological delivery/evidence/outcome remain separate from payment.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 100),
  member_role text not null default '4PEOPLE_MEMBER' check (member_role in ('4PEOPLE_MEMBER','FOUNDING_MEMBER','MISSION_BACKER','4AMBASSADOR')),
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  locale text not null default 'nb-NO' check (char_length(locale) <= 16),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_customer_links (
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null check (stripe_customer_id like 'cus_%'),
  environment text not null check (environment in ('TEST','LIVE')),
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, environment),
  unique (stripe_customer_id, environment)
);

alter table if exists public.commerce_financial_records
  add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table if exists public.commerce_financial_records
  add column if not exists provider_event_created_at timestamptz;
create index if not exists commerce_financial_user_idx on public.commerce_financial_records (user_id, updated_at desc);

create table if not exists public.membership_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null,
  stripe_subscription_id text,
  status text not null,
  current_period_end timestamptz,
  environment text not null check (environment in ('TEST','LIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_key, environment)
);

create table if not exists public.mission_supports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_slug text not null,
  product_key text not null,
  stripe_subscription_id text,
  status text not null,
  environment text not null check (environment in ('TEST','LIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mission_slug, environment)
);

create table if not exists public.impact_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_object_id text,
  product_key text not null,
  financial_state text not null,
  delivery_state text not null default 'DELIVERY_PENDING',
  evidence_state text not null default 'EVIDENCE_PENDING',
  outcome_state text not null default 'OUTCOME_NOT_ESTABLISHED',
  partner_id text,
  partner_project_id text,
  environment text not null check (environment in ('TEST','LIVE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (stripe_object_id, environment),
  check (delivery_state in ('DELIVERY_PENDING','DELIVERED','DELIVERY_FAILED','DELIVERY_CANCELLED')),
  check (evidence_state in ('EVIDENCE_PENDING','EVIDENCE_AVAILABLE','EVIDENCE_INCOMPLETE')),
  check (outcome_state in ('OUTCOME_NOT_ESTABLISHED','OUTCOME_PENDING','OUTCOME_ESTABLISHED','OUTCOME_DISPUTED'))
);

create index if not exists impact_contributions_user_idx on public.impact_contributions (user_id, created_at desc);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marketing_consent boolean not null default false,
  product_updates boolean not null default false,
  locale text not null default 'nb-NO' check (char_length(locale) <= 16),
  updated_at timestamptz not null default now()
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null,
  granted boolean not null,
  source text not null,
  policy_version text not null,
  recorded_at timestamptz not null default now()
);
create index if not exists consent_records_user_idx on public.consent_records (user_id, recorded_at desc);

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null check (request_type in ('ACCESS','EXPORT','RECTIFICATION','DELETION','RESTRICTION','OBJECTION','PORTABILITY')),
  status text not null default 'RECEIVED' check (status in ('RECEIVED','IN_REVIEW','COMPLETED','REJECTED_WITH_REASON')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text
);
create index if not exists privacy_requests_user_idx on public.privacy_requests (user_id, requested_at desc);

create table if not exists public.security_audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists security_audit_events_user_idx on public.security_audit_events (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.stripe_customer_links enable row level security;
alter table public.membership_entitlements enable row level security;
alter table public.mission_supports enable row level security;
alter table public.impact_contributions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.consent_records enable row level security;
alter table public.privacy_requests enable row level security;
alter table public.security_audit_events enable row level security;
alter table if exists public.commerce_financial_records enable row level security;

-- User-owned, deliberately narrow reads/writes.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (user_id = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (user_id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists stripe_customer_links_select_own on public.stripe_customer_links;
create policy stripe_customer_links_select_own on public.stripe_customer_links for select to authenticated using (user_id = auth.uid());

drop policy if exists membership_entitlements_select_own on public.membership_entitlements;
create policy membership_entitlements_select_own on public.membership_entitlements for select to authenticated using (user_id = auth.uid());

drop policy if exists mission_supports_select_own on public.mission_supports;
create policy mission_supports_select_own on public.mission_supports for select to authenticated using (user_id = auth.uid());

drop policy if exists impact_contributions_select_own on public.impact_contributions;
create policy impact_contributions_select_own on public.impact_contributions for select to authenticated using (user_id = auth.uid());

drop policy if exists user_preferences_select_own on public.user_preferences;
create policy user_preferences_select_own on public.user_preferences for select to authenticated using (user_id = auth.uid());
drop policy if exists user_preferences_insert_own on public.user_preferences;
create policy user_preferences_insert_own on public.user_preferences for insert to authenticated with check (user_id = auth.uid());
drop policy if exists user_preferences_update_own on public.user_preferences;
create policy user_preferences_update_own on public.user_preferences for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists consent_records_select_own on public.consent_records;
create policy consent_records_select_own on public.consent_records for select to authenticated using (user_id = auth.uid());
drop policy if exists consent_records_insert_own on public.consent_records;
create policy consent_records_insert_own on public.consent_records for insert to authenticated with check (user_id = auth.uid());

drop policy if exists privacy_requests_select_own on public.privacy_requests;
create policy privacy_requests_select_own on public.privacy_requests for select to authenticated using (user_id = auth.uid());
drop policy if exists privacy_requests_insert_own on public.privacy_requests;
create policy privacy_requests_insert_own on public.privacy_requests for insert to authenticated with check (user_id = auth.uid());

-- Financial records are provider/server-owned; users get read-only access to their own rows.
drop policy if exists commerce_financial_select_own on public.commerce_financial_records;
create policy commerce_financial_select_own on public.commerce_financial_records for select to authenticated using (user_id = auth.uid());

revoke all on public.stripe_customer_links, public.membership_entitlements, public.mission_supports, public.impact_contributions, public.security_audit_events from anon, authenticated;
grant select on public.stripe_customer_links, public.membership_entitlements, public.mission_supports, public.impact_contributions to authenticated;
revoke all on public.commerce_financial_records from anon, authenticated;
grant select on public.commerce_financial_records to authenticated;

grant select, insert, update on public.profiles, public.user_preferences to authenticated;
grant select, insert on public.consent_records, public.privacy_requests to authenticated;
revoke all on public.profiles, public.user_preferences, public.consent_records, public.privacy_requests from anon;

comment on table public.profiles is 'Minimal ME4PLANET profile. Identity and email remain Supabase Auth-owned.';
comment on table public.stripe_customer_links is 'Server-owned verified mapping between a ME4PLANET user and Stripe Customer.';
comment on table public.impact_contributions is 'Personal contribution chain. Financial state never implies ecological delivery/evidence/outcome.';
comment on table public.consent_records is 'Append-only user consent decisions. Marketing remains separate from service/account processing.';
