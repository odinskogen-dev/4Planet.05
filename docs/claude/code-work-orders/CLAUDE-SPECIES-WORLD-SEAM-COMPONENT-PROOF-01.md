# CLAUDE BOUNDED PRODUCT BUILD — SPECIES WORLD SEAM COMPONENT PROOF 01

id: CLAUDE-SPECIES-WORLD-SEAM-COMPONENT-PROOF-SONNET-01
base_sha: 327a4ee39e337301adbb83995126e21391d0dc2d
test_profile: PRODUCT_UI
model: claude-sonnet-5
write_scope: src/components/species/SpeciesWorldSeam.tsx
write_scope: scripts/species-first-plank-source-contract.test.mjs

status: BOUNDED_FACTORY_CANDIDATE_ONLY
parent_product_authority: king/test @ 327a4ee39e337301adbb83995126e21391d0dc2d
source_review: CLAUDE-SPECIES-HUMAN-GOLD-PROOF-01
owner: AXE / 4PLANET Production Factory

## Why this build exists

The review proved a material SPECIES problem: after a strong life-first hero, median curated profiles move into internal control/taxonomy/evidence material without helping a non-expert understand the larger living system around the organism. Existing sourced relationship intelligence already exists in `src/data/livingSystems.ts`.

The review's original proposal also asked to mount this into `src/pages/integrated/Species.tsx`. AXE independently checked current open PR ownership and found that the active Jaguar Master PR #79 also writes `src/pages/integrated/Species.tsx`. Therefore that mount scope is NOT CLEAR and is explicitly rejected for this run.

This task proves the reusable product component and truth contract now without touching the active Species/Jaguar presentation seam. It is integration-ready evidence, not a hidden product release.

This retry uses `claude-sonnet-5` on the same existing Claude OAuth/subscription path only. It is a no-paid-API fallback attempt after the Opus session limit stopped the first code run before mutation. No API-key billing or additional spend is authorised by this work order.

## User outcome

Create a premium, compact, fail-closed Species World Seam that can later be mounted directly after the Species hero so a non-expert can understand:
- which existing Living System / world is relevant;
- one or two pieces of existing relationship/system context;
- how certain each shown relationship is and what its boundary is;
- whether that Living System is LIVE or IN_DEVELOPMENT;
- where the deeper Living Systems journey lives.

The component must remain calm and human-first. It is not another evidence dashboard or generic card grid.

## Explicit non-overlap / no-mount boundary

DO NOT edit or mount into:
- `src/pages/integrated/Species.tsx` — active Jaguar Master overlap;
- `src/data/livingSystems.ts`;
- `src/data/species.ts`;
- `src/data/speciesMedia.ts`;
- `src/content/imageRegistry.ts`;
- `src/pages/v5/LivingSystems.tsx`;
- `docs/control/GOLD_CURRENT_BRIEF.md` — active release-control ownership.

This candidate therefore makes NO user-facing mutation yet. It is a typed, build-proven component + contract only. It must not claim Human Gold, Founder-ready, merged, deployed or live status.

## Truth-safe mapping contract

Do not trust the existing `profile.journey` field blindly because the review found real mismatches. Use an explicit local hand-verified mapping inside the new component (or an exported resolver in the same allowed file) and fail closed for unmapped species.

Required mappings:
- `jaguar` → `amazonia`
- `hyacinth-macaw` → `amazonia`
- `atlantic-cod` → `oslofjorden`
- `blue-mussel` → `oslofjorden`
- `harbour-porpoise` → `oslofjorden`
- `western-honey-bee` → `pollination`

Required fail-closed / no automatic seam:
- `orca` — existing hand-built Orca experience must remain untouched; avoid duplicate world presentation here;
- `humpback-whale` — no truthful non-Orca anchor established;
- `sperm-whale` — no truthful non-Orca anchor established;
- `bottlenose-dolphin` — no truthful non-Orca anchor established;
- all unknown slugs.

The `oslofjord` vs `oslofjorden` mismatch must not leak through. Honey bee must never resolve to `amazonia`.

## Relationship presentation law

Use ONLY content already present on the resolved `LivingSystemAnchor` from `src/data/livingSystems.ts`.

For any relationship shown, preserve visibly:
- `state` — KNOWN / INTERPRETED / UNKNOWN;
- `boundary`;
- `source` when present;
- `sourceUrl` when present.

Do not rewrite a system-level relationship into a direct species-specific causal claim. If an Amazonia relationship describes the forest/rainfall/biodiversity system, present it explicitly as context about that living system, not as evidence that the Jaguar individually causes/depends on that exact relationship.

Preserve `status: LIVE | IN_DEVELOPMENT` visibly. Never visually imply an IN_DEVELOPMENT Living System is live/complete.

## Product / Brand requirements

Read the Product + Brand Core before implementation.

The component should feel:
- life/system first, not metadata first;
- premium, calm, editorial/scientific;
- one coherent seam, not multiple dashboard cards;
- progressively disclosed where useful;
- compatible with a future position immediately under a visually dominant Species hero;
- mobile-first and compact;
- accessible by semantics and keyboard if interactive.

Use existing 4PLANET typography/classes/primitives where possible. Do not introduce a new style system, dependency, global stylesheet or decorative colour vocabulary. If adequate styling cannot be achieved inside existing reusable classes without writing outside scope, keep the component structurally clean and minimal rather than smuggling global style changes into another file.

## MUST-NOT-LOSE

- `src/data/livingSystems.ts` remains the relationship source; no copy/fork of its relationship truth into a second data store.
- UNKNOWN stays UNKNOWN.
- No invented source, relationship, partner, impact, range, abundance or live-position claim.
- `state`, `boundary`, `source` and status survive humanisation.
- Fail closed when mapping/anchor is missing.
- No edit to active Jaguar/Orca/Species route composition.
- No package/dependency/workflow change.
- No TEST KING, LIVE or Canon mutation.

## Required contract additions

Extend the existing smoke-included `scripts/species-first-plank-source-contract.test.mjs` to verify the new component source at minimum:
1. the six required mappings exist;
2. `western-honey-bee` resolves only to `pollination`, not `amazonia`;
3. `atlantic-cod`, `blue-mussel`, `harbour-porpoise` use exact canonical `oslofjorden`;
4. Orca + humpback + sperm + bottlenose and unknown slugs fail closed / are not mapped;
5. component consumes `findAnchor` / canonical Living Systems rather than copying relationship records;
6. rendered relationship logic retains `state`, `boundary`, `source` / `sourceUrl` and anchor `status`;
7. component has a real null/no-render state for missing mapping/anchor.

Do not weaken or delete existing source-contract assertions to make the new test pass.

## Factory acceptance

The control plane will run:
- scope firewall;
- `npm run typecheck`;
- `npm run build`;
- `npm run test:smoke`.

AXE will then independently inspect the exact candidate diff.

### ACCEPT as component proof only if
- the component is genuinely reusable and integration-ready;
- mappings and fail-closed behaviour are exact;
- source/truth qualifiers are structurally retained;
- no active presentation scope was touched;
- full PRODUCT_UI validation passes;
- the diff is materially useful rather than speculative scaffolding.

### REJECT even if CI passes if
- the component invents or overstates species-specific ecology from anchor-level context;
- it drops boundary/state/status for visual simplicity;
- it maps an unsupported cetacean to Orca;
- it follows `profile.journey` blindly;
- it creates a second relationship model/data copy;
- it edits anything outside the two allowed write scopes;
- it is generic SaaS/card UI rather than a compact 4PLANET seam.

## Return

Report compactly:
- what was implemented;
- exact mapping/fail-closed behaviour;
- changed files;
- truth/product decisions;
- what remains deliberately UNMOUNTED due active overlap;
- any limitation that AXE must resolve before later integration.
