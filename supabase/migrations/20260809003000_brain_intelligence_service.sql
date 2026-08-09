-- 4PLANET_ BRAIN — canonical intelligence service convergence
-- PSI Production Validation / Canon Freeze v1.0
-- Founder-approved FD-01 through FD-06 implemented 2026-08-09.
-- PSI is an intelligence service inside the One Planet Model, not a parallel database.
-- Builds on 20260722163000_truth_spine.sql and preserves its Source/Observation/Signal/IMPACT truth contracts.

begin;

create extension if not exists pgcrypto;
create extension if not exists postgis;

-- ---------------------------------------------------------------------------
-- CANON PROVENANCE
-- ---------------------------------------------------------------------------
create table public.brain_canon_decisions (
  decision_id text primary key,
  decision_title text not null,
  canonical_rule text not null,
  approved_by text not null,
  approved_at timestamptz not null,
  release_name text not null,
  supersedes text[] not null default '{}',
  notes text
);

insert into public.brain_canon_decisions(decision_id,decision_title,canonical_rule,approved_by,approved_at,release_name,supersedes,notes) values
('FD-01','Canonical problem class','PROBLEM_FRAME is the scoped, versioned canonical problem-intelligence object. Existing 4P-PROB-* public references remain stable.','Odin Oddekalv','2026-08-09T01:36:00+02:00','PSI_CANON_FREEZE_V1','{PROBLEM_GENERIC}','Public UX may label it Problem; materially different scope/context creates a distinct frame.'),
('FD-02','Legacy VARIANT handling','Legacy VARIANT records migrate to INTERVENTION while the legacy class is preserved in migration history and typed VARIANT_OF / SPECIALISES relations.','Odin Oddekalv','2026-08-09T01:36:00+02:00','PSI_CANON_FREEZE_V1','{VARIANT_AS_DURABLE_SOLUTION_TYPE}','VARIANT is migration/history semantics, not a durable intervention type.'),
('FD-03','Solution umbrella','Solution is a human-facing/derived umbrella only. Canonical identities are SOLUTION_PATHWAY, INTERVENTION and OFFERING.','Odin Oddekalv','2026-08-09T01:36:00+02:00','PSI_CANON_FREEZE_V1','{GENERIC_SOLUTION_OBJECT}','No generic canonical SOLUTION table/object type.'),
('FD-04','Need semantics','NEED is first-class with orthogonal need_kind and need_origin. External origin requires source provenance.','Odin Oddekalv','2026-08-09T01:36:00+02:00','PSI_CANON_FREEZE_V1','{NEED_KIND_ORIGIN_CONFLATION}','Internal/analytical needs must never appear as explicit external demand.'),
('FD-05','Implementation lifecycle','Implementation separates execution_phase, execution_state and sourced lifecycle/financing/procurement/contract events.','Odin Oddekalv','2026-08-09T01:36:00+02:00','PSI_CANON_FREEZE_V1','{OVERLOADED_IMPLEMENTATION_STATUS}','Financed/contracted/announced are events, not mutually exclusive lifecycle phases.'),
('FD-06','Meaning of GOLD','GOLD_REFERENCE_CASE is internal review-completeness metadata only and never effectiveness, certification, recommendation, provider quality or public ranking.','Odin Oddekalv','2026-08-09T01:36:00+02:00','PSI_CANON_FREEZE_V1','{}','No public GOLD badge without a separate founder-approved definition.');

-- ---------------------------------------------------------------------------
-- CANONICAL ADDRESS SPACE
-- ---------------------------------------------------------------------------
create table public.brain_object_types (
  object_type text primary key,
  object_kind text not null check (object_kind in ('ENTITY','INTELLIGENCE_OBJECT','EVIDENCE_OBJECT')),
  description text not null,
  public_label text,
  active boolean not null default true
);

insert into public.brain_object_types(object_type,object_kind,description,public_label) values
('SYSTEM','ENTITY','High-level planetary/human organising system.','System'),
('PROBLEM_FRAME','INTELLIGENCE_OBJECT','Scoped, versioned problem framing; not a universal timeless fact.','Problem'),
('SOLUTION_PATHWAY','ENTITY','High-level causal/intervention pathway.','Pathway'),
('INTERVENTION','ENTITY','Actionable intervention mechanism or practice.','Intervention'),
('OFFERING','ENTITY','Provider-specific or productised offering that may implement an intervention.','Offering'),
('NEED','INTELLIGENCE_OBJECT','Sourced or explicitly internal need/challenge/procurement/project/research object.','Need'),
('IMPLEMENTATION','INTELLIGENCE_OBJECT','Real-world or documented implementation/deployment of an intervention.','Implementation'),
('ACTOR','ENTITY','Organisation, institution, company, public body, community or other actor.','Actor'),
('PLACE','ENTITY','Geographic or administrative place identity.','Place'),
('TAXON','ENTITY','Taxonomic identity.','Species / Taxon'),
('LIVING_SYSTEM','ENTITY','Living-system/ecological system identity.','Living system'),
('FUNCTION','ENTITY','Ecological or living-system function.','Function'),
('ECOSYSTEM_SERVICE','ENTITY','Human-facing ecosystem contribution/service.','Ecosystem contribution'),
('HUMAN_SYSTEM','ENTITY','Human social, economic, industrial or institutional system.','Human system'),
('PRESSURE','ENTITY','Pressure/stressor acting on living or human systems.','Pressure'),
('PUBLIC_DECISION','INTELLIGENCE_OBJECT','Sourced public decision, policy, plan, rule or institutional decision.','Public decision'),
('EXPECTED_OUTCOME','INTELLIGENCE_OBJECT','Target/intent outcome; never an observed outcome.','Expected outcome'),
('MEASUREMENT','EVIDENCE_OBJECT','Sourced measurement about a target.','Measurement'),
('BRAIN_OUTCOME','EVIDENCE_OBJECT','Observed/reported/modelled outcome record distinct from expected outcome and IMPACT product delivery outcomes.','Outcome'),
('GAP','INTELLIGENCE_OBJECT','Evidence, implementation, actor, capital, coordination or other gap.','Gap'),
('CLAIM','EVIDENCE_OBJECT','Atomic proposition that may be supported, qualified or challenged.','Claim'),
('ASSESSMENT','INTELLIGENCE_OBJECT','Versioned assessment result.','Assessment'),
('TRANSFERABILITY_ASSESSMENT','INTELLIGENCE_OBJECT','Context transferability assessment.','Transferability'),
('MISSION','INTELLIGENCE_OBJECT','4PLANET mission object.','Mission'),
('ACTION','INTELLIGENCE_OBJECT','Action object; action is not outcome.','Action'),
('IMPACT_UNIT','INTELLIGENCE_OBJECT','Impact unit definition/reference.','Impact unit'),
('EVENT_SIGNAL','EVIDENCE_OBJECT','Sourced event or milestone signal.','Event'),
('FINANCING_EVENT','EVIDENCE_OBJECT','Sourced financing event.','Financing event');

create table public.brain_objects (
  id uuid primary key default gen_random_uuid(),
  public_ref text not null unique,
  object_type text not null references public.brain_object_types(object_type),
  title text not null,
  lifecycle_state text not null default 'CANONICAL' check (lifecycle_state in ('DISCOVERED','STAGING','CANONICAL','UPDATE_DUE','QUARANTINED','DEPRECATED','SUPERSEDED')),
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
  source_release text,
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

create table public.brain_legacy_mappings (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references public.brain_objects(id) on delete cascade,
  legacy_release text not null,
  legacy_ref text not null,
  legacy_class text not null,
  migrated_class text not null,
  migration_rule text not null,
  migrated_at timestamptz not null default now(),
  unique(legacy_release,legacy_ref,legacy_class,migrated_class)
);

create table public.brain_review_designations (
  object_id uuid not null references public.brain_objects(id) on delete cascade,
  designation text not null check (designation in ('GOLD_REFERENCE_CASE')),
  assigned_at timestamptz not null default now(),
  assigned_by text not null,
  completeness_note text not null,
  primary key(object_id,designation)
);
comment on table public.brain_review_designations is 'Internal review-completeness metadata only. GOLD_REFERENCE_CASE is not effectiveness, certification, recommendation, provider quality or public ranking.';

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

create table public.problem_frames (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  statement text not null,
  scope text not null,
  temporal_scope text,
  system_code text,
  cluster_code text,
  framing_version text not null default '1.0'
);

create table public.solution_pathways (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  mechanism text,
  applicability text,
  limitations text
);

create table public.interventions (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  primary_pathway_id uuid references public.solution_pathways(object_id) on delete set null,
  intervention_type text,
  mechanism text,
  maturity text,
  applicability text,
  limitations text
);
create index interventions_pathway_idx on public.interventions(primary_pathway_id);

create table public.actors (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  canonical_actor_ref text unique,
  actor_type text,
  official_url text
);

create table public.offerings (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  intervention_id uuid not null references public.interventions(object_id) on delete restrict,
  provider_actor_id uuid references public.actors(object_id) on delete set null,
  offering_type text,
  official_url text,
  availability_scope text,
  limitations text
);
create index offerings_intervention_idx on public.offerings(intervention_id);

create view public.solution_catalogue with (security_invoker=true) as
select p.object_id, 'PATHWAY'::text as solution_level, p.object_id as canonical_solution_id, null::uuid as parent_solution_id, p.mechanism, null::text as maturity, p.applicability, p.limitations
from public.solution_pathways p
union all
select i.object_id, 'INTERVENTION', i.object_id, i.primary_pathway_id, i.mechanism, i.maturity, i.applicability, i.limitations
from public.interventions i
union all
select o.object_id, 'OFFERING', o.object_id, o.intervention_id, null::text, null::text, o.availability_scope, o.limitations
from public.offerings o;
comment on view public.solution_catalogue is 'Derived Solution UX/search umbrella. There is no generic canonical SOLUTION storage object.';

create table public.needs (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  need_kind text not null check (need_kind in ('CHALLENGE','PROCUREMENT','PROJECT','MISSION','RESEARCH','OTHER')),
  need_origin text not null check (need_origin in ('EXTERNAL_EXPLICIT','EXTERNAL_DERIVED','INTERNAL_SCENARIO','ANALYTICAL_DERIVED')),
  statement text not null,
  source_record_id text references public.source_records(id),
  limitations text,
  check (need_origin not in ('EXTERNAL_EXPLICIT','EXTERNAL_DERIVED') or source_record_id is not null)
);

create table public.places (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  place_type text,
  geom geometry(Geometry,4326),
  spatial_precision text,
  country_code char(2),
  source_record_id text references public.source_records(id)
);
create index places_geom_idx on public.places using gist(geom);

create table public.implementations (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  execution_phase text not null default 'PROPOSED' check (execution_phase in ('PROPOSED','PLANNED','PILOT','UNDER_CONSTRUCTION','OPERATIONAL','COMPLETED','DECOMMISSIONED')),
  execution_state text not null default 'UNKNOWN' check (execution_state in ('ACTIVE','SUSPENDED','CANCELLED','FAILED','UNKNOWN')),
  started_at date,
  ended_at date,
  scale_note text,
  operational_context jsonb not null default '{}'::jsonb,
  check (ended_at is null or started_at is null or ended_at >= started_at)
);

create table public.implementation_events (
  id uuid primary key default gen_random_uuid(),
  implementation_id uuid not null references public.implementations(object_id) on delete cascade,
  event_kind text not null check (event_kind in ('ANNOUNCED','FINANCED','CONTRACTED','PROCUREMENT_OPENED','PROCUREMENT_AWARDED','CONSTRUCTION_STARTED','OPERATION_STARTED','SUSPENDED','CANCELLED','COMPLETED','OTHER')),
  event_date date,
  source_record_id text not null references public.source_records(id) on delete restrict,
  details jsonb not null default '{}'::jsonb,
  unique(implementation_id,event_kind,event_date,source_record_id)
);

create table public.implementation_interventions (
  implementation_id uuid not null references public.implementations(object_id) on delete cascade,
  intervention_id uuid not null references public.interventions(object_id) on delete restrict,
  role text not null default 'USES',
  primary key(implementation_id,intervention_id,role)
);
create table public.implementation_offerings (
  implementation_id uuid not null references public.implementations(object_id) on delete cascade,
  offering_id uuid not null references public.offerings(object_id) on delete restrict,
  role text not null default 'USES',
  primary key(implementation_id,offering_id,role)
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

create table public.public_decisions (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  decision_kind text not null,
  jurisdiction_place_id uuid references public.places(object_id) on delete set null,
  decision_date date,
  effective_from date,
  effective_to date,
  source_record_id text not null references public.source_records(id),
  summary text not null
);

create table public.expected_outcomes (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  target_object_id uuid not null references public.brain_objects(id) on delete restrict,
  statement text not null,
  metric_hint text,
  timeframe text,
  source_record_id text references public.source_records(id)
);

create table public.measurements (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  target_object_id uuid not null references public.brain_objects(id) on delete restrict,
  metric text not null,
  numeric_value numeric,
  text_value text,
  unit text,
  measured_at timestamptz,
  geography_place_id uuid references public.places(object_id) on delete set null,
  source_record_id text not null references public.source_records(id),
  measurement_basis text not null check (measurement_basis in ('MEASURED','MODELLED','PROJECTED','REPORTED')),
  limitations text,
  check (numeric_value is not null or text_value is not null)
);

create table public.brain_outcomes (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  target_object_id uuid not null references public.brain_objects(id) on delete restrict,
  outcome_stage text not null check (outcome_stage in ('ACTIVITY','OUTPUT','OUTCOME','LONGER_TERM_IMPACT')),
  statement text not null,
  source_record_id text references public.source_records(id),
  evidence_basis text not null check (evidence_basis in ('MEASURED','MODELLED','PROJECTED','REPORTED')),
  limitations text
);
comment on table public.brain_outcomes is 'BRAIN analytical/observed outcomes. Separate from EXPECTED_OUTCOME and from the IMPACT product outcomes table.';

create table public.gaps (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  problem_id uuid references public.problem_frames(object_id) on delete set null,
  gap_type text not null,
  statement text not null,
  assessment_kind text not null check (assessment_kind in ('OBSERVED_GAP','4PLANET_HYPOTHESIS','RESEARCH_QUESTION'))
);

create table public.predicate_definitions (
  predicate text primary key,
  description text not null,
  truth_note text,
  active boolean not null default true
);

insert into public.predicate_definitions(predicate,description,truth_note) values
('HAS_PARENT','Hierarchy parent relation','Hierarchy only; does not imply causality.'),
('IN_SYSTEM_LINK','Primary/secondary organising system membership','Organising relationship, not causal proof.'),
('RELATES_TO','Typed contextual cross-link','Must be used only where a more specific predicate is not defensible.'),
('CONTRIBUTES_TO','Contributory causal relation','Requires claim/evidence before causal presentation.'),
('CREATES_PRESSURE','Creates or increases a pressure','Requires evidence or explicit inference status.'),
('AFFECTS','Affects another object','Direction/magnitude require claim evidence.'),
('DEPENDS_ON','Dependency relation','Dependency strength/context may vary.'),
('ADDRESSES','Semantic solution-to-problem relevance','ADDRESSES never implies effectiveness.'),
('IMPLEMENTS_PATHWAY','Intervention implements a solution pathway','Mechanistic hierarchy, not effectiveness.'),
('VARIANT_OF','Legacy/specialisation relation preserved during VARIANT migration','VARIANT is not a durable canonical object type.'),
('SPECIALISES','Intervention is a more specific intervention/pathway','Specialisation only.'),
('PROVIDED_AS','Intervention is available as an offering','Provider/availability relation only.'),
('USES_INTERVENTION','Implementation uses an intervention','Implementation existence is not outcome evidence.'),
('LOCATED_IN','Object has sourced/declared Place context','Place role/precision must remain explicit.'),
('PRODUCES_OUTCOME','Implementation/action is linked to an observed/reported outcome','Expected outcome must not be encoded here.'),
('IDENTIFIES_GAP','Assessment/problem identifies a gap','Gap may be observed or analytical.'),
('MAY_TRANSFER_TO','Transferability relation','Hypothesis unless evidence-backed assessment exists.'),
('OVERLAPS_WITH','Scope overlap','Not equivalence.'),
('MAY_ACCELERATE','Potential acceleration relation','Potential role, not guaranteed effect.'),
('TARGETS','Target relation','Targeting does not prove outcome.'),
('MEASURES','Measurement-to-target relation','Measurement provenance remains required.');

create table public.predicate_constraints (
  predicate text not null references public.predicate_definitions(predicate) on delete cascade,
  subject_type text not null references public.brain_object_types(object_type),
  object_type text not null references public.brain_object_types(object_type),
  primary key(predicate,subject_type,object_type)
);

insert into public.predicate_constraints(predicate,subject_type,object_type) values
('HAS_PARENT','PROBLEM_FRAME','PROBLEM_FRAME'),
('IN_SYSTEM_LINK','PROBLEM_FRAME','SYSTEM'),
('RELATES_TO','PROBLEM_FRAME','PROBLEM_FRAME'),
('CONTRIBUTES_TO','PROBLEM_FRAME','PROBLEM_FRAME'),
('CONTRIBUTES_TO','PRESSURE','PROBLEM_FRAME'),
('CREATES_PRESSURE','HUMAN_SYSTEM','PRESSURE'),
('CREATES_PRESSURE','ACTOR','PRESSURE'),
('AFFECTS','PRESSURE','LIVING_SYSTEM'),
('AFFECTS','PRESSURE','HUMAN_SYSTEM'),
('DEPENDS_ON','LIVING_SYSTEM','FUNCTION'),
('DEPENDS_ON','HUMAN_SYSTEM','ECOSYSTEM_SERVICE'),
('DEPENDS_ON','ECOSYSTEM_SERVICE','FUNCTION'),
('ADDRESSES','SOLUTION_PATHWAY','PROBLEM_FRAME'),
('ADDRESSES','INTERVENTION','PROBLEM_FRAME'),
('ADDRESSES','OFFERING','PROBLEM_FRAME'),
('IMPLEMENTS_PATHWAY','INTERVENTION','SOLUTION_PATHWAY'),
('VARIANT_OF','INTERVENTION','INTERVENTION'),
('SPECIALISES','INTERVENTION','INTERVENTION'),
('SPECIALISES','INTERVENTION','SOLUTION_PATHWAY'),
('PROVIDED_AS','INTERVENTION','OFFERING'),
('USES_INTERVENTION','IMPLEMENTATION','INTERVENTION'),
('LOCATED_IN','IMPLEMENTATION','PLACE'),
('LOCATED_IN','ACTOR','PLACE'),
('LOCATED_IN','PUBLIC_DECISION','PLACE'),
('PRODUCES_OUTCOME','IMPLEMENTATION','BRAIN_OUTCOME'),
('IDENTIFIES_GAP','PROBLEM_FRAME','GAP'),
('MAY_TRANSFER_TO','INTERVENTION','PLACE'),
('OVERLAPS_WITH','PROBLEM_FRAME','PROBLEM_FRAME'),
('MAY_ACCELERATE','MISSION','INTERVENTION'),
('TARGETS','EXPECTED_OUTCOME','PROBLEM_FRAME'),
('TARGETS','EXPECTED_OUTCOME','IMPLEMENTATION'),
('MEASURES','MEASUREMENT','IMPLEMENTATION'),
('MEASURES','MEASUREMENT','BRAIN_OUTCOME');

create table public.brain_relationships (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.brain_objects(id) on delete restrict,
  predicate text not null references public.predicate_definitions(predicate),
  object_id uuid not null references public.brain_objects(id) on delete restrict,
  review_status text not null default 'UNREVIEWED' check (review_status in ('UNREVIEWED','SOURCE_CHECKED','LITERATURE_CHECKED','REVIEWED','EXPERT_REVIEWED','REJECTED')),
  interpretation_status text not null default '4PLANET_INTERPRETATION' check (interpretation_status in ('SOURCE_REPORTED','4PLANET_INTERPRETATION','INFERENCE')),
  visibility text not null default 'INTERNAL' check (visibility in ('PUBLIC','INTERNAL','RESTRICTED')),
  relation_basis text,
  relation_confidence text,
  effectiveness_implication text not null default 'NONE' check (effectiveness_implication='NONE'),
  created_at timestamptz not null default now(),
  check (subject_id <> object_id),
  unique(subject_id,predicate,object_id)
);
create index brain_relationships_subject_idx on public.brain_relationships(subject_id,predicate);
create index brain_relationships_object_idx on public.brain_relationships(object_id,predicate);

create or replace function public.enforce_brain_relationship_types()
returns trigger language plpgsql as $$
declare s_type text; o_type text;
begin
  select object_type into s_type from public.brain_objects where id=new.subject_id;
  select object_type into o_type from public.brain_objects where id=new.object_id;
  if not exists (
    select 1 from public.predicate_constraints c
    where c.predicate=new.predicate and c.subject_type=s_type and c.object_type=o_type
  ) then
    raise exception 'Predicate % not allowed for % -> %',new.predicate,s_type,o_type using errcode='23514';
  end if;
  return new;
end $$;
create trigger brain_relationships_type_guard before insert or update on public.brain_relationships
for each row execute function public.enforce_brain_relationship_types();

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
  check (((object_value_id is not null)::int + (value_text is not null)::int + (value_numeric is not null)::int) = 1)
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

create table public.assessment_runs (
  id uuid primary key default gen_random_uuid(),
  assessment_kind text not null,
  methodology_version text not null,
  lens text,
  dimensions jsonb not null,
  source_release text,
  created_at timestamptz not null default now()
);

create table public.assessments (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  run_id uuid not null references public.assessment_runs(id) on delete restrict,
  target_object_id uuid not null references public.brain_objects(id) on delete restrict,
  dimension_key text not null,
  ordinal_value integer,
  categorical_value text,
  rationale text,
  evidence_strength text not null default 'UNASSESSED' check (evidence_strength in ('UNASSESSED','INSUFFICIENT','LIMITED','MODERATE','STRONG')),
  check (ordinal_value is not null or categorical_value is not null)
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
  limitations text,
  check (amount is not null or amount_low is not null or amount_high is not null)
);

create table public.transferability_assessments (
  object_id uuid primary key references public.brain_objects(id) on delete restrict,
  intervention_id uuid references public.interventions(object_id) on delete set null,
  source_place_id uuid references public.places(object_id) on delete set null,
  target_place_id uuid references public.places(object_id) on delete set null,
  decision_context text not null,
  factors jsonb not null default '{}'::jsonb,
  conclusion_class text not null check (conclusion_class in ('EVIDENCE_BACKED','PLAUSIBLE_HYPOTHESIS','WEAK_UNCERTAIN','NOT_ASSESSED')),
  material_unknowns text[] not null default '{}'
);

create table public.brain_import_batches (
  id uuid primary key default gen_random_uuid(),
  batch_key text not null unique,
  source_release text not null,
  package_sha256 text not null check (package_sha256 ~ '^[a-f0-9]{64}$'),
  status text not null default 'CREATED' check (status in ('CREATED','STAGED','VALIDATED','QUARANTINED','PROMOTED','FAILED')),
  founder_release boolean not null default false,
  counts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  validated_at timestamptz,
  promoted_at timestamptz
);

create table public.brain_staging_records (
  id bigserial primary key,
  batch_id uuid not null references public.brain_import_batches(id) on delete cascade,
  record_family text not null,
  source_ref text not null,
  payload jsonb not null,
  payload_sha256 text not null check (payload_sha256 ~ '^[a-f0-9]{64}$'),
  validation_status text not null default 'PENDING' check (validation_status in ('PENDING','VALID','INVALID','QUARANTINED','PROMOTED')),
  validation_errors text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique(batch_id,record_family,source_ref,payload_sha256)
);
create index brain_staging_batch_idx on public.brain_staging_records(batch_id,record_family,validation_status);

create table public.brain_quarantine_records (
  id bigserial primary key,
  staging_record_id bigint not null unique references public.brain_staging_records(id) on delete cascade,
  reason_codes text[] not null,
  details text,
  quarantined_at timestamptz not null default now()
);

create table public.brain_promotion_events (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.brain_import_batches(id) on delete restrict,
  promoted_record_count integer not null default 0,
  promoted_by text not null,
  promoted_at timestamptz not null default now(),
  notes text
);

create or replace function public.stage_brain_record(
  p_batch_key text,p_record_family text,p_source_ref text,p_payload jsonb,p_payload_sha256 text
) returns bigint language plpgsql as $$
declare v_batch uuid; v_id bigint;
begin
  select id into v_batch from public.brain_import_batches where batch_key=p_batch_key;
  if v_batch is null then raise exception 'Unknown import batch %',p_batch_key; end if;
  insert into public.brain_staging_records(batch_id,record_family,source_ref,payload,payload_sha256)
  values(v_batch,p_record_family,p_source_ref,p_payload,p_payload_sha256)
  on conflict(batch_id,record_family,source_ref,payload_sha256) do update set payload=excluded.payload
  returning id into v_id;
  update public.brain_import_batches set status='STAGED' where id=v_batch and status='CREATED';
  return v_id;
end $$;

create or replace function public.promote_brain_import_batch(p_batch_key text,p_promoted_by text)
returns void language plpgsql as $$
declare v_batch public.brain_import_batches%rowtype; v_count integer;
begin
  select * into v_batch from public.brain_import_batches where batch_key=p_batch_key for update;
  if v_batch.id is null then raise exception 'Unknown import batch %',p_batch_key; end if;
  if not v_batch.founder_release then raise exception 'Founder release required before promotion'; end if;
  if exists(select 1 from public.brain_staging_records where batch_id=v_batch.id and validation_status not in ('VALID','PROMOTED')) then
    raise exception 'All staging rows must be VALID before promotion';
  end if;
  update public.brain_staging_records set validation_status='PROMOTED' where batch_id=v_batch.id and validation_status='VALID';
  get diagnostics v_count=row_count;
  update public.brain_import_batches set status='PROMOTED',promoted_at=now() where id=v_batch.id;
  insert into public.brain_promotion_events(batch_id,promoted_record_count,promoted_by) values(v_batch.id,v_count,p_promoted_by);
end $$;

create table public.context_pack_runs (
  id uuid primary key default gen_random_uuid(),
  query_text text not null,
  task_type text not null,
  root_object_id uuid references public.brain_objects(id),
  resolved_object_ids uuid[] not null default '{}',
  included_object_ids uuid[] not null default '{}',
  included_claim_ids uuid[] not null default '{}',
  included_source_record_ids text[] not null default '{}',
  excluded_summary jsonb not null default '{}'::jsonb,
  retrieval_version text not null,
  database_revision text,
  model_ref text,
  object_count integer not null default 0,
  claim_count integer not null default 0,
  source_count integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.brain_resolve_objects(p_query text,p_limit integer default 10)
returns table(public_ref text,object_type text,title text,review_status text)
language sql stable as $$
  select distinct o.public_ref,o.object_type,o.title,o.review_status
  from public.brain_objects o
  left join public.brain_aliases a on a.object_id=o.id
  where lower(o.public_ref)=lower(p_query)
     or lower(o.title) like '%'||lower(p_query)||'%'
     or lower(coalesce(a.alias,'')) like '%'||lower(p_query)||'%'
  order by o.title
  limit greatest(1,least(p_limit,50));
$$;

create or replace function public.brain_context_pack(
  p_root_ref text,
  p_predicates text[] default null,
  p_max_hops integer default 2,
  p_max_objects integer default 40,
  p_max_claims integer default 30,
  p_max_sources integer default 40
) returns jsonb language plpgsql stable as $$
declare v_root uuid; v_result jsonb;
begin
  if p_max_hops<0 or p_max_hops>3 then raise exception 'p_max_hops must be 0..3'; end if;
  if p_max_objects<1 or p_max_objects>100 then raise exception 'p_max_objects must be 1..100'; end if;
  if p_max_claims<0 or p_max_claims>100 then raise exception 'p_max_claims must be 0..100'; end if;
  if p_max_sources<0 or p_max_sources>150 then raise exception 'p_max_sources must be 0..150'; end if;
  select id into v_root from public.brain_objects where public_ref=p_root_ref;
  if v_root is null then return jsonb_build_object('status','NOT_FOUND','root_ref',p_root_ref,'objects','[]'::jsonb,'relationships','[]'::jsonb,'claims','[]'::jsonb,'sources','[]'::jsonb); end if;

  with recursive walk(id,depth) as (
    select v_root,0
    union
    select case when r.subject_id=w.id then r.object_id else r.subject_id end,w.depth+1
    from walk w
    join public.brain_relationships r on (r.subject_id=w.id or r.object_id=w.id)
    where w.depth<p_max_hops
      and r.review_status<>'REJECTED'
      and (p_predicates is null or r.predicate=any(p_predicates))
  ), objs as (
    select w.id,min(w.depth) depth from walk w group by w.id order by min(w.depth),w.id limit p_max_objects
  ), rels as (
    select r.* from public.brain_relationships r
    where r.subject_id in(select id from objs) and r.object_id in(select id from objs)
      and r.review_status<>'REJECTED' and (p_predicates is null or r.predicate=any(p_predicates))
  ), clms as (
    select c.* from public.claims c where c.subject_id in(select id from objs) and c.review_status<>'REJECTED'
    order by case c.evidence_strength when 'STRONG' then 0 when 'MODERATE' then 1 when 'LIMITED' then 2 when 'INSUFFICIENT' then 3 else 4 end,c.created_at desc
    limit p_max_claims
  ), ev as (
    select ce.* from public.claim_evidence ce where ce.claim_id in(select object_id from clms)
  ), src as (
    select distinct sr.id,sr.source_id,sr.source_url,sr.retrieved_at,sr.rights_status,sr.visibility
    from public.source_records sr join ev on ev.source_record_id=sr.id limit p_max_sources
  )
  select jsonb_build_object(
    'status','OK','root_ref',p_root_ref,
    'bounds',jsonb_build_object('max_hops',p_max_hops,'max_objects',p_max_objects,'max_claims',p_max_claims,'max_sources',p_max_sources),
    'objects',coalesce((select jsonb_agg(jsonb_build_object('public_ref',o.public_ref,'object_type',o.object_type,'title',o.title,'review_status',o.review_status,'visibility',o.visibility,'depth',ob.depth) order by ob.depth,o.public_ref) from objs ob join public.brain_objects o on o.id=ob.id),'[]'::jsonb),
    'relationships',coalesce((select jsonb_agg(jsonb_build_object('subject_ref',s.public_ref,'predicate',r.predicate,'object_ref',t.public_ref,'review_status',r.review_status,'interpretation_status',r.interpretation_status,'effectiveness_implication',r.effectiveness_implication)) from rels r join public.brain_objects s on s.id=r.subject_id join public.brain_objects t on t.id=r.object_id),'[]'::jsonb),
    'claims',coalesce((select jsonb_agg(jsonb_build_object('claim_ref',co.public_ref,'subject_ref',so.public_ref,'predicate',c.predicate,'object_ref',oo.public_ref,'value_text',c.value_text,'value_numeric',c.value_numeric,'value_unit',c.value_unit,'review_status',c.review_status,'evidence_strength',c.evidence_strength,'interpretation_status',c.interpretation_status,'evidence',coalesce((select jsonb_agg(jsonb_build_object('source_record_id',ce.source_record_id,'direction',ce.direction,'directness',ce.directness,'geography',ce.geography,'limitations',ce.limitations)) from public.claim_evidence ce where ce.claim_id=c.object_id),'[]'::jsonb))) from clms c join public.brain_objects co on co.id=c.object_id join public.brain_objects so on so.id=c.subject_id left join public.brain_objects oo on oo.id=c.object_value_id),'[]'::jsonb),
    'sources',coalesce((select jsonb_agg(to_jsonb(src)) from src),'[]'::jsonb),
    'truth_boundary',jsonb_build_object('source_is_claim',false,'claim_is_verified_fact',false,'relation_is_effectiveness',false,'database_absence_is_real_world_absence',false)
  ) into v_result;
  return v_result;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'brain_canon_decisions','brain_object_types','brain_objects','brain_revisions','brain_aliases','brain_external_identities','brain_legacy_mappings','brain_review_designations','sources',
    'problem_frames','solution_pathways','interventions','actors','offerings','needs','places','implementations','implementation_events','implementation_interventions','implementation_offerings','implementation_actors','implementation_places',
    'public_decisions','expected_outcomes','measurements','brain_outcomes','gaps','predicate_definitions','predicate_constraints','brain_relationships','claims','claim_evidence','assessment_runs','assessments','cost_observations','transferability_assessments',
    'brain_import_batches','brain_staging_records','brain_quarantine_records','brain_promotion_events','context_pack_runs'
  ] loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;

create policy brain_objects_public_read on public.brain_objects for select to anon,authenticated using (visibility='PUBLIC' and lifecycle_state='CANONICAL' and review_status not in ('UNREVIEWED','REJECTED'));
create policy sources_public_read on public.sources for select to anon,authenticated using (visibility='PUBLIC');
create policy brain_relationships_public_read on public.brain_relationships for select to anon,authenticated using (visibility='PUBLIC' and review_status not in ('UNREVIEWED','REJECTED') and interpretation_status <> 'INFERENCE');
create policy claims_public_read on public.claims for select to anon,authenticated using (visibility='PUBLIC' and review_status not in ('UNREVIEWED','REJECTED') and interpretation_status <> 'INFERENCE');
create policy claim_evidence_public_read on public.claim_evidence for select to anon,authenticated using (exists(select 1 from public.claims c where c.object_id=claim_evidence.claim_id and c.visibility='PUBLIC' and c.review_status not in ('UNREVIEWED','REJECTED') and c.interpretation_status <> 'INFERENCE'));

create policy problem_frames_public_read on public.problem_frames for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=problem_frames.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy pathways_public_read on public.solution_pathways for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=solution_pathways.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy interventions_public_read on public.interventions for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=interventions.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy offerings_public_read on public.offerings for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=offerings.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy actors_public_read on public.actors for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=actors.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy places_public_read on public.places for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=places.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy implementations_public_read on public.implementations for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=implementations.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));
create policy public_decisions_public_read on public.public_decisions for select to anon,authenticated using (exists(select 1 from public.brain_objects o where o.id=public_decisions.object_id and o.visibility='PUBLIC' and o.lifecycle_state='CANONICAL' and o.review_status not in ('UNREVIEWED','REJECTED')));

grant select on public.brain_objects,public.sources,public.brain_relationships,public.problem_frames,public.solution_pathways,public.interventions,public.offerings,public.actors,public.places,public.implementations,public.public_decisions,public.claims,public.claim_evidence,public.solution_catalogue to anon,authenticated;
revoke insert,update,delete on all tables in schema public from anon,authenticated;
revoke all on function public.stage_brain_record(text,text,text,jsonb,text) from public,anon,authenticated;
revoke all on function public.promote_brain_import_batch(text,text) from public,anon,authenticated;
revoke all on function public.brain_context_pack(text,text[],integer,integer,integer,integer) from public,anon,authenticated;

comment on table public.brain_objects is 'Canonical One Planet Model addressable-object registry. Public refs preserve durable external/corpus IDs.';
comment on table public.problem_frames is 'FD-01: scoped/versioned PROBLEM_FRAME storage; public UX may label Problem.';
comment on table public.interventions is 'FD-02/FD-03: canonical intervention storage. Legacy VARIANT survives only in migration history/typed relations.';
comment on table public.offerings is 'FD-03: provider/productised offering distinct from intervention and implementation.';
comment on table public.needs is 'FD-04: need_kind and need_origin are orthogonal; external demand requires provenance.';
comment on table public.implementations is 'FD-05: execution phase and execution state are separate; finance/contracts/announcements are sourced events.';
comment on table public.claims is 'Atomic claims. Review/completeness metadata must not be interpreted as solution effectiveness.';
comment on table public.claim_evidence is 'Evidence direction is SUPPORTS, QUALIFIES or CHALLENGES; qualifiers are not contradictions.';
comment on table public.context_pack_runs is 'Auditable bounded retrieval packages. DATABASE != LLM CONTEXT.';

commit;
