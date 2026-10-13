
-- 4PLANET IMPACT Living Action Network — Gold vertical slice 01
-- Existing NATUREBRAIN only. No parallel truth store.

insert into planetbrain.sources
  (source_id,name,source_type,canonical_uri,rights,attribution,status,provenance)
values
  ('source:4p:impact:un-decade',
   'UN Decade on Ecosystem Restoration — World Restoration Flagships',
   'public_website',
   'https://www.decadeonrestoration.org/world-restoration-flagships',
   'reference_and_fact_extraction_only; page-content-republication-rights-not-assumed; separately-listed-UN-flagship-media-may-have-explicit-attribution-permissions',
   'UN Decade on Ecosystem Restoration / UNEP / FAO',
   'active',
   '{"rights_audit":"2026-10-13","notes":"Facts and status referenced with attribution. UN Flagship photo collections separately state free-to-use with attribution; those media are not imported by this migration."}'::jsonb),
  ('source:4p:impact:trees',
   'Trees for the Future',
   'public_website',
   'https://trees.org/',
   'reference_and_fact_extraction_only; republication_rights_not_assumed',
   'Trees for the Future',
   'active',
   '{"rights_audit":"2026-10-13"}'::jsonb),
  ('source:4p:impact:crf',
   'Coral Restoration Foundation',
   'public_website',
   'https://coralrestoration.org/',
   'reference_and_fact_extraction_only; republication_rights_not_assumed',
   'Coral Restoration Foundation',
   'active',
   '{"rights_audit":"2026-10-13"}'::jsonb),
  ('source:4p:impact:ocean-cleanup',
   'The Ocean Cleanup',
   'public_website',
   'https://theoceancleanup.com/',
   'reference_and_fact_extraction_only; site_content_all_rights_reserved_unless_otherwise_stated',
   'The Ocean Cleanup',
   'active',
   '{"rights_audit":"2026-10-13"}'::jsonb)
on conflict (source_id) do update set
  name=excluded.name,
  canonical_uri=excluded.canonical_uri,
  rights=excluded.rights,
  attribution=excluded.attribution,
  status='active',
  provenance=excluded.provenance,
  updated_at=now();

insert into planetbrain.datasets
  (dataset_id,source_id,name,version,canonical_uri,rights,temporal_coverage,spatial_coverage,provenance)
values
  ('dataset:4p:impact:un-flagships','source:4p:impact:un-decade','UN World Restoration Flagship public profiles','2026-10-13','https://www.decadeonrestoration.org/world-restoration-flagships','reference_and_fact_extraction_only','{"as_of":"2026-10-13"}'::jsonb,'{"coverage":"global"}'::jsonb,'{"ingest_mode":"manual_gold_slice"}'::jsonb),
  ('dataset:4p:impact:trees','source:4p:impact:trees','Trees for the Future public programme records','2026-10-13','https://trees.org/','reference_and_fact_extraction_only','{"as_of":"2026-10-13"}'::jsonb,'{"coverage":"selected public programme pages"}'::jsonb,'{"ingest_mode":"manual_gold_slice"}'::jsonb),
  ('dataset:4p:impact:crf','source:4p:impact:crf','Coral Restoration Foundation public programme records','2026-10-13','https://coralrestoration.org/','reference_and_fact_extraction_only','{"as_of":"2026-10-13"}'::jsonb,'{"coverage":"Florida Keys programme"}'::jsonb,'{"ingest_mode":"manual_gold_slice"}'::jsonb),
  ('dataset:4p:impact:ocean-cleanup','source:4p:impact:ocean-cleanup','The Ocean Cleanup public operations records','2026-10-13','https://theoceancleanup.com/','reference_and_fact_extraction_only','{"as_of":"2026-10-13"}'::jsonb,'{"coverage":"Great Pacific Garbage Patch / System 03"}'::jsonb,'{"ingest_mode":"manual_gold_slice"}'::jsonb)
on conflict (dataset_id) do update set
  name=excluded.name,version=excluded.version,canonical_uri=excluded.canonical_uri,rights=excluded.rights,
  temporal_coverage=excluded.temporal_coverage,spatial_coverage=excluded.spatial_coverage,provenance=excluded.provenance,updated_at=now();

insert into planetbrain.source_records
  (record_id,dataset_id,external_record_id,normalised_payload,source_event_at,retrieved_at,rights,issues,limitations,provenance)
values
  ('record:4p:impact:northern-mozambique-channel','dataset:4p:impact:un-flagships','restoring-northern-mozambique-channel-region',
   '{"title":"Restoring the Northern Mozambique Channel Region","countries":["Comoros","Madagascar","Mozambique","Tanzania"],"hectares_under_restoration":1259336,"hectares_2030_goal":4850000,"recognition":"UN World Restoration Flagship"}'::jsonb,
   null,now(),'reference_and_fact_extraction_only','[]'::jsonb,'["UN-reported initiative metrics; not independently measured by 4PLANET"]'::jsonb,
   '{"url":"https://www.decadeonrestoration.org/restoring-northern-mozambique-channel-region","checked_at":"2026-10-13"}'::jsonb),
  ('record:4p:impact:african-forest-gardens','dataset:4p:impact:un-flagships','african-farmers-transforming-food-systems',
   '{"title":"African Farmers Transforming Food Systems","countries":["Mali","Senegal","Tanzania","Uganda","Kenya"],"hectares_under_restoration":41345,"hectares_2030_goal":229000,"recognition":"UN World Restoration Flagship","leading_organisation":"Trees for the Future"}'::jsonb,
   null,now(),'reference_and_fact_extraction_only','[]'::jsonb,'["UN-reported initiative metrics; not independently measured by 4PLANET"]'::jsonb,
   '{"url":"https://www.decadeonrestoration.org/african-farmers-transforming-food-systems","checked_at":"2026-10-13"}'::jsonb),
  ('record:4p:impact:crf-florida-2026','dataset:4p:impact:crf','tourism-funding-helps-rebuild-florida-keys-reefs',
   '{"title":"Tourism Funding Helps Rebuild Florida Keys Reefs After Historic Marine Heatwave","reported_outplants":15846,"species":17,"reef_sites":10,"period":"2025-10-01 to 2026-06"}'::jsonb,
   '2026-06-26T00:00:00Z',now(),'reference_and_fact_extraction_only','[]'::jsonb,'["Organisation-reported delivery; ecological outcome not independently verified by 4PLANET"]'::jsonb,
   '{"url":"https://coralrestoration.org/tourism-funding-helps-rebuild-florida-keys-reefs/","checked_at":"2026-10-13"}'::jsonb),
  ('record:4p:impact:crf-annual-2025','dataset:4p:impact:crf','crf-2025-annual-report',
   '{"title":"CRF 2025 Annual Report","florida_nursery_stock_end_2025":"nearly 39000 colonies","production_nurseries":3}'::jsonb,
   null,now(),'reference_and_fact_extraction_only','[]'::jsonb,'["Organisation annual-report figure; not independently audited by 4PLANET"]'::jsonb,
   '{"url":"https://coralrestoration.org/wp-content/uploads/2026/04/CRF-2025-Annual-Report_DIGITAL.pdf","checked_at":"2026-10-13"}'::jsonb),
  ('record:4p:impact:ocean-cleanup-system03-2026','dataset:4p:impact:ocean-cleanup','system-03-gpgp-2026',
   '{"title":"System 03 / Great Pacific Garbage Patch operations","system":"System 03","deployed":"2023-08","status":"current system operating in the Great Pacific Garbage Patch","current_focus":"improving hotspot detection and removal efficiency"}'::jsonb,
   '2026-07-09T00:00:00Z',now(),'reference_and_fact_extraction_only','[]'::jsonb,'["Organisation-reported operations; full ecological impact accounting not independently verified by 4PLANET"]'::jsonb,
   '{"url":"https://theoceancleanup.com/updates/integrating-new-technologies-to-tackle-the-great-pacific-garbage-patch/","checked_at":"2026-10-13"}'::jsonb)
on conflict (record_id) do update set
  dataset_id=excluded.dataset_id,external_record_id=excluded.external_record_id,normalised_payload=excluded.normalised_payload,
  source_event_at=excluded.source_event_at,retrieved_at=excluded.retrieved_at,rights=excluded.rights,
  issues=excluded.issues,limitations=excluded.limitations,provenance=excluded.provenance;

-- Canonical issue nodes.
insert into planetbrain.entities (canonical_id,entity_type,name,description,status,provenance)
values
 ('problem:4p:impact:reef-degradation','problem','Reef and coastal ecosystem degradation','Loss and degradation of coral reefs and connected coastal ecosystems.','active','{"scope":"impact_gold_v01"}'::jsonb),
 ('problem:4p:impact:land-degradation','problem','Land degradation and food-system pressure','Degraded agricultural land, soil and associated biodiversity loss.','active','{"scope":"impact_gold_v01"}'::jsonb),
 ('problem:4p:impact:ocean-plastic','problem','Ocean plastic pollution','Persistent plastic pollution entering or accumulating in marine environments.','active','{"scope":"impact_gold_v01"}'::jsonb)
on conflict (canonical_id) do update set name=excluded.name,description=excluded.description,status='active',provenance=excluded.provenance,updated_at=now();

-- Canonical place nodes. These are project context labels, not legal/ecological boundary geometries.
insert into planetbrain.entities (canonical_id,entity_type,name,description,status,provenance)
values
 ('place:4p:northern-mozambique-channel','place','Northern Mozambique Channel','Multi-country marine and coastal region spanning Comoros, Madagascar, Mozambique and Tanzania.','active','{"geometry_status":"context_only_no_boundary_geometry","atlas_mode":"context"}'::jsonb),
 ('place:4p:kenya','place','Kenya','One of five countries in the African Farmers Transforming Food Systems flagship.','active','{"geometry_status":"navigation_context","project_coverage_note":"project also spans Mali, Senegal, Tanzania and Uganda"}'::jsonb),
 ('place:4p:florida-keys','place','Florida Keys','Florida Keys marine and reef context in the United States.','active','{"geometry_status":"context_only_no_boundary_geometry","atlas_mode":"context"}'::jsonb),
 ('place:4p:north-pacific','place','North Pacific Ocean','Broad ocean context for Great Pacific Garbage Patch cleanup operations.','active','{"geometry_status":"broad_context_not_gpgp_boundary","atlas_mode":"context"}'::jsonb)
on conflict (canonical_id) do update set name=excluded.name,description=excluded.description,status='active',provenance=excluded.provenance,updated_at=now();

-- Actor nodes.
insert into planetbrain.entities (canonical_id,entity_type,name,description,status,provenance)
values
 ('actor:4p:northern-mozambique-restoration-network','actor','Northern Mozambique Channel restoration network','Multi-organisation regional restoration effort; leading organisations listed by the UN include WWF and other regional partners.','active','{"relationship_state":"public_record","not_a_4planet_partner":true}'::jsonb),
 ('actor:4p:trees-for-the-future','actor','Trees for the Future','Nonprofit organisation leading the African Farmers Transforming Food Systems flagship.','active','{"relationship_state":"public_record","not_a_4planet_partner":true}'::jsonb),
 ('actor:4p:coral-restoration-foundation','actor','Coral Restoration Foundation','Nonprofit coral-restoration organisation operating nursery, outplanting and monitoring programmes.','active','{"relationship_state":"public_record","not_a_4planet_partner":true}'::jsonb),
 ('actor:4p:the-ocean-cleanup','actor','The Ocean Cleanup','Nonprofit organisation developing and operating technology for river interception and ocean plastic cleanup.','active','{"relationship_state":"public_record","not_a_4planet_partner":true}'::jsonb)
on conflict (canonical_id) do update set name=excluded.name,description=excluded.description,status='active',provenance=excluded.provenance,updated_at=now();

insert into planetbrain.actors (entity_id,actor_type,provenance)
select e.id, v.actor_type, '{"scope":"impact_gold_v01"}'::jsonb
from (values
 ('actor:4p:northern-mozambique-restoration-network','restoration_network'),
 ('actor:4p:trees-for-the-future','nonprofit'),
 ('actor:4p:coral-restoration-foundation','nonprofit'),
 ('actor:4p:the-ocean-cleanup','nonprofit')
) v(canonical_id,actor_type)
join planetbrain.entities e on e.canonical_id=v.canonical_id
on conflict (entity_id) do update set actor_type=excluded.actor_type,provenance=excluded.provenance;

-- Solution nodes.
insert into planetbrain.entities (canonical_id,entity_type,name,description,status,provenance)
values
 ('solution:4p:impact:connected-seascape-restoration','solution','Connected seascape restoration','Integrated restoration and management across connected marine, coastal and terrestrial systems.','active','{"maturity":"implemented_in_flagship_context","scope":"context_specific"}'::jsonb),
 ('solution:4p:impact:forest-garden-agroforestry','solution','Forest Garden agroforestry','Farmer-led regenerative agroforestry using layered trees, shrubs and crops.','active','{"maturity":"implemented_programme","scope":"context_specific"}'::jsonb),
 ('solution:4p:impact:coral-nursery-outplanting','solution','Coral nursery and monitored outplanting','Coral propagation, nursery production, outplanting and monitoring.','active','{"maturity":"implemented_programme","scope":"context_specific"}'::jsonb),
 ('solution:4p:impact:offshore-plastic-extraction','solution','Offshore plastic extraction','Technology and operations for locating and removing legacy floating plastic from the ocean.','active','{"maturity":"operating_system","scope":"context_specific"}'::jsonb)
on conflict (canonical_id) do update set name=excluded.name,description=excluded.description,status='active',provenance=excluded.provenance,updated_at=now();

insert into planetbrain.solutions (entity_id,solution_type,provenance)
select e.id, v.solution_type, '{"scope":"impact_gold_v01"}'::jsonb
from (values
 ('solution:4p:impact:connected-seascape-restoration','ecosystem_restoration'),
 ('solution:4p:impact:forest-garden-agroforestry','regenerative_agroforestry'),
 ('solution:4p:impact:coral-nursery-outplanting','coral_restoration'),
 ('solution:4p:impact:offshore-plastic-extraction','pollution_removal')
) v(canonical_id,solution_type)
join planetbrain.entities e on e.canonical_id=v.canonical_id
on conflict (entity_id) do update set solution_type=excluded.solution_type,provenance=excluded.provenance;

-- External action nodes: route only; no 4PLANET contribution/delivery claim.
insert into planetbrain.entities (canonical_id,entity_type,name,description,status,provenance)
values
 ('action:4p:impact:northern-mozambique-un','action','Visit UN initiative','Open the official UN flagship record.','active','{"action_type":"external_information","url":"https://www.decadeonrestoration.org/restoring-northern-mozambique-channel-region","processed_by_4planet":false}'::jsonb),
 ('action:4p:impact:trees-support','action','Support Trees for the Future','External support route on the organisation''s own site.','active','{"action_type":"external_support","url":"https://donate.trees.org/","processed_by_4planet":false}'::jsonb),
 ('action:4p:impact:crf-support','action','Support Coral Restoration Foundation','External support route on the organisation''s own site.','active','{"action_type":"external_support","url":"https://coralrestoration.org/one-time-donation/","processed_by_4planet":false}'::jsonb),
 ('action:4p:impact:ocean-cleanup-support','action','Support The Ocean Cleanup','External support route on the organisation''s own site.','active','{"action_type":"external_support","url":"https://theoceancleanup.com/donate/","processed_by_4planet":false}'::jsonb)
on conflict (canonical_id) do update set name=excluded.name,description=excluded.description,status='active',provenance=excluded.provenance,updated_at=now();

-- Project nodes: UI metadata is a projection hint stored on the canonical entity, not a separate product truth store.
insert into planetbrain.entities (canonical_id,entity_type,name,description,status,provenance)
values
 ('project:4p:impact:northern-mozambique-channel','project','Restoring the Northern Mozambique Channel',
  'Regional restoration across connected coral, mangrove, coastal and terrestrial systems in the Northern Mozambique Channel.',
  'active',
  '{"scope":"impact_gold_v01","issue_label":"OCEANS & REEFS","issue_short":"CORAL_","year_label":"UN FLAGSHIP","review_state":"EXTERNALLY VETTED","image_path":"/assets/impact/restore-coral/hero.jpg","image_role":"issue_family_visual_not_project_evidence","official_url":"https://www.decadeonrestoration.org/restoring-northern-mozambique-channel-region","atlas_place_id":"place:4p:northern-mozambique-channel"}'::jsonb),
 ('project:4p:impact:african-forest-gardens','project','African Farmers Transforming Food Systems',
  'Farmer-led regenerative agroforestry using Forest Gardens across multiple African countries.',
  'active',
  '{"scope":"impact_gold_v01","issue_label":"LAND & FOOD SYSTEMS","issue_short":"FOREST_","year_label":"UN FLAGSHIP","review_state":"EXTERNALLY VETTED","image_path":"/assets/missions/clim4te/hero.jpg","image_role":"issue_family_visual_not_project_evidence","official_url":"https://www.decadeonrestoration.org/african-farmers-transforming-food-systems","atlas_place_id":"place:4p:kenya","coverage_note":"Mali, Senegal, Tanzania, Uganda and Kenya"}'::jsonb),
 ('project:4p:impact:florida-coral-restoration','project','Florida Keys Coral Restoration',
  'Coral nursery, propagation, outplanting and monitoring work across the Florida Reef Tract.',
  'active',
  '{"scope":"impact_gold_v01","issue_label":"OCEANS & REEFS","issue_short":"CORAL_","year_label":"ACTIVE 2026","review_state":"SOURCE-CHECKED","image_path":"/assets/missions/cor4l/detail-coral-01.jpg","image_role":"issue_family_visual_not_project_evidence","official_url":"https://coralrestoration.org/where-we-work/crf-florida/","atlas_place_id":"place:4p:florida-keys"}'::jsonb),
 ('project:4p:impact:great-pacific-garbage-patch','project','Great Pacific Garbage Patch Cleanup',
  'Operating ocean-cleanup programme using System 03 while developing improved hotspot detection and removal efficiency.',
  'active',
  '{"scope":"impact_gold_v01","issue_label":"PLASTIC POLLUTION","issue_short":"PLASTIC_","year_label":"ACTIVE 2026","review_state":"SOURCE-CHECKED","image_path":"/assets/domains/oce4n/hero.jpg","image_role":"issue_family_visual_not_project_evidence","official_url":"https://theoceancleanup.com/updates/integrating-new-technologies-to-tackle-the-great-pacific-garbage-patch/","atlas_place_id":"place:4p:north-pacific"}'::jsonb)
on conflict (canonical_id) do update set name=excluded.name,description=excluded.description,status='active',provenance=excluded.provenance,updated_at=now();

-- Claims and evidence. Reported metrics remain clearly source-reported.
insert into planetbrain.claims
 (claim_id,subject_entity_id,statement,review_status,evidence_strength,interpretation_status,provenance)
select v.claim_id,e.id,v.statement,v.review_status,v.evidence_strength,v.interpretation_status,v.provenance
from (values
 ('claim:4p:impact:nmc:flagship','project:4p:impact:northern-mozambique-channel','The initiative is recognised by the UN Decade on Ecosystem Restoration as a World Restoration Flagship.','externally_reviewed','strong','external_review','{"checked_at":"2026-10-13"}'::jsonb),
 ('claim:4p:impact:nmc:hectares','project:4p:impact:northern-mozambique-channel','The UN profile reports 1,259,336 hectares under restoration and a 4,850,000 hectare goal for 2030.','source_checked','source_reported','reported_not_independently_verified','{"checked_at":"2026-10-13"}'::jsonb),
 ('claim:4p:impact:trees:flagship','project:4p:impact:african-forest-gardens','African Farmers Transforming Food Systems is recognised as a UN World Restoration Flagship, led by Trees for the Future.','externally_reviewed','strong','external_review','{"checked_at":"2026-10-13"}'::jsonb),
 ('claim:4p:impact:trees:hectares','project:4p:impact:african-forest-gardens','The UN profile reports 41,345 hectares under restoration and a 229,000 hectare goal for 2030.','source_checked','source_reported','reported_not_independently_verified','{"checked_at":"2026-10-13"}'::jsonb),
 ('claim:4p:impact:crf:outplants','project:4p:impact:florida-coral-restoration','Coral Restoration Foundation reports that 15,846 corals from 17 species were outplanted to 10 Florida Keys reef sites between 1 October 2025 and June 2026.','source_checked','source_reported','delivery_report_not_outcome_verification','{"checked_at":"2026-10-13"}'::jsonb),
 ('claim:4p:impact:crf:nursery','project:4p:impact:florida-coral-restoration','CRF''s 2025 annual report says its Florida coral stock reached nearly 39,000 colonies across three production nurseries at the end of 2025.','source_checked','source_reported','reported_not_independently_verified','{"checked_at":"2026-10-13"}'::jsonb),
 ('claim:4p:impact:toc:system03','project:4p:impact:great-pacific-garbage-patch','The Ocean Cleanup states that System 03 is its current cleanup system operating in the Great Pacific Garbage Patch.','source_checked','source_reported','operational_status','{"checked_at":"2026-10-13"}'::jsonb),
 ('claim:4p:impact:toc:optimisation','project:4p:impact:great-pacific-garbage-patch','A July 2026 operations update describes ongoing work to improve hotspot detection and maximise plastic removal efficiency.','source_checked','source_reported','operational_update','{"checked_at":"2026-10-13"}'::jsonb)
) v(claim_id,canonical_id,statement,review_status,evidence_strength,interpretation_status,provenance)
join planetbrain.entities e on e.canonical_id=v.canonical_id
on conflict (claim_id) do update set
 subject_entity_id=excluded.subject_entity_id,statement=excluded.statement,review_status=excluded.review_status,
 evidence_strength=excluded.evidence_strength,interpretation_status=excluded.interpretation_status,
 provenance=excluded.provenance,updated_at=now();

insert into planetbrain.evidence
 (evidence_id,evidence_type,source_record_id,citation,reviewed_at,provenance)
values
 ('evidence:4p:impact:nmc:flagship','source_record','record:4p:impact:northern-mozambique-channel','UN Decade on Ecosystem Restoration — Restoring the Northern Mozambique Channel Region',now(),'{"role":"status_and_external_review"}'::jsonb),
 ('evidence:4p:impact:nmc:hectares','source_record','record:4p:impact:northern-mozambique-channel','UN Decade profile — initiative metrics',now(),'{"role":"reported_metric"}'::jsonb),
 ('evidence:4p:impact:trees:flagship','source_record','record:4p:impact:african-forest-gardens','UN Decade on Ecosystem Restoration — African Farmers Transforming Food Systems',now(),'{"role":"status_and_external_review"}'::jsonb),
 ('evidence:4p:impact:trees:hectares','source_record','record:4p:impact:african-forest-gardens','UN Decade profile — initiative metrics',now(),'{"role":"reported_metric"}'::jsonb),
 ('evidence:4p:impact:crf:outplants','source_record','record:4p:impact:crf-florida-2026','Coral Restoration Foundation — 26 June 2026 restoration update',now(),'{"role":"reported_delivery"}'::jsonb),
 ('evidence:4p:impact:crf:nursery','source_record','record:4p:impact:crf-annual-2025','Coral Restoration Foundation — 2025 Annual Report',now(),'{"role":"reported_metric"}'::jsonb),
 ('evidence:4p:impact:toc:system03','source_record','record:4p:impact:ocean-cleanup-system03-2026','The Ocean Cleanup — System 03 FAQ / operational record',now(),'{"role":"operational_status"}'::jsonb),
 ('evidence:4p:impact:toc:optimisation','source_record','record:4p:impact:ocean-cleanup-system03-2026','The Ocean Cleanup — July 2026 operations update',now(),'{"role":"operational_update"}'::jsonb)
on conflict (evidence_id) do update set
 evidence_type=excluded.evidence_type,source_record_id=excluded.source_record_id,citation=excluded.citation,
 reviewed_at=excluded.reviewed_at,provenance=excluded.provenance;

insert into planetbrain.claim_evidence (claim_id,evidence_id,relation)
values
 ('claim:4p:impact:nmc:flagship','evidence:4p:impact:nmc:flagship','supports'),
 ('claim:4p:impact:nmc:hectares','evidence:4p:impact:nmc:hectares','supports'),
 ('claim:4p:impact:trees:flagship','evidence:4p:impact:trees:flagship','supports'),
 ('claim:4p:impact:trees:hectares','evidence:4p:impact:trees:hectares','supports'),
 ('claim:4p:impact:crf:outplants','evidence:4p:impact:crf:outplants','supports'),
 ('claim:4p:impact:crf:nursery','evidence:4p:impact:crf:nursery','supports'),
 ('claim:4p:impact:toc:system03','evidence:4p:impact:toc:system03','supports'),
 ('claim:4p:impact:toc:optimisation','evidence:4p:impact:toc:optimisation','supports')
on conflict (claim_id,evidence_id) do update set relation=excluded.relation;

-- Graph relationships.
insert into planetbrain.relationships
 (relationship_id,subject_entity_id,predicate,object_entity_id,review_status,evidence_strength,provenance)
select v.relationship_id,s.id,v.predicate,o.id,v.review_status,v.evidence_strength,'{"scope":"impact_gold_v01"}'::jsonb
from (values
 ('rel:4p:impact:nmc:issue','project:4p:impact:northern-mozambique-channel','addresses_problem','problem:4p:impact:reef-degradation','source_checked','strong'),
 ('rel:4p:impact:nmc:place','project:4p:impact:northern-mozambique-channel','occurs_in','place:4p:northern-mozambique-channel','source_checked','strong'),
 ('rel:4p:impact:nmc:actor','project:4p:impact:northern-mozambique-channel','has_lead_actor','actor:4p:northern-mozambique-restoration-network','source_checked','strong'),
 ('rel:4p:impact:nmc:solution','project:4p:impact:northern-mozambique-channel','uses_solution','solution:4p:impact:connected-seascape-restoration','source_checked','strong'),
 ('rel:4p:impact:nmc:action','project:4p:impact:northern-mozambique-channel','offers_external_action','action:4p:impact:northern-mozambique-un','source_checked','strong'),

 ('rel:4p:impact:trees:issue','project:4p:impact:african-forest-gardens','addresses_problem','problem:4p:impact:land-degradation','source_checked','strong'),
 ('rel:4p:impact:trees:place','project:4p:impact:african-forest-gardens','occurs_in','place:4p:kenya','source_checked','partial_geographic_context'),
 ('rel:4p:impact:trees:actor','project:4p:impact:african-forest-gardens','has_lead_actor','actor:4p:trees-for-the-future','source_checked','strong'),
 ('rel:4p:impact:trees:solution','project:4p:impact:african-forest-gardens','uses_solution','solution:4p:impact:forest-garden-agroforestry','source_checked','strong'),
 ('rel:4p:impact:trees:action','project:4p:impact:african-forest-gardens','offers_external_action','action:4p:impact:trees-support','source_checked','strong'),

 ('rel:4p:impact:crf:issue','project:4p:impact:florida-coral-restoration','addresses_problem','problem:4p:impact:reef-degradation','source_checked','strong'),
 ('rel:4p:impact:crf:place','project:4p:impact:florida-coral-restoration','occurs_in','place:4p:florida-keys','source_checked','strong'),
 ('rel:4p:impact:crf:actor','project:4p:impact:florida-coral-restoration','has_lead_actor','actor:4p:coral-restoration-foundation','source_checked','strong'),
 ('rel:4p:impact:crf:solution','project:4p:impact:florida-coral-restoration','uses_solution','solution:4p:impact:coral-nursery-outplanting','source_checked','strong'),
 ('rel:4p:impact:crf:action','project:4p:impact:florida-coral-restoration','offers_external_action','action:4p:impact:crf-support','source_checked','strong'),

 ('rel:4p:impact:toc:issue','project:4p:impact:great-pacific-garbage-patch','addresses_problem','problem:4p:impact:ocean-plastic','source_checked','strong'),
 ('rel:4p:impact:toc:place','project:4p:impact:great-pacific-garbage-patch','occurs_in','place:4p:north-pacific','source_checked','broad_context'),
 ('rel:4p:impact:toc:actor','project:4p:impact:great-pacific-garbage-patch','has_lead_actor','actor:4p:the-ocean-cleanup','source_checked','strong'),
 ('rel:4p:impact:toc:solution','project:4p:impact:great-pacific-garbage-patch','uses_solution','solution:4p:impact:offshore-plastic-extraction','source_checked','strong'),
 ('rel:4p:impact:toc:action','project:4p:impact:great-pacific-garbage-patch','offers_external_action','action:4p:impact:ocean-cleanup-support','source_checked','strong')
) v(relationship_id,subject_canonical,predicate,object_canonical,review_status,evidence_strength)
join planetbrain.entities s on s.canonical_id=v.subject_canonical
join planetbrain.entities o on o.canonical_id=v.object_canonical
on conflict (relationship_id) do update set
 subject_entity_id=excluded.subject_entity_id,predicate=excluded.predicate,object_entity_id=excluded.object_entity_id,
 review_status=excluded.review_status,evidence_strength=excluded.evidence_strength,provenance=excluded.provenance;

-- Controlled public read projection over the existing NATUREBRAIN graph.
create or replace function public.impact_lan_gold_v01()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with projects as (
  select p.*
  from planetbrain.entities p
  where p.entity_type='project'
    and p.status='active'
    and p.provenance->>'scope'='impact_gold_v01'
),
rows as (
  select
    p.canonical_id,
    p.name,
    p.description,
    p.provenance,
    (
      select jsonb_build_object(
        'id', a.canonical_id,
        'name', a.name,
        'description', a.description,
        'actor_type', pa.actor_type,
        'relationship_state', a.provenance->>'relationship_state'
      )
      from planetbrain.relationships r
      join planetbrain.entities a on a.id=r.object_entity_id
      left join planetbrain.actors pa on pa.entity_id=a.id
      where r.subject_entity_id=p.id and r.predicate='has_lead_actor'
      limit 1
    ) actor,
    (
      select jsonb_build_object(
        'id', x.canonical_id,
        'name', x.name,
        'description', x.description,
        'geometry_status', x.provenance->>'geometry_status'
      )
      from planetbrain.relationships r
      join planetbrain.entities x on x.id=r.object_entity_id
      where r.subject_entity_id=p.id and r.predicate='occurs_in'
      limit 1
    ) place,
    (
      select jsonb_build_object(
        'id', x.canonical_id,
        'name', x.name,
        'description', x.description,
        'solution_type', ps.solution_type
      )
      from planetbrain.relationships r
      join planetbrain.entities x on x.id=r.object_entity_id
      left join planetbrain.solutions ps on ps.entity_id=x.id
      where r.subject_entity_id=p.id and r.predicate='uses_solution'
      limit 1
    ) solution,
    (
      select jsonb_build_object(
        'id', x.canonical_id,
        'name', x.name,
        'description', x.description,
        'action_type', x.provenance->>'action_type',
        'url', x.provenance->>'url',
        'processed_by_4planet', coalesce((x.provenance->>'processed_by_4planet')::boolean,false)
      )
      from planetbrain.relationships r
      join planetbrain.entities x on x.id=r.object_entity_id
      where r.subject_entity_id=p.id and r.predicate='offers_external_action'
      limit 1
    ) action,
    (
      select jsonb_build_object(
        'id', x.canonical_id,
        'name', x.name,
        'description', x.description
      )
      from planetbrain.relationships r
      join planetbrain.entities x on x.id=r.object_entity_id
      where r.subject_entity_id=p.id and r.predicate='addresses_problem'
      limit 1
    ) issue,
    (
      select coalesce(jsonb_agg(jsonb_build_object(
        'claim_id',c.claim_id,
        'statement',c.statement,
        'review_status',c.review_status,
        'evidence_strength',c.evidence_strength,
        'interpretation_status',c.interpretation_status,
        'citation',ev.citation,
        'source_name',src.name,
        'source_url',coalesce(sr.provenance->>'url',src.canonical_uri),
        'source_rights',src.rights,
        'limitations',sr.limitations
      ) order by c.claim_id),'[]'::jsonb)
      from planetbrain.claims c
      left join planetbrain.claim_evidence ce on ce.claim_id=c.claim_id and ce.relation='supports'
      left join planetbrain.evidence ev on ev.evidence_id=ce.evidence_id
      left join planetbrain.source_records sr on sr.record_id=ev.source_record_id
      left join planetbrain.datasets ds on ds.dataset_id=sr.dataset_id
      left join planetbrain.sources src on src.source_id=ds.source_id
      where c.subject_entity_id=p.id
    ) evidence
  from projects p
)
select jsonb_build_object(
  'version','impact-lan-gold-v01',
  'generated_at',now(),
  'truth_boundaries',jsonb_build_array(
    'Listing does not imply 4PLANET partnership or endorsement.',
    'Contribution, delivery, outcome and verification remain separate truth states.',
    'Source-reported metrics are not silently converted into independently verified outcomes.',
    'Place context may be broad navigation context and is not automatically an ecological or legal boundary.'
  ),
  'projects',coalesce(jsonb_agg(jsonb_build_object(
    'id',canonical_id,
    'name',name,
    'description',description,
    'issue_label',provenance->>'issue_label',
    'issue_short',provenance->>'issue_short',
    'year_label',provenance->>'year_label',
    'review_state',provenance->>'review_state',
    'image_path',provenance->>'image_path',
    'image_role',provenance->>'image_role',
    'official_url',provenance->>'official_url',
    'atlas_place_id',provenance->>'atlas_place_id',
    'coverage_note',provenance->>'coverage_note',
    'issue',issue,
    'actor',actor,
    'place',place,
    'solution',solution,
    'action',action,
    'evidence',evidence
  ) order by name),'[]'::jsonb)
)
from rows;
$$;

revoke all on function public.impact_lan_gold_v01() from public;
grant execute on function public.impact_lan_gold_v01() to anon, authenticated, service_role;
