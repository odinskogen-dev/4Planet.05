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

---

# ═══ LOCKED PROGRAMME: PLANETARY EXPERIENCE MEGASPRINT v1.0 ═══
_Ledger only. Source truth = exact SHA + Git history + immutable bundle. Never assume remote GitHub == local._

## SOURCE AUTHORITY
- START_SHA (canonical Claude authority): efdf3bcb69a8dfa97afdad0f58c42d8307a84280
- Working branch: megasprint/planetary-experience-v1 (non-destructive, off START_SHA)
- Rules: NO code deletion · NO destructive history · NO main merge · NO production · NO self-approval · NO secrets in backups.

## OPERATING METHOD
- One coherent megasprint, delivered in sequential recoverable checkpoints.
- After each Part: commit · update this ledger (§STATUS) · retain recovery bundle · produce evidence · return checkpoint · status "AWAITING PROJECT LEAD AUDIT".
- Continue to next Part unless told STOP/HOLD, while token/context permits. If near exhaustion: STOP CLEANLY (commit, bundle, update ledger, state exact next action). Never leave material work only in an uncommitted tree.

## NORTH STAR
Turn a strong collection of pages/products into ONE LIVING PLANETARY UNIVERSE:
PLANET → LIFE → RELATIONSHIPS → PRESSURES → RESPONSES → EVIDENCE/ACTION.
Awe via planetary scale, life, photography, spatial continuity, progressive revelation, calm motion, intelligence, evidence, silence, precision — NOT via oversized type, decorative animation, or gratuitous effects.
Preserve brand tension: cinematic AND source-backed · emotional AND precise · optimistic AND honest · beautiful AND explicit about uncertainty.
Truth architecture (NOT OPEN / PARTNER VALIDATION PENDING / source state / context boundaries / KNOWN-INTERPRETED-UNKNOWN / planetary-context distinction) is a PREMIUM BRAND ASSET — strengthen, never hide.

## PARTS (LOCKED)
- PART 0 PROTECT THE SOURCE — verify SHA, working branch, backup/bundle, START_SHA, ledger. [done]
- PART 1 FIX THE FRAME — canonical responsive shell; scroll-aware header (baselines ~80px hide / ~12–16px reveal / ~250–300ms, TUNE not dogma); zero content collision @390/430/768/1024/1440; env(safe-area-inset-*) (iOS = FOUNDER DEVICE SIGNOFF REQUIRED); product IA ATLAS/SPECIES/LIVING SYSTEMS/IMPACT, logo=HOME, no 5th product, don't mix Mission-domain IA; visible switcher + current-product label; universe colour law (rhythm not noise); ATLAS mobile control/tap cleanup; + calm MOTION FOUNDATION (scroll-reveal 8–12px/~500ms, Ken Burns hero ~1.05x/20s, soft hover/fade 200–250ms) all prefers-reduced-motion gated.
- PART 2 CREATE THE MAGIC — EARTH→ORCA→LIVING SYSTEM continuity spine + reusable transition grammar (planet→place/species→relationship); preserve identity/location/image/state/source/context across handoffs; calm/spatial/physical/purposeful motion; preserve URLs/browser-nav/a11y/reduced-motion.
- PART 3 MAKE THE INVISIBLE VISIBLE — (A) Living Systems: article+cards → anchor→relationship→deeper→pressure→response, one relationship at a time, photo/map/context reacts, no spaghetti graph, KNOWN/INTERPRETED/UNKNOWN+source+boundary inspectable without bureaucracy. (B) Mission worlds: one shared engine, activate per-Mission visualDirection; strong mechanisms first for WH4LES_/COR4L_/CLE4N_/AM4ZONIA_/FOOD_/EN4RGY_/4FILM_/4RT_, then all 16 get a deliberate signature state (distinguishable before reading names). CLE4N_ semantic fix: material→river/coast→ocean→recovery→measurement; whale-first belongs to WH4LES_. Preserve rights/provenance.
- PART 4 PLANETARY FRONT DOOR — Home living-Earth attract-mode ("the planet before the interface"), no full ATLAS controls on Home. TECHNICAL VETO: if it destabilises ATLAS/WebGL/mobile/perf, keep strongest still + document blocker.
- PART 5 EDITORIAL + AWE CONVERGENCE — whole-product creative-direction sweep; break heading→paragraph→border→card; sequence PLANET/LIFE/EDITORIAL/RELATIONSHIPS/DATA/EVIDENCE/ACTION; compress public story where visual evidence says it better (no arbitrary %); show thesis before explaining; preserve truth architecture.
- PART 6 COMPLETE THE FLAGSHIP JOURNEY — extend spine to HOME→ATLAS→ORCA→SPECIES→LIVING SYSTEMS→WH4LES_→IMPACT; one connected experience; no dead ends; context-aware returns; sequential evidence.
- PART 7 LAUNCH-READY CLOSURE — responsive/back-forward/keyboard/focus/reduced-motion/tap-targets/loading/layout-stability/image/empty/source-unavailable/graceful-degradation/false-LIVE/OG/perf. No fabricated fallback data. iOS Safari = FOUNDER DEVICE SIGNOFF REQUIRED.

## QUALITATIVE SUCCESS TEST (harder than gates)
1) A newcomer spends 3 min and leaves thinking "I understand the planet differently now" (not "nice environmental website").
2) Founder can show it to a world-class designer/scientist/journalist/funder without apologising for any obvious interface flaw (no overlap, no placeholders, no dead buttons, no semantically-wrong imagery, no uncertainty disguised as fact).

## PER-PART CHECKPOINT FIELDS
Part# · Part START_SHA · current SHA · commits · WHAT CHANGED · before/after + 390/768/1440 · tests · blockers · bundle · updated ledger · status AWAITING PROJECT LEAD AUDIT.

## STATUS LOG
- [PART 0] done @ working branch megasprint/planetary-experience-v1 off efdf3bc. Baseline gates green (typecheck 0, smoke 28/28). Next: PART 1 FIX THE FRAME.
- [PART 1] done @ 7aff726 (off cc1364f). FIX THE FRAME: scroll-aware header (hide ~80px down / reveal ~14px up, solid/blur backing when detached, safe-area, reduced-motion), discoverable switcher (current-product label+caret, 4PLANET=HOME not 5th product, products 01-04), motion foundation (.reveal observer, Ken Burns hero, soft states). Gates green. iOS Safari = FOUNDER DEVICE SIGNOFF REQUIRED. Next: PART 2 EARTH→ORCA→LIVING SYSTEM.
- [LANG] 8c73403: dropped 'products' for the four ways in (ATLAS/SPECIES/LIVING SYSTEMS/IMPACT); 4PLANET = universe over all.
- [PART 2] done @ 3e99d0b. CREATE THE MAGIC: transition grammar — global opacity route fade (ATLAS-safe), RouteEnter descend on LS journey, ANCHORED ON ORCA identity band. Spine wired ATLAS->species->CONTINUE TO LIVING SYSTEMS->anchored Orca->BACK TO ATLAS. Switcher shows current step per route. Gates green. Next: PART 3 Living Systems progressive reveal + Mission signatures + CLE4N_ fix.
- [PART 3] done @ 69f2d6a. MAKE THE INVISIBLE VISIBLE: (3A) Living Systems progressive reveal — RELATIONSHIP 0N/0M, reveal-next, one relationship at a time, truth inspectable per step, handoffs after full reveal. (3B) 16 mission signatures via visualDirection (drift/depth/flow/rise/sweep/pulse/scan/gallery, reduced-motion safe) + CLE4N_ impact unit repointed whale->material/waste (pl4stic/hero). Gates green. Next: PART 4 Home living-Earth attract-mode (technical veto-gated).
- [PART 4] done @ b267a16. PLANETARY FRONT DOOR: still-based enhancement (earth-breathe slow drift + CSS atmospheric rim/horizon), planet feels alive before the interface. LIVE INTERACTIVE GLOBE = TECHNICAL VETO EXERCISED — World engine depends on egress-blocked OpenFreeMap/BigDataCloud in sandbox; WebGL perf/stability unverifiable here; strong still kept. Live chromeless attract-mode = own future verified pass (buildable on real infra). Gates green. Next: PART 5 editorial + awe convergence.

## FOUNDER INPUTS — BACKLOG (address when they fit; not yet done)
- ATLAS map quality: deep-zoom still pixelated — needs crisp tiles down to street level as far in as possible.
- ATLAS: Climate TRACE traces NOT showing; biodiversity density NOT showing (both blocked/deferred in sandbox — verify + wire on real infra).
- ATLAS basemap under Blue Marble is not attractive — founder liked an earlier dark-outline + labels mode. Consider restoring that as an optional mode (don't remove what works; add a mode or better fix).
- VISUALS DIRECTIVE (Part 7/final: produce a full visual-needs list). Living Systems too white/text-only — needs living visuals. Species even more alive (hero good now). Missions: ~4 visuals each min + more elements lower down + navigation to click through to other missions (design an effective, beautiful missions nav). Integrate Magazine (formerly 4PLANET Magazine) articles per mission theme.
- [PART 5] done @ 982b6f0. EDITORIAL + AWE CONVERGENCE: scroll-reveal now live on LS anchors; LS anchors get domain-accent colour moments (breaks too-white/static per founder); Home Reveal rhythm intact; species cards left non-reveal (live filter safety). Deep visual enrichment deferred to visuals-needs list (final). Gates green. Next: PART 6 complete flagship journey HOME->ATLAS->ORCA->SPECIES->LIVING SYSTEMS->WH4LES_->IMPACT.
- [PART 6] done @ 384baf9. COMPLETE FLAGSHIP JOURNEY: verified spine HOME->ATLAS->ORCA->SPECIES->LIVING SYSTEMS->WH4LES_->IMPACT end-to-end; removed soft dead-end (pathway-less missions -> SEE THE IMPACT MODEL -> /impact). Sequential evidence + contact sheet produced. Gates green. Next: PART 7 launch-ready closure.
- [PART 7] done @ dfc40c6. LAUNCH-READY CLOSURE: per-route document.title; verified 404 handled, LIVE honestly source-gated (no false LIVE), reduced-motion comprehensive, switcher tap>=44px. iOS = FOUNDER DEVICE SIGNOFF REQUIRED. Gates green.
- [MEGASPRINT COMPLETE] All 7 parts delivered on megasprint/planetary-experience-v1. FINAL status AWAITING GPT/PROJECT LEAD AUDIT. No main merge / production / self-approval. Remaining backlog: founder visual-needs list (LS visuals, 4+ per mission, missions nav, Magazine integration), ATLAS deep-zoom tiles + trace + biodiversity + dark-outline basemap mode, live Earth attract-mode (verify on real infra).

---

# ═══ LOCKED PROGRAMME 2: TRUTH · LENSES · AWE MEGASPRINT v2.0 ═══
_Convergence of Founder + Project Lead 44-point review + prior backlog. Ledger only; source truth = SHA+history+bundle._
START_SHA (accepted FINAL of sprint 1): 0cb3cfd · Working branch: megasprint/truth-lens-awe-v2
Rules: NO code deletion · NO destructive history · NO main merge · NO production · NO self-approval · preserve assets (correct metadata, never delete).

## MENTAL MODEL TO PROTECT (do not violate)
4PLANET = universe/HOME → FOUR LENSES (ATLAS=see the planet, SPECIES=meet the life, LIVING SYSTEMS=see what life depends on, IMPACT=make action easier + see what it proves) → FOUR DOMAINS (OCE4N_/E4RTH_/S4PIENS_/4CULTURE_, KEEP "Domains" not "Worlds") → MISSIONS. "Lenses" not "products". Don't force labels where nav/experience explains itself.

## ROOT-CAUSE FRAME (why this is few moves, not 44 tickets)
- RC1 TRUTH NOT BOUND TO EVIDENCE: KNOWN w/o source, Missions sources:[] w/ claims, founder-supplied implying rights, LIVE as one status. (#16-19, #34)
- RC2 NAV CONTRADICTS MODEL: FamilyMark 5 nodes, cryptic mobile switcher. (#29-30)
- RC3 EXPLAIN INSTEAD OF SHOW: honesty-language, Species/Domains/Impact repetition, LS is disclosure not active intelligence. (#8-9,#11,#14,#22,#26)
- One lens for all surfaces: 6 questions (Where am I/What/Why/What do we know/What can I do/What next) = dramaturgy AWE→ORIENTATION→DISCOVERY→UNDERSTANDING→EVIDENCE→AGENCY. (#5,#38)
- Quality bar: 5s WOW · 3min "this is a real system" · 15min "holds under scrutiny". World-leading won at minute 15. (#39,#44)

## PARTS (LOCKED) — delivered in audited checkpoints, continue unless STOP/HOLD
- PART 0 SOURCE LOCK — branch off 0cb3cfd, plan in ledger. [done]
- PART 1 TRUTH SPINE (P0, RC1) — audit every public KNOWN → source it or degrade (interpreted/unknown/in-development); claim-specific truth (identity-source ≠ diet/function/dependency/pressure source); Mission source architecture (claims open to evidence, no hero footnote-noise); founder-supplied = provenance-only everywhere (correct metadata, keep asset); replace universal LIVE with distinct concepts (journey-available / source-connected / source-fresh / real-time). CTAs literally true (#34). + calm motion continues.
- PART 2 LENS CLARITY (P0, RC2) — switcher = FOUR lenses (ATLAS/SPECIES/LIVING SYSTEMS/IMPACT), 4PLANET logo=HOME/universe, FamilyMark 5→4 nodes; premium mobile switcher that clearly signals switching + shows current lens without fighting MENU; language "lenses" where category words help. SPECIES lens vs SPECIES_ mission legible without knowing internal architecture (#13).
- PART 3 HOME WHY + SIGNATURE (RC3, #6-8,#10) — HOME leads with human WHY ("4PLANET exists to make the living systems under pressure easier to understand — and meaningful ways to help easier to find" — find best version; human/clear/warm/restrained/true-today/non-NGO/non-AI). KEEP "CAUSE THERE IS NO PLANET B." sparingly (footer). Remove self-praising honesty-language. One signature moment: Earth is the front door.
- PART 4 LIVING SYSTEMS — ACTIVE relationship intelligence (#14-15) — from progressive disclosure → active: pick a relationship → it takes the scene → prior steps compress to a trail → image/map/context reacts → pressure → response as natural next. One relationship at a time; subject-first, evidence where it matters, technical on demand. "Makes an invisible relationship visible."
- PART 5 IMPACT MEANING + PROOF RAIL (#20-23) — reframe to MAKE ACTION EASIER + SEE WHAT IT PROVES; proof rail concept CONTRIBUTION→FIELD DELIVERY→DELIVERY EVIDENCE→REVIEW→VERIFIED OUTPUT→OBSERVED OUTCOME→LONGER-TERM SYSTEM EFFECT (output ≠ outcome, don't weight all words equally); compress repeated WHY to ~ WHY THIS MATTERS / WHAT THE EVIDENCE SAYS / WHAT WOULD HAVE TO HAPPEN; CTA EXPLORE IMPACT (not MAKE AN IMPACT) until action open; "WHAT YOU GET (PLANNED)" → truer e.g. PLANNED EVIDENCE / WHAT WOULD BE RECORDED.
- PART 6 MISSIONS — WHY THIS HELPS + question entrances + copy (#23-27) — structure problem→why it matters→why this could help→evidence→action→proof (not green e-commerce); strong question entrances where they help (FOOD/CIRCULAR CITY); protect strong subject-first lines; COMMON SYSTEM · INDIVIDUAL WORLD (common: nav/truth/components/evidence; individual: image/question/story/mechanism/tempo). Domains: subtract repetition (hero→brief system→Missions→one note). 4PLAY_ copy → "Bring the living world into culture" (or better).
- PART 7 ATLAS DEPTH (prior backlog) — crisp deep-zoom tiles to street level as far in as possible; Climate TRACE traces + biodiversity density wired (verify on real infra; sandbox egress-blocked); restore/offer earlier dark-outline+labels basemap MODE (add mode, don't remove Blue Marble); ATLAS mobile control cleanup (search/layers/Earth/NOW/WATCH/close/sheets/tap) — STILL OPEN from sprint-1 Part 1, not complete.
- PART 8 JOURNEY EVIDENCE + LAUNCH TRUTH (#28,#32-37) — full flagship evidence INCLUDING ATLAS (HOME→ATLAS→ORCA→SPECIES→LIVING SYSTEMS→WH4LES_→IMPACT); Join/lead-capture one true state (capture OFF = forms visibly disabled/opening-soon, OR ON = copy/privacy/consent match runtime); COMING/IN DEVELOPMENT/OPENING SOON where true; self-reconstructable recovery package (explicit baseline+incremental chain); evidence 390/430/768/1024/1440 + iPhone Safari = FOUNDER DEVICE SIGNOFF after Cloudflare preview.
- PART 9 (deferred, after above lands) VISUAL-NEEDS LIST — the world-class image/visual brief (LS visuals, 4+ per mission + lower-page elements, missions nav, Magazine article integration per mission). Do NOT start until narrative/LS/Impact/source/lens landed (#42).

## MOTION / AWE (weave through, esp. Parts 1-5 so deploys feel alive)
Calm, physical, restrained. Max 1-2 signature moments per lens (#10): HOME Earth-as-door · ATLAS planet→place→context · SPECIES photography-first encounter · LIVING SYSTEMS active relationship changes the scene · IMPACT traceability action→evidence→effect. All reduced-motion safe. Never gimmicky.

## DELIVERY (per part) + BACKLOG CARRY
Part#, START/current SHA, commits, WHAT CHANGED, before/after + 390/768/1440, tests, blockers, bundle, updated ledger, AWAITING PROJECT LEAD AUDIT. Backlog still open from sprint 1: ATLAS items (now Part 7), visuals (Part 9), live Earth attract-mode (verify real infra).

## STATUS LOG 2
- [P0 v2] done — branch megasprint/truth-lens-awe-v2 off 0cb3cfd. Baseline gates green. Next: PART 1 TRUTH SPINE.
- [S2 PART 1] done @ 81ab394. TRUTH SPINE: KNOWN-requires-source enforced by new truth-contract test (smoke 29/29); fixed 2 violations (Oslofjord->INTERPRETED, Bee->IPBES source). Founder-supplied orca corrected to provenance-only (rights false, PENDING, blocker) -> falls back to 4PLANET-owned illustration. LIVE->AVAILABLE for LS journey availability (LIVE reserved for real-time data). CARRIED: mission sources:[] population (research task, not faked). Next: PART 2 LENS CLARITY (switcher 5->4 nodes, mobile switcher, logo=HOME).
- [S2 PART 2] done @ 1b1269d. LENS CLARITY: FamilyMark 5->4 nodes (ring=4PLANET universe, nodes=lenses); 4PLANET=HOME not 5th product; lens-action descriptors (See the planet/Meet the life/See what life depends on/Make action easier—see what it proves); panel 'FOUR WAYS IN'; mobile always-visible caret = clear switch affordance. Gates green. Next: PART 3 HOME WHY + signature.
- [S2 PART 2 fix] @ (see log): 4PLANET removed from lens list (lives on logo/HOME); 'ONE PLANET · FOUR LENSES' header. OPEN (deferred, founder OK): switcher PLACEMENT — currently beside logo; consider moving nearer MENU to separate brand from nav. Caret already improved discoverability. Revisit in a nav-polish slice.
- [S2 PART 3] done @ (see log). HOME WHY: leads with '4PLANET exists to make the living systems under pressure easier to understand — and meaningful ways to help easier to find'; kept CAUSE THERE IS NO PLANET B. sparingly; CTA MAKE AN IMPACT->EXPLORE IMPACT; removed self-praising honesty-language (Join, Atlas/layers). Gates green. Next: PART 4 Living Systems ACTIVE relationship intelligence.
- [S2 PART 4] done @ (see log). LIVING SYSTEMS active relationship intelligence: prior steps -> clickable trail chips; current relationship takes the full scene, re-enters (keyed) on advance. One relationship at a time, truth inspectable. Gates green. Next: PART 5 IMPACT meaning + proof rail.
- [S2 PART 5] done @ (log). IMPACT proof rail: CONTRIBUTION->FIELD DELIVERY->DELIVERY EVIDENCE->REVIEW->VERIFIED OUTPUT->OBSERVED OUTCOME->LONGER-TERM SYSTEM EFFECT; output!=outcome explicit; WHAT YOU GET(PLANNED)->PLANNED EVIDENCE. Gates green. Next: PART 6 Missions WHY + copy.
- [S2 PART 6] done @ (log). Missions: WHAT CAN HELP->WHY THIS HELPS; question entrances FOOD + CIRCULAR CITY (optional field); 4PLAY copy 'Bring the living world into culture'. CARRIED: broader mission-copy polish (optional). Next: PART 7 ATLAS depth (tiles/trace/biodiversity/dark-basemap mode/mobile cleanup).
- [S2 PART 7] done @ (log). ATLAS assessment (docs/ATLAS_ASSESSMENT.md): providers egress-blocked in sandbox, no blind engine edits. Pixelation=raster fallback; trace via /api/climate-trace; biodiversity via GBIF; dark-outline+labels basemap ALREADY EXISTS as makeStyle(dark) -> surface as mode in verified follow-up; mobile controls clean at rest. All = verify on real infra. Next: PART 8 journey evidence + launch truth.
- [S2 PART 8] done @ (log). Flagship evidence incl ATLAS (HOME why->ATLAS->ORCA->LIVING active->WH4LES_->IMPACT). Lead capture honest-by-runtime (/api/leads delivered flag) — no hardcode. Recovery self-reconstructable. Next: PART 9 visuals list (draft already delivered) + package all.
- [S2 COMPLETE] Parts 0-8 delivered on megasprint/truth-lens-awe-v2. Part 9 visuals draft = VISUAL_NEEDS_worldclass.md. AWAITING PROJECT LEAD AUDIT. Backlog carried: mission per-claim sources; ATLAS real-infra verify (tiles/trace/biodiversity/dark-mode toggle); switcher placement; broader mission-copy polish; live Earth attract-mode.
