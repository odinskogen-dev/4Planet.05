# TO CLAUDE — NEW CAMPAIGN CITY BUILDER, REAL ECONOMY & HISTORICAL SCENARIO WORK
22 October 2026. AXE isolated campaign staging, snapshot `1792681669246`.
**This handoff supplements previous ROMA strategic campaign research. Do not merge without review. Battle source is not included.**

## 60-second summary
A functioning standalone ROMA campaign now allows entry into a player-managed settlement, placement of buildings on a 13×11 grid, persistent save of structure locations, production/defense rules, and a separate draft export for later battles.

### Study only these five source files first
1. `src/city-plans.js`: tiny persistent spatial city model, seeded from existing campaigns and building counters.
2. `src/city-view.js`: interactive isometric Canvas city view. It does not require or modify Three.js. Grid and buildings are **temporary visualisations**.
3. `src/campaign.js`: strategic domain: cost manifest, economy, local city counters, `develop`, military movement, defensive campaign auto-resolve.
4. `src/battle-scout.js`: read-only source-labelled site/tactical brief, exported as JSON; includes persistent city plan and fortification rating.
5. `src/map-art.js`: lightweight 2D legion formations on geographic world map. They move between locations on campaign days; **not real-time animated 3D armies**.

### Actual mechanisms
Farm +11 grain to a settlement (with existing central grain transfer factor).
Granary +3 local grain per day, +80 food at construction.
Timber camp +3 global wood/day.
Quarry +2 global stone/day.
Market +4 treasury/day.
Wall +6.5% campaign auto-resolve defensive score per segment.
Watchtower +4% auto-resolve defensive score per tower.
Both defence bonuses apply only to an actually defending army at a settlement controlled by that defending faction, capped together at 32%. They do **not** influence or change Claude's 3D battle engine.
Exact costs in `ACTION_COSTS` of `src/campaign.js`. City planner uses shared cost manifest so displays cannot diverge.
Layouts are keyed `state.cityPlans[siteId]` and migrated lazily from settlement counters when old saves are opened. Buildings created through sidebar auto-place; buildings from City Builder are coordinate selected.

### Limits (critically important)
- It is a **2D isometric prototype**, not a continuous 3D terrain/world where one can physically walk into the town.
- Cities are not georeferenced polygons; 13×11 coordinate grid is arbitrary and not a literal Cannae/Canusium map.
- City wall segments are separate placements, not yet a connected wall circuit; no functioning gate/navmesh/destruction/fort tactical encounter.
- World armies draw miniature formations on map and interpolate locations per in-game day; not roaming soldier entities or fully real-time world movement.
- The battle draft is data transfer only. Actual siege scene coupling requires CLAUDE to define BattleContext and BattleResult after tactical fixes.
- No trade routes, food transport lines, labour/population, city damage or AI planning beyond existing simplified logic.
- This is an early mechanics candidate and not a claim of premium quality or full manual QA.
- Do not put a grand intact Roman city at Cannae in 216 BCE: Polybius describes it as already razed, with the occupied citadel and grain stores remaining strategically important.

### Separate files sent to Odin in chat (NOT bundled into GitHub archive)
`ROMA_REPUBLIC_CITY_AND_HISTORY_PREBUILD_01.zip`: 13 original low-poly 3D GLB city models, model-generator code, detailed asset rights manifest, seven research-tagged Second Punic War missions, and proposed city-to-siege context.
`ROMA_MEDIEVAL_SHARED_TERRAIN_ASSETS_01.zip`: Kenney CC0 models and reusable Hattin/Belvoir scenario technical examples.
These files are available as conversation attachments/downloads, NOT in this GitHub branch. No binary asset has been silently injected into current tactical code.

### Suggested review request
Inspect quality of the strategic data model and answer KEEP / REFACTOR / REBUILD, especially how to map city structures to your Three.js scene, real terrain, fortification geometry, garrison and battle result damage; don't take screenshots/data/export as proof of complete combat integration.
Do not modify original tactical engine, deploy live, or spend money without Odin's approval.

### Actual QA of latest candidate
AppDeploy reported deployment READY and zero reported frontend/network errors on snapshot `1792681669246`. Five behavioural QA test descriptions are included; full manual end-to-end gameplay remains to be independently verified.

### Source links
Polybius Cannae 216 BCE: https://sourcebooks.web.fordham.edu/ancient/polybius-cannae.asp
Official Total War Rome II split campaign and tactical battles: https://r2encv2.totalwar.com/en/manual/single-player/0013_enc_page_campaign_play_objectives/index.html
Physical geographic data, licences and risks: see previous 05_MAP_DATA_AND_RIGHTS.md.
