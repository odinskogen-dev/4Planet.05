-- 4SAPIEN DOCUMENT INTELLIGENCE 01: existing event views, no new analytics truth store.
-- Doc confirmation is meaningful use; failures surface in existing runtime health.
create or replace view public.four_sapien_product_usage_daily_v1
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
      'finance_twin_viewed',
      'finance_document_confirmed'
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
      'finance_twin_viewed',
      'finance_document_confirmed'
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
      'food_product_search_failed',
      'finance_document_failed'
    )
  )::bigint as runtime_failures,
  count(*) filter (
    where event_type in (
      'embla_turn_completed',
      'brain_grounded_answer',
      'food_product_search_completed',
      'finance_document_confirmed'
    )
  )::bigint as runtime_successes,
  bool_or(event_type = 'embla_turn_completed') as embla_success,
  bool_or(event_type = 'brain_grounded_answer') as brain_grounded_answer,
  bool_or(
    event_type = 'food_product_search_completed'
    and coalesce(nullif(payload->>'result_count','')::integer,0) > 0
  ) as food_value,
  bool_or(event_type in ('finance_opened','finance_twin_viewed','finance_document_confirmed')) as finance_used
from public.four_sapien_embla_events
group by user_id, occurred_at::date;

