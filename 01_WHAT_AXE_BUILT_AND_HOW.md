# WHAT AXE ACTUALLY BUILT: CAMPAIGN IMPLEMENTATION, INTERFACES, HISTORY
This document distinguishes inspectable code from proposals.

## Development sequence
A. First independent AppDeploy ROMA Campaign 01 prototype: original Challenger engine preserved in public/legacy.html; a new Vite/frontend HTML canvas world map with Natural Earth 110m coastlines and rivers; playable 216 BCE Canusium-Cannae economy and routes; browser saves; encounter auto-resolve; iframe to original Challenger.
B. Second pass: map-art.js (hand-illustrated approximate mountain chains, decorative fields and labelled regions), roma-visual.css (parchment/charcoal/gold/dark historical styling and DM Sans interface), better city and army tokens, quick army destination buttons.
C. Third pass: geo-tiles.js (EOxCloudless 2016 satellite tiles, AWS/Mapzen Terrarium real elevation relief and original fallback) with basemap switch and credits, tile cache and status indicator.
D. Red-team: defect review before further gamebuilding; no code fixes deployed since red-team.

## Files
index.html — all campaign panels, map canvas, tactical iframe and controls.
src/main.ts — imports css, map-art.js, geo-tiles.js, campaign.js, roma-visual.css.
src/campaign.js — original state; deterministic economic day; map camera/projection/drawing; settlement upgrades; supplies; enemy turn; map selection; battle window and campaign result integration; localStorage.
src/map-art.js — initial illustrated world relief and cities; aesthetic, NOT ground-truth terrain.
src/geo-tiles.js — remote imagery/elevation XYZ tile loading; Terrarium decode and generated shaded-relief raster; SATELLITE/REAL RELIEF/HISTORIC modes.
src/styles.css — initial basic layout/UI and mobile.
src/roma-visual.css — override historical style and improved placements.
public/land.geojson, public/rivers.geojson — modern Natural Earth generalized geometry, not 216 BCE borders.
tests/tests.json — descriptive coverage/specs, not proof every test was executed.
Config: package.json, postcss/tailwind/tsconfig/vite.
public/legacy.html — ORIGINAL protected tactical game, intentionally absent from this handoff. Import from the existing ROMA/Claude code unchanged.

## Exact map and state mechanics
World bounds: longitude -18 to +70, latitude +10 to +61. Virtual map size W=2000, H=1300. Mercator coordinate conversion in campaign.js; camera x/y/z; pointer drag, wheel zoom, touch pinch; state at localStorage key roma_republic_campaign_stage01_v1; schema 1, scenario apulia-216.
Public JS introspection (staging): window.ROMA_CAMPAIGN.state, advance, autoResolve, focus, save. window.ROMA_GEO renders tiles and switches basemap. window.ROMA_CARTOGRAPHY paints legacy backdrop/symbols.
Canvas draws the illustrated fallback then satellite/relief raster (when tiles load), roads, towns, armies and legends. Modern 2016 satellite DOES NOT represent ancient land use. Terrain polygons are low-resolution 110m and not suitable for high-zoom historical details. Relief pixel grid is 2D imagery, not 3D elevation geometry. External tile servers are best-effort and may fail. QA detected no JS/network errors on deployment but was NOT a complete manual cross-browser visual test.

## Actual game loop
You start with around 3,300 men at Canusium, another Roman force at Luceria (~900), and a 4,400-strong Carthaginian force at Cannae. All are scaled prototype figures, NOT historical orders of battle. Initial resources treasury 780, food 960, wood 260, stone 170, iron 130, manpower 1650, senate 62.
Strategic order: inspect town > farm/granary/fortify/recruit > choose adjacent settlement march > advance 1/7 days > economy, movement and Hannibal's simplistic AI > encounter (manual original 3D battle or deterministic auto-resolve) > campaign casualties/ownership.
Original auto-resolve uses army size, morale, supply and deterministic seed. Enemy AI has a single simple move to Canusium under narrow day conditions. There is no deep diplomatic/operational planning and no believable endgame yet.

## Tactical bridge: integration contract as currently implemented
openBattle creates a same-origin iframe at ./legacy.html?campaign=1; waits for window.ROMA.app; calls app.newGame(); captures ROMA.state(). During recording it compares before/after regiment counts and maps loss proportions into campaign forces. It does NOT send campaign army mix/terrain/equipment/positions into the 3D engine; tactical result is approximate and weakly coupled. DO NOT modify the original engine merely because this prototype uses this bridge.

Suggested FUTURE interface (not implemented): serialized BattleContext containing location/date/terrain coordinates/defending army/attacking army/force composition/equipment/commander/supply/seed; and a BattleResult containing winners/losses/exhaustion/survivors/retreat/territorial consequences and unique id. Have your actual engine define its proper API. Make results idempotent. Keep original battle mechanics untouched unless Odin authorises integration changes.

## Risks of cherry-picking
Source is standalone Vite HTML, not necessarily aligned with Claude's existing Three.js/TypeScript architecture. Take strategy logic/data/original research; you may rebuild UI/map subsystem into the existing engine if it yields better UX, performance and integration. Before merging anything: snapshot source, record tests and lock current battle code. Avoid overwriting CSS or index files at existing application roots without scoping.
