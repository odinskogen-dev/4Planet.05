# CURRENT GOLD BRIEF

This file is the machine-readable human contract for the **current bounded TEST KING change**. Historical briefs belong in issue/PR evidence; this file always reflects the current mutation.

**CHANGE ID:** TEST-KING-EMBLA-02-FIRST-REAL-CHOICE-LOOP-01
**STATUS:** TEST / ACTIVE DEVELOPMENT / FOUNDER REVIEW REQUIRED
**BASE AUTHORITY:** `king/test` / PR #131 / exact parent `f6b13852b48e2589587a065beacff011b94da478`
**ROLLBACK BASE:** `f6b13852b48e2589587a065beacff011b94da478`
**IMPLEMENTED CANDIDATE:** atomic TEST KING commit created from this brief + Embla 02 product change
**FOUNDER DIRECTION:** Start EMBLA 02 now. Keep the full 4SAPIEN/Embla end-state intact: Embla is the personal interface, Choice Engine + BEE remain the shared decision/evidence engine, FOOD is the first wedge, personal money context must later influence choices, and no competing Embla app/database/ranking engine may be created. First visible job: a person gives Embla a shopping list, store and budget and gets immediate controlled coverage with explicit UNKNOWN rather than fabricated product recommendations. Visually move Embla from dark concept-page language to a premium human-first light surface: white/warm-white background, black text, 4PLANET blue actions/details and softly rounded controls.
**SINGLE-SEAM RULE:** The change lands only on `king/test`; no parallel Embla route, FOOD engine, BEE engine, personal-context store or product-ranking system.

## USER ARRIVES BECAUSE
They need help making a real everyday choice quickly, beginning with a grocery shopping list.

## ONE THING TO UNDERSTAND
Embla helps the person move from need → evidence-backed choice → action while preserving what is still unknown.

## PRIMARY ACTION
Enter or paste a shopping list, choose shopping context and optional budget, then analyse the list.

## SECONDARY DEPTH
Switch to Ask Embla for broader decisions; open the existing FOOD evidence proof for product-level inspection; open 4FINANCE to understand the future personal-money layer.

## P1 DOMINANT
Embla itself: one bright, simple, premium personal decision surface with value before explanation.

## P2 ORIENTATION
Four fast entry actions — Shopping list, Find best, Scan, Ask Embla — plus light store/budget context.

## P3 ACTION / NEXT
Analyse list → identify controlled FOOD categories → preserve unsupported categories → save the bounded list context locally → continue into existing FOOD proof where evidence exists.

## P4 DEPTH
Truth boundary, evidence status and later BEE/Choice explanations sit behind the primary job rather than blocking it.

## WHAT CAN BE REMOVED
The previous giant dark concept hero as the dominant task, architecture explanation before user value, large BEE presentation before action, and any fake combined score or fake store availability.

## WHAT MUST BE REUSED
`src/choice/embla.ts`, the existing BEE quorum contract, existing FOOD/PICK product truth path, existing HEALTH/WALLET/PLANET separation, existing Open Food Facts product source, existing Open Prices observation source, current `/4sapien/food` route, current `/4sapien/finance` route and TEST KING convergence tests.

## CLEAN-ROOM / DONOR DECISION
- **ADOPT:** founder-approved light Embla direction; rapid shopping-list job; store + budget as bounded personal context; rounded premium action grammar.
- **REUSE:** current FOOD/PICK evidence stack and current BEE/Choice discipline.
- **REJECT:** separate grocery app, separate ranking database, duplicate Choice/BEE logic, fake live inventory, paid ranking, universal moral score or unsupported HOME/CAR/finance recommendations.
- **DEFER:** full retailer availability integrations, account connections, automated checkout, broad category ranking, voice/photo list ingestion and complete personal money model until the first controlled loop is accepted.

## TRUTH BOUNDARY
COFFEE, MILK and BUTTER are the first controlled shopping-list categories, not claims that every product in those categories can already be ranked. `EVIDENCE_PATH_READY` means the existing product truth path is available; it does not mean a specific product recommendation has reached BEE quorum. Store choice is user context only and must never be represented as current inventory without matching evidence. Budget is user input, not verified financial capacity. Saving the list records an explicit local user action, not a purchase outcome.

## PERFORMANCE
No new AI runtime, model request, map, WebGL or heavy library. Shopping-list classification is deterministic and local. The screen reuses existing routes for deeper product evidence.

## MOBILE-FIRST RISK
The page must deliver the first action without scroll-heavy concept framing, keep 44 px+ touch targets, make store/budget controls usable at 390/430 px, avoid horizontal overflow, and keep result cards readable one-handed in-store.

## HUMAN SUCCESS
Within five seconds a first-time user understands that Embla can help with choices. Within thirty seconds they can paste a list, set store/budget context and see exactly which items Embla can safely work on now versus what remains unsupported.

## ACCEPTANCE
1. `/4sapien` opens on a light premium Embla 02 surface. 2. Shopping list is the default first job. 3. Coffee, milk and butter are parsed as the first controlled categories. 4. Unsupported categories remain visible and explicitly not covered yet. 5. No item is represented as a product recommendation merely because a category is supported. 6. Store context carries an explicit no-live-inventory boundary. 7. Budget is captured as optional user context without pretending personal affordability is known. 8. `Use this list` stores only the bounded list context locally and labels the receipt truthfully. 9. Ask Embla still fails closed for unsupported CAR/HOME and preserves the current finance boundary. 10. Contract tests, typecheck, build, lint/smoke and targeted desktop/mobile browser proof pass before any Founder acceptance claim. 11. LIVE KING remains untouched.
