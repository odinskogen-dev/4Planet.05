-- 4SAPIEN Finance Twin Runtime v2.1
-- Converges the later fail-closed truth hardening with recurring/upcoming runtime semantics.
-- No user rows are rewritten.

create or replace function public.four_sapien_finance_monthly_timeline(
  p_year integer default extract(year from current_date)::integer
) returns jsonb
language plpgsql stable
set search_path to 'public'
as $function$
declare
  v_uid uuid:=auth.uid(); v_month int; v_start date; v_end date; v_status text;
  v_actual_income bigint; v_actual_expense bigint; v_forecast_income bigint; v_forecast_expense bigint;
  v_unresolved_income bigint; v_unresolved_expense bigint; v_imported_income bigint; v_imported_expense bigint;
  v_months jsonb:='[]'::jsonb;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED','year',p_year,'months','[]'::jsonb); end if;
  if p_year<2000 or p_year>2100 then raise exception 'YEAR_OUT_OF_RANGE'; end if;

  for v_month in 1..12 loop
    v_start:=make_date(p_year,v_month,1);
    v_end:=(v_start+interval '1 month - 1 day')::date;
    v_status:=case
      when v_end<date_trunc('month',current_date)::date then 'ACTUAL_PERIOD'
      when v_start>date_trunc('month',current_date)::date then 'FORECAST_PERIOD'
      else 'MIXED_CURRENT_MONTH' end;

    select coalesce(sum(abs(amount)) filter(where type='income'),0)::bigint,
           coalesce(sum(abs(amount)) filter(where type in ('spend','bill')),0)::bigint
      into v_actual_income,v_actual_expense
    from public.four_sapien_finance_events
    where user_id=v_uid and state in ('active','upcoming') and recurring='once'
      and occurred_on between v_start and least(v_end,current_date)
      and not (
        lower(source) in ('import','imported')
        and lower(truth) not in ('confirmed','user_confirmed','source_verified')
        and coalesce((meta->>'confirmed')::boolean,false)=false
      );

    select coalesce(sum(abs(amount)) filter(where type='income'),0)::bigint,
           coalesce(sum(abs(amount)) filter(where type in ('spend','bill')),0)::bigint
      into v_imported_income,v_imported_expense
    from public.four_sapien_finance_events
    where user_id=v_uid and state in ('active','upcoming') and recurring='once'
      and occurred_on between v_start and v_end
      and lower(source) in ('import','imported')
      and lower(truth) not in ('confirmed','user_confirmed','source_verified')
      and coalesce((meta->>'confirmed')::boolean,false)=false;

    with recurring_occurrences as (
      select e.type,abs(e.amount)::bigint amount,
        case
          when e.recurring='monthly' and v_start>=date_trunc('month',e.occurred_on)::date
            then make_date(p_year,v_month,least(extract(day from e.occurred_on)::int,extract(day from v_end)::int))
          when e.recurring='yearly' and extract(month from e.occurred_on)::int=v_month and p_year>=extract(year from e.occurred_on)::int
            then make_date(p_year,v_month,least(extract(day from e.occurred_on)::int,extract(day from v_end)::int))
          else null::date end occurrence_date
      from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state in ('active','upcoming') and e.recurring in ('monthly','yearly')
        and e.type in ('income','spend','bill')
        and not (
          lower(e.source) in ('import','imported')
          and lower(e.truth) not in ('confirmed','user_confirmed','source_verified')
          and coalesce((e.meta->>'confirmed')::boolean,false)=false
        )
    ), future_once as (
      select type,abs(amount)::bigint amount,occurred_on occurrence_date
      from public.four_sapien_finance_events
      where user_id=v_uid and state in ('active','upcoming') and recurring='once'
        and type in ('income','spend','bill')
        and occurred_on between greatest(v_start,current_date+1) and v_end
        and not (
          lower(source) in ('import','imported')
          and lower(truth) not in ('confirmed','user_confirmed','source_verified')
          and coalesce((meta->>'confirmed')::boolean,false)=false
        )
    ), all_future as (
      select type,amount,occurrence_date from recurring_occurrences
      where occurrence_date between greatest(v_start,current_date+1) and v_end
      union all
      select type,amount,occurrence_date from future_once
    )
    select coalesce(sum(amount) filter(where type='income'),0)::bigint,
           coalesce(sum(amount) filter(where type in ('spend','bill')),0)::bigint
      into v_forecast_income,v_forecast_expense
    from all_future;

    with recurring_occurrences as (
      select e.type,abs(e.amount)::bigint amount,
        case
          when e.recurring='monthly' and v_start>=date_trunc('month',e.occurred_on)::date
            then make_date(p_year,v_month,least(extract(day from e.occurred_on)::int,extract(day from v_end)::int))
          when e.recurring='yearly' and extract(month from e.occurred_on)::int=v_month and p_year>=extract(year from e.occurred_on)::int
            then make_date(p_year,v_month,least(extract(day from e.occurred_on)::int,extract(day from v_end)::int))
          else null::date end occurrence_date
      from public.four_sapien_finance_events e
      where e.user_id=v_uid and e.state in ('active','upcoming') and e.recurring in ('monthly','yearly')
        and e.type in ('income','spend','bill')
        and not (
          lower(e.source) in ('import','imported')
          and lower(e.truth) not in ('confirmed','user_confirmed','source_verified')
          and coalesce((e.meta->>'confirmed')::boolean,false)=false
        )
    )
    select coalesce(sum(amount) filter(where type='income'),0)::bigint,
           coalesce(sum(amount) filter(where type in ('spend','bill')),0)::bigint
      into v_unresolved_income,v_unresolved_expense
    from recurring_occurrences
    where occurrence_date between v_start and least(v_end,current_date);

    v_months:=v_months||jsonb_build_array(jsonb_build_object(
      'month',v_month,'month_key',to_char(v_start,'YYYY-MM'),'period_state',v_status,
      'actual',jsonb_build_object('income',v_actual_income,'expense',v_actual_expense,'net',v_actual_income-v_actual_expense,'truth','ACTUAL_CONFIRMED_OR_USER_DATED'),
      'forecast',jsonb_build_object('income',v_forecast_income,'expense',v_forecast_expense,'net',v_forecast_income-v_forecast_expense,'truth','FORECAST'),
      'scheduled_unconfirmed',jsonb_build_object('income',v_unresolved_income,'expense',v_unresolved_expense,'truth','SCHEDULED_NOT_CONFIRMED'),
      'imported_unconfirmed',jsonb_build_object('income',v_imported_income,'expense',v_imported_expense,'truth','IMPORTED_NOT_CONFIRMED'),
      'projected_net',case when v_status='ACTUAL_PERIOD' then v_actual_income-v_actual_expense else (v_actual_income+v_forecast_income)-(v_actual_expense+v_forecast_expense) end
    ));
  end loop;

  return jsonb_build_object(
    'state','AVAILABLE','year',p_year,'currency','NOK','months',v_months,
    'rules',jsonb_build_object(
      'past','actual only; recurring templates remain scheduled_unconfirmed until confirmed',
      'current','actual plus remaining forecast',
      'future','forecast',
      'imported','unconfirmed imports excluded from actual and forecast and shown separately'
    )
  );
end;
$function$;

create or replace function public.four_sapien_finance_twin(
  p_year integer default extract(year from current_date)::integer
) returns jsonb
language plpgsql stable
set search_path to 'public'
as $function$
declare
  v_uid uuid:=auth.uid();
  v_liquid_total bigint; v_liquid_known bigint; v_liquidity bigint;
  v_asset_accounts bigint; v_debt_accounts bigint; v_event_assets bigint; v_event_debts bigint;
  v_assets bigint; v_debts bigint; v_known_net bigint; v_net_worth bigint;
  v_unknown_balance_count bigint; v_imported_unconfirmed_count bigint;
  v_monthly_burn numeric; v_freedom numeric; v_accounts jsonb; v_timeline jsonb; v_review_count bigint;
  v_ytd_income bigint; v_ytd_expense bigint;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED'); end if;

  select
    count(*) filter(where kind in ('bank','cash')),
    count(balance) filter(where kind in ('bank','cash')),
    case
      when count(*) filter(where kind in ('bank','cash'))=0
        or count(balance) filter(where kind in ('bank','cash'))<count(*) filter(where kind in ('bank','cash'))
      then null::bigint
      else sum(balance) filter(where kind in ('bank','cash'))::bigint end,
    coalesce(sum(case when balance is not null and kind in ('bank','cash','investment','asset','property') and balance>=0 then balance else 0 end),0)::bigint,
    coalesce(sum(case when balance is not null and (kind in ('debt','loan','credit') or balance<0) then abs(balance) else 0 end),0)::bigint,
    count(*) filter(where balance is null),
    coalesce(jsonb_agg(jsonb_build_object(
      'id',id,'name',name,'kind',kind,'balance',balance,'as_of',as_of,'source',source,'truth',truth,
      'liquidity_eligible',kind in ('bank','cash'),
      'balance_state',case when balance is null then 'UNKNOWN' else 'KNOWN' end,
      'balance_sheet_role',case when kind in ('debt','loan','credit') or coalesce(balance,0)<0 then 'LIABILITY' else 'ASSET' end,
      'included_in_calculations',true
    ) order by created_at),'[]'::jsonb)
  into v_liquid_total,v_liquid_known,v_liquidity,v_asset_accounts,v_debt_accounts,v_unknown_balance_count,v_accounts
  from public.four_sapien_finance_accounts
  where user_id=v_uid and archived_at is null
    and not (
      lower(source) in ('import','imported')
      and lower(truth) not in ('confirmed','user_confirmed','source_verified')
      and coalesce((meta->>'confirmed')::boolean,false)=false
    );

  select
    coalesce(sum(abs(amount)) filter(where type='asset'),0)::bigint,
    coalesce(sum(abs(amount)) filter(where type='debt'),0)::bigint
  into v_event_assets,v_event_debts
  from public.four_sapien_finance_events
  where user_id=v_uid and state in ('active','upcoming')
    and not (
      lower(source) in ('import','imported')
      and lower(truth) not in ('confirmed','user_confirmed','source_verified')
      and coalesce((meta->>'confirmed')::boolean,false)=false
    );

  select count(*) into v_imported_unconfirmed_count
  from (
    select id from public.four_sapien_finance_accounts
    where user_id=v_uid and archived_at is null and lower(source) in ('import','imported')
      and lower(truth) not in ('confirmed','user_confirmed','source_verified')
      and coalesce((meta->>'confirmed')::boolean,false)=false
    union all
    select id from public.four_sapien_finance_events
    where user_id=v_uid and state in ('active','upcoming') and lower(source) in ('import','imported')
      and lower(truth) not in ('confirmed','user_confirmed','source_verified')
      and coalesce((meta->>'confirmed')::boolean,false)=false
  ) q;

  v_assets:=v_asset_accounts+v_event_assets;
  v_debts:=v_debt_accounts+v_event_debts;
  v_known_net:=v_assets-v_debts;
  v_net_worth:=case when v_unknown_balance_count>0 then null else v_known_net end;

  select coalesce(sum(
    case recurring
      when 'monthly' then abs(amount)::numeric
      when 'yearly' then abs(amount)::numeric/12
      else 0 end
  ),0)
  into v_monthly_burn
  from public.four_sapien_finance_events
  where user_id=v_uid and state in ('active','upcoming') and type in ('spend','bill')
    and not (
      lower(source) in ('import','imported')
      and lower(truth) not in ('confirmed','user_confirmed','source_verified')
      and coalesce((meta->>'confirmed')::boolean,false)=false
    );

  v_freedom:=case when v_liquidity is null or v_monthly_burn<=0 then null else round(v_liquidity::numeric/v_monthly_burn,1) end;
  v_timeline:=public.four_sapien_finance_monthly_timeline(p_year);

  select coalesce(sum((m->'actual'->>'income')::bigint),0),
         coalesce(sum((m->'actual'->>'expense')::bigint),0)
  into v_ytd_income,v_ytd_expense
  from jsonb_array_elements(v_timeline->'months') m
  where p_year<extract(year from current_date)::int
     or (p_year=extract(year from current_date)::int and (m->>'month')::int<=extract(month from current_date)::int);

  select count(*) into v_review_count
  from public.four_sapien_finance_events
  where user_id=v_uid and state in ('active','upcoming')
    and ((type in ('asset','debt') and lower(coalesce(category,'')) in ('mat','food','groceries','grocery','strøm','transport','abonnement'))
      or (type='income' and lower(coalesce(category,'')) in ('mat','food','groceries','grocery','strøm','transport','abonnement','forsikring')));

  return jsonb_build_object(
    'state','AVAILABLE','currency','NOK','year',p_year,
    'truth_rules',jsonb_build_object('unknown_is_zero',false,'actual_is_forecast',false,'imported_is_confirmed',false,'asset_value_is_liquidity',false),
    'liquidity',jsonb_build_object(
      'state',case when v_liquid_total=0 then 'UNKNOWN_NO_LIQUID_ACCOUNTS' when v_liquid_known<v_liquid_total then 'UNKNOWN_PARTIAL_BALANCES' else 'AVAILABLE' end,
      'amount',v_liquidity,'account_count',v_liquid_total,'known_balance_count',v_liquid_known,
      'truth',case when v_liquidity is null then 'UNKNOWN' else 'CALCULATED' end,
      'definition','bank+cash only; assets/investments excluded; all included liquid account balances must be known'
    ),
    'accounts',v_accounts,
    'quadrants',jsonb_build_object(
      'income',jsonb_build_object('amount',v_ytd_income,'period','YTD_ACTUAL','truth','ACTUAL'),
      'expense',jsonb_build_object('amount',v_ytd_expense,'period','YTD_ACTUAL','truth','ACTUAL'),
      'assets',jsonb_build_object('amount',v_assets,'truth','RECORDED_VALUES','liquid',false,'completeness',case when v_unknown_balance_count>0 then 'PARTIAL' else 'RECORDED_COMPLETE' end),
      'debt',jsonb_build_object('amount',v_debts,'truth','RECORDED_VALUES','liquid',false,'completeness',case when v_unknown_balance_count>0 then 'PARTIAL' else 'RECORDED_COMPLETE' end)
    ),
    'net_worth',jsonb_build_object('amount',v_net_worth,'known_recorded_amount',v_known_net,'truth',case when v_net_worth is null then 'UNKNOWN_PARTIAL' else 'CALCULATED_FROM_RECORDED_VALUES' end),
    'monthly_recurring_expense_equivalent',jsonb_build_object('amount',round(v_monthly_burn),'truth','MODELLED_FROM_RECORRING_TEMPLATES','rule','monthly + yearly/12; one-off excluded'),
    'freedom_months',jsonb_build_object('amount',v_freedom,'state',case when v_liquidity is null then 'UNKNOWN_LIQUIDITY' when v_monthly_burn<=0 then 'UNKNOWN_EXPENSE_BASELINE' else 'MODELLED' end,'truth',case when v_freedom is null then 'UNKNOWN' else 'MODELLED' end,'basis',case when v_freedom is null then null else 'liquidity / monthly recurring expense equivalent' end),
    'timeline',v_timeline,
    'data_quality',jsonb_build_object(
      'category_review_count',v_review_count,
      'category_review_state',case when v_review_count>0 then 'REVIEW_RECOMMENDED' else 'OK' end,
      'unknown_account_balance_count',v_unknown_balance_count,
      'imported_unconfirmed_count',v_imported_unconfirmed_count,
      'auto_reclassified',false
    )
  );
end;
$function$;

create or replace function public.four_sapien_plan_food_until_payday_context()
returns jsonb
language plpgsql stable
set search_path to 'public'
as $function$
declare
  v_uid uuid:=auth.uid(); v_allowed boolean; v_liquidity bigint; v_liquid_count bigint;
  v_next_income_date date; v_obligations bigint:=0; v_planned_spend bigint:=0;
  v_profile jsonb; v_weekly_budget integer; v_unknown jsonb:='[]'::jsonb;
begin
  if v_uid is null then return jsonb_build_object('state','UNAUTHENTICATED'); end if;

  select exists(
    select 1 from public.four_sapien_permissions
    where user_id=v_uid and consumer_world='food' and provider_world='finance'
      and capability='plan_food_until_payday' and state='allowed'
  ) into v_allowed;
  if not v_allowed then
    return jsonb_build_object('state','PERMISSION_REQUIRED','capability','plan_food_until_payday','boundary','BOUNDED_FOOD_FINANCE_CONTEXT');
  end if;

  select liquidity,account_count into v_liquidity,v_liquid_count
  from public.four_sapien_calculate_liquidity();

  with candidates as (
    select public.four_sapien_finance_next_occurrence(occurred_on,recurring,current_date) income_date
    from public.four_sapien_finance_events
    where user_id=v_uid and state in ('active','upcoming') and type='income'
      and recurring in ('once','monthly','yearly')
      and not (
        lower(source) in ('import','imported')
        and lower(truth) not in ('confirmed','user_confirmed','source_verified')
        and coalesce((meta->>'confirmed')::boolean,false)=false
      )
  )
  select income_date into v_next_income_date
  from candidates where income_date is not null order by income_date asc limit 1;

  if v_next_income_date is not null then
    with scheduled as (
      select type,abs(amount)::bigint amount,
             public.four_sapien_finance_next_occurrence(occurred_on,recurring,current_date) due_date
      from public.four_sapien_finance_events
      where user_id=v_uid and state in ('active','upcoming') and type in ('bill','spend')
        and recurring in ('once','monthly','yearly')
        and not (
          lower(source) in ('import','imported')
          and lower(truth) not in ('confirmed','user_confirmed','source_verified')
          and coalesce((meta->>'confirmed')::boolean,false)=false
        )
    )
    select coalesce(sum(amount) filter(where type='bill'),0),
           coalesce(sum(amount) filter(where type='spend'),0)
      into v_obligations,v_planned_spend
    from scheduled
    where due_date between current_date and v_next_income_date;
  end if;

  select jsonb_build_object(
      'household',household,'diet',diet,'avoid',avoid,'default_store',default_store,
      'weekly_budget',weekly_budget,'primary_priority',primary_priority
    ),weekly_budget
  into v_profile,v_weekly_budget
  from public.four_sapien_profiles where user_id=v_uid limit 1;

  if v_liquidity is null then v_unknown:=v_unknown||'"liquidity"'::jsonb; end if;
  if v_next_income_date is null then v_unknown:=v_unknown||'"payday"'::jsonb; end if;
  if v_profile is null then v_unknown:=v_unknown||'"food_profile"'::jsonb; end if;
  if v_profile is not null and v_weekly_budget is null then v_unknown:=v_unknown||'"food_budget"'::jsonb; end if;

  return jsonb_build_object(
    'state','AVAILABLE','boundary','BOUNDED_FOOD_FINANCE_CONTEXT','currency','NOK',
    'liquidity',v_liquidity,'liquidity_truth',case when v_liquidity is null then 'UNKNOWN' else 'CALCULATED' end,
    'next_income_date',v_next_income_date,
    'known_obligations_until_payday',case when v_next_income_date is null then null else v_obligations end,
    'planned_spend_until_payday',case when v_next_income_date is null then null else v_planned_spend end,
    'available_after_known_obligations',case when v_liquidity is null or v_next_income_date is null then null else v_liquidity-v_obligations end,
    'available_after_known_commitments',case when v_liquidity is null or v_next_income_date is null then null else v_liquidity-v_obligations-v_planned_spend end,
    'days_until_income',case when v_next_income_date is null then null else (v_next_income_date-current_date) end,
    'food_profile',v_profile,'unknown_fields',v_unknown,
    'truth','DETERMINISTIC_FROM_RECORDED_FINANCE_STATE',
    'privacy_rule','no salary amount, debts, holdings or full transaction history exposed to Food',
    'write_rule','shopping list requires explicit current-turn user instruction'
  );
end;
$function$;

revoke all on function public.four_sapien_finance_monthly_timeline(integer) from public,anon;
revoke all on function public.four_sapien_finance_twin(integer) from public,anon;
revoke all on function public.four_sapien_plan_food_until_payday_context() from public,anon;
grant execute on function public.four_sapien_finance_monthly_timeline(integer) to authenticated;
grant execute on function public.four_sapien_finance_twin(integer) to authenticated;
grant execute on function public.four_sapien_plan_food_until_payday_context() to authenticated;
