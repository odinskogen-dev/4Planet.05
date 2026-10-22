# CUB Toolchain 02 — Authorised agent integration guide

## Local QA

- `npm test` — 21 module and actual GLB rig tests.
- `npm run verify:assets` — all manifest assets must pass SHA-256, rights and GLB validation.
- `npm run verify:scenarios` — validate source-state and scenario envelopes.
- `python tools/asset_factory.py audit` — numeric geometry info and licence provenance.
- `python tools/make_rigged_characters.py` — reproducible two rigged GLB animation demos.
- `python tools/build_isolated_integrations.py` — regenerate ROMA/MEDIEVAL previews using either the preserved user-upload ZIP or by exactly restoring originals from the two included reversible previews (source SHA check).
- `python tools/smoke_browser.py` — Chromium standalone diagnostic: requires installed Playwright/Chromium; browser WebGL known to fail in sandbox.

## ROMA decision seam

Inspect existing versioned ROMA staging (`roma-the-republic-campaign-01-b2li4t`, exact snapshot `1792681669246`) and Claude's up-to-date independent battle source **before any actual integration**. The isolated ROMA preview in this ZIP is `ROMA_ORIGINAL_READ_ONLY.html` from MEDIEVAL Build 03, NOT Claude's newest revised version. This difference matters.

- Campaign property mapping: current ROMA strategic arrays `armies:[{id,owner,at,men,morale,supply,move}]`, `settlements:{siteId:{owner,farms,granaries,fort,...}}`, `cityPlans`, `treasury`,`food`, and `roads:[from,to,cost]` differ from generic `army.soldiers`,`province` schemas. Use adapters; never rename native fields globally.
- Real gameplay adoption candidate: replace duplicated pure route-cost calculation via `src/navigation.js`, only after comparing found path, blockade and deterministic save restore against native campaign behaviour.
- UI, keyboard, 3D classes, camera, pathfinding, rendering, unit balancing and original battle results remain Claude-authoritative. `src/battles.js` is a **draft data contract**, not working tactical integration.

## MEDIEVAL decision seam

User-provided `MEDIEVAL_KINGDOMS_PREMIUM_BUILD_03(1).zip`: original immutable source `ROMA_ORIGINAL_READ_ONLY.html`; `MEDIEVAL_KINGDOMS_PREMIUM_CANDIDATE_03.html` generated from additive `medieval_patch.js` + `premium_patch.js` etc. Hattin and Belvoir have different unit/unit owner mapping and siege wall colliders. Do not inject CUB grid navigation into original `Wi` path logic; compare traversability offline first. The existing newer Medieval MMO AppDeploy candidate is a separate app with its own architecture and is **not** edited by this sprint.

## Native save and fight safety

- Namespaces and versions are game-specific (ROMA saves must not load as MEDIEVAL).
- Validate battleId, location and precise matching armies; apply casualties once only; never invent outcome/army numbers.
- City structure grid in `cityPlanToSiegeGrid` is an **abstract prototype**. It may not correspond to actual tactical metres, 3D coordinates, mesh colliders or archaeological ruins.
- Siege gates can be opened and destroyed in the standalone grid planner, but are not placed/destroyed in Claude's 3D RTS.

## Asset chain

- `assetbank/manifest.json` is the asset manifest **for this package**, not a new competing BRAIN canonical rights database. BRAIN retains project/global source/rights authority.
- New files go through quarantine: valid licence and evidence are mandatory; no auto release; block overwrites and duplicates.
- Use `glTF Transform` for future real visual LOD/compression if approved; the current Asset Factory does audits and 12-triangle **collision proxy** creation, not production LOD.
- Each procedurally rigged model has joints, skin, inverse-bind matrices and a 5-frame cyclic animation, but is intentionally a simple technical figure with no fully natural gait.

## Integration acceptance gates

1. Exact source version/sha pinned and original rebuild still passes.
2. New module independently tested and external-rights proof retained.
3. Side-by-side native gameplay tests on desktop and mobile; no saved-game migration regression.
4. Before/after frame time, draw-call, memory and bundle size metrics actually measured (do not claim unmeasured improvements).
5. Review and explicit founder authorization before external/public deployment.