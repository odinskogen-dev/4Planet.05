# S4PIENS Human Systems 01 — STATE (resume file)

Read first when resuming. Status: OUTPUT RECEIVED / AWAITING GPT AUDIT.

## Authority
Founder chat 2026-10-13 + GPT order "SHARED DATA VALUE STEP-UP 01" + Addendum 02 (S4PIENS) + GPT context handoff.
S4PIENS = Human Systems / value chains (NOT 4SAPIEN, no personal footprint, no guilt score). FOOD = first deep proof; ENERGY & INDUSTRY = transfer test.

## Decisions taken (Claude, product/UX lead — reversible)
- Built on top of `claude/4nation-country-object-01` (shares `src/nation/ui.tsx`, `nation.css`, geo, data helpers). Merge PR #444 first.
- Accent: S4PIENS domain #FF4D22 (ATLAS domain registry). Small text uses brand Rust #842810 / Light Orange #FF7D50. Pressure never shown by colour alone.
- Hosts: s4piens.com host-root (existing Pages custom domain, `functions/_middleware.js` PUBLIC_HOSTS entry); `/human-systems/*` on 4planet.org. Existing `/s4piens` → `/domains/s4piens` redirect untouched.
- Station text = labelled "4PLANET CONTEXT". Quantities only from Climate TRACE (existing `/api/climate-trace`, country + sector, bounded).
- Pressures/solutions added to the SHARED registry `src/planet/livingSystems.ts` (ghg-emissions, nutrient-pollution; renewable-electricity, long-duration-storage, low-carbon-steel, nutrient-management, food-loss-reduction). No parallel store.
- AtlasView kind "S4PIENS" added (additive).

## Progress
- [x] Model `src/s4piens/systems.ts` (grammar, 2 systems × 7 stations, problems, curated solutions, trace sectors, orbit)
- [x] App `src/s4piens/{S4App,S4Home,SystemPage}.tsx` + `s4piens.css`
- [x] Routing (App.tsx host, router `/human-systems/*`), middleware per-path SEO + sitemap
- [x] QA Chromium 1440/834/430/390 × light/dark/paper (fixture): 0 overflow, 0 errors
- [x] Docs + ZIP + PR

## Held / next
- Trade flows (UN Comtrade), material flows (UNEP IRP), FAOSTAT, AQUASTAT: HELD — source gate not run, sandbox egress blocked.
- Systems WATER, BUILT ENVIRONMENT, MOBILITY, FASHION, TECHNOLOGY, TRADE shown as "In preparation" (not openable).
- Actor/capital traversal: architecture hook only (solution.actors from shared registry). No new actor DB.
