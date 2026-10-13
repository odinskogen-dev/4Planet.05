# GPT PROJECT LEAD HANDOFF — S4PIENS HUMAN SYSTEMS 01

**STATE: OUTPUT RECEIVED / AWAITING GPT AUDIT.** Maker = Claude. Not LIVE. Not Founder-accepted.
Date 2026-10-13 · Branch `claude/s4piens-human-systems-01` · stacked on `claude/4nation-country-object-01` (PR #444) · base `king/test@0b933aa`.

## RESULT
S4PIENS is a human-first Human Systems app on the shared 4PLANET engine:
- **Home**: the human (Homo sapiens) at the centre of an orbit of eight human needs. Food and Energy & industry open; the other six are shown as "In preparation" (honest, not clickable into empty pages). The grammar strip (Human → Need → Value chain → Place → Nature → Problem → Innovation → Action), two system cards with a worked example chain, and "How we keep it honest".
- **System view** (`/system/{slug}`), one renderer for every system:
  1. Hero: system name, thesis, human need; the human figure next to the chain.
  2. **Chain stepper**: seven stations (Need → Inputs → Production → Processing → Trade & transport → Use → End of life). Each station answers one question, with recognisable parts, a "4PLANET CONTEXT" label, "Where it becomes physical" (switches Atlas layers) and "What can go wrong here" (links to problems). Arrow keys, deep link `?step=`, sticky rail.
  3. Worked example (one loaf of bread / one steel beam).
  4. **Place**: shared ATLAS (kind `S4PIENS`) with layer chips per system (vegetation, rainfall, satellite, forest, fires / emitting sources, lights at night). "Open in full ATLAS".
  5. **In a country**: pick any country (shared Natural Earth identity, My country prefilled). The largest emitting sources for the system's sectors from Climate TRACE (bounded, ranked, t CO₂e + year, source drawer), plus a cross-link to the 4NATION country profile.
  6. **Nature**: living systems from the shared registry.
  7. **Problems** as inspectable objects: definition, where, drivers, affected living systems, what is uncertain, which station.
  8. **Innovation**: curated solution families from the shared registry, with **maturity and evidence on two separate scales** plus limits and actors.
- Same three themes (Light / Dark / Paper), 4PLANET ID sign-in, entries to ATLAS, 4NATION and 4PLANET.

## SHARED CORE (no new truth store)
- Interface primitives reused from 4NATION (`SourceDrawerProvider`, source lines, design tokens) with an S4PIENS accent override.
- Country identity + camera: `src/nation/geo.ts` (Natural Earth).
- Pressures / solutions / living systems: `src/planet/livingSystems.ts` (shared). **Added** pressures `ghg-emissions`, `nutrient-pollution` and solutions `renewable-electricity`, `long-duration-storage`, `low-carbon-steel`, `nutrient-management`, `food-loss-reduction`. Ids follow `@/planet/ids`.
- System ids use `humanSystemId("food-system")` (already used by Living Systems) and `humanSystemId("energy-and-industry")` (new).
- ATLAS view contract: new kind `S4PIENS` (additive).

## EVIDENCE
- `npm run build` PASS; `tsc` PASS; 66/66 related contract tests PASS (atlas-embed, atlas-place-runtime incl. middleware, naturebrain-world-model, core-convergence, unesco-green-data, product-context, identity, prototype-contracts).
- Visual QA Chromium 1440/834/430/390 × light/dark/paper, routes home / food (NO) / energy (processing, NO) / food end of life: **0 overflow, 0 page errors** (`qa/` in ZIP; fixture-watermarked, Climate TRACE values synthetic).

## FILES CHANGED (on top of #444)
New: `src/s4piens/{S4App,S4Home,SystemPage}.tsx`, `src/s4piens/systems.ts`, `src/s4piens/s4piens.css`, `docs/s4piens/*`.
Modified: `src/App.tsx` (s4piens.com host → S4App; `/atlas` on that host stays the embed renderer), `src/routes/router.tsx` (`/human-systems/*`), `src/planet/livingSystems.ts` (registry additions), `src/earth/atlasViewContract.ts` (kind), `src/nation/NationApp.tsx` (export `useSignedIn`), `functions/_middleware.js` (s4piens.com title/description, per-path SEO for the two system pages, sitemap), `scripts/nation-visual-qa.mjs` (`--s4piens`).

## DATASETS CONNECTED
| Source | Use | Licence | Path |
|---|---|---|---|
| Climate TRACE v7 | largest sources per country × sector | CC BY 4.0 | existing `/api/climate-trace` |
| ATLAS layers (NASA GIBS, Climate TRACE layer, UNESCO) | Place | existing registry | shared `/atlas` |
| Natural Earth | country picker, camera | Public domain | static |
| 4PLANET shared registry | living systems, pressures, solutions | 4PLANET context | `src/planet/livingSystems.ts` |

## DATASETS HELD
UN Comtrade (trade flows), UNEP IRP material flows, FAOSTAT, AQUASTAT, UNIDO, ILO, UNDP HDI: HELD. The source gate was not run and sandbox egress is blocked. Trade & transport and Grids stations say so plainly ("Not shown yet… only flows we can source"). UNESCO/WDI country context is reached through the 4NATION cross-link rather than duplicated.

## KNOWN LIMITATIONS / RISKS
- **Climate TRACE sector ids** (`agriculture`, `power`, `fossil-fuel-operations`, `manufacturing`) are from the v7 sector taxonomy but were **not verifiable offline**. A mismatch shows "unavailable", never zero. Verify first.
- New registry entries (pressures/solutions) carry maturity/evidence ratings set by Claude from general knowledge. They need GPT/NATUREBRAIN review and citations before being treated as canon. Station texts are explanatory 4PLANET CONTEXT.
- **s4piens.com today**: before this change the app had no s4piens host rule (the SPA rendered the default 4PLANET app with s4piens metadata). After release, s4piens.com shows S4PIENS. Founder decision.
- The ATLAS emissions layer loads energy sectors globally (existing layer); the country lens is the country-specific view.
- No flows are drawn on the map yet. This is deliberate.
- WebKit not run in sandbox.

## STATE CHANGE
None to LIVE. Review branch + PR only.

## NEXT
1. Merge order: #444 (4NATION) → this PR. AXE preview + real-data QA (Chromium + WebKit). Founder review of FOOD.
2. Source gates for FAOSTAT (production by country), UN Comtrade (flows) and Ember/IEA-alternative open electricity mix → fill Production, Trade and Use stations with sourced numbers.
3. Third system (Water or Built environment) using the same `HumanSystem` shape. No new UI is needed, only data and stations.
4. Citations for the new registry entries via NATUREBRAIN claims/evidence.
