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
  provider_event_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists commerce_financial_customer_idx on public.commerce_financial_records (customer_id);
create index if not exists commerce_financial_subscription_idx on public.commerce_financial_records (subscription_id);
create index if not exists commerce_financial_product_idx on public.commerce_financial_records (product_key, updated_at desc);
create index if not exists commerce_financial_reference_idx on public.commerce_financial_records (reference_key, updated_at desc);

-- Stripe may retry and deliver events out of order. This function makes the event ledger append/idempotent
-- while allowing the latest-state projection to move only forward in provider event time.
create or replace function public.apply_commerce_financial_record_event(
  p_stripe_object_id text,
  p_stripe_object_type text,
  p_environment text,
  p_product_key text,
  p_product_kind text,
  p_product_family text,
  p_customer_id text,
  p_subscription_id text,
  p_invoice_id text,
  p_payment_intent_id text,
  p_currency text,
  p_amount_minor bigint,
  p_financial_state text,
  p_mission text,
  p_mission_slug text,
  p_reference_key text,
  p_provider_event_created_at timestamptz
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.commerce_financial_records (
    stripe_object_id, stripe_object_type, environment, product_key, product_kind, product_family,
    customer_id, subscription_id, invoice_id, payment_intent_id, currency, amount_minor, financial_state,
    mission, mission_slug, reference_key, ecological_delivery_authority, provider_event_created_at, updated_at
  ) values (
    p_stripe_object_id, p_stripe_object_type, p_environment, p_product_key, p_product_kind, p_product_family,
    p_customer_id, p_subscription_id, p_invoice_id, p_payment_intent_id, p_currency, p_amount_minor, p_financial_state,
    p_mission, p_mission_slug, p_reference_key, 'none', p_provider_event_created_at, now()
  )
  on conflict (stripe_object_id) do update set
    stripe_object_type = excluded.stripe_object_type,
    environment = excluded.environment,
    product_key = coalesce(excluded.product_key, commerce_financial_records.product_key),
    product_kind = coalesce(excluded.product_kind, commerce_financial_records.product_kind),
    product_family = coalesce(excluded.product_family, commerce_financial_records.product_family),
    customer_id = coalesce(excluded.customer_id, commerce_financial_records.customer_id),
    subscription_id = coalesce(excluded.subscription_id, commerce_financial_records.subscription_id),
    invoice_id = coalesce(excluded.invoice_id, commerce_financial_records.invoice_id),
    payment_intent_id = coalesce(excluded.payment_intent_id, commerce_financial_records.payment_intent_id),
    currency = coalesce(excluded.currency, commerce_financial_records.currency),
    amount_minor = coalesce(excluded.amount_minor, commerce_financial_records.amount_minor),
    financial_state = excluded.financial_state,
    mission = coalesce(excluded.mission, commerce_financial_records.mission),
    mission_slug = coalesce(excluded.mission_slug, commerce_financial_records.mission_slug),
    reference_key = coalesce(excluded.reference_key, commerce_financial_records.reference_key),
    ecological_delivery_authority = 'none',
    provider_event_created_at = excluded.provider_event_created_at,
    updated_at = now()
  where commerce_financial_records.provider_event_created_at is null
     or excluded.provider_event_created_at >= commerce_financial_records.provider_event_created_at;
  return true;
end;
$$;

alter table public.commerce_events enable row level security;
alter table public.commerce_financial_records enable row level security;
revoke all on table public.commerce_events from anon, authenticated;
revoke all on table public.commerce_financial_records from anon, authenticated;
revoke all on function public.apply_commerce_financial_record_event(text,text,text,text,text,text,text,text,text,text,text,bigint,text,text,text,text,timestamptz) from public, anon, authenticated;
grant execute on function public.apply_commerce_financial_record_event(text,text,text,text,text,text,text,text,text,text,text,bigint,text,text,text,text,timestamptz) to service_role;
comment on table public.commerce_events is 'Append-only Stripe financial event truth. Never ecological delivery/outcome truth.';
comment on table public.commerce_financial_records is 'Latest Stripe financial object state, ordered by provider event time. Ecological delivery authority is structurally fixed to none.';
