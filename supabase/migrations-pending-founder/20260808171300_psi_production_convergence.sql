-- 4PLANET PSI PRODUCTION CONVERGENCE v1.0
-- BOUNDED / REVIEW-GATED CANDIDATE. NOT AUTO-APPLIED.
-- Base: PR #9 truth spine. No live ingest. No final FD-01..FD-06 semantics.

begin;
create extension if not exists postgis;
create extension if not exists pgcrypto;

create table if not exists public.object_registry (
  object_id uuid primary key,
  public_ref text not null unique,
  object_kind text not null,
  lifecycle_state text not null default 'ACTIVE'
    check (lifecycle_state in ('ACTIVE','SUPERSEDED','RETRACTED','QUARANTINED','DEPRECATED')),
  current_revision integer not null default 1 check (current_revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intelligence_objects (
  object_id uuid primary key references public.object_registry(object_id) on delete restrict,
  intelligence_type text not null,
  title text not null,
  statement text,
  scope_json jsonb not null default '{}'::jsonb,
  interpretation_status text not null default '4PLANET_INTERPRETATION'
    check (interpretation_status in ('SOURCE_REPORTED','4PLANET_INTERPRETATION','INFERENCE')),
  review_status text not null default 'UNREVIEWED'
    check (review_status in ('UNREVIEWED','LITERATURE_CHECKED','EXPERT_REVIEWED')),
  evidence_strength text not null default 'UNASSESSED'
    check (evidence_strength in ('UNASSESSED','INSUFFICIENT','LIMITED','MODERATE','STRONG')),
  release_status text not null default 'INTERNAL'
    check (release_status in ('INTERNAL','REVIEW_REQUIRED','APPROVED_INTERNAL','PUBLIC_SAFE'))
);

create table if not exists public.system_entities (
  object_id uuid primary key references public.object_registry(object_id) on delete restrict,
  system_code text not null unique,
  title text not null,
  description text
);

create table if not exists public.predicate_definitions (
  predicate_code text primary key,
  label text not null,
  inverse_code text,
  symmetric boolean not null default false,
  evidence_required boolean not null default false,
  description text,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE','REVIEW_REQUIRED','DEPRECATED')),
  foreign key (inverse_code) references public.predicate_definitions(predicate_code)
    deferrable initially deferred
);

create table if not exists public.predicate_constraints (
  predicate_code text not null references public.predicate_definitions(predicate_code) on delete cascade,
  subject_kind text not null,
  object_kind text not null,
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE','REVIEW_REQUIRED','DEPRECATED')),
  primary key (predicate_code, subject_kind, object_kind)
);

create table if not exists public.graph_edges (
  edge_id uuid primary key,
  public_ref text unique,
  subject_id uuid not null references public.object_registry(object_id) on delete restrict,
  predicate_code text not null references public.predicate_definitions(predicate_code) on delete restrict,
  object_id uuid not null references public.object_registry(object_id) on delete restrict,
  relation_origin text not null
    check (relation_origin in ('SOURCE_REPORTED','RULE_DERIVED','4PLANET_INTERPRETATION','INFERENCE')),
  evidence_state text not null default 'REVIEW_REQUIRED'
    check (evidence_state in ('SUPPORTED','QUALIFIED','CHALLENGED','INSUFFICIENT_EVIDENCE','REJECTED','REQUIRES_RESEARCH','REVIEW_REQUIRED')),
  review_status text not null default 'UNREVIEWED'
    check (review_status in ('UNREVIEWED','LITERATURE_CHECKED','EXPERT_REVIEWED')),
  scope_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists graph_edges_subject_idx on public.graph_edges(subject_id,predicate_code);
create index if not exists graph_edges_object_idx on public.graph_edges(object_id,predicate_code);

create table if not exists public.claims (
  claim_id uuid primary key,
  public_ref text not null unique,
  subject_id uuid not null references public.object_registry(object_id) on delete restrict,
  predicate_code text not null references public.predicate_definitions(predicate_code) on delete restrict,
  object_id uuid references public.object_registry(object_id) on delete restrict,
  value_text text,
  value_numeric numeric,
  value_boolean boolean,
  value_json jsonb,
  qualifiers jsonb not null default '{}'::jsonb,
  claim_origin text not null check (claim_origin in ('SOURCE_REPORTED','4PLANET_INTERPRETATION','INFERENCE')),
  review_status text not null default 'UNREVIEWED'
    check (review_status in ('UNREVIEWED','LITERATURE_CHECKED','EXPERT_REVIEWED')),
  check (((object_id is not null)::int + (value_text is not null)::int +
          (value_numeric is not null)::int + (value_boolean is not null)::int +
          (value_json is not null)::int) = 1)
);

create table if not exists public.claim_evidence (
  claim_id uuid not null references public.claims(claim_id) on delete cascade,
  source_record_id text not null references public.source_records(id) on delete restrict,
  support_direction text not null check (support_direction in ('SUPPORTS','CHALLENGES','QUALIFIES')),
  directness text not null default 'UNKNOWN' check (directness in ('DIRECT','INDIRECT','MIXED','UNKNOWN')),
  context_note text,
  primary key (claim_id,source_record_id,support_direction)
);

create table if not exists public.assessment_runs (
  assessment_run_id uuid primary key,
  public_ref text not null unique,
  assessment_kind text not null,
  methodology_version text not null,
  lens text,
  scope_json jsonb not null default '{}'::jsonb,
  release_status text not null default 'INTERNAL'
    check (release_status in ('INTERNAL','REVIEW_REQUIRED','APPROVED_INTERNAL','PUBLIC_SAFE')),
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  assessment_id uuid primary key,
  assessment_run_id uuid not null references public.assessment_runs(assessment_run_id) on delete cascade,
  subject_id uuid not null references public.object_registry(object_id) on delete restrict,
  axis_code text not null,
  ordinal_label text not null check (ordinal_label in ('UNKNOWN','LOW','MEDIUM','HIGH','VERY_HIGH')),
  ordinal_position smallint check (ordinal_position is null or ordinal_position between 1 and 4),
  evidence_basis text,
  uncertainty text,
  source_refs text[] not null default '{}',
  unique(assessment_run_id,subject_id,axis_code)
);

create table if not exists public.places (
  object_id uuid primary key references public.object_registry(object_id) on delete restrict,
  place_type text not null,
  canonical_name text not null,
  geom geometry,
  spatial_precision text not null default 'UNKNOWN'
    check (spatial_precision in ('EXACT','APPROXIMATE','GENERALIZED','ADMINISTRATIVE','UNKNOWN')),
  source_record_id text references public.source_records(id) on delete restrict
);
create index if not exists places_geom_idx on public.places using gist(geom);

create table if not exists public.object_place_links (
  link_id uuid primary key,
  object_id uuid not null references public.object_registry(object_id) on delete restrict,
  place_id uuid not null references public.places(object_id) on delete restrict,
  relation_role text not null,
  source_record_id text references public.source_records(id) on delete restrict,
  review_status text not null default 'UNREVIEWED'
    check (review_status in ('UNREVIEWED','LITERATURE_CHECKED','EXPERT_REVIEWED')),
  unique(object_id,place_id,relation_role)
);

create table if not exists public.measurements (
  measurement_id uuid primary key,
  target_object_id uuid not null references public.object_registry(object_id) on delete restrict,
  metric_code text not null,
  numeric_value numeric,
  text_value text,
  unit text,
  basis text not null check (basis in ('MEASURED','MODELLED','ESTIMATED','SOURCE_REPORTED')),
  source_record_id text not null references public.source_records(id) on delete restrict,
  qualifiers jsonb not null default '{}'::jsonb,
  check ((numeric_value is not null)::int + (text_value is not null)::int = 1)
);

-- Staging != canon. Promotion is an explicit gate.
create table if not exists public.psi_import_batches (
  batch_id uuid primary key,
  release_ref text not null,
  source_artifact_hash text not null,
  source_artifact_name text not null,
  status text not null default 'STAGED'
    check (status in ('STAGED','VALIDATED','QUARANTINED','PROMOTED','REJECTED')),
  founder_gate text not null default 'REQUIRED',
  created_at timestamptz not null default now(),
  unique(release_ref,source_artifact_hash)
);

create table if not exists public.psi_staging_solution_problem (
  batch_id uuid not null references public.psi_import_batches(batch_id) on delete cascade,
  relation_ref text not null,
  solution_ref text not null,
  problem_complex_ref text not null,
  relation_basis text not null,
  mapping_confidence text not null check (mapping_confidence in ('HIGH','MEDIUM','LOW','UNKNOWN')),
  effectiveness_implication text not null default 'NONE' check (effectiveness_implication = 'NONE'),
  review_status text not null,
  payload jsonb not null,
  primary key(batch_id,relation_ref)
);

-- Align the already-locked truth axes while retaining legacy interpretation vocabulary for audit.
alter table public.interpretations add column if not exists legacy_interpretation_status text;
update public.interpretations set legacy_interpretation_status=interpretation_status
 where legacy_interpretation_status is null
   and interpretation_status in ('SOURCE_STATEMENT','PRODUCT_CONTEXT','PUBLIC_SAFE');
update public.signals set evidence_strength='LIMITED' where evidence_strength='EMERGING';
update public.interpretations set evidence_strength='LIMITED' where evidence_strength='EMERGING';
update public.interpretations set interpretation_status=case interpretation_status
  when 'SOURCE_STATEMENT' then 'SOURCE_REPORTED'
  when 'PRODUCT_CONTEXT' then '4PLANET_INTERPRETATION'
  when 'PUBLIC_SAFE' then '4PLANET_INTERPRETATION'
  else interpretation_status end
 where interpretation_status in ('SOURCE_STATEMENT','PRODUCT_CONTEXT','PUBLIC_SAFE');
alter table public.signals drop constraint if exists signals_evidence_strength_check;
alter table public.signals add constraint signals_evidence_strength_check
 check (evidence_strength in ('UNASSESSED','INSUFFICIENT','LIMITED','MODERATE','STRONG'));
alter table public.interpretations drop constraint if exists interpretations_evidence_strength_check;
alter table public.interpretations add constraint interpretations_evidence_strength_check
 check (evidence_strength in ('UNASSESSED','INSUFFICIENT','LIMITED','MODERATE','STRONG'));
alter table public.interpretations drop constraint if exists interpretations_interpretation_status_check;
alter table public.interpretations add constraint interpretations_interpretation_status_check
 check (interpretation_status in ('SOURCE_REPORTED','4PLANET_INTERPRETATION','INFERENCE'));

-- Internal by default; public projections require a separate reviewed read model.
alter table public.object_registry enable row level security;
alter table public.intelligence_objects enable row level security;
alter table public.system_entities enable row level security;
alter table public.predicate_definitions enable row level security;
alter table public.predicate_constraints enable row level security;
alter table public.graph_edges enable row level security;
alter table public.claims enable row level security;
alter table public.claim_evidence enable row level security;
alter table public.assessment_runs enable row level security;
alter table public.assessments enable row level security;
alter table public.places enable row level security;
alter table public.object_place_links enable row level security;
alter table public.measurements enable row level security;
alter table public.psi_import_batches enable row level security;
alter table public.psi_staging_solution_problem enable row level security;
revoke all on public.object_registry,public.intelligence_objects,public.system_entities,
 public.predicate_definitions,public.predicate_constraints,public.graph_edges,public.claims,
 public.claim_evidence,public.assessment_runs,public.assessments,public.places,
 public.object_place_links,public.measurements,public.psi_import_batches,
 public.psi_staging_solution_problem from anon,authenticated;

comment on table public.graph_edges is 'Semantic relation only; edge existence does not imply causal proof or effectiveness.';
comment on table public.claims is 'Atomic proposition; claim existence does not imply verified fact.';
comment on table public.assessments is 'Versioned ordinal assessments; severity and leverage remain separate.';
comment on table public.psi_staging_solution_problem is 'M:N relevance mapping; effectiveness implication is always NONE.';

-- Explicit holds: FD-03 solution identity, FD-04 NEED and FD-05 implementation lifecycle.
-- Existing 4P-PROB-* and 4P-SOL-* public refs are preserved by the external PSI data package.
commit;
