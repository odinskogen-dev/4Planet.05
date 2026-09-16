-- 4BRANDS Company Twin Premium Foundation 02
-- Sandbox/staging migration only. Reuses auth.users / 4PLANET Identity and mirrors established 4SAPIEN truth/provenance conventions.

create extension if not exists pgcrypto;

create table if not exists public.four_brands_companies (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  legal_name text,
  website text,
  jurisdiction text,
  public_model jsonb not null default '{}'::jsonb,
  claim_state text not null default 'unverified' check (claim_state in ('unverified','pending','verified')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.four_brands_memberships (
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','finance','editor','viewer')),
  status text not null default 'active' check (status in ('active','invited','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id,user_id)
);

create or replace function public.four_brands_member_role(p_company_id uuid)
returns text language sql stable security definer set search_path = public, pg_temp as $$
  select m.role from public.four_brands_memberships m
  where m.company_id = p_company_id and m.user_id = auth.uid() and m.status = 'active'
  limit 1
$$;
revoke all on function public.four_brands_member_role(uuid) from public;
grant execute on function public.four_brands_member_role(uuid) to authenticated;

create table if not exists public.four_brands_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  name text not null,
  kind text not null,
  currency text not null default 'NOK',
  balance numeric(18,2),
  as_of date not null default current_date,
  source text not null default 'manual',
  truth_class text not null default 'FACT' check (truth_class in ('FACT','CALCULATION','ESTIMATE','ASSUMPTION','INTERPRETATION','UNKNOWN')),
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.four_brands_money_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  account_id uuid references public.four_brands_accounts(id) on delete set null,
  direction text not null check (direction in ('in','out')),
  kind text not null,
  status text not null default 'actual' check (status in ('actual','planned','forecast','scenario')),
  amount numeric(18,2) not null check (amount >= 0),
  currency text not null default 'NOK',
  event_date date not null,
  recurrence text not null default 'once' check (recurrence in ('once','monthly','quarterly','yearly')),
  description text not null,
  counterparty text,
  category text,
  public_charge boolean not null default false,
  source text not null default 'manual',
  truth_class text not null default 'FACT' check (truth_class in ('FACT','CALCULATION','ESTIMATE','ASSUMPTION','INTERPRETATION','UNKNOWN')),
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.four_brands_balance_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  kind text not null check (kind in ('asset','debt')),
  name text not null,
  category text,
  amount numeric(18,2) not null check (amount >= 0),
  currency text not null default 'NOK',
  as_of date not null default current_date,
  source text not null default 'manual',
  truth_class text not null default 'FACT' check (truth_class in ('FACT','CALCULATION','ESTIMATE','ASSUMPTION','INTERPRETATION','UNKNOWN')),
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.four_brands_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  metric_key text not null,
  value numeric,
  text_value text,
  unit text,
  currency text,
  period_start date,
  period_end date,
  scenario text not null default 'actual' check (scenario in ('actual','planned','forecast','scenario')),
  source text not null,
  truth_class text not null default 'FACT' check (truth_class in ('FACT','CALCULATION','ESTIMATE','ASSUMPTION','INTERPRETATION','UNKNOWN')),
  confidence text,
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.four_brands_opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  title text not null,
  detector_key text,
  status text not null default 'identified',
  value_low numeric,
  value_high numeric,
  currency text,
  why text,
  calculation jsonb not null default '{}'::jsonb,
  assumptions jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  confidence text,
  falsifier text,
  possible_intervention text,
  time_to_value text,
  truth_class text not null default 'INTERPRETATION' check (truth_class in ('FACT','CALCULATION','ESTIMATE','ASSUMPTION','INTERPRETATION','UNKNOWN')),
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.four_brands_decisions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  opportunity_id uuid references public.four_brands_opportunities(id) on delete set null,
  title text not null,
  state text not null default 'OPPORTUNITY',
  attribution_strength text not null default 'IDENTIFIED',
  baseline jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.four_brands_interventions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  decision_id uuid not null references public.four_brands_decisions(id) on delete cascade,
  title text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'planned',
  expected_value_low numeric,
  expected_value_high numeric,
  currency text,
  measurement_window jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.four_brands_results (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  intervention_id uuid not null references public.four_brands_interventions(id) on delete cascade,
  metric_key text,
  baseline_value numeric,
  measured_value numeric,
  attributable_value numeric,
  currency text,
  attribution_strength text not null default 'IDENTIFIED',
  conclusion text,
  evidence jsonb not null default '[]'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  measured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.four_brands_inbox (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  kind text not null check (kind in ('new_information','proposed_update','conflict','missing_information','requires_confirmation')),
  title text not null,
  detail text,
  status text not null default 'open' check (status in ('open','accepted','rejected','resolved')),
  payload jsonb not null default '{}'::jsonb,
  source text,
  provenance jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null
);

create table if not exists public.four_brands_audit_events (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.four_brands_companies(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  object_type text not null,
  object_id text not null,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz not null default now()
);

create index if not exists four_brands_memberships_user_idx on public.four_brands_memberships(user_id,status);
create index if not exists four_brands_money_events_company_date_idx on public.four_brands_money_events(company_id,event_date);
create index if not exists four_brands_metrics_company_period_idx on public.four_brands_metrics(company_id,metric_key,period_end);
create index if not exists four_brands_opportunities_company_idx on public.four_brands_opportunities(company_id,status);
create index if not exists four_brands_inbox_company_idx on public.four_brands_inbox(company_id,status,created_at desc);
create index if not exists four_brands_audit_company_idx on public.four_brands_audit_events(company_id,created_at desc);

create or replace function public.four_brands_touch_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin new.updated_at = now(); return new; end $$;

create or replace function public.four_brands_audit_row()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare c_id uuid; o_id text;
begin
  c_id := coalesce((to_jsonb(new)->>'company_id')::uuid,(to_jsonb(old)->>'company_id')::uuid);
  o_id := coalesce(to_jsonb(new)->>'id',to_jsonb(old)->>'id','unknown');
  insert into public.four_brands_audit_events(company_id,actor_user_id,object_type,object_id,action,before_state,after_state)
  values(c_id,auth.uid(),tg_table_name,o_id,tg_op,case when tg_op='INSERT' then null else to_jsonb(old) end,case when tg_op='DELETE' then null else to_jsonb(new) end);
  return coalesce(new,old);
end $$;

-- Tenant isolation: every private object is company-scoped and membership-gated.
alter table public.four_brands_companies enable row level security;
alter table public.four_brands_memberships enable row level security;
alter table public.four_brands_accounts enable row level security;
alter table public.four_brands_money_events enable row level security;
alter table public.four_brands_balance_items enable row level security;
alter table public.four_brands_metrics enable row level security;
alter table public.four_brands_opportunities enable row level security;
alter table public.four_brands_decisions enable row level security;
alter table public.four_brands_interventions enable row level security;
alter table public.four_brands_results enable row level security;
alter table public.four_brands_inbox enable row level security;
alter table public.four_brands_audit_events enable row level security;

create policy four_brands_companies_insert on public.four_brands_companies for insert to authenticated with check (created_by = (select auth.uid()));
create policy four_brands_companies_select on public.four_brands_companies for select to authenticated using (created_by = (select auth.uid()) or public.four_brands_member_role(id) is not null);
create policy four_brands_companies_update on public.four_brands_companies for update to authenticated using (public.four_brands_member_role(id) in ('owner','admin','editor')) with check (public.four_brands_member_role(id) in ('owner','admin','editor'));

create policy four_brands_memberships_select on public.four_brands_memberships for select to authenticated using (user_id = (select auth.uid()) or public.four_brands_member_role(company_id) in ('owner','admin'));
create policy four_brands_memberships_insert on public.four_brands_memberships for insert to authenticated with check (
  (user_id=(select auth.uid()) and role='owner' and exists(select 1 from public.four_brands_companies c where c.id=company_id and c.created_by=(select auth.uid())))
  or public.four_brands_member_role(company_id) in ('owner','admin')
);
create policy four_brands_memberships_update on public.four_brands_memberships for update to authenticated using (public.four_brands_member_role(company_id) in ('owner','admin')) with check (public.four_brands_member_role(company_id) in ('owner','admin'));
create policy four_brands_memberships_delete on public.four_brands_memberships for delete to authenticated using (public.four_brands_member_role(company_id) in ('owner','admin'));

-- Financial truth: members read; owner/admin/finance/editor write.
do $$
declare t text;
begin
  foreach t in array array['four_brands_accounts','four_brands_money_events','four_brands_balance_items','four_brands_metrics'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.four_brands_member_role(company_id) is not null)',t||'_select',t);
    execute format('create policy %I on public.%I for insert to authenticated with check (created_by=(select auth.uid()) and public.four_brands_member_role(company_id) in (''owner'',''admin'',''finance'',''editor''))',t||'_insert',t);
    execute format('create policy %I on public.%I for update to authenticated using (public.four_brands_member_role(company_id) in (''owner'',''admin'',''finance'',''editor'')) with check (public.four_brands_member_role(company_id) in (''owner'',''admin'',''finance'',''editor''))',t||'_update',t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.four_brands_member_role(company_id) in (''owner'',''admin''))',t||'_delete',t);
  end loop;
end $$;

-- Value/decision objects: members read; decision-capable roles write.
do $$
declare t text;
begin
  foreach t in array array['four_brands_opportunities','four_brands_decisions','four_brands_interventions','four_brands_results'] loop
    execute format('create policy %I on public.%I for select to authenticated using (public.four_brands_member_role(company_id) is not null)',t||'_select',t);
    execute format('create policy %I on public.%I for insert to authenticated with check (created_by=(select auth.uid()) and public.four_brands_member_role(company_id) in (''owner'',''admin'',''finance'',''editor''))',t||'_insert',t);
    execute format('create policy %I on public.%I for update to authenticated using (public.four_brands_member_role(company_id) in (''owner'',''admin'',''finance'',''editor'')) with check (public.four_brands_member_role(company_id) in (''owner'',''admin'',''finance'',''editor''))',t||'_update',t);
    execute format('create policy %I on public.%I for delete to authenticated using (public.four_brands_member_role(company_id) in (''owner'',''admin''))',t||'_delete',t);
  end loop;
end $$;

create policy four_brands_inbox_select on public.four_brands_inbox for select to authenticated using (public.four_brands_member_role(company_id) is not null);
create policy four_brands_inbox_insert on public.four_brands_inbox for insert to authenticated with check (created_by=(select auth.uid()) and public.four_brands_member_role(company_id) in ('owner','admin','finance','editor'));
create policy four_brands_inbox_update on public.four_brands_inbox for update to authenticated using (public.four_brands_member_role(company_id) in ('owner','admin','finance','editor')) with check (public.four_brands_member_role(company_id) in ('owner','admin','finance','editor'));
create policy four_brands_audit_select on public.four_brands_audit_events for select to authenticated using (public.four_brands_member_role(company_id) is not null);

-- Updated-at + immutable audit hooks.
do $$
declare t text;
begin
  foreach t in array array['four_brands_companies','four_brands_memberships','four_brands_accounts','four_brands_money_events','four_brands_balance_items','four_brands_metrics','four_brands_opportunities','four_brands_decisions','four_brands_interventions','four_brands_results'] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.four_brands_touch_updated_at()',t||'_touch',t);
  end loop;
  foreach t in array array['four_brands_accounts','four_brands_money_events','four_brands_balance_items','four_brands_metrics','four_brands_opportunities','four_brands_decisions','four_brands_interventions','four_brands_results','four_brands_inbox'] loop
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.four_brands_audit_row()',t||'_audit',t);
  end loop;
end $$;

grant select,insert,update,delete on public.four_brands_companies to authenticated;
grant select,insert,update,delete on public.four_brands_memberships to authenticated;
grant select,insert,update,delete on public.four_brands_accounts to authenticated;
grant select,insert,update,delete on public.four_brands_money_events to authenticated;
grant select,insert,update,delete on public.four_brands_balance_items to authenticated;
grant select,insert,update,delete on public.four_brands_metrics to authenticated;
grant select,insert,update,delete on public.four_brands_opportunities to authenticated;
grant select,insert,update,delete on public.four_brands_decisions to authenticated;
grant select,insert,update,delete on public.four_brands_interventions to authenticated;
grant select,insert,update on public.four_brands_inbox to authenticated;
grant select on public.four_brands_audit_events to authenticated;
