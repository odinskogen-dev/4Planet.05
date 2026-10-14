# GREEN DATA SOURCE MATRIX — 13 OCT 2026

Internal source/rights state for the GREEN DATA sprint. NATUREBRAIN remains the shared source/provenance layer; no parallel truth store or map engine is created.

P0 ACTIVE PRODUCT READS: UNESCO mab001, whc001, eg0001, ioc001, cou001 and country-scoped wdi001. P0 spatial layers use the shared World/ATLAS engine. P0 feeds remain disabled in NATUREBRAIN; no wholesale ingest.

REGISTERED SHARED COUNTRY SOURCES (14 OCT): World Bank WDI direct source (`dataset:worldbank:wdi`) and Wikidata structured country identity (`dataset:wikidata:country-identity`) are now registered in existing NATUREBRAIN/`planetbrain` source metadata with bounded-read, no-wholesale-ingest contracts. Rights are rechecked: WDI is CC BY 4.0 subject to indicator-level metadata/additional terms; Wikidata structured data is CC0. Product adapter activation remains gated by exact PR/runtime QA.\n\nREGISTERED NEXT: UNESCO uis001, edp002, voc001; UNDP HDRO; UNIDO Country Profiles, INDSTAT Rev.4, National Accounts, Manufacturing Trade and SDG9; UNHCR Refugee Population Statistics; UNdata Country Profiles. ILOSTAT source is qualified; exact indicator/dataflow selection remains a bounded adapter step.

RIGHTS: UNESCO datasets above are CC BY-SA 4.0. UNDP HDRO is CC BY 3.0 IGO. UNIDO Portal material is CC BY 4.0 unless otherwise stated. ILO datasets made available from 3 May 2023 are CC BY 4.0 unless otherwise stated, excluding restricted microdata. UNHCR Refugee Population Statistics datasets are CC BY 4.0 except where otherwise indicated. UNdata permits copying/distribution with UNdata citation.

TRUTH: designation is not ecosystem health; point is not boundary; occurrence/count is not abundance; country average is not local condition; mixed vintages remain visible; missing/source failure is not zero; vocabulary is not empirical evidence; trade data is not firm-level provenance.

PHYSICAL STATE: the GREEN DATA source family now has 8 registered source records, 19 registered dataset records and 15 disabled ingest feeds in the existing planetbrain technical schema: UNESCO P0 (1 source / 6 datasets / 6 disabled feeds), the additional qualified UN family (5 / 11 / 9), and direct World Bank WDI + Wikidata country identity (2 / 2 / 0). No bulk claims/observations were created.

FINAL P0 FUNCTIONAL QA: GitHub Actions run 38549826114 on functional base 8dc330f67b6fd5488d8099b9b7c1a7c0be93c03d PASS — live upstream endpoint/schema probes, shared-data contracts, typecheck, production build, local preview, and curated ATLAS browser proof across Chromium desktop/mobile and WebKit desktop/mobile, including source-failure ≠ zero. The later source-control/doc commits only record this evidence and source state; they do not change the tested adapters or map rendering.
