# ATLAS HUMAN GOLD OMEGA — BEST-EVER PRODUCT CONVERGENCE

STATUS: BOUNDED PR CANDIDATE / GOLD ONLY AFTER EXACT DEPLOYED GATE

AUTHORITY: `king/test` remains the only HEIR / moving convergence line. This work remains on `work/atlas-zero-loss-gold-convergence-01` / PR #263 until Founder judgement. No LIVE/main promotion is authorised here.

## NORTH STAR

The candidate is judged on:

**HUMAN USEFULNESS × VISUAL QUALITY × FUNCTIONAL DEPTH × TRUTH × RELIABILITY × MOBILE × SPEED**

No new ATLAS product, map engine, search surface, truth store or permanent control system is introduced.

## HUMAN CONTRACT

A first-time user should be able to:

1. see a living, data-rich planet rather than an empty GIS canvas;
2. search in ordinary language for a species, place or planetary signal;
3. move from global → regional → local → street without stretching planetary imagery into a local map;
4. combine layers while preserving legends, source semantics and camera control;
5. inspect a selected source record and answer:
   - WHAT IS THIS?
   - WHERE?
   - WHEN?
   - SOURCE?
   - WHAT DO WE KNOW?
   - WHAT DON'T WE KNOW?
   - WHAT CAN I EXPLORE NEXT?
6. move ATLAS → SPECIES → ATLAS without losing meaningful context;
7. use the same core product on 390×844 and 430×932 mobile surfaces.

## OMEGA CHANGES

### 1. FIRMS / VIIRS record depth

The existing server-side `functions/api/firms.ts` is retained as the bounded, fail-closed record adapter. OMEGA connects it to the existing ACTIVE FIRES journey only at regional/local zoom. The existing global NASA GIBS fire layer remains the stable planetary context.

Semantics remain explicit:

- a FIRMS row is a satellite thermal-anomaly detection;
- it is not automatically wildfire, burned area, cause, impact or ground truth;
- provider failure is not zero;
- an empty result is not proof of no fire;
- last-good data may remain only when visibly marked STALE.

### 2. iNaturalist observation depth

The existing read-only `functions/api/inaturalist.ts` is extended so ATLAS can resolve an exact scientific name into iNaturalist taxon identity before requesting observations. Fuzzy taxon matches are not silently promoted.

Public semantics remain:

- observations are occurrences, not range, abundance, population trend or live tracking;
- only provider-supplied public coordinates are used;
- obscured/private locations are never reconstructed;
- observation and photo rights remain distinct.

The ATLAS sidecar activates only after the existing GBIF taxon identity is selected, preserving one canonical user journey and no duplicate species search.

### 3. Search Gold

The one existing ATLAS search keeps place/species/data-layer intent in one surface. OMEGA adds conservative typo tolerance and ordinary aliases without creating a parallel search engine. Example: `earhquakes` resolves EARTHQUAKES; `methane`, `power plants` and `greenhouse gases` resolve Climate TRACE.

### 4. Map Gold

Blue Marble is reasserted as global/regional imagery with a hard local zoom handoff even when the layer mounts after the initial base-style event. Local and street zoom remain sharp vector cartography. Dark/light swaps preserve ATLAS overlays and camera state.

### 5. Selected-record Human Gold

Record-level FIRMS and iNaturalist depth uses one compact progressive inspector. Source detail does not dominate the first read, but it is directly available when a person selects a real record.

## ZERO-LOSS DONOR MATRIX

| Historical branch / capability | Disposition | Reason |
|---|---|---|
| `recovery/testking-atlas` | ALREADY PRESENT / SUPERSEDED BY BETTER IMPLEMENTATION | Core World/Context/layer values are retained; current candidate adds stronger recovery, source and human-use sidecars. |
| `recovery/atlas-zero-loss-01` | ALREADY PRESENT / SUPERSEDED BY BETTER IMPLEMENTATION | Same recovered V36 core remains; current candidate carries later bounded improvements. |
| `recovery/atlas-leading-20260901` | ADOPT / ALREADY PRESENT | Leading source/layer, TIME, local cartography and interaction values already converged into PR #263. |
| `sandbox/atlas-data-lab-20260819` | ADOPT / SUPERSEDED BY BETTER IMPLEMENTATION | Adaptive global→local cartography and useful data-lab findings are retained through current Zoom Stack and recovered extensions; the sandbox is not revived. |
| `work/atlas-convergence-gold-02` | ALREADY PRESENT / SUPERSEDED BY BETTER IMPLEMENTATION | Its useful convergence primitives are already represented in the current candidate. |
| `work/atlas-product-polish-01` | PARTIAL ADOPT / REJECT WITH REASON | Basemap/place-name/useful bounded repairs are retained. The presentation-only context tagging sidecar is not restored because it adds no unique data or human job and would reintroduce stale polish logic over the Founder-selected surface. |
| `archive/atlas-product-polish-a0ea773-20260903` | ALREADY PRESENT / REJECT WITH REASON | Frozen archive of the same polish lineage; no unique product value needs reactivation. |
| `release/home-atlas-showcase-20260820` | ALREADY PRESENT | Its ATLAS core is older; current World is the same or stronger. Home showcase work is not a superior ATLAS engine donor. |
| `release/species-gold-standard-slice06-atlas-modes-20260818` | ALREADY PRESENT | Shared World/Context journey values are retained and current ATLAS→SPECIES return proof is stronger. |
| `sandbox/s4piens-food-human-systems-atlas` | DEFER WITH REASON / ALREADY PRESENT | Human-system experiments remain sandbox evidence; current S4PIENS planetary layers already cover the validated public ATLAS job without pulling an adjacent experiment into Gold. |
| `build/p17-actor-atlas-private-beta` | DEFER WITH REASON | `ActorAtlasOverlay` explicitly declares PRIVATE BETA / NOT PUBLIC and adds a separate actor-mode job. It remains preserved for Actor/Partner work rather than being silently promoted into public ATLAS Gold. |
| FIRMS adapter in current repository | ADOPT | Existing superior record-level thermal-detection capability is connected to the existing fire journey with truth-safe degradation. |
| iNaturalist adapter in current repository | ADOPT | Existing superior observation capability is connected to the selected taxon journey with exact-name resolution and public-coordinate protections. |

## FINAL ZERO-LOSS ARCHAEOLOGY VERDICT

All ATLAS-named historical branches currently discoverable in the repository have an explicit disposition above. No inspected historical branch contains a known superior public ATLAS value that remains both unique and undispositioned.

This statement is an archaeology verdict, not a release verdict. GOLD still requires exact deployed runtime evidence below.

## EXACT DEPLOYED GOLD GATE

The gate must bind one immutable Cloudflare Pages preview to the exact PR head SHA and pass:

- locked install;
- typecheck;
- production build;
- Chromium desktop 1440;
- Chromium 390×844;
- Chromium 430×932;
- WebKit desktop;
- WebKit 390×844;
- WebKit 430×932;
- recovered capability suite;
- map interactivity suite;
- Founder proof suite;
- OMEGA source/truth/human proof suite;
- real deployed iNaturalist exact-name + observation path;
- FIRMS truth-safe state with existing global fire fallback;
- requested immutable screenshots.

The compact evidence artifact must contain:

1. exact SHA;
2. immutable deployed URL;
3. desktop global screenshot;
4. desktop close-zoom dark screenshot;
5. iPhone 390 screenshot;
6. populated multi-layer screenshot;
7. search screenshot;
8. selected-record screenshot;
9. machine-readable final gate facts.

GOLD may be declared only after all executed CI/runtime gates are green on the exact deployed SHA. This document does not authorise a merge to `king/test`, LIVE or main.
