# V31 — ATLAS on MapLibre (resume plan)
GOAL: renderer migration, NOT a product restart. Preserve: panel, layer registry, brand/canon,
honesty notes, light/dark, popups, domain colours, /atlas route, Fragment Mono.
STEPS
1. [x] npm i maplibre-gl (remove leaflet later, keep until port verified)
2. [ ] Rewrite src/pages/v5/Atlas.tsx on MapLibre GL JS 5:
   - globe projection (setProjection type:'globe'); adaptive → Mercator when zoomed in
   - self-contained style JSON (raster CARTO base + Esri English labels) → same look, low risk
   - port raster GIBS overlays (BlueMarble, MODIS TODAY + date slider, Night Lights, SST)
   - port point layers (WH4LES/OBIS, SPECIES/GBIF, QU4KES/USGS, FIRE+EVENTS/EONET, ISS live)
     as geojson sources + circle layers; popups via maplibregl.Popup
   - light/dark toggle (swap base raster tiles + chrome)
   - DOMAIN MODES as lenses: PLANET (all) / OCE4N / E4RTH / S4PIENS — filter layer list by layer.domain
   - URL STATE: ?m=mode&l=on,layers&t=theme&z=zoom&c=lng,lat  (read on load, write on change)
3. [ ] typecheck + build + assets:verify + zip v31
DEFER to v32: species search, GBIF density tiles, forest loss, coral bleaching alerts, protected areas,
climate stripes, day/night terminator, 3D terrain, Movebank, newsfeed backend, IMPACT mode.

## SHIPPED v31.0.0
DONE: Leaflet → MapLibre GL JS 5.24. Globe projection (adaptive: Mercator on zoom-in).
Self-contained style JSON (CARTO raster base + Esri English labels) → same look, low migration risk.
All 9 layers ported: raster (Blue Marble default, MODIS TODAY + date slider, Night Lights, SST) and
point/live (WH4LES/OBIS, SPECIES/GBIF, QU4KES/USGS, FIRE+EVENTS/EONET, ISS polling) as geojson+circle layers.
MODES as lenses over one planet: PLANET (all) / OCE4N / E4RTH / S4PIENS — filters layer list via layer.domain.
URL STATE (shareable/reproducible): ?m=mode&l=on,layers&t=light&z=zoom&c=lng,lat — read on load, written on
toggle/mode/theme/moveend via history.replaceState.
Light/dark preserved; popups, honesty notes, GBIF English-name-on-open, domain colours, Fragment Mono all intact.
leaflet + @types/leaflet REMOVED. Atlas stays code-split (front page unaffected, 348KB).
typecheck+build+assets:verify PASS.
NOT DONE (v32 backlog): species search + GBIF density tiles, forest loss (GFW), coral bleaching (NOAA CRW),
protected areas (WDPA token), climate stripes, day/night terminator, 3D terrain, Movebank, "near me",
newsfeed backend (Workers + AI curation → Magazine/Films), IMPACT mode (hold until missions are real).

## SHIPPED v32.0.0 — Atlas: from beautiful to useful
FIXED (bugs seen in screenshots):
- literal escape sequences rendered as text ("SRC \u00b7 OBIS", "\u2190 4PLANET_") — JSX doesn't interpret \u in text.
  Now real chars via consts (DOT) and {"..."} expressions.
- raster stacking was arbitrary → fixed order bottom→top: bluemarble, truecolor, sst, night; points always above.
- layer notes were hidden inside marker popups → now an (i) button per row opens the note + source in the panel.
- no legend for raster ramps (SST rainbow meant nothing) → colour ramp + lo/hi labels + honest "approx." caption
  for SST (GHRSST palette, ~-2 to 35 °C) and NIGHT LIGHTS (relative radiance).
- light mode weak → warmer background (#f2f3f5), base opacity .9, label opacity .55.
NEW:
- SPECIES SEARCH (the crown jewel): GBIF species suggest → occurrences (300) drawn as a pink SEARCH layer,
  English common name + Latin + GBIF link, with the honest caveat that records show where people looked.
- per-raster OPACITY slider (blend SST over Blue Marble)
- 2D / 3D projection toggle (globe ⇄ mercator), HOME reset, SHARE (copies URL state to clipboard), live UTC clock.
typecheck+build+assets:verify PASS. Version 32.0.0.
NEXT (v33): day/night terminator, forest loss (GFW), coral bleaching (NOAA CRW), protected areas (WDPA token),
GBIF density tiles for scale, "near me", climate stripes, newsfeed backend (Workers + AI curation → Magazine/Films).

## SHIPPED v33.0.0 — 4PLANET ATLAS: the data round
FIXED:
- SPECIES SEARCH was broken: GBIF /species/suggest only matches Latin names ("orca" → fossil genera,
  "humpback" → nothing). Switched to /species/search against the GBIF backbone, which matches common
  names too; suggestion list now shows Common name + Latin underneath.
- OBIS whale records often carry no vernacular name → on popup open we now look it up on WoRMS
  (AphiaVernacularsByAphiaID), so "Megaptera novaeangliae" resolves to "Humpback Whale".
NEW LAYERS (all NASA GIBS via **WMS** — deliberately: WMS needs no GoogleMapsCompatible_Level guess,
which was the failure mode of the earlier chlorophyll layer. Any GIBS layer now drops in safely):
- ACTIVE FIRES (VIIRS thermal anomalies, 375 m, last 24h) — real detections, not just EONET events
- VEGETATION / NDVI (MODIS 8-day) — where the land is alive
- SEA ICE (AMSR2 concentration) — the clearest seasonal climate signal
- AIR / AEROSOLS (MODIS AOD) — smoke, dust, pollution proxy
- PRECIPITATION (GPM IMERG rate) — the water cycle, live
All with legends + honest notes ("a detection is heat, not proof of wildfire" / "a proxy, not a ground measurement").
- DAY / NIGHT terminator: computed live from the sun's position (no data source), refreshes every 60s.
- NEAR ME: geolocation → flyTo → GBIF vertebrates within ~60 km, listing what has been recorded around you,
  with the caveat that records show where people looked.
Raster stacking order extended: bluemarble, truecolor, ndvi, seaice, precip, sst, aerosol, night, fires.
typecheck+build+assets:verify PASS. Version 33.0.0.
NEXT (v34): forest loss (GFW), coral bleaching (NOAA CRW), protected areas (WDPA token), GBIF density tiles
for scale, climate stripes, newsfeed backend (Workers + AI curation → Magazine/Films). IMPACT mode still held
until missions are real.

## SHIPPED v34.0.0 — 4PLANET ATLAS: honest layers, domain-sorted panel
FIXED:
- ACTIVE FIRES rendered NOTHING: wrong GIBS id ("VIIRS_SNPP_Thermal_Anomalies_375m_Day").
  Verified correct id → MODIS_Terra_Thermal_Anomalies_All. Now renders day+night detections.
- SYSTEMIC FIX: a raster source that 404s used to sit there saying "ON" while showing nothing.
  Added a map error listener → the row now says "UNAVAILABLE" (red). No more silent blank layers.
- SPECIES SEARCH returned ants (Tetramorium) and foraminifera for "orca" — GBIF full-text matches any
  Latin substring. Restricted to vertebrates (highertaxonKey=44) and re-ranked so a common-name match
  outranks an incidental Latin substring hit.
PANEL REBUILT (Odin's structure):
- ACTIVE section pinned at top — whatever is on is never buried under a long scroll.
- Everything else grouped by the domain it actually belongs to: PLANET / OCE4N / E4RTH / S4PIENS,
  collapsible. (It does not burn at sea → fires = E4RTH. There is no sea temperature on land → SST = OCE4N.)
- Compact: panel 302→264px, smaller rows/type/padding, thin scrollbar. Much less scrolling on a laptop.
NEW LAYERS:
- FOREST LOSS (Hansen/UMD via Global Forest Watch XYZ tiles) — honest note: loss ≠ deforestation.
- CORAL HEAT STRESS (NOAA Coral Reef Watch, Degree Heating Weeks via ERDDAP WMS) — the pressure that
  drives bleaching, not bleaching itself.
- PROTECTED AREAS — deliberately kind:"planned". WDPA needs a free UNEP-WCMC token we have not wired up.
  Shown with a PLANNED chip and an honest note: we would rather show nothing than fake a boundary.
typecheck+build+assets:verify PASS. Version 34.0.0.
NOTE: forest + coral endpoints are best-known public URLs and are NOT verified live. If either 404s, the new
error detector will label it UNAVAILABLE rather than lying — report which and I'll correct the endpoint.
NEXT: GBIF density tiles (scale), climate stripes, newsfeed backend (Workers + AI curation → Magazine/Films).

## SHIPPED v35.0.0 — 4PLANET ATLAS: "the species and the place"
SEARCH ALL SPECIES: two GBIF queries (all life + vertebrate-biased) merged, deduped and ranked
  (common-name prefix > common-name substring > Latin prefix > Latin substring). Oak, coral and fungi are
  searchable again, but "orca" no longer surfaces ants — ranking, not amputation.
iNATURALIST PHOTOS (free, no key): fetched on popup-open and in the species drawer. A Latin string is a
  label; a photo is a creature. Photo credit shown.
OBSERVATION DATE + DIRECT RECORD LINK: popups now say "Observed 2024-03-14" and link to the exact GBIF
  occurrence ("See this record"), not just the taxon page. That is the difference between evidence and a label.
WHAT IS HAPPENING HERE: click anywhere on the map (not on a marker) → right-hand panel with coordinates,
  live GBIF species count + names nearby, cetacean records, quakes in 24h, open events. Turns eight separate
  overlays into one instrument. Carries the honest line: "Nothing here does not mean nothing is here — it means
  no loaded source reported anything in this window."
ISOLATE: mute every other point layer to read one species on its own. Search now also fits bounds to the results.
SOURCE FRESHNESS: per-active-layer status/timestamp block in the panel (UNAVAILABLE shows red).
ERROR BOUNDARY: 1100 lines of @ts-nocheck — one bad response used to risk white-screening the whole Atlas.
  Now it degrades to an on-brand error card with a reload, instead of a blank page.
typecheck+build+assets:verify PASS. Version 35.0.0.
STILL UNVERIFIED (report what says UNAVAILABLE): forest loss (GFW XYZ), coral heat stress (NOAA CRW ERDDAP WMS).
NEXT: GBIF density tiles (scale), time axis across all dated layers, mobile bottom sheet, FIRMS points (needs free
MAP_KEY from Odin), newsfeed backend. Type-safety pass once the layer registry stops moving.

## SHIPPED v36.0.0 — 4PLANET ATLAS: fixing what the screenshots exposed
CONFIRMED WORKING in v35 (from Odin's screenshots): ACTIVE FIRES (Brazil detections), FOREST LOSS (Hansen red/green —
looks superb), NDVI, AEROSOLS, PRECIPITATION, NIGHT LIGHTS, DAY/NIGHT terminator, WHAT IS HAPPENING HERE,
iNaturalist photos, ISOLATE, SOURCE FRESHNESS, domain-sorted panel.
FIXED:
- literal "\u00b0" printed as text in the coordinate readout ("45.14\u00b0N"). Same class of bug as v31 —
  a real char const (DEG) is now interpolated instead of an escape sequence sitting in JSX text.
- WRONG ANIMAL PHOTOS: the Cetacea popup showed a DEER. iNaturalist fuzzy-matches, so a high-level taxon
  ("Cetacea") returned an unrelated species. Now we only accept a photo when iNat's taxon name is an EXACT
  match for what we asked for. A wrong photo is worse than no photo.
- SEA ICE = UNAVAILABLE: the GIBS identifier is AMSRU2_Sea_Ice_Concentration_12km, not AMSR2_.
- CORAL HEAT STRESS = UNAVAILABLE: NOAA's ERDDAP WMS needs an explicit TIME dimension; added.
NEW — BIODIVERSITY DENSITY (GBIF map tiles): the scale moment. 900 dots was a taste; this draws GBIF's whole
  billion-plus record set as density. Honest legend: bright = heavily recorded, not necessarily most alive —
  it shows where people looked.
typecheck+build+assets:verify PASS. Version 36.0.0.
NOTE: coral remains unverified. If it still says UNAVAILABLE, the ERDDAP dataset/variable id is wrong and I'll
either correct it or demote coral to kind:"planned" rather than ship a dead toggle.
NEXT: time axis across all dated layers, mobile bottom sheet, FIRMS points (needs free MAP_KEY), newsfeed backend,
type-safety pass now that the layer registry is settling.
