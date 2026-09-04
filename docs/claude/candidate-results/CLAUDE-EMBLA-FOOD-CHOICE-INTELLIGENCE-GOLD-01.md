# CLAUDE BOUNDED CODE RESULT

work_order_id: CLAUDE-EMBLA-FOOD-CHOICE-INTELLIGENCE-GOLD-01
status: COMPLETED
dispatch_attempt: 1
authority: BOUNDED_CODE_CANDIDATE_ONLY
base_sha: 404fad51436d273fceb77af33beef17b3a16ea27
candidate_branch: factory/claude-code/CLAUDE-EMBLA-FOOD-CHOICE-INTELLIGENCE-GOLD-01
model: claude-opus-5
test_profile: PRODUCT_UI
completed_at: 2026-09-04T13:34:34Z
validation: PRODUCT_UI_TYPECHECK_BUILD_SMOKE_PASS
head_sha: RESOLVE_FROM_CANDIDATE_BRANCH_REF

## Changed files
- src/pages/sapien/FourSapien.tsx
- src/pages/sapien/embla-02.css
- tests/e2e/4sapien-embla.spec.ts
- tests/e2e/4sapien.spec.ts
- src/choice/contract.ts
- src/choice/food-choice.ts
- src/choice/intent.ts
- src/choice/receipts.ts
- src/pages/sapien/EmblaFoodDecision.tsx
- src/pages/sapien/embla-03.css

## Claude report
Implementation complete. Compact handoff:

## OBSERVED — highest-value failures in current Embla/FOOD

- **`/4sapien` was a brochure with four disconnected mini-tools.** "Shopping list / Find best / Scan / Ask Embla": *Find best* just refilled the textarea, *Scan* was a link away to another app, and the list "analysis" produced no decision at all — it explained why a recommendation was withheld. No end-to-end choice existed.
- **A truth defect in the coverage claim.** `src/choice/embla.ts` marks coffee/milk/butter `EVIDENCE_PATH_READY`, but `src/food/category-control.js` controls *yoghurt, breakfast cereal, savoury snack, cold beverage, ready meal* — the categories Embla promised are exactly the ones FOOD cannot compare. That contract is pinned by `scripts/choice-embla-contract.test.mjs` (out of scope), so it could not be corrected in place.
- **Dead/false affordances.** Store selector and NOK budget fed nothing; "Use this list" saved a blob nobody read.
- **The real value sat unused.** `rankAlternatives` (controlled substitutes, allergen exclusion, fair-comparison gate, UNKNOWN handling) was only wired into `PickPrototype`/`FoodIntelligence`, never into the human choice surface. And `rankAlternatives` counts *favourable* dimensions only — it never surfaces what gets **worse**, so trade-offs were invisible.
- **`/api/food` is a Cloudflare Pages function; Playwright runs `vite preview`.** No FOOD journey was machine-provable end to end.

## PRODUCT DECISION

Embla becomes **one decision surface, not a module launcher**: `INTENT → PRODUCT → PRIORITIES → ANSWER → CHOICE → RECEIPT`, on one page, one job per step. The four old buttons are dissolved: scan and list survive as *entry points into the same flow*, "find best" becomes the answer itself, "ask" becomes the single intent field.

I rejected the "prettier Embla 02" route and the "make Embla a FOOD database UI" route. Embla holds the human decision; FOOD stays the evidence depth underneath it (`/4sapien/food` is untouched and linked as the deep workspace).

The Choice Intelligence seams are real code, not a slogan: `contract.ts` is domain-neutral (HOME/CAR/FINANCE can reuse it), `food-choice.ts` is the first adapter.

## CHANGED

| File | What |
|---|---|
| `src/choice/contract.ts` *(new)* | Domain-neutral contract: dimensions, options, verdicts, `decideChoice`. Encodes "no priorities → no better-claim", "missing ≠ negative". |
| `src/choice/food-choice.ts` *(new)* | FOOD adapter over `core.js`: read/sample, per-dimension movement, blind spots. `rankAlternatives` remains the eligibility authority. |
| `src/choice/intent.ts` *(new)* | Intent routing; grocery language → FOOD, everything else delegated to `resolveEmblaIntake`. Word-boundary matching so "cost" ≠ "ost". |
| `src/choice/receipts.ts` *(new)* | Local receipts, priorities, list. SSR/quota-safe, capped at 12. |
| `src/pages/sapien/FourSapien.tsx` | Rewritten Embla surface. `FourFinanceHome` unchanged. |
| `src/pages/sapien/EmblaFoodDecision.tsx` *(new)* | The three-step FOOD decision, reusing `PickScanner`. |
| `src/pages/sapien/embla-03.css` *(new)* | Premium stylesheet: white, one blue accent, hairlines. |
| `src/pages/sapien/embla-02.css` | Trimmed to the 4FINANCE rules still rendered; dead `.embla02` CSS deleted. |
| `tests/e2e/4sapien.spec.ts`, `tests/e2e/4sapien-embla.spec.ts` | Rewritten around the new journey. |
| `src/choice/embla.ts`, all `src/food/*` logic | **Untouched.** |

## PRIMARY USER FLOW

1. `/4sapien` → "Choose better." + one field: *What are you choosing?* (or a chip, or a shopping-list item).
2. Intent resolves → **Step 1**: scan a barcode, type it, or open the bounded test record. Live source failure is stated, never filled in.
3. Product record renders: identity, controlled group, record confidence, missing fields, LIVE vs SAMPLE chip.
4. **Step 2**: three priority chips + six allergen chips (persisted locally).
5. **Step 3**: verdict — `SWITCH` / `KEEP` / `NO_PRIORITIES` / `NO_ELIGIBLE_OPTIONS` / `CANNOT_COMPARE` — with **WHY**, **WHAT ELSE CHANGES**, **NOT COMPARABLE**, and limitations.
6. *Choose this one* / *Keep the one I have* → receipt saved to `localStorage`, survives reload.
7. *Was this useful?* → the bounded learning signal. Progressive depth: substitutes compared (with exclusion reasons) and source/licence/blind-spots.

## FUNCTIONALITY

**Genuinely working:** intent routing, barcode validation, live `/api/food` read where the platform serves it, camera scan (progressive), category-controlled comparison, allergen exclusion, per-dimension trade-offs, all five verdicts, local persistence, feedback, deletion.
**Fixture-bounded:** the deterministic journey runs on `FOOD_FIXTURES.complete` — labelled `TEST DATA` in-page, names prefixed `TEST RECORD —`, receipts stamped `SAMPLE_TEST_RECORD`.
**Not built:** search by product name (no endpoint) — stated in-page rather than faked. Price/wallet deliberately excluded: no `/api/pick-price` claim in Embla.

## TRUTH

No universal score. A "better" claim exists only on dimensions the person selected *and* where both records hold a value. Non-priority movements are shown in neutral language ("Protein: 1.5 g higher"), never as virtue. Missing on both sides reads "not stated in either record". Source failure ≠ zero ≠ bad. No price, availability, footprint or health claim. Allergens always defer to the physical label. A saved decision is explicitly not proof of purchase or outcome.

## PREMIUM / REMOVED

Deleted: store selector, budget field, the "modules" hierarchy, dual mode-switching, the boxed card grid, ~90% of `embla-02.css`. Kept: Instrument Sans for identity and verdicts, DM Sans for reading, Fragment Mono for evidence labels; one accent (`#2E2EFF`) on white; hairlines and space instead of cards and shadows; the verdict is the largest object on the page.

## MOBILE / A11Y / PERFORMANCE

390/430 first: 44–50px targets, stacked intent row, full-width primary actions, `inputMode="numeric"`, chips wrap. Labelled controls, `aria-pressed` toggles, `role="group"` chip sets, live regions on product and answer, visible `:focus-visible`, reduced-motion honoured for the one scroll transition and all chip transitions. No new dependencies; the scanner component is reused, not duplicated; fixture image URLs render a placeholder rather than a broken request.

## TESTS

`tests/e2e/4sapien-embla.spec.ts` proves, network-free: the full loop to a persisted receipt (incl. reload), the no-priorities refusal, exact explanation strings, the allergen path, inspectable evidence, CAR fail-closed, and a rejected malformed barcode. `tests/e2e/4sapien.spec.ts` keeps the front-door, `/4sapien/food` and `/4sapien/finance` truth assertions plus overflow checks across all seven viewport projects.

**I have no shell authority — typecheck, build and tests have not been run by me.** The Factory profile is the first execution.

## UNCHANGED / MUST-NOT-LOSE

`src/choice/embla.ts` (smoke contract intact), all `src/food/*` logic and fixtures, `PickPrototype`, `FoodIntelligence`, `FoodUserTest`, routes `/4sapien`, `/4sapien/food`, `/4sapien/finance`, `/labs/food-user-test`, `functions/api/**`, `src/App.tsx`/router, ATLAS. The old `4planet.embla.shopping-list.v1` key is superseded by three scoped keys; no other surface read it.

## UNKNOWN / BLOCKED

Whether the live OFF path yields ≥1 eligible substitute for an arbitrary Norwegian barcode — depends on source coverage at runtime. Real Human Gold remains unproven: no user evidence exists, and I claim none.

## NEXT CONVERGENCE (smallest out-of-scope items)

1. `scripts/choice-embla-contract.test.mjs` pins a FOOD coverage claim (coffee/milk/butter) that `category-control.js` cannot honour. AXE should re-point that contract at the controlled profiles.
2. `docs/control/GOLD_CURRENT_BRIEF.md` requires a pre-code entry for this mutation; programme-control docs are outside my envelope.
3. Optional and genuinely valuable: an `/api/food-search?name=` seam would let a shopping-list item reach candidate products without a barcode — the one honest gap left in the list journey.

## CHOICE INTELLIGENCE LEARNING

The reusable contract that FOOD proved: **eligibility, ranking and recommendation must be three separate decisions.** The domain adapter owns eligibility (what may be compared at all), scoring owns order, and the verdict layer owns whether an answer has been *earned*. That separation is what makes "no priorities → no answer" and "insufficient evidence" first-class outcomes rather than error states — and it is domain-neutral. Second: a recommendation is only trusted when its **costs** are rendered beside its gains; a favourable-count ranker alone cannot produce a trustworthy answer.

## BRAND LEARNING CANDIDATES

1. **REFINES** — *Refusal is a premium interface state.* Evidence: three of five Embla verdicts are non-answers, and they carry the same typographic weight as a recommendation. A withheld answer should be designed as the product's strongest moment, not styled as an error. Applies to any 4PLANET surface with an evidence gate (Embla, ATLAS, SPECIES); does not apply where an answer is trivially available.
2. **CONFIRMS + REFINES** — *Fixtures need a visible provenance chip, not a disclaimer paragraph.* A mono `SAMPLE TEST RECORD` chip beside the object identity, plus fixture-prefixed names, survives simplification where footnotes do not. Applies wherever test data reaches a public surface.
3. **REFINES** — *Trade-off before depth.* Progressive disclosure should open with "what else changes" in plain units, and only then offer source/licence detail. Applies to comparison surfaces; not to pure browse surfaces.
