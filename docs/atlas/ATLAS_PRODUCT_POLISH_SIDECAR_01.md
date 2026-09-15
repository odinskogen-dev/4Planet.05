# ATLAS PRODUCT POLISH SIDECAR 01

Status: ACTIVE TEST CANDIDATE / NOT LIVE / NOT FOUNDER GOLD

Authority: Issue #244 under ATLAS recovery Issue #144. `king/test` remains the sole integration receiver. PUBLIC CORE 01 / PR #243 owns `release/live-king-20260901` and all final release classification/deploy decisions.

## Collision boundary

This sidecar may change ATLAS-specific runtime, controls, data/layer/time interactions, context/source surfaces and ATLAS-specific tests. It must not write to the LIVE release receiver or own global shell/home/nav/footer/site-wide release work.

## Starting state

Exact start: `king/test` `ead7715a5d426058ea9107dbbe3d3ab3ce55528c`.

Already recovered before this sidecar: PR #223 / ATLAS Convergence Gold 02, including EMODnet bathymetry, seabed habitats, dissolved-oxygen climatology, fishing-vessel density, semantic time, adaptive zoom, species-search aliases/ranking/cache and mobile collision repair.

## Iteration 01 — human/product audit findings

1. Species search is materially better than before, but ATLAS search still behaves primarily as GBIF + a small seeded Place/Living Systems registry. Natural intent such as `wildfires`, `earthquakes`, `forest loss` and `emissions` does not yet route directly into existing ATLAS data layers. This remains open for a bounded search iteration.
2. Shareable state already preserves camera, active layers, projection, lens and canonical entity, but recovered TIME selections were stored only in localStorage. A recipient could therefore open the same link and see a different time slice. This violates DISCOVER → SHARE → SAME DISCOVERY.
3. `MY ATLAS` exposed implementation language such as `RECOVERED FROM ATLAS V37CX`, `VERSIONED LOCAL STORAGE` and `MALFORMED STATE FAILS CLOSED` to ordinary users. This is control language, not product copy.
4. Current TIME month controls expose `01..12` rather than human month labels.
5. Priority human place language was incomplete: `Amazonia` did not resolve the existing Amazon Basin entry; Norway, Oslofjord and Bay of Biscay did not exist as searchable Place entries in the current small registry.
6. SHARE exists in the legacy layer console, but discovery sharing is too hidden for a product expected to spread through useful discoveries.
7. TIME and saved-view touch controls were below a consistent 44 px mobile target.
8. The no-WebGL fallback exposed product/internal language rather than stating the failure and continuation path as directly as possible.

## Iteration 02 — search improvements completed without new search architecture

- existing Place registry expanded with Norway, Oslofjord and Bay of Biscay as explicit BOUNDING_BOX navigation extents;
- Amazon Basin now resolves `Amazon`, `Amazonia` and `Amazon Rainforest` aliases;
- exact-name place matches rank above partial matches;
- Bay/Oslofjord/Norway copy explicitly states that navigation extents are not ecological/political boundary datasets, migration tracks or complete condition assessments;
- regression coverage added for Norway, Oslofjord, Bay of Biscay and Amazonia search.

Still open: natural data-layer intent (`wildfires`, `earthquakes`, `forest loss`, `emissions`) needs bounded integration into the ONE existing ATLAS search surface. Do not solve this with a second search UI or truth store.

## Iteration 03/04 — exploration + discovery/share improvements completed

- shareable URL state for recovered ATLAS time axes via `atlasTime`;
- strict allowlist validation against existing time-axis options;
- deep-link restore applies the selected provider request once the relevant map source exists;
- camera move/idle URL rewrites retain the selected TIME state rather than silently deleting it;
- invalid/malformed URL time values fail closed to valid stored/default state;
- month buttons render human month names while retaining provider values;
- `MY ATLAS` now exposes `SHARE THIS VIEW`, using the native share sheet when supported and clipboard fallback otherwise;
- existing save/reopen behaviour remains local-device only;
- browser regression proof covers TIME → camera move → shareable URL → deep-link restoration.

## Iteration 05 — source/data value discipline

No new external provider was added. The sidecar keeps the recovered high-value source set already present in canonical ATLAS and concentrates on making current source/time/place state understandable and reproducible before adding breadth.

Existing truth boundaries remain intact, including:
- GBIF/OBIS observations ≠ abundance/range/live position;
- NOAA coral heat stress ≠ observed bleaching;
- fishing-vessel density ≠ live fishing/catch/legality/impact;
- dissolved oxygen climatology ≠ current oxygen condition;
- source failure ≠ zero records.

## Iteration 06/07 — mobile, failure state and human-first copy

- TIME controls raised to a minimum 44 px touch target and `touch-action: manipulation`;
- MY ATLAS primary/save/reopen/delete controls raised to the same mobile touch target;
- `MY ATLAS` copy now says what the feature does and where data stays, instead of exposing recovery/storage implementation language;
- TIME semantics use human-facing `YEAR` / `MONTHLY CLIMATOLOGY` labels;
- no-WebGL ATLAS fallback rewritten to state the problem, why no fake map is shown, and where the user can continue;
- existing mobile collision ownership remains protected by the prior ATLAS recovery tests.

## Truth and architecture preservation

No new data source, map engine, identity model, global shell, route architecture, release receiver or second Place/search system was created. Existing Place storage was extended in place. Existing provider semantics and source limitations remain unchanged.

## Current candidate

PR #246 `ATLAS PRODUCT POLISH SIDECAR 01 — shareable time + human-first saved views` targets `king/test` only. It remains a draft until exact-head ATLAS Zero Loss + ONE INTERFACE + Chromium/WebKit/mobile evidence completes.

## Remaining product gap after this pass

The largest bounded search gap remains natural layer/signal intent: `wildfires`, `earthquakes`, `forest loss`, `emissions` should resolve through the ONE existing ATLAS search surface to the already-existing canonical data/layers without inventing a new search architecture. This requires a controlled edit to the main World search composition and should be done only with exact-file collision awareness against ongoing PUBLIC CORE sync work.
