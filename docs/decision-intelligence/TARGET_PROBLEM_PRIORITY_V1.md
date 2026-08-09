# 4PLANET_ TARGET_PROBLEM_PRIORITY_V1

Status: internal Decision Intelligence methodology. No universal ranking.

## Purpose

Resolve the ambiguity exposed by legacy benchmark RB-004: `What solutions address multiple high-priority problems?`

The phrase `high-priority` is not self-defining. BRAIN may represent severity, leverage, gaps and Solution↔Problem relevance, but it must not silently convert those dimensions into a global objective ranking.

## Required context

A priority view is executable only when the caller supplies a versioned `TargetProblemPriorityContext` containing:

- an explicit lens identifier;
- an explicit target-problem set;
- an ordinal priority tier for each target problem;
- a rationale for each inclusion/tier;
- who/what declared the context and why.

If this context is absent, the correct answer is `INSUFFICIENT_CONTEXT_FOR_PRIORITY`, not an inferred top-solutions list.

## Eligible graph edges

Only `ADDRESSES` relations that are at least SOURCE_CHECKED and are not REJECTED may contribute to target coverage.

`ADDRESSES ≠ EFFECTIVE` remains invariant. Every eligible relation must carry `effectiveness_implication = NONE`.

## Presentation order

The runtime may present a deterministic order using the visible tuple:

1. number of explicitly targeted P0 problems addressed;
2. P1 problems addressed;
3. P2 problems addressed;
4. P3 problems addressed;
5. total distinct target problems addressed;
6. stable public_ref tie-breaker.

These are lexicographic display rules, not hidden weights and not an aggregate score. The complete tuple and lens must be shown to the user.

Changing the target set/lens is expected to change the ordering. That sensitivity is a feature: priority is decision-context dependent.

## RB-004 resolution

Historical expected refs `4P-SOL-000002` and `4P-SOL-000003` are preserved as historical benchmark fixtures. They are no longer treated as a context-free objective answer.

Versioned V3 behaviour:

- explicit target set/lens supplied → execute `TARGET_PROBLEM_PRIORITY_V1` and expose tuple + sensitivity;
- no explicit target set/lens → refuse context-free ranking.

No runtime behaviour is hardcoded to the historical expected IDs.

## RB-006 resolution

Historical RB-006 expected refs came from a `DEEP_CASES`-oriented fixture that is not part of the current 8,952-record canonical staging release.

V3 therefore classifies the historical expected-ref label as `LEGACY_FIXTURE_NOT_CURRENT_CANONICAL_EXPECTATION`.

Current GAP retrieval must be evaluated against physically staged canonical GAP records and their current review state. Historical deep-case rows must not be reintroduced merely to achieve a benchmark PASS.

If the deep-case material is later canonically migrated, that migration must have an independent evidence/canon rationale and its own versioned benchmark label.

## Truth boundary

- no global 4PLANET priority score;
- no universal best solution;
- no hidden weights;
- no relevance→effectiveness inference;
- no benchmark-fixture hardcoding;
- no silent inference of a user's decision objective.
