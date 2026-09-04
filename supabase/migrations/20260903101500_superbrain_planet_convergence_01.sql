-- 4PLANET SUPERBRAIN — PLANET / NATURE BRAIN CONVERGENCE 01
-- Non-destructive SHADOW hardening. BRAIN / Knowledge OS remains authority.
-- One SUPERBRAIN, one canonical identity spine, private by default, explicit public projection only.

begin;

-- ---------------------------------------------------------------------------
-- CONTROLLED VOCABULARIES
-- ---------------------------------------------------------------------------
do $$ begin
  create type cns.visibility_state as enum (
    'PRIVATE','INTERNAL','RESTRICTED','PUBLIC_CANDIDATE','PUBLIC_VERIFIED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type cns.nature_sensitivity_state as enum (
    'NONE','GENERALIZED','SENSITIVE_NATURE'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type cns.review_state as enum (
    'UNREVIEWED','REVIEWED','SOURCE_CHECKED','INDEPENDENTLY_VERIFIED','DISPUTED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type cns.evidence_strength_state as enum (
    'UNAVAILABLE','WEAK','MODERATE','STRONG','INDEPENDENTLY_CORROBORATED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type cns.interpretation_state as enum (
    'RAW_OBSERVATION','NORMALISED_RECORD','SYSTEM_INTERPRETATION','PUBLIC_EXPLANATION'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type cns.freshness_state as enum (
    'NOT_CHECKED','CURRENT','STALE','NO_COVERAGE','SOURCE_UNAVAILABLE'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type cns.rights_state as enum (
    'ALLOW','CONDITIONAL','BLOCK','UNKNOWN'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- DEFENCE IN DEPTH: CNS IS NEVER A PUBLIC DATA SCHEMA
-- ---------------------------------------------------------------------------
revoke all on schema cns from public, anon, authenticated;
grant usage on schema cns to service_role;

do $$
declare r record;
begin
  for r in
    select schemaname, tablename
    from pg_tables
    where schemaname='cns'
  loop
    execute format('alter table %I.%I enable row level security', r.schemaname, r.tablename);
    execute format('revoke all on table %I.%I from public, anon, authenticated', r.schemaname, r.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- UNIFIED VISIBILITY / TRUTH AXES ON CORE CANONICAL OBJECTS
-- ---------------------------------------------------------------------------
alter table cns.projects add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.decisions add column if not exists visibility_state cns.visibility_state not null default 'PRIVATE';
alter table cns.source_registry add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.source_registry add column if not exists rights_state cns.rights_state not null default 'UNKNOWN';
alter table cns.source_registry add column if not exists licence text;
alter table cns.source_registry add column if not exists attribution text;
alter table cns.source_registry add column if not exists source_quality_state text not null default 'UNASSESSED';
alter table cns.source_registry add column if not exists freshness_state cns.freshness_state not null default 'NOT_CHECKED';
alter table cns.source_revisions add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.source_revisions add column if not exists rights_state cns.rights_state not null default 'UNKNOWN';

alter table cns.entities add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.entities add column if not exists nature_sensitivity_state cns.nature_sensitivity_state not null default 'NONE';
alter table cns.entities add column if not exists review_state cns.review_state not null default 'UNREVIEWED';
alter table cns.entities add column if not exists evidence_strength cns.evidence_strength_state not null default 'UNAVAILABLE';
alter table cns.entities add column if not exists revision integer not null default 1 check (revision > 0);
alter table cns.entities add column if not exists geom_private gis.geometry(Geometry,4326);
alter table cns.entities add column if not exists geom_public gis.geometry(Geometry,4326);
alter table cns.entities add column if not exists spatial_precision_m numeric;
alter table cns.entities add column if not exists public_precision_m numeric;
alter table cns.entities add column if not exists boundary_semantics text;

alter table cns.methodologies add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.methodologies add column if not exists review_state cns.review_state not null default 'UNREVIEWED';
alter table cns.methodologies add column if not exists evidence_strength cns.evidence_strength_state not null default 'UNAVAILABLE';

alter table cns.observations add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.observations add column if not exists nature_sensitivity_class cns.nature_sensitivity_state not null default 'NONE';
alter table cns.observations add column if not exists review_state cns.review_state not null default 'UNREVIEWED';
alter table cns.observations add column if not exists evidence_strength cns.evidence_strength_state not null default 'UNAVAILABLE';
alter table cns.observations add column if not exists interpretation_state cns.interpretation_state not null default 'NORMALISED_RECORD';
alter table cns.observations add column if not exists freshness_state cns.freshness_state not null default 'NOT_CHECKED';
alter table cns.observations add column if not exists geom_private gis.geometry(Point,4326);
alter table cns.observations add column if not exists geom_public gis.geometry(Point,4326);

alter table cns.signals add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.signals add column if not exists review_state cns.review_state not null default 'UNREVIEWED';
alter table cns.signals add column if not exists evidence_strength cns.evidence_strength_state not null default 'UNAVAILABLE';
alter table cns.signals add column if not exists interpretation_state cns.interpretation_state not null default 'SYSTEM_INTERPRETATION';
alter table cns.signals add column if not exists freshness_state cns.freshness_state not null default 'NOT_CHECKED';

alter table cns.interpretations add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.interpretations add column if not exists review_state cns.review_state not null default 'UNREVIEWED';
alter table cns.interpretations add column if not exists evidence_strength cns.evidence_strength_state not null default 'UNAVAILABLE';
alter table cns.interpretations add column if not exists interpretation_state cns.interpretation_state not null default 'SYSTEM_INTERPRETATION';
alter table cns.interpretations add column if not exists freshness_state cns.freshness_state not null default 'NOT_CHECKED';

alter table cns.claims add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.claims add column if not exists review_state cns.review_state not null default 'UNREVIEWED';
alter table cns.claims add column if not exists evidence_strength cns.evidence_strength_state not null default 'UNAVAILABLE';
alter table cns.claims add column if not exists interpretation_state cns.interpretation_state not null default 'NORMALISED_RECORD';
alter table cns.claims add column if not exists freshness_state cns.freshness_state not null default 'NOT_CHECKED';

alter table cns.evidence add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.evidence add column if not exists review_state cns.review_state not null default 'UNREVIEWED';
alter table cns.evidence add column if not exists evidence_strength cns.evidence_strength_state not null default 'UNAVAILABLE';
alter table cns.evidence add column if not exists rights_state cns.rights_state not null default 'UNKNOWN';

alter table cns.outcomes add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';
alter table cns.learnings add column if not exists visibility_state cns.visibility_state not null default 'PRIVATE';
alter table cns.memory_items add column if not exists visibility_state cns.visibility_state not null default 'PRIVATE';
alter table cns.provenance_edges add column if not exists visibility_state cns.visibility_state not null default 'INTERNAL';

create index if not exists cns_entities_type_visibility_idx on cns.entities(entity_type,visibility_state,lifecycle);
create index if not exists cns_entities_geom_public_idx on cns.entities using gist(geom_public) where geom_public is not null;
create index if not exists cns_observations_entity_time_idx on cns.observations(entity_id,observed_at desc);
create index if not exists cns_observations_geom_public_idx on cns.observations using gist(geom_public) where geom_public is not null;
create index if not exists cns_claims_subject_visibility_idx on cns.claims(subject_type,subject_id,visibility_state,state);

-- ---------------------------------------------------------------------------
-- CANONICAL PLANET INGEST: DATASET + IMMUTABLE SOURCE RECORD
-- ---------------------------------------------------------------------------
create table if not exists cns.datasets (
  dataset_id text primary key,
  source_id text not null references cns.source_registry(source_id) on delete restrict,
  upstream_dataset_id text,
  title text not null,
  publisher text,
  scope jsonb not null default '{}'::jsonb,
  geography jsonb not null default '{}'::jsonb,
  temporal_coverage jsonb not null default '{}'::jsonb,
  update_frequency text,
  licence text,
  attribution text,
  rights_state cns.rights_state not null default 'UNKNOWN',
  limitations jsonb not null default '[]'::jsonb,
  visibility_state cns.visibility_state not null default 'INTERNAL',
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DEGRADED','INACTIVE','SUPERSEDED','ARCHIVED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_id,upstream_dataset_id)
);

create table if not exists cns.source_records (
  source_record_id text primary key,
  source_id text not null references cns.source_registry(source_id) on delete restrict,
  dataset_id text references cns.datasets(dataset_id) on delete restrict,
  upstream_record_id text,
  retrieval_uri text,
  retrieved_at timestamptz not null,
  source_timestamp timestamptz,
  payload_hash text not null,
  raw_payload jsonb not null,
  licence text,
  attribution text,
  rights_state cns.rights_state not null default 'UNKNOWN',
  limitations jsonb not null default '[]'::jsonb,
  parse_state text not null default 'UNPARSED' check (parse_state in ('UNPARSED','VALID','INVALID','RIGHTS_BLOCKED','SUPERSEDED')),
  visibility_state cns.visibility_state not null default 'INTERNAL',
  nature_sensitivity_state cns.nature_sensitivity_state not null default 'NONE',
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now()
);

create index if not exists cns_source_records_source_time_idx on cns.source_records(source_id,retrieved_at desc);
create index if not exists cns_source_records_dataset_idx on cns.source_records(dataset_id,upstream_record_id);

create or replace function cns.reject_source_record_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'CNS_SOURCE_RECORD_IMMUTABLE: append a new source record/revision';
end;
$$;

drop trigger if exists cns_source_records_immutable on cns.source_records;
create trigger cns_source_records_immutable
before update or delete on cns.source_records
for each row execute function cns.reject_source_record_mutation();

alter table cns.observations add column if not exists source_record_id text references cns.source_records(source_record_id) on delete restrict;

-- ---------------------------------------------------------------------------
-- ONE GENERAL RELATIONSHIP GRAPH FOR PLANET + ACTOR + SOLUTION INTELLIGENCE
-- Claims can target relationship_id; evidence can support/contradict the claim.
-- ---------------------------------------------------------------------------
create table if not exists cns.relationships (
  relationship_id text primary key,
  subject_entity_id text not null references cns.entities(entity_id) on delete restrict,
  predicate text not null,
  object_entity_id text not null references cns.entities(entity_id) on delete restrict,
  relationship_kind text not null default 'STRUCTURAL',
  project_id text references cns.projects(project_id) on delete restrict,
  source_id text references cns.source_registry(source_id) on delete restrict,
  source_revision text,
  valid_time_start timestamptz,
  valid_time_end timestamptz,
  scope jsonb not null default '{}'::jsonb,
  review_state cns.review_state not null default 'UNREVIEWED',
  evidence_strength cns.evidence_strength_state not null default 'UNAVAILABLE',
  interpretation_state cns.interpretation_state not null default 'NORMALISED_RECORD',
  visibility_state cns.visibility_state not null default 'INTERNAL',
  state text not null default 'ACTIVE' check (state in ('ACTIVE','DISPUTED','SUPERSEDED','REJECTED','ARCHIVED')),
  revision integer not null default 1 check (revision > 0),
  supersedes_relationship_id text references cns.relationships(relationship_id) on delete restrict,
  last_event_id bigint references cns.events(event_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (subject_entity_id <> object_entity_id or predicate not in ('SAME_AS','DEPENDS_ON')),
  check (valid_time_end is null or valid_time_start is null or valid_time_end >= valid_time_start)
);

create index if not exists cns_relationships_subject_idx on cns.relationships(subject_entity_id,predicate,state);
create index if not exists cns_relationships_object_idx on cns.relationships(object_entity_id,predicate,state);
create index if not exists cns_relationships_visibility_idx on cns.relationships(visibility_state,review_state,evidence_strength,state);

-- ---------------------------------------------------------------------------
-- EXPLICIT PUBLIC RELEASE BOUNDARY
-- Public products read ONLY the sanitized projection view below, never CNS.
-- Creating a projection does not change Canon or BRAIN authority.
-- ---------------------------------------------------------------------------
create table if not exists cns.public_projections (
  projection_id text primary key,
  object_type text not null,
  object_id text not null,
  object_revision integer not null check (object_revision > 0),
  payload jsonb not null,
  source_refs jsonb not null default '[]'::jsonb,
  rights_state cns.rights_state not null,
  nature_sensitivity_state cns.nature_sensitivity_state not null default 'NONE',
  truth_checked boolean not null default false,
  evidence_checked boolean not null default false,
  rights_checked boolean not null default false,
  sensitivity_checked boolean not null default false,
  verified_by text,
  verification_authority text,
  verified_at timestamptz,
  expires_at timestamptz,
  state text not null default 'CANDIDATE' check (state in ('CANDIDATE','ACTIVE','WITHDRAWN','EXPIRED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or verified_at is null or expires_at > verified_at),
  check (state <> 'ACTIVE' or (
    rights_state='ALLOW' and truth_checked and evidence_checked and rights_checked and sensitivity_checked
    and verified_by is not null and verification_authority is not null and verified_at is not null
  ))
);

create unique index if not exists cns_one_active_public_projection_per_revision
  on cns.public_projections(object_type,object_id,object_revision)
  where state='ACTIVE';

create or replace function cns.object_visibility(p_object_type text,p_object_id text)
returns cns.visibility_state
language plpgsql security definer set search_path=cns,public as $$
declare v cns.visibility_state;
begin
  case upper(p_object_type)
    when 'ENTITY' then select visibility_state into v from cns.entities where entity_id=p_object_id;
    when 'RELATIONSHIP' then select visibility_state into v from cns.relationships where relationship_id=p_object_id;
    when 'OBSERVATION' then select visibility_state into v from cns.observations where observation_id=p_object_id;
    when 'SIGNAL' then select visibility_state into v from cns.signals where signal_id=p_object_id;
    when 'CLAIM' then select visibility_state into v from cns.claims where claim_id=p_object_id;
    when 'EVIDENCE' then select visibility_state into v from cns.evidence where evidence_id=p_object_id;
    when 'INTERPRETATION' then select visibility_state into v from cns.interpretations where interpretation_id=p_object_id;
    when 'SOURCE_RECORD' then select visibility_state into v from cns.source_records where source_record_id=p_object_id;
    else raise exception 'CNS_PUBLIC_PROJECTION_OBJECT_TYPE_UNSUPPORTED:%',p_object_type;
  end case;
  if v is null then raise exception 'CNS_PUBLIC_PROJECTION_OBJECT_NOT_FOUND:%:%',p_object_type,p_object_id; end if;
  return v;
end;
$$;

create or replace function cns.activate_public_projection(p_projection_id text)
returns boolean
language plpgsql security definer set search_path=cns,public as $$
declare p cns.public_projections%rowtype;
begin
  select * into p from cns.public_projections where projection_id=p_projection_id for update;
  if not found then raise exception 'CNS_PUBLIC_PROJECTION_NOT_FOUND'; end if;
  if cns.object_visibility(p.object_type,p.object_id) <> 'PUBLIC_VERIFIED'::cns.visibility_state then
    raise exception 'CNS_CANONICAL_OBJECT_NOT_PUBLIC_VERIFIED';
  end if;
  if p.rights_state <> 'ALLOW'::cns.rights_state or not p.truth_checked or not p.evidence_checked
     or not p.rights_checked or not p.sensitivity_checked or p.verified_by is null
     or p.verification_authority is null or p.verified_at is null then
    raise exception 'CNS_PUBLIC_PROJECTION_GATES_INCOMPLETE';
  end if;
  update cns.public_projections set state='ACTIVE',updated_at=now() where projection_id=p_projection_id;
  return true;
end;
$$;

create or replace view public.superbrain_public_v1
with (security_barrier=true) as
select
  projection_id,
  object_type,
  object_id,
  object_revision,
  payload,
  source_refs,
  nature_sensitivity_state::text as nature_sensitivity_state,
  verified_at,
  expires_at
from cns.public_projections
where state='ACTIVE'
  and rights_state='ALLOW'
  and truth_checked
  and evidence_checked
  and rights_checked
  and sensitivity_checked
  and verified_at is not null
  and (expires_at is null or expires_at > now());

revoke all on cns.datasets,cns.source_records,cns.relationships,cns.public_projections from public,anon,authenticated;
revoke all on function cns.object_visibility(text,text) from public,anon,authenticated;
revoke all on function cns.activate_public_projection(text) from public,anon,authenticated;

grant select,insert,update on cns.datasets to service_role;
grant select,insert on cns.source_records to service_role;
grant select,insert,update on cns.relationships to service_role;
grant select,insert,update on cns.public_projections to service_role;
grant execute on function cns.object_visibility(text,text) to service_role;
grant execute on function cns.activate_public_projection(text) to service_role;

grant select on public.superbrain_public_v1 to anon, authenticated, service_role;

alter table cns.datasets enable row level security;
alter table cns.source_records enable row level security;
alter table cns.relationships enable row level security;
alter table cns.public_projections enable row level security;

-- Record the SHADOW schema advance without changing authority mode.
insert into cns.system_meta(key,value,updated_at)
values(
  'planet_brain_convergence',
  jsonb_build_object(
    'version',1,
    'migration','20260903101500_superbrain_planet_convergence_01',
    'authority','SHADOW',
    'public_read_boundary','public.superbrain_public_v1',
    'brain_cutover',false
  ),
  now()
)
on conflict (key) do update set value=excluded.value,updated_at=excluded.updated_at;

commit;
