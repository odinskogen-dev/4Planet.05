# ROMA: THE REPUBLIC — Campaign Staging 01

Isolated development branch: `roma-campaign-staging-20261021`. No changes to the existing public ROMA route.

Test build: https://roma-the-republic-campaign-01-b2li4t.v2.appdeploy.ai/

This is a staged regional campaign surrounding the **existing Challenger Three.js** game, not a complete replacement for that engine.

## Development

From `experiments/roma-campaign`: `npm install && npm run dev`. The prepare step copies the unchanged local `site/roma/index.html` into `public/legacy.html` so the same-origin 3D tactical adapter works. The tracked coast and river data come from **Natural Earth ne_110m** (public domain); they depict present-day physical geography only. The map's political and military setup is an approximation under historical review. Local-region DEM/elevation data and exact tactical army composition handoff are not complete.

## Prototype gameplay

Advance time in days. Select an army, choose adjacent town, and march. Build farms/granaries/fortifications, recruit at an occupied Roman settlement, and monitor the Cannae road blockade. When armies collide, choose auto-resolve, withdrawal, or launch the preserved Challenger 3D battle. Tactical casualty proportions can be applied once to the campaign ledger. The 3D battle still has Challenger's original starting formations; precise Roman/Carthaginian army composition transfer is future work.

## Safety and integrity

Existing production assets in `site/roma` must not be modified by this module. Campaign saves are versioned and isolated under `roma_republic_campaign_stage01_v1` in browser localStorage. Existing Challenger save keys are not touched. Release staging only after testing on real iPhone + desktop, validating loss accounting and checking asset/IP rights.

## Known limitations

Map geography uses Natural Earth 110m coasts/rivers, no historical shoreline corrections or DEM. Currently Apulia has a basic economic simulation, simplified AI and scripted starting military positions. Cities and alliances are a dated research hypothesis, not fully sourced historical authority. In the tactical bridge, 3D troops are not exact reflections of the strategic army; the results adapter maps observed casualty fractions. Existing 3D code is a compiled bundle; full source recovery remains required. AppDeploy QA verified page load without frontend/network errors, not a complete manual 30-minute playtest.

## Assets

Natural Earth vector source: https://github.com/nvkelso/natural-earth-vector (public domain). Original ROMA Challenger source in the branch ancestor: `site/roma/index.html`. No commercial third-party game assets imported.
