# 4PLANET PSI — Runtime Recovery Report v1.0

**Status:** RECOVERED WITH EXPLICIT SOURCE GAP

## What was recovered

1. The current controlled public/product repository: `odinskogen-dev/4Planet.05`.
2. Draft PR #9 / branch `build/four-product-integrated-prototype`, used as the exact base for this bounded PSI branch.
3. The physical Supabase/Postgres/PostGIS truth-spine migration:
   `supabase/migrations/20260722163000_truth_spine.sql`.
4. Existing product contract tests and Product Context seams.
5. Phase 03 execution/scale reports describing the earlier FastAPI/SQLite reference engine and its benchmark results.
6. Phase 02/Problem Intelligence migration packages, including 250 existing Problem refs, 1,000 Solution refs and the 2,724 derived M:N Problem↔Solution relations.

## What was not recovered

The complete historical Phase 03 FastAPI/SQLite reference-engine source bundle was not found as an identifiable authoritative Drive artefact or GitHub repository during this sprint.

Therefore this sprint does **not** claim to patch that historical adapter.

The Phase 03 reports remain useful execution evidence, but report ≠ source code.

## Current physical authority

The current product programme states that 4PLANET should use one repository/shared core and that BRAIN is the future persistence/Product Context seam. The controlled integration candidate is PR #9 in `4Planet.05`.

The existing Supabase truth spine is therefore the concrete persistence surface used for this PSI convergence candidate.

It is not yet a complete canonical BRAIN schema. Before this sprint it lacked, among other things:

- universal OBJECT_REGISTRY identity;
- typed graph edges with predicate constraints;
- atomic Claim ↔ Evidence infrastructure;
- general versioned assessment runs;
- general Place relationships;
- a staging gate for PSI M:N imports;
- locked truth-axis vocabulary alignment.

The bounded migration candidate in `supabase/migrations-pending-founder/` addresses these structural gaps without applying pending FD-03/04/05 semantics.

## Runtime truth boundary

### Demonstrated

- exact branch provenance from PR #9 head;
- physical SQL candidate persisted in GitHub;
- rollback candidate persisted;
- schema contract tests persisted;
- external Problem Intelligence package hashes persisted;
- local deterministic contract validation: 19/19 tests passed before publication of this branch package.

### Not demonstrated

- actual PostgreSQL/PostGIS execution of the new candidate migration;
- hosted Supabase migration execution;
- full PSI dataset ingestion into Postgres;
- production Context Pack retrieval against the new Problem Intelligence graph;
- production latency/concurrency;
- public deployment.

## Decision

Do not recreate the lost Phase 03 dev adapter as a competing runtime.

Use the current primary product repository and harden its Postgres/PostGIS persistence seam. Preserve the Phase 03 benchmark contracts as reference tests, then port the bounded retrieval semantics only after the physical schema and founder-gated solution ontology converge.
