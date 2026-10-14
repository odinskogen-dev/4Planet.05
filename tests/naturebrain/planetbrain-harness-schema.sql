-- TEST HARNESS ONLY — minimal shape of the NATUREBRAIN planetbrain tables that the
-- IMPACT projections read. This is NOT the canonical schema and is never applied to
-- Supabase. It exists so projection SQL can be compiled and exercised locally (PGlite).
create schema if not exists planetbrain;
create table planetbrain.sources (source_id text primary key, name text, source_type text, canonical_uri text, rights text, attribution text, status text, provenance jsonb default '{}'::jsonb, updated_at timestamptz default now());
create table planetbrain.datasets (dataset_id text primary key, source_id text references planetbrain.sources(source_id), name text, version text, canonical_uri text, rights text, temporal_coverage jsonb, spatial_coverage jsonb, provenance jsonb, updated_at timestamptz default now());
create table planetbrain.source_records (record_id text primary key, dataset_id text references planetbrain.datasets(dataset_id), external_record_id text, normalised_payload jsonb, source_event_at timestamptz, retrieved_at timestamptz, rights text, issues jsonb, limitations jsonb, provenance jsonb);
create table planetbrain.entities (id bigserial primary key, canonical_id text unique not null, entity_type text not null, name text, description text, status text, provenance jsonb default '{}'::jsonb, updated_at timestamptz default now());
create table planetbrain.actors (entity_id bigint primary key references planetbrain.entities(id), actor_type text, provenance jsonb);
create table planetbrain.solutions (entity_id bigint primary key references planetbrain.entities(id), solution_type text, provenance jsonb);
create table planetbrain.claims (claim_id text primary key, subject_entity_id bigint references planetbrain.entities(id), statement text, review_status text, evidence_strength text, interpretation_status text, provenance jsonb, updated_at timestamptz default now());
create table planetbrain.evidence (evidence_id text primary key, evidence_type text, source_record_id text references planetbrain.source_records(record_id), citation text, reviewed_at timestamptz, provenance jsonb);
create table planetbrain.claim_evidence (claim_id text references planetbrain.claims(claim_id), evidence_id text references planetbrain.evidence(evidence_id), relation text, primary key (claim_id, evidence_id));
create table planetbrain.relationships (relationship_id text primary key, subject_entity_id bigint references planetbrain.entities(id), predicate text, object_entity_id bigint references planetbrain.entities(id), review_status text, evidence_strength text, provenance jsonb, claim_id text, valid_from timestamptz, valid_to timestamptz);
do $$ begin create role anon; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
do $$ begin create role service_role; exception when duplicate_object then null; end $$;
