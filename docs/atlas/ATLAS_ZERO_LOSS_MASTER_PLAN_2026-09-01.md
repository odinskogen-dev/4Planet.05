# 4PLANET ATLAS — ZERO LOSS MASTER PLAN

Date: 2026-09-01  
Canonical receiver: `king/test` → `/atlas`  
Recovery branch: `recovery/atlas-leading-20260901`  
Recovery PR: #217  
Control issue: #144

## Law

**ZERO LOSS. Newest-wins is forbidden.** Before ATLAS is declared recovered, every materially relevant historical repository, branch, PR, sandbox and embedded donor must be dispositioned at feature level as one of:

- `ADOPT` — donor is better and is moved into canonical ATLAS;
- `SUPERSEDED_BY` — canonical ATLAS already has an equal-or-better implementation, with evidence;
- `DEFER_WITH_REASON` — valid product value, intentionally sequenced later, reason recorded;
- `BLOCKED_TRUTH_RIGHTS` — source/feature cannot honestly ship until access, rights or evidence is resolved.

ATLAS recovery may not close while a material donor remains unnamed or undispositioned. `orphan_count` must equal **0**. A route resolving is not recovery evidence. A newer commit is not winner evidence.

## Product north star recovered from early ATLAS canon

ATLAS is the spatial interface between 4PLANET BRAIN / Living Systems Intelligence and action. It must let a person move through:

`PLACE / ECOSYSTEM / SPECIES / PRESSURE → UNDERSTANDING → SOLUTIONS → ACTORS → MISSIONS / ACTION → PROOF`

The map is not the product by itself. The world is the interface; the shared context layer explains what is selected, where the information came from, why it matters, what can be done and what is still unknown.

## Donor universe and disposition

### Family A — earliest standalone ATLAS

| Donor | Material value found | Disposition |
|---|---|---|
| `4planet-atlas-v1` | Initial Atlas component/data/layer/intelligence-panel architecture; incomplete scaffold | `SUPERSEDED_BY` current MapLibre + shared Context. No code transplant. Preserve only architecture lineage. |
| `4PLANET-ATLAS-v2` | Canonical BRAIN → LSI → ATLAS → Mission → Impact → OS architecture; geographic nodes include ecosystems/species/threats/solutions/missions/partners/impact units/funding gaps | `ADOPT` product semantics into this master plan; current Context already covers many object classes, remaining ACTORS / IMPACT / CAPITAL context is a recovery gap below. |
| `4Planet-Atlas-v21` / v2.2 Lite | Performance lesson: heavy globe was replaced to stay stable; drag/zoom/layers/intelligence panel retained | `SUPERSEDED_BY` MapLibre for renderer; `ADOPT` stability/fallback/performance as release gate. |
| `4planet-atlas-v23-3d` | Rich Intelligence Panel: status/confidence, why-it-matters, related missions, Living Systems chain, sources/claims, partner status; 3D interaction | `ADOPT` semantics; current Shared Context supersedes most truth/context behaviour. Missing action/capital/actor slices remain explicit gaps. |
| `4PLANET-ATLAS-v2.4` + `4Planet-Atlas-Mobile` | MissionCard, ImpactUnitCard, FundingGapCard, EvidenceCard, PartnerProjectCard, LivingSystemsChain; mobile bottom sheets; `/embed`; explicit performance mode | `PARTIAL ADOPT`: current mobile Context sheet and source/evidence semantics supersede old UI. Recover **impact-unit + actor + funding-gap context** into the shared canonical context, not as old parallel cards. `/embed` and low-performance mode remain P2 `DEFER_WITH_REASON` unless current use-case requires them. |

### Family B — Atlas v28 → v36 product lineage

Historical V25/V31 plans prove the progression:

- v28: first live-data map registry; NASA/OBIS/GBIF/USGS/EONET/ISS; source credit; no-wrap/map robustness.
- v29: English place labels, dated satellite control, OBIS/GBIF semantics, honest event types.
- v30: Blue Marble default, MODIS Today separated, SST, light/dark, common names, no false universal LIVE claim.
- v31: MapLibre globe + Mercator, domain lenses, URL state, point/raster layers.
- v32: species search, legends, opacity, 2D/3D, HOME, SHARE, UTC.
- v33: common-name search repair, WoRMS enrichment, active fires, NDVI, sea ice, aerosol, precipitation, day/night, NEAR ME.
- v34: source failure → `UNAVAILABLE`, active/domain layer hierarchy, forest loss, coral heat stress, protected areas honestly planned.
- v35: all-life search ranking, iNaturalist photos, observation date/direct source records, WHAT IS HAPPENING HERE, ISOLATE, freshness, error boundary.
- v36: wrong-photo protection, sea-ice correction, biodiversity-density scale layer, further source honesty.

**Disposition:** `SUPERSEDED_BY / PRESENT CURRENT` for the core renderer and layer model. Current `src/earth/layers.ts` explicitly preserves the V36 layer model, and current `World.tsx` keeps the V36 MapLibre machinery while adding shared search/context/NOW/WATCH. No wholesale transplant.

Release condition: feature-level regression tests must keep these capabilities from silently disappearing.

### Family C — v37CX

Material value:

- selected-species state survives URL/share/camera changes;
- GBIF + iNaturalist + OBIS selected-species layers;
- My Atlas versioned local state;
- safer map/style lifecycle;
- structured source record detail;
- zoom-derived place context radius;
- active-layer ordering and richer share state.

Disposition:

- My Atlas saved map views: `ADOPTED / PRESENT CURRENT`.
- canonical species identity + cross-product return context: `SUPERSEDED_BY` current SPECIES ↔ ATLAS product context and shared entity URL state, but regression proof remains mandatory.
- source record detail/lifecycle: `PARTIAL PRESENT`; audit against v37 report before #144 close.
- separate saved-species/saved-place stores: `SUPERSEDED_BY` shared Follow/Watch rather than duplicating identity/state.

### Family D — ATLAS Data Lab, PR #72 / `sandbox/atlas-data-lab-20260819`

This donor contains the most important material value that had not reached TEST KING.

**Recovered into PR #217 now:**

- EMODnet Bathymetry;
- EMODnet Seabed Habitats 2025;
- EMODnet dissolved-oxygen climatology;
- EMODnet fishing-vessel density;
- semantic TIME controls where year/month changes the provider request;
- adaptive `GLOBAL → REGIONAL → LOCAL → STREET` cartography;
- automatic globe → Mercator local handoff with hysteresis;
- sharp vector labels/detail at local/street scale;
- Blue Marble capped at planetary/regional usefulness so it is never stretched into a pixelated street map;
- mobile layer-console interaction-plane fix.

**Still to disposition before #144 closes:**

- machine-readable source registry/lifecycle states;
- probe → layer-contract → map-green evidence separation;
- exact Data Lab source-health harness worth retaining in canonical operations;
- Artsdatabanken/Artskart current public adapter and sensitive-species handling;
- Kartverket Stedsnavn enrichment where it beats current vector labels/search;
- Vann-Nett / official water-body context;
- selected public ICES services;
- NASA FIRMS record-level detections after server-side MAP_KEY exists;
- Global Fishing Watch only after auth/terms rights are explicitly green;
- Protected Planet only after exact rights/access gate;
- OpenAQ / Copernicus Marine only if product value and rights justify complexity.

## Critical map-quality release law

**Pixelated local ATLAS is a release blocker.** Planetary satellite imagery may provide the global/regional experience, but at local/street zoom the sharp vector map must own spatial detail. Blue Marble must not be over-zoomed. Local place/street names must visibly render in browser proof.

Required bands:

- `GLOBAL` — globe + planetary imagery / global signals;
- `REGIONAL` — geographic context + labels;
- `LOCAL` — sharp vector settlements/roads/boundaries/labels;
- `STREET` — vector street/building/place detail where provider coverage supports it.

Current recovered policy in PR #217: labels begin around z4.6; automatic local Mercator begins around z6.25 and releases around z5.35; street band starts z13; Blue Marble max z6.6.

## Zero-loss source truth law

- `PROBE_GREEN ≠ LAYER_CONTRACT_GREEN ≠ MAP_GREEN`.
- source/API failure must never render as zero records.
- occurrence ≠ abundance/range/live position.
- vessel density/apparent fishing effort ≠ catch/legality/ecological impact.
- climatology ≠ current measurement.
- thermal anomaly ≠ automatically wildfire.
- coral heat stress ≠ observed bleaching.
- predictive habitat classification ≠ direct field observation/current condition.
- auth/rights-gated sources are not LIVE.

## Remaining product-semantic recovery

The early ATLAS plan contained a valuable action bridge that must not disappear merely because the map/data engine became better.

### P1 — Shared Context must recover the full action chain

For a selected place/ecosystem/species/pressure, canonical Context should be able to expose, when real linked data exists:

1. Living Systems / why it matters;
2. pressure(s);
3. solution pathway(s);
4. actor(s) / partner status;
5. mission(s);
6. impact/action unit(s), with delivery/proof status;
7. capital/funding gap or opportunity, only when grounded;
8. sources / evidence / review state.

Do **not** resurrect the old v2.4 card system as a second architecture. Map these objects to the current shared BRAIN/Actor Graph/Impact models and render them through one Context grammar.

### P1 — Source-control recovery

Promote the Data Lab registry principles into canonical ATLAS operations so every source has authority, endpoint/protocol, temporal semantics, rights/auth, attribution, rate-limit/cache rules, failure state, last check, adapter state and map state.

### P2 — deliberately deferred historical features

- `/embed`: valuable for external embedding but not required to repair canonical `/atlas`; retain as product backlog, not orphan.
- manual LOW performance mode: MapLibre/current WebGL handling is a different renderer; prefer measured adaptive degradation before reintroducing a user control.
- old standalone globe auto-rotation: superseded; ATLAS is an instrument, not a decorative spinning globe.
- old static node datasets/claims: do not transplant; current BRAIN/source-aware models own truth.

## Promotion gates

No PR #217 → TEST KING promotion until:

1. typecheck/build/convergence green on exact head;
2. recovered Data Lab layers appear in the canonical layer console;
3. TIME changes actual provider requests;
4. desktop and mobile browser proof;
5. street/local zoom proof shows vector detail and visible names;
6. Blue Marble cannot visibly pixel-stretch into street zoom;
7. expanded mobile Layers cannot be covered by EARTH/NOW/WATCH/My Atlas controls;
8. no truth/rights regression;
9. exact tested SHA recorded.

Issue #144 remains open after PR #217. Close only after every donor family and every material feature above has a recorded disposition and `orphan_count = 0`.
