begin;

drop function if exists public.brain_context_pack(text,text[],integer,integer,integer,integer);
drop function if exists public.brain_resolve_objects(text,integer);
drop function if exists public.promote_brain_import_batch(text,text);
drop function if exists public.stage_brain_record(text,text,text,jsonb,text);

drop view if exists public.solution_catalogue;

-- Drop the trigger before its guard function so rollback remains explicit and non-CASCADE.
drop trigger if exists brain_relationships_type_guard on public.brain_relationships;
drop function if exists public.enforce_brain_relationship_types();

drop table if exists public.context_pack_runs;
drop table if exists public.brain_promotion_events;
drop table if exists public.brain_quarantine_records;
drop table if exists public.brain_staging_records;
drop table if exists public.brain_import_batches;
drop table if exists public.transferability_assessments;
drop table if exists public.cost_observations;
drop table if exists public.assessments;
drop table if exists public.assessment_runs;
drop table if exists public.claim_evidence;
drop table if exists public.claims;
drop table if exists public.brain_relationships;
drop table if exists public.predicate_constraints;
drop table if exists public.predicate_definitions;
drop table if exists public.gaps;
drop table if exists public.brain_outcomes;
drop table if exists public.measurements;
drop table if exists public.expected_outcomes;
drop table if exists public.public_decisions;
drop table if exists public.implementation_places;
drop table if exists public.implementation_actors;
drop table if exists public.implementation_offerings;
drop table if exists public.implementation_interventions;
drop table if exists public.implementation_events;
drop table if exists public.implementations;
drop table if exists public.places;
drop table if exists public.needs;
drop table if exists public.offerings;
drop table if exists public.actors;
drop table if exists public.interventions;
drop table if exists public.solution_pathways;
drop table if exists public.problem_frames;
drop table if exists public.sources;
drop table if exists public.brain_review_designations;
drop table if exists public.brain_legacy_mappings;
drop table if exists public.brain_external_identities;
drop table if exists public.brain_aliases;
drop table if exists public.brain_revisions;
drop table if exists public.brain_objects;
drop table if exists public.brain_object_types;
drop table if exists public.brain_canon_decisions;

-- Deliberately preserve the pre-existing truth spine:
-- source_records, taxon_observations, signals, interpretations,
-- impact_unit_definitions, contributions, deliveries, outcomes, impacts, product_contexts.
commit;
