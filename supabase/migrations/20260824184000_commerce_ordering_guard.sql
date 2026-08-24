-- Atomic stale-event guard for Stripe financial projection.
-- Event ledger remains idempotent by stripe_event_id; this function protects the latest-state projection.

create or replace function public.apply_commerce_financial_record(
  p_stripe_object_id text,
  p_stripe_object_type text,
  p_environment text,
  p_product_key text,
  p_product_kind text,
  p_product_family text,
  p_user_id uuid,
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
  p_provider_event_created_at timestamptz,
  p_updated_at timestamptz
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.commerce_financial_records (
    stripe_object_id, stripe_object_type, environment, product_key, product_kind, product_family,
    user_id, customer_id, subscription_id, invoice_id, payment_intent_id, currency, amount_minor,
    financial_state, mission, mission_slug, reference_key, ecological_delivery_authority,
    provider_event_created_at, updated_at
  ) values (
    p_stripe_object_id, p_stripe_object_type, p_environment, p_product_key, p_product_kind, p_product_family,
    p_user_id, p_customer_id, p_subscription_id, p_invoice_id, p_payment_intent_id, p_currency, p_amount_minor,
    p_financial_state, p_mission, p_mission_slug, p_reference_key, 'none',
    p_provider_event_created_at, p_updated_at
  )
  on conflict (stripe_object_id) do update set
    stripe_object_type = excluded.stripe_object_type,
    environment = excluded.environment,
    product_key = coalesce(excluded.product_key, commerce_financial_records.product_key),
    product_kind = coalesce(excluded.product_kind, commerce_financial_records.product_kind),
    product_family = coalesce(excluded.product_family, commerce_financial_records.product_family),
    user_id = coalesce(excluded.user_id, commerce_financial_records.user_id),
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
    updated_at = excluded.updated_at
  where commerce_financial_records.provider_event_created_at is null
     or excluded.provider_event_created_at >= commerce_financial_records.provider_event_created_at;
end;
$$;

revoke all on function public.apply_commerce_financial_record(text,text,text,text,text,text,uuid,text,text,text,text,text,bigint,text,text,text,text,timestamptz,timestamptz) from public, anon, authenticated;
grant execute on function public.apply_commerce_financial_record(text,text,text,text,text,text,uuid,text,text,text,text,text,bigint,text,text,text,text,timestamptz,timestamptz) to service_role;

comment on function public.apply_commerce_financial_record is 'Atomic Stripe latest-state projection. Older provider events cannot overwrite newer state.';
