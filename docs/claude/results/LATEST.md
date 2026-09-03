# CLAUDE FACTORY RESULT

work_order_id: CLAUDE-TEST-KING-PRODUCT-LEAD-SPRINT-01
queue_sha: 23d75c3ad8a76b760ebad062e58659a26d47b5fa
dispatch_attempt: 1
status: COMPLETED
worker: CLAUDE_PRODUCT_INTERFACE
model: claude-opus-5
completed_at: 2026-09-03T18:10:16Z
authority: REVIEW_ONLY

Plan-file write and ExitPlanMode are not available in this session (only Bash/Glob/Grep/Read are exposed, and `Write` is disabled), so I am delivering the review return directly. No repository files were modified — consistent with the REVIEW_ONLY lane.

---

# CLAUDE-TEST-KING-PRODUCT-LEAD-SPRINT-01 — RETURN

**mode:** REVIEW_ONLY · no repository files modified
**base_sha reviewed:** `ac2538f78bbfdb0e922f7f8f64cf808013fe1e34` — verified present; `git ls-remote --heads origin king/test` returns the same SHA → **no HEAD_MOVED**
**working branch:** `factory/claude-product-worker-01` @ `23d75c3a`; `git diff --stat ac2538f7 HEAD -- src public` = **0 files**, so all product-code evidence below is exactly the pinned tree.

---

## 1. EXECUTIVE PRODUCT JUDGEMENT

TEST KING already owns something most planetary products never earn: a genuine truth grammar. Evidence states with attached BOUNDARY lines and source links, "GBIF DID NOT ANSWER" distinguished from "nothing matched", "NO CLEARED IMAGE" instead of a borrowed photo, a WebGL fallback that refuses to fake a map, "PUBLIC SUPPORT CLOSED" on every pathway. The documentary domain worlds are premium, and ATLAS correctly rests as map + search with the layer console collapsed.

The largest product-level failure is that there is no single orientation model. Three separate navigation systems ship — the PublicShell header, a ProductSwitcher mounted only on `/atlas`, and ATLAS's own `4PLANET_` site menu — and two competing four-item taxonomies (four products/lenses vs four domains) appear within one scroll of the front door. A dead `ProductNav` is an unshipped fourth model. The consequence is that 4PLANET's identity changes depending on where you land — the thesis, "separate worlds, shared infrastructure", failing at the shared layer.

The next phase should be one sprint: **one orientation, one first act.** Unify the shell across every public route including ATLAS, choose one primary public taxonomy, and make the screen after the hero offer a real act on the living world rather than a manifesto about 4PLANET.

*(218 words)*

---

## 2. HUMAN JOURNEY SCORECARD

| Clock | Verdict | OBSERVED evidence |
|---|---|---|
| **5 seconds** | **PARTIAL** | `AtlasHero.tsx:25-31` — eyebrow `4PLANET_ · FOR A LIVING PLANET`, H1 "Everything you love is connected.", lede "Explore one living planet…". Emotive and premium, but names no category and no product. The only product door in the first viewport is `OPEN ATLAS →` at `rgba(255,255,255,.72)`, 11px mono (`AtlasHero.tsx:34`) — visually subordinate to the scroll cue. |
| **30 seconds** | **FAIL** | The dominant CTA is `WHY 4PLANET ↓` (white pill, `AtlasHero.tsx:33`) → an anchor into a full-bleed brand-blue manifesto (`Home.tsx:99-110`). The first thing offered after the hero is an argument, not an action. The four products appear only in section 3 as small text lenses (`Home.tsx:112-127`), below a second explanatory paragraph. |
| **3 minutes** | **PARTIAL** | Real depth exists (Domains, 16 Missions, ATLAS, Orca). But orientation switches system twice: header panels (`PublicShell.tsx:90-139`) → ATLAS site menu (`World.tsx:1104-1136`) → and on `/species/orca` a portalled CTA sends the user out of the SPA to `/journey/orca/` (`PublicCompletionBridge.tsx:45-59`). |
| **Expert depth** | **PASS** *(one reservation)* | `Species.tsx:36-53` EvidenceClaimCard (state + BOUNDARY + source ↗); occurrence disclaimer "Records show reporting activity. They do not establish range, abundance, population trend or live tracking."; `World.tsx:1180-1188` source-failure ≠ empty result; `PublicWorld.tsx:191` refuses fabricated activity. **Reservation:** the switcher's own "limitations & sources" link (`ProductSwitcher.tsx:179` → `/about#system`) points at a section containing neither, and the anchor only resolves via a runtime DOM rewrite (F4). |

---

## 3. TOP 5 MATERIAL PRODUCT FINDINGS

### F1 — P0 · Three competing navigation systems; no single orientation
- **OBSERVED** `PublicShell.tsx:17-24` header = EXPLORE / DOMAINS / MISSIONS / CULTURE / ABOUT / TAKE PART. `App.tsx:16-24` mounts `ProductSwitcher` **only** when `pathname.startsWith("/atlas")`. `World.tsx:1104-1136` ATLAS ships a third menu with a different list, self-linking `/atlas` as "The full data console" and `/story` as "HOME". `src/product/ProductNav.tsx:39-66` exports an unused fourth model — only `contextHref` is imported anywhere.
- **Human consequence** `/atlas` has no 4PLANET wordmark, no JOIN, no footer; every other route has no product switcher. Product identity depends on landing page.
- **Strategic** "Separate worlds. Shared infrastructure." is the thesis; the shared layer is exactly where it breaks.
- **Intervention** One orientation contract: `PublicShell` owns wordmark + ProductSwitcher + JOIN on every public route, with a minimal overlay variant for the map. Delete the ATLAS site menu and the dead `ProductNav` component.
- **MUST-NOT-LOSE** ATLAS map-first resting state; `contextHref`/`returnTo` continuity; `AtlasReturnCameraAuthority`; header hide-on-scroll + transparent-when-closed behaviour.
- **Type** CONSOLIDATE (+ DELETE)

### F2 — P0 · Two competing public taxonomies inside one scroll
- **OBSERVED** `Home.tsx:117-120` "ONE PLANET · FOUR PUBLIC LENSES … ATLAS, SPECIES, LIVING SYSTEMS and IMPACT"; `Home.tsx:129-140` "Four connected domains" (OCE4N/E4RTH/S4PIENS/4CULTURE). The header's top level exposes DOMAINS/MISSIONS/CULTURE but hides ATLAS/SPECIES/IMPACT one panel deep; the switcher exposes only the five products.
- **Human consequence** A first-time reader must hold two different "four things" models, with different members and different colours, within one page.
- **Strategic** This is the single largest cause of the 30-second failure; no navigation polish fixes it.
- **Intervention** REFRAME: products = *what you can do* (owns navigation); domains/missions = *where the work happens* (lives inside content). Stop presenting both as "four".
- **MUST-NOT-LOSE** Domain colour authority; the 16 missions; the documentary domain worlds.
- **Type** REFRAME

### F3 — P1 · The median species profile is a database record with empty scaffolds
- **OBSERVED** `Species.tsx` gates narrative chapters, field photography and the truth-spine block behind `isOrca`; `src/data/species.ts:196` sets `narrativeChapters` for orca only, across 10 profiles. Every non-Orca profile still renders: `TAXON IDENTITY` with `Canonical ID` / `GBIF key` / `Rank` / `Kingdom`; PRESSURE and RESPONSE panels carrying a heading and "SOURCE REVIEW PENDING" with no content; a `PRODUCT NOTE` reading "…retains the same canonical identity across SPECIES, ATLAS and local WATCH"; and an `ADD TO LOCAL WATCH` button.
- **Human consequence** Brand Core §10 requires a profile "should not feel like a prettier database record". For 9 of 10 species it does — and two panels exist only to announce their own emptiness.
- **Strategic** SPECIES is the family's emotional entry point; it currently only works for one animal.
- **Intervention** Build a real median profile from data that already exists (`habitat`, `descriptorSource`, `publicClaims`, GBIF occurrences, `speciesMedia`). DELETE the empty PRESSURE/RESPONSE scaffolds rather than styling them. Collapse taxon identifiers into one evidence drawer. Humanise `LOCAL WATCH` and `PRODUCT NOTE`.
- **MUST-NOT-LOSE** Evidence states, BOUNDARY lines, occurrence disclaimer, NO CLEARED IMAGE / ILLUSTRATION labelling, `data-testid="species-to-atlas"` return path.
- **Type** DELETE + REDESIGN

### F4 — P1 · Journey continuity exits the product into a version-stacked legacy layer, via a global DOM-rewriting bridge
- **OBSERVED** `PublicCompletionBridge.tsx:45-72` portals CTAs into `main#main-content` linking `/journey/orca/` and `/journey/jaguar/` from `/species/orca`, `/missions/wh4les`, `/species/jaguar`, `/missions/am4zonia`. `public/journey/orca/index.html` references **44** stylesheet/script tags, including six `/xr/jaguar/jaguar-*.css` — the Orca journey inherits the Jaguar stylesheet. `public/journey/jaguar/` ships ~40 versioned files spanning `v27`→`v65`. The same component (`:88-107`) runs a `MutationObserver` on `document.body` with `{childList:true, subtree:true}` that re-runs three `querySelectorAll` sweeps on every DOM mutation and rewrites React-rendered `href`s — active on `/atlas`, where MapLibre mutates the DOM continuously.
- **Human consequence** The most emotionally valuable moment in the product leaves the shell, loses the switcher and footer, and carries another animal's visual system. Performance cost lands hardest on the map surface.
- **Strategic** Performance is Human Gold; REDUCE BEFORE GENERATE is being inverted by accretion.
- **Intervention** Decide one home for immersive journeys (inside the shell as routes, or explicitly labelled prototypes reached from one place). Retire superseded version layers. Replace the DOM rewrite with explicit routes so `/about#system` resolves without JavaScript repair.
- **MUST-NOT-LOSE** The journey content and Founder-loved visual work; `/about` deep links must keep working after the bridge is removed.
- **Type** REDESIGN (+ DELETE)

### F5 — P1 · Duplicated conversion surfaces; the principal CTA vanishes on mobile
- **OBSERVED** `PublicShell.tsx:467` — `@media(max-width:920px){.public-header__desktop,.public-header__join{display:none}}`. `JOIN 4PLANET`, the Founder-controlled principal header CTA, is absent on mobile, and `MobileMenu` (`:141-167`) has no equivalent. `/join` (`Join.tsx`) and `/people` (`Entry.tsx:170`, submit label "JOIN 4PLANET") are two membership surfaces; the header TAKE PART panel goes to `/people` while Home and the footer go to `/join`. `/about` (`About.tsx`) duplicates `/about/story|system|founder` (`AboutPages.tsx`). `src/pages/v5/Impact.tsx` (110 lines, `ImpactIndex`/`PathwayPage`) is unreachable — `/impact` routes to `ImpactPremium`. `About.tsx` derives anchor ids from headings, but no heading yields `system`, so `#system` never exists in the DOM.
- **Human consequence** Mobile users get no join action from the shell at all; desktop users meet two different membership pages; the "limitations & sources" promise lands nowhere on a shared or typed URL.
- **Strategic** This is the point where understanding is supposed to become participation.
- **Intervention** Keep JOIN in the mobile bar; collapse `/people` into `/join`; redirect `/about` to `/about/story`; delete `v5/Impact.tsx` and the dead `ProductNav` component.
- **MUST-NOT-LOSE** The honest "paid membership is not yet active" copy; `returnTo` behaviour on `/join`.
- **Type** DELETE + CONSOLIDATE

---

## 4. PRODUCT FAMILY / BRAND COHERENCE

**Internal architecture leaking into public experience (OBSERVED):** `CONTEXT CONTINUED`, `IDENTITY PRESERVED`, `POPULATION-SPECIFIC CLAIMS CONTROLLED`, `Canonical ID · taxon:gbif:2440483`, `PRODUCT NOTE`, `ADD TO LOCAL WATCH`, `PUBLIC PREVIEW`, `SEEDED REGISTRY`, "the full data console", "4Planet OS" (About), plus lab routes exposed in the public router (`/species/lab`, `/impact/lab`, `/checkout/lab`, `/labs`, `/os/*`).

**Generic-SaaS / dashboard / launcher patterns:** the ATLAS layer console (chips → grouped rows → status → `i` drawer → `ISOLATE` → opacity slider, `World.tsx:1220-1310`) reads closer to a data terminal than to the "scientific instrument" the Brand Core asks for. The instinct to collapse it to a single `LAYERS` line is correct and should be pushed further. The Home four-lens row and the four-box TAKE PART grid are card-catalogue geometry. The ProductSwitcher itself is **not** an app-launcher — the typographic trigger showing `PRODUCTS` on the umbrella shell is exactly right and matches the Founder control.

**Colour-law breach:** `Home.tsx:30-35` assigns four accents in default 4PLANET context — `#2E2EFF`, `#3AE86F`, `#FF4D22`, `#3AE86F`. Three Domain colours compete outside any Domain, and SPECIES and IMPACT share `#3AE86F`, so the colour carries no meaning at all.

**Signatures worth expanding:**
1. **Evidence chrome** — state label + BOUNDARY line + source link. Genuinely ownable; currently reimplemented at least three times (`Species.tsx:36-53`, `Species.tsx` inline claims, `LivingSystems.tsx:20-56`). Candidate for the Primitive Registry.
2. **Honest absence** — `NO CLEARED IMAGE`, `PHOTOGRAPH · PENDING RIGHTS`, `GBIF DID NOT ANSWER`, `PHOTOGRAPH PENDING` on an Impact unit, the WebGL fallback.
3. **Full-bleed documentary world panels** with a single domain-colour hairline (`Domains.tsx` WorldTile, `Home.tsx` WorldPanel).
4. **Continuity** — `contextHref` / `returnTo` / "← BACK TO OBSERVATION IN ATLAS". Quiet, precise, and unusual.

---

## 5. COPY + TONE OF VOICE

**1. Brand casing is inconsistent, not systematic.** 69 occurrences of `4Planet` against 318 of `4PLANET` across `Entry.tsx`, `About.tsx`, `Join.tsx`, `Privacy.tsx`, `Culture.tsx`, `Reports.tsx` and `src/content/*`. Direction: `4PLANET` in interface, brand and product contexts; if a sentence-case reading form is wanted, define it once and apply it everywhere. Today it reads as drift.

**2. Internal system vocabulary is being used as public voice.**
- `Species.tsx` — "PRODUCT NOTE · {name} retains the same canonical identity across SPECIES, ATLAS and local WATCH." → **"The same record follows you between the map and this profile."**
- `Species.tsx` — "ADD TO LOCAL WATCH" / "WATCHING LOCALLY" → **"FOLLOW" / "FOLLOWING · SAVED ON THIS DEVICE"**
- `World.tsx:1125` — "ATLAS — The full data console" → **remove the self-link entirely**; ATLAS is the instrument, not a console, and it is already the current page.

**3. The product talks about itself before it talks about the world.** The screen after the hero is `WHY 4PLANET_ / "A healthy living planet is infrastructure for human life."` (`Home.tsx:99-110`), followed by a five-step description of 4PLANET's own process and a four-box "Build this with us." Brand Core §8: *"Do not make every paragraph about 4PLANET."* Direction: after the hero, show one real thing on the living planet — a live NOW record, a species, a place — and let the organisation be inferred from its usefulness.

---

## 6. NEXT CONTINUING SPRINT

**Sprint objective:** *One orientation, one first act.* Give 4PLANET a single public orientation model across every surface, and make the first thirty seconds end in a real act on the living world — without weakening the truth grammar that is already the product's best asset.

**Ordered phases**
1. **Orientation contract** — decide the primary taxonomy (F2), then unify the shell (F1).
2. **Front door second screen** — replace manifesto-first with world-first plus one dominant act (F2 / §5.3).
3. **Median species profile** — make SPECIES work for the other nine animals (F3).
4. **Journey + asset consolidation** — decide the home for immersive journeys, remove the DOM-rewriting bridge (F4).
5. **Cleanup** — dead routes/files, `/people`→`/join`, `/about`→`/about/story`, mobile JOIN (F5).
6. **Proof** — mobile/a11y/performance pass, rendered evidence, GOLD brief + visual lock.

**First 3 implementation seams (highest expected value)**

| # | Proposed write scope | Value | Overlap |
|---|---|---|---|
| S1 | `src/components/layout/PublicShell.tsx`, `src/App.tsx`, `src/product/ProductSwitcher.tsx`, delete dead `ProductNav` component | Fixes F1 + the mobile half of F5; unblocks everything else | **UNKNOWN** |
| S2 | `src/pages/v5/Home.tsx`, `src/pages/v5/AtlasHero.tsx` | Fixes the 30-second FAIL and the colour-law breach | **UNKNOWN** |
| S3 | `src/pages/integrated/Species.tsx` (+ read-only `src/data/species.ts`) | Turns 9 of 10 profiles from records into encounters | **UNKNOWN** |

I claim no permission to write any of these. AXE must re-verify overlap before a bounded code order.

**Must remain REVIEW_ONLY in the next phase**
- `src/earth/**` — documented active ATLAS product-polish sidecar plus the PR #246 ATLAS sandbox; the ATLAS site-menu removal (F1) must be handed to the ATLAS owner rather than taken here.
- `public/journey/**`, `public/xr/**` — multiple active `agent/jaguar-*` and `agent/orca-*` branches exist in `origin`; ownership unconfirmed.
- `docs/control/GOLD_*` — AXE-owned.

**AXE / Factory can do without Claude capacity**
- Brand-casing sweep once the rule is fixed (§5.1).
- Deleting files Claude has named as dead (`src/pages/v5/Impact.tsx`, `ProductNav` component) after independent confirmation.
- `/people`→`/join` and `/about`→`/about/story` redirects once the consolidation decision is taken.
- Measuring shipped weight of `public/journey` + `public/xr` and listing superseded version layers.
- Capturing rendered evidence, running the gate set, re-verifying live PR/write ownership.

**Claude-owned**
- The orientation model and taxonomy decision; the front-door second screen; the median species profile; the definition of the evidence-chrome primitive; mobile interaction quality.

---

## 7. BRAND LEARNING CANDIDATES

**L1 — Honest absence is a 4PLANET signature.** *REFINES §5/§8.*
Evidence: `NO CLEARED IMAGE`, `PHOTOGRAPH · PENDING RIGHTS`, `GBIF DID NOT ANSWER`, `PHOTOGRAPH PENDING` on an Impact unit, the WebGL fallback refusing to fabricate activity.
Rule: when something is genuinely missing, design the absence with the same care as the presence — name what is missing, why, and what is still possible.
Applies to: media rights, source failure, delivery status, capability limits. **Does not apply to unbuilt scaffolding** — a section that only announces its own emptiness (Species PRESSURE/RESPONSE "SOURCE REVIEW PENDING") should be removed, not styled.

**L2 — One orientation per product family, not one per surface.** *CHALLENGES current implementation, CONFIRMS §16.*
Evidence: three shipped navigation systems plus one dead fourth (F1).
Rule: every public surface adopts the shared orientation chrome. An immersive surface may reduce it to a minimal overlay; it may not invent a third menu.
Applies to: all public routes including map and immersive. Not to internal `/labs`, `/os`.

**L3 — An accent must mean something or not exist.** *REFINES §4 single-accent law.*
Evidence: `Home.tsx:30-35` uses four accents in default context and gives SPECIES and IMPACT the same `#3AE86F`.
Rule: default 4PLANET context uses brand blue only; a second colour is admissible only as the active Domain colour, and only when unique in view.
Applies to: interface colour. Not to photographic content.

**L4 — If grey is abolished, hierarchy must be built, not implied.** *CHALLENGES — needs Founder confirmation.*
Evidence: `src/styles/tokens.ts:14` — `dim: "#080808"` with the comment "v25: grey abolished — was rgba(8,8,8,.60)". Every `color: T.dim` in Home, Species, Domains, Join and Living Systems therefore renders at full ink.
Proposed rule: where tonal steps are removed, hierarchy must be carried explicitly by size, weight, measure and space — and the token should be renamed so code stops implying a step that does not exist.

---

## 8. CHALLENGE TO AXE / FOUNDER ASSUMPTIONS

**C1 — The public family may be one product too many.** `CURRENT_4PLANET_CONTEXT.md` states Living Systems is "shared core intelligence / relationship logic, not a competing map product", and Brand Core §2 repeats it. Yet it ships as a peer product in the switcher (`ProductSwitcher.tsx:19`), in the Home lens row and in the header EXPLORE panel. `LivingSystems.tsx` supports the doc: its content is relationship chains *about* species and places — a layer. Recommend demoting LIVING SYSTEMS from the public product row into SPECIES / ATLAS / Mission context. Founder-level call — flagged, not taken.

**C2 — The front door should not lead with the organisation.** The current second screen is a manifesto about 4PLANET. The strongest and most defensible material in the product is the live world: NASA EONET + USGS records in the NOW lens, GBIF occurrences, and the documentary domain photography. Leading with the world is both more premium and closer to §8's "curious about the world rather than self-obsessed". The manifesto belongs at `/about/story`, which already exists and is better written.

**C3 — "PUBLIC PREVIEW" as permanent shell chrome is a net negative.** It lowers perceived maturity on every screen while telling the user nothing actionable, and the link it offers — "limitations & sources" → `/about#system` (`ProductSwitcher.tsx:179`) — resolves to a section containing neither, and only resolves at all because a MutationObserver rewrites the href at runtime. Preview and limitation disclosure already work extremely well *at the point of claim*. Recommend moving it there and removing it from the shell.

---

## 9. CONTINUATION CHECKPOINT

- **Sprint** CLAUDE-TEST-KING-PRODUCT-LEAD-SPRINT-01 · phase 1 of a continuing sprint · REVIEW_ONLY · **complete**.
- **Base** `ac2538f78bbfdb0e922f7f8f64cf808013fe1e34`; `origin/king/test` verified identical this run; product code identical to working tree (`0` files differ under `src`/`public`).
- **Completed** Rehydration (CLAUDE.md → Brand Core → Context Protocol → Current Context → work order → GOLD brief). Code-level review of: router, PublicShell, Home/AtlasHero, ProductSwitcher/ProductNav/PublicCompletionBridge, ATLAS `PublicWorld` + `World` chrome, Species index/profile/route, Domains, Living Systems, Impact (`ImpactPremium` live; `v5/Impact` dead), About/AboutPages/Join/Entry, tokens, `public/journey` + `public/xr`.
- **Key decisions** Orientation is the P0, not visual polish. The taxonomy collision (products vs domains) is the root cause of the 30-second failure. ATLAS internals stay REVIEW_ONLY. The truth grammar is the asset to protect through every change.
- **Unresolved** Live PR/write ownership (§10). Whether LIVING SYSTEMS remains a public peer product (C1). Whether `T.dim === T.ink` is a current Founder decision or drift (L4). Which home the immersive journeys should have (F4).
- **Next safe action** AXE re-verifies `king/test` head and write ownership for seam S1 (`PublicShell.tsx` + `App.tsx` + `ProductSwitcher.tsx`), then issues a bounded write order for the orientation contract from a freshly reverified SHA, with the GOLD brief updated in the same bounded change. No candidate branch should be created from this review.

---

## 10. UNKNOWN / SAFETY FLAGS

- **HEAD_MOVED: NO.** `git ls-remote --heads origin king/test` → `ac2538f78bbfdb0e922f7f8f64cf808013fe1e34`, identical to the pinned review SHA.
- **Rendered / runtime proof UNAVAILABLE this run.** No browser, no dev server, no build or test execution (REVIEW_ONLY). Every finding is static code and asset evidence. Nothing here is browser-verified, and no visual claim is Founder-approved.
- **Active write ownership UNCONFIRMED.** `gh pr list` failed in this run — `GH_TOKEN` is not set — so PR #131, #246, the ATLAS sidecar and the release-closure seam could not be re-verified live. Every proposed write scope in §6 is marked overlap **UNKNOWN**.
- **Deliberately not inspected (UNKNOWN):** Magazine, S4PIENS/FOOD, 4SAPIEN/EMBLA, Actors, Ecosystems, LumeRoom, Mission detail bodies, `/impact/lab` journeys, analytics. Deprioritised under the token-efficiency instruction in favour of the front door, shell, SPECIES, ATLAS chrome and IMPACT entry.
- **INFERRED, not measured:** the runtime cost of the `PublicCompletionBridge` MutationObserver on `/atlas` is reasoned from its configuration (`document.body`, `subtree:true`, three `querySelectorAll` sweeps per mutation), not profiled.
- **Harness note:** the plan-file artifact requested by the planning harness could not be created — `Write` is disabled in this session. The return above is the complete deliverable.
- **No repository files were modified.** No branch created, nothing merged, deployed, published or spent.
