# 4PLANET_ PSI Phase 05 — Retrieval Benchmark v2

Status: PACKAGE-GROUNDED RETRIEVAL PROOF / POSTGRES CONTEXT-PACK CONTRACT VALIDATED / FULL PRIVATE CORPUS NOT HOSTED IN CI

## Truth boundary

The 50 benchmark cases were authored as expected conditions/examples, not as exhaustive relevance judgements for every query. This report therefore separates:

1. exact authored-reference recall;
2. semantic task adjudication;
3. benchmark-label drift;
4. real runtime/Postgres proof.

No metric is presented as global search precision.

## Before → after

| Measure | Baseline | Phase 05 v2 |
|---|---:|---:|
| PASS | 8 | 47 |
| PARTIAL | 7 | 2 |
| FAIL | 35 | 1 |
| Mean exact expected-ref recall | 0.287 | 0.967 |

Semantic adjudication of the v2 result:

- 47 PASS
- 2 PARTIAL
- 1 PASS_WITH_LABEL_DRIFT
- 0 unresolved semantic FAIL

## Material non-PASS cases

### RB-004 — multiple high-priority problems
**Exact:** FAIL  
**Semantic:** PARTIAL

The authored expected examples (`4P-SOL-000002`, `4P-SOL-000003`) each map to five L1 Problem Complexes. The current graph contains other solutions mapping to as many as seven complexes. The retrieval therefore proves multi-problem relevance, but the phrase **high-priority** still needs a frozen/versioned target-problem priority function before this becomes a defensible ranking. Do not tune the engine merely to return the authored examples.

### RB-025 — no direct solution mapping but upstream pathways exist
**Exact:** PARTIAL  
**Semantic:** PASS_WITH_LABEL_DRIFT

`4P-PX-0037` Ocean acidification was an expected ref in the earlier benchmark but the current coverage matrix now records direct PSI coverage (`MODERATE`, 8 mapped solutions). The current engine correctly excludes it from the no-direct-mapping set. This is benchmark-label drift, not a retrieval failure. The old expected set must remain in history rather than being silently overwritten.

### RB-030 — lens-sensitive prioritisation
**Exact:** PARTIAL  
**Semantic:** PARTIAL

The corpus clearly demonstrates that rankings change materially across lenses. However, **highly lens-sensitive** is not yet backed by one frozen mathematical definition. Before this becomes a decision-grade ranked output, freeze a `LENS_SENSITIVITY_V1` methodology (e.g. rank spread, lens presence/absence and minimum-rank criteria), version it, and regenerate labels.

## Refusal/truth cases

The v2 harness passes the authored conditions for:

- corpus absence ≠ real-world absence;
- policy existence ≠ outcome;
- one managed bee taxon ≠ all pollinators;
- ADDRESSES ≠ effectiveness;
- Source Record ≠ verified fact;
- unsupported “best solution” requests;
- missing implementation-outcome evidence;
- SUPPORTS / QUALIFIES / CHALLENGES retrieval;
- corrected CO2 → ocean-acidification causal structure;
- Place/Atlas policy-context boundaries.

## Postgres Context Pack proof

The canonical PostgreSQL/PostGIS runtime implements a bounded `brain_context_pack()` function with explicit limits for hops, objects, claims and sources. Phase 05 hardening excludes `UNREVIEWED` and `REJECTED` relationships and claims from normal Context Packs. Research candidates remain stored in BRAIN but cannot silently become answer context.

The ephemeral Postgres gate tests this truth boundary with reviewed and unreviewed fixtures before and after rollback/reapply.

## Remaining runtime limitation

The private BRAIN PSI execution corpus is intentionally not committed into the public product repository. GitHub Actions therefore validates the real database schema, truth contracts, Context Pack behaviour and fixtures, while the full 50-case corpus benchmark runs against the hash-verified private execution package outside hosted CI.

A secure package mount or private staging Supabase connection is required to run the entire 50-case suite directly against the Postgres corpus without leaking internal BRAIN data into the public repository.
