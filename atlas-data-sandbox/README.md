# 4PLANET ATLAS DATA LAB

Status: INTERNAL DATA-INTEGRATION LAB. NOT PRODUCTION. NOT A SECOND ATLAS.

Baseline: `3364df8b5989582fbcbc31d1ff102ca5bb852954`
Branch: `sandbox/atlas-data-lab-20260819`
Control issue: `#71`
Draft control PR: `#72` — DO NOT MERGE
Preview route: `/atlas-data-sandbox`

## Product rule

**ONE ATLAS ENGINE. MORE VERIFIED DATA. CONTROLLED DEPTH.**

The sandbox route now reuses the canonical `PublicWorld → World` runtime. It therefore keeps the real ATLAS globe, search, layer console, ON/OFF state, opacity, provenance drawers, PLANET/OCE4N/E4RTH/S4PIENS domain modes, EARTH/NOW/WATCH lenses, shared context and existing SPECIES / Living Systems intelligence.

Sandbox data is injected as extensions into the existing layer registry before World mounts. The public/production branch is not mutated.

## Why this matters

The target is not a GIS dashboard with hundreds of toggles. ATLAS must be able to absorb large amounts of planetary information while remaining understandable to a normal human.

The scaling model is therefore:

`SOURCE → VERIFIED PRODUCT → LAYER DESCRIPTOR → DOMAIN → ROLE → TIME SEMANTICS → TRUTH BOUNDARY → JOURNEY HOOK → SCENE → ATLAS`

A new data source should be admitted once, described once and then become reusable across ATLAS, SPECIES, Living Systems, Missions and future place/time views where the semantics support it.

## Domain modes, lenses and scenes are different things

Do not overload the existing modes.

- **DOMAIN MODE** — PLANET / OCE4N / E4RTH / S4PIENS. Answers *which planetary domain are we looking through?*
- **LENS** — EARTH / NOW / WATCH. Answers *what kind of interpretation or time relationship are we asking for?*
- **SCENE** — a bounded reusable layer preset. Answers *which verified stack helps answer this particular question?*

First sandbox scenes:

- `OCEAN_FOUNDATION` — Blue Marble + bathymetry.
- `OCEAN_HABITAT` — foundation + predictive seabed habitats.
- `OCEAN_CONDITION` — foundation + habitat + dissolved-oxygen climatology.
- `OCEAN_PRESSURE` — foundation + habitat + condition + historical fishing-vessel density.

Founder-test scenes can be opened with `/atlas-data-sandbox?scene=<SCENE_ID>`. Scene state resolves into the same canonical ATLAS URL/layer machinery; it is not a second renderer.

## Current sandbox extensions

### 1 — EMODnet Bathymetry
Mean seabed depth / product coverage. Static physical context, not ecological condition.

### 2 — EMODnet Seabed Habitats / EUSeaMap 2025
Broad-scale predictive habitat classification. Not direct field observation or current ecological condition.

### 3 — EMODnet Chemistry dissolved oxygen climatology
Surface dissolved-oxygen concentration monthly climatology, currently bounded to month 08 and provider relative-error mask 0.5. Units µmol/L. This is **climatology**, not current/live oxygen status and not proof of hypoxia at a specific place/time. Product-specific rights/attribution still require final review before any production promotion.

### 4 — EMODnet Human Activities fishing-vessel density 2023
Historical AIS-derived vessel-density context. Not live fishing, catch, legality, illegal-fishing evidence or ecological impact.

## Source lifecycle

`DISCOVERED → TERMS_CHECKED → ENDPOINT_VERIFIED → PROBED → ADAPTER_GREEN → MAP_GREEN → TRUTH_RIGHTS_GREEN → PROMOTION_CANDIDATE`

Explicit blockers:

`AUTH_REQUIRED · RIGHTS_GATED · RATE_LIMITED · SOURCE_DOWN · UNSUITABLE`

`PROBE_GREEN` only means a bounded endpoint/contract check succeeded. It is not map acceptance. `MAP_GREEN` is still sandbox-only and does not authorise production promotion.

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
- a reproducible probe/adaptor evidence record;
- successful regression inside the **real ATLAS runtime**, not only a diagnostic map.

## Scale architecture

`src/sandbox/atlasDataSources.ts`
: transport/source-product descriptors and exact WMS request contracts.

`src/sandbox/atlasLabRegistry.ts`
: product semantics: domain, role, stacking, time meaning, journey hooks and reusable scenes.

`src/sandbox/atlasLabScenes.ts`
: deterministic scene → canonical ATLAS URL-state resolver.

`src/sandbox/atlasLabCompatibility.ts`
: bounded sandbox hardening for inherited ATLAS metadata. It currently normalises legacy legend colour declarations without changing their scientific meaning or colours.

`tests/e2e/atlas-data-sandbox.spec.ts`
: desktop + 390px browser proof that the extensions actually run in canonical ATLAS, use the exact provider style/time/depth request, and preserve legacy interface capability.

## Source universe

### Existing baseline to preserve and benchmark
NASA GIBS; GBIF; OBIS; NASA EONET; USGS; NOAA Coral Reef Watch; Global Forest Watch; iNaturalist reference media; WoRMS.

### Open / low-friction expansion
EMODnet Bathymetry; Seabed Habitats; Human Activities; Chemistry; Physics; Climate TRACE; Artsdatabanken/Artskart; Kartverket; Norwegian water-body sources; selected public ICES services; MET Norway ocean products; GEBCO; Argo; NOAA CoastWatch; SoilGrids; ESA WorldCover; JRC Global Surface Water; GloBI.

### Credential or rights gates
NASA FIRMS; OpenAQ where required; Global Fishing Watch; Copernicus Marine; Protected Planet; other services whose exact public/commercial rights or authentication path is unresolved.

## Safety

Never commit API keys, tokens or account credentials. Credential-gated sources remain disabled until a server-side secret path and intended-use review exist. Protected Planet remains rights-gated for commercial use. Global Fishing Watch data must never be presented as proof of illegal fishing. FIRMS thermal anomalies must never be relabelled as confirmed wildfire without supporting evidence.
