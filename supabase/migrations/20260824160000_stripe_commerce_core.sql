-- 4PLANET Stripe commerce core — financial truth only.
-- This schema must never be used to infer ecological Delivery, Evidence, Outcome or System Impact.

create table if not exists public.commerce_events (
  stripe_event_id text primary key,
  environment text not null check (environment in ('TEST','LIVE')),
  event_type text not null,
  stripe_object_id text,
  stripe_object_type text,
  product_key text,
  product_family text,
  financial_state text not null,
  occurred_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

create index if not exists commerce_events_object_idx on public.commerce_events (stripe_object_id);
create index if not exists commerce_events_product_idx on public.commerce_events (product_key, occurred_at desc);
create index if not exists commerce_events_state_idx on public.commerce_events (financial_state, occurred_at desc);

create table if not exists public.commerce_financial_records (
  stripe_object_id text primary key,
  stripe_object_type text not null,
  environment text not null check (environment in ('TEST','LIVE')),
  product_key text,
  product_kind text,
  product_family text,
  customer_id text,
  subscription_id text,
  invoice_id text,
  payment_intent_id text,
  currency text,
  amount_minor bigint,
  financial_state text not null,
  mission text,
  mission_slug text,
  reference_key text,
  ecological_delivery_authority text not null default 'none' check (ecological_delivery_authority = 'none'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commerce_financial_customer_idx on public.commerce_financial_records (customer_id);
create index if not exists commerce_financial_subscription_idx on public.commerce_financial_records (subscription_id);
create index if not exists commerce_financial_product_idx on public.commerce_financial_records (product_key, updated_at desc);
create index if not exists commerce_financial_reference_idx on public.commerce_financial_records (reference_key, updated_at desc);

alter table public.commerce_events enable row level security;
alter table public.commerce_financial_records enable row level security;

-- No browser policy is created. Only trusted server/service-role access is intended.
revoke all on table public.commerce_events from anon, authenticated;
revoke all on table public.commerce_financial_records from anon, authenticated;

comment on table public.commerce_events is 'Append-only Stripe financial event truth. Never ecological delivery/outcome truth.';
comment on table public.commerce_financial_records is 'Latest Stripe financial object state. Ecological delivery authority is structurally fixed to none.';
