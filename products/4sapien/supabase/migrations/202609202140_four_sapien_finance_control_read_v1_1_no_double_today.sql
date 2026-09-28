-- Correct one-off actual dated today vs future cashflow; preserve prior additive migration.
-- 4SAPIEN REAL DATA 03
-- A read-only, RLS-scoped Finance Twin projection for Claude's Money Now / Until Payday.
-- No new ledger, copied cash balances, forecasts, source store, actor mixing or writes.
create or replace function public.four_sapien_finance_control_read(p_days integer default 30)
returns jsonb language plpgsql stable security invoker set search_path=public as $fn$
declare
  v_uid uuid:=auth.uid();
  v_twin jsonb;
  v_liquidity bigint;
  v_asof date;
  v_stale_count integer;
  v_unknown_count integer;
  v_not_seen_count integer;
  v_pending_count integer;
  v_income jsonb;
  v_due jsonb;
  v_overdue jsonb;
  v_next_income date;
  v_known_outgoings bigint;
  v_recurring_outgoings bigint;
  v_anticipated_balance bigint;
  v_status text;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED'); end if;
  if p_days not between 1 and 30 then raise exception 'HORIZON_OUT_OF_RANGE'; end if;
  v_twin:=public.four_sapien_finance_twin(extract(year from current_date)::integer);
  if v_twin->>'state'<>'AVAILABLE' then
    return jsonb_build_object('state','TWIN_UNAVAILABLE','twin_state',v_twin->>'state');
  end if;
  v_liquidity:=(v_twin->'liquidity'->>'amount')::bigint;
  select min(a.as_of),count(*) filter(where a.as_of<current_date-7),
    count(*) filter(where a.balance is null),count(*)
  into v_asof,v_stale_count,v_unknown_count,v_not_seen_count
  from public.four_sapien_finance_accounts a
  where a.user_id=v_uid and a.archived_at is null and a.kind in ('bank','cash')
    and not (lower(a.source) in ('import','imported')
      and lower(a.truth) not in ('confirmed','user_confirmed','source_verified')
      and coalesce((a.meta->>'confirmed')::boolean,false)=false);
  select count(*) into v_pending_count
  from public.four_sapien_finance_import_batches b
  where b.user_id=v_uid and b.status='review' and (b.matched>0 or coalesce((b.meta->>'review_required')::integer,0)>0);
  v_status:=case
    when v_liquidity is null or v_not_seen_count=0 or v_unknown_count>0 then 'UNKNOWN'
    when v_stale_count>0 then 'STALE'
    else 'KNOWN_RECORDED' end;
  -- The next occurrence helper belongs to the canonical Finance Twin runtime.
  -- Two anchors retain both monthly occurrences in a 30-day window (e.g. Feb 1 + Mar 1).
  with eligible as (
    select e.* from public.four_sapien_finance_events e
    where e.user_id=v_uid and e.state in ('active','upcoming')
      and e.type in ('income','bill','spend')
      and e.currency='NOK'
      and not (lower(e.source) in ('import','imported')
        and lower(e.truth) not in ('confirmed','user_confirmed','source_verified')
        and coalesce((e.meta->>'confirmed')::boolean,false)=false)
      and not (e.meta->>'payment_state'='PAID' and e.type='bill')
      -- One-off spend/income already dated today is NOT an upcoming cash movement.
      -- Bills remain future obligations until payment is explicitly confirmed.
      and (e.recurring<>'once'
        or (e.type='bill' and e.occurred_on>=current_date)
        or (e.type in ('income','spend') and e.occurred_on>current_date))
  ), occurrences as (
    select e.id,e.name,e.type,e.amount,e.recurring,e.truth,e.doc_path,
           e.meta,e.source,e.occurred_on,e.state,
           public.four_sapien_finance_next_occurrence(e.occurred_on,e.recurring,current_date) as due_date
    from eligible e
    union all
    select e.id,e.name,e.type,e.amount,e.recurring,e.truth,e.doc_path,
           e.meta,e.source,e.occurred_on,e.state,
           public.four_sapien_finance_next_occurrence(e.occurred_on,e.recurring,(current_date+interval '1 month')::date) as due_date
    from eligible e where e.recurring='monthly'
  ), upcoming as (
    select distinct on (id,due_date) id,name,type,abs(amount)::bigint amount,recurring,truth,
           (doc_path is not null) as has_document,due_date,meta
    from occurrences
    where due_date between current_date and current_date+p_days
    order by id,due_date
  ) select
      coalesce(jsonb_agg(jsonb_build_object('event_id',id,'name',name,'amount',amount,
        'due_date',due_date,'recurring',recurring,
        'truth',case when recurring='once' then 'USER_DATED_NOT_PAYMENT_PROOF' else 'SCHEDULED_MODELLED' end,
        'has_document',has_document,
        'document_kind',meta->>'document_kind') order by due_date,name)
        filter(where type='income'),'[]'::jsonb),
      coalesce(jsonb_agg(jsonb_build_object('event_id',id,'name',name,'amount',amount,
        'due_date',due_date,'recurring',recurring,
        'truth',case when recurring='once' then 'USER_DATED_NOT_PAYMENT_PROOF' else 'SCHEDULED_MODELLED' end,
        'has_document',has_document,
        'document_kind',meta->>'document_kind') order by due_date,name)
        filter(where type in ('bill','spend')),'[]'::jsonb),
      min(due_date) filter(where type='income'),
      coalesce(sum(amount) filter(where type in ('bill','spend')),0)::bigint,
      coalesce(sum(amount) filter(where type in ('bill','spend') and recurring<>'once'),0)::bigint
    into v_income,v_due,v_next_income,v_known_outgoings,v_recurring_outgoings
    from upcoming;
  select coalesce(jsonb_agg(jsonb_build_object(
    'event_id',id,'name',name,'amount',abs(amount),
    'due_date',occurred_on,'payment_state','NOT_CONFIRMED_PAID',
    'has_document',doc_path is not null) order by occurred_on),'[]'::jsonb)
  into v_overdue from public.four_sapien_finance_events e
  where e.user_id=v_uid and e.type='bill' and e.state in ('active','upcoming')
    and e.recurring='once' and e.occurred_on<current_date and e.currency='NOK'
    and e.meta->>'payment_state' in ('NOT_MARKED_PAID','UNPAID')
    and not (lower(e.source) in ('import','imported')
      and lower(e.truth) not in ('confirmed','user_confirmed','source_verified')
      and coalesce((e.meta->>'confirmed')::boolean,false)=false);
  v_anticipated_balance:=case when v_status='KNOWN_RECORDED'
    then v_liquidity-v_known_outgoings else null end;
  return jsonb_build_object(
    'state','AVAILABLE','actor_type','PERSON','as_of',current_date,'horizon_days',p_days,
    'money_now',jsonb_build_object(
      'state',v_status,'amount',case when v_status='KNOWN_RECORDED' then v_liquidity else null end,
      'last_recorded_amount',v_liquidity,
      'oldest_account_as_of',v_asof,'stale_account_count',v_stale_count,
      'unknown_balance_count',v_unknown_count,
      'included_account_count',v_not_seen_count,
      'reserved','UNKNOWN','restricted','UNKNOWN','available_after_reserves','UNKNOWN',
      'definition','Twin bank+cash snapshot; no live bank feed; no implied available-after-reserves'),
    'next_income_date',v_next_income,
    'expected_income',v_income,
    'scheduled_outgoings',v_due,
    'overdue_unconfirmed',v_overdue,
    'before_next_income',jsonb_build_object(
      'state',case when v_next_income is null then 'NEXT_INCOME_UNKNOWN'
        when v_status<>'KNOWN_RECORDED' then v_status
        else 'MODELLED_NOT_AVAILABLE_CASH' end,
      'projected_without_income',case when v_status='KNOWN_RECORDED' then
        v_liquidity-coalesce((select sum((x->>'amount')::bigint)
          from jsonb_array_elements(v_due) x
          where (x->>'due_date')::date<v_next_income),0)::bigint else null end,
      'next_income_date',v_next_income),
    'until_horizon',jsonb_build_object(
      'projected_without_income',v_anticipated_balance,'scheduled_outgoings',v_known_outgoings,
      'of_which_recurring_modelled',v_recurring_outgoings,'truth','MODELLED_NOT_BANK_BALANCE'),
    'data_quality',jsonb_build_object(
      'pending_csv_review_batches',v_pending_count,'has_bank_connection',false,
      'last_bank_sync',null,'unknown_is_zero',false,
      'no_duplicate_bank_import_claim',false,'sources','USER_RECORDED_AND_USER_CONFIRMED',
      'twins_liquidity_state',v_twin->'liquidity'->>'state'),
    'finance_twin_version','FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1'
  );
end
$fn$;
revoke all on function public.four_sapien_finance_control_read(integer) from public,anon;
grant execute on function public.four_sapien_finance_control_read(integer) to authenticated,service_role;
