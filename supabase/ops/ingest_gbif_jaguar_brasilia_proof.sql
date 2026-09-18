-- 4PLANET SUPERBRAIN — REAL SOURCE PROOF 01
-- GBIF / Check List one-record Jaguar occurrence dataset -> restricted observation
-- -> evidence/claim/relationship -> generalized PUBLIC_CANDIDATE projection.
--
-- IMPORTANT TRUTH BOUNDARIES
-- * Dataset facts are source-bound, not 4PLANET truth by assertion.
-- * Upstream occurrence ID is intentionally NULL because it has not been independently resolved.
-- * Exact coordinates are stored RESTRICTED + SENSITIVE_NATURE and never enter public cache.
-- * Occurrence != range != abundance != trend != live position.
-- * Generalized projection remains CANDIDATE; this script performs no public release.
\set ON_ERROR_STOP on

begin;

insert into cns.source_registry(
  source_id,source_kind,name,uri,authority,truth_domain,current_revision,
  state,last_verified_at,metadata,sensitivity_state,visibility_state,
  rights_state,licence,attribution,freshness_state
) values(
  'gbif',
  'BIODIVERSITY_INFRASTRUCTURE',
  'Global Biodiversity Information Facility (GBIF)',
  'https://www.gbif.org/',
  'EXTERNAL_DATA_INFRASTRUCTURE',
  'BIODIVERSITY_OCCURRENCES',
  'accessed-2026-09-03',
  'ACTIVE',clock_timestamp(),
  jsonb_build_object(
    'proof_scope','bounded-real-source-01',
    'dataset_uuid','27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
    'dataset_doi','10.15468/dz6zuy',
    'source_note','GBIF is infrastructure/source; dataset record is evidence, not automatic truth.'
  ),
  'INTERNAL','INTERNAL','CONDITIONAL',null,
  'GBIF infrastructure; dataset-specific rights govern record use.',
  'CURRENT'
)
on conflict(source_id) do nothing;

insert into cns.source_revisions(source_id,revision,content_hash,observed_at,metadata)
values(
  'gbif','accessed-2026-09-03',null,clock_timestamp(),
  jsonb_build_object(
    'dataset_uuid','27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
    'dataset_doi','10.15468/dz6zuy',
    'dataset_page','https://www.gbif.org/dataset/27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
    'ipt_resource','https://ipt.pensoft.net/resource?r=new_jaguar_record_brasilia_brazil'
  )
)
on conflict(source_id,revision) do nothing;

insert into cns.datasets(
  dataset_id,source_id,upstream_dataset_id,title,publisher,scope,geography,
  temporal_coverage,update_frequency,licence,attribution,rights_state,
  limitations,visibility_state,state
) values(
  'dataset:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
  'gbif',
  '27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
  'New record of jaguar, Panthera onca (Linnaeus, 1758) (Mammalia, Felidae), from an urban park',
  'Check List',
  jsonb_build_object('record_count',1,'taxon','Panthera onca','resource_type','Occurrence Observation'),
  jsonb_build_object('country','Brazil','state_province','Distrito Federal','place','Brasília National Park'),
  jsonb_build_object('reported_observation_date','2021-09-25','dataset_version_published','2022-03-23'),
  null,
  'CC BY 4.0',
  'Petrazzini P B, Aguiar L M D S A (2022). New record of jaguar, Panthera onca, from an urban park. Check List. Occurrence dataset DOI 10.15468/dz6zuy.',
  'ALLOW',
  jsonb_build_array(
    'The resource contains one occurrence record.',
    'Occurrence evidence does not establish range, abundance, trend or live position.',
    'Exact wildlife location is treated as sensitive by 4PLANET regardless of source openness.'
  ),
  'INTERNAL','ACTIVE'
)
on conflict(dataset_id) do nothing;

with payload as (
  select jsonb_build_object(
    'scientific_name','Panthera onca',
    'common_name','Jaguar',
    'event_date','2021-09-25',
    'reported_local_time','19:15',
    'country','Brazil',
    'state_province','Distrito Federal',
    'municipality','Brasília',
    'locality','Parque Nacional de Brasília / Brasília National Park',
    'latitude_dms','15°38′12″S',
    'longitude_dms','048°02′21″W',
    'latitude_decimal',-15.6366666667,
    'longitude_decimal',-48.0391666667,
    'elevation_m',1250,
    'record_basis','wildlife camera trap photograph',
    'observer','Priscilla Braga Petrazzini',
    'individual_description','one adult jaguar; sex unidentified',
    'habitat_context','Cerrado sensu stricto near a dirt road and stream',
    'dataset_uuid','27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
    'dataset_doi','10.15468/dz6zuy',
    'upstream_occurrence_id',null,
    'upstream_occurrence_id_state','NOT_INDEPENDENTLY_RESOLVED',
    'truth_boundary','Reported occurrence only; not range, abundance, trend or live position.'
  ) as raw_payload
)
insert into cns.source_records(
  source_record_id,source_id,dataset_id,upstream_record_id,retrieval_uri,
  retrieved_at,source_timestamp,payload_hash,raw_payload,licence,attribution,
  rights_state,limitations,parse_state,visibility_state,nature_sensitivity_state,revision
)
select
  'source-record:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf:record-1',
  'gbif',
  'dataset:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
  null,
  'https://www.gbif.org/dataset/27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
  clock_timestamp(),
  '2022-03-23T00:00:00Z'::timestamptz,
  encode(extensions.digest(raw_payload::text,'sha256'),'hex'),
  raw_payload,
  'CC BY 4.0',
  'Petrazzini P B, Aguiar L M D S A (2022), Check List occurrence dataset, DOI 10.15468/dz6zuy.',
  'ALLOW',
  jsonb_build_array(
    'Upstream occurrence ID has not been independently resolved; internal record ID is 4PLANET-stable only.',
    'Exact coordinate is sensitive nature information and is not public-eligible.',
    'Source record is evidence of a reported observation only.'
  ),
  'VALID','RESTRICTED','SENSITIVE_NATURE',1
from payload
on conflict(source_record_id) do nothing;

insert into cns.entities(
  entity_id,entity_type,canonical_name,lifecycle,source_id,source_revision,metadata,
  visibility_state,nature_sensitivity_state,review_state,evidence_strength,revision
) values(
  'taxon:4p:panthera-onca','TAXON','Panthera onca','ACTIVE','gbif','accessed-2026-09-03',
  jsonb_build_object(
    'rank','SPECIES','common_name','Jaguar',
    'external_ids',jsonb_build_object('gbif_taxon_key','4CGXQ'),
    'identity_note','4PLANET canonical continuity identity; external taxonomy IDs remain crosswalks.'
  ),
  'INTERNAL','NONE','SOURCE_CHECKED','STRONG',1
),(
  'place:4p:brasilia-national-park','PLACE','Brasília National Park','ACTIVE','gbif','accessed-2026-09-03',
  jsonb_build_object('country','Brazil','state_province','Distrito Federal','place_type','National Park'),
  'INTERNAL','NONE','SOURCE_CHECKED','STRONG',1
)
on conflict(entity_id) do nothing;

insert into cns.entity_aliases(entity_id,namespace,alias,source_id,source_revision,state)
values
  ('taxon:4p:panthera-onca','GBIF_TAXON_KEY','4CGXQ','gbif','accessed-2026-09-03','ACTIVE'),
  ('taxon:4p:panthera-onca','SCIENTIFIC_NAME','Panthera onca','gbif','accessed-2026-09-03','ACTIVE')
on conflict(entity_id,namespace,normalised_alias) do nothing;

insert into cns.methodologies(
  methodology_id,name,version,description,assumptions,validity_domain,limitations,state
) values(
  '4p-sensitive-nature-generalization-v1',
  '4PLANET Sensitive Nature Occurrence Generalization','1',
  'Derive a coarse public-candidate description from a restricted exact occurrence while preserving provenance and withholding exact coordinates.',
  '[]'::jsonb,
  jsonb_build_object('object_type','species occurrence','release_authority','Founder/public verification still required'),
  jsonb_build_array('Generalization does not convert an occurrence into range, abundance, trend or live position evidence.'),
  'ACTIVE'
)
on conflict(methodology_id) do nothing;

insert into cns.evidence(
  evidence_id,project_id,evidence_type,source_id,source_revision,uri,excerpt,metadata,
  observed_at,verified_at,state,revision,sensitivity_state,visibility_state,review_state,
  evidence_strength,rights_state,nature_sensitivity_state
) values(
  'evidence:gbif-jaguar-brasilia-2021','species','SOURCE_RECORD','gbif','accessed-2026-09-03',
  'https://doi.org/10.15468/dz6zuy',
  'A one-record GBIF/IPT dataset and linked publication report a camera-trap photograph of an adult jaguar in Brasília National Park on 25 September 2021.',
  jsonb_build_object(
    'dataset_id','dataset:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
    'source_record_id','source-record:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf:record-1',
    'independent_4planet_field_verification',false
  ),
  clock_timestamp(),clock_timestamp(),'ACTIVE',1,'RESTRICTED','RESTRICTED','SOURCE_CHECKED','STRONG','ALLOW','SENSITIVE_NATURE'
)
on conflict(evidence_id) do nothing;

insert into cns.claims(
  claim_id,project_id,subject_type,subject_id,predicate,value,authority,state,
  claim_kind,knowledge_state,source_id,source_revision,valid_time_start,valid_time_end,
  geography,scope,revision,sensitivity_state,visibility_state,review_state,
  evidence_strength,interpretation_state,freshness_state,nature_sensitivity_state
) values(
  'claim:jaguar-reported-observed-brasilia-np-2021-09-25','species','ENTITY','taxon:4p:panthera-onca',
  'REPORTED_OBSERVED_AT',
  jsonb_build_object(
    'place_entity_id','place:4p:brasilia-national-park',
    'date','2021-09-25','reported_local_time','19:15',
    'record_basis','wildlife camera trap photograph'
  ),
  'SOURCE_BOUND','ACTIVE','SOURCE_CLAIM','KNOWN','gbif','accessed-2026-09-03',
  '2021-09-25T00:00:00-03:00'::timestamptz,'2021-09-26T00:00:00-03:00'::timestamptz,
  jsonb_build_object('place_entity_id','place:4p:brasilia-national-park','exact_coordinate_class','RESTRICTED'),
  jsonb_build_object('truth_boundary','Occurrence only; does not establish range, abundance, trend or live position.'),
  1,'RESTRICTED','RESTRICTED','SOURCE_CHECKED','STRONG','NORMALISED_RECORD','CURRENT','SENSITIVE_NATURE'
)
on conflict(claim_id) do nothing;

insert into cns.claim_evidence(claim_id,evidence_id,relation)
values('claim:jaguar-reported-observed-brasilia-np-2021-09-25','evidence:gbif-jaguar-brasilia-2021','SUPPORTS')
on conflict(claim_id,evidence_id) do nothing;

insert into cns.observations(
  observation_id,project_id,entity_id,observation_type,value,observed_at,
  valid_time_start,valid_time_end,source_id,source_revision,evidence_id,
  uncertainty,quality,sampling_effort,geometry_private,public_geometry,
  sensitivity_state,sensitivity_reason,state,revision,visibility_state,
  nature_sensitivity_class,review_state,evidence_strength,interpretation_state,
  freshness_state,geom_private,geom_public,source_record_id
) values(
  'observation:jaguar-brasilia-np-2021-09-25','species','taxon:4p:panthera-onca','SPECIES_OCCURRENCE',
  jsonb_build_object(
    'reported_presence',true,'individuals_reported',1,'life_stage','adult','sex','unidentified',
    'record_basis','wildlife camera trap photograph',
    'reported_local_time','19:15',
    'truth_boundary','Occurrence != range != abundance != trend != live position.'
  ),
  '2021-09-25T19:15:00-03:00'::timestamptz,
  '2021-09-25T00:00:00-03:00'::timestamptz,'2021-09-26T00:00:00-03:00'::timestamptz,
  'gbif','accessed-2026-09-03','evidence:gbif-jaguar-brasilia-2021',
  jsonb_build_object('coordinate_uncertainty_m','NOT_REPORTED','time_zone_interpretation','Brasília local civil time represented as UTC-03; raw source time retained separately.'),
  jsonb_build_object('source_review','SOURCE_CHECKED','independent_4planet_field_verification',false),
  jsonb_build_object('method','wildlife camera trap','study_context','monitoring campaign; this row represents the reported occurrence, not inferred effort-adjusted abundance'),
  jsonb_build_object('type','Point','coordinates',jsonb_build_array(-48.0391666667,-15.6366666667),'source_format','DMS'),
  null,
  'RESTRICTED','Exact coordinate of a large wildlife occurrence is conservatively treated as sensitive nature information.','ACTIVE',1,
  'RESTRICTED','SENSITIVE_NATURE','SOURCE_CHECKED','STRONG','NORMALISED_RECORD','CURRENT',
  gis.ST_SetSRID(gis.ST_MakePoint(-48.0391666667,-15.6366666667),4326),null,
  'source-record:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf:record-1'
)
on conflict(observation_id) do nothing;

insert into cns.relationships(
  relationship_id,subject_entity_id,predicate,object_entity_id,relationship_kind,
  project_id,source_id,source_revision,valid_time_start,valid_time_end,scope,
  review_state,evidence_strength,interpretation_state,visibility_state,state,revision,
  nature_sensitivity_state
) values(
  'relationship:jaguar-reported-observed-in-brasilia-np-2021-09-25',
  'taxon:4p:panthera-onca','REPORTED_OBSERVED_IN','place:4p:brasilia-national-park','OBSERVATIONAL',
  'species','gbif','accessed-2026-09-03','2021-09-25T00:00:00-03:00'::timestamptz,'2021-09-26T00:00:00-03:00'::timestamptz,
  jsonb_build_object(
    'observation_id','observation:jaguar-brasilia-np-2021-09-25',
    'evidence_id','evidence:gbif-jaguar-brasilia-2021',
    'truth_boundary','Source-bound occurrence relationship only.'
  ),
  'SOURCE_CHECKED','STRONG','NORMALISED_RECORD','RESTRICTED','ACTIVE',1,'SENSITIVE_NATURE'
)
on conflict(relationship_id) do nothing;

insert into cns.interpretations(
  interpretation_id,project_id,subject_type,subject_id,body,methodology_id,evidence_refs,
  limitations,knowledge_state,state,revision,visibility_state,review_state,evidence_strength,
  interpretation_state,freshness_state,nature_sensitivity_state
) values(
  'interpretation:jaguar-brasilia-2021-generalized','species','ENTITY','taxon:4p:panthera-onca',
  jsonb_build_object(
    'statement','A source-bound camera-trap occurrence reports a jaguar in Brasília National Park in September 2021.',
    'place_entity_id','place:4p:brasilia-national-park',
    'time_granularity','MONTH',
    'exact_coordinates_withheld',true,
    'exact_time_withheld',true
  ),
  '4p-sensitive-nature-generalization-v1',
  jsonb_build_array('evidence:gbif-jaguar-brasilia-2021'),
  jsonb_build_array(
    'This is a generalized public-candidate interpretation, not a range map.',
    'It does not establish abundance, trend, persistence or current/live position.',
    'Independent 4PLANET verification has not been performed.'
  ),
  'KNOWN','ACTIVE',1,'PUBLIC_CANDIDATE','SOURCE_CHECKED','STRONG','PUBLIC_EXPLANATION','CURRENT','GENERALIZED'
)
on conflict(interpretation_id) do nothing;

insert into cns.public_projections(
  projection_id,object_type,object_id,object_revision,payload,source_refs,
  rights_state,nature_sensitivity_state,truth_checked,evidence_checked,rights_checked,
  sensitivity_checked,verified_by,verification_authority,verified_at,state
) values(
  'projection:jaguar-brasilia-2021-generalized','INTERPRETATION','interpretation:jaguar-brasilia-2021-generalized',1,
  jsonb_build_object(
    'taxon','Panthera onca','common_name','Jaguar',
    'statement','A source-bound camera-trap occurrence reports a jaguar in Brasília National Park in September 2021.',
    'place','Brasília National Park','time','September 2021',
    'exact_coordinates_withheld',true,
    'truth_boundary','Occurrence only; not range, abundance, trend or live position.'
  ),
  jsonb_build_array(
    'source-record:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf:record-1',
    'evidence:gbif-jaguar-brasilia-2021',
    'https://doi.org/10.15468/dz6zuy'
  ),
  'ALLOW','GENERALIZED',true,true,true,true,
  null,null,null,'CANDIDATE'
)
on conflict(projection_id) do nothing;

insert into cns.provenance_edges(
  subject_type,subject_id,relation,object_type,object_id,activity_type,activity_id,
  agent_type,agent_id,source_id,source_revision,metadata
) values
  ('OBSERVATION','observation:jaguar-brasilia-np-2021-09-25','DERIVED_FROM','SOURCE_RECORD','source-record:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf:record-1','NORMALISATION','real-source-proof-01','SYSTEM','AXE','gbif','accessed-2026-09-03','{}'::jsonb),
  ('EVIDENCE','evidence:gbif-jaguar-brasilia-2021','DERIVED_FROM','SOURCE_RECORD','source-record:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf:record-1','EVIDENCE_BINDING','real-source-proof-01','SYSTEM','AXE','gbif','accessed-2026-09-03','{}'::jsonb),
  ('CLAIM','claim:jaguar-reported-observed-brasilia-np-2021-09-25','DERIVED_FROM','EVIDENCE','evidence:gbif-jaguar-brasilia-2021','SOURCE_CLAIM_BINDING','real-source-proof-01','SYSTEM','AXE','gbif','accessed-2026-09-03','{}'::jsonb),
  ('RELATIONSHIP','relationship:jaguar-reported-observed-in-brasilia-np-2021-09-25','DERIVED_FROM','OBSERVATION','observation:jaguar-brasilia-np-2021-09-25','RELATIONSHIP_MATERIALISATION','real-source-proof-01','SYSTEM','AXE','gbif','accessed-2026-09-03','{}'::jsonb),
  ('INTERPRETATION','interpretation:jaguar-brasilia-2021-generalized','DERIVED_FROM','OBSERVATION','observation:jaguar-brasilia-np-2021-09-25','SENSITIVE_NATURE_GENERALIZATION','real-source-proof-01','SYSTEM','AXE','gbif','accessed-2026-09-03','{}'::jsonb),
  ('PUBLIC_PROJECTION','projection:jaguar-brasilia-2021-generalized','DERIVED_FROM','INTERPRETATION','interpretation:jaguar-brasilia-2021-generalized','PUBLIC_CANDIDATE_MATERIALISATION','real-source-proof-01','SYSTEM','AXE','gbif','accessed-2026-09-03','{}'::jsonb)
on conflict(subject_type,subject_id,relation,object_type,object_id,activity_type,activity_id) do nothing;

insert into cns.system_meta(key,value)
values(
  'real_source_proof_01_gbif_jaguar',
  jsonb_build_object(
    'state','INGESTED_AWAITING_READBACK',
    'verified',false,
    'source_id','gbif',
    'dataset_id','dataset:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf',
    'source_record_id','source-record:gbif:27a8cc6d-18ec-4d68-b941-a0c481cd3dbf:record-1',
    'observation_id','observation:jaguar-brasilia-np-2021-09-25',
    'exact_location_public',false,
    'public_projection_state','CANDIDATE',
    'upstream_occurrence_id_state','NOT_INDEPENDENTLY_RESOLVED'
  )
)
on conflict(key) do update set value=excluded.value,updated_at=clock_timestamp();

commit;
