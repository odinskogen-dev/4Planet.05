# 4PLANET_ V40 — ONE WORLD INTERFACE CONTINUITY

## V40 PRODUCT EXPERIMENT — CORRECTED DELIVERY

**Not** verified. **Not** mainline. **Not** canon. **Not** V41. GPT audits next;
Odin makes the final judgement.

- **Branch:** `v40-one-world-interface-continuity`
- **Base:** V39 (`v39.0.0`), git baseline `a73a879`
- **Package version:** `40.0.0-experiment`
- **Correction base:** the delivered `v39.1` archive (not a restart)

### Honest status of the delivery, up front

This is a build sandbox with **no WebGL and no browser**. So everything that is
**code** was done and verified to compile/build; everything that requires **running
the map in a real browser** (screenshots, video, executing the behavioural tests,
a preview URL) is **written and wired but can only be produced on a deploy**. I have
not faked any of it. Where an item needs a browser, it says so and tells you exactly
how to produce it.

---

## P0 — MAP MUST REMAIN INTERACTIVE WITH CONTEXT OPEN

**Static reproduction / audit (couldn't run WebGL here):** no full-screen DOM overlay
exists in the CSS (`.search-wrap` is a 460px centred bar; `.ctx` is a right-side panel;
the lens/focus visuals are MapLibre *data* layers, not DOM); no interaction was disabled
in the constructor; and `openPlace` fits the camera once and does **not** re-fit after its
`await`. The highest-probability causes were therefore (a) a missing `map.resize()` across
the context layout change and (b) an async camera settle racing the user. I applied the
**entire** enumerated audit list so that whichever specific cause it is, it is covered:

- **Every interaction explicitly enabled** in the constructor: `interactive`, `dragPan`,
  `dragRotate`, `scrollZoom`, `boxZoom`, `doubleClickZoom`, `touchZoomRotate`, `touchPitch`,
  `keyboard`, `trackResize` — all `true`. No default can silently drop.
- **`map.resize()`** is now called (via `requestAnimationFrame`) whenever context or lens
  layout changes — the classic "dead map after an overlay opens" fix.
- **Camera ownership guard:** the moment the user starts a `dragstart`/`zoomstart`/
  `rotatestart`/`pitchstart`, a `userMoved` ref flips true. A Place focuses the camera
  **once** on open (and resets the flag); no async response fits or resets the camera after
  that. `openPlace`'s async life response paints points but never moves the camera.
- **RECENTER / FOCUS SELECTED control** added (visible when a located context is open) —
  the camera is never *locked* to context; this puts it back on demand instead.

### Behavioural acceptance test (real, not a string check)

`tests/e2e/map-interactivity.spec.ts` (Playwright) drives a real browser and asserts real
camera state via the exposed `window.__4planet_map`:

1–12 of the required flow: load → search Oslo → open Place → record center → drag >200px →
assert center changed → wheel-zoom → assert zoom changed → close → assert camera preserved →
reopen → assert focus-once + still movable. Plus a **mobile** viewport (390px, bottom sheet
open, uncovered strip still pans) and a **zoom-ceiling ≥ 20** assertion.

**Execution is deploy-gated** (needs WebGL). Run:
```
npm run build && npm run preview        # serves dist on :4173
npx playwright install chromium
BASE_URL=http://localhost:4173 npm run test:e2e
```
or point `BASE_URL` at the Cloudflare preview. Playwright emits the trace/video (delivery
item 8) on that run.

---

## P0 — STREET-LEVEL VECTOR MAP

- **Base map switched to a MapLibre-compatible vector style** — OpenFreeMap `liberty`
  (`https://tiles.openfreemap.org/styles/liberty`), OSM-derived, no-cost, self-hostable.
  **Not** the public OSM raster tile server.
- **Zoom ceiling raised 10 → 22**; Place `fitBounds`/RECENTER `maxZoom` raised 9 → 16.
- **Overlays stay separate from the basemap:** 4PLANET imagery + data layers are added on
  top through the existing registry, exactly as before. Low zoom = planetary imagery; high
  zoom = sharp vector streets where imagery has no detail.
- **A basemap/style reload never deletes overlays, context or camera:** the light/dark
  toggle no longer swaps the base style out from under the overlays (it reskins chrome on
  the vector base), and the pre-existing rehydration routine re-adds active overlays on
  `styledata`. Context and camera live in React/refs, untouched by style loads.
- **Graceful degradation:** if the vector style fails to load, the map falls back to the
  raster `makeStyle` base and rehydrates overlays — it never leaves a blank world.

**Deploy-gated verification:** that the vector tiles actually render sharp streets to z22
must be confirmed on a deploy (no WebGL here). The wiring, ceiling and fallback are in code
and build clean; the pixel result needs a browser. Described honestly as a **prototype**,
not complete navigation — no routing/traffic.

---

## TRUTH-AXIS CORRECTION

The generic `CONFIDENCE HIGH/MEDIUM/LOW` badge is **removed** from public rendering. The
Evidence block now shows the canonical axes: **REVIEW** (real — e.g. `UNREVIEWED`),
**EVIDENCE STRENGTH · NOT YET ASSESSED** and **INTERPRETATION · NOT YET ASSESSED** (no
assessed value exists on a seeded prototype relation), plus **ORIGIN** as construction
context. The old `confidence` field is **not** back-translated into Evidence Strength.
(The bundle contains no `CONFIDENCE HIGH/MEDIUM/LOW` string — asserted by smoke test.)

---

## TEMPORAL AND STATUS CORRECTION

A legacy map record is **no longer labelled `LIVE`.** The `LEGACY_POINT` surface now
separates: **source access** (REQUEST RETURNED), **recorded/observed time** (from the
source, or `UNKNOWN FROM SOURCE`), and **retrieved** (THIS SESSION) — with the explicit
note that a successful request does not make a record live or recent.

---

## LEGACY PREVIEW PARITY

The `LEGACY_POINT` adapter now preserves the source-aware detail the old V36 popup showed,
without inventing canonical identity:

- **Structured fields:** common name, scientific name (as recorded), coordinates, source.
- **"FROM THE SOURCE" block:** the source-rendered preview is preserved verbatim, so
  GBIF/OBIS dates, EONET category, earthquake **magnitude**, and ISS **altitude/velocity**
  remain visible exactly as the source layer produced them.
- **Source links:** GBIF species link (from `sppKey`) and WoRMS/AphiaID authority link
  (from `aphia`) where available — as references, not as the record's own identity.
- **Planetary-context classification:** ISS and seismic points are explicitly labelled
  PLANETARY CONTEXT.
- The honest boundary remains: this is a display envelope, not a canonical entity.

---

## TYPESCRIPT HONESTY

`src/earth/World.tsx` **still carries `// @ts-nocheck`.** I am **not** claiming the World
interaction surface is typechecked. A full removal of `@ts-nocheck` on a 1,300-line
MapLibre component in this same pass was judged too risky to do blind (no runtime to catch
regressions). Per the audit's option **B**, the limitation is stated plainly here and the
compensating control is the **behavioural test suite** around every changed interaction
(map movement, context open/close, camera persistence, zoom ceiling). `tsc --noEmit` is
green for the typed surfaces (`Context.tsx`, `src/planet/*`, routes); it does **not** cover
World. Removing `@ts-nocheck` is the first recommended follow-up.

---

## TEST AND DELIVERY HARNESS

| Harness | State |
|---|---|
| Lint script + flat config (`eslint.config.js`, `npm run lint`) | **Added — 0 errors, 6 warnings** |
| Behavioural browser tests (Playwright, desktop + mobile + camera-persist + zoom-ceiling) | **Written & wired** (`tests/e2e/`, `npm run test:e2e`) — execution deploy-gated |
| Build-integrity smoke (`npm run test:smoke`) | **8/8 pass** — supplementary, per audit |
| Source-status / truth-axis rendering | Covered by smoke assertions now; full component tests need a DOM harness (follow-up) |

---

## RESULTS

```
typecheck (tsc --noEmit)   clean (does NOT cover World.tsx — @ts-nocheck; stated above)
lint (eslint src)          0 errors, 6 warnings (unused disable directives)
smoke (node --test)        8 / 8 pass
production build           passing
assets:verify              PASS
behavioural (playwright)   WRITTEN — deploy-gated (no WebGL in build sandbox)
```

## CHANGED-FILE MANIFEST (vs V39 base `a73a879`)

```
src/earth/Context.tsx   +/- (progressive disclosure, LEGACY_POINT parity, truth-axis, temporal)
src/earth/World.tsx     +/- (map interactivity P0, vector basemap, RECENTER, legacy routing)
src/earth/world.css     +/- (RECENTER, resting console, tier controls, mobile sheet, legacy preview)
```
New harness files: `eslint.config.js`, `playwright.config.ts`, `tests/e2e/map-interactivity.spec.ts`,
`scripts/smoke-v40.mjs` (renamed from smoke-v39_1). No source/domain files added.

## UNTOUCHED CORE / DOMAIN FILES (verified by diff)

Entire **`src/planet/`** unchanged: `types.ts`, `ids.ts`, `sources.ts`, `places.ts`,
`livingSystems.ts`, `connectors.ts`, `signals.ts`, `follow.ts`, `watch.ts`, `ADAPTATION.md`.
Also unchanged: `src/earth/layers.ts` (V36 layer/registry model), `src/pages/v5/*`
(editorial + `/atlas`), `src/routes/*`. No BRAIN schema, no domain contracts, no Neo4j, no
auth, no Supabase, no Oslofjorden geometry.

## KNOWN REMAINING FAILURES / LIMITATIONS

1. **Runtime verification pending deploy:** map-interactivity fix, vector rendering,
   behavioural tests, screenshots and video all need a browser. Verified in code + build;
   not in pixels. This is the honest headline limitation.
2. **`World.tsx` is `@ts-nocheck`** — its interaction surface is not typechecked (option B).
3. **Imagery-vs-vector at high zoom:** with a full imagery overlay (e.g. BlueMarble) active,
   the raster overzooms and can blur the vector streets; the cleanest street view is with
   imagery layers off. Auto-fading imagery above a zoom threshold is a follow-up (would
   touch `layers.ts`, deliberately untouched here).
4. **Dark vector base:** the prototype uses one vector style for both themes; dark-mode
   chrome reskins but the base stays `liberty`. Dark vector styling is a follow-up.
5. **Legacy preview via preserved source HTML:** parity is achieved by preserving the
   source-rendered block; fully *structured* fields (typed magnitude/altitude/velocity)
   need the observation/signal read models from Codex Build 02A, recorded below.
6. **6 lint warnings** — unused `eslint-disable` directives; harmless, left visible.

## MISSING CORE CONTRACT / CODEX INPUT

- Legacy point → canonical entity resolution (external_identity_mappings + observation/
  signal read models) — still the right home for structured legacy parity and for turning
  a `LEGACY_POINT` display envelope into a real Observation/Signal.
- B-01 Oslofjorden Place identity/geometry — unresolved; no geometry created.
- Canonical field placement for the three truth axes across the read models (which axis
  values are GLANCE vs GO DEEPER) — confirm when 02A lands.

## SCREENSHOTS, VIDEO & PREVIEW (deploy-gated — how to produce)

Deploy this branch to Cloudflare Pages (preset None, `npm run build`, output `dist`,
`NODE_VERSION=20`). Then capture the required states at desktop and at ~390px:
Earth resting · Oslo context open · Oslo after pan · street-level zoom · context closed with
camera preserved. The Playwright run (`npm run test:e2e` against the preview) produces the
interaction video/trace showing the map moving with context open.

---

Odin has final authority. Branch-only until GPT audits the corrected delivery.
