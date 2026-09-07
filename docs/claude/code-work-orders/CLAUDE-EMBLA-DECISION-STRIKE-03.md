# CLAUDE BOUNDED PRODUCT BUILD — EMBLA DECISION STRIKE 03

id: CLAUDE-EMBLA-DECISION-STRIKE-03
base_sha: 6c895b806b2f8d2a3bea272f17e38f70c6e8b7bc
test_profile: PRODUCT_UI
model: claude-opus-5
dispatch_attempt: 1
write_scope: src/pages/sapien/EmblaFoodChoice.tsx
write_scope: src/pages/sapien/embla-choice.css
write_scope: tests/e2e/4sapien-embla.spec.ts

status: BOUNDED_FACTORY_CANDIDATE_ONLY
owner: AXE / 4PLANET Production Factory
project_id: AXE-MULTISPRINT-06-EMBLA
priority: 100

## WHY THIS STRIKE EXISTS

Two broader Embla attempts hit the Factory 60-turn ceiling. No partial mutation was retained. Do not repeat broad repo archaeology.

Current code truth already exists:
- `/4sapien/food/choose` renders `src/pages/sapien/EmblaFoodChoice.tsx`;
- it already separates SUGAR / SALT / PROTEIN / ALLERGENS / WALLET / PLANET / BALANCED;
- it already reuses `FoodIntelligence` and `PickPrototype`;
- current defect: it still feels primarily like a priority/readiness selector that launches underlying engines, not one assistant closing one human choice.

This strike is intentionally only three writable files. Read other existing FOOD/choice files only when needed to understand current evidence semantics. Do not create any new file or architecture.

## PRIMARY MISSION

Make the existing Embla FOOD decision page feel like one coherent human decision assistant, without inventing evidence or rebuilding FOOD.

The primary journey must read naturally as:

WHAT ARE YOU TRYING TO CHOOSE?
→ WHAT MATTERS MOST / HARD CONSTRAINT
→ EMBLA ANSWER STATE
→ WHY
→ MATERIAL TRADE-OFF / WHAT MAY GET WORSE
→ WHAT IS UNKNOWN / WHAT WOULD CHANGE THE ANSWER
→ ONE NEXT ACTION
→ OPTIONAL DEEPER FOOD EVIDENCE

Use the strongest current evidence that already exists. If evidence cannot support a recommendation, explicitly CLARIFY or WITHHOLD. Do not fake a winner.

## MUST PRESERVE

- HEALTH / PERSONAL FIT, WALLET and PLANET remain distinct dimensions.
- Allergens/hard constraints override ranking convenience.
- Physical allergen label remains authoritative.
- Missing evidence is UNKNOWN, never a positive ranking signal.
- No universal moral/sustainability score.
- No paid ranking.
- No fabricated price, availability, health, environmental, purchase or outcome claims.
- Existing `FoodIntelligence` / `PickPrototype` capability remains reusable evidence depth.
- Current routes and research-mode return link remain intact.
- Direct British English.

## EXACT PRODUCT CHANGE

1. Replace internal-facing readiness language in the main journey with human decision language.
2. Keep choice input extremely simple. Do not add fake store/budget fields.
3. Make one answer hierarchy dominant for every state:
   - `RECOMMEND` only when current controlled evidence genuinely supports it;
   - `CLARIFY` when the user has not supplied a decision priority that can be compared honestly;
   - `WITHHOLD` when product/category evidence cannot support the requested ranking.
4. For supported health/allergen comparison paths, tell the user what Embla can decide now and then expose the existing comparison engine as evidence/action depth.
5. For WALLET / PLANET, explicitly state why a category-wide ranking is withheld while still offering the truthful single-product evidence path.
6. Show at least one material trade-off/limitation instead of only benefits.
7. Show one concise UNKNOWN / “what would change this answer” statement.
8. Give exactly one dominant next action per answer state.
9. Keep evidence/provenance subordinate to human value, not a dashboard of system modules.
10. Preserve research mode.

## HUMAN BAR

5 seconds: first-time person understands this helps with a real food choice.
30 seconds: they have chosen what matters and can see Embla’s current answer state plus why.
3 minutes: they can take one useful next action, understand a trade-off/limit, and inspect deeper evidence if wanted.

## MOBILE / CRAFT BAR

- 390×844 and 430×932 must have one obvious vertical reading order.
- no dense card dashboard;
- no horizontal overflow;
- minimum 44px primary controls;
- keyboard/focus visible;
- premium editorial hierarchy rather than SaaS chrome;
- progressive disclosure for evidence depth.

## TEST REQUIREMENTS

Strengthen `tests/e2e/4sapien-embla.spec.ts` only as needed to prove:
1. supported comparison path exposes a clear answer state and next action;
2. BALANCED/no valid priority produces CLARIFY rather than a fake universal winner;
3. WALLET or PLANET produces WITHHOLD for category ranking and a truthful product-evidence next action;
4. allergen language preserves physical-label authority;
5. mobile has no obvious horizontal overflow and retains the primary action.

Do not test implementation trivia. Test human/truth outcomes.

## EXECUTION DISCIPLINE

You have a hard 60-turn ceiling. This task should finish far below it.

Do not inspect the whole repo. Start by reading only:
- `src/pages/sapien/EmblaFoodChoice.tsx`
- `src/pages/sapien/embla-choice.css`
- `tests/e2e/4sapien-embla.spec.ts`
- directly imported FOOD components only if needed for truth-safe wiring.

Then decide, edit, red-team once, return. No second pass, no future-domain abstraction, no new contract files.

## DEFINITION OF DONE

- the page is materially more human and decision-complete than current base;
- answer hierarchy is clear;
- trade-off + UNKNOWN are visible;
- no unsupported recommendation introduced;
- current deep FOOD evidence remains reusable;
- exact three-file scope respected;
- tests prove the human/truth outcomes;
- no commit/push/merge/LIVE release/external action by Claude.

## FALSIFIER

If the result still feels like a selector that says which internal engine is ready, rather than Embla answering a real person’s choice as far as evidence permits, it is not done.