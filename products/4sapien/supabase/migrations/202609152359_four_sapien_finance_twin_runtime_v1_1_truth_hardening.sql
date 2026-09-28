-- 4SAPIEN Finance Twin Runtime v1.1 — truth hardening
-- Applied to canonical Supabase project ghvdzetmplqkdtfqiror on 2026-09-15.
-- No existing values are rewritten. Unknown balances can now be represented as NULL.

alter table public.four_sapien_finance_accounts add column if not exists archived_at timestamptz;
alter table public.four_sapien_finance_accounts alter column balance drop not null;
alter table public.four_sapien_finance_accounts alter column balance drop default;

create or replace function public.four_sapien_calculate_liquidity()
returns table(currency text, liquidity bigint, account_count bigint)
language sql stable set search_path to 'public'
as $function$
  with eligible as (
    select balance from public.four_sapien_finance_accounts
    where user_id=(select auth.uid()) and archived_at is null and kind in ('bank','cash')
      and not (lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false)
  ), x as (
    select count(*)::bigint total_count,count(balance)::bigint known_count,sum(balance)::bigint known_sum from eligible
  )
  select 'NOK'::text,case when total_count=0 or known_count<total_count then null::bigint else known_sum end,total_count from x;
$function$;

create or replace function public.four_sapien_finance_monthly_timeline(p_year integer default extract(year from current_date)::integer)
returns jsonb language plpgsql stable set search_path to 'public'
as $function$
declare
  v_uid uuid:=auth.uid(); v_month integer; v_start date; v_end date; v_status text;
  v_actual_income bigint; v_actual_expense bigint; v_forecast_income bigint; v_forecast_expense bigint;
  v_unresolved_income bigint; v_unresolved_expense bigint; v_imported_pending_income bigint; v_imported_pending_expense bigint;
  v_months jsonb:='[]'::jsonb;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED','year',p_year,'months','[]'::jsonb); end if;
  if p_year<2000 or p_year>2100 then raise exception 'YEAR_OUT_OF_RANGE'; end if;
  for v_month in 1..12 loop
    v_start:=make_date(p_year,v_month,1); v_end:=(v_start+interval '1 month - 1 day')::date;
    v_status:=case when v_end<date_trunc('month',current_date)::date then 'ACTUAL_PERIOD' when v_start>date_trunc('month',current_date)::date then 'FORECAST_PERIOD' else 'MIXED_CURRENT_MONTH' end;

    select coalesce(sum(case when type='income' then abs(amount)::bigint else 0 end),0),coalesce(sum(case when type in ('spend','bill') then abs(amount)::bigint else 0 end),0)
      into v_actual_income,v_actual_expense
    from public.four_sapien_finance_events
    where user_id=v_uid and state='active' and recurring='once' and occurred_on between v_start and least(v_end,current_date)
      and not (lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false);

    select coalesce(sum(case when type='income' then abs(amount)::bigint else 0 end),0),coalesce(sum(case when type in ('spend','bill') then abs(amount)::bigint else 0 end),0)
      into v_imported_pending_income,v_imported_pending_expense
    from public.four_sapien_finance_events
    where user_id=v_uid and state='active' and occurred_on between v_start and v_end and lower(source) in ('import','imported')
      and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false;

    with recurring_occurrences as (
      select e.*,
        case when e.recurring='monthly' and v_start>=date_trunc('month',e.occurred_on)::date then (v_start+(least(extract(day from e.occurred_on)::int,extract(day from v_end)::int)-1)*interval '1 day')::date
             when e.recurring='yearly' and extract(month from e.occurred_on)::int=v_month and p_year>=extract(year from e.occurred_on)::int then make_date(p_year,v_month,least(extract(day from e.occurred_on)::int,extract(day from v_end)::int)) else null::date end occurrence_date
      from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state='active' and e.recurring in ('monthly','yearly') and e.type in ('income','spend','bill')
        and not (lower(e.source) in ('import','imported') and lower(e.truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((e.meta->>'confirmed')::boolean,false)=false)
    ), future_once as (
      select type,abs(amount)::bigint amount,occurred_on occurrence_date from public.four_sapien_finance_events
      where user_id=v_uid and state='active' and recurring='once' and type in ('income','spend','bill') and occurred_on between greatest(v_start,current_date+1) and v_end
        and not (lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false)
    ), all_future as (
      select type,abs(amount)::bigint amount,occurrence_date from recurring_occurrences where occurrence_date between greatest(v_start,current_date+1) and v_end
      union all select * from future_once
    )
    select coalesce(sum(case when type='income' then amount else 0 end),0),coalesce(sum(case when type in ('spend','bill') then amount else 0 end),0)
      into v_forecast_income,v_forecast_expense from all_future;

    with recurring_occurrences as (
      select e.*,
        case when e.recurring='monthly' and v_start>=date_trunc('month',e.occurred_on)::date then (v_start+(least(extract(day from e.occurred_on)::int,extract(day from v_end)::int)-1)*interval '1 day')::date
             when e.recurring='yearly' and extract(month from e.occurred_on)::int=v_month and p_year>=extract(year from e.occurred_on)::int then make_date(p_year,v_month,least(extract(day from e.occurred_on)::int,extract(day from v_end)::int)) else null::date end occurrence_date
      from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state='active' and e.recurring in ('monthly','yearly') and e.type in ('income','spend','bill')
        and not (lower(e.source) in ('import','imported') and lower(e.truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((e.meta->>'confirmed')::boolean,false)=false)
    )
    select coalesce(sum(case when type='income' then abs(amount)::bigint else 0 end),0),coalesce(sum(case when type in ('spend','bill') then abs(amount)::bigint else 0 end),0)
      into v_unresolved_income,v_unresolved_expense from recurring_occurrences where occurrence_date between v_start and least(v_end,current_date);

    v_months:=v_months||jsonb_build_array(jsonb_build_object(
      'month',v_month,'month_key',to_char(v_start,'YYYY-MM'),'period_state',v_status,
      'actual',jsonb_build_object('income',v_actual_income,'expense',v_actual_expense,'net',v_actual_income-v_actual_expense,'truth','ACTUAL_CONFIRMED_OR_USER_DATED'),
      'forecast',jsonb_build_object('income',v_forecast_income,'expense',v_forecast_expense,'net',v_forecast_income-v_forecast_expense,'truth','FORECAST'),
      'scheduled_unconfirmed',jsonb_build_object('income',v_unresolved_income,'expense',v_unresolved_expense,'truth','SCHEDULED_NOT_CONFIRMED'),
      'imported_unconfirmed',jsonb_build_object('income',v_imported_pending_income,'expense',v_imported_pending_expense,'truth','IMPORTED_NOT_CONFIRMED'),
      'projected_net',case when v_status='ACTUAL_PERIOD' then v_actual_income-v_actual_expense else (v_actual_income+v_forecast_income)-(v_actual_expense+v_forecast_expense) end));
  end loop;
  return jsonb_build_object('state','AVAILABLE','year',p_year,'currency','NOK','months',v_months,'rules',jsonb_build_object('past','actual only; recurring templates remain scheduled_unconfirmed until confirmed','current','actual + remaining confirmed-source forecast; past recurring templates remain scheduled_unconfirmed','future','forecast','imported','unconfirmed imports excluded from actual and forecast and shown separately'));
end;
$function$;

create or replace function public.four_sapien_finance_twin(p_year integer default extract(year from current_date)::integer)
returns jsonb language plpgsql stable set search_path to 'public'
as $function$
declare
  v_uid uuid:=auth.uid(); v_liquid_total bigint; v_liquid_known bigint; v_liquidity bigint;
  v_asset_accounts bigint; v_debt_accounts bigint; v_event_assets bigint; v_event_debts bigint; v_assets bigint; v_debts bigint; v_known_net bigint; v_net_worth bigint;
  v_unknown_balance_count bigint; v_imported_unconfirmed_count bigint; v_recurring_expense bigint; v_freedom numeric; v_accounts jsonb; v_timeline jsonb; v_review_count bigint; v_ytd_income bigint; v_ytd_expense bigint;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED'); end if;
  select count(*) filter(where kind in ('bank','cash')),count(balance) filter(where kind in ('bank','cash')),
         case when count(*) filter(where kind in ('bank','cash'))=0 or count(balance) filter(where kind in ('bank','cash'))<count(*) filter(where kind in ('bank','cash')) then null::bigint else sum(balance) filter(where kind in ('bank','cash'))::bigint end,
         coalesce(sum(case when balance is not null and kind in ('bank','cash','investment','asset','property') and balance>=0 then balance else 0 end),0)::bigint,
         coalesce(sum(case when balance is not null and (kind in ('debt','loan','credit') or balance<0) then abs(balance) else 0 end),0)::bigint,
         count(*) filter(where balance is null),
         coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'kind',kind,'balance',balance,'as_of',as_of,'source',source,'truth',truth,'liquidity_eligible',kind in ('bank','cash'),'balance_state',case when balance is null then 'UNKNOWN' else 'KNOWN' end,'balance_sheet_role',case when kind in ('debt','loan','credit') or coalesce(balance,0)<0 then 'LIABILITY' else 'ASSET' end,'included_in_calculations',true) order by created_at),'[]'::jsonb)
    into v_liquid_total,v_liquid_known,v_liquidity,v_asset_accounts,v_debt_accounts,v_unknown_balance_count,v_accounts
  from public.four_sapien_finance_accounts
  where user_id=v_uid and archived_at is null and not (lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false);

  select coalesce(sum(abs(amount)) filter(where type='asset'),0)::bigint,coalesce(sum(abs(amount)) filter(where type='debt'),0)::bigint into v_event_assets,v_event_debts
  from public.four_sapien_finance_events where user_id=v_uid and state='active' and not (lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false);

  select count(*) into v_imported_unconfirmed_count from (
    select id from public.four_sapien_finance_accounts where user_id=v_uid and archived_at is null and lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false
    union all
    select id from public.four_sapien_finance_events where user_id=v_uid and state='active' and lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false
  ) q;

  v_assets:=v_asset_accounts+v_event_assets; v_debts:=v_debt_accounts+v_event_debts; v_known_net:=v_assets-v_debts; v_net_worth:=case when v_unknown_balance_count>0 then null else v_known_net end;
  select coalesce(sum(abs(amount)) filter(where type in ('spend','bill') and recurring='monthly'),0)::bigint into v_recurring_expense
  from public.four_sapien_finance_events where user_id=v_uid and state='active' and not (lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false);
  v_freedom:=case when v_liquidity is null or v_recurring_expense<=0 then null else round(v_liquidity::numeric/v_recurring_expense::numeric,1) end;
  v_timeline:=public.four_sapien_finance_monthly_timeline(p_year);
  select coalesce(sum((m->'actual'->>'income')::bigint),0),coalesce(sum((m->'actual'->>'expense')::bigint),0) into v_ytd_income,v_ytd_expense from jsonb_array_elements(v_timeline->'months') m where (m->>'month')::int<=extract(month from current_date)::int and p_year=extract(year from current_date)::int;
  select count(*) into v_review_count from public.four_sapien_finance_events where user_id=v_uid and state='active' and ((type in ('asset','debt') and lower(coalesce(category,'')) in ('mat','food','groceries','grocery','strøm','transport','abonnement')) or (type='income' and lower(coalesce(category,'')) in ('mat','food','groceries','grocery','strøm','transport','abonnement','forsikring')));

  return jsonb_build_object('state','AVAILABLE','currency','NOK','year',p_year,
    'truth_rules',jsonb_build_object('unknown_is_zero',false,'actual_is_forecast',false,'imported_is_confirmed',false,'asset_value_is_liquidity',false),
    'liquidity',jsonb_build_object('state',case when v_liquid_total=0 then 'UNKNOWN_NO_LIQUID_ACCOUNTS' when v_liquid_known<v_liquid_total then 'UNKNOWN_PARTIAL_BALANCES' else 'AVAILABLE' end,'amount',v_liquidity,'account_count',v_liquid_total,'known_balance_count',v_liquid_known,'truth',case when v_liquidity is null then 'UNKNOWN' else 'CALCULATED' end,'definition','bank+cash only; assets/investments excluded; all included liquid account balances must be known'),
    'accounts',v_accounts,
    'quadrants',jsonb_build_object('income',jsonb_build_object('amount',v_ytd_income,'period','YTD_ACTUAL','truth','ACTUAL'),'expense',jsonb_build_object('amount',v_ytd_expense,'period','YTD_ACTUAL','truth','ACTUAL'),'assets',jsonb_build_object('amount',v_assets,'truth','RECORDED_VALUES','liquid',false,'completeness',case when v_unknown_balance_count>0 then 'PARTIAL' else 'RECORDED_COMPLETE' end),'debt',jsonb_build_object('amount',v_debts,'truth','RECORDED_VALUES','liquid',false,'completeness',case when v_unknown_balance_count>0 then 'PARTIAL' else 'RECORDED_COMPLETE' end)),
    'net_worth',jsonb_build_object('amount',v_net_worth,'known_recorded_amount',v_known_net,'truth',case when v_net_worth is null then 'UNKNOWN_PARTIAL' else 'CALCULATED_FROM_RECORDED_VALUES' end),
    'freedom_months',jsonb_build_object('amount',v_freedom,'state',case when v_liquidity is null then 'UNKNOWN_LIQUIDITY' when v_recurring_expense<=0 then 'UNKNOWN_EXPENSE_BASELINE' else 'MODELLED' end,'truth',case when v_freedom is null then 'UNKNOWN' else 'MODELLED' end,'basis',case when v_freedom is null then null else 'liquidity / recorded monthly recurring expenses' end),
    'timeline',v_timeline,
    'data_quality',jsonb_build_object('category_review_count',v_review_count,'category_review_state',case when v_review_count>0 then 'REVIEW_RECOMMENDED' else 'OK' end,'unknown_account_balance_count',v_unknown_balance_count,'imported_unconfirmed_count',v_imported_unconfirmed_count,'auto_reclassified',false));
end;
$function$;

create or replace function public.four_sapien_finance_save_account(p_account_id uuid,p_patch jsonb)
returns jsonb language plpgsql volatile set search_path to 'public'
as $function$
declare v_uid uuid:=auth.uid(); v_row public.four_sapien_finance_accounts%rowtype; v_kind text;
begin
  if v_uid is null then raise exception 'UNAUTHENTICATED'; end if;
  if p_patch is null or jsonb_typeof(p_patch)<>'object' then raise exception 'INVALID_PATCH'; end if;
  v_kind:=coalesce(nullif(p_patch->>'kind',''),'bank'); if v_kind not in ('bank','cash','investment','asset','property','debt','loan','credit') then raise exception 'INVALID_ACCOUNT_KIND'; end if;
  if p_account_id is null then
    if nullif(trim(p_patch->>'name'),'') is null then raise exception 'NAME_REQUIRED'; end if;
    insert into public.four_sapien_finance_accounts(user_id,name,kind,balance,as_of,source,truth,meta,confirmed_at,archived_at)
    values(v_uid,trim(p_patch->>'name'),v_kind,case when p_patch?'balance' and nullif(p_patch->>'balance','') is not null then (p_patch->>'balance')::integer else null end,coalesce((p_patch->>'as_of')::date,current_date),coalesce(nullif(p_patch->>'source',''),'manual'),coalesce(nullif(p_patch->>'truth',''),'user'),coalesce(p_patch->'meta','{}'::jsonb),case when lower(coalesce(p_patch->>'truth','user')) in ('confirmed','user_confirmed','source_verified') then now() else null end,null) returning * into v_row;
  else
    update public.four_sapien_finance_accounts a set name=case when p_patch?'name' then trim(p_patch->>'name') else a.name end,kind=case when p_patch?'kind' then v_kind else a.kind end,balance=case when p_patch?'balance' then nullif(p_patch->>'balance','')::integer else a.balance end,as_of=case when p_patch?'as_of' then (p_patch->>'as_of')::date else a.as_of end,source=case when p_patch?'source' then coalesce(nullif(p_patch->>'source',''),'manual') else a.source end,truth=case when p_patch?'truth' then p_patch->>'truth' else a.truth end,meta=case when p_patch?'meta' then a.meta||coalesce(p_patch->'meta','{}'::jsonb) else a.meta end,confirmed_at=case when p_patch?'truth' and lower(p_patch->>'truth') in ('confirmed','user_confirmed','source_verified') then now() else a.confirmed_at end,updated_at=now()
    where a.id=p_account_id and a.user_id=v_uid and a.archived_at is null returning * into v_row;
    if v_row.id is null then raise exception 'ACCOUNT_NOT_FOUND'; end if;
  end if;
  return jsonb_build_object('state','SAVED','id',v_row.id,'updated_at',v_row.updated_at,'balance_state',case when v_row.balance is null then 'UNKNOWN' else 'KNOWN' end);
end;
$function$;

create or replace function public.four_sapien_finance_soft_delete_account(p_account_id uuid)
returns boolean language plpgsql volatile set search_path to 'public'
as $function$
declare v_uid uuid:=auth.uid(); v_n integer; begin if v_uid is null then raise exception 'UNAUTHENTICATED'; end if; update public.four_sapien_finance_accounts set archived_at=now(),updated_at=now() where id=p_account_id and user_id=v_uid and archived_at is null; get diagnostics v_n=row_count; return v_n=1; end;
$function$;

create or replace function public.four_sapien_finance_restore_account(p_account_id uuid)
returns boolean language plpgsql volatile set search_path to 'public'
as $function$
declare v_uid uuid:=auth.uid(); v_n integer; begin if v_uid is null then raise exception 'UNAUTHENTICATED'; end if; update public.four_sapien_finance_accounts set archived_at=null,updated_at=now() where id=p_account_id and user_id=v_uid and archived_at is not null; get diagnostics v_n=row_count; return v_n=1; end;
$function$;

create or replace function public.four_sapien_set_permission(p_consumer_world text,p_provider_world text,p_capability text,p_state text)
returns jsonb language plpgsql set search_path to 'public'
as $function$
begin
  if not (p_consumer_world='food' and p_provider_world='finance' and p_capability in ('read_budget_context','plan_food_until_payday')) then raise exception 'UNKNOWN_OR_UNAPPROVED_CAPABILITY'; end if;
  if p_state not in ('allowed','denied','revoked') then raise exception 'INVALID_PERMISSION_STATE'; end if;
  insert into public.four_sapien_permissions(user_id,consumer_world,provider_world,capability,state,basis,granted_at,revoked_at,updated_at)
  values((select auth.uid()),p_consumer_world,p_provider_world,p_capability,p_state,'explicit_user',case when p_state='allowed' then now() else null end,case when p_state='revoked' then now() else null end,now())
  on conflict (user_id,consumer_world,provider_world,capability) do update set state=excluded.state,basis='explicit_user',granted_at=excluded.granted_at,revoked_at=excluded.revoked_at,updated_at=now();
  return jsonb_build_object('consumer_world',p_consumer_world,'provider_world',p_provider_world,'capability',p_capability,'state',p_state,'basis','explicit_user');
end;
$function$;

create or replace function public.four_sapien_plan_food_until_payday_context()
returns jsonb language plpgsql stable set search_path to 'public'
as $function$
declare
  v_uid uuid:=auth.uid(); v_allowed boolean; v_liquidity bigint; v_liquid_count bigint; v_next_income_date date; v_obligations bigint:=0; v_planned_spend bigint:=0; v_profile jsonb; v_weekly_budget integer; v_unknown jsonb:='[]'::jsonb;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED'); end if;
  select exists(select 1 from public.four_sapien_permissions where user_id=v_uid and consumer_world='food' and provider_world='finance' and capability='plan_food_until_payday' and state='allowed') into v_allowed;
  if not v_allowed then return jsonb_build_object('state','PERMISSION_REQUIRED','capability','plan_food_until_payday','boundary','BOUNDED_FOOD_FINANCE_CONTEXT'); end if;
  select liquidity,account_count into v_liquidity,v_liquid_count from public.four_sapien_calculate_liquidity();
  with candidates as (
    select case when recurring='once' and occurred_on>=current_date then occurred_on when recurring='monthly' then case when (date_trunc('month',current_date)::date+(least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '1 month - 1 day'))::int)-1)*interval '1 day')::date>=current_date then (date_trunc('month',current_date)::date+(least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '1 month - 1 day'))::int)-1)*interval '1 day')::date else ((date_trunc('month',current_date)+interval '1 month')::date+(least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '2 month - 1 day'))::int)-1)*interval '1 day')::date end else null::date end income_date
    from public.four_sapien_finance_events where user_id=v_uid and state='active' and type='income' and recurring in ('once','monthly') and not (lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false)
  ) select income_date from candidates where income_date is not null order by income_date asc limit 1 into v_next_income_date;
  if v_next_income_date is not null then
    with scheduled as (
      select type,abs(amount)::bigint amount,case when recurring='once' then occurred_on when recurring='monthly' then case when (date_trunc('month',current_date)::date+(least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '1 month - 1 day'))::int)-1)*interval '1 day')::date>=current_date then (date_trunc('month',current_date)::date+(least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '1 month - 1 day'))::int)-1)*interval '1 day')::date else ((date_trunc('month',current_date)+interval '1 month')::date+(least(extract(day from occurred_on)::int,extract(day from (date_trunc('month',current_date)+interval '2 month - 1 day'))::int)-1)*interval '1 day')::date end else null::date end due_date
      from public.four_sapien_finance_events where user_id=v_uid and state='active' and type in ('bill','spend') and recurring in ('once','monthly') and not (lower(source) in ('import','imported') and lower(truth) not in ('confirmed','user_confirmed','source_verified') and coalesce((meta->>'confirmed')::boolean,false)=false)
    ) select coalesce(sum(amount) filter(where type='bill'),0),coalesce(sum(amount) filter(where type='spend'),0) into v_obligations,v_planned_spend from scheduled where due_date between current_date and v_next_income_date;
  end if;
  select jsonb_build_object('household',household,'diet',diet,'avoid',avoid,'default_store',default_store,'weekly_budget',weekly_budget,'primary_priority',primary_priority),weekly_budget into v_profile,v_weekly_budget from public.four_sapien_profiles where user_id=v_uid limit 1;
  if v_liquidity is null then v_unknown:=v_unknown||'"liquidity"'::jsonb; end if; if v_next_income_date is null then v_unknown:=v_unknown||'"payday"'::jsonb; end if; if v_profile is null then v_unknown:=v_unknown||'"food_profile"'::jsonb; end if; if v_profile is not null and v_weekly_budget is null then v_unknown:=v_unknown||'"food_budget"'::jsonb; end if;
  return jsonb_build_object('state','AVAILABLE','boundary','BOUNDED_FOOD_FINANCE_CONTEXT','currency','NOK','liquidity',v_liquidity,'liquidity_truth',case when v_liquidity is null then 'UNKNOWN' else 'CALCULATED' end,'next_income_date',v_next_income_date,'known_obligations_until_payday',case when v_next_income_date is null then null else v_obligations end,'planned_spend_until_payday',case when v_next_income_date is null then null else v_planned_spend end,'available_after_known_obligations',case when v_liquidity is null or v_next_income_date is null then null else v_liquidity-v_obligations end,'food_profile',v_profile,'unknown_fields',v_unknown,'privacy_rule','no salary amount, debts, holdings or full transaction history exposed to Food','write_rule','shopping list requires explicit current-turn user instruction');
end;
$function$;

revoke all on function public.four_sapien_finance_soft_delete_account(uuid) from public,anon;
revoke all on function public.four_sapien_finance_restore_account(uuid) from public,anon;
grant execute on function public.four_sapien_finance_soft_delete_account(uuid) to authenticated;
grant execute on function public.four_sapien_finance_restore_account(uuid) to authenticated;
