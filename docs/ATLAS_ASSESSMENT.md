# PART 7 — ATLAS DEPTH · technical assessment (honest, sandbox-limited)
All ATLAS tile/data providers (OpenFreeMap, CARTO, Esri, GBIF, Climate TRACE) are EGRESS-BLOCKED
in the build sandbox, so the map cannot render or be verified here. Per our own technical-veto
discipline, no blind edits were made to the 1583-line World engine. This documents exact wiring
status + what to verify on a real Cloudflare preview.

## 1. Deep-zoom pixelation (founder: "pikselert langt inn")
- The basemap ALREADY uses OpenFreeMap vector tiles (`liberty` style) which DO support crisp
  street-level zoom (World.tsx:113 VECTOR_STYLE). 
- The pixelation you saw is the RASTER FALLBACK: when vector tiles fail to load, the map falls
  back to a raster base (makeStyle, CARTO maxzoom 18/16) which pixelates when zoomed far in.
- LIKELY CAUSE: vector tiles not loading on the preview (network/style URL). 
- VERIFY ON PREVIEW: open DevTools network on 4planet.org, zoom to street level, confirm
  tiles.openfreemap.org requests succeed. If they 404/CORS-fail, that's the fix target — not the
  zoom code. If they load, deep zoom is crisp.

## 2. Climate TRACE traces not showing (founder: "trace vises ikke")
- Wired correctly via a CORS-safe Cloudflare function `/api/climate-trace` (layers.ts:244) →
  Climate TRACE assets, sized by CO2e.
- LIKELY CAUSE: the Cloudflare Pages Function isn't deployed/reachable on the current preview, or
  returns empty. It honestly degrades to UNAVAILABLE when the proxy fails (by design).
- VERIFY ON PREVIEW: hit https://<preview>/api/climate-trace?sectors=power&limit=50 directly —
  confirm it returns {ok:true, assets:[...]}. If 404, the function needs deploying; if empty,
  the upstream/sector params need checking.

## 3. Biodiversity density not showing
- Wired via GBIF occurrence-density raster tiles (layers.ts:180,
  api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}). Honest legend: "where people have looked".
- LIKELY CAUSE: GBIF tiles blocked in sandbox; should load on preview. It's an opt-in overlay in
  the LAYERS console — confirm it's toggled ON.
- VERIFY ON PREVIEW: enable the biodiversity layer, confirm api.gbif.org tile requests succeed.

## 4. Dark-outline + labels basemap mode (founder liked the earlier one)
- IT ALREADY EXISTS: `makeStyle(light=false)` renders CARTO dark base + Esri labels
  (layers.ts:274) — i.e. dark outline with place names. It's currently used as the reskin/fallback
  basemap, not offered as a deliberate user choice.
- TO OFFER AS A MODE (small, low-risk change, but must be verified on preview since the map can't
  render in-sandbox): add a basemap-mode control that calls `m.setStyle(makeStyle(false))` for the
  dark-labels mode vs the vector `liberty` for streets. The reskin path (World.tsx:882,988) already
  proves makeStyle works, so this reuses proven code.
- RECOMMENDATION: do this as a tiny follow-up committed + verified on preview, not blind here.

## 5. ATLAS mobile controls (#31, was flagged open)
- At rest on 390px the controls (search / LAYERS+ / EARTH / NOW / WATCH / zoom / bottom bar) render
  cleanly and do NOT collide (screenshot atlas-mobile.png). The earlier collision appears resolved
  at rest.
- STILL TO TEST (needs a real map + device): sheet open/close behaviour, tap competition when a
  bottom sheet is up, and the small floating switcher mark at top-left (reads a little orphaned).
- RECOMMENDATION: founder device-test on preview; address sheet/tap issues if they appear live.

## SUMMARY
Nothing here is a code defect I can fix blind — 1-3 are real-infra verification items, 4 exists and
just needs surfacing, 5 looks resolved at rest. The honest next step is a preview deploy where these
providers are reachable, then a short verified ATLAS pass for the dark-mode toggle + any live mobile
sheet issues. No engine code was changed without the ability to verify it.
