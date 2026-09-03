# CLAUDE FACTORY RESULT

work_order_id: CLAUDE-SPECIES-HUMAN-GOLD-PROOF-01
queue_sha: f13cc5f7be967eb2d55947bfd4b480f4ed8373f7
worker: CLAUDE_PRODUCT_INTERFACE
model: claude-opus-5
completed_at: 2026-09-03T12:14:24Z
authority: REVIEW_ONLY

Write tooling is disabled in this session and `~/.claude/plans/` does not exist, so I could not persist the return to the plan file. This lane is REVIEW_ONLY and no repository file was modified — the return is delivered directly below.

---

# CLAUDE-SPECIES-HUMAN-GOLD-PROOF-01 — REVIEW RETURN

**task:** CLAUDE-SPECIES-HUMAN-GOLD-PROOF-01 · mode REVIEW_ONLY · role PRODUCT_INTERFACE
**base:** `king/test` @ `327a4ee39e337301adbb83995126e21391d0dc2d` (OBSERVED: equals current `origin/king/test` head)
**inspected from:** `factory/claude-product-worker-01` @ `f13cc5f7`; OBSERVED `git diff 327a4ee3..HEAD -- src/ public/ tests/` is empty, so every file read is byte-identical to base
**repository mutations:** NONE

---

## 1. PRODUCT JUDGEMENT

**Strength (OBSERVED).** The first read is genuinely premium and life-first. `SpeciesHero` (`src/pages/integrated/Species.tsx:105`) gives the animal a full media plane, the common name at display scale, the scientific name, one human sentence, and derived plain-language facts; `src/styles/species-source-first-read-v01.css` suppresses provenance overlays under 620px. The 5-second test passes.

**Largest gap (OBSERVED).** After the hero, SPECIES stops being about life and becomes a record. For all ten non-Orca profiles the next content is three internal control chips (`GBIF TAXON · ACCEPTED`, `IDENTITY PRESERVED`, `POPULATION-SPECIFIC CLAIMS CONTROLLED`), a habitat sentence already shown in the hero, taxonomy and occurrence tables, and two panels saying the pressure/response wording is withheld. A non-expert never learns what world the organism belongs to or what it depends on — although sourced relationship content already exists in `src/data/livingSystems.ts` and is unreachable from every profile.

---

## 2. TOP 3 MATERIAL FINDINGS

### F1 — "What world does it belong to" exists in data and is rendered nowhere

- **OBSERVED.** `SpeciesProfile` carries `livingSystemId` and `journey` for all 11 curated species (`src/data/species.ts:184-415`). `profile.journey` has **zero consumers**; the only `journey:` uses at `Species.tsx:170,285` are ATLAS URL context params, not this field. `src/data/livingSystems.ts` holds four anchors (`orca`, `amazonia`, `oslofjorden`, `pollination`) with staged relationships carrying `state` (KNOWN/INTERPRETED/UNKNOWN), `boundary`, `source` and `sourceUrl`. The only route into it from a profile is `CONTINUE TO LIVING SYSTEMS →` at `Species.tsx:291-293`, gated on `isOrca` and pointing at the `/living-systems` **index**, not Orca's own journey.
- **OBSERVED defects that make naive wiring unsafe.** `journey: "oslofjord"` (porpoise, cod, mussel) does not match anchor slug `"oslofjorden"`; `LivingSystemJourney` returns `NotFound` on miss (`src/pages/v5/LivingSystems.tsx:205-206`). `western-honey-bee` has `journey: "amazonia"` while its `livingSystemId` is `pollination` — the wrong world.
- **Human consequence.** Ten of eleven organisms are presented with no ecological context at all. Jaguar reads: name → habitat sentence → the same habitat sentence again → GBIF tables → "wording withheld" ×2. The work order's "what world/relationships it belongs to" is unanswered for 91% of the catalogue while the answer already sits in the repository, sourced.
- **Recommended intervention.** A compact, fail-closed "world" seam directly under the hero: anchor name and kind, one or two existing sourced relationship lines with their truth state and boundary, honest `LIVE`/`IN_DEVELOPMENT` status, one continuation link. Mapped by an explicit hand-verified species→anchor table, rendering **nothing** when no truthful anchor exists.
- **MUST-NOT-LOSE.** Hero dominance and the existing first-read hierarchy; `SpeciesEvidenceSeam`'s portal into `#main-content`; every `state`/`boundary`/`source` label from `livingSystems.ts`; `NotFound` for unknown anchors; no invented relationship; the four cetaceans with no truthful non-Orca anchor stay unlinked rather than pointed at the Orca journey.

### F2 — Internal control vocabulary is the first thing after the hero

- **OBSERVED.** `Species.tsx:312-316` renders `GBIF TAXON · ACCEPTED`, `IDENTITY PRESERVED`, `POPULATION-SPECIFIC CLAIMS CONTROLLED` as the first post-hero block on every profile. `Species.tsx:322-332` then repeats `profile.habitat` verbatim in a `WHERE IT LIVES` panel although `deriveKeyFacts` (`Species.tsx:97`) already surfaced the identical string as a hero fact. `Species.tsx:454-458` closes with a `PRODUCT NOTE` addressed to the programme, not the reader. For profiles without `publicClaims` (jaguar, macaw, cod, mussel, porpoise, dolphin, honey bee, otter) `Species.tsx:439-452` shows two panels stating the pressure/response wording is withheld pending audit.
- **Human consequence.** The 30-second exploration returns programme architecture and withheld content — the "prettier database record" failure the SPECIES doctrine names explicitly. Worse on mobile, where chips plus duplicated habitat consume the whole second screen.
- **Recommended intervention.** DELETE the duplicated `WHERE IT LIVES` panel when its string is already a hero fact; demote the three control chips beneath the human content or fold them into the existing evidence seam; render pressure/response panels only when a profile has audited wording.
- **MUST-NOT-LOSE.** `descriptorSource` attribution and `checkedAt`; the occurrence-vs-range disclaimer at `Species.tsx:367`; the machine-enforced source phrases asserted by `scripts/species-first-plank-source-contract.test.mjs`; the pending/withheld truth state stays discoverable, not deleted.

### F3 — Mobile image variants exist for every SPECIES asset and none are served

- **OBSERVED.** `MEDIA_MANIFEST` records `localPathMobile` for all ten `SP-0xx` assets (`src/content/mediaManifest.ts:62-142`) and the files exist on disk. `fromManifest()` (`src/data/speciesMedia.ts:81-94`) does not copy the field into `MediaRecord`, which has no mobile member. `SpeciesHero` (`Species.tsx:117`) and `LifeImage` (`Species.tsx:64`) render a bare `<img src={media.localPath}>`. The index hero hardcodes `/assets/species/_index-hero.jpg` (142 KB) at `Species.tsx:201` while `_index-hero-mobile.jpg` (30 KB) sits unused. Desktop grid assets total **4.38 MB** against **1.43 MB** of already-built mobile variants. A `<picture>` + `srcMobile` primitive already exists at `src/components/Img.tsx:36-44`, used by `PublicShell` and `Cinematic`.
- **Secondary OBSERVED truth issue.** `_index-hero.jpg` is referenced only at `Species.tsx:201` and has **no rights record anywhere in the repository** — the one SPECIES image every visitor sees first is the only one not governed by `MEDIA_MANIFEST` or `SPECIES_MEDIA`.
- **Human consequence.** Mobile pays roughly 3× the necessary bytes on the flagship discovery surface; the current brief treats performance as Human Gold, not hygiene.
- **Recommended intervention.** Thread `localPathMobile` into `MediaRecord` and render `<picture>` reusing the `Img.tsx` pattern; register `_index-hero.jpg` in the manifest or replace it with a recorded asset.
- **MUST-NOT-LOSE.** `hasShowableImage` gating; all rights/limitation/attribution overlays and their compact-screen suppression rules; the designed no-image state; `tests/e2e/species-first-read.spec.ts` assertions.
- **BLOCKED for now.** `src/data/speciesMedia.ts` and `src/content/imageRegistry.ts` are both being rewritten on `origin/release/public-core-01-candidate`, which carries a Founder decision dated 2026-09-02 (Orca hero is Unsplash-sourced; illustration fallbacks removed from Public Core). F3 must not be built against `king/test` while that line is open.

---

## 3. FIRST BUILD CANDIDATE

- **id:** `CLAUDE-SPECIES-WORLD-SEAM-01`
- **base SHA:** `327a4ee39e337301adbb83995126e21391d0dc2d` (`king/test`)
- **target human outcome:** After meeting the organism, a non-expert immediately learns which living world it belongs to and one or two real, sourced things it depends on or is pressured by — before any taxonomy, occurrence table or control chip — and can continue into that world. Currently answered for 0 of 11 profiles.
- **write_scope:**
  - `src/components/species/SpeciesWorldSeam.tsx` (new)
  - `src/pages/integrated/Species.tsx` (mount the seam; delete the duplicated `WHERE IT LIVES` panel when its string already appears as a hero fact)
  - `tests/e2e/species-world-seam.spec.ts` (new)
  - `docs/control/GOLD_CURRENT_BRIEF.md` (mandatory pre-code brief per AGENTS.md)
  - **read-only, do not write:** `src/data/livingSystems.ts`, `src/data/species.ts`, `src/data/speciesMedia.ts`, `src/content/imageRegistry.ts`, `src/pages/v5/LivingSystems.tsx`
- **likely components:** `findAnchor` and `EVIDENCE_COLOR` from `@/data/livingSystems`; `withReturnTo` from `@/product/productContext`; the existing `panel`/`mono`/`Status` grammar and `Section` in `Species.tsx`; `PublicShell` unchanged.
- **implementation freedom Claude retains:** seam placement and visual form; how many relationship lines to show; whether to use the anchor `image` (note `OSLOFJORDEN` has none, so the design must not require one); whether the species→anchor table lives in the component or as a typed export; whether F2's chip demotion ships here or is deferred; copy wording inside the truth boundary.
- **acceptance checks:**
  1. `/species/jaguar` and `/species/hyacinth-macaw` show the Amazonia world with at least one relationship line carrying its `state` and `boundary`, above the taxonomy/occurrence block.
  2. `/species/atlantic-cod`, `/species/blue-mussel`, `/species/harbour-porpoise` resolve to `oslofjorden` — the `oslofjord`/`oslofjorden` mismatch must not produce a link reaching `NotFound`.
  3. `/species/western-honey-bee` resolves to `pollination`, **not** `amazonia`.
  4. `/species/humpback-whale`, `/species/sperm-whale`, `/species/bottlenose-dolphin` render **no** world seam (no truthful non-Orca anchor exists) and lose nothing else.
  5. `/species/orca` first read, evidence chapters and `SpeciesEvidenceSeam` visually unchanged.
  6. Anchors with `status: "IN_DEVELOPMENT"` are labelled as such.
  7. At 390px: no horizontal overflow, hero still dominant, seam under 40% of the second screen.
  8. `npm run typecheck`, `npm run lint`, `npm run build`, `node scripts/gold-policy-check.mjs --mode=quality-contract`, `node --test scripts/species-first-plank-source-contract.test.mjs` and `tests/e2e/species-first-read.spec.ts` all pass; rendered mobile + desktop proof for jaguar, honey bee and orca.
- **REJECT even if CI passes:**
  - any relationship, pressure, source or status text not already present in `livingSystems.ts`;
  - a species linked to an anchor that is not truthfully its world (especially humpback/sperm/bottlenose → Orca journey);
  - any link that can reach `NotFound`;
  - `state`, `boundary`, `source` or `IN_DEVELOPMENT` dropped for visual calm;
  - the seam pushing hero, actions or `SpeciesEvidenceSeam` out of their current order;
  - net-new cards added without the duplicated `WHERE IT LIVES` panel being removed (REDUCE BEFORE GENERATE);
  - any edit to `speciesMedia.ts`, `imageRegistry.ts`, `livingSystems.ts` or `LivingSystems.tsx`.
- **overlap state: CLEAR** for the declared write scope, with one bounded caveat.
  - OBSERVED: across the 25 most recently updated `origin/*` refs, only `origin/release/public-core-01-candidate` and `origin/infra/cns-kernel-02-total-cert-trigger` differ from `king/test` on any SPECIES file. Neither touches `src/pages/integrated/Species.tsx`, `src/components/species/` or `src/data/species.ts`. The release line owns `src/data/speciesMedia.ts` and `src/content/imageRegistry.ts` (both excluded above). `cns-kernel-02-total-cert-trigger` is behind, not ahead — it *deletes* `SpeciesEvidenceSeam.tsx` and `species-source-first-read-v01.css`, so it is a donor/superseded line, not a superset.
  - Caveat: `gh pr list` failed (`GH_TOKEN` unset in this runner), so open-PR ownership was **not** verified live. AXE should confirm no open PR owns `src/pages/integrated/Species.tsx` before dispatching the write.

---

## 4. CHALLENGE TO AXE

**The SPECIES gap is not visual polish, and the flagship-first assumption is now inverted.** Orca is not representative: it is the only profile with `narrativeChapters`, `publicClaims`, a Founder photo set, a `truthSpine` record panel and a Living Systems link. Judging SPECIES on `/species/orca` measures a hand-built exhibit, while the ten profiles a real visitor is most likely to reach are structurally empty after the hero and end in "wording withheld". Evidence: in `src/data/species.ts`, `narrativeChapters` and `publicClaims` appear on Orca only, and `Species.tsx:376-437` gates five sections on `isOrca`. Meanwhile SPECIES already stacks *three* evidence presentations on one page (inline `publicClaims`, the taxon/occurrence panels, and the portalled `SpeciesEvidenceSeam`), so the honest deficit is **relationship and meaning**, not more evidence surface. Recommendation: measure SPECIES Gold on the median profile (Jaguar), not the flagship, and treat "which world does this organism belong to" as the next SPECIES contract rather than another evidence layer.

---

## 5. UNKNOWN

- Open-PR ownership of `src/pages/integrated/Species.tsx` — `gh` unauthenticated in this runner; branch-diff evidence only.
- Rendered/runtime behaviour was **not** captured: no build or browser run was performed under REVIEW_ONLY. Layout and byte-weight consequences are INFERRED from source and file sizes; `docs/control/GOLD_VISUAL_BASELINES.json` holds no APPROVED SPECIES baseline, only `CANDIDATE` Orca screens.
- Whether the 2026-09-02 Founder decision on `release/public-core-01-candidate` (Orca hero = Unsplash; illustration fallbacks removed from Public Core) reaches `king/test` before or after this candidate. If before, F3 becomes buildable and `LifeImage`'s illustration branch becomes dead code.
- Whether `_index-hero.jpg` has a rights record held outside this repository.
- Whether `journey: "amazonia"` on `western-honey-bee` is a data defect or a deliberate mapping; this candidate routes around it without editing the data.
