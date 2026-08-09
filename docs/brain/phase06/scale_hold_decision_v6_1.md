# 4PLANET BRAIN — Phase 06.1 Scale Release Decision

**Decision: HOLD**

Date: 2026-08-09  
Authority: founder-directed internal gate; no merge, remote deployment, public release or corpus expansion is authorised by this decision.

## What now passes

- Fresh PostgreSQL 17.6 + PostGIS 3.3 migration/reapply and bounded cohort proof.
- Staging, validation, quarantine and founder-gated promotion fail-closed behaviour.
- 19 bounded claims retain provenance, measurement basis, evidence direction and limitations.
- SUPPORTS / QUALIFIES / CHALLENGES remain separate.
- Unknowns remain unknown; the cooling proof does not invent an implementation.
- Public RLS hides the internal staging cohort.
- Founder feedback has been repaired as a general uncertainty-presentation contract without changing Context Pack v4 or the scientific meaning of the four reviewed answers.
- Exact code-validation SHA `5bffa2b971b89beff0124f0309a858bd705409a3` passed GitHub Actions run `31327015530`.

## Why HOLD

Two material blockers remain:

### 1. REMOTE_INFRASTRUCTURE_BLOCKER

No authorised remote Supabase staging project reference/configuration is available in the current canonical repository/context. `supabase/config.toml` is not versioned on the Phase06 branch, repository environments count is zero, and no `SUPABASE_PROJECT_REF`/linked staging target was found. Repository secret enumeration is not accessible to the current integration and no credential has been guessed.

Status: `DEPLOYMENT_READY_NOT_EXECUTED`.

The stricter release rule applies: ephemeral CI is sufficient to prove migration/runtime behaviour, but not sufficient to authorise a data-scale Wave 1 into canonical infrastructure.

### 2. INTEGRATION_BLOCKER

The canonical Living Systems semantics are established, but concrete Living System / Function / Ecosystem Service IDs needed for the microfibre and coral Decision Proofs are not physically seed-visible in the same tested BRAIN truth spine. The system correctly refuses to invent duplicate ecological nodes.

Status: `MAPPING_REQUIRED`.

Until this is materialised, the promised shared graph from pressure/problem → living system → function/service → consequence → solution → implementation is architecturally specified but not physically proven in the tested database.

## What is NOT a scale blocker

- Four unresolved actor candidates remain `PENDING_ENTITY_RESOLUTION`, because quarantine prevented four unsafe name-based merges. This is fail-safe behaviour, not a reason to force actor IDs.
- ATLAS geometry is incomplete for the bounded sites, but the read model safely omits unverified coordinates.
- Founder review was qualitative rather than structured. It is sufficient for this closure because the feedback produced a material repair and the system does not misrepresent it as structured PASS labels. Expert validation remains future evidence, not a precondition for closing the present technical sprint.

## Release consequence

Do **not** execute Wave 1 (≈500 problems / 2,000–2,500 solutions).

Close the two blockers with a narrow Phase 07, rerun the same exact-SHA gate against actual remote staging and a physically shared Living Systems graph, then reassess SCALE/HOLD.
