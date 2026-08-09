# 4PLANET Decision Intelligence — Physical Runtime, Provenance Closure & Human Proof Gate v2

Status: founder-directed internal execution candidate. No merge, production release, public decision service, expert validation or human validation is implied.

## Frozen authority

- Parent Decision Intelligence v1 SHA: `2464462534624529178777b10ff2df3bbbf38d32`
- Parent PR: #31 (draft / unmerged)
- This branch: `agent/decision-intelligence-physical-runtime-v2`

## What v2 adds

1. A fail-closed `DatabaseBackedDecisionIntelligenceService` contract.
2. Explicit physical-data states: `AVAILABLE`, `UNKNOWN`, `NO_LOCAL_EVIDENCE`, `NO_COST_EVIDENCE`, `NO_OBSERVED_OUTCOME`, `PROVENANCE_PENDING`.
3. No narrative fallback when a physical record is missing.
4. Existing universal-best refusal and LENS_SENSITIVITY no-score semantics are preserved.
5. The public/browser layer still receives bounded Decision Packs/read models — never raw staging or promotion access.

## Private corpus boundary

The 8,952-record private BRAIN corpus is intentionally **not** committed to this public repository. A private execution run may mount it only inside an isolated runtime and use the existing Phase05 loader. Default promotion remains zero.

Local execution evidence produced by the sprint is persisted in BRAIN, not in this repo. A local SQLite staging run is useful physical/idempotency evidence but is **not** labelled PostgreSQL/PostGIS proof.

## Provenance boundary

`SOURCE_REGISTRY != SOURCE_RECORD != CLAIM_EVIDENCE`.

A Source Record metadata capture may make a queue item `PARTIAL`; it does not create claim evidence until an exact evidence location and `SUPPORTS / QUALIFIES / CHALLENGES` relationship have been adjudicated.

## Human proof boundary

Human-review and expert-review instruments may be technically ready while validation status remains `NOT_VALIDATED`. Only actual completed human/expert reviews can change that state.

## Stop boundary

Do not merge this branch, deploy a production Decision service, expose private staging records, or promote public category language without explicit founder release.
