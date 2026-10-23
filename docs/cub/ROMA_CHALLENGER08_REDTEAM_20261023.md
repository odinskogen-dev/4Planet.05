# CUB / ROMA: The Republic — Challenger 08 red-team review
Date: 23 October 2026. Scope: founder-uploaded `ROMA_CHALLENGER_01 8.zip`, `publish/web/index.html`, JavaScript source modules and included screenshots/tests.

## Verified evidence
- Source archive standalone HTML SHA256 `6ce526a7bbb95d1c57fad3c798d91d5a8e49986dcf63609a60b5db6ecd39b36c`, 5,172,560 bytes.
- This build's menu contains `Imperium — the known world` and `Cannae, 216 BC`; campaign starts at 264 BC.
- `src/campaign/world_data.js` / `state.js`: 160 provinces, 62 factions and 69 opening armies in a dynamically simulated strategic map; campaign progression, armies, logistics and battle prompts.
- Renderer-independent fixed-step RTS with construction, gathering, combat, morale, formations, bridges/walls and an actual WebGL client.
- Five independently executed local Node suites passed: `battle.mjs`, `builders.mjs`, `bridge.mjs`, `wallgap.mjs`, `spawn.mjs` (23 Oct).
- Provided `screenshots/qa_results.json` describes an emulated mobile smoke suite that passed. Its source is supplied with the ZIP; it is not evidence of a physical-device QA or a complete full-length campaign.
- Isolated remote browser QA for new game URL and ROMA front-page/detail-page dual links passed on desktop and mobile. Production release is separately gated.
- Saves and campaign are browser-local; versioned Challenger08 storage prefix is isolated from original ROMA and minimap storage.

## Biggest unresolved product quality gaps (ranked)

**P0 — Cold-start time and feedback.** Production-test Chromium timed out on an Imperium click at 16 seconds while another CI workload was running; isolated test passed. Profile first meaningful paint, campaign initialisation, relief texture decode and map startup on low-end iPhones. Require a progress/loading state; avoid expensive synchronous map creation on main thread; split/lazy-load campaign resources if necessary. Measure p50/p95 on real devices.

**P0 — Prove the *natural* campaign-to-battle-to-campaign loop.** Screenshots and unit simulations validate individual systems, but a complete player-driven campaign army encounter, casualty reporting, conquering territory and stable save/reload still need end-to-end acceptance. Test win, loss and retreat, plus mid-battle reload safety.

**P0 — Correct user onboarding.** Two full game modes are prominent but new users need a short contextual tutorial, a clear first objective, and a visible 'why this matters' progression hook. The Imperium opening has ~160 provinces/62 factions: offer a guided first 10 minutes and a quick return to strategy after tactical combat.

**P1 — Remove visible unit bases.** Existing delivered screenshots show conspicuous circular disks under the individual soldiers, conflicting with the intended living-world aesthetic. Keep subtle selection rings only for selected units and real terrain contact shadows for all others. Preserve unit readability at zoomed-out RTS scale.

**P1 — Terrain/architecture realism.** Existing screenshots show repeated simplified trees, flat expanses and prototype-level buildings. Prioritise biome variation, terrain microrelief, road connections, convincing Roman structures and terrain-matched materials; avoid cosmetic image overlays that obscure real gameplay.

**P1 — Mobile command UI density.** Provided screenshots show top-left resource badges, floating tutorials, an oversized formation wheel and bottom controls using much of the viewport. Consolidate resources behind one drawer, avoid covering active formation selection, and make controls contextual with a retractable safe-area-aware HUD.

**P1 — Strategy vs tactical pacing.** Campaign starts in 264 BCE, Cannae is 216 BCE. The simulation's `DAY_SEC=0.85` at 1× means a full 48-year progression at constant 1× would take about four hours if not accelerated, ignoring time skips/pauses. Prototype multiple starts (264/218/216 BCE) and a 'quick 216 BCE scenario' for playtesting without removing long-form campaign.

**P1 — Measure performance with actual gameplay.** Build is a 5.17 MB single HTML bundle before transfer compression. Track web load, WebGL initialisation time, GPU draw calls, memory, frame time and iPhone thermal behaviour during >20-minute AI battles and dense cities. Don't infer frame rate from emulated Chromium alone.

**P2 — Historical validation.** World geometry, settlements and 3D relief should document source/licence/accuracy; campaign era balances history and alternate outcomes. Add province/map provenance and label reconstructions vs speculative game design.

**P2 — Save/data robustness and analytics.** localStorage supports single-browser continuation only, not CUB ID/cloud sync. Add migrations, export/import, corruption recovery and privacy-aware event instrumentation before network multiplayer.

## Three high-value follow-up work orders
1. **ROMA cold-start + onboarding sprint**: profile startup, responsive progress, first 10-minute experience, quick Cannae/Second Punic War starts and clean mobile interactions.
2. **World + armies visual sprint**: selected-unit-only ground indicators, authentic equipment and architecture, biome/relief fidelity, mobile contextual HUD; compare actual rendered gameplay screenshots before/after.
3. **Campaign proof sprint**: one complete naturally fought strategic campaign encounter with verified casualties/territorial ownership and save/load, followed by telemetry-driven 20–30-minute retention playtests.

## Explicit product status
Challenger 08 is an independently playable single-player browser RTS/grand strategy prototype. It is **not a verified multiplayer MMO or premium-shipping-complete game**. No source has been merged into the historical Cannae build.
