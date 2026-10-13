# GPT PROJECT LEAD HANDOFF — 4NATION COUNTRY OBJECT 01

**STATE: OUTPUT RECEIVED / AWAITING GPT AUDIT.** Maker = Claude. Not LIVE. Not Founder-accepted.
Date 2026-10-13 · Branch `claude/4nation-country-object-01` · Base `king/test@0b933aa` · PR → `king/test`.

## RESULT
4NATION is rebuilt as a **top-down Country Object**, not a decision feed (Founder decisions 13 Oct 2026):
- **Home** (`/` on 4nation.org): interactive orthographic globe (drag, hover, select a country), large search (`/` or ⌘K anywhere), four launch profiles (Norway, Brazil, Japan, Kenya), "three depths" explainer, A–Z index of 237 countries/territories by continent.
- **Country Object** (`/country/{slug}`), one renderer for every country:
  - Hero: country name, generated identity sentence, globe flown to the country with the capital marked, six-cell readout — Population, Capital, GDP per person, Life expectancy, Area (≈, computed), World Heritage count. Every value shows its year and a source line that opens a **source drawer** (dataset, period, licence, retrieval time, "does not show", full year table).
  - Chapters (sticky chapter nav): 01 Land · 02 People (trend charts, age structure) · 03 Economy & work · 04 Learning · 05 Nature & heritage (World Heritage, biosphere reserves, geoparks, OBIS marine summaries) · 06 Capital (first place context, ATLAS view on the capital) · 07 Decisions (**only when a source-backed case exists**; today Norway → Oslofjord case, kept deep) · Sources & method.
  - **Atlas mode** (`?mode=atlas&l=…`): the SHARED 4PLANET ATLAS (same `/atlas` MapLibre renderer via the existing embed contract) with a curated layer panel (Earth / Recognised places / Ocean). Layers are off by default and load only when switched on. Deep link preserves layers.
- **Themes**: Light ("projected on a wall": cool grey surface, survey grid, soft beam), Dark, Paper (pure white, hairlines). One accent token `--n-accent` = 4PLANET Blue #2E2EFF.
- **Type**: DM Sans for the interface; Instrument Sans only for display headings; Fragment Mono only for source/year/coordinates.
- **4PLANET ID**: header Sign in / Account via the existing `identityClient` (id.4planet.org, return to the same URL).
- **My country**: one tap, saved on device; appears in header + home. Account sync = next step (no new table created).
- **Share**: native share sheet / copy link; Atlas deep links keep layers.
- **Entries**: Atlas ↗ and 4PLANET ↗ in header, menu and footer; "Open in full ATLAS" from Atlas mode and the capital.
- **Preserved**: the existing decision product (`src/pages/nation/NationPage.tsx`, Stortinget/SSB/Oslofjord) now lives at `/decisions` unchanged.

## EVIDENCE
- `npm run build` PASS (full prebuild gates). `tsc --noEmit` PASS on base `0b933aa`.
- Contract tests PASS 46/0: atlas-embed, unesco-green-data, nation-stortinget, nation-ssb, nation-oslofjord-source, product-context, identity.
- `node scripts/elite-operating-doctrine-gate.mjs` PASS.
- Visual QA (`scripts/nation-visual-qa.mjs`), Chromium, 1440 / 834 / 430 / 390 px × light / dark / paper, routes home / norway / kenya / japan-atlas: **0 horizontal overflow, 0 page errors** (28 screenshots in the ZIP under `qa/`).
- Worker unit check (local): correct per-path title, canonical, robots (`/country/chad` → noindex), sitemap.

**Important:** the sandbox cannot reach UNESCO DataHub, World Bank, NASA GIBS, map tiles or Google Fonts. Screenshots therefore use a **watermarked LAYOUT FIXTURE** (orange bar "SYNTHETIC VALUES, NOT SOURCE DATA") and an empty basemap. **No number in the screenshots is evidence.** Real values must be verified on the preview.

## FILES CHANGED
New: `src/nation/{NationApp,NationHome,CountryPage,Globe,NationFooter,ui}.tsx`, `src/nation/{geo,data}.ts`, `src/nation/nation.css`, `src/nation/countries.generated.json`, `public/nation/geo/**`, `scripts/build-nation-geography.mjs`, `scripts/nation-visual-qa.mjs`, `docs/4nation/{STATE,DEPLOY_CLOUDFLARE,GPT_PROJECT_LEAD_HANDOFF}.md`.
Modified (small, additive): `src/App.tsx` + `src/routes/router.tsx` (nation host/route → NationApp), `src/earth/atlasViewContract.ts` (optional navigation `camera`; existing behaviour unchanged), `src/planet/sources.ts` (Natural Earth registered), `ops/nation/4nation-live-worker.js` (per-path meta + sitemap; removed injected floating ID button because the header owns sign-in), `.github/workflows/4nation-discovery-live.yml` (title assertion).

## DATASETS CONNECTED (all via existing shared contracts — no new store)
| Dataset | Use | Licence | Path |
|---|---|---|---|
| World Bank WDI via UNESCO DataHub `wdi001` | 18 indicators, series 2000→ | CC BY-SA 4.0, attribution World Bank | `/api/unesco-country` (existing) |
| UNESCO World Heritage `whc001` | count + list | CC BY-SA 4.0 | `/api/unesco-data` (existing) |
| UNESCO MAB `mab001`, Geoparks `eg0001` | lists | CC BY-SA 4.0 | same |
| IOC-UNESCO / OBIS `ioc001` | marine area summaries (records, species) | CC BY-SA 4.0 | same |
| Natural Earth admin-0 + populated places | outlines, names, ISO, capital, approx. area | Public domain | static build files |
| ATLAS layers (NASA GIBS etc.) | Atlas mode | per existing layer registry | shared `/atlas` |

## DATASETS HELD
- Wikidata identity facts ("known for", national symbols, languages): HELD — no adapter, egress blocked, rights/quality gate not run.
- "Famous species" per country: HELD — occurrence ≠ national species; needs an IUCN/national-list source decision.
- Protected areas (WDPA): HELD (token not wired; existing layer stays `planned`).
- Energy / water / forest country indicators: HELD — not in current `wdi001` field set; add fields in `functions/api/unesco-country.ts` after source gate.
- Cross-country "what makes this country distinctive" ranking: HELD — needs a bounded global snapshot job (per-country API refuses global reads by design).

## TEST RESULTS / WHAT GPT/AXE MUST STILL RUN
1. Deploy preview (DEPLOY_CLOUDFLARE.md Step 1).
2. Real-data run, no fixture: `PW_EXECUTABLE=… node scripts/nation-visual-qa.mjs https://<preview> qa-real` (Chromium) and `--browser=webkit`.
3. Spot-check values for NO/BR/JP/KE against data.unesco.org (`wdi001`) and whc.unesco.org counts.
4. Check sign-in round trip on the preview origin (is `*.4planet-05.pages.dev` in `TRUSTED_RETURN_ORIGINS`? If not, test on 4planet.org/4nation).

## KNOWN LIMITATIONS / RISKS
- **UNESCO country matching**: World Heritage uses `iso_codes`; geoparks use `countries` (may be names). Matching accepts ISO2 tokens or exact country name. Transboundary sites count for each listed country. Verify counts.
- **Area** is computed from 1:50m outlines and labelled "≈ … computed from generalised outline"; it is not the official figure.
- Natural Earth uses de facto boundaries; footer and source drawer say this is not a 4PLANET position. Disputed territories render with neutral wording.
- `/api/unesco-data` returns whole datasets (bounded by `maxRecords`) and filters client-side; cached per session. Acceptable now; move to server-side country filter if payloads grow.
- My Country is device-local only.
- Atlas mode embeds `/atlas` in an iframe on the same origin; on 4nation.org that works via the existing App.tsx rule. Basemap/tiles not verifiable in sandbox.
- WebKit not run in sandbox.

## STATE CHANGE
None to LIVE. New review branch + PR only. 4nation.org still serves the previous artifact until the worker's `IMMUTABLE_ORIGIN` is changed under Founder authority.

## NEXT
1. GPT audit → AXE preview deploy → real-data QA (Chromium + WebKit) → Founder review of Norway.
2. Small follow-ups (independent PRs): account-synced My Country on the existing 4PLANET ID profile; Wikidata identity adapter through the source gate; energy/water/forest fields in the WDI adapter; share image cards; decision streams once national/local sources are admitted.
3. Claude continues with **S4PIENS (s4piens.com)** on the same contracts — see `docs/s4piens/STATE.md` when created.
