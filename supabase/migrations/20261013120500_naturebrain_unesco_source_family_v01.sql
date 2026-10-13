-- GREEN DATA -> NATUREBRAIN source-family registration v01.
-- Candidate only until accepted through the current Gold/release path.
-- Canonical product name is NATUREBRAIN; planetbrain remains the legacy technical schema.
--
-- PURPOSE:
-- - register qualified UNESCO DataHub datasets in the existing source federation;
-- - preserve dataset rights/semantics/product consumers;
-- - create DISABLED ingest-feed metadata only, explicitly preventing accidental
--   wholesale ingestion before a bounded persistence contract is approved.
--
-- NO source records, claims, relationships or measurements are fabricated here.

insert into planetbrain.sources(
  source_id,name,source_type,canonical_uri,rights,attribution,status,provenance
) values (
  'source:unesco-datahub',
  'UNESCO DataHub',
  'intergovernmental_open_data_portal',
  'https://data.unesco.org/',
  'Dataset-specific. The datasets registered by this migration were rechecked 2026-10-13 as CC BY-SA 4.0; commercial reuse requires attribution and ShareAlike compliance. Do not infer the same rights for unregistered UNESCO datasets or media.',
  'UNESCO and the dataset-specific publisher/authority shown in provenance',
  'qualified',
  '{"naturebrain_role":"source federation / authoritative public data","rights_checked_on":"2026-10-13","access_contract":"OpenDataSoft Explore API v2.1","no_wholesale_ingest":true,"consumers":["ATLAS","4NATION","S4PIENS","NATUREBRAIN"]}'::jsonb
)
on conflict(source_id) do update set
  name=excluded.name,
  source_type=excluded.source_type,
  canonical_uri=excluded.canonical_uri,
  rights=excluded.rights,
  attribution=excluded.attribution,
  status=excluded.status,
  provenance=planetbrain.sources.provenance||excluded.provenance,
  updated_at=now();

insert into planetbrain.datasets(
  dataset_id,source_id,name,version,canonical_uri,rights,temporal_coverage,spatial_coverage,provenance
) values
(
  'dataset:unesco:mab001','source:unesco-datahub','Man and the Biosphere Programme','current / checked 2026-10-13',
  'https://data.unesco.org/explore/dataset/mab001/?flg=en-us',
  'CC BY-SA 4.0 — attribution + ShareAlike; source media/linked resources may have separate rights.',
  '{"semantics":"designation/source-record dates; not live ecological condition"}'::jsonb,
  '{"scope":"global biosphere reserves","representation":"source-provided representative coordinate; not reserve boundary"}'::jsonb,
  '{"upstream_dataset_id":"mab001","publisher":"UNESCO","consumers":["ATLAS","4NATION","NATUREBRAIN"],"limitation":"Designation does not establish current ecosystem health."}'::jsonb
),
(
  'dataset:unesco:whc001','source:unesco-datahub','World Heritage List','current / checked 2026-10-13',
  'https://data.unesco.org/explore/dataset/whc001/?flg=en-us',
  'CC BY-SA 4.0 — attribution + ShareAlike; source images/media have separate rights.',
  '{"semantics":"inscription/list status; annual dataset"}'::jsonb,
  '{"scope":"global World Heritage sites","representation":"source-provided site coordinate; not complete site boundary"}'::jsonb,
  '{"upstream_dataset_id":"whc001","publisher":"UNESCO","consumers":["ATLAS","4NATION","4CULTURE","NATUREBRAIN"],"limitation":"Designation does not establish present ecological or cultural condition."}'::jsonb
),
(
  'dataset:unesco:eg0001','source:unesco-datahub','UNESCO Global Geoparks','current / checked 2026-10-13',
  'https://data.unesco.org/explore/dataset/eg0001/?flg=en-us',
  'CC BY-SA 4.0 — attribution + ShareAlike; linked resources may have separate rights.',
  '{"semantics":"designation/source-record dates; not live environmental condition"}'::jsonb,
  '{"scope":"global UNESCO Global Geoparks","representation":"source-provided representative coordinate; not geopark boundary"}'::jsonb,
  '{"upstream_dataset_id":"eg0001","publisher":"UNESCO","consumers":["ATLAS","4NATION","NATUREBRAIN"],"limitation":"Representative point is not the geopark boundary."}'::jsonb
),
(
  'dataset:unesco:ioc001','source:unesco-datahub','Marine Biodiversity by Ocean Area — OBIS','current / checked 2026-10-13',
  'https://data.unesco.org/explore/dataset/ioc001/?flg=en-us',
  'CC BY-SA 4.0 for this UNESCO DataHub aggregate dataset. Raw OBIS occurrence records remain governed by their original per-dataset licences and are a separate source contract.',
  '{"semantics":"historical occurrence-record span per ocean area; not live marine conditions"}'::jsonb,
  '{"scope":"EEZ, ABNJ/high-seas and EBSA area summaries","representation":"source-provided representative area coordinate; not boundary"}'::jsonb,
  '{"upstream_dataset_id":"ioc001","publisher":"IOC-UNESCO / IODE","attribution":"OBIS","consumers":["ATLAS","OCE4N","4NATION","S4PIENS","NATUREBRAIN"],"limitation":"Record/species counts include sampling effort; not abundance, complete richness, range or live positions.","raw_obis_source_id":"source:obis"}'::jsonb
),
(
  'dataset:unesco:cou001','source:unesco-datahub','UNESCO Member States','current / checked 2026-10-13',
  'https://data.unesco.org/explore/dataset/cou001/?flg=en-us',
  'CC BY-SA 4.0 — attribution + ShareAlike.',
  '{"semantics":"UNESCO member/associate-member record state"}'::jsonb,
  '{"scope":"UNESCO member and associate-member country records","representation":"country identity, coordinates and source geometry"}'::jsonb,
  '{"upstream_dataset_id":"cou001","publisher":"UNESCO","consumers":["4NATION","ATLAS","S4PIENS","NATUREBRAIN"],"limitation":"UNESCO membership/context is not a 4PLANET adjudication of sovereignty or disputed territories."}'::jsonb
),
(
  'dataset:unesco:wdi001','source:unesco-datahub','World Development Indicators','current / checked 2026-10-13',
  'https://data.unesco.org/explore/dataset/wdi001/?flg=en-us',
  'CC BY-SA 4.0 on the UNESCO DataHub dataset, with World Bank attribution. Preserve metric/year/source; do not treat missing as zero.',
  '{"from_year":1960,"through_year":2024,"semantics":"country-year indicators; latest year differs by metric and country"}'::jsonb,
  '{"scope":"country-level global development indicators","representation":"country aggregate, not local condition"}'::jsonb,
  '{"upstream_dataset_id":"wdi001","publisher":"World Bank","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"limitation":"Country averages and mixed vintages must remain explicit.","no_bulk_copy":true}'::jsonb
)
on conflict(dataset_id) do update set
  source_id=excluded.source_id,
  name=excluded.name,
  version=excluded.version,
  canonical_uri=excluded.canonical_uri,
  rights=excluded.rights,
  temporal_coverage=excluded.temporal_coverage,
  spatial_coverage=excluded.spatial_coverage,
  provenance=planetbrain.datasets.provenance||excluded.provenance,
  updated_at=now();

-- Register discoverable feeds, but leave every feed disabled. Product reads use
-- bounded server adapters; persistence requires a later explicit ingest design.
insert into planetbrain.ingest_feeds(
  feed_id,source_id,dataset_id,endpoint,enabled,scan_since,cursor_offset,batch_limit,provenance
) values
('unesco-mab001-v01','source:unesco-datahub','dataset:unesco:mab001','https://data.unesco.org/api/explore/v2.1/catalog/datasets/mab001/records',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"No wholesale ingest; product adapter active first."}'::jsonb),
('unesco-whc001-v01','source:unesco-datahub','dataset:unesco:whc001','https://data.unesco.org/api/explore/v2.1/catalog/datasets/whc001/records',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"No wholesale ingest; product adapter active first."}'::jsonb),
('unesco-eg0001-v01','source:unesco-datahub','dataset:unesco:eg0001','https://data.unesco.org/api/explore/v2.1/catalog/datasets/eg0001/records',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"No wholesale ingest; product adapter active first."}'::jsonb),
('unesco-ioc001-v01','source:unesco-datahub','dataset:unesco:ioc001','https://data.unesco.org/api/explore/v2.1/catalog/datasets/ioc001/records',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Aggregate-area product read first; no raw OBIS licence inheritance."}'::jsonb),
('unesco-cou001-v01','source:unesco-datahub','dataset:unesco:cou001','https://data.unesco.org/api/explore/v2.1/catalog/datasets/cou001/records',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Country identity product read; persist only after identity reconciliation."}'::jsonb),
('unesco-wdi001-v01','source:unesco-datahub','dataset:unesco:wdi001','https://data.unesco.org/api/explore/v2.1/catalog/datasets/wdi001/records',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Country-scoped reads only; no 13k-row bulk mirror."}'::jsonb)
on conflict(feed_id) do update set
  source_id=excluded.source_id,
  dataset_id=excluded.dataset_id,
  endpoint=excluded.endpoint,
  enabled=false,
  provenance=planetbrain.ingest_feeds.provenance||excluded.provenance,
  updated_at=now();
