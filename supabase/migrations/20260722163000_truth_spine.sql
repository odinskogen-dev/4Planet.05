create extension if not exists postgis;

-- Supabase may install PostGIS outside public (canonical staging uses gis).
-- Keep this migration portable without moving the extension or changing the data model.
set search_path = public, gis;

create table if not exists public.source_records (
  id text primary key,
  source_id text not null,
  source_record_id text not null,
  source_url text not null check (source_url ~ '^https://'),
  dataset_id text,
  retrieved_at timestamptz not null,
  licence text not null,
  attribution text not null,
  rights_status text not null check (rights_status in ('ACCEPTABLE','CONDITIONAL','EXPERIMENTAL','BLOCKED')),
  visibility text not null check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  sensitivity text not null default 'NONE' check (sensitivity in ('NONE','GENERALIZED','RESTRICTED')),
  content_sha256 text,
  raw_payload jsonb not null,
  unique (source_id, source_record_id, retrieved_at)
);

create or replace function public.reject_source_record_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'source_records are immutable; insert a new version';
end;
$$;
alter function public.reject_source_record_mutation() set search_path = public, pg_temp;

drop trigger if exists source_records_immutable on public.source_records;
create trigger source_records_immutable
before update or delete on public.source_records
for each row execute function public.reject_source_record_mutation();

create table if not exists public.taxon_observations (
  id text primary key,
  source_record_id text not null references public.source_records(id),
  taxon_id text not null,
  occurred_at timestamptz,
  geom geography(point, 4326) not null,
  basis_of_record text not null,
  source_issues text[] not null default '{}',
  place_membership text not null default 'UNASSESSED' check (place_membership in ('UNASSESSED','SOURCE_ASSERTED','GEOMETRY_MATCH','REVIEWED')),
  visibility text not null check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  sensitivity text not null default 'NONE' check (sensitivity in ('NONE','GENERALIZED','RESTRICTED')),
  created_at timestamptz not null default now()
);
create index if not exists taxon_observations_geom_idx on public.taxon_observations using gist (geom);
create index if not exists taxon_observations_taxon_idx on public.taxon_observations (taxon_id, occurred_at desc);

create table if not exists public.signals (
  id text primary key,
  signal_class text not null,
  detected_at timestamptz not null,
  method text not null,
  source_record_ids text[] not null,
  review_status text not null check (review_status in ('UNREVIEWED','LITERATURE_CHECKED','EXPERT_REVIEWED')),
  evidence_strength text not null check (evidence_strength in ('INSUFFICIENT','EMERGING','MODERATE','STRONG')),
  visibility text not null check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  created_at timestamptz not null default now(),
  check (cardinality(source_record_ids) > 0)
);

create table if not exists public.interpretations (
  id text primary key,
  about_record_ids text[] not null,
  body text not null,
  interpretation_status text not null check (interpretation_status in ('SOURCE_STATEMENT','PRODUCT_CONTEXT','PUBLIC_SAFE')),
  review_status text not null check (review_status in ('UNREVIEWED','LITERATURE_CHECKED','EXPERT_REVIEWED')),
  evidence_strength text not null check (evidence_strength in ('INSUFFICIENT','EMERGING','MODERATE','STRONG')),
  limitations text[] not null default '{}',
  visibility text not null check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  created_at timestamptz not null default now(),
  check (cardinality(about_record_ids) > 0)
);

create table if not exists public.impact_unit_definitions (
  id text primary key,
  slug text unique not null,
  name text not null,
  mission_id text not null,
  unit_quantity numeric not null check (unit_quantity > 0),
  unit_label text not null,
  environment text not null check (environment in ('FIXTURE','TEST','PRODUCTION')),
  provider_capability text not null,
  disclosure text not null
);

create table if not exists public.contributions (
  id text primary key,
  impact_unit_id text not null references public.impact_unit_definitions(id),
  quantity numeric not null check (quantity > 0),
  status text not null check (status in ('CREATED','CONFIRMED','CANCELLED','FAILED')),
  environment text not null check (environment in ('FIXTURE','TEST','PRODUCTION')),
  idempotency_key text unique not null,
  contributor_ref uuid,
  disclosure text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id text primary key,
  contribution_id text not null references public.contributions(id),
  provider_id text not null,
  provider_reference text not null,
  status text not null check (status in ('NOT_DELIVERED','SCHEDULED','PROVIDER_REPORTED','EVIDENCE_ATTACHED','REFUNDED','DISPUTED')),
  environment text not null check (environment in ('FIXTURE','TEST','PRODUCTION')),
  evidence_refs text[] not null default '{}',
  reported_at timestamptz,
  disclosure text not null,
  unique (provider_id, provider_reference)
);

create table if not exists public.outcomes (
  id text primary key,
  delivery_id text not null references public.deliveries(id),
  status text not null check (status in ('NOT_ASSESSED','PROVIDER_CLAIMED','INDEPENDENTLY_REVIEWED','UNVERIFIED')),
  claim text,
  evidence_refs text[] not null default '{}',
  assessed_at timestamptz
);

create table if not exists public.impacts (
  id text primary key,
  outcome_ids text[] not null,
  status text not null check (status in ('NOT_ASSESSED','MODELLED','EVIDENCED','VERIFIED')),
  claim text,
  method text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_contexts (
  id text primary key,
  entity_id text not null,
  journey_id text not null,
  source_record_ids text[] not null default '{}',
  observation_ids text[] not null default '{}',
  signal_ids text[] not null default '{}',
  interpretation_ids text[] not null default '{}',
  visibility text not null check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  persisted_at timestamptz not null default now(),
  disclosure text not null
);

alter table public.source_records enable row level security;
alter table public.taxon_observations enable row level security;
alter table public.signals enable row level security;
alter table public.interpretations enable row level security;
alter table public.impact_unit_definitions enable row level security;
alter table public.contributions enable row level security;
alter table public.deliveries enable row level security;
alter table public.outcomes enable row level security;
alter table public.impacts enable row level security;
alter table public.product_contexts enable row level security;

create policy source_records_public_read on public.source_records for select to anon, authenticated
using (visibility = 'PUBLIC' and rights_status in ('ACCEPTABLE','CONDITIONAL') and sensitivity <> 'RESTRICTED');
create policy observations_public_read on public.taxon_observations for select to anon, authenticated
using (visibility = 'PUBLIC' and sensitivity <> 'RESTRICTED');
create policy signals_public_read on public.signals for select to anon, authenticated
using (visibility = 'PUBLIC');
create policy interpretations_public_read on public.interpretations for select to anon, authenticated
using (visibility = 'PUBLIC');
create policy impact_units_public_read on public.impact_unit_definitions for select to anon, authenticated
using (environment in ('FIXTURE','TEST'));
create policy product_contexts_public_read on public.product_contexts for select to anon, authenticated
using (visibility = 'PUBLIC');

grant usage on schema public to anon, authenticated;
grant select on public.source_records, public.taxon_observations, public.signals,
  public.interpretations, public.impact_unit_definitions, public.product_contexts to anon, authenticated;
revoke all on public.contributions, public.deliveries, public.outcomes, public.impacts from anon, authenticated;

comment on table public.taxon_observations is 'Observations are source records, not Signals. Query geometry does not establish semantic Place membership.';
comment on table public.contributions is 'Payment/contribution state only. It is not proof of provider delivery.';
comment on table public.deliveries is 'Provider delivery state only. It is not ecological outcome or system impact.';
comment on table public.outcomes is 'Measured or claimed outcome state. It is separate from system-level impact.';
