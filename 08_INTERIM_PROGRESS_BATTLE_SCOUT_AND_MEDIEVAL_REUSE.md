# ROMA Campaign — AXE interim work while Claude fixes battle bugs
22 October 2026. Addendum to the previously prepared Claude campaign source handoff.

## Preserved architecture and what changed
This commit updates the handoff branch to the latest confirmed READY AppDeploy snapshot `1792679526822`. No original Claude ROMA battle logic has been edited. Preserved battle payload `public/legacy.html` remains excluded from this isolated handoff.

Changes in campaign only:
- `src/campaign.js`: a single source for visible action costs; missing wood/stone/iron stock; next-day food and coin forecasts; physically interpolated army markers while marching; granary benefit scales with count; Cannae objective only completes on Cannae victory and actual route control.
- `index.html`, `src/roma-visual.css`: Historical Battlefield Scout panel and export control, improved price/resource visibility.
- `src/battle-scout.js`: Exports a draft JSON for selected site + current campaign army position, supplies, approximate coordinates, source confidence and environment recommendations. Pure presentation/serializer, no tactical engine API calls.
- `src/main.ts`: imports new isolated module after campaign.
- `tests/tests.json`: behavioural test specifications. AppDeploy automated QA reports no frontend/network errors, but hands-on map/3D QA still incomplete.

## Cross-game reusable MEDIEVAL 03 assets
Supplied original bundle `MEDIEVAL_KINGDOMS_PREMIUM_BUILD_03(1).zip` was inspected. Separate companion package `ROMA_MEDIEVAL_SHARED_TERRAIN_ASSETS_01.zip` contains original Kenney rock/oak (Nature Kit, CC0), optional wall/gate/tower castle assets (Castle Kit, CC0), RIGHTS_REGISTER, source-specific notices, extracted Hattin 1187 and Belvoir Siege Lab 1188-inspired spatial presets, prototype terrain method and a proposed Cannae battle brief contract.
The companion package is delivered as a separate user-download artifact because its binary 3D models should not be silently injected into the public ROMA code. Treat its `SOURCE_CODE_READ_ONLY` files as study reference only.

## Direct MEDIEVAL code review
- Hattin: original ROMA procedural terrain + two local Gaussian elevations; no real Hattin DEM. Scenario has 7 vs 7 regiments, water objective.
- Belvoir: 119 wall/gate/tower objects with native nav-grid collisions in derivative, 7 attacking and 6 defending regiments; layout not a measured Belvoir fortress.
- `premium_visual.js` groups Kenney mesh triangles into few draw calls; scale/orientation and visuals should be checked before any import.
- Original engine is protected; DO NOT apply its monkey-patches (`Wi`, `wg`, `I0`) while Claude fixes battle.

## Reusable API decision gate
Review the draft JSON exported by Battlefield Scout. Decide (1) actual geographic coordinates -> terrain clip projection -> battle local x/z, (2) force composition contract, (3) scenario and terrain validity, (4) idempotent results, (5) save migration. Only after Claude's battle bugs are fixed should the draft evolve into an actual battle bridge.

## Commercial/historical cautions
The Hattin/Belvoir code is not period-appropriate for Cannae (216 BCE). Cannae exact battlefield remains debated; modern elevation is only the physical substrate. Itiner-e Roman roads dataset spans centuries; its unspecified lower-date marker is 9999 and should NOT be read as early Roman presence. Model files and source links have not been manually viewed in a 3D DCC for final aesthetic clearance. No new money and no public deployment authorised.
