# ROMA — THE REPUBLIC | COMPLETE CAMPAIGN HANDOFF TO CLAUDE
CUB GAME LAB / PRJ-ODIN-003 / HIS-002 / 22 OCTOBER 2026
Owner: Odin Oddekalv. Prepared by AXE (ChatGPT).
Status: reviewable frozen handoff, NOT approved to merge/deploy.

## 60-second briefing
You already own/developed the ORIGINAL ROMA Challenger tactical/battle engine. This ZIP contains the separate strategic campaign prototype developed by AXE, plus findings, strategy and data provenance. Examine it critically and decide whether to KEEP, REFACTOR or REBUILD any subsystem. It is not a finished premium game. Do not assume the prototype is a mandated architecture.

Our proposition: an unusually good, historically grounded grand strategy campaign with the real Mediterranean and neighbouring world as its long-term geographical canvas; begin with one extraordinary, playable chapter around Canusium, Cannae and the Aufidus (Ofanto) river in 216 BCE, during the Second Punic War. Deep settlement building, economy, armies, supply, trade, land/naval strategy, factions, diplomacy, sieges and alternative history should ultimately feed into your already-developed tactical battle gameplay.

## What has actually been implemented
1. World-spanning, scrollable/zoomable Web Mercator HTML canvas for -18° to 70° longitude and +10° to +61° latitude; Natural Earth physical polygons and major rivers.
2. A functional but small Apulia campaign: nine playable settlements (including Rome), 10 connected schematic routes, initial Roman field army and Carthaginian army, economic tick, resource inventory, recruitment, farms/granaries/fortification, limited food/supply, march orders, deterministic automated encounters, saved state.
3. An isolated iframe bridge to the UNCHANGED ROMA Challenger 3D engine, with limited casualties-to-campaign result coupling; exact campaign army composition and terrain are NOT injected.
4. Three basemap options: 2016 EOxCloudless satellite (remote tiles), Mapzen/AWS elevation-derived 2D relief (remote Terrarium tiles) and the older hand-painted historic fallback. A map mode preference is persisted.
5. Desktop/mobile campaign UI, marker painting, basic resource and command screens, tests/test descriptions.
6. A substantial red-team audit and premium vertical-slice plan included in this handoff.

Staging URL: https://roma-the-republic-campaign-01-b2li4t.v2.appdeploy.ai/
AppDeploy project ID: roma-the-republic-campaign-01-b2li4t
Last confirmed READY snapshot: 1792611566483.
Staging is NOT the public ROMA project.

## Mandatory distinction: what is NOT included
The original ROMA battle-engine bundle, called public/legacy.html in staging, is intentionally NOT copied into this handoff: it is YOUR code, protected from modification, and about 2 MB. Restore or point to your existing exact original build to test the iframe. NEVER commit an empty placeholder on top of your source. Your own current codebase remains the source of truth for the battle scene. This archive includes every other campaign file from the staging snapshot.

Also NOT built: geographic 3D terrain meshes; realistic historical road routes; robust tactical campaign bridge; calibrated historical force strengths; deep factions/diplomacy/naval mechanics; a multiplayer backend; meaningful chapter victory screen; sophisticated AI opponent; deployment to public domains.

## File reading order (suggested <15 minutes)
1. This README.
2. 01_WHAT_AXE_BUILT_AND_HOW.md (architecture; limits; integration).
3. 02_CLAUDE_REVIEW_AND_RED_TEAM.md (17 specific defects with exact code locations).
4. 03_HISTORY_216_BCE_AND_SOURCES.md (primary history and important corrections).
5. 04_WORLD_FACTIONS_AND_GRAND_CAMPAIGN_VISION.md (locked ambition versus future ideas).
6. 05_MAP_DATA_AND_RIGHTS.md (reuse requirements).
7. 06_RECOMMENDED_BUILD_PLAN.md (decision gates and QA).
8. src/campaign.js (core; focus renderUI, movementDay, develop, calculateBattle).
9. src/geo-tiles.js, src/map-art.js, public/*.geojson, index.html, css and tests.

## Claude: requested response, not uncritical adoption
Review the assets and give Odin a technical verdict: what to preserve, what to replace, what to adapt to your actual ROMA engine; what must change to reach a premium 15–30 minute playable vertical slice; time/effort and risk, mobile performance, and the best development order. You may reject AXE's implementation choices if you explain the trade-offs. Source merge must be explicit, isolated and reversible. NO public deployment, NO new spending, NO changes to original ROMA battle mechanics without separate founder approval.
