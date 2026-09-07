# CLAUDE FACTORY RESULT

work_order_id: portfolio-oslofjord-human-gold-review-ce5328306408-014b0b5ebdf8
queue_sha: cd5297483d26aa5f131f53f385d734eee2d5cf5d
dispatch_attempt: 4
status: COMPLETED
worker: CLAUDE_PRODUCT_INTERFACE
model: claude-opus-5
completed_at: 2026-09-07T00:28:55Z
authority: REVIEW_ONLY

Write is disabled in this session, and the lane is REVIEW_ONLY, so the deliverable is returned inline.

---

# OSLOFJORD HUMAN GOLD — HEIR COMPREHENSION & PROVENANCE REVIEW

id: portfolio-oslofjord-human-gold-review-ce5328306408-014b0b5ebdf8
mode: REVIEW_ONLY · worker_role: PRODUCT_INTERFACE · project: PLANET_GOLD_01_OSLOFJORD

## STATUS

REVIEW COMPLETE. No repository, TEST KING, LIVE, Canon, outreach or spend mutation occurred.

Bound to `king/test@ce532830640817f83c11923bdfb4c394f222baad` (OBSERVED present locally; parent `fdd770f4`). Reviewed surface: `/living-systems/oslofjord` → `PlanetProofPage slug="oslofjorden"`. Evidence at that SHA: `src/pages/v5/PlanetProof.tsx` (183 lines, whole render), `src/planet/proofs/planetProofs.ts` (`OSLOFJORD_PROOF`), `src/routes/router.tsx:111-113`, `tests/e2e/oslofjord-planet-proof.spec.ts`, `src/styles/global.css:36`.

Scope law honoured: no unrelated repo archaeology. Runtime rendering was **not** executed (REVIEW_ONLY — no build or artifact mutation). Findings derive from exact pinned source and are marked OBSERVED / INFERRED accordingly.

## MATERIAL FINDINGS

### Top three blockers to 5-second comprehension — ranked

**B1 · The proof has no mobile layout at all; on a phone the hero and all eight reading sections collapse into unreadable slivers.**

OBSERVED: `PlanetProof.tsx` contains **zero `className` attributes** (grep count 0). Every layout is an inline-style two-column grid. Inline styles are unreachable by any `@media` rule without an `!important` class hook, so the page is structurally incapable of responsive adaptation. `index.html` sets a correct `width=device-width` viewport, so 390px is real CSS px.

INFERRED (track arithmetic at 390px):
- Header (`minmax(0,1fr) minmax(260px,.7fr)`, padding `6vw`=23.4px, gap 28px): 315.2px of track space; column 2 floors at 260px, leaving **~55px** for column 1 — which holds the hero sentence at `clamp(23px,3.6vw,48px)`. One short word per line.
- Every `ReadingSection` (`minmax(110px,.45fr) minmax(0,1.55fr)`, gap 24px): the question rail floors at 110px of 343px, leaving **~209px** for a `clamp(30px,5vw,66px)` headline at `letter-spacing:-.045em`.

Why #1: mobile is a first-class 4PLANET quality law, and this is the one defect that makes the entire reading grammar unreadable rather than merely slow.

Truth-gate consequence (OBSERVED): the spec titled *"Oslofjord mobile remains readable, interactive and source-inspectable"* asserts only `scrollWidth <= innerWidth+1` plus element visibility. Squeezed columns do not overflow — **the test passes while the claim in its own title is false.**

**B2 · The first screen answers none of the eight questions and leads with internal Factory vocabulary instead of the fjord. (OBSERVED)**

The `74vh` header presents, in order: (1) eyebrow `OCE4N_ · PLANET PROOF 01 · HUMAN GOLD CANDIDATE — NOT FOUNDER APPROVED` — the most chromatically dominant line on screen is maker-internal review state; (2) `Oslofjorden` at up to 176px, with no country/where anchor; (3) `oneLine`: *"A real fjord read through real seabed, habitat, water-status, pressure and action evidence"* — this describes 4PLANET's **method**, not the fjord's **condition**; (4) `truthBoundary` at 13.5px in `dim`.

The dominant human answer already exists in the data — `WHAT_IS_HAPPENING.headline`: *"The system is under severe cumulative pressure."* — but sits behind the 74vh header, a full-bleed dark map at `min(68vh,720px)`, and an eight-link index. INFERRED ~2.5 screens of mobile scroll before the first substantive answer.

At 5 seconds a first-time human learns: a codename, a governance status, a place name, and that 4PLANET has a method. Not what is happening to the fjord.

**B3 · Flat hierarchy plus visible engineering/governance telemetry: nothing is P1. (OBSERVED)**

All eight sections render through one identical component at identical type scale — WHAT IS HERE has exactly the weight of WHAT CAN BE DONE; the reading-order block emits eight equal links. Meanwhile the public surface exposes `MAP · READY`/`DEGRADED`, `PROOF STATE · FOUNDER_REVIEW`, `MAKER ≠ JUDGE`, and per-source `AUTHORITATIVE`/`OPERATIONAL` badges whose distinction is never explained.

Contributing entry mismatch (OBSERVED): `LivingSystems.tsx:193-195` says *"AMAZONIA, OSLOFJORDEN AND BEE … ARE IN DEVELOPMENT — OPEN THEM ABOVE TO SEE THE STRUCTURE"*, and the card links `/living-systems/oslofjorden` (`src/data/livingSystems.ts:205`), which `router.tsx:111` redirects into a different page architecture badged as a Human Gold candidate.

### The single most important provenance / source-presentation blocker

**P1 · The map asserts source-backed evidence that the interface never verifies and never explains.** The trust claim is bound to layer *registration*, not to evidence *arrival* or *legibility*.

Two OBSERVED components of one seam in `EvidenceMap`:

1. **State is not bound to evidence.** `setStatus(current => current === "DEGRADED" ? current : "READY")` fires inside `m.on("load")` immediately after the `addSource`/`addLayer` loop; `load` resolves on basemap style load, and the `try/catch` only catches synchronous registration throws. No overlay tile has been requested when `MAP · READY` appears under the banner **`REAL GEOSPATIAL EVIDENCE · NO ILLUSTRATED ECOLOGY`**. INFERRED failure mode specific to WMS (not generic network failure, which `m.on("error")` would catch): a `GetMap` returning HTTP 200 with a blank tile or a rendered `ServiceException` image — the standard result of a renamed `LAYERS` value or SRS mismatch against the three hardcoded endpoints — yields **`MAP · READY`, a ticked `ECOLOGICAL STATUS` box, and zero authority pixels**, with nothing in the UI able to contradict it.

2. **No layer is interpretable.** `ProofMapLayer` carries no legend, vintage or retrieved-at field, and nothing renders one. `ECOLOGICAL STATUS` is a classified colour raster — the primary WHAT IS HAPPENING evidence — shown with no key. INFERRED conflation on the same seam: `SEABED / DEPTH` binds `sourceId: "ngu-marine-wms"` (MarineGrunnkart `Dybdeforhold`) while the adjacent facts assert *"a regular 1 m grid"* from the distinct `ngu-bathy-1m` dataset — precisely the merge the page's own copy forbids (*"do not merge unlike evidence into one score"*).

Why this outranks other provenance items: an unverified truth-claim is worse than a missing one. The page's entire differentiation is *"Nothing important should require trust in 4PLANET alone"* — and the element carrying that promise is self-certifying.

Lesser, deferrable: `OPEN SOURCE ↗` on all eight ledger cards reads as free/open-source software, not "open this source at the issuing authority."

## RECOMMENDED ACTION — one minimal correction contract

For the **existing maker**. No redesign, no new page architecture, no new component, no new primitive. Four ordered edits, three files, each independently revertable.

**C0 · Precondition (AGENTS.md, blocking).** `docs/control/GOLD_CURRENT_BRIEF.md` at `ce532830` is scoped to `GIGA2800-REALITY-PROOF-HUMAN-RESEARCH-01` (Embla FOOD). It does **not** cover the Oslofjord proof, which is nonetheless badged `HUMAN GOLD CANDIDATE`. Write the Oslofjord brief in the same bounded change, before the code edits.

**C1 · Fix mobile by reusing an existing primitive — zero new CSS.** `src/styles/global.css:36` already ships `@media (max-width:900px) { .os-two { grid-template-columns:1fr !important; } }`, and stylesheet `!important` overrides inline style. Add `className="os-two"` to the header split grid and the `ReadingSection` grid. Two attributes; desktop asymmetry untouched. Also cap or reflow the layer panel at ≤640px — INFERRED it currently sits ~358×258px over a 574px map on a 390×844 device, covering the evidence it inspects.

**C2 · Make the first screen answer the dominant question.** Promote `WHAT_IS_HAPPENING.headline` into the header as P1, demote `oneLine` to support, add a plain geographic anchor, and move `HUMAN GOLD CANDIDATE — NOT FOUNDER APPROVED` out of first chromatic position into the existing footer beside `PROOF STATE`. The badge must remain present and machine-assertable — the ATLAS lesson in `CURRENT_4PLANET_CONTEXT.md:104` is that human-first cleanup must not delete an enforced truth phrase. **Move it; do not remove it.**

**C3 · Bind the evidence claim to arriving evidence.** Replace the single global `MAP · READY` with per-layer state driven by real tile events (`sourcedata`/`error` per source id), rendered on the layer row that already exists under `INSPECT THE EVIDENCE`. A layer that returned no tile must not read as delivered evidence, and the `REAL GEOSPATIAL EVIDENCE` banner must degrade when nothing arrived. Add `legend` + `retrievedAt` to `ProofMapLayer` and render them in the same row. Re-bind `SEABED / DEPTH` to the source actually drawn, or move the 1 m grid fact out of adjacency.

**C4 · Make the mobile test test what its title claims.** In the 390px case, assert measured rendered width of the hero paragraph and of a `ReadingSection` headline above a stated minimum, plus one per-layer evidence state. Overflow-only assertions must stop being cited as mobile Human Gold evidence.

Capacity split: **C0+C1+C2** first (comprehension, low risk, reversible); **C3+C4** second (truth binding, needs runtime evidence).

## MUST-NOT-LOSE

- `/living-systems/oslofjorden` → `/living-systems/oslofjord` redirect (`router.tsx:111`) and the alias-regression immunity behind `e33549ea` / `80446464`.
- `slug: "oslofjorden"` and the coupled `proof.slug === "oslofjorden"` transfer-block condition — C2 must touch neither.
- The eight exact question strings, `"Nothing important should require trust in 4PLANET alone."`, `"HUMAN GOLD CANDIDATE — NOT FOUNDER APPROVED"`, and the `MAP BOUNDARY · navigation/view extent…` phrase — all machine-asserted; truth invariants, not copy.
- ≥6 `OPEN SOURCE` links and the eight-source ledger.
- Layer separation: no merged fjord score, no invented boundary, migration route, population estimate or causal attribution.
- One Factory, one TEST KING receiver, Founder release gates, no parallel writer on this seam.

## RISKS

- C3 is the only edit with real regression surface: `sourcedata` fires repeatedly and needs debouncing, and a stricter state machine may turn a currently-green page amber. Correct if the overlays genuinely are not rendering — but observe it before shipping, or an honest fix reads as a break.
- C2 edits strings adjacent to machine-asserted phrases; the ATLAS precedent is a copy cleanup that removed an enforced phrase. Run the spec before and after.
- INFERRED items (mobile track widths, WMS silent-blank behaviour) are deterministic from source but unrendered here. One 390px screenshot and one network check settle both; do not promote to OBSERVED without that.
- No Oslofjord Gold brief exists (C0). Coding without it repeats the control failure, not only the product one.

## UNKNOWN

- Whether the three WMS endpoints currently return imagery — not fetched (REVIEW_ONLY, no network evidence).
- Whether `ce532830` is still TEST KING head at read time. `factory/claude-product-worker-01` does not contain that commit or these source files; the pin was resolved from local object history, not a live branch read.
- `CURRENT_4PLANET_CONTEXT.md` freshness marker is `2026-09-02`; later TEST KING head/ownership changes are unverified from this lane.
- Whether another active lane owns the `PlanetProof.tsx` write seam — confirm before dispatching C1–C4.
- Rendered-vs-inferred visual state, device performance, and screen-reader traversal of the eight-section grammar.

## BRAND LEARNING CANDIDATES

**L1 — A passing test named for a human quality is not evidence of that quality.** Evidence: the 390px spec asserts only non-overflow yet is titled *"mobile remains readable."* CHALLENGES current Gold evidence practice. Rule: when an e2e test name claims a human property (readable, understandable, inspectable), it must assert a measured proxy for it, or be renamed to what it actually checks. Applies to all Gold proof specs; not to build/type gates.

**L2 — Governance state is not the first thing a human should read.** Evidence: the candidate badge is the most visually dominant element above a 176px title. CONFIRMS "human understanding before internal architecture"; REFINES it — candidate/review badges stay present and machine-assertable but belong in a consistent footer/status position, never P1. Applies to every proof/candidate surface; not to safety or truth-boundary warnings that change how the content itself should be read.

**L3 — A trust indicator must be bound to the arrival of the thing it certifies.** Evidence: `MAP · READY` resolves on basemap style-load, independent of any authority overlay. CONFIRMS "truth/source depth must survive interface simplification" and extends it to runtime: any READY/VERIFIED/SOURCE-BACKED signal must derive from the evidence event, not the render event. Applies wherever 4PLANET displays third-party evidence state.
