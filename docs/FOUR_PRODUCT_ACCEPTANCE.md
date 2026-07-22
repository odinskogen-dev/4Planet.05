# FOUR-PRODUCT PROTOTYPE ACCEPTANCE

Status: LOCKED PROTOTYPE GATES
As of: 2026-07-21

## Gate A — 4PLANET

Passes when:
- Earth remains the public front door.
- The system explains the four public products without forcing a separate architecture.
- A user can enter ATLAS, SPECIES and IMPACT from the persistent interface.
- Editorial 4PLANET content remains reachable.
- No circular or dead-end navigation.

## Gate B — ATLAS

Passes when:
- Globe pans, zooms and rotates before and after context opens.
- No mirrored or rear-hemisphere place labels are visible.
- Projection switching preserves usability.
- At least the prototype-required real layers load or fail honestly.
- A selected place, species observation or signal opens the shared context surface.
- Oslofjorden functions as an intelligence/place proof without an unrelated Tree or Plastic call to action.

## Gate C — SPECIES

Passes when:
- `/species` and `/species/:id` exist.
- At least three profiles are complete enough for the prototype.
- Profiles use canonical IDs and source authority.
- Profiles connect to ATLAS, Living Systems, Issues and Solutions.
- Source failure, no records and not reviewed remain distinct.
- The public product is not confused with the E4RTH mission currently named SPECIES.

## Gate D — IMPACT

Passes when:
- Tree and Plastic journeys run end-to-end in fixture/test mode.
- Every test record states `TEST RECORD — NO PHYSICAL DELIVERY`.
- Contribution, provider request, delivery, evidence and outcome states are separate.
- Personal Impact Records exist locally.
- Share cards work and retain test disclosure.
- Provider claims remain attributed to the provider.

## Gate E — Integrated journey

At least these two paths must work:

### Tree
4PLANET → ATLAS/context → Species/Living Systems → climate/forest Issue → restoration Solution → Tree Unit → test delivery record → proof state → Personal Impact Record.

### Plastic
4PLANET → ATLAS/context → affected Species/Living Systems → plastic Issue → collection/prevention Solution → Plastic Unit → test delivery record → proof state → Personal Impact Record.

## Gate F — Supporting MVPs

- WATCH remains local-first.
- Observation remains distinct from Signal.
- WATCH explains why each item appears.
- NEWS has a minimal curated/prototype feed and does not block the build.

## Gate G — Engineering

Required evidence:
- clean install
- clean typecheck
- production build
- smoke tests
- relevant E2E tests
- mobile runtime review
- desktop runtime review
- changed-file summary
- screenshots or recorded runtime evidence

## Gate H — Authority

- Codex reports implementation.
- GPT audits code, behaviour, truth semantics and acceptance evidence.
- Gemini may red-team independently.
- Odin makes the final judgement.

No item is called VERIFIED DELIVERY until evidence has been inspected.

## Candidate gate record — 2026-07-22

Candidate implementation commit: `328dda5bcf909d911ebe21999a08a6b3d9412eec`

| Gate | Candidate state | Evidence | Remaining gate |
|---|---|---|---|
| A — 4PLANET | DONE LOCALLY | Shared product navigation and retained URL context compile and pass contract tests. | Browser inspection. |
| B — ATLAS | PARTIAL | Globe symbol suppression, world-copy protection, shared camera implementation and regression tests are committed. | Execute desktop/mobile Playwright tests and inspect label rendering. |
| C — SPECIES | DONE LOCALLY | Three accepted GBIF identities, source-aware profiles, live-read states, local WATCH and review-pending seams compile and pass contract tests. | Hosted/browser runtime inspection and source/claims audit. |
| D — IMPACT | DONE LOCALLY | Tree/Plastic TEST journeys, local Personal Impact Records, share-card disclosure and separated proof states compile and pass contract tests. | Browser inspection; production partner/payment remains out of scope. |
| E — Integrated journey | PARTIAL | `entity`, `journey` and `record` are preserved across product links; an E2E test exists. | Browser execution is blocked by missing Chromium. |
| F — Supporting MVPs | DONE LOCALLY | WATCH remains local; Observation is not Signal; minimal NEWS is labelled a product note. | Editorial/source review before public promotion. |
| G — Engineering | PARTIAL | Clean install, typecheck, build, 18 smoke/contract tests, lint, assets and audit pass. | Five Playwright tests, screenshots, hosted DB proof and preview URL remain open. |
| H — Authority | BLOCKED | Auditable branch candidate and evidence record exist. | GPT/Gemini review and Odin judgement. |

No gate in this table changes Locked Canon or asserts production readiness.
