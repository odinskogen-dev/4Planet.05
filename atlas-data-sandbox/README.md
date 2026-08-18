# 4PLANET ATLAS DATA SANDBOX

Status: INTERNAL DATA-INTEGRATION LAB. NOT PRODUCTION. NOT A SECOND ATLAS.

Baseline: `3364df8b5989582fbcbc31d1ff102ca5bb852954`
Branch: `sandbox/atlas-data-lab-20260819`
Control issue: `#71`

## Purpose

Increase the information value of ATLAS by admitting authoritative planetary data sources one by one, proving each source before it is allowed near the production interface.

This branch is a copy of the verified production lineage. It deliberately preserves the existing MapLibre ATLAS, `src/planet` identity/provenance contracts, source semantics and Product Context. The sandbox is an experimentation surface around that architecture, not a replacement architecture.

## Source lifecycle

`DISCOVERED → TERMS_CHECKED → ENDPOINT_VERIFIED → PROBED → ADAPTER_GREEN → MAP_GREEN → TRUTH_RIGHTS_GREEN → PROMOTION_CANDIDATE`

Explicit blockers:

`AUTH_REQUIRED · RIGHTS_GATED · RATE_LIMITED · SOURCE_DOWN · UNSUITABLE`

## Promotion rule

A source is not integrated because a label exists or an HTTP request returns 200. Promotion requires:

- useful real data or real tiles;
- stable source identity and direct record identity where the provider exposes one;
- observed/published/retrieved time kept distinct;
- licence, attribution and commercial-use boundary recorded;
- sensitive-location rules where relevant;
- bounded requests, pagination/tiling/clustering and failure handling;
- source failure never rendered as zero;
- no record→population/range/live-position inference;
- acceptable desktop/mobile ATLAS behaviour;
- a reproducible probe/adaptor evidence record.

## First execution slice

1. Machine-readable source catalogue: `sources.json`.
2. Network probe harness: `scripts/atlas-data-sandbox/probe.mjs`.
3. CI probe workflow: `.github/workflows/atlas-data-sandbox.yml`.
4. Benchmark the existing no-key source spine.
5. Probe new low-friction candidates, beginning with EMODnet OGC services.
6. Only after probe success: wire a source-specific adapter into the shared ATLAS source/connector seam.

## Initial priority

### A — Existing baseline to preserve and benchmark
NASA GIBS; GBIF; OBIS; NASA EONET; USGS; NOAA Coral Reef Watch; Global Forest Watch; iNaturalist reference media; WoRMS.

### B — Open / low-friction expansion
EMODnet Bathymetry; EMODnet Seabed Habitats; EMODnet Human Activities; EMODnet Chemistry; Climate TRACE; Artsdatabanken/Artskart; Kartverket Stedsnavn; Norwegian water-body sources; selected public ICES services.

### C — Credential or rights gates
NASA FIRMS; OpenAQ; Global Fishing Watch; Copernicus Marine; Protected Planet; other services whose exact public/commercial rights or authentication path is unresolved.

## Safety

Never commit API keys, tokens or account credentials. Credential-gated sources remain disabled until a server-side secret path and intended-use review exist. Protected Planet remains rights-gated for commercial use. Global Fishing Watch data must never be presented as proof of illegal fishing. FIRMS thermal anomalies must never be relabelled as confirmed wildfire without supporting evidence.
