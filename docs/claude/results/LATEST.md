# CLAUDE FACTORY RESULT

work_order_id: portfolio-oslofjord-human-gold-review-18586b69e35c-d46cb56473e1
queue_sha: fc553361b9bd689c1569e7c8c715cb2c26a830fc
dispatch_attempt: 1
status: COMPLETED
worker: CLAUDE_PRODUCT_INTERFACE
model: claude-opus-5
completed_at: 2026-09-07T00:35:36Z
authority: REVIEW_ONLY

# OSLOFJORD HUMAN GOLD — HEIR COMPREHENSION & PROVENANCE REVIEW

id: `portfolio-oslofjord-human-gold-review-18586b69e35c-d46cb56473e1` · mode: REVIEW_ONLY · PRODUCT_INTERFACE

## STATUS

REVIEW COMPLETE. No repository, TEST KING, LIVE, Canon, outreach or spend mutation. Full deliverable at `/home/runner/.claude/plans/you-are-the-claude-woolly-globe.md`.

Bound to `king/test@18586b69e35c`, OBSERVED to be the **exact current `origin/king/test` head** (`git rev-list --count 18586b69..origin/king/test` = 0). Surface: `/living-systems/oslofjord` → `PlanetProofPage slug="oslofjorden"` (`src/routes/router.tsx:111-112`, `src/pages/v5/PlanetProof.tsx`, `OSLOFJORD_PROOF` in `src/planet/proofs/planetProofs.ts`, `tests/e2e/oslofjord-planet-proof.spec.ts`).

**Lead finding for the Conductor:** the Oslofjord seam is **byte-unchanged since the previous review**. `ce532830` is an ancestor of the pin; the entire diff between them is `package.json`, `src/impact/proofPassport.ts`, `scripts/proof-passport-contract.test.mjs` — none on this seam. The prior contract was never applied. A fourth read of unchanged code is precisely the multipass pattern the work order forbids.

## MATERIAL FINDINGS

**Top three 5-second comprehension blockers**

**B1 · No responsive capability at all.** OBSERVED: `PlanetProof.tsx` has **zero `className` attributes**; all layout is inline-style grid, unreachable by any `@media` rule, and `global.css` queries are entirely class-scoped. Two 2-column grids survive to 390px (header `minmax(0,1fr) minmax(260px,.7fr)`; every `ReadingSection` `minmax(110px,.45fr) minmax(0,1.55fr)`). INFERRED: ~55px for the hero sentence, ~209px for `clamp(30px,5vw,66px)` headlines. OBSERVED test gap: the spec titled *"mobile remains readable"* asserts only `scrollWidth <= innerWidth+1` — squeezed columns never overflow, so it **cannot fail on unreadability**.

**B2 · The first screen answers none of the eight questions.** OBSERVED: the most chromatically dominant line is `OCE4N_ · PLANET PROOF 01 · HUMAN GOLD CANDIDATE — NOT FOUNDER APPROVED`; `oneLine` describes 4PLANET's *method*, not the fjord's *condition*; no geographic anchor exists — "Norway" appears once in all rendered copy, buried in the `WHY` summary. The dominant answer (*"The system is under severe cumulative pressure."*) already exists in data but sits behind a 74vh header, a `min(68vh,720px)` map and an 8-link index.

**B3 · Flat hierarchy plus a ninth decision before the first answer.** OBSERVED: one component renders all eight sections at identical type scale — WHAT IS HAPPENING weighs exactly what HOW DO WE KNOW weighs. `HUMAN-FIRST READING ORDER` emits eight equal anchors to questions the reader cannot yet evaluate.

**Single most important provenance blocker**

**P1 · The proof dates no evidence, while asserting time-bounding as its own law.** OBSERVED: `ProofSource` and `ProofMapLayer` carry **no vintage field**; the ledger renders state/label/authority/supports only. *"Tilstandsrapport for Oslofjorden"* renders undated despite id `mdir-state-2025` and a `/2025/januar-2025/` URL; the interventions 1950–2024 range survives only as prose. The page's own copy says *"Change must be spatial and time-bounded"* and *"action state must remain time-stamped and updateable."* A reader cannot answer *is this current?* — and for a "severe cumulative pressure" claim, currency **is** the claim.

Same seam: all eight sections are `confidence: "HIGH"`, so the traffic-light chip discriminates nothing and grades a judgement claim like a bathymetry measurement; `OPEN` renders alarm-red on transfer packs via the ternary fallback; `AUTHORITATIVE`/`OPERATIONAL` have no key. The prior review's self-certifying `MAP · READY` is re-OBSERVED unfixed — ranked below P1 because it is a failure-mode risk, whereas undated evidence is unconditional.

## RECOMMENDED ACTION — `OSLOFJORD-CORRECTION-01`

Three code files, no redesign, no new primitive, each step revertable.
**C0** write the Oslofjord Gold brief first — the current one is scoped to Embla FOOD. **C1** add `className="os-two"` to the two grids, reusing `global.css:36` (stylesheet `!important` beats inline style; zero new CSS) and constrain the map panel ≤640px. **C2** promote `WHAT_IS_HAPPENING.headline` to P1, add a geographic anchor, **move** the candidate badge to the footer — move, do not remove; it is machine-asserted. **C3** add optional `vintage` to source + layer, populated only from the cited document, `VINTAGE · UNKNOWN` where unestablished; add the AUTHORITATIVE/OPERATIONAL key; neutralise `OPEN`. **C4** assert measured widths at 390px and add `aria-pressed` to layer toggles.
**Deferred, non-blocking:** binding `MAP · READY` to per-layer tile arrival and re-binding `SEABED / DEPTH` — needs runtime evidence this lane cannot produce.

## MUST-NOT-LOSE

`/oslofjorden` → `/oslofjord` redirect and `slug: "oslofjorden"` with its transfer-block condition; the eight question strings, *"Nothing important should require trust in 4PLANET alone."*, the candidate badge and the MAP BOUNDARY phrase (truth invariants, not copy); ≥6 `OPEN SOURCE` links; no merged fjord score or invented boundary/route/population/causation; one Factory, one TEST KING receiver, Founder gates.

## RISKS

The material risk is another review, not a bad edit — two independent reads now agree on B1 and B2. C2 touches strings adjacent to asserted phrases (run the spec before and after). C3 vintages must come from the source document, not the id string.

## UNKNOWN

WMS endpoint liveness (no network taken); freshness of the local `origin/king/test` ref against remote; whether another lane holds the `PlanetProof.tsx` write lock — confirm before dispatch; rendered visual state, performance, screen-reader traversal; `CURRENT_4PLANET_CONTEXT.md` marker is 2026-09-02 against today's 2026-09-07.

**Next gate:** dispatch C0→C4 to the existing maker after lock confirmation. Do not dispatch another Oslofjord review.
