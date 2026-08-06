# P18-FOOD-03 — private user validation contract

Status: PRIVATE TEST CANDIDATE / NO PUBLIC LAUNCH / NO REAL-USER EVIDENCE UNTIL EXECUTED

Base: `agent/p18-food-02` at `2d78e456ba1281d97426404a2c3ae28e6d5efe13`

Route: `/labs/food-intelligence/user-test`

## Purpose

Test whether ordinary people can use the FOOD prototype to identify a product, understand the evidence, apply personal priorities and judge alternatives without receiving a hidden total score or medical advice.

## Privacy boundary

- no name, email, account or contact data;
- no diagnosis, medication or personal medical profile;
- local browser storage only;
- no automatic transmission;
- participant must deliberately export JSON or CSV;
- local data can be deleted from the interface;
- exported files remain research evidence, not verified product truth.

## Participant target

- 10–20 participants;
- at least 100 user-selected product attempts;
- preferably three or more Norwegian shops and at least two retail chains;
- include successful reads, unknown barcodes, incomplete records and source failures;
- do not omit failed scans.

## Required tasks

1. Choose a product the participant could realistically buy.
2. Scan it or enter the GTIN manually.
3. State what the product page establishes and what remains unknown.
4. Compare product identity, ingredients, allergens and nutrition with the physical package where possible.
5. Change at least one priority.
6. Inspect direct, adjacent and unsuitable candidates.
7. Explain why the first alternative appears.
8. Record relevance, trust, usefulness, comprehension time, strongest value and any mismatch.
9. Complete repeat-use, install-intent and payment-intent questions.

## Severity

- P0 — dangerous or materially misleading truth, allergen/identity error, fabricated result, private-data leak or destructive failure;
- P1 — core scan, source, product-card, comparison or export journey fails;
- P2 — important but bounded usability, copy, category or visual defect;
- P3 — polish only; recorded outside the prototype form when needed.

## Decision thresholds

### GO — private alpha continuation

- at least 100 recorded attempts;
- at least 85% product identity match against packaging for checked products;
- no unresolved P0;
- median trust at least 4/5;
- median usefulness at least 4/5;
- at least 70% of comparison attempts rated 4–5 for relevance or correctly shown as not fairly comparable;
- at least 60% say they would use it again;
- source failure and unknown barcode remain understandable.

### AMEND

- no P0, but one or more GO thresholds miss;
- category-specific relevance or package accuracy requires correction;
- users understand the product but do not find it sufficiently useful or repeatable.

### DEFER

- fewer than 50 meaningful attempts;
- insufficient physical package checks;
- source instability prevents representative testing;
- participant recruitment is too narrow to support a decision.

### STOP

- unresolved P0;
- allergen or identity presentation creates material danger;
- personal data is collected or transmitted outside the authorised boundary;
- missing data improves recommendation rank;
- opaque universal score is introduced.

## Evidence handling

Each participant export receives a non-identifying participant code. GPT may aggregate exported files only after Odin provides them. Until then, the user-testing state is `INFRASTRUCTURE READY / REAL-USER EVIDENCE NOT YET RECEIVED`.
