-- Supabase may install PostGIS outside public (canonical staging uses gis).
set search_path = public, gis;

insert into public.source_records (
  id, source_id, source_record_id, source_url, dataset_id, retrieved_at, licence,
  attribution, rights_status, visibility, sensitivity, raw_payload
) values (
  'source-record:gbif:5939349319', 'gbif', '5939349319',
  'https://www.gbif.org/occurrence/5939349319',
  'b124e1e0-4755-430f-9eab-894f25a9b59c', '2026-07-22T16:25:00Z', 'CC BY 4.0',
  'Karl Anders Olaussen; record published through GBIF', 'CONDITIONAL', 'PUBLIC', 'GENERALIZED',
  '{"key":5939349319,"scientificName":"Orcinus orca (Linnaeus, 1758)","taxonKey":2440483,"speciesKey":2440483,"eventDate":"2026-01-03","decimalLatitude":63.44559,"decimalLongitude":9.304561,"basisOfRecord":"HUMAN_OBSERVATION","occurrenceStatus":"PRESENT","datasetKey":"b124e1e0-4755-430f-9eab-894f25a9b59c","license":"http://creativecommons.org/licenses/by/4.0/legalcode","recordedBy":"Karl Anders Olaussen","country":"Norway","stateProvince":"Trøndelag","locality":"Åstfjorden, Hitra, Tø","issues":["COORDINATE_ROUNDED","CONTINENT_DERIVED_FROM_COORDINATES"]}'::jsonb
) on conflict do nothing;

insert into public.taxon_observations (
  id, source_record_id, taxon_id, occurred_at, geom, basis_of_record,
  source_issues, place_membership, visibility, sensitivity
) values (
  'observation:gbif:5939349319', 'source-record:gbif:5939349319', 'taxon:gbif:2440483',
  '2026-01-03T00:00:00Z', st_setsrid(st_makepoint(9.304561, 63.44559), 4326)::geography,
  'HUMAN_OBSERVATION', array['COORDINATE_ROUNDED','CONTINENT_DERIVED_FROM_COORDINATES'],
  'UNASSESSED', 'PUBLIC', 'GENERALIZED'
) on conflict do nothing;

insert into public.interpretations (
  id, about_record_ids, body, interpretation_status, review_status,
  evidence_strength, limitations, visibility
) values (
  'interpretation:4p:orca-gbif-context-v1', array['observation:gbif:5939349319'],
  'This record shows that a human observation of an orca was published to GBIF at the stated coordinates and date. It does not establish range, abundance, population trend, place membership or ecological change.',
  'PUBLIC_SAFE', 'UNREVIEWED', 'MODERATE',
  array['The coordinate was rounded by the source.','A single occurrence is not a distribution or population estimate.','No Signal has been created from this Observation.'],
  'PUBLIC'
) on conflict do nothing;

insert into public.product_contexts (
  id, entity_id, journey_id, source_record_ids, observation_ids, signal_ids,
  interpretation_ids, visibility, persisted_at, disclosure
) values (
  'product-context:4p:orca-gbif-v1', 'taxon:gbif:2440483', 'orca-gbif',
  array['source-record:gbif:5939349319'], array['observation:gbif:5939349319'], array[]::text[],
  array['interpretation:4p:orca-gbif-context-v1'], 'PUBLIC', '2026-07-22T16:25:00Z',
  'Seeded from an exact GBIF source record. Observation is not Signal; query geometry is not Place membership.'
) on conflict do nothing;

insert into public.impact_unit_definitions (
  id, slug, name, mission_id, unit_quantity, unit_label, environment, provider_capability, disclosure
) values
  ('impact-unit:4p:test:tree','tree','Tree Unit','mission:4p:clim4te',1,'test tree request','TEST','FIXTURE_ONLY','TEST RECORD — NO PHYSICAL DELIVERY'),
  ('impact-unit:4p:test:plastic','plastic','Plastic Unit','mission:4p:pl4stic',1,'test kilogram request','TEST','FIXTURE_ONLY','TEST RECORD — NO PHYSICAL DELIVERY')
on conflict do nothing;
