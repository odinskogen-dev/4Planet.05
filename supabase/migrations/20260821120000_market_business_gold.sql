-- 4PLANET MARKET — BUSINESS GOLD / COMMERCE DATA PLANE
-- Prepared 2026-08-21. Safe to version before a production Supabase project is selected.
-- Deliberately separate from 4PLANET BRAIN and creator-private finance.
-- No provider secrets belong in these tables.

create schema if not exists market;

create or replace function market.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = market, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists market.creators (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  display_name text not null,
  email text,
  status text not null default 'DRAFT' check (status in ('DRAFT','AGREEMENT_REQUIRED','PROFILE_READY','ACTIVE','PAUSED','ARCHIVED')),
  country_code text not null default 'NO' check (char_length(country_code) = 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market.creator_agreements (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references market.creators(id) on delete cascade,
  agreement_version text not null,
  agreement_state text not null check (agreement_state in ('DRAFT','PRESENTED','ACCEPTED','WITHDRAWN','SUPERSEDED')),
  accepted_at timestamptz,
  accepted_by_auth_user_id uuid,
  terms_hash text not null,
  evidence_note text,
  created_at timestamptz not null default now(),
  unique (creator_id, agreement_version)
);

create table if not exists market.works (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references market.creators(id) on delete restrict,
  title text not null,
  work_type text not null check (work_type in ('PHOTOGRAPH','ARTWORK','ILLUSTRATION','DESIGN')),
  source_asset_ref text not null,
  source_checksum text,
  truth_state text not null default 'UNKNOWN' check (truth_state in ('UNKNOWN','FOUNDER_VERIFIED','CREATOR_VERIFIED','DOCUMENT_VERIFIED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market.rights_grants (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references market.works(id) on delete cascade,
  creator_id uuid not null references market.creators(id) on delete restrict,
  ownership_retained boolean not null default true,
  commerce_display_licence boolean not null default false,
  reproduction_licence boolean not null default false,
  attribution_required boolean not null default true,
  ai_training_permission boolean not null default false,
  territory text not null default 'NO',
  starts_at timestamptz,
  ends_at timestamptz,
  compensation_terms text not null,
  evidence_ref text,
  status text not null default 'DRAFT' check (status in ('DRAFT','ACCEPTED','REVOKED','EXPIRED','SUPERSEDED')),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists market.impact_contracts (
  id uuid primary key default gen_random_uuid(),
  contract_key text not null unique,
  mission_key text,
  public_name text not null,
  provider_key text,
  unit_label text not null,
  unit_cost_minor bigint check (unit_cost_minor is null or unit_cost_minor >= 0),
  currency text not null default 'NOK' check (char_length(currency) = 3),
  allowed_claim text,
  forbidden_claims text,
  evidence_method text,
  refund_rule text,
  double_counting_rule text,
  provenance_ref text,
  provenance_checked_at timestamptz,
  status text not null default 'DRAFT' check (status in ('DRAFT','DILIGENCE','APPROVED','PAUSED','RETIRED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market.products (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references market.creators(id) on delete restrict,
  work_id uuid not null references market.works(id) on delete restrict,
  rights_grant_id uuid not null references market.rights_grants(id) on delete restrict,
  impact_contract_id uuid references market.impact_contracts(id) on delete restrict,
  slug text not null unique,
  title text not null,
  product_type text not null check (product_type in ('FINE_ART_PRINT','ART_PRINT','PHOTO_PRINT')),
  state text not null default 'DRAFT' check (state in ('DRAFT','SUBMITTED','CURATION_PENDING','CHANGES_REQUIRED','APPROVED','PUBLISHED','PAUSED','ARCHIVED')),
  truth_state text not null default 'UNKNOWN' check (truth_state in ('UNKNOWN','DEMO','VERIFIED')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references market.products(id) on delete cascade,
  sku text not null unique,
  provider_key text,
  provider_sku text,
  size_label text not null,
  substrate_label text not null,
  frame_label text,
  currency text not null default 'NOK' check (char_length(currency) = 3),
  customer_price_minor bigint not null check (customer_price_minor > 0),
  expected_production_minor bigint check (expected_production_minor is null or expected_production_minor >= 0),
  expected_shipping_minor bigint check (expected_shipping_minor is null or expected_shipping_minor >= 0),
  expected_creator_minor bigint check (expected_creator_minor is null or expected_creator_minor >= 0),
  expected_impact_minor bigint check (expected_impact_minor is null or expected_impact_minor >= 0),
  expected_fourplanet_minor bigint check (expected_fourplanet_minor is null or expected_fourplanet_minor >= 0),
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market.curation_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references market.products(id) on delete cascade,
  reviewer_ref text not null,
  decision text not null check (decision in ('PENDING','CHANGES_REQUIRED','APPROVED','REJECTED')),
  quality_state text not null default 'UNKNOWN',
  rights_state text not null default 'UNKNOWN',
  print_state text not null default 'UNKNOWN',
  impact_state text not null default 'UNKNOWN',
  notes text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists market.customers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  country_code text not null default 'NO' check (char_length(country_code) = 2),
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market.orders (
  id uuid primary key default gen_random_uuid(),
  public_order_ref text not null unique,
  customer_id uuid not null references market.customers(id) on delete restrict,
  currency text not null default 'NOK' check (char_length(currency) = 3),
  gross_minor bigint not null check (gross_minor >= 0),
  state text not null default 'ORDER_CREATED' check (state in (
    'ORDER_CREATED','PAYMENT_PENDING','PAYMENT_CAPTURED','FULFILMENT_REVIEW','POD_ORDER_SUBMITTED',
    'PRODUCTION_ACCEPTED','SHIPPED','DELIVERED','CREATOR_PAYABLE_CREATED','CREATOR_PAID',
    'IMPACT_LIABILITY_CREATED','IMPACT_FUNDED','IMPACT_EVIDENCE_LINKED','REFUND_PENDING',
    'REFUNDED','REPLACEMENT_PENDING','CANCELLED','TRANSACTION_RECONCILED'
  )),
  stripe_checkout_session_id text unique,
  checkout_idempotency_key text unique,
  live_mode boolean not null default false,
  placed_at timestamptz,
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references market.orders(id) on delete restrict,
  variant_id uuid not null references market.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0 and quantity <= 10),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  production_minor bigint check (production_minor is null or production_minor >= 0),
  shipping_minor bigint check (shipping_minor is null or shipping_minor >= 0),
  creator_minor bigint check (creator_minor is null or creator_minor >= 0),
  impact_minor bigint check (impact_minor is null or impact_minor >= 0),
  fourplanet_minor bigint check (fourplanet_minor is null or fourplanet_minor >= 0),
  created_at timestamptz not null default now()
);

create table if not exists market.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references market.orders(id) on delete restrict,
  provider text not null default 'stripe',
  provider_payment_id text not null,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'NOK' check (char_length(currency) = 3),
  state text not null check (state in ('PENDING','AUTHORISED','CAPTURED','FAILED','PARTIALLY_REFUNDED','REFUNDED','DISPUTED')),
  live_mode boolean not null default false,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_payment_id)
);

create table if not exists market.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references market.orders(id) on delete restrict,
  payment_id uuid references market.payments(id) on delete restrict,
  provider_ref text,
  amount_minor bigint not null check (amount_minor > 0),
  reason text not null,
  state text not null check (state in ('REQUESTED','APPROVED','SUBMITTED','COMPLETED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists market.fulfilments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references market.orders(id) on delete restrict,
  provider text not null,
  provider_order_id text,
  idempotency_key text not null unique,
  state text not null check (state in ('HUMAN_REVIEW','HELD','SUBMITTED','ACCEPTED','IN_PRODUCTION','SHIPPED','DELIVERED','CANCELLED','REPRINT_REQUESTED','REPRINTED','FAILED')),
  tracking_url text,
  tracking_number text,
  submitted_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_order_id)
);

create table if not exists market.creator_payables (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references market.orders(id) on delete restrict,
  creator_id uuid not null references market.creators(id) on delete restrict,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'NOK' check (char_length(currency) = 3),
  state text not null check (state in ('PENDING','PAYABLE','HELD','PAID','REVERSED')),
  source_rule text not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, creator_id)
);

create table if not exists market.impact_liabilities (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references market.orders(id) on delete restrict,
  impact_contract_id uuid not null references market.impact_contracts(id) on delete restrict,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'NOK' check (char_length(currency) = 3),
  state text not null check (state in ('PENDING','LIABILITY_CREATED','FUNDED','EVIDENCE_LINKED','REVERSED','CANCELLED')),
  provider_idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, impact_contract_id)
);

create table if not exists market.impact_events (
  id uuid primary key default gen_random_uuid(),
  liability_id uuid not null references market.impact_liabilities(id) on delete restrict,
  provider text not null,
  provider_event_id text,
  event_type text not null,
  truth_state text not null check (truth_state in ('TEST','PENDING','VERIFIED','REVERSED')),
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table if not exists market.evidence (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references market.orders(id) on delete restrict,
  impact_event_id uuid references market.impact_events(id) on delete restrict,
  evidence_type text not null,
  source_url text,
  source_ref text,
  source_date timestamptz,
  checksum text,
  truth_state text not null check (truth_state in ('PENDING','VERIFIED','REJECTED','SUPERSEDED')),
  created_at timestamptz not null default now(),
  check (order_id is not null or impact_event_id is not null)
);

create table if not exists market.order_state_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references market.orders(id) on delete restrict,
  from_state text,
  to_state text not null,
  actor_type text not null check (actor_type in ('SYSTEM','FOUNDER','CUSTOMER','STRIPE','POD','IMPACT_PROVIDER','SUPPORT')),
  actor_ref text,
  source_event_ref text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists market.webhook_events (
  id bigint generated always as identity primary key,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  object_ref text,
  payload_hash text not null,
  processing_state text not null default 'RECEIVED' check (processing_state in ('RECEIVED','PROCESSING','PROCESSED','IGNORED','FAILED')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_code text,
  unique (provider, provider_event_id)
);

create table if not exists market.consents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references market.customers(id) on delete cascade,
  creator_id uuid references market.creators(id) on delete cascade,
  consent_type text not null,
  consent_version text not null,
  granted boolean not null,
  evidence_ref text,
  created_at timestamptz not null default now(),
  check (customer_id is not null or creator_id is not null)
);

create table if not exists market.email_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references market.orders(id) on delete restrict,
  provider text not null,
  template_key text not null,
  provider_message_id text,
  recipient_hash text not null,
  state text not null check (state in ('QUEUED','SENT','DELIVERED','BOUNCED','COMPLAINED','FAILED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_message_id)
);

create table if not exists market.audit_log (
  id bigint generated always as identity primary key,
  actor_type text not null,
  actor_ref text,
  action text not null,
  object_type text not null,
  object_ref text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_market_products_creator on market.products(creator_id);
create index if not exists idx_market_products_state on market.products(state);
create index if not exists idx_market_orders_customer on market.orders(customer_id, created_at desc);
create index if not exists idx_market_orders_state on market.orders(state, created_at desc);
create index if not exists idx_market_fulfilments_order on market.fulfilments(order_id);
create index if not exists idx_market_payables_creator on market.creator_payables(creator_id, state);
create index if not exists idx_market_impact_order on market.impact_liabilities(order_id, state);
create index if not exists idx_market_state_events_order on market.order_state_events(order_id, created_at);
create index if not exists idx_market_webhook_state on market.webhook_events(provider, processing_state, received_at);

-- Touch timestamps on mutable records.
do $$
declare t text;
begin
  foreach t in array array[
    'creators','works','impact_contracts','products','product_variants','customers','orders',
    'payments','refunds','fulfilments','creator_payables','impact_liabilities','email_events'
  ] loop
    execute format('drop trigger if exists trg_%I_updated_at on market.%I', t, t);
    execute format('create trigger trg_%I_updated_at before update on market.%I for each row execute function market.touch_updated_at()', t, t);
  end loop;
end $$;

-- Default deny. Service-role/server functions may operate; browser clients receive no access unless an explicit policy is added.
alter table market.creators enable row level security;
alter table market.creator_agreements enable row level security;
alter table market.works enable row level security;
alter table market.rights_grants enable row level security;
alter table market.impact_contracts enable row level security;
alter table market.products enable row level security;
alter table market.product_variants enable row level security;
alter table market.curation_reviews enable row level security;
alter table market.customers enable row level security;
alter table market.orders enable row level security;
alter table market.order_items enable row level security;
alter table market.payments enable row level security;
alter table market.refunds enable row level security;
alter table market.fulfilments enable row level security;
alter table market.creator_payables enable row level security;
alter table market.impact_liabilities enable row level security;
alter table market.impact_events enable row level security;
alter table market.evidence enable row level security;
alter table market.order_state_events enable row level security;
alter table market.webhook_events enable row level security;
alter table market.consents enable row level security;
alter table market.email_events enable row level security;
alter table market.audit_log enable row level security;

-- Minimal creator self-read. No private cash/runway data exists here; only Market-generated payables are visible.
create policy creator_self_profile_read on market.creators
  for select to authenticated
  using (auth.uid() = auth_user_id);

create policy creator_self_works_read on market.works
  for select to authenticated
  using (exists (select 1 from market.creators c where c.id = works.creator_id and c.auth_user_id = auth.uid()));

create policy creator_self_products_read on market.products
  for select to authenticated
  using (exists (select 1 from market.creators c where c.id = products.creator_id and c.auth_user_id = auth.uid()));

create policy creator_self_payables_read on market.creator_payables
  for select to authenticated
  using (exists (select 1 from market.creators c where c.id = creator_payables.creator_id and c.auth_user_id = auth.uid()));

comment on schema market is '4PLANET MARKET commerce/customer/transaction plane. Separate from BRAIN and creator-private finance.';
comment on table market.webhook_events is 'Idempotency registry. Store hashes and minimal refs, not raw provider payloads with unnecessary PII.';
comment on table market.creator_payables is 'Marketplace obligation generated by reconciled Market sales; not a creator private bank/runway ledger.';
comment on table market.impact_liabilities is 'Explicit Impact funding obligation; creation/funding/evidence remain separate states.';
