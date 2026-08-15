# V25 PLAN — resume state (update status as you go)

Base: v24 (working copy /home/claude/v25, version bumped to 25.0.0).
Decoded Drive frames live in /home/claude/drive_raw. Pipeline: decode_all.py, contact.py, place.py.
v23 originals restored under /home/claude/restore (for the s4piens container hero).

## OVER 10MB — connector CANNOT fetch (need Odin drop-in or Drive downscale). Use temp stand-in + one-step swap.
- [BLOCKED] `ocean01hero.jpg` 12.9MB — the whale-TAIL → OCE4N domain hero. TEMP: wahleshero (breach).
- [BLOCKED] `4PLAY hero.jpg` 15.7MB → 4PLAY mission hero + homepage 4CULTURE feature. TEMP: 4CULTURE02 / R1 portrait.
- [BLOCKED] `4PEOPLE HERO.jpg` 14.8MB → 4People fullscreen hero. TEMP: participation-field.
- Others >10MB not needed: Q1010145/187, R1-032A, JeffHester_22, FrancoisBaelen_14, tim-mossholder, all RAF.

## IMAGE PLACEMENT (from re-scan / renamed titles)
- [ ] s4piens: RESTORE container hero (restore/…/s4piens/hero.jpg) → domains/s4piens/hero. Move s4piens02 (person/volcano) → s4piens DETAIL #2.
- [ ] OCE4N hero ← ocean01hero (BLOCKED→temp). ocean04 (id 1ud1K6, have as ocean05.jpg = whale skeleton) → LAST image in ocean/domain page.
- [ ] WH4LES hero ← whaleshero (id 1TKecL6, have as OceanImageBank_FrancoisBaelen_15 = humpback underwater). Current wahleshero (orange breach) → WH4LES detail #2. Add whales02 + WHALES04 as #3/#4.
- [ ] COR4L: use REAL coral-reef frames (verify coral candidates). Current cor4l hero (humpback) was WRONG → moved to whales. Add extra coral if needed.
- [ ] 4NTARCTICA hero ← 4ntarctica01hero (id 1B88KGL, have as 4ntarctica01.jpg). Use ALL four: +4ntarctia02 +4ntarctia04 +one more as details.
- [ ] REWILD ← REWILD HERO.jpg + Rewild02.jpg (replace the ones that didn't work).
- [ ] AM4ZONIA ← AM4ZONIA03.jpg (+existing).
- [ ] CLIM4TE hero ← KEEP current (climte02) — it worked.
- [ ] 4TELIER hero ← REPLACE (red/blue curtain failed). Find architectural frame (joel-filipe / neom / verify).
- [ ] homepage 4CULTURE feature: REMOVE girls portrait (cultureAnchor R1-025A). REPLACE with 4PLAY hero (BLOCKED→temp).
- [ ] footer: KEEP FooterNASA. ✓
- [ ] ~4 images per mission/domain for "world feeling" — add details across.

## STRUCTURAL / DESIGN
- [ ] Remove ALL small image captions EXCEPT NASA. NASA caption→CREDIT in brand-blue (#2E2EFF). (Cinematic caption/credit.)
- [ ] Stop using grey text (T.dim) around the site — replace with ink or brand blue where used as decoration.
- [ ] All-missions page: DOMAIN cards = domain-colour block + BLACK text, NO image. MISSION cards = keep image. (Clarify hierarchy.)
- [ ] Remove the black↔white FADE/seam gradient entirely (not premium). Where black meets white, use an IMAGE instead.
- [ ] Header: MENU button CENTER; top-right button = "JOIN 4_" (avoid double 4PLANET). Logo left stays "4PLANET_".
- [ ] Menu OPEN overlay: fix the transparent "hole" at very top — full screen must be solid white.
- [ ] Participate pages (4people/4brands/4partners/4funders): fullscreen HERO + extra image at BOTTOM. 4People hero←4PEOPLE HERO (temp), + current 4people (participation-field) as #2. Others: 4partnershero/4fundershero/etc.
- [ ] Subpages generally: use images (about/story: use story/founder + about heroes).

## DEFERRED (larger, do if tokens allow else next round)
- [ ] Mission pages: vary image layout (Snøhetta-style: full-width, two-up, offset portrait+text) — stop all-thin-ribbon images.
- [ ] Mission intro text block → fullscreen; add small vertical images to enliven the black frame.
- [ ] Homepage sharpening (Odin: next round, after images).

## VALIDATION each ship: npm run typecheck && npm run build && npm run assets:verify → zip 4planet-os-v25.zip

## STATUS @ ship v25.0.0
DONE: s4piens container restored; ocean/whales/coral fix; 4ntarctica hero+details; rewild; amazonia detail;
telier→architecture; homepage 4CULTURE temp; captions removed (NASA credit→blue); grey(dim)→ink; seam→image;
header (MENU centre, JOIN 4_, full-white menu overlay); all-missions domain cards colour+black no image;
participate bottom images (all 4). typecheck+build+assets:verify PASS.
BLOCKED (need drop-in / <10MB): ocean01hero (OCE4N hero, temp=ocean02), 4PLAY hero (homepage+4play, temp=R1 group), 4PEOPLE HERO (temp=participationField hero + homepageBonus bottom).
DEFERRED next round: Snøhetta-style varied mission-image layout (stop thin ribbons); fullscreen mission intro w/ small vertical images; deeper 4-images-per-mission; homepage sharpening.

## STATUS @ ship v26.0.0 — the 3 blocked heroes + story hero now IN (dropped in chat)
DONE: OCE4N hero = whale-tail (FrancoisBaelen_13); temp open-ocean (ocean02) moved down to oce4n/detail-03.
4PLAY hero = uploaded portrait → missions/4play/hero + homepage 4CULTURE feature (culture-anchor).
4PEOPLE hero = uploaded desert → brand/participation-field; old mekong → participation-field-2 = People bottom (#2).
STORY/FOUNDER hero (uploaded Lut desert, bottom cropped to remove "Ehsan aminjavaheri" watermark)
  → fullscreen hero on /about (The Story) + used as E4RTH domain 2nd beat (SECOND_IMG E4RTH = e4rthField).
typecheck+build+assets:verify PASS. Version 26.0.0.
NOTE: all 3 previously-blocked >10MB files are now resolved; no connector-blocked heroes remain.
STILL DEFERRED: Snøhetta-style varied mission-image layout; fullscreen mission intro w/ small vertical images; homepage sharpening.

## STATUS @ ship v27.0.0 — audit fixes + tightening
DONE: grey fully killed (CSS --dim->ink too); display font (Instrument Sans) applied to Home actHead, About H1/H2,
Impact H1s, domain cards; header MENU/JOIN equal size(13)/weight/spacing, double-CLOSE fixed (JOIN always "JOIN 4_");
domain cards = white text on OCE4N blue, black on others; breadcrumb eyebrows trimmed to bare index, dead caption/credit props removed;
participate heroes now FULLSCREEN (100svh); participate bottom images removed (double-footer gone); About double NASA/"Planet Closing" removed;
impact-unit pages get a top hero image; homepage "MAKE AN IMPACT" primary CTA -> /impact.
typecheck+build+assets:verify PASS. Version 27.0.0.
STILL DEFERRED: Snøhetta-style varied mission-image layout (thin ribbons); fullscreen mission intro; deeper homepage sharpening.

## STATUS @ ship v28.0.0 — 4PLANET ATLAS (live evidence layer)
NEW: src/pages/v5/Atlas.tsx — canon-branded Leaflet map at internal route /atlas (menu link now internal).
Config-driven LAYER registry (add layer = one entry). Layers: NASA True Color / Night Lights / Chlorophyll (GIBS tiles),
WH4LES (OBIS), SPECIES (GBIF), QU4KES (USGS), FIRE+EVENTS (NASA EONET), ISS (wheretheiss.at, polling).
Brand: Fragment Mono, domain colours (OCE4N blue / E4RTH green / S4PIENS red / 4CULTURE pink), ink base, no cyberpunk.
Framing: third-party data "surfaced & curated by 4PLANET" + per-source credit (not ours).
Robustness: noWrap + maxBounds + viscosity 1.0 + ink container bg (no world duplication / white void);
full-coverage CARTO dark base behind NASA (fills satellite swath/polar gaps); preferCanvas; interval cleanup on off+unmount;
inline status (no alert); escaped popups; maxNativeZoom per GIBS level (no blank overzoom); double-fetch guard; collapsible panel (mobile).
leaflet@1.9.4 + @types/leaflet added; Atlas code-split via React.lazy (loads only on /atlas).
typecheck+build+assets:verify PASS. Version 28.0.0.
NEXT: our own PROJECTS + SOLUTIONS as 4PLANET-owned GeoJSON layers; mission-as-lens deep links; mobile panel polish; Protected Planet (needs free WDPA token).

## STATUS @ ship v29.0.0 — Atlas refinements (Planet-mode foundation)
Atlas: English place labels (Esri, no multi-language clutter); NASA layer renamed "NASA EARTHDATA" with a
DATE SLIDER (default = 2 days back to fill swath gaps, slide to today); SPECIES = GBIF vertebrates only
(taxonKey=44), paginated ~600, popup shows common name (Latin) + "Read on GBIF" link; WH4LES = OBIS Cetacea,
size 500, common+Latin+WoRMS link; QU4KES stay red, FIRE+EVENTS wildfire=amber (distinct from quakes),
clearer event types (VOLCANIC ACTIVITY / ACTIVE WILDFIRE / SEVERE STORM / ICEBERG-SEA ICE); each layer has an
honest one-line note in its popup (e.g. "OBIS occurrence — not real-time positions"); subtitle now
"THE LIVING PLANET · LIVE" pure #FFFFFF chrome; DOMAINS colour legend in panel; attribution restyled brand-blue/transparent.
typecheck+build+assets:verify PASS. Version 29.0.0.
ROADMAP (from strategy doc): v30 = MODE architecture (PLANET default → MISSIONS teaser → THREATS → IMPACT → SOLUTIONS → LIVING SYSTEMS → PROOF locked), honest per-layer info panel, mission-as-lens deep links. Do NOT use "evidence" until tied to real proof. Reconsider "· LIVE" (not all layers are real-time).

## STATUS @ ship v30.0.0 — Atlas: honest imagery, working ocean layer, light/dark, visible labels
FIX (bug): layer names were INVISIBLE — Atlas used class "lbl", but global.css has `.lbl{color:var(--dim)}`
  and --dim is now near-black → black text on black panel. Renamed to .alyr + color:inherit. Readable in both themes.
SATELLITE rebuilt: "EARTH · BLUE MARBLE" (BlueMarble_ShadedRelief_Bathymetry, static, seamless, NO gaps) is the
  beautiful default; the daily MODIS mosaic is now a separate opt-in layer "NASA EARTHDATA · TODAY" (amber) whose
  dark wedges are honestly labelled as today's un-imaged satellite passes; date slider drives that layer only.
  Root cause of the "stripes": daily MODIS tiles are OPAQUE jpg (black where no pass), so a base behind cannot fill them.
CHLOROPHYLL replaced by "OCEAN · SEA SURFACE TEMP" (GHRSST_L4_MUR, Level7) — a gap-free analysis product that
  actually renders (daily chlorophyll is too sparse/late → blank toggle).
SPECIES: now spread across 6 continents (was Nordic-heavy, GBIF returns newest-indexed first); English common name
  fetched on popup-open via GBIF vernacularNames → "Blue Tit (Cyanistes caeruleus)" + Read on GBIF link.
LIGHT / DARK toggle: swaps CARTO base (light_nolabels/dark_nolabels), labels un-invert, panel/popup/zoom/chrome
  all theme-aware; light = white + brand-blue accents + ink text; data dots keep domain colours in both.
Subtitle now "PLANETARY INTELLIGENCE" (dropped "· LIVE" — not all layers are real-time; anti-overclaim).
typecheck+build+assets:verify PASS. Version 30.0.0.
NEXT (v31): MODE architecture — domain modes (PLANET default / OCE4N / E4RTH / S4PIENS / 4CULTURE) + IMPACT mode,
  sections inside each (LIFE / PRESSURE / SOLUTIONS / MISSIONS), honest status chips (ON / LAYER PLANNED / IN DEVELOPMENT),
  mission deep-links to dossiers, chrome tinted by domain colour in domain modes. Registry needs 3 fields: domain, section, status.
