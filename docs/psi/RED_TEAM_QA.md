# 4PLANET PSI — Red-Team & QA Report v1.0

## Verdict

**PROCEED TO FOUNDER CANON DECISION + ISOLATED DATABASE GATE.**

Do not merge to the controlled product branch or execute live PSI ingest yet.

## Attacks performed

| Attack | Result | Required control |
|---|---|---|
| Rebuild lost Phase 03 adapter as a new runtime | REJECTED | Use recovered primary repo/Postgres persistence seam instead. |
| Treat Phase 03 execution report as source code | REJECTED | Report ≠ executable source. |
| Apply FD-01–FD-06 silently | REJECTED | Founder gate remains explicit. |
| Create generic canonical SOLUTION before FD-03 | REJECTED | Candidate schema does not create it. |
| Infer effectiveness from 2,724 ADDRESSES/relevance edges | REJECTED | `effectiveness_implication = NONE` is a database constraint in staging. |
| Merge Source, Claim and Evidence | REJECTED | Claim↔Evidence is physical and polarity-preserving. |
| Allow Claim to have both object and literal value | REJECTED | Object/value XOR check. |
| Collapse SUPPORTS / QUALIFIES / CHALLENGES | REJECTED | Separate support direction. |
| Keep legacy `EMERGING` evidence vocabulary | CORRECTED IN CANDIDATE | Map to locked `LIMITED` while preserving audit history. |
| Keep legacy interpretation-status semantics | CORRECTED IN CANDIDATE | Map to SOURCE_REPORTED / 4PLANET_INTERPRETATION / INFERENCE with legacy column. |
| Turn one ranking lens into objective global priority | REJECTED | Assessment runs are methodology/lens-versioned; no universal score. |
| Treat no direct PSI solution mapping as no real-world solution | REJECTED | Explicit retrieval refusal test. |
| Treat honey bee as all pollinators | REJECTED | Explicit evidence/product boundary. |
| Claim flower strips reliably increase yield | REJECTED | QUALIFIES/CHALLENGES evidence preserved. |
| Treat Norway pollinator policy as ecological outcome | REJECTED | Public Decision ≠ Outcome; explicit refusal test. |
| Invent a field coordinate for Norway policy | REJECTED | Administrative Place only. Query Area ≠ Place. |
| Promote Pollination vertical to decision-grade for optics | REJECTED | G5 remains REVIEW_REQUIRED until implementation outcome/economics are normalized. |
| Expose internal PSI tables publicly by default | REJECTED | RLS + revoke; no new public policies. |
| Dump 2,724 relation rows into product repo | REJECTED | Large payload lives in hash-verified BRAIN execution package. |
| Claim PostgreSQL/PostGIS production validation | REJECTED | Candidate migration is not executed in this sprint. |

## Contract evidence

Repo-independent package validation before branch publication passed **19/19** tests.

The GitHub branch additionally contains `npm run test:psi` and a dedicated CI workflow that runs:

- locked install;
- TypeScript typecheck;
- existing smoke/truth contracts;
- PSI convergence contracts;
- production build integrity.

CI result must be read from the exact branch head; queued/in-progress is not a pass.

## Open red-team items

1. Execute migration and rollback on isolated PostgreSQL/PostGIS/Supabase staging.
2. Test predicate constraints against adversarial invalid type combinations.
3. Prove staging idempotency and quarantine on the full package.
4. Execute the 50 Context Pack cases against the physical graph.
5. Add implementation-level negative evidence, not only intervention-level qualifiers.
6. Add economics only when units/comparators/context are normalized.
7. Run independent domain-expert review before public decision-support claims.
