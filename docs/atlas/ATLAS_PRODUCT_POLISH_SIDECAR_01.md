# ATLAS PRODUCT POLISH SIDECAR 01

Status: ACTIVE TEST CANDIDATE / NOT LIVE / NOT FOUNDER GOLD

Authority: Issue #244 under ATLAS recovery Issue #144. `king/test` remains the sole integration receiver. PUBLIC CORE 01 / PR #243 owns `release/live-king-20260901` and all final release classification/deploy decisions.

## Collision boundary

This sidecar may change ATLAS-specific runtime, controls, data/layer/time interactions, context/source surfaces and ATLAS-specific tests. It must not write to the LIVE release receiver or own global shell/home/nav/footer/site-wide release work.

## Starting state

Exact start: `king/test` `ead7715a5d426058ea9107dbbe3d3ab3ce55528c`.

Already recovered before this sidecar: PR #223 / ATLAS Convergence Gold 02, including EMODnet bathymetry, seabed habitats, dissolved-oxygen climatology, fishing-vessel density, semantic time, adaptive zoom, species-search aliases/ranking/cache and mobile collision repair.

## Iteration 01 — audit findings

1. Species search is materially better than before, but ATLAS search still behaves primarily as GBIF + a small seeded Place/Living Systems registry. Natural intent such as `wildfires`, `earthquakes`, `forest loss` and `emissions` does not yet route directly into existing ATLAS data layers. This remains open for a bounded search iteration.
2. Shareable state already preserves camera, active layers, projection, lens and canonical entity, but recovered TIME selections were stored only in localStorage. A recipient could therefore open the same link and see a different time slice. This violates DISCOVER → SHARE → SAME DISCOVERY.
3. `MY ATLAS` exposed implementation language such as `RECOVERED FROM ATLAS V37CX`, `VERSIONED LOCAL STORAGE` and `MALFORMED STATE FAILS CLOSED` to ordinary users. This is control language, not product copy.
4. Current TIME month controls expose `01..12` rather than human month labels.

## Implemented in first bounded pass

- shareable URL state for recovered ATLAS time axes via `atlasTime`;
- strict allowlist validation against existing time-axis options;
- deep-link restore applies the selected provider request once the relevant map source exists;
- invalid/malformed URL time values fail closed to valid stored/default state;
- month buttons render human month names while retaining provider values;
- MY ATLAS copy rewritten for ordinary users, with explicit local-device/privacy meaning;
- browser regression proof added for time deep-link roundtrip and human saved-view copy.

## Truth and architecture preservation

No new data source, map engine, place registry, identity model, global shell, route architecture or release receiver was created. Existing provider semantics and source limitations remain unchanged.

## Next product iteration

Bounded layer-intent search using the existing canonical `LAYERS` registry, without a second search/data truth store. Then human exploration/source-context review and failure/perceived-performance pass.
