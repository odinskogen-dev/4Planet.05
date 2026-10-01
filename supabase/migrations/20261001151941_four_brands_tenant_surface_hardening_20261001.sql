-- 4BRANDS tenant surface hardening.
-- Applied to 4Planet_ OS as Supabase migration 20261001151941.
-- Public company analysis is served by the Pages API; Company Brain persistence is authenticated-only.

alter policy four_brands_accounts_update
  on public.four_brands_accounts to authenticated;
alter policy four_brands_balance_items_update
  on public.four_brands_balance_items to authenticated;
alter policy four_brands_money_events_update
  on public.four_brands_money_events to authenticated;

revoke all privileges on table
  public.four_brands_accounts,
  public.four_brands_audit_events,
  public.four_brands_balance_items,
  public.four_brands_companies,
  public.four_brands_decisions,
  public.four_brands_inbox,
  public.four_brands_interventions,
  public.four_brands_learning,
  public.four_brands_memberships,
  public.four_brands_memories,
  public.four_brands_metrics,
  public.four_brands_money_events,
  public.four_brands_opportunities,
  public.four_brands_results
from public, anon;

revoke truncate, references, trigger on table
  public.four_brands_accounts,
  public.four_brands_audit_events,
  public.four_brands_balance_items,
  public.four_brands_companies,
  public.four_brands_decisions,
  public.four_brands_inbox,
  public.four_brands_interventions,
  public.four_brands_learning,
  public.four_brands_memberships,
  public.four_brands_memories,
  public.four_brands_metrics,
  public.four_brands_money_events,
  public.four_brands_opportunities,
  public.four_brands_results
from authenticated;

grant select, insert, update, delete on table
  public.four_brands_accounts,
  public.four_brands_audit_events,
  public.four_brands_balance_items,
  public.four_brands_companies,
  public.four_brands_decisions,
  public.four_brands_inbox,
  public.four_brands_interventions,
  public.four_brands_learning,
  public.four_brands_memberships,
  public.four_brands_memories,
  public.four_brands_metrics,
  public.four_brands_money_events,
  public.four_brands_opportunities,
  public.four_brands_results
to authenticated;

revoke execute on function public.four_brands_preserve_company_creator() from public, anon;
revoke execute on function public.four_brands_preserve_scope() from public, anon;
revoke execute on function public.four_brands_touch_updated_at() from public, anon;
revoke execute on function public.four_brands_search_context(uuid,text,integer) from public, anon;
grant execute on function public.four_brands_search_context(uuid,text,integer) to authenticated;
