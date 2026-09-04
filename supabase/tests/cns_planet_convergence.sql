\set ON_ERROR_STOP on
\timing on

-- SUPERBRAIN / Planet Brain convergence contract.
-- Runs on ephemeral certification DB. All fixture writes are rolled back.

begin;

-- Security: no direct public access to CNS; all CNS tables use RLS as defence in depth.
do $$
begin
  if has_schema_privilege('anon','cns','USAGE') then raise exception 'PLANET_SECURITY_ANON_CNS_USAGE'; end if;
  if has_schema_privilege('authenticated','cns','USAGE') then raise exception 'PLANET_SECURITY_AUTH_CNS_USAGE'; end if;
  if exists(
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='cns' and c.relkind='r' and not c.relrowsecurity
  ) then raise exception 'PLANET_SECURITY_RLS_GAP'; end if;
end $$;

insert into cns.source_registry(
  source_id,source_kind,name,authority,truth_domain,current_revision,state,last_verified_at,
  visibility_state,rights_state,licence,attribution,source_quality_state,freshness_state
) values(
  'planet-test-source','SYNTHETIC','Planet Test Source','TEST','PLANET','r1','ACTIVE',now(),
  'INTERNAL','ALLOW','TEST','4PLANET TEST','PRIMARY_AUTHORITY','CURRENT'
);

insert into cns.datasets(
  dataset_id,source_id,upstream_dataset_id,title,publisher,rights_state,visibility_state
) values(
  'dataset:planet:test','planet-test-source','upstream-test','Planet Test Dataset','4PLANET TEST','ALLOW','INTERNAL'
);

insert into cns.source_records(
  source_record_id,source_id,dataset_id,upstream_record_id,retrieved_at,source_timestamp,payload_hash,
  raw_payload,licence,attribution,rights_state,parse_state,visibility_state
) values(
  'source-record:planet:test:1','planet-test-source','dataset:planet:test','1',now(),now(),'hash-test-1',
  '{"record":"immutable"}'::jsonb,'TEST','4PLANET TEST','ALLOW','VALID','INTERNAL'
);

-- Immutable Source Record: a correction must be a new record/revision.
do $$
begin
  begin
    update cns.source_records set raw_payload='{"mutated":true}'::jsonb where source_record_id='source-record:planet:test:1';
    raise exception 'PLANET_SOURCE_RECORD_MUTATION_WAS_ALLOWED';
  exception when others then
    if sqlerrm='PLANET_SOURCE_RECORD_MUTATION_WAS_ALLOWED' then raise; end if;
  end;
end $$;

insert into cns.entities(
  entity_id,entity_type,canonical_name,lifecycle,source_id,source_revision,
  visibility_state,nature_sensitivity_state,review_state,evidence_strength,
  geom_private,geom_public,spatial_precision_m,public_precision_m,boundary_semantics
) values
  ('taxon:4p:test-jaguar','TAXON','Test Jaguar','ACTIVE','planet-test-source','r1',
   'INTERNAL','SENSITIVE_NATURE','SOURCE_CHECKED','STRONG',
   gis.ST_SetSRID(gis.ST_MakePoint(-60,-3),4326),gis.ST_SetSRID(gis.ST_MakePoint(-60,-3),4326),10,10000,'GENERALIZED_PUBLIC_CONTEXT'),
  ('place:4p:test-amazonia','PLACE','Test Amazonia','ACTIVE','planet-test-source','r1',
   'PUBLIC_VERIFIED','NONE','INDEPENDENTLY_VERIFIED','STRONG',
   gis.ST_SetSRID(gis.ST_MakePoint(-60,-3),4326),gis.ST_SetSRID(gis.ST_MakePoint(-60,-3),4326),1000,1000,'TEST_CONTEXT');

insert into cns.relationships(
  relationship_id,subject_entity_id,predicate,object_entity_id,relationship_kind,source_id,source_revision,
  review_state,evidence_strength,interpretation_state,visibility_state
) values(
  'relationship:4p:test-jaguar:uses:test-amazonia','taxon:4p:test-jaguar','USES_HABITAT','place:4p:test-amazonia',
  'ECOLOGICAL','planet-test-source','r1','SOURCE_CHECKED','STRONG','NORMALISED_RECORD','INTERNAL'
);

insert into cns.evidence(
  evidence_id,evidence_type,source_id,source_revision,metadata,state,revision,sensitivity_state,
  visibility_state,review_state,evidence_strength,rights_state
) values(
  'evidence:planet:test:1','SOURCE_RECORD','planet-test-source','r1',
  jsonb_build_object('source_record_id','source-record:planet:test:1'),'ACTIVE',1,'INTERNAL',
  'INTERNAL','SOURCE_CHECKED','STRONG','ALLOW'
);

insert into cns.claims(
  claim_id,subject_type,subject_id,predicate,value,authority,state,claim_kind,knowledge_state,
  source_id,source_revision,revision,sensitivity_state,visibility_state,review_state,evidence_strength,
  interpretation_state,freshness_state
) values(
  'claim:planet:test:relationship','RELATIONSHIP','relationship:4p:test-jaguar:uses:test-amazonia','SUPPORTED',
  '{"statement":"synthetic relationship test"}'::jsonb,'TEST','ACTIVE','SOURCE_CLAIM','KNOWN',
  'planet-test-source','r1',1,'INTERNAL','INTERNAL','SOURCE_CHECKED','STRONG','NORMALISED_RECORD','CURRENT'
);
insert into cns.claim_evidence(claim_id,evidence_id,relation)
values('claim:planet:test:relationship','evidence:planet:test:1','SUPPORTS');

insert into cns.observations(
  observation_id,entity_id,observation_type,value,observed_at,source_id,source_revision,evidence_id,source_record_id,
  sensitivity_state,state,revision,visibility_state,nature_sensitivity_class,review_state,evidence_strength,
  interpretation_state,freshness_state,geom_private,geom_public,spatial_precision_m,public_precision_m
) values(
  'observation:planet:test:1','taxon:4p:test-jaguar','OCCURRENCE','{"presence":true}'::jsonb,now(),
  'planet-test-source','r1','evidence:planet:test:1','source-record:planet:test:1',
  'GENERALIZED','ACTIVE',1,'INTERNAL','SENSITIVE_NATURE','SOURCE_CHECKED','STRONG',
  'NORMALISED_RECORD','CURRENT',gis.ST_SetSRID(gis.ST_MakePoint(-60,-3),4326),gis.ST_SetSRID(gis.ST_MakePoint(-60,-3),4326),10,10000
);

-- Observation must not silently become a Signal.
do $$
begin
  if exists(select 1 from cns.signals where signal_id='observation:planet:test:1') then
    raise exception 'PLANET_OBSERVATION_SIGNAL_COLLAPSE';
  end if;
end $$;

-- PUBLIC_CANDIDATE / INTERNAL must never appear merely because data exists.
insert into cns.public_projections(
  projection_id,object_type,object_id,object_revision,payload,source_refs,rights_state,
  nature_sensitivity_state,truth_checked,evidence_checked,rights_checked,sensitivity_checked,
  verified_by,verification_authority,verified_at,state
) values(
  'projection:test:internal-entity','ENTITY','taxon:4p:test-jaguar',1,
  '{"name":"must not publish"}'::jsonb,'["source-record:planet:test:1"]'::jsonb,'ALLOW',
  'SENSITIVE_NATURE',true,true,true,true,'test','TEST',now(),'CANDIDATE'
);

do $$
begin
  begin
    perform cns.activate_public_projection('projection:test:internal-entity');
    raise exception 'PLANET_INTERNAL_OBJECT_PUBLICATION_WAS_ALLOWED';
  exception when others then
    if sqlerrm='PLANET_INTERNAL_OBJECT_PUBLICATION_WAS_ALLOWED' then raise; end if;
  end;
  if exists(select 1 from public.superbrain_public_v1 where projection_id='projection:test:internal-entity') then
    raise exception 'PLANET_INTERNAL_PROJECTION_LEAK';
  end if;
end $$;

-- A verified canonical object still requires an explicit sanitized projection.
insert into cns.public_projections(
  projection_id,object_type,object_id,object_revision,payload,source_refs,rights_state,
  nature_sensitivity_state,truth_checked,evidence_checked,rights_checked,sensitivity_checked,
  verified_by,verification_authority,verified_at,state
) values(
  'projection:test:place','ENTITY','place:4p:test-amazonia',1,
  '{"entity_id":"place:4p:test-amazonia","name":"Test Amazonia","kind":"PLACE"}'::jsonb,
  '["source-record:planet:test:1"]'::jsonb,'ALLOW','NONE',true,true,true,true,'independent-test','TEST_AUTHORITY',now(),'CANDIDATE'
);
select cns.activate_public_projection('projection:test:place');

do $$
begin
  if (select count(*) from public.superbrain_public_v1 where projection_id='projection:test:place') <> 1 then
    raise exception 'PLANET_PUBLIC_VERIFIED_PROJECTION_MISSING';
  end if;
  if exists(select 1 from public.superbrain_public_v1 where projection_id='projection:test:internal-entity') then
    raise exception 'PLANET_PUBLIC_BOUNDARY_LEAK';
  end if;
end $$;

-- Public role can read only the sanitized public view, not CNS.
set local role anon;
select count(*) from public.superbrain_public_v1;
reset role;

-- General relationship graph is traversable in both directions without project dependency semantics.
do $$
begin
  if not exists(
    select 1 from cns.relationships
    where subject_entity_id='taxon:4p:test-jaguar' and predicate='USES_HABITAT'
      and object_entity_id='place:4p:test-amazonia'
  ) then raise exception 'PLANET_RELATIONSHIP_GRAPH_MISSING'; end if;
  if not exists(
    select 1 from cns.claim_evidence ce
    where ce.claim_id='claim:planet:test:relationship' and ce.relation='SUPPORTS'
  ) then raise exception 'PLANET_CLAIM_EVIDENCE_CHAIN_MISSING'; end if;
end $$;

rollback;

select 'CNS_PLANET_CONVERGENCE_PASS' as result;
