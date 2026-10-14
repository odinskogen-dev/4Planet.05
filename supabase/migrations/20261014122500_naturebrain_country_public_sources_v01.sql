-- NATUREBRAIN shared public country-source registration v01.
-- Canonical product name is NATUREBRAIN; planetbrain remains the legacy technical schema.
-- This registers source/dataset metadata only. It does not bulk ingest country metrics
-- or Wikidata entities and does not create a parallel country truth store.

insert into planetbrain.sources(
  source_id,name,source_type,canonical_uri,rights,attribution,status,provenance
) values
(
  'source:worldbank-wdi',
  'World Bank — World Development Indicators',
  'international_open_data_portal',
  'https://datacatalog.worldbank.org/search/dataset/0037712/world-development-indicators',
  'World Development Indicators is published under CC BY 4.0. Reuse, including commercial reuse, is permitted with attribution and indication of changes. Indicator-level metadata/additional third-party terms remain controlling where stated.',
  'World Bank — World Development Indicators',
  'qualified',
  '{"rights_checked_on":"2026-10-14","read_mode":"BOUNDED_SERVER_ADAPTER","api":"https://api.worldbank.org/v2","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"no_wholesale_ingest":true,"truth_boundary":"National annual indicators; each value keeps its year. Country aggregates are not local conditions. Indicator-level metadata can carry additional terms."}'::jsonb
),
(
  'source:wikidata',
  'Wikidata',
  'open_knowledge_graph',
  'https://www.wikidata.org/',
  'Structured data in Wikidata main/Property/Lexeme/EntitySchema namespaces is CC0 1.0/public-domain dedicated. Text and media outside structured data may have different licences and are not included by this contract.',
  'Wikidata / Wikimedia community',
  'qualified',
  '{"rights_checked_on":"2026-10-14","read_mode":"BOUNDED_SERVER_QUERY","api":"https://query.wikidata.org/sparql","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"no_wholesale_ingest":true,"truth_boundary":"Community-edited identity/context facts. Multiple or contested values must remain visible or unresolved; 4PLANET does not adjudicate them."}'::jsonb
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
  'dataset:worldbank:wdi',
  'source:worldbank-wdi',
  'World Development Indicators',
  'current / rights checked 2026-10-14',
  'https://datacatalog.worldbank.org/search/dataset/0037712/world-development-indicators',
  'CC BY 4.0 for WDI as published by the World Bank, subject to any indicator-level metadata/additional terms. Preserve attribution, source notes, units and year.',
  '{"from_year":1960,"through_year":2025,"semantics":"annual country/economy indicators; latest available year differs by indicator and economy"}'::jsonb,
  '{"scope":"global country/economy aggregates","representation":"national/economy aggregate, not local condition"}'::jsonb,
  '{"api":"https://api.worldbank.org/v2","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"adapter_state":"SHARED_CANDIDATE_GATED","allowlist_required":true,"limitation":"No synthetic country score. Rankings, if shown, must expose metric, coverage, year and comparison semantics. Missing is not zero."}'::jsonb
),
(
  'dataset:wikidata:country-identity',
  'source:wikidata',
  'Wikidata country identity facts',
  'live community graph / rights checked 2026-10-14',
  'https://www.wikidata.org/',
  'CC0 1.0 for structured data only. Linked text/media are outside this dataset contract and may carry different rights.',
  '{"semantics":"current community-edited structured statements; values and qualifiers may change over time"}'::jsonb,
  '{"scope":"country identity/context facts queried by canonical code/entity","representation":"structured statements, not 4PLANET adjudication"}'::jsonb,
  '{"api":"https://query.wikidata.org/sparql","consumers":["4NATION","S4PIENS","NATUREBRAIN"],"adapter_state":"SHARED_CANDIDATE_GATED","allowed_initial_properties":["P37","P38","P610","P2044","P85","P297"],"limitation":"Multiple/contested values must not be silently resolved as 4PLANET truth. No media rights are inherited from CC0 structured data."}'::jsonb
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
