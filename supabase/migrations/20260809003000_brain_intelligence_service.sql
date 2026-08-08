-- 4PLANET_ BRAIN — canonical intelligence service convergence
-- Phase 05: PSI becomes a service inside the One Planet Model, not a parallel database.
-- Builds on 20260722163000_truth_spine.sql.

begin;

create extension if not exists pgcrypto;
create extension if not exists postgis;

-- Addressable objects: one identity seam for entities, intelligence objects and evidence objects.
create table if not exists public.brain_objects (
  id uuid primary key default gen_random_uuid(),
  public_ref text not null unique,
  object_kind text not null check (object_kind in ('ENTITY','INTELLIGENCE_OBJECT','EVIDENCE_OBJECT')),
  object_type text not null,
  title text not null,
  lifecycle_state text not null default 'CANONICAL'
    check (lifecycle_state in ('DISCOVERED','STAGING','CANONICAL','UPDATE_DUE','QUARANTINED','DEPRECATED')),
  review_status text not null default 'UNREVIEWED'
    check (review_status in ('UNREVIEWED','SOURCE_CHECKED','LITERATURE_CHECKED','REVIEWED','EXPERT_REVIEWED','REJECTED')),
  visibility text not null default 'INTERNAL'
    check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  current_revision integer not null default 1 check (current_revision > 0),
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);
create index if not exists brain_objects_type_idx on public.brain_objects(object_type,lifecycle_state);
create index if not exists brain_objects_public_idx on public.brain_objects(visibility,review_status) where lifecycle_state='CANONICAL';

create table if not exists public.brain_revisions (
  object_id uuid not null references public.brain_objects(id) on delete cascade,
  revision_no integer not null check (revision_no > 0),
  snapshot jsonb not null,
  changed_at timestamptz not null default now(),
  change_reason text,
  primary key (object_id, revision_no)
);

create table if not exists public.brain_aliases (
  alias_id uuid primary key default gen_random_uuid(),
  object_id uuid not null references public.brain_objects(id) on delete cascade,
  alias text not null,
  locale text not null default 'en',
  alias_type text not null default 'NAME',
  source_record_id text references public.source_records(id),
  unique (object_id, alias, locale)
);
create index if not exists brain_aliases_lookup_idx on public.brain_aliases(lower(alias));

create table if not exists public.brain_external_identities (
  mapping_id uuid primary key default gen_random_uuid(),
  object_id uuid not null references public.brain_objects(id) on delete cascade,
  source_id text not null,
  external_id text not null,
  external_url text,
  mapping_status text not null default 'ASSERTED'
    check (mapping_status in ('ASSERTED','REVIEWED','REJECTED','SUPERSEDED')),
  source_record_id text references public.source_records(id),
  unique (source_id, external_id)
);

-- Stable typed graph edges. No generic RELATED_TO escape hatch.
create table if not exists public.brain_relationships (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.brain_objects(id) on delete restrict,
  predicate text not null,
  object_id uuid not null references public.brain_objects(id) on delete restrict,
  review_status text not null default 'UNREVIEWED'
    check (review_status in ('UNREVIEWED','SOURCE_CHECKED','LITERATURE_CHECKED','REVIEWED','EXPERT_REVIEWED','REJECTED')),
  interpretation_status text not null default '4PLANET_INTERPRETATION'
    check (interpretation_status in ('SOURCE_REPORTED','4PLANET_INTERPRETATION','INFERENCE')),
  visibility text not null default 'INTERNAL'
    check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz not null default now(),
  check (predicate <> 'RELATED_TO'),
  check (subject_id <> object_id),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);
create unique index if not exists brain_relationships_unique_idx
  on public.brain_relationships(subject_id,predicate,object_id,coalesce(valid_from,'-infinity'::timestamptz));
create index if not exists brain_relationships_subject_idx on public.brain_relationships(subject_id,predicate);
create index if not exists brain_relationships_object_idx on public.brain_relationships(object_id,predicate);

-- One source registry; source_records remains the immutable raw/upstream record spine.
create table if not exists public.sources (
  source_id text primary key,
  title text not null,
  publisher text,
  source_type text not null,
  canonical_url text,
  licence text,
  machine_access text,
  policy_url text,
  reviewed_at timestamptz,
  visibility text not null default 'INTERNAL'
    check (visibility in ('PUBLIC','INTERNAL','RESTRICTED'))
);

-- Intelligence objects.
create table if not exists public.problems (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  statement text not null,
  scope text,
  temporal_scope text,
  system_code text,
  cluster_code text
);

create table if not exists public.gaps (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  problem_id uuid references public.problems(object_id) on delete set null,
  gap_type text not null,
  statement text not null,
  assessment_kind text not null check (assessment_kind in ('OBSERVED_GAP','4PLANET_HYPOTHESIS','RESEARCH_QUESTION')),
  review_trigger text
);

-- Canonical entities used by PSI, Living Systems, ATLAS and Mission Engine.
create table if not exists public.solutions (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  solution_level text not null check (solution_level in ('PATHWAY','INTERVENTION','VARIANT')),
  parent_solution_id uuid references public.solutions(object_id) on delete restrict,
  mechanism text,
  maturity text,
  applicability text,
  limitations text
);
create index if not exists solutions_parent_idx on public.solutions(parent_solution_id,solution_level);

create table if not exists public.actors (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  canonical_actor_ref text unique,
  actor_type text,
  official_url text
);

create table if not exists public.places (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  place_type text,
  geom geometry(Geometry,4326),
  spatial_precision text,
  country_code char(2)
);
create index if not exists places_geom_idx on public.places using gist(geom);

create table if not exists public.implementations (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  implementation_status text,
  started_at date,
  ended_at date,
  scale_note text,
  operational_context jsonb not null default '{}'::jsonb
);

create table if not exists public.implementation_solutions (
  implementation_id uuid not null references public.implementations(object_id) on delete cascade,
  solution_id uuid not null references public.solutions(object_id) on delete restrict,
  role text not null default 'USES',
  primary key (implementation_id,solution_id,role)
);

create table if not exists public.implementation_actors (
  implementation_id uuid not null references public.implementations(object_id) on delete cascade,
  actor_id uuid not null references public.actors(object_id) on delete restrict,
 role text not null,
 primary key (implementation_id,actor_id,role)
);

create table if not exists public.implementation_places (
  implementation_id uuid not null references public.implementations(object_id) on delete cascade,
  place_id uuid not null references public.places(object_id) on delete restrict,
 role text not null default 'LOCATION',
  primary key (implementation_id,place_id,role)
);

-- Atomic claims. A claim is about any addressable BRAIN object, not just a Problem.
create table if not exists public.claims (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  subject_id uuid not null references public.brain_objects(id) on delete restrict,
  predicate text not null,
  value_text text,
  value_numeric numeric,
  value_unit text,
  claim_origin text not null check (claim_origin in ('SOURCE_REPORTED','4PLANET_ASSESSMENT')'),
  interpretation_status text not null check (interpretation_status in ('SOURCE_REPORTED','4PLANET_INTERPRETATION','INFERENCE')),
  review_status text not null check (review_status in ('UNREVIEWED','SOURCE_CHECKED','LITERATURE_CHECKED','REVIEWED','EXPERT_REVIEWED','REJECTED')),
  evidence_strength text not null check (evidence_strength in ('UNASSESSED','INSUFFICIENT','LIMITED','MODERATE','STRONG')),
  valid_from timestamptz,
  valid_to timestamptz,
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  created_at timestamptz not null default now(),
  check (value_text is not null or value_numeric is not null),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);
create index if not exists claims_subject_idx
  on public.claims(subject_id,predicate,review_status,evidence_strength);

create table if not exists public.claim_evidence (
  claim_id uuid not null references public.claims(object_id) on delete cascade,
  source_record_id text not null references public.source_records(id) on delete restrict,
  direction text not null check (direction in ('SUPPORTS','QUALIFIE