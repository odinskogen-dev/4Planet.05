-- 4SAPIEN PRODUCT OBSERVABILITY v1.1
-- Adds canonical Finance Twin use as a meaningful activation signal.
-- Derived views only; no copied truth data.

drop view if exists public.four_sapien_product_kpis_28d_v1;
drop view if exists public.four_sapien_product_usage_daily_v1;

create view public.four_sapien_product_usage_daily_v1
with (security_invoker = true)
as
select
  user_id,
  occurred_at::date as usage_date,
  count(*)::bigint as event_count,
  count(*) filter (
    where event_type in (
      'embla_turn_completed',
      'brain_grounded_answer',
      'brain_context_added',
      'note_created',
      'note_updated',
      'finance_twin_viewed'
    )
    or (
      event_type = 'food_product_search_completed'
      and coalesce(nullif(payload->>'result_count','')::integer,0) > 0
    )
  )::bigint as meaningful_use,
  bool_or(
    event_type in (
      'embla_turn_completed',
      'brain_grounded_answer',
      'brain_context_added',
      'note_created',
      'finance_twin_viewed'
    )
    or (
      event_type = 'food_product_search_completed'
      and coalesce(nullif(payload->>'result_count','')::integer,0) > 0
    )
  ) as activated,
  count(*) filter (
    where event_type in (
      'embla_turn_failed',
      'brain_request_failed',
      'food_product_search_failed'
    )
  )::bigint as runtime_failures,
  count(*) filter (
    where event_type in (
      'embla_turn_completed',
      'brain_grounded_answer',
      'food_product_search_completed'
    )
  )::bigint as runtime_successes,
  bool_or(event_type = 'embla_turn_completed') as embla_success,
  bool_or(event_type = 'brain_grounded_answer') as brain_grounded_answer,
  bool_or(
    event_type = 'food_product_search_completed'
    and coalesce(nullif(payload->>'result_count','')::integer,0) > 0
  ) as food_value,
  bool_or(event_type in ('finance_opened','finance_twin_viewed')) as finance_used
from public.four_sapien_embla_events
group by user_id, occurred_at::date;

create view public.four_sapien_product_kpis_28d_v1
with (security_invoker = true)
as
with daily as (
  select *
  from public.four_sapien_product_usage_daily_v1
  where usage_date >= current_date - 27
), user_days as (
  select
    user_id,
    count(*)::integer as active_days,
    bool_or(activated) as activated,
    sum(meaningful_use)::bigint as meaningful_use,
    sum(runtime_failures)::bigint as runtime_failures,
    sum(runtime_successes)::bigint as runtime_successes
  from daily
  group by user_id
)
select
  current_date as as_of_date,
  count(*)::bigint as active_users_28d,
  count(*) filter (where active_days >= 2)::bigint as repeat_users_28d,
  count(*) filter (where activated)::bigint as activated_users_28d,
  coalesce(sum(meaningful_use),0)::bigint as meaningful_use_28d,
  coalesce(sum(runtime_successes),0)::bigint as runtime_successes_28d,
  coalesce(sum(runtime_failures),0)::bigint as runtime_failures_28d,
  case
    when coalesce(sum(runtime_successes),0) + coalesce(sum(runtime_failures),0) = 0 then null
    else round(
      coalesce(sum(runtime_failures),0)::numeric
      / (coalesce(sum(runtime_successes),0) + coalesce(sum(runtime_failures),0))::numeric,
      4
    )
  end as runtime_failure_rate_28d
from user_days;

revoke all on public.four_sapien_product_usage_daily_v1 from anon;
revoke all on public.four_sapien_product_kpis_28d_v1 from anon;
grant select on public.four_sapien_product_usage_daily_v1 to authenticated, service_role;
grant select on public.four_sapien_product_kpis_28d_v1 to authenticated, service_role;
