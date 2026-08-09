# 4PLANET_ PSI Phase 05 — Canonical BRAIN Convergence

Status: **INTERNAL / DEPLOYMENT VALIDATION BRANCH / NO PUBLIC RELEASE**  
Authority: **Odin Oddekalv — founder and final authority**

## Decision

PSI does **not** become a fifth public product, a separate backend or a second knowledge graph.

Its durable concepts become native BRAIN records and reusable intelligence services inside the existing One Planet Model:

`BRAIN → problem/pressure → living system/human system → solution → implementation → actor/place → claim/evidence → context pack → decision context → Mission Engine / ATLAS / product read models`

## What remains canonical

- one PostgreSQL/PostGIS persistence layer;
- immutable `source_records` from the existing truth spine;
- one actor universe;
- one place universe;
- one typed relationship graph;
- explicit review, evidence and interpretation axes;
- public read boundaries through RLS;
- migrations in Git.

## What Phase 05 adds

The migration `20260809003000_brain_intelligence_service.sql` adds the addressable object seam and evidence-aware objects needed by solution intelligence without creating `psi_*` truth tables:

- `brain_objects`, revisions, aliases and external identities;
- typed `brain_relationships`;
- sources registry;
- problems, solutions, actors, places, implementations;
- atomic claims + SUPPORTS / QUALIFIES / CHALLENGES evidence;
- outcome and cost observations;
- transferability assessments and gaps;
- auditable Context Pack runs.

## Deliberate non-merges

The existing frontend `src/planet/types.ts` remains an adaptation layer until consumers migrate to canonical read contracts. Phase 05 does not silently replace it.

The existing `source_records`, `taxon_observations`, `signals`, IMPACT truth tables and `product_contexts` remain intact.

## Product/API boundary

`src/brain/intelligence/contracts.ts` defines read contracts for:

- Problem Brief;
- Solution Landscape;
- Evidence Pack;
- Implementation Map;
- Actor Map;
- Transferability;
- Gap Analysis;
- Mission Context.

These contracts are projections over canonical BRAIN truth. They are not alternate storage models.

## Public safety

Core canonical tables use RLS. Internal gaps, transferability assessments, revisions, external identity mappings and Context Pack audit runs have no public read policy by default. Public projection is explicit.

## Deployment truth

This branch is permitted to prove migrations in ephemeral CI PostgreSQL/PostGIS. It is **not** authorised to push migrations to production or merge to the integration authority without founder release.
