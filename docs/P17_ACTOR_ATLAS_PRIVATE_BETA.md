# P17 Actor Atlas — Controlled Private Beta

Status: IMPLEMENTATION CANDIDATE / NO MERGE / NO PUBLIC RELEASE
Date: 2026-08-05
Branch: `build/p17-actor-atlas-private-beta`
Base SHA: `de9e01a37482b7678104690056cc6146e9b286a3`

## What this build adds

- `/actors` source-aware organisation index.
- One shared `/actors/:slug` profile template.
- Three data-driven profiles:
  - World Land Trust.
  - Global Biodiversity Information Facility.
  - Rainforest Foundation Norway.
- `/atlas?mode=actors` context overlay on the existing ATLAS runtime.
- Local-only claim and correction review queue.
- Organisation structured data, canonical metadata and `noindex,nofollow` private-beta control.
- A Supabase/Postgres model extending the existing source and truth spine without public read policies.
- Contract and browser tests.

## Architecture boundary

P17 does not create a separate application, map engine, design system or public product category. The Actor Mode overlay keeps the existing `/atlas` route and existing MapLibre runtime. Selecting a geography reloads the same Atlas route with documented camera coordinates.

The private beta deliberately does not add custom actor markers inside the imperative `World.tsx` MapLibre layer. The first implementation proves identity, geography roles, camera context and profile continuity without destabilising the controlled Atlas runtime. Native source-aware actor point/polygon layers remain a scale gate.

## Truth and identity controls

- Every material private-beta claim has one or more source IDs.
- Source statements, product context and 4PLANET assessments are separate states.
- Headquarters, operating geography and programme geography are separate roles.
- World Land Trust donations are not represented as transferable land units.
- GBIF occurrence records are not represented as range, abundance or live tracking.
- Rainforest Foundation Norway partner-led and Indigenous-led work is not portrayed as work owned solely by the Norwegian organisation.
- Indexing never implies verification, recommendation or partnership.

## Rights controls

- No organisation logos, photography or third-party media are used.
- The product is text/map-first.
- Outbound actions route to official organisation websites.
- Source rights are recorded as ACCEPTABLE or CONDITIONAL.
- No 4PLANET payment, donation handling or Impact Unit is activated.

## Claim and correction control

The functional private-beta form stores submissions only in browser local storage under `4planet:p17:actor-review-queue`. A submission:

- does not alter profile content;
- does not grant edit access;
- does not establish `Information verified`;
- does not create partner status;
- records an audit timestamp and private-beta environment.

The database migration defines a future internal review queue but creates no anonymous public read policy.

## File ownership

P17-owned new files:

- `src/data/actors.ts`
- `src/pages/integrated/Actors.tsx`
- `src/earth/ActorAtlasOverlay.tsx`
- `src/styles/actors.css`
- `src/utils/metadata.ts`
- `scripts/p17-contracts.test.mjs`
- `tests/e2e/actors-private-beta.spec.ts`
- `supabase/migrations/20260805184500_p17_actor_private_beta.sql`
- `docs/P17_ACTOR_ATLAS_PRIVATE_BETA.md`

Shared files changed narrowly:

- `src/App.tsx`
- `src/routes/router.tsx`
- `package.json`

Protected files not changed:

- `src/earth/World.tsx`
- existing SPECIES implementation and truth spine
- IMPACT implementation
- existing public shell and design tokens
- existing production/payment pathways

## Local evidence completed before commit

- Six P17 Node contract tests: PASS.
- TypeScript syntax transpilation for seven TS/TSX files: PASS.
- SQL reviewed as schema-only private beta with anonymous access revoked.

Full clean install, typecheck, build, lint, smoke and Playwright execution are delegated to the draft PR CI because the local execution container cannot resolve GitHub or npm network hosts and does not contain the repository dependency tree.

## Scale gate

Recommendation before CI: `FIX BEFORE SCALE` until all repository and browser gates pass.

A successful CI and browser review may change the recommendation to `SCALE TO TEN` only when:

1. Typecheck, build, lint and existing smoke tests pass.
2. Existing ATLAS, SPECIES and IMPACT tests show no regression.
3. Mobile and desktop screenshots are reviewed.
4. A fourth profile is added by data only.
5. Native Atlas actor geometry is either implemented safely or explicitly accepted as a later phase.
6. Odin approves the private preview and the remaining seven profile conversions.
