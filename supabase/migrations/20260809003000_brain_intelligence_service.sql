-- 4PLANET_ BRAIN — canonical intelligence service convergence
-- Phase 05: PSI becomes a service inside the One Planet Model, not a parallel database.
-- Builds on 20260722163000_truth_spine.sql.

begin;

create extension if not exists pgcrypto;
create extension if not exists postgis;

create table public.brain_objects (
  id uuid primary key default gen_random_uuid(),
  public_ref text not null unique,
  object_kind text not null check (object_kind in ('ENTITY','INTELLIGENCE_OBJECT','EVIDENCE_OBJECT')),
  object_type text not null,
  title text not null,
  lifecycle_state text not null default 'CANONICAL' check (lifecycle_state in ('DISCOVERED','STAGING','CANONICAL','UPDATE_DUE','QUARANTINED','DEPRECATED')),
  review_status text not null default 'UNREVIEWED' check (review_status in ('UNREVIEWED','SOURCE_CHECKED','LITERATURE_CHECKED','REVIEWED','EXPERT_REVIEWED','REJECTED')),
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  current_revision integer not null default 1 check (current_revision > 0),
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);
create index brain_objects_type_idx on public.brain_objects(object_type,lifecycle_state);

create table public.brain_revisions (
  object_id uuid not null references public.brain_objects(id) on delete cascade,
  revision_no integer not null check (revision_no > 0),
  snapshot jsonb not null,
  changed_at timestamptz not null default now(),
  change_reason text,
  primary key (object_id,revision_no)
);

create table public.brain_aliases (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references public.brain_objects(id) on delete cascade,
  alias text not null,
  locale text not null default 'en',
  source_record_id text references public.source_records(id),
  unique(object_id,alias,locale)
);
create index brain_aliases_lookup_idx on public.brain_aliases(lower(alias));

create table public.brain_external_identities (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references public.brain_objects(id) on delete cascade,
  source_id text not null,
  external_id text not null,
  external_url text,
  mapping_status text not null default 'ASSERTED' check (mapping_status in ('ASSERTED','REVIEWED','REJECTED','SUPERSEDED')),
  source_record_id text references public.source_records(id),
  unique(source_id,external_id)
);

create table public.brain_relationships (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.brain_objects(id) on delete restrict,
  predicate text not null check (predicate <> 'RELATED_TO'),
  object_id uuid not null references public.brain_objects(id) on delete restrict,
  review_status text not null default 'UNREVIEWED' check (review_status in ('UNREVIEWED','SOURCE_CHECKED','LITERATURE_CHECKED','REVIEWED','EXPERT_REVIEWED','REJECTED')),
  interpretation_status text not null default '4PLANET_INTERPRETATION' check (interpretation_status in ('SOURCE_REPORTED','4PLANET_INTERPRETATION','INFERENCE')),
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  created_at timestamptz not null default now(),
  check (subject_id <> object_id),
  unique(subject_id,predicate,object_id)
);
create index brain_relationships_subject_idx on public.brain_relationships(subject_id,predicate);
create index brain_relationships_object_idx on public.brain_relationships(object_id,predicate);

create table public.sources (
  source_id text primary key,
  title text not null,
  publisher text,
  source_type text not null,
  canonical_url text,
  licence text,
  machine_access text,
  policy_url text,
  reviewed_at timestamptz,
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED'))
);

create table public.problems (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  statement text not null,
  scope text,
  temporal_scope text,
  system_code text,
  cluster_code text
);

create table public.gaps (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  problem_id uuid references public.problems(object_id) on delete set null,
  gap_type text not null,
  statement text not null,
  assessment_kind text not null check (assessment_kind in ('OBSERVED_GAP','4PLANET_HYPOTHESIS','RESEARCH_QUESTION'))
);

create table public.solutions (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  solution_level text not null check (solution_level in ('PATHWAY','INTERVENTION','VARIANT')),
  parent_solution_id uuid references public.solutions(object_id) on delete restrict,
  mechanism text,
  maturity text,
  applicability text,
  limitations text
);
create index solutions_parent_idx on public.solutions(parent_solution_id,solution_level);

create table public.actors (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  canonical_actor_ref text unique,
  actor_type text,
  official_url text
);

create table public.places (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  place_type text,
  geom geometry(Geometry,4326),
  spatial_precision text,
  country_code char(2)
);
create index places_geom_idx on public.places using gist(geom);

create table public.implementations (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  implementation_status text,
  started_at date,
  ended_at date,
  scale_note text,
  operational_context jsonb not null default '{}'::jsonb
);

create table public.implementation_solutions (
  implementation_id uuid not null references public.implementations(object_id) on delete cascade,
  solution_id uuid not null references public.solutions(object_id) on delete restrict,
  role text not null default 'USES',
  primary key(implementation_id,solution_id,role)
);
create table public.implementation_actors (
  implementation_id uuid not null references public.implementations(object_id) on delete cascade,
  actor_id uuid not null references public.actors(object_id) on delete restrict,
  role text not null,
  primary key(implementation_id,actor_id,role)
);
create table public.implementation_places (
  implementation_id uuid not null references public.implementations(object_id) on delete cascade,
  place_id uuid not null references public.places(object_id) on delete restrict,
  role text not null default 'LOCATION',
  primary key(implementation_id,place_id,role)
);

create table public.claims (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  subject_id uuid not null references public.brain_objects(id) on delete restrict,
  predicate text not null,
  object_value_id uuid references public.brain_objects(id) on delete restrict,
  value_text text,
  value_numeric numeric,
  value_unit text,
  claim_origin text not null check (claim_origin in ('SOURCE_REPORTED','4PLANET_ASSESSMENT')),
  interpretation_status text not null check (interpretation_status in ('SOURCE_REPORTED','4PLANET_INTERPRETATION','INFERENCE')),
  review_status text not null default 'UNREVIEWED' check (review_status in ('UNREVIEWED','SOURCE_CHECKED','LITERATURE_CHECKED','REVIEWED','EXPERT_REVIEWED','REJECTED')),
  evidence_strength text not null default 'UNASSESSED' check (evidence_strength in ('UNASSESSED','INSUFFICIENT','LIMITED','MODERATE','STRONG')),
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  created_at timestamptz not null default now(),
  check (object_value_id is not null or value_text is not null or value_numeric is not null)
);
create index claims_subject_idx on public.claims(subject_id,predicate,review_status,evidence_strength);

create table public.claim_evidence (
  claim_id uuid not null references public.claims(object_id) on delete cascade,
  source_record_id text not null references public.source_records(id) on delete restrict,
  direction text not null check (direction in ('SUPPORTS','QUALIFIES','CHALLENGES')),
  directness text,
  measurement_type text,
  independence text,
  evidence_tier text,
  geography text,
  method text,
  limitations text,
  primary key(claim_id,source_record_id,direction)
);

create table public.outcome_observations (
  id uuid primary key default gen_random_uuid(),
  implementation_id uuid references public.implementations(object_id) on delete set null,
  solution_id uuid references public.solutions(object_id) on delete set null,
  outcome_stage text not null check (outcome_stage in ('ACTIVITY','OUTPUT','OUTCOME','LONGER_TERM_IMPACT')),
  metric text not null,
  numeric_value numeric,
  text_value text,
  unit text,
  evidence_basis text not null check (evidence_basis in ('MEASURED','MODELLED','PROJECTED','REPORTED')),
  source_record_id text references public.source_records(id),
  limitations text,
  check (implementation_id is not null or solution_id is not null)
);

create table public.cost_observations (
  id uuid primary key default gen_random_uuid(),
  target_object_id uuid not null references public.brain_objects(id) on delete cascade,
  cost_type text not null,
  amount numeric,
  amount_low numeric,
  amount_high numeric,
  currency char(3),
  price_year integer,
  unit_basis text,
  geography text,
  observation_basis text not null check (observation_basis in ('OBSERVED','MODELLED','PROJECTED','REPORTED')),
  source_record_id text references public.source_records(id),
  check (amount is not null or amount_low is not null or amount_high is not null)
);

create table public.transferability_assessments (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  solution_id uuid references public.solutions(object_id) on delete set null,
  source_place_id uuid references public.places(object_id) on delete set null,
  target_place_id uuid references public.places(object_id) on delete set null,
  decision_context text not null,
  factors jsonb not null default '{}'::jsonb,
  conclusion_class text not null check (conclusion_class in ('EVIDENCE_BACKED','PLAUSIBLE_HYPOTHESIS','WEAK_UNCERTAIN','NOT_ASSESSED')),
  material_unknowns text[] not null default '{}'
);

create table public.context_pack_runs (
  id uuid primary key default gen_random_uuid(),
  query_text text not null,
  task_type text not null,
  resolved_object_ids uuid[] not null default '{}',
  included_object_ids uuid[] not null default '{}',
  included_claim_ids uuid[] not null default '{}',
  included_source_record_ids text[] not null default '{}',
  excluded_summary jsonb not null default '{}'::jsonb,
  retrieval_version text not null,
  database_revision text,
  model_ref text,
  created_at timestamptz not null default now()
);

-- RLS: internal assessments do not become public merely because they exist.
do $$
declare t text;
begin
  foreach t in array array['brain_objects','brain_revisions','brain_aliases','brain_external_identities','brain_relationships','sources','problems','gaps','solutions','actors','places','implementations','implementation_solutions','implementation_actors','implementation_places','claims','claim_evidence','outcome_observations','cost_observations','transferability_assessments','context_pack_runs'] loop
    execute format('alter table public.%I enable row level security',t);
  end loop;
end $$;

create policy brain_objects_public_read on public.brain_objects for select to anon,authenticated using (visibility='PUBLIC' and lifecycle_state='CANONICAL' and review_status not in ('UNREVIEWED','REJECTED'));
create policy sources_public_read on public.sources for select to anon,authenticated using (visibility='PUBLIC');
create policy brain_relationships_public_read on public.brain_relationships for select to anon,authenticated using (visibility='PUBLIC' and review_status not in ('UNREVIEWED','REJECTED'));
create policy claims_public_read on public.claims for select to anon,authenticated using (visibility='PUBLIC' and review_status not in ('UNREVIEWED','REJECTED') and interpretation_status <> 'INFERENCE');

create policy problems_public_read on public.problems for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=problems.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy solutions_public_read on public.solutions for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=solutions.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy actors_public_read on public.actors for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=actors.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy places_public_read on public.places for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=places.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy implementations_public_read on public.implementations for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=implementations.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));

create policy claim_evidence_public_read on public.claim_evidence for select to anon,authenticated using (exists(select 1 from public.claims c where c.object_id=claim_evidence.claim_id and c.visibility='PUBLIC' and c.review_status not in ('UNREVIEWED','REJECTED') and c.interpretation_status <> 'INFERENCE'));

-- No public policies for gaps, transferability, revisions, aliases, external mappings or Context Pack audit runs.
grant select on public.brain_objects,public.sources,public.brain_relationships,public.problems,public.solutions,public.actors,public.places,public.implementations,public.claims,public.claim_evidence to anon,authenticated;
revoke insert,update,delete on public.brain_objects,public.brain_revisions,public.brain_aliases,public.brain_external_identities,public.brain_relationships,public.sources,public.problems,public.gaps,public.solutions,public.actors,public.places,public.implementations,public.implementation_solutions,public.implementation_actors,public.implementation_places,public.claims,public.claim_evidence,public.outcome_observations,public.cost_observations,public.transferability_assessments,public.context_pack_runs from anon,authenticated;

comment on table public.brain_objects is 'Canonical One Planet Model addressable-object registry. PSI is a BRAIN intelligence service, not a parallel truth system.';
comment on table public.claims is 'Atomic claims. Review/completeness metadata must not be interpreted as solution effectiveness.';
comment on table public.claim_evidence is 'Evidence direction is SUPPORTS, QUALIFIES or CHALLENGES; qualifiers are not contradictions.';
comment on table public.context_pack_runs is 'Auditable bounded retrieval packages. DATABASE != LLM CONTEXT.';

commit;
