# 4NATION Country Object 01 — STATE (resume file)

Any agent resuming this work reads THIS file first. Updated after each step.

## Authority
- Founder decisions in chat 2026-10-13 (Odin ↔ Claude) + GPT execution order "SHARED DATA VALUE STEP-UP 01" + Addendum 01 (4NATION) + Addendum 02 (S4PIENS) + GPT context handoff.
- Status of output: OUTPUT RECEIVED / AWAITING GPT AUDIT. Never LIVE, never Founder-accepted by self-declaration.

## Founder decisions (2026-10-13)
- 4NATION = understand a country top-down. NOT a decision feed. Decisions = one chapter, shown only with real data.
- Place context starts with the CAPITAL. Oslofjord is a deep example, never first-screen.
- First view: key facts fast (population, capital, economy, nature, recognised for) + geo. "NASA control room × Apple clarity". Futuristic, technical, clean — not AI-looking, no glow/glass.
- Modes: PROFILE (default: facts + chapters) and ATLAS (map-first, shared engine).
- Themes: LIGHT ("projected on a wall"), DARK, PAPER (pure white, hairlines).
- Accent: 4PLANET Blue #2E2EFF (single token `--n-accent`, swappable).
- Type: DM Sans carries almost everything; Instrument Sans only for large display; Fragment Mono only for source/year lines.
- Copy: British English. Localisation later.
- Must: 4PLANET ID sign-in, "My Country", shareable deep links, entry to 4planet.org + full ATLAS.
- Later: decision streams (national + local), alerts, share image cards, true-size compare.
- Design is NEW — do not port old 4NATION visual design. Reuse only plumbing.

## Architecture (verified in repo, king/test @ 73e8a8d)
- SPA (Vite/React 18/RR7). 4nation.org = Worker `ops/nation/4nation-live-worker.js` proxying an immutable Pages artifact; `App.tsx` renders the nation app on nation host.
- Shared map engine = `/atlas` World (MapLibre 6) embedded via `AtlasEmbed` iframe + `atlasViewContract`. No second engine.
- Shared country data contracts = `src/data/unescoOpenData.ts` (CountryIdentity, CountryMetric, Attribution, Limitation, DataVintage) + `src/data/unescoCountryContext.ts` (WDI via UNESCO DataHub, CC BY-SA 4.0) + Pages Functions `/api/unesco-country`, `/api/unesco-data`.
- UNESCO ATLAS layers already on HEIR: unesco-biospheres, unesco-world-heritage, unesco-geoparks, unesco-ocean-biodiversity.
- Existing decision product: `src/pages/nation/NationPage.tsx` (Stortinget/SSB/Oslofjord case) — PRESERVED, moved to `/decisions`.
- Sandbox egress: only GitHub reachable. UNESCO/WB/GIBS/Wikidata blocked → runtime data cannot be verified here; QA uses a labelled layout fixture.

## Plan / progress
- [x] Recon
- [x] Geography build (Natural Earth, public domain) → `public/nation/geo/*`, `src/nation/countries.generated.json`
- [x] NationApp (`src/nation/*`): home globe, Country Object (Profile/Atlas), 3 themes, ID sign-in, My Country (device), share
- [x] Worker (`ops/nation/4nation-live-worker.js`): per-path title/description/canonical/robots/OG, sitemap with launch countries, removed floating ID button (header owns sign-in)
- [x] QA Chromium 1440/834/430/390 × light/dark/paper with LAYOUT FIXTURE: 0 overflow, 0 page errors. WebKit NOT run (no WebKit in sandbox) → AXE must run `--browser=webkit`.
- [x] ZIP + GPT handoff (docs/4nation/DEPLOY_CLOUDFLARE.md, GPT_PROJECT_LEAD_HANDOFF.md); branch pushed, PR → king/test
- [ ] Then S4PIENS (s4piens.com) — separate STATE in docs/s4piens/

## Open / held
- "Known for" uses UNESCO World Heritage inscriptions (sourced). Wikidata identity facts HELD (no adapter, egress blocked).
- Distinctiveness ranking across all countries HELD (bounded per-country API; needs a global snapshot job).
- Protected areas (WDPA) remain HELD (token not wired) — not shown.
