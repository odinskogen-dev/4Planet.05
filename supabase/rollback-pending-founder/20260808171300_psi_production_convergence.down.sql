begin;
-- Remove only PSI convergence objects. Preserve the pre-existing prototype truth spine.
drop table if exists public.psi_staging_solution_problem;
drop table if exists public.psi_import_batches;
drop table if exists public.measurements;
drop table if exists public.object_place_links;
drop table if exists public.places;
drop table if exists public.assessments;
drop table if exists public.assessment_runs;
drop table if exists public.claim_evidence;
drop table if exists public.claims;
drop table if exists public.graph_edges;
drop table if exists public.predicate_constraints;
drop table if exists public.predicate_definitions;
drop table if exists public.system_entities;
drop table if exists public.intelligence_objects;
drop table if exists public.object_registry;
-- legacy_interpretation_status is intentionally retained if the candidate was ever run;
-- reverse semantic remapping requires explicit review and must not be guessed.
commit;
