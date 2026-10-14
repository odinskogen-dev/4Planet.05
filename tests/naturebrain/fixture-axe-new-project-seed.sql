-- TEST FIXTURE ONLY — never apply to Supabase.
-- Simulates AXE publishing one NEW source-grounded project through the Gold admission
-- contract (SOURCE → RECORD → ISSUE → PLACE → ACTORS → PROJECT → SOLUTION → CLAIMS →
-- EVIDENCE → ACTION → REVIEW STATE) using data only. Every name is marked as a fixture so
-- it can never be mistaken for a real organisation or project in screenshots.
-- Used by: scripts/impact-projection-harness.mjs → tests/fixtures/impact/*-with-seeds.json
--          tests/e2e/impact-universe.spec.ts ("new NATUREBRAIN object appears without redesign").

insert into planetbrain.sources (source_id,name,source_type,canonical_uri,rights,attribution,status,provenance) values
 ('source:test:fixture-registry','Test Fixture Registry (not a real source)','test_fixture','https://example.org/fixture-registry','test_fixture_only','Test Fixture Registry','active','{"fixture":true}');
insert into planetbrain.datasets (dataset_id,source_id,name,version,canonical_uri,rights,temporal_coverage,spatial_coverage,provenance) values
 ('dataset:test:fixture-registry','source:test:fixture-registry','Fixture project records','fixture','https://example.org/fixture-registry','test_fixture_only','{}','{}','{"fixture":true}');
insert into planetbrain.source_records (record_id,dataset_id,external_record_id,normalised_payload,source_event_at,retrieved_at,rights,issues,limitations,provenance) values
 ('record:test:fixture-wetland','dataset:test:fixture-registry','fixture-wetland','{"title":"Fixture wetland record"}','2026-09-01T00:00:00Z','2026-10-14T09:00:00Z','test_fixture_only','[]','["Fixture-reported figure; exists only to test the IMPACT template"]','{"url":"https://example.org/fixture-registry/wetland","checked_at":"2026-10-14"}');

insert into planetbrain.entities (canonical_id,entity_type,name,description,status,provenance) values
 ('problem:test:wetland-loss','problem','Test Fixture — Wetland loss','Fixture issue used to prove that a new Issue page renders from data alone.','active',
  '{"impact_publication":"public","slug":"test-fixture-wetland-loss","domain":"E4RTH_","why_it_matters":"Fixture text: wetlands store water and carbon and support many species.","unknowns":["Fixture unknown: regional loss rates are not published in this record."]}'),
 ('place:test:fixture-delta','place','Test Fixture Delta','Fixture place with a navigation reference point only.','active',
  '{"geometry_status":"reference_point_only","reference_point":{"lng":10.75,"lat":59.91,"zoom":6,"precision":"region"}}'),
 ('actor:test:fixture-wetland-trust','actor','Test Fixture Wetland Trust','Fixture lead organisation.','active',
  '{"relationship_state":"public_record","impact_publication":"public","slug":"test-fixture-wetland-trust","website":"https://example.org/fixture-trust"}'),
 ('actor:test:fixture-field-lab','actor','Test Fixture Field Lab','Fixture delivery partner organisation.','active',
  '{"relationship_state":"public_record"}'),
 ('solution:test:fixture-rewetting','solution','Test Fixture — Peatland rewetting','Fixture method: blocking drainage so water returns to the soil.','active',
  '{"maturity":"implemented_programme","mechanism":"Fixture mechanism text."}'),
 ('action:test:fixture-volunteer','action','Volunteer with Test Fixture Wetland Trust','External route on the organisation''s own site.','active',
  '{"action_type":"external_volunteer","url":"https://example.org/fixture-trust/volunteer","processed_by_4planet":false}'),
 ('project:test:fixture-wetland-recovery','project','Test Fixture Wetland Recovery','Fixture project proving a new NATUREBRAIN object becomes a premium IMPACT page with no redesign.','active',
  '{"impact_publication":"public","slug":"test-fixture-wetland-recovery","issue_label":"WETLANDS","issue_short":"WETLAND_","domain":"E4RTH_","year_label":"ACTIVE 2026","review_state":"SOURCE-CHECKED","project_type":"Restoration programme","status_label":"Active","operating_period":"2024 – ongoing","method_summary":"Fixture: drains are blocked and native vegetation returns.","reported_scale":[{"label":"Area rewetted (source-reported)","value":"120 ha","claim_id":"claim:test:fixture:area"}],"stated_ambition":[{"label":"Stated target","value":"500 ha by 2030"}],"image_path":"/assets/missions/rewild/hero.jpg","image_role":"issue_family_visual_not_project_evidence","official_url":"https://example.org/fixture-trust/wetland","last_reviewed":"2026-10-14"}');

insert into planetbrain.actors (entity_id,actor_type,provenance)
select id,'nonprofit','{"fixture":true}'::jsonb from planetbrain.entities where canonical_id='actor:test:fixture-wetland-trust'
union all
select id,'research_institution','{"fixture":true}'::jsonb from planetbrain.entities where canonical_id='actor:test:fixture-field-lab';
insert into planetbrain.solutions (entity_id,solution_type,provenance)
select id,'ecosystem_restoration','{"fixture":true}'::jsonb from planetbrain.entities where canonical_id='solution:test:fixture-rewetting';

insert into planetbrain.claims (claim_id,subject_entity_id,statement,review_status,evidence_strength,interpretation_status,provenance)
select 'claim:test:fixture:area',id,'The fixture registry reports 120 hectares rewetted since 2024.','source_checked','source_reported','reported_not_independently_verified','{"checked_at":"2026-10-14"}'::jsonb
from planetbrain.entities where canonical_id='project:test:fixture-wetland-recovery';
insert into planetbrain.evidence (evidence_id,evidence_type,source_record_id,citation,reviewed_at,provenance) values
 ('evidence:test:fixture:area','source_record','record:test:fixture-wetland','Test Fixture Registry — wetland record','2026-10-14T09:00:00Z','{"role":"reported_metric"}');
insert into planetbrain.claim_evidence (claim_id,evidence_id,relation) values ('claim:test:fixture:area','evidence:test:fixture:area','supports');

insert into planetbrain.relationships (relationship_id,subject_entity_id,predicate,object_entity_id,review_status,evidence_strength,provenance)
select v.rid,s.id,v.pred,o.id,'source_checked','strong','{"fixture":true}'::jsonb
from (values
 ('rel:test:1','project:test:fixture-wetland-recovery','addresses_problem','problem:test:wetland-loss'),
 ('rel:test:2','project:test:fixture-wetland-recovery','occurs_in','place:test:fixture-delta'),
 ('rel:test:3','project:test:fixture-wetland-recovery','has_lead_actor','actor:test:fixture-wetland-trust'),
 ('rel:test:4','project:test:fixture-wetland-recovery','has_delivery_actor','actor:test:fixture-field-lab'),
 ('rel:test:5','project:test:fixture-wetland-recovery','uses_solution','solution:test:fixture-rewetting'),
 ('rel:test:6','project:test:fixture-wetland-recovery','offers_external_action','action:test:fixture-volunteer'),
 ('rel:test:7','solution:test:fixture-rewetting','addresses_problem','problem:test:wetland-loss')
) v(rid,sc,pred,oc)
join planetbrain.entities s on s.canonical_id=v.sc
join planetbrain.entities o on o.canonical_id=v.oc;
