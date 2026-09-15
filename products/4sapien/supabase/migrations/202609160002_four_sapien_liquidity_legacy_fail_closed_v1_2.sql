-- 4SAPIEN liquidity legacy compatibility v1.2
-- Existing Embla v6 interprets account_count=0 as UNKNOWN. Fail closed on partial balances.
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
  select 'NOK'::text,
         case when total_count=0 or known_count<total_count then null::bigint else known_sum end,
         case when total_count=0 or known_count<total_count then 0::bigint else total_count end
  from x;
$function$;
