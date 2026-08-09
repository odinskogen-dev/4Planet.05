# 4PLANET_ PSI CANON FREEZE v1.0

Status: FOUNDER-APPROVED / IMPLEMENTED ON CONTROLLED DRAFT BRANCH  
Founder decision date: 2026-08-09  
Founder: Odin Oddekalv  
Branch: `agent/psi-phase05-canonical-convergence`  
Public release: NOT AUTHORISED

## Purpose

This freeze converges Problem Intelligence, Solution Intelligence, the BRAIN truth spine and the controlled ONE INTERFACE technical base into one typed intelligence architecture. PSI remains an internal BRAIN intelligence service over the One Planet Model. It is not a fifth product and not a parallel database.

## Founder decisions

### FD-01 — PROBLEM_FRAME
`PROBLEM_FRAME` is the canonical problem-intelligence object. A frame is scoped and versioned rather than a universal timeless fact. Existing `4P-PROB-*` public references are preserved. Public UX may label the object **Problem**.

### FD-02 — Legacy VARIANT
Legacy `VARIANT` records migrate to `INTERVENTION`. Their historical class is retained in `brain_legacy_mappings`; specialisation is represented by typed `VARIANT_OF` / `SPECIALISES` relationships. `VARIANT` is not a durable canonical object type.

### FD-03 — Solution umbrella
**Solution** is a human-facing/derived umbrella only. Canonical identities are:

- `SOLUTION_PATHWAY`
- `INTERVENTION`
- `OFFERING`

There is no generic canonical `SOLUTION` table/object. `solution_catalogue` is a derived read view only.

### FD-04 — NEED
`NEED` uses two independent axes:

- `need_kind`: CHALLENGE / PROCUREMENT / PROJECT / MISSION / RESEARCH / OTHER
- `need_origin`: EXTERNAL_EXPLICIT / EXTERNAL_DERIVED / INTERNAL_SCENARIO / ANALYTICAL_DERIVED

External-origin needs require source-record provenance. Internal or analytical needs must never be presented as explicit external demand.

### FD-05 — Implementation lifecycle
Implementation/deployment truth is separated into:

- `execution_phase`: PROPOSED / PLANNED / PILOT / UNDER_CONSTRUCTION / OPERATIONAL / COMPLETED / DECOMMISSIONED
- `execution_state`: ACTIVE / SUSPENDED / CANCELLED / FAILED / UNKNOWN
- sourced events: ANNOUNCED / FINANCED / CONTRACTED / procurement / construction / operation / completion etc.

Financing, contracting and announcement are not lifecycle phases.

### FD-06 — GOLD
`GOLD_REFERENCE_CASE` is internal review-completeness metadata only. It is never effectiveness, certification, recommendation, provider quality or public ranking. It has no anonymous/public RLS policy.

## ID-preservation result

Current 1,000-solution corpus migration:

| Legacy class | Count | Canonical destination | Public ref |
|---|---:|---|---|
| PATHWAY | 250 | SOLUTION_PATHWAY | preserved |
| INTERVENTION | 710 | INTERVENTION | preserved |
| VARIANT | 40 | INTERVENTION + legacy mapping + VARIANT_OF | preserved |
| OFFERING | 0 | none invented | n/a |

Result: **1,000 / 1,000 existing Solution public refs preserved.**

Problem/system migration package:

- 18 SYSTEM identities
- 100 L1 Problem Complex frames
- 250 existing detailed problem frames
- 350 total PROBLEM_FRAME identities
- 780 hierarchy/system/cross-frame relationships

No new competing problem universe is created.

## Supersession register

| Prior semantic pattern | Canonical treatment |
|---|---|
| Generic PROBLEM object semantics | Superseded by scoped PROBLEM_FRAME |
| Generic canonical SOLUTION | Superseded; Solution is derived UX umbrella |
| VARIANT as durable solution type | Superseded; migrate to INTERVENTION + history/relation |
| Need kind/origin conflation | Superseded by orthogonal need_kind + need_origin |
| One overloaded implementation status | Superseded by execution_phase + execution_state + sourced events |
| GOLD as potentially public maturity/quality signal | Forbidden; internal completeness designation only |

## Backward compatibility

1. Existing `4P-PROB-*`, `4P-PX-*`, `4P-SOL-*` and source refs remain durable public/corpus references.
2. Public clients may continue to use the labels **Problem** and **Solution** while the persistence layer resolves them to canonical types.
3. Existing legacy VARIANT IDs are not reissued; their canonical object type changes to INTERVENTION and their previous class is retained in migration history.
4. Existing Source Record / Observation / Signal / Interpretation / IMPACT truth-spine tables are preserved.
5. No relation is allowed to imply solution effectiveness. `brain_relationships.effectiveness_implication` is hard-constrained to `NONE`.
6. Expected outcomes, measurements, observed BRAIN outcomes and IMPACT delivery/outcome records remain distinct.
7. Normal Context Packs exclude UNREVIEWED and REJECTED relationships/claims. Research candidates remain stored but cannot be silently laundered into answer context.

## Physical implementation

The controlled migration implements:

- universal typed `brain_objects` registry
- revisions, aliases, external identities and legacy mappings
- scoped problem frames
- separate pathways/interventions/offerings
- needs
- actors and places/PostGIS
- implementation phase/state/events
- public decisions
- expected outcomes, measurements and observed BRAIN outcomes
- gaps
- typed predicates and subject/object constraints
- claims + SUPPORTS/QUALIFIES/CHALLENGES evidence
- versioned assessments
- cost observations and transferability assessments
- hash-addressed staging, quarantine and founder-gated promotion
- bounded Context Pack retrieval
- RLS/private-by-default truth boundaries.

## Runtime proof

GitHub Actions executes the migration on ephemeral PostgreSQL/PostGIS, runs the founder-approved SQL contracts, performs the bounded rollback, verifies the pre-existing truth spine survives, reapplies all migrations from a clean state, reruns SQL contracts, generates TypeScript schema types, runs DB lint, then application typecheck/build.

This is **ephemeral integration validation**, not a production deployment or a claim that a hosted production database has been migrated.

## Locked truth contracts

- OBSERVATION ≠ SIGNAL
- SIGNAL ≠ ALERT
- SOURCE ≠ CLAIM
- CLAIM ≠ VERIFIED FACT
- CORRELATION ≠ CAUSATION
- PRESSURE ≠ THREAT
- ADDRESSES ≠ EFFECTIVENESS
- SOLUTION ≠ PROVEN SOLUTION
- IMPLEMENTATION ≠ OUTCOME
- EXPECTED OUTCOME ≠ OBSERVED OUTCOME
- ACTION ≠ OUTCOME
- OUTCOME ≠ SYSTEM IMPACT
- POLICY / PUBLIC DECISION ≠ RESULT
- ACTOR ≠ PARTNER
- QUERY AREA ≠ PLACE
- DATABASE ABSENCE ≠ REAL-WORLD ABSENCE
- AI OUTPUT ≠ CANONICAL TRUTH
