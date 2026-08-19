# 4PLANET ATLAS DATA LAB — ITERATIVE BUILD PLAN V2

Status: sandbox-only execution plan. This is not a second ATLAS architecture and does not authorise production merge.

## Product target

One canonical ATLAS engine that remains visually planetary at global scale, becomes navigation-grade and sharp at regional/local/street scale, preserves truthful scientific overlays, exposes authoritative place identity, scales to many data sources, supports correct temporal semantics, and opens coherent journeys into SPECIES, Living Systems, pressures, missions and solutions.

Core rule: **planetary imagery is context, not a street basemap. Vector cartography owns local detail.**

## Round 01 — Adaptive cartography / zoom stack

Build one continuous multiscale map experience on the existing MapLibre instance:

- GLOBAL — globe + planetary imagery/data;
- REGIONAL — geographic context and place labels;
- LOCAL — vector roads, boundaries, settlements and labels;
- STREET — sharp vector detail and readable place/street names;
- automatically stop stretching Blue Marble beyond its useful scale;
- preserve pan/zoom/rotate and active data overlays;
- do not create a second map or switch to an unrelated application.

Gate: desktop + 390 px mobile browser proof must show real rendered names at street zoom, vector local detail, correct globe↔local projection handoff and return to globe on zoom-out.

## Round 02 — Place identity / names

Treat names as data, not decoration.

- keep global basemap labels available at relevant zoom bands;
- verify city, neighbourhood, road and geographic-feature hierarchy;
- add authoritative Norwegian place identity/search from Kartverket SSR as an enrichment over the global base, not a replacement global map;
- preserve official spelling/language/status metadata when SSR is used;
- connect search and map movement without locking the camera;
- prepare viewport/nearby-place query seams so place context can later answer “what is here?”.

Gate: actual rendered labels and place-search results are tested; failed name sources never become blank/false no-place states.

## Round 03 — Layer reliability + scalable registry

Repair before expanding.

- every admitted layer has source authority, product, units, spatial coverage, time semantics, rights, confidence/limitations, runtime status and failure state;
- PROBE_GREEN ≠ LAYER_CONTRACT_GREEN ≠ MAP_GREEN;
- source failure ≠ zero/no records;
- use same-origin bounded adapters where browser CORS/provider behaviour requires it;
- add new sources only through the shared layer/source machine;
- keep data layers legible over local cartography and respect useful zoom ranges.

Gate: exact product request + desktop/mobile browser + deployed preview proof before MAP_GREEN.

## Round 04 — TIME / change engine

Extend the existing semantic TIME engine rather than building one generic slider.

Supported axis classes:

- YEAR;
- DATE;
- MONTH_CLIMATOLOGY;
- LATEST_AVAILABLE / near-real-time;
- later bounded RANGE where source semantics justify it.

Priority expansion after existing fishing-year and oxygen-climatology axes: NASA imagery/date, SST/date, sea ice/date, precipitation/date, thermal anomalies/recent window and Climate TRACE annual history where the source contract supports it.

Gate: changing TIME must change the actual provider request and visible data; UI must state whether the view is historical, climatological, snapshot or near-real-time.

## Round 05 — Object journeys + performance

Convert map layers into understanding without turning ATLAS into a GIS dashboard.

Target journey grammar:

`MAP → PLACE / OBSERVATION / FEATURE → SPECIES → LIVING SYSTEM → PRESSURE → MISSION / RESPONSE → SOLUTION`

- canonical IDs and return context across products;
- viewport-first queries, clustering and zoom-dependent detail;
- no whole-planet record downloads for local questions;
- scenes remain curated reading states, not maximal layer stacks;
- one focal variable by default; controlled comparison on demand.

Gate: representative end-to-end journeys work on desktop/mobile without camera lock, source/truth loss or unacceptable map performance.

## Iteration loop

Each material round runs the same loop:

`BUILD → TYPECHECK/CONTRACTS → SOURCE PRODUCT PROBE → LOCAL BROWSER QA → DEPLOYED CLOUDFLARE QA → VISUAL REVIEW → FIX → RE-RUN`

A failing gate causes another repair iteration; it does not get relabelled as success. Production remains untouched until a later founder promotion decision.
