# CUB SHARED GAME TOOLCHAIN 02 — START HERE

**22 October 2026 · GAME LAB / PRJ-ODIN-003 · isolated engineering candidate**

This is a real working incremental release built on `CUB_SHARED_GAME_CORE_01`. It is intended for the existing ODIN BRAIN / GAME LAB project, NOT a new project, new studio OS, new canonical register, independent game engine, public product, or a claim of production-ready artwork.

## In 60 seconds

```bash
npm test                         # 21 passing core + glTF rig tests
npm run verify:assets            # 29/29 physical GLB manifest checks
npm run verify:scenarios         # 3 historical scenario files pass
python tools/asset_factory.py audit
python tools/build_isolated_integrations.py
python tools/smoke_browser.py    # Optional Playwright + Chromium offline diagnostic
```

**In this release:** independent JavaScript game-domain modules for campaign economy, supply/marches, bridge, battle outcomes, saves, geography and scenarios; a tactical grid planner with closed/open/destroyed gates; animation keyframe interpolation and per-actor detail-level selection; asset intake quarantine + rights/hash/geometry audit; collision-only box proxies; **two genuinely rigged, skinned and keyframed GLB demos (soldier and horse)**, 20 prior original models and 7 prior Kenney CC0 models; two isolated playable-build HTML candidates that import the same optional diagnostics bridge.

**IMPORTANT LIMIT:** Browser smoke passes for shared-core diagnostics on both original ROMA Challenger and MEDIEVAL Build 03, and both original builds' full source is reversibly preserved. The headless environment reports `Error creating WebGL context` for both native 3D engines. No claim of completed real-time 3D game integration or actual performance improvement. **The shared core is not installed in Claude's latest ROMA tactical build.**

## Look here (minimal agent route)

1. `src/index.js` — imports and stable modules: economy, turns, navigation, scenario, save, battles; new `strategy.js`, `siege.js`, `animation.js`, `quality.js`.
2. `tools/asset_factory.py` — offline rights-conscious asset intake, geometry/hash audit, 12-triangle AABB **collision proxies**. Does NOT falsely advertise visual mesh optimisation.
3. `tools/make_rigged_characters.py` — deterministic, generated GLB skinning/animation for demo soldier and horse. 5 keyframes/1 walk cycle each; skinned geometry physically checked.
4. `integrations/bridge.mjs` and `integrations/previews/` — same shared JS imported into two isolated copies; the original game runtime logic is untouched. Previews are not production builds.
5. `qa/` — complete local results, including known headless WebGL failure.
6. `docs/AGENT_HANDOFF_INTEGRATION.md`, `docs/SOURCE_PROVENANCE_AND_QA.md` — instructions for authorised developer agents.

## Actual physical resources / limitations

- **29 manifest GLBs**: 20 pre-existing CUB procedural original models, 7 existing Kenney CC0 models, 2 newly generated rigged models. All engineering-quality assets remain `NOT_PRODUCTION_APPROVED`.
- **5 additional derived collision-only GLBs** in `assetbank/generated/collision-proxies/`, *not* counted as 29 original art models. Proxies are axis-aligned 12-triangle boxes; do not claim they are navmeshes or mobile visual LODs.
- 16 external provider shortlist entries remain **research only**, not downloaded. There are no new Quaternius, character packs or textures from the public Internet because the build runtime has no external DNS.
- No high-quality soldier/horse art rigging, networking, terrain height extraction, Recast navmesh, real draw-call/frames-per-second measurements, audio engine, multiplayer, or complete siege; such features remain separate future work.
- World historical scenario files distinguish reconstruction and sources; they are not source-verified full historical datasets.
- Existing ROMA/MEDIEVAL/ITALY/VILLAINS/ORCA source has **not been modified**; no live deployment.

## Why this is a valuable increment

This bundle supplies actual reusable code, licence-gated assets, demos and QA for *two* game candidates, rather than a speculative top-down replacement for Claude's existing tactical engine. It supports safe step-by-step adoption: test a module in an isolated title, compare with original source and gameplay, then consider merging only if it improves the actual game.

## Rights / no-spend

- CUB original generated sources/models: project-original candidate; final contributor chain and commercial/visual clearance remain review gates.
- Prior Kenney sources: retained `assetbank/LICENSES/`, physical CC0 model hashes and original source URLs.
- All other source/game builds remain under their existing rights; the HTML previews package existing source **only for internal development**.
- Optional external references: glTF Transform (inspect/compress/simplify; not installed here), Recast Navigation (later 3D navmesh; not installed). Evaluate licences/version before adoption; no paid tools used.

**Project home, release and canonical retrieval:** existing ODIN BRAIN → GAME LAB / PRJ-ODIN-003. Register this ZIP in the existing home, not a second source of truth.