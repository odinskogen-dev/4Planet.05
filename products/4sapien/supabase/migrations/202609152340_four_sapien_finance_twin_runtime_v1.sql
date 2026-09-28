-- 4SAPIEN Finance Twin Runtime v1
-- Applied to canonical Supabase project ghvdzetmplqkdtfqiror on 2026-09-15.
-- Additive/reversible runtime seam. No existing user rows are rewritten.

alter table public.four_sapien_finance_accounts
  add column if not exists truth text not null default 'user',
  add column if not exists meta jsonb not null default '{}'::jsonb,
  add column if not exists confirmed_at timestamptz;

create or replace function public.four_sapien_calculate_liquidity()
returns table(currency text, liquidity bigint, account_count bigint)
language sql
stable
set search_path to 'public'
as $function$
  with x as (
    select count(*)::bigint as account_count,
           sum(balance)::bigint as liquidity
    from public.four_sapien_finance_accounts
    where user_id=(select auth.uid())
      and kind in ('bank','cash')
  )
  select 'NOK'::text,
         case when account_count=0 then null::bigint else liquidity end,
         account_count
  from x;
$function$;

create or replace function public.four_sapien_finance_monthly_timeline(p_year integer default extract(year from current_date)::integer)
returns jsonb
language plpgsql
stable
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_month integer; v_start date; v_end date; v_status text;
  v_actual_income bigint; v_actual_expense bigint;
  v_forecast_income bigint; v_forecast_expense bigint;
  v_unresolved_income bigint; v_unresolved_expense bigint;
  v_imported_pending_income bigint; v_imported_pending_expense bigint;
  v_months jsonb := '[]'::jsonb;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED','year',p_year,'months','[]'::jsonb); end if;
  if p_year < 2000 or p_year > 2100 then raise exception 'YEAR_OUT_OF_RANGE'; end if;

  for v_month in 1..12 loop
    v_start := make_date(p_year,v_month,1);
    v_end := (v_start + interval '1 month - 1 day')::date;
    v_status := case
      when v_end < date_trunc('month',current_date)::date then 'ACTUAL_PERIOD'
      when v_start > date_trunc('month',current_date)::date then 'FORECAST_PERIOD'
      else 'MIXED_CURRENT_MONTH' end;

    select coalesce(sum(case when type='income' then abs(amount)::bigint else 0 end),0),
           coalesce(sum(case when type in ('spend','bill') then abs(amount)::bigint else 0 end),0)
      into v_actual_income,v_actual_expense
    from public.four_sapien_finance_events
    where user_id=v_uid and state='active' and recurring='once'
      and occurred_on between v_start and least(v_end,current_date)
      and not (lower(source) in ('import','imported')
        and lower(truth) not in ('confirmed','user_confirmed','source_verified')
        and coalesce((meta->>'confirmed')::boolean,false)=false);

    select coalesce(sum(case when type='income' then abs(amount)::bigint else 0 end),0),
           coalesce(sum(case when type in ('spend','bill') then abs(amount)::bigint else 0 end),0)
      into v_imported_pending_income,v_imported_pending_expense
    from public.four_sapien_finance_events
    where user_id=v_uid and state='active' and recurring='once'
      and occurred_on between v_start and v_end
      and lower(source) in ('import','imported')
      and lower(truth) not in ('confirmed','user_confirmed','source_verified')
      and coalesce((meta->>'confirmed')::boolean,false)=false;

    with recurring_occurrences as (
      select e.*,
        case
          when e.recurring='monthly' and v_start >= date_trunc('month',e.occurred_on)::date then
            (v_start + (least(extract(day from e.occurred_on)::int, extract(day from v_end)::int)-1) * interval '1 day')::date
          when e.recurring='yearly' and extract(month from e.occurred_on)::int=v_month
               and p_year >= extract(year from e.occurred_on)::int then
            make_date(p_year,v_month,least(extract(day from e.occurred_on)::int,extract(day from v_end)::int))
          else null::date end as occurrence_date
      from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state='active' and e.recurring in ('monthly','yearly')
        and e.type in ('income','spend','bill')
    ), future_once as (
      select type,abs(amount)::bigint as amount,occurred_on as occurrence_date
      from public.four_sapien_finance_events
      where user_id=v_uid and state='active' and recurring='once'
        and type in ('income','spend','bill')
        and occurred_on between greatest(v_start,current_date + 1) and v_end
    ), all_future as (
      select type,abs(amount)::bigint as amount,occurrence_date from recurring_occurrences
      where occurrence_date between greatest(v_start,current_date + 1) and v_end
      union all select * from future_once
    )
    select coalesce(sum(case when type='income' then amount else 0 end),0),
           coalesce(sum(case when type in ('spend','bill') then amount else 0 end),0)
      into v_forecast_income,v_forecast_expense from all_future;

    with recurring_occurrences as (
      select e.*,
        case
          when e.recurring='monthly' and v_start >= date_trunc('month',e.occurred_on)::date then
            (v_start + (least(extract(day from e.occurred_on)::int, extract(day from v_end)::int)-1) * interval '1 day')::date
          when e.recurring='yearly' and extract(month from e.occurred_on)::int=v_month
               and p_year >= extract(year from e.occurred_on)::int then
            make_date(p_year,v_month,least(extract(day from e.occurred_on)::int,extract(day from v_end)::int))
          else null::date end as occurrence_date
      from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state='active' and e.recurring in ('monthly','yearly')
        and e.type in ('income','spend','bill')
    )
    select coalesce(sum(case when type='income' then abs(amount)::bigint else 0 end),0),
           coalesce(sum(case when type in ('spend','bill') then abs(amount)::bigint else 0 end),0)
      into v_unresolved_income,v_unresolved_expense
    from recurring_occurrences
    where occurrence_date between v_start and least(v_end,current_date);

    v_months := v_months || jsonb_build_array(jsonb_build_object(
      'month',v_month,'month_key',to_char(v_start,'YYYY-MM'),'period_state',v_status,
      'actual',jsonb_build_object('income',v_actual_income,'expense',v_actual_expense,'net',v_actual_income-v_actual_expense,'truth','ACTUAL_CONFIRMED_OR_USER_DATED'),
      'forecast',jsonb_build_object('income',v_forecast_income,'expense',v_forecast_expense,'net',v_forecast_income-v_forecast_expense,'truth','FORECAST'),
      'scheduled_unconfirmed',jsonb_build_object('income',v_unresolved_income,'expense',v_unresolved_expense,'truth','SCHEDULED_NOT_CONFIRMED'),
      'imported_unconfirmed',jsonb_build_object('income',v_imported_pending_income,'expense',v_imported_pending_expense,'truth','IMPORTED_NOT_CONFIRMED'),
      'projected_net',case when v_status='ACTUAL_PERIOD' then v_actual_income-v_actual_expense else (v_actual_income+v_forecast_income)-(v_actual_expense+v_forecast_expense) end));
  end loop;

  return jsonb_build_object('state','AVAILABLE','year',p_year,'currency','NOK','months',v_months,
    'rules',jsonb_build_object('past','actual_only; recurring templates remain scheduled_unconfirmed until confirmed','current','actual + remaining future forecast, with past recurring templates separate','future','forecast','imported','never actual until confirmed'));
end;
$function$;

create or replace function public.four_sapien_finance_twin(p_year integer default extract(year from current_date)::integer)
returns jsonb
language plpgsql
stable
set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid(); v_account_count bigint; v_liquid_count bigint; v_liquidity bigint;
  v_account_assets bigint; v_event_assets bigint; v_debts bigint; v_assets bigint; v_net_worth bigint;
  v_recurring_expense bigint; v_freedom numeric; v_accounts jsonb; v_timeline jsonb; v_review_count bigint;
  v_ytd_income bigint; v_ytd_expense bigint;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED'); end if;

  select count(*),count(*) filter(where kind in ('bank','cash')),
         case when count(*) filter(where kind in ('bank','cash'))=0 then null::bigint else sum(balance) filter(where kind in ('bank','cash'))::bigint end,
         coalesce(sum(case when kind in ('bank','cash','investment','asset','property') then greatest(balance,0) else 0 end),0)::bigint,
         coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'kind',kind,'balance',balance,'as_of',as_of,'source',source,'truth',truth,'liquidity_eligible',kind in ('bank','cash'),'balance_sheet_role',case when kind in ('debt','loan','credit') or balance<0 then 'LIABILITY' else 'ASSET' end) order by created_at),'[]'::jsonb)
    into v_account_count,v_liquid_count,v_liquidity,v_account_assets,v_accounts
  from public.four_sapien_finance_accounts where user_id=v_uid;

  select coalesce(sum(abs(amount)) filter(where type='asset'),0)::bigint,
         coalesce(sum(abs(amount)) filter(where type='debt'),0)::bigint
    into v_event_assets,v_debts
  from public.four_sapien_finance_events where user_id=v_uid and state='active';

  v_assets := v_account_assets + v_event_assets;
  v_net_worth := case when v_account_count=0 and v_event_assets=0 and v_debts=0 then null else v_assets-v_debts end;
  select coalesce(sum(abs(amount)) filter(where type in ('spend','bill') and recurring='monthly'),0)::bigint into v_recurring_expense from public.four_sapien_finance_events where user_id=v_uid and state='active';
  v_freedom := case when v_liquidity is null or v_recurring_expense<=0 then null else round(v_liquidity::numeric / v_recurring_expense::numeric,1) end;

  v_timeline := public.four_sapien_finance_monthly_timeline(p_year);
  select coalesce(sum((m->'actual'->>'income')::bigint),0),coalesce(sum((m->'actual'->>'expense')::bigint),0)
    into v_ytd_income,v_ytd_expense
  from jsonb_array_elements(v_timeline->'months') m
  where (m->>'month')::int <= extract(month from current_date)::int and p_year=extract(year from current_date)::int;

  select count(*) into v_review_count from public.four_sapien_finance_events
  where user_id=v_uid and state='active' and ((type in ('asset','debt') and lower(coalesce(category,'')) in ('mat','food','groceries','grocery','strøm','transport','abonnement')) or (type='income' and lower(coalesce(category,'')) in ('mat','food','groceries','grocery','strøm','transport','abonnement','forsikring')));

  return jsonb_build_object(
    'state','AVAILABLE','currency','NOK','year',p_year,
    'truth_rules',jsonb_build_object('unknown_is_zero',false,'actual_is_forecast',false,'imported_is_confirmed',false,'asset_value_is_liquidity',false),
    'liquidity',jsonb_build_object('state',case when v_liquid_count=0 then 'UNKNOWN_NO_LIQUID_ACCOUNTS' else 'AVAILABLE' end,'amount',v_liquidity,'account_count',v_liquid_count,'truth',case when v_liquid_count=0 then 'UNKNOWN' else 'CALCULATED' end,'definition','bank+cash only; investments/assets excluded'),
    'accounts',v_accounts,
    'quadrants',jsonb_build_object('income',jsonb_build_object('amount',v_ytd_income,'period','YTD_ACTUAL','truth','ACTUAL'),'expense',jsonb_build_object('amount',v_ytd_expense,'period','YTD_ACTUAL','truth','ACTUAL'),'assets',jsonb_build_object('amount',v_assets,'truth','USER_INPUT_OR_CONFIRMED_VALUE','liquid',false),'debt',jsonb_build_object('amount',v_debts,'truth','USER_INPUT_OR_CONFIRMED_VALUE','liquid',false)),
    'net_worth',jsonb_build_object('amount',v_net_worth,'truth',case when v_net_worth is null then 'UNKNOWN' else 'CALCULATED_FROM_RECORDED_VALUES' end),
    'freedom_months',jsonb_build_object('amount',v_freedom,'state',case when v_liquidity is null then 'UNKNOWN_LIQUIDITY' when v_recurring_expense<=0 then 'UNKNOWN_EXPENSE_BASELINE' else 'MODELLED' end,'truth',case when v_freedom is null then 'UNKNOWN' else 'MODELLED' end,'basis',case when v_freedom is null then null else 'liquidity / recorded monthly recurring expenses' end),
    'timeline',v_timeline,
    'data_quality',jsonb_build_object('category_review_count',v_review_count,'category_review_state',case when v_review_count>0 then 'REVIEW_RECOMMENDED' else 'OK' end,'auto_reclassified',false));
end;
$function$;

create or replace function public.four_sapien_finance_save_event(p_event_id uuid, p_patch jsonb)
returns jsonb language plpgsql volatile set search_path to 'public'
as $function$
declare v_uid uuid := auth.uid(); v_row public.four_sapien_finance_events%rowtype; v_type text; v_recurring text;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_patch is null or jsonb_typeof(p_patch)<>'object' then raise exception 'INVALID_PATCH'; end if;
  v_type := coalesce(nullif(p_patch->>'type',''),'spend'); v_recurring := coalesce(nullif(p_patch->>'recurring',''),'once');
  if v_type not in ('income','spend','bill','transfer','asset','debt') then raise exception 'INVALID_EVENT_TYPE'; end if;
  if v_recurring not in ('once','monthly','yearly') then raise exception 'INVALID_RECURRENCE'; end if;
  if p_event_id is null then
    if nullif(trim(p_patch->>'name'),'') is null then raise exception 'NAME_REQUIRED'; end if;
    if not (p_patch ? 'amount') then raise exception 'AMOUNT_REQUIRED'; end if;
    insert into public.four_sapien_finance_events(user_id,type,amount,currency,category,name,occurred_on,recurring,from_account,to_account,buy_price,plan_amount,state,source,truth,meta)
    values(v_uid,v_type,(p_patch->>'amount')::integer,coalesce(nullif(p_patch->>'currency',''),'NOK'),p_patch->>'category',trim(p_patch->>'name'),coalesce((p_patch->>'occurred_on')::date,current_date),v_recurring,nullif(p_patch->>'from_account','')::uuid,nullif(p_patch->>'to_account','')::uuid,nullif(p_patch->>'buy_price','')::integer,nullif(p_patch->>'plan_amount','')::integer,coalesce(nullif(p_patch->>'state',''),'active'),coalesce(nullif(p_patch->>'source',''),'manual'),coalesce(nullif(p_patch->>'truth',''),'user'),coalesce(p_patch->'meta','{}'::jsonb)) returning * into v_row;
  else
    update public.four_sapien_finance_events e set
      name=case when p_patch ? 'name' then trim(p_patch->>'name') else e.name end,
      amount=case when p_patch ? 'amount' then (p_patch->>'amount')::integer else e.amount end,
      type=case when p_patch ? 'type' then v_type else e.type end,
      currency=case when p_patch ? 'currency' then coalesce(nullif(p_patch->>'currency',''),'NOK') else e.currency end,
      category=case when p_patch ? 'category' then nullif(p_patch->>'category','') else e.category end,
      occurred_on=case when p_patch ? 'occurred_on' then (p_patch->>'occurred_on')::date else e.occurred_on end,
      recurring=case when p_patch ? 'recurring' then v_recurring else e.recurring end,
      from_account=case when p_patch ? 'from_account' then nullif(p_patch->>'from_account','')::uuid else e.from_account end,
      to_account=case when p_patch ? 'to_account' then nullif(p_patch->>'to_account','')::uuid else e.to_account end,
      buy_price=case when p_patch ? 'buy_price' then nullif(p_patch->>'buy_price','')::integer else e.buy_price end,
      plan_amount=case when p_patch ? 'plan_amount' then nullif(p_patch->>'plan_amount','')::integer else e.plan_amount end,
      state=case when p_patch ? 'state' then p_patch->>'state' else e.state end,
      truth=case when p_patch ? 'truth' then p_patch->>'truth' else e.truth end,
      meta=case when p_patch ? 'meta' then e.meta || coalesce(p_patch->'meta','{}'::jsonb) else e.meta end,
      updated_at=now()
    where e.id=p_event_id and e.user_id=v_uid returning * into v_row;
    if v_row.id is null then raise exception 'EVENT_NOT_FOUND'; end if;
  end if;
  return jsonb_build_object('state','SAVED','id',v_row.id,'updated_at',v_row.updated_at);
end;
$function$;

create or replace function public.four_sapien_finance_batch_save_events(p_rows jsonb)
returns jsonb language plpgsql volatile set search_path to 'public'
as $function$
declare v_uid uuid := auth.uid(); v_item jsonb; v_result jsonb; v_results jsonb := '[]'::jsonb; v_count integer := 0;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if jsonb_typeof(p_rows)<>'array' then raise exception 'ROWS_ARRAY_REQUIRED'; end if;
  if jsonb_array_length(p_rows)>100 then raise exception 'BATCH_TOO_LARGE'; end if;
  for v_item in select value from jsonb_array_elements(p_rows) loop
    v_result := public.four_sapien_finance_save_event(nullif(v_item->>'id','')::uuid, v_item - 'id');
    v_results := v_results || jsonb_build_array(v_result); v_count := v_count + 1;
  end loop;
  return jsonb_build_object('state','BATCH_SAVED','count',v_count,'results',v_results);
end;
$function$;

create or replace function public.four_sapien_finance_soft_delete_event(p_event_id uuid)
returns boolean language plpgsql volatile set search_path to 'public'
as $function$
declare v_uid uuid := auth.uid(); v_n integer;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  update public.four_sapien_finance_events set state='deleted',meta=meta||jsonb_build_object('deleted_at',now()),updated_at=now() where id=p_event_id and user_id=v_uid and state<>'deleted';
  get diagnostics v_n = row_count; return v_n=1;
end;
$function$;

create or replace function public.four_sapien_finance_save_account(p_account_id uuid, p_patch jsonb)
returns jsonb language plpgsql volatile set search_path to 'public'
as $function$
declare v_uid uuid := auth.uid(); v_row public.four_sapien_finance_accounts%rowtype; v_kind text;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_patch is null or jsonb_typeof(p_patch)<>'object' then raise exception 'INVALID_PATCH'; end if;
  v_kind := coalesce(nullif(p_patch->>'kind',''),'bank');
  if v_kind not in ('bank','cash','investment','asset','property','debt','loan','credit') then raise exception 'INVALID_ACCOUNT_KIND'; end if;
  if p_account_id is null then
    if nullif(trim(p_patch->>'name'),'') is null then raise exception 'NAME_REQUIRED'; end if;
    insert into public.four_sapien_finance_accounts(user_id,name,kind,balance,as_of,source,truth,meta,confirmed_at)
    values(v_uid,trim(p_patch->>'name'),v_kind,coalesce((p_patch->>'balance')::integer,0),coalesce((p_patch->>'as_of')::date,current_date),coalesce(nullif(p_patch->>'source',''),'manual'),coalesce(nullif(p_patch->>'truth',''),'user'),coalesce(p_patch->'meta','{}'::jsonb),case when lower(coalesce(p_patch->>'truth','user')) in ('confirmed','user_confirmed','source_verified') then now() else null end) returning * into v_row;
  else
    update public.four_sapien_finance_accounts a set
      name=case when p_patch ? 'name' then trim(p_patch->>'name') else a.name end,
      kind=case when p_patch ? 'kind' then v_kind else a.kind end,
      balance=case when p_patch ? 'balance' then (p_patch->>'balance')::integer else a.balance end,
      as_of=case when p_patch ? 'as_of' then (p_patch->>'as_of')::date else a.as_of end,
      truth=case when p_patch ? 'truth' then p_patch->>'truth' else a.truth end,
      meta=case when p_patch ? 'meta' then a.meta || coalesce(p_patch->'meta','{}'::jsonb) else a.meta end,
      confirmed_at=case when p_patch ? 'truth' and lower(p_patch->>'truth') in ('confirmed','user_confirmed','source_verified') then now() else a.confirmed_at end,
      updated_at=now()
    where a.id=p_account_id and a.user_id=v_uid returning * into v_row;
    if v_row.id is null then raise exception 'ACCOUNT_NOT_FOUND'; end if;
  end if;
  return jsonb_build_object('state','SAVED','id',v_row.id,'updated_at',v_row.updated_at);
end;
$function$;

create or replace function public.four_sapien_plan_food_until_payday_context()
returns jsonb language plpgsql stable set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid(); v_allowed boolean; v_liquidity bigint; v_liquid_count bigint;
  v_next_income_date date; v_next_income_amount bigint; v_obligations bigint := 0; v_profile jsonb; v_unknown jsonb := '[]'::jsonb;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED'); end if;
  select exists(select 1 from public.four_sapien_permissions where user_id=v_uid and consumer_world='food' and provider_world='finance' and capability='plan_food_until_payday' and state='allowed') into v_allowed;
  if not v_allowed then return jsonb_build_object('state','PERMISSION_REQUIRED','capability','plan_food_until_payday','boundary','BOUNDED_FOOD_FINANCE_CONTEXT'); end if;
  select liquidity,account_count into v_liquidity,v_liquid_count from public.four_sapien_calculate_liquidity();

  with candidates as (
    select amount::bigint as amount,
      case
        when recurring='once' and occurred_on>=current_date then occurred_on
        when recurring='monthly' then case
          when (date_trunc('month',current_date)::date + (least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '1 month - 1 day'))::int)-1)*interval '1 day')::date >= current_date
          then (date_trunc('month',current_date)::date + (least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '1 month - 1 day'))::int)-1)*interval '1 day')::date
          else ((date_trunc('month',current_date)+interval '1 month')::date + (least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '2 month - 1 day'))::int)-1)*interval '1 day')::date end
        else null::date end as income_date
    from public.four_sapien_finance_events where user_id=v_uid and state='active' and type='income' and recurring in ('once','monthly'))
  select income_date,abs(amount) from candidates where income_date is not null order by income_date asc limit 1 into v_next_income_date,v_next_income_amount;

  if v_next_income_date is not null then
    with scheduled as (
      select abs(amount)::bigint as amount,
        case when recurring='once' then occurred_on
          when recurring='monthly' then case
            when (date_trunc('month',current_date)::date + (least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '1 month - 1 day'))::int)-1)*interval '1 day')::date >= current_date
            then (date_trunc('month',current_date)::date + (least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '1 month - 1 day'))::int)-1)*interval '1 day')::date
            else ((date_trunc('month',current_date)+interval '1 month')::date + (least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '2 month - 1 day'))::int)-1)*interval '1 day')::date end
          else null::date end as due_date
      from public.four_sapien_finance_events where user_id=v_uid and state='active' and type in ('bill','spend') and recurring in ('once','monthly'))
    select coalesce(sum(amount),0) into v_obligations from scheduled where due_date between current_date and v_next_income_date;
  end if;

  select jsonb_build_object('household',household,'diet',diet,'avoid',avoid,'default_store',default_store,'weekly_budget',weekly_budget,'primary_priority',primary_priority)
    into v_profile from public.four_sapien_profiles where user_id=v_uid limit 1;
  if v_liquid_count=0 then v_unknown:=v_unknown||'"liquidity"'::jsonb; end if;
  if v_next_income_date is null then v_unknown:=v_unknown||'"next_income"'::jsonb; end if;
  if v_profile is null then v_unknown:=v_unknown||'"food_profile"'::jsonb; end if;

  return jsonb_build_object('state','AVAILABLE','boundary','BOUNDED_FOOD_FINANCE_CONTEXT','currency','NOK','liquidity',case when v_liquid_count=0 then null else v_liquidity end,'liquidity_truth',case when v_liquid_count=0 then 'UNKNOWN' else 'CALCULATED' end,'next_income_date',v_next_income_date,'next_income_amount',v_next_income_amount,'obligations_until_payday',case when v_next_income_date is null then null else v_obligations end,'available_after_known_obligations',case when v_liquid_count=0 or v_next_income_date is null then null else v_liquidity-v_obligations end,'food_profile',v_profile,'unknown_fields',v_unknown,'write_rule','shopping list requires explicit current-turn user instruction');
end;
$function$;

revoke all on function public.four_sapien_finance_monthly_timeline(integer) from public, anon;
revoke all on function public.four_sapien_finance_twin(integer) from public, anon;
revoke all on function public.four_sapien_finance_save_event(uuid,jsonb) from public, anon;
revoke all on function public.four_sapien_finance_batch_save_events(jsonb) from public, anon;
revoke all on function public.four_sapien_finance_soft_delete_event(uuid) from public, anon;
revoke all on function public.four_sapien_finance_save_account(uuid,jsonb) from public, anon;
revoke all on function public.four_sapien_plan_food_until_payday_context() from public, anon;
grant execute on function public.four_sapien_finance_monthly_timeline(integer) to authenticated;
grant execute on function public.four_sapien_finance_twin(integer) to authenticated;
grant execute on function public.four_sapien_finance_save_event(uuid,jsonb) to authenticated;
grant execute on function public.four_sapien_finance_batch_save_events(jsonb) to authenticated;
grant execute on function public.four_sapien_finance_soft_delete_event(uuid) to authenticated;
grant execute on function public.four_sapien_finance_save_account(uuid,jsonb) to authenticated;
grant execute on function public.four_sapien_plan_food_until_payday_context() to authenticated;
