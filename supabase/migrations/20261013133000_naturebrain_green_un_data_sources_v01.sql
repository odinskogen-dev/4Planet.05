-- GREEN DATA -> NATUREBRAIN additional qualified UN-family source registration v01.
-- Canonical product name is NATUREBRAIN; planetbrain remains the legacy technical schema.
--
-- This migration registers SOURCE/DATASET/DISABLED-FEED metadata only.
-- It does not bulk ingest observations, claims, people, boundaries or metrics.
-- Product adapters remain bounded and dataset-specific.

insert into planetbrain.sources(
  source_id,name,source_type,canonical_uri,rights,attribution,status,provenance
) values
(
  'source:undp-hdro','UNDP Human Development Report Office','intergovernmental_open_data_portal',
  'https://hdr.undp.org/data-center/documentation-and-downloads',
  'HDRO website materials are CC BY 3.0 IGO; sharing and commercial adaptation are allowed with appropriate credit, licence link and change indication.',
  'United Nations Development Programme — Human Development Report Office',
  'qualified',
  '{"rights_checked_on":"2026-10-13","api_state":"DataPRISM documented; exact bounded adapter not yet activated","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"no_wholesale_ingest":true}'::jsonb
),
(
  'source:unido-stat','UNIDO Statistics Portal','intergovernmental_open_data_portal',
  'https://stat.unido.org/',
  'Portal material is CC BY 4.0 unless otherwise stated; source acknowledgement required and external-source material may carry separate rights.',
  'United Nations Industrial Development Organization (UNIDO)',
  'qualified',
  '{"rights_checked_on":"2026-10-13","api_state":"Official API documented; dynamic dataset IDs must be discovered at runtime and plain HTTP clients may face Cloudflare controls","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"no_wholesale_ingest":true}'::jsonb
),
(
  'source:ilostat','ILOSTAT','intergovernmental_open_data_portal',
  'https://ilostat.ilo.org/data/',
  'ILO datasets made available on or after 2023-05-03 are CC BY 4.0 unless otherwise indicated; restricted constituent/partner microdata are excluded.',
  'International Labour Organization (ILO)',
  'qualified',
  '{"rights_checked_on":"2026-10-13","api_state":"Web service / SDMX and bulk downloads documented; exact indicators/dataflows must retain their standard/method metadata","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"no_wholesale_ingest":true}'::jsonb
),
(
  'source:unhcr-refugee-statistics','UNHCR Refugee Population Statistics','intergovernmental_open_data_portal',
  'https://www.unhcr.org/refugee-statistics/',
  'Refugee Population Statistics datasets are CC BY 4.0 except where otherwise indicated; confidentiality safeguards and methodology must be preserved.',
  'United Nations High Commissioner for Refugees (UNHCR)',
  'qualified',
  '{"rights_checked_on":"2026-10-13","api_state":"Official Refugee Data Finder API is open and designed for third-party applications; bounded country/time reads only","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"no_wholesale_ingest":true,"sensitivity":"Aggregate published statistics only; never person-level inference"}'::jsonb
),
(
  'source:undata-legacy','UNdata / World Statistics Pocketbook country profiles','intergovernmental_open_data_portal',
  'https://data.un.org/',
  'UNdata data and metadata may be copied, duplicated and further distributed provided UNdata is cited; source-database limitations remain controlling.',
  'United Nations Statistics Division / UNdata and underlying source agencies',
  'qualified',
  '{"rights_checked_on":"2026-10-13","role":"bootstrap and QA / source-comparison; prefer current primary source when available","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"no_wholesale_ingest":true}'::jsonb
)
on conflict(source_id) do update set
  name=excluded.name,source_type=excluded.source_type,canonical_uri=excluded.canonical_uri,
  rights=excluded.rights,attribution=excluded.attribution,status=excluded.status,
  provenance=planetbrain.sources.provenance||excluded.provenance,updated_at=now();

insert into planetbrain.datasets(
  dataset_id,source_id,name,version,canonical_uri,rights,temporal_coverage,spatial_coverage,provenance
) values
(
  'dataset:unesco:uis001','source:unesco-datahub','SDG 4 Education Indicators (Global & Thematic)','current / checked 2026-10-13',
  'https://data.unesco.org/explore/dataset/uis001/?flg=en-us',
  'CC BY-SA 4.0 — UIS attribution + ShareAlike.',
  '{"from_year":2015,"semantics":"annual/global-thematic education indicators; indicator-specific availability and methods vary"}'::jsonb,
  '{"scope":"200+ countries / country and regional indicator records"}'::jsonb,
  '{"upstream_dataset_id":"uis001","publisher":"UNESCO Institute for Statistics (UIS)","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"adapter_state":"REGISTERED_NOT_ACTIVE","limitation":"Do not mix indicators, definitions or vintages; missing is not zero."}'::jsonb
),
(
  'dataset:unesco:edp002','source:unesco-datahub','Her Atlas — legal frameworks for girls education','current / checked 2026-10-13',
  'https://data.unesco.org/explore/dataset/edp002/?flg=en-us',
  'CC BY-SA 4.0 — UNESCO attribution + ShareAlike.',
  '{"from_year":2019,"through_year":2025,"semantics":"country-year legal-framework indicators; monthly source updates"}'::jsonb,
  '{"scope":"country-level legal-framework records"}'::jsonb,
  '{"upstream_dataset_id":"edp002","publisher":"UNESCO","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"adapter_state":"REGISTERED_NOT_ACTIVE","limitation":"Legal framework indicator is not proof of implementation or lived outcome."}'::jsonb
),
(
  'dataset:unesco:voc001','source:unesco-datahub','UNESCO Thesaurus','current / checked 2026-10-13',
  'https://data.unesco.org/explore/dataset/voc001/?flg=en-us',
  'CC BY-SA 4.0 — UNESCO attribution + ShareAlike.',
  '{"semantics":"continuously maintained controlled vocabulary; not an empirical measurement dataset"}'::jsonb,
  '{"scope":"multidisciplinary controlled vocabulary / URI-literal relationship records"}'::jsonb,
  '{"upstream_dataset_id":"voc001","publisher":"UNESCO","consumers":["NATUREBRAIN","S4PIENS"],"adapter_state":"QUERY_BOUNDED_ONLY","record_scale":"~98k; never bulk mirror by default","limitation":"Use for terminology/entity-link support, not as evidence for factual claims."}'::jsonb
),
(
  'dataset:undp:hdro-composite-indices','source:undp-hdro','HDRO composite indices and components time series','current / checked 2026-10-13',
  'https://hdr.undp.org/data-center/documentation-and-downloads',
  'CC BY 3.0 IGO — commercial reuse/adaptation permitted with appropriate credit, licence link and change indication.',
  '{"from_year":1990,"semantics":"HDI-family indices/components; edition and indicator-specific availability vary"}'::jsonb,
  '{"scope":"country/territory and aggregate human-development series"}'::jsonb,
  '{"consumers":["4NATION","S4PIENS","NATUREBRAIN"],"adapter_state":"REGISTERED_NOT_ACTIVE","includes":["HDI","IHDI","GDI","GII","PHDI"],"limitation":"Composite indices require method/version visibility and must not become a 4PLANET moral ranking."}'::jsonb
),
(
  'dataset:unido:country-profile','source:unido-stat','UNIDO Country Profiles','current / checked 2026-10-13',
  'https://stat.unido.org/portal/dataset/getDataset/COUNTRY_PROFILE',
  'CC BY 4.0 unless otherwise stated on the Portal; UNIDO acknowledgement required.',
  '{"semantics":"industrial/economic country profile; source variables and periods vary"}'::jsonb,
  '{"scope":"country-level industrial context"}'::jsonb,
  '{"upstream_database":"COUNTRY_PROFILE","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"adapter_state":"METADATA_DISCOVERY_REQUIRED","limitation":"Discover dynamic dataset ID and variable metadata before reads."}'::jsonb
),
(
  'dataset:unido:indstat4','source:unido-stat','INDSTAT — ISIC Revision 4','current / checked 2026-10-13',
  'https://stat.unido.org/portal/dataset/getDataset/INDSTAT/4',
  'CC BY 4.0 unless otherwise stated on the Portal; UNIDO acknowledgement required.',
  '{"semantics":"industrial statistics by activity/period; country coverage and methods vary"}'::jsonb,
  '{"scope":"country × industrial activity"}'::jsonb,
  '{"upstream_database":"INDSTAT/4","consumers":["S4PIENS","4NATION","NATUREBRAIN"],"adapter_state":"METADATA_DISCOVERY_REQUIRED","limitation":"Dynamic database ID must not be hardcoded; country/method metadata required."}'::jsonb
),
(
  'dataset:unido:national-accounts','source:unido-stat','UNIDO National Accounts','current / checked 2026-10-13',
  'https://stat.unido.org/portal/dataset/getDataset/NATIONAL_ACCOUNTS',
  'CC BY 4.0 unless otherwise stated on the Portal; UNIDO acknowledgement required.',
  '{"semantics":"national-accounts indicators; variable/period metadata controls interpretation"}'::jsonb,
  '{"scope":"country-level economic/industrial aggregates"}'::jsonb,
  '{"upstream_database":"NATIONAL_ACCOUNTS","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"adapter_state":"METADATA_DISCOVERY_REQUIRED"}'::jsonb
),
(
  'dataset:unido:manufacturing-trade','source:unido-stat','UNIDO Manufacturing Trade Database','current / checked 2026-10-13',
  'https://stat.unido.org/portal/dataset/getDataset/MTD',
  'CC BY 4.0 unless otherwise stated on the Portal; UNIDO acknowledgement required.',
  '{"semantics":"manufacturing trade by country/activity/period"}'::jsonb,
  '{"scope":"country × manufacturing trade/activity"}'::jsonb,
  '{"upstream_database":"MTD","consumers":["S4PIENS","4NATION","NATUREBRAIN"],"adapter_state":"METADATA_DISCOVERY_REQUIRED","limitation":"Trade statistics are not exact firm-to-firm provenance."}'::jsonb
),
(
  'dataset:unido:sdg9','source:unido-stat','UNIDO SDG 9 Indicators','current / checked 2026-10-13',
  'https://stat.unido.org/portal/dataset/getDataset/SDG',
  'CC BY 4.0 unless otherwise stated on the Portal; UNIDO acknowledgement required.',
  '{"semantics":"industry-related SDG 9 indicators"}'::jsonb,
  '{"scope":"country-level industrial-development indicators"}'::jsonb,
  '{"upstream_database":"SDG","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"adapter_state":"METADATA_DISCOVERY_REQUIRED"}'::jsonb
),
(
  'dataset:unhcr:refugee-population-statistics','source:unhcr-refugee-statistics','Refugee Population Statistics Database','current / checked 2026-10-13',
  'https://www.unhcr.org/refugee-statistics/',
  'CC BY 4.0 except where otherwise indicated; UNHCR attribution and methodology required.',
  '{"from_year":1951,"semantics":"published aggregate displacement/statelessness/solution statistics; coverage varies by population type"}'::jsonb,
  '{"scope":"global country/region aggregate statistics; demographics/sub-national where published"}'::jsonb,
  '{"consumers":["4NATION","S4PIENS","NATUREBRAIN"],"adapter_state":"REGISTERED_NOT_ACTIVE","privacy":"Use only published aggregate statistics; preserve rounding/confidentiality safeguards.","limitation":"Statuses, definitions and revisions are method-specific; do not infer individual migration status."}'::jsonb
),
(
  'dataset:undata:country-profiles','source:undata-legacy','World Statistics Pocketbook / UNdata Country Profiles','current profile product / checked 2026-10-13',
  'https://data.un.org/legacy/en/more/about_en.html',
  'UNdata data/metadata may be copied, duplicated and further distributed with UNdata cited; underlying source limitations remain relevant.',
  '{"reference_years":[2015,2020,2025],"semantics":"profile uses target years or most recent prior observation back to 2000"}'::jsonb,
  '{"scope":"30 regions and 200+ countries/areas; economic/social/environmental/infrastructure indicators"}'::jsonb,
  '{"consumers":["4NATION","NATUREBRAIN"],"role":"bootstrap/QA comparator; prefer current primary dataset for product truth","adapter_state":"REGISTERED_NOT_ACTIVE"}'::jsonb
)
on conflict(dataset_id) do update set
  source_id=excluded.source_id,name=excluded.name,version=excluded.version,canonical_uri=excluded.canonical_uri,
  rights=excluded.rights,temporal_coverage=excluded.temporal_coverage,spatial_coverage=excluded.spatial_coverage,
  provenance=planetbrain.datasets.provenance||excluded.provenance,updated_at=now();

insert into planetbrain.ingest_feeds(
  feed_id,source_id,dataset_id,endpoint,enabled,scan_since,cursor_offset,batch_limit,provenance
) values
('unesco-uis001-v01','source:unesco-datahub','dataset:unesco:uis001','https://data.unesco.org/api/explore/v2.1/catalog/datasets/uis001/records',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Country/indicator-scoped adapter required; no bulk mirror."}'::jsonb),
('unesco-edp002-v01','source:unesco-datahub','dataset:unesco:edp002','https://data.unesco.org/api/explore/v2.1/catalog/datasets/edp002/records',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Country/year-scoped legal indicator reads only."}'::jsonb),
('unesco-voc001-v01','source:unesco-datahub','dataset:unesco:voc001','https://data.unesco.org/api/explore/v2.1/catalog/datasets/voc001/records',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"~98k vocabulary records; query-bounded terminology lookup only."}'::jsonb),
('unido-country-profile-v01','source:unido-stat','dataset:unido:country-profile','https://stat.unido.org/portal/dataset/getDataset/COUNTRY_PROFILE',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Metadata discovery first; dynamic dataset IDs and Cloudflare constraints."}'::jsonb),
('unido-indstat4-v01','source:unido-stat','dataset:unido:indstat4','https://stat.unido.org/portal/dataset/getDataset/INDSTAT/4',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Metadata discovery first; do not hardcode dynamic dataset ID."}'::jsonb),
('unido-national-accounts-v01','source:unido-stat','dataset:unido:national-accounts','https://stat.unido.org/portal/dataset/getDataset/NATIONAL_ACCOUNTS',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Metadata discovery first."}'::jsonb),
('unido-manufacturing-trade-v01','source:unido-stat','dataset:unido:manufacturing-trade','https://stat.unido.org/portal/dataset/getDataset/MTD',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Metadata discovery first; no bulk trade mirror."}'::jsonb),
('unido-sdg9-v01','source:unido-stat','dataset:unido:sdg9','https://stat.unido.org/portal/dataset/getDataset/SDG',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Metadata discovery first."}'::jsonb),
('unhcr-population-v01','source:unhcr-refugee-statistics','dataset:unhcr:refugee-population-statistics','https://api.unhcr.org/population/v1/population/',false,current_date,0,20,'{"state":"REGISTERED_DISABLED","reason":"Bound country/time aggregate adapter required before product use; preserve methodology/confidentiality."}'::jsonb)
on conflict(feed_id) do update set
  source_id=excluded.source_id,dataset_id=excluded.dataset_id,endpoint=excluded.endpoint,
  enabled=false,provenance=planetbrain.ingest_feeds.provenance||excluded.provenance,updated_at=now();
