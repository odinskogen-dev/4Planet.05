# 4PLANET ONE-INTERFACE — CONTINUITY CONTEXT
_Last updated: 2026-08-15 · pinned HEAD: 

## 0 · HOW TO USE THIS (read first, every new chat)
This file ORIENTS a fresh Claude instance. It is **not** the source of truth for code —
the **repo at the pinned commit is**. Never trust this doc (or memory) for code detail;
clone the repo, check out the branch, verify `git log` + gates, then act. See §10 protocol.

## 1 · WHO / AUTHORITY
- Odin Oddekalv (**P4NTHER**) = founder & FINAL authority. Respond in **Norwegian**.
- Chain: Odin (final) → GPT / Project Lead → **Claude** (bounded implementation, codes locally) → Codex (HOLD).
- Claude **never self-approves**. Status of every delivery = **"OUTPUT RECEIVED / AWAITING GPT AUDIT."**
- Never claim READY / COMPLETE / GATE PASSED / Beta / production / main-merge without GPT audit.
- Founder is token-conscious: minimise Drive time + tokens, best quality, no fabrication.

## 2 · WHAT THE PRODUCT IS
- 4PLANET "one interface": **React / TypeScript / Vite SPA**, deployed to Cloudflare Pages via GitHub.
- **Four first-line products: ATLAS / SPECIES / LIVING SYSTEMS / IMPACT** (4PLANET = universe/home).
- Domains: OCE4N_ / E4RTH_ / S4PIENS_ / 4CULTURE_, 16 missions total; P4NTHER = culture/night layer.
- Truth model everywhere: **KNOWN / INTERPRETED / UNKNOWN**. Never collapse the three axes
  (Review Status / Evidence Strength / Interpretation Status) into one confidence value.
- Non-negotiables: Observation ≠ Signal · Query Area ≠ Place · retrieval time ≠ event time ·
  no records ≠ absence · no invented geometry · no broken layers shown as operational.
- "Founder-supplied" = **provenance only** — never implies Skog/4PLANET ownership, licence, or commercial rights.

## 3 · CURRENT STATE (pin)
- Repo: **odinskogen-dev/4Planet.05** · package `4planet-v1-world` (v40).
- Branch: **species-premium/one-interface** · **HEAD: fe45a7c0e733b19d91eb711fcdedf0973dd7aa75**.
- Ancestry from audited base **ced0773**: OK (verify: `git merge-base --is-ancestor ced0773 HEAD`).
- Gates green at this HEAD: **typecheck 0 · build OK · smoke 28/28 · assets PASS**.
- Deploy: staging/preview only (Cloudflare Pages). Production (main) untouched — awaiting GPT audit.

## 4 · DONE (latest pass)
- Canon nav fixed: PRODUCTS_ = exactly ATLAS/SPECIES/LIVING SYSTEMS/IMPACT; logo=HOME; internal LS links.
- 4TELIER→4RT_; EN3RGY→EN4RGY (visible copy); JOIN 4_→JOIN 4PLANET.
- Purged FOUNDER_CLEARED → LICENCE_VERIFIED (licence-based). Orca de-inferred (provenance only).
- New `src/content/mediaManifest.ts`: Asset-ID → use → provider/creator → licence → attribution → context-limit.
- SP-001..010 downloaded, **content-verified (pixel, not filename)**, placed, wired into SPECIES via fromManifest();
  context limits surfaced in profile UI (attribution/licence + limitation overlay).
- 4PLAY/4RT identical-hero defect fixed (misplaced mussel removed from 4play; 4RT keeps MS-012 screenprint).
- LS-001 eelgrass registered, honestly not-yet-placed (empty localPath).

## 5 · PENDING (prioritised — NOT done)
1. **MS-013 controller for 4PLAY** — Drive returns it INLINE (not to disk). Have GPT/Codex commit it directly,
   or re-export so download lands on disk; then restore 4play secondary + place bank-hero (md5 must differ from 4rt).
2. **LS-001 eelgrass** — download+place; wire OSLOFJORDEN (SP-003/009/010+LS-001) & AMAZONIA (SP-005/006/007) anchors.
3. **LIVING SYSTEMS** render: vertical evidence cards → progressive relationship intelligence; KNOWN-requires-source contract; drop ambiguous public LIVE language.
4. **16 Missions** — activate per-mission `visualDirection` into ONE restrained signature mechanism (keep single Mission World template; not 16 apps).
5. **IMPACT** — table → premium proof rail (CURRENT STATE vs DESIGNED FUTURE).
6. **HOME** — chromeless ATLAS attract-mode only if it preserves audited World engine + perf.
7. Reduce heading+paragraph+card repetition; alternate cinematic/spatial/data/editorial/relationships. Awe via scale/real photography/spatial motion/progressive revelation — not bigger type/colour.
8. Flagship flow to perfect: HOME→ATLAS→ORCA RECORD→SPECIES→LIVING SYSTEMS→WH4LES_→IMPACT/JOIN as one continuous product; then AMAZONIA, OSLOFJORDEN, BEE→POLLINATION→FOOD.

## 6 · GOVERNANCE + STANDING DELIVERY RULES
- Claude **cannot push** to remote → delivers `git bundle --all` + lean text-only audit ZIP (<1MB, no binaries/node_modules/.git) + FINAL_SHA.txt + GPT_HANDOFF.md. GPT/Codex pushes + stands up preview.
- Ascending whole-number version names only (v20→v21, never reuse, never v19.1).
- Every image pixel-verified for CONTENT before wiring (never trust filename). Existing good images never deleted (supplement; replace hero only if thematically wrong).
- No main merge / squash / Beta / production / self-approval.

## 7 · ENVIRONMENT / BUILD FACTS
- Working dir when resuming: clone to `/tmp/4p-one`. npm. Node 20/22.
- Gate scripts: `npm run typecheck` · `npm run build` (tsc -b && vite build) · `npm run test:smoke`
  (= node --test scripts/smoke-v40.mjs scripts/prototype-contracts.test.mjs scripts/product-context.test.mjs)
  · `npm run assets:verify` (= node scripts/verify-assets.mjs).
- SPA routing: `public/_redirects` → `/api/* /api/:splat 200` and `/* /index.html 200`.
- Sandbox egress blocks (403): OpenFreeMap, BigDataCloud, Climate TRACE, WebKit. Climate TRACE deferred (browser reaches it post-deploy).
- Screenshots: Chromium at /opt/pw-browsers/chromium-1194/chrome-linux/chrome with
  --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist --no-sandbox;
  import Playwright via CommonJS require('.../@playwright/test'); serve dist as SPA on :4173.

## 8 · KEY FILE MAP
- `src/content/mediaManifest.ts` (Asset-ID manifest) · `src/data/speciesMedia.ts` (fromManifest/pending, RightsStatus LICENCE_VERIFIED|CLEARED|PENDING, hasShowableImage).
- `src/pages/integrated/Species.tsx` (index+profile, credit+limitation overlays) · `src/data/species.ts`, `truthSpine.ts`, `demoWhaleOccurrence.ts`, `src/earth/Context.tsx`.
- `src/data/livingSystems.ts` · `src/pages/v5/LivingSystems.tsx`.
- `src/data/impactUnits.ts` · `src/pages/integrated/ImpactPremium.tsx` · `src/impact/prototype.ts`.
- `src/content/imageRegistry.ts` (missionHero/MISSION_SECONDARY; 4play secondary REMOVED, 4rt=MS-012) · `assetManifest.ts` · `missions.ts` · `narratives.ts`.
- `src/components/layout/PublicShell.tsx` (PRODUCTS_ nav) · `src/product/{ProductSwitcher,ProductNav,productContext}` · `src/routes/router.tsx` (en3rgy→en4rgy, 4telier→4rt redirects).
- Assets: `public/assets/species/<name>/SP-00X{,-mobile}.jpg`; missions `.../<slug>/{hero,bank-hero}{,-mobile}.jpg`.

## 9 · MEDIA PIPELINE (Drive → repo)
- Drive root bank folder + register spreadsheet hold SP/LS/IM rights (transcribed into mediaManifest.ts).
- Download via Google Drive:download_file_content(fileId). LARGE → written to /mnt/user-data/tool_results/*.json
  (parse: json.load → base64 → b64decode). **SMALL results (e.g. MS-013) return INLINE only** — NOT on disk;
  the "newest tool_results file" fallback grabs the WRONG file. Verify title before decode; pixel-verify content.

## 10 · RESUME PROTOCOL (do this every new chat, in order)
1. Read this file end-to-end.
2. `git clone` repo → `git checkout species-premium/one-interface` → `git log --oneline -5`;
   confirm HEAD matches §3 (or ask Odin what moved).
3. `git merge-base --is-ancestor ced0773 HEAD` → must be OK.
4. Run all four gates; confirm green baseline BEFORE editing.
5. Ask Odin: did GPT audit land? did anything deploy/merge? what is today's target?
6. Only then implement — bounded, one concern at a time, re-run gates, deliver bundle + AWAITING GPT AUDIT.
7. **Update this file** (§3 HEAD, §4 done, §5 pending) as the last step of every pass.
