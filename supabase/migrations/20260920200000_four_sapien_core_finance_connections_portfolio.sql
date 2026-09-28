-- 4SAPIEN Core Finance 01
-- Additive contract only. This repository migration is NOT a production release.
-- Provider credentials belong in Edge Function secrets/Vault. Provider connection
-- references belong in the non-exposed four_sapien_private schema, never in public.

create schema if not exists four_sapien_private;
revoke all on schema four_sapien_private from public, anon, authenticated;
grant usage on schema four_sapien_private to service_role;

create table if not exists public.four_sapien_finance_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  access_mode text not null default 'read_only',
  institution_name text,
  status text not null default 'provider_not_configured',
  target_syncs_per_day smallint not null default 4,
  provider_daily_limit smallint,
  successful_syncs_today smallint not null default 0,
  sync_day date,
  consent_expires_at timestamptz,
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  next_sync_at timestamptz,
  provider_rate_limit_reset_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  disconnected_at timestamptz,
  constraint four_sapien_finance_connections_provider_format
    check (provider ~ '^[a-z][a-z0-9_]{1,63}$'),
  constraint four_sapien_finance_connections_read_only
    check (access_mode = 'read_only'),
  constraint four_sapien_finance_connections_status
    check (status in (
      'provider_not_configured', 'consent_required', 'connecting', 'healthy',
      'partial', 'stale', 'rate_limited', 'error', 'consent_expired', 'disconnected'
    )),
  constraint four_sapien_finance_connections_target
    check (target_syncs_per_day between 1 and 4),
  constraint four_sapien_finance_connections_provider_limit
    check (provider_daily_limit is null or provider_daily_limit between 1 and 96),
  constraint four_sapien_finance_connections_sync_count
    check (successful_syncs_today between 0 and 96),
  constraint four_sapien_finance_connections_owner_identity unique (id, user_id)
);

create table if not exists public.four_sapien_finance_sync_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null,
  state text not null,
  trigger_kind text not null default 'scheduled',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  accounts_updated integer not null default 0,
  transactions_imported integer not null default 0,
  provider_rate_limit_remaining integer,
  provider_rate_limit_reset_at timestamptz,
  error_code text,
  created_at timestamptz not null default now(),
  constraint four_sapien_finance_sync_runs_state
    check (state in ('running', 'succeeded', 'partial', 'failed', 'rate_limited', 'skipped')),
  constraint four_sapien_finance_sync_runs_trigger
    check (trigger_kind in ('scheduled', 'manual', 'consent_callback', 'recovery')),
  constraint four_sapien_finance_sync_runs_counts
    check (accounts_updated >= 0 and transactions_imported >= 0),
  constraint four_sapien_finance_sync_runs_rate_limit
    check (provider_rate_limit_remaining is null or provider_rate_limit_remaining >= 0),
  constraint four_sapien_finance_sync_runs_owner_connection_fk
    foreign key (connection_id, user_id)
    references public.four_sapien_finance_connections(id, user_id)
    on delete cascade
);

create table if not exists public.four_sapien_finance_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid,
  symbol text not null,
  instrument_name text,
  exchange_code text,
  currency text not null default 'NOK',
  quantity numeric(28, 8) not null,
  average_cost numeric(28, 8) not null,
  source text not null default 'manual',
  acquired_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint four_sapien_finance_holdings_symbol
    check (char_length(trim(symbol)) between 1 and 32),
  constraint four_sapien_finance_holdings_currency
    check (currency ~ '^[A-Z]{3}$'),
  constraint four_sapien_finance_holdings_quantity
    check (quantity > 0),
  constraint four_sapien_finance_holdings_average_cost
    check (average_cost >= 0),
  constraint four_sapien_finance_holdings_source
    check (source in ('manual', 'confirmed_import', 'licensed_provider')),
  constraint four_sapien_finance_holdings_owner_currency_identity unique (id, user_id, currency)
);

create table if not exists public.four_sapien_finance_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  holding_id uuid not null,
  price numeric(28, 8) not null,
  currency text not null,
  captured_at timestamptz not null,
  source text not null default 'manual',
  provider_name text,
  created_at timestamptz not null default now(),
  constraint four_sapien_finance_quotes_price check (price >= 0),
  constraint four_sapien_finance_quotes_currency check (currency ~ '^[A-Z]{3}$'),
  constraint four_sapien_finance_quotes_source
    check (source in ('manual', 'licensed_provider')),
  constraint four_sapien_finance_quotes_provider_truth
    check (
      (source = 'manual' and provider_name is null)
      or (source = 'licensed_provider' and nullif(trim(provider_name), '') is not null)
    ),
  constraint four_sapien_finance_quotes_owner_holding_currency_fk
    foreign key (holding_id, user_id, currency)
    references public.four_sapien_finance_holdings(id, user_id, currency)
    on delete cascade
);

create table if not exists four_sapien_private.finance_connection_refs (
  connection_id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_requisition_ref text not null,
  provider_account_refs jsonb not null default '[]'::jsonb,
  callback_state_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint four_sapien_private_provider_account_refs_array
    check (jsonb_typeof(provider_account_refs) = 'array'),
  constraint four_sapien_private_connection_owner_fk
    foreign key (connection_id, user_id)
    references public.four_sapien_finance_connections(id, user_id)
    on delete cascade
);

comment on table public.four_sapien_finance_connections is
  'Owner-visible read-only bank connection status. Contains no provider credential or provider connection reference.';
comment on table public.four_sapien_finance_holdings is
  'Owner-scoped manually entered or confirmed investment positions. No order/trade execution.';
comment on table public.four_sapien_finance_quotes is
  'Dated manual or licensed-provider market observations; source is mandatory truth.';
comment on table four_sapien_private.finance_connection_refs is
  'Server-only provider references. Global provider secrets remain in Edge Function secrets/Vault.';

create index if not exists four_sapien_finance_connections_user_status_idx
  on public.four_sapien_finance_connections(user_id, status)
  where disconnected_at is null;
create index if not exists four_sapien_finance_connections_due_idx
  on public.four_sapien_finance_connections(next_sync_at)
  where disconnected_at is null and status in ('healthy', 'partial', 'stale', 'rate_limited');
create index if not exists four_sapien_finance_sync_runs_connection_started_idx
  on public.four_sapien_finance_sync_runs(connection_id, started_at desc);
create index if not exists four_sapien_finance_sync_runs_user_started_idx
  on public.four_sapien_finance_sync_runs(user_id, started_at desc);
create index if not exists four_sapien_finance_holdings_user_currency_idx
  on public.four_sapien_finance_holdings(user_id, currency)
  where archived_at is null;
create index if not exists four_sapien_finance_quotes_holding_captured_idx
  on public.four_sapien_finance_quotes(holding_id, captured_at desc);
create index if not exists four_sapien_finance_quotes_user_idx
  on public.four_sapien_finance_quotes(user_id);
create index if not exists finance_connection_refs_user_idx
  on four_sapien_private.finance_connection_refs(user_id);

alter table public.four_sapien_finance_connections enable row level security;
alter table public.four_sapien_finance_sync_runs enable row level security;
alter table public.four_sapien_finance_holdings enable row level security;
alter table public.four_sapien_finance_quotes enable row level security;

drop policy if exists four_sapien_finance_connections_owner_select on public.four_sapien_finance_connections;
create policy four_sapien_finance_connections_owner_select
  on public.four_sapien_finance_connections
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists four_sapien_finance_sync_runs_owner_select on public.four_sapien_finance_sync_runs;
create policy four_sapien_finance_sync_runs_owner_select
  on public.four_sapien_finance_sync_runs
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists four_sapien_finance_holdings_owner_select on public.four_sapien_finance_holdings;
create policy four_sapien_finance_holdings_owner_select
  on public.four_sapien_finance_holdings
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists four_sapien_finance_holdings_owner_insert on public.four_sapien_finance_holdings;
create policy four_sapien_finance_holdings_owner_insert
  on public.four_sapien_finance_holdings
  for insert to authenticated
  with check ((select auth.uid()) = user_id and source = 'manual');

drop policy if exists four_sapien_finance_holdings_owner_update on public.four_sapien_finance_holdings;
create policy four_sapien_finance_holdings_owner_update
  on public.four_sapien_finance_holdings
  for update to authenticated
  using ((select auth.uid()) = user_id and source = 'manual')
  with check ((select auth.uid()) = user_id and source = 'manual');

drop policy if exists four_sapien_finance_holdings_owner_delete on public.four_sapien_finance_holdings;
create policy four_sapien_finance_holdings_owner_delete
  on public.four_sapien_finance_holdings
  for delete to authenticated
  using ((select auth.uid()) = user_id and source = 'manual');

drop policy if exists four_sapien_finance_quotes_owner_select on public.four_sapien_finance_quotes;
create policy four_sapien_finance_quotes_owner_select
  on public.four_sapien_finance_quotes
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists four_sapien_finance_quotes_owner_insert on public.four_sapien_finance_quotes;
create policy four_sapien_finance_quotes_owner_insert
  on public.four_sapien_finance_quotes
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and source = 'manual'
    and exists (
      select 1 from public.four_sapien_finance_holdings holding
      where holding.id = four_sapien_finance_quotes.holding_id
        and holding.user_id = (select auth.uid())
        and holding.currency = four_sapien_finance_quotes.currency
    )
  );

drop policy if exists four_sapien_finance_quotes_owner_update on public.four_sapien_finance_quotes;
create policy four_sapien_finance_quotes_owner_update
  on public.four_sapien_finance_quotes
  for update to authenticated
  using ((select auth.uid()) = user_id and source = 'manual')
  with check (
    (select auth.uid()) = user_id
    and source = 'manual'
    and exists (
      select 1 from public.four_sapien_finance_holdings holding
      where holding.id = four_sapien_finance_quotes.holding_id
        and holding.user_id = (select auth.uid())
        and holding.currency = four_sapien_finance_quotes.currency
    )
  );

drop policy if exists four_sapien_finance_quotes_owner_delete on public.four_sapien_finance_quotes;
create policy four_sapien_finance_quotes_owner_delete
  on public.four_sapien_finance_quotes
  for delete to authenticated
  using ((select auth.uid()) = user_id and source = 'manual');

revoke all on table public.four_sapien_finance_connections from public, anon, authenticated;
revoke all on table public.four_sapien_finance_sync_runs from public, anon, authenticated;
revoke all on table public.four_sapien_finance_holdings from public, anon, authenticated;
revoke all on table public.four_sapien_finance_quotes from public, anon, authenticated;
grant select on table public.four_sapien_finance_connections to authenticated;
grant select on table public.four_sapien_finance_sync_runs to authenticated;
grant select, insert, update, delete on table public.four_sapien_finance_holdings to authenticated;
grant select, insert, update, delete on table public.four_sapien_finance_quotes to authenticated;
grant all on table public.four_sapien_finance_connections to service_role;
grant all on table public.four_sapien_finance_sync_runs to service_role;
grant all on table public.four_sapien_finance_holdings to service_role;
grant all on table public.four_sapien_finance_quotes to service_role;

revoke all on table four_sapien_private.finance_connection_refs from public, anon, authenticated;
grant all on table four_sapien_private.finance_connection_refs to service_role;

create or replace function four_sapien_private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

revoke all on function four_sapien_private.touch_updated_at() from public, anon, authenticated;
grant execute on function four_sapien_private.touch_updated_at() to service_role;

drop trigger if exists four_sapien_finance_connections_touch_updated_at on public.four_sapien_finance_connections;
create trigger four_sapien_finance_connections_touch_updated_at
  before update on public.four_sapien_finance_connections
  for each row execute function four_sapien_private.touch_updated_at();

drop trigger if exists four_sapien_finance_holdings_touch_updated_at on public.four_sapien_finance_holdings;
create trigger four_sapien_finance_holdings_touch_updated_at
  before update on public.four_sapien_finance_holdings
  for each row execute function four_sapien_private.touch_updated_at();

drop trigger if exists four_sapien_private_connection_refs_touch_updated_at on four_sapien_private.finance_connection_refs;
create trigger four_sapien_private_connection_refs_touch_updated_at
  before update on four_sapien_private.finance_connection_refs
  for each row execute function four_sapien_private.touch_updated_at();

create or replace view public.four_sapien_finance_portfolio
with (security_invoker = true)
as
select
  holding.id,
  holding.user_id,
  holding.account_id,
  holding.symbol,
  holding.instrument_name,
  holding.exchange_code,
  holding.currency,
  holding.quantity,
  holding.average_cost,
  round(holding.quantity * holding.average_cost, 2) as cost_basis,
  quote.price as current_price,
  quote.captured_at as quote_as_of,
  quote.source as quote_source,
  quote.provider_name as quote_provider,
  case when quote.price is null then null else round(holding.quantity * quote.price, 2) end as market_value,
  case when quote.price is null then null else round(holding.quantity * (quote.price - holding.average_cost), 2) end as unrealised_change,
  holding.source as holding_source,
  holding.updated_at
from public.four_sapien_finance_holdings holding
left join lateral (
  select candidate.price, candidate.captured_at, candidate.source, candidate.provider_name
  from public.four_sapien_finance_quotes candidate
  where candidate.holding_id = holding.id
    and candidate.user_id = holding.user_id
    and candidate.currency = holding.currency
  order by candidate.captured_at desc, candidate.id desc
  limit 1
) quote on true
where holding.archived_at is null;

revoke all on table public.four_sapien_finance_portfolio from public, anon;
grant select on table public.four_sapien_finance_portfolio to authenticated, service_role;

comment on view public.four_sapien_finance_portfolio is
  'Owner-filtered portfolio arithmetic. Values remain per instrument currency; no implicit FX conversion and no advice.';
