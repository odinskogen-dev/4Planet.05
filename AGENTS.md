# 4PLANET Agent Operating Contract

This repository is an execution surface. It is **not** the sole source of programme truth. Current programme state, priorities, authority, Founder decisions and cross-project context live in the 4PLANET BRAIN / Knowledge OS and are synthesised by AXE / GPT Project Lead.

## Mandatory start-of-task bootstrap

Before material work:
1. Read this file.
2. Inspect the assigned task/issue/PR and exact branch.
3. Read `docs/control/CODE_LINEAGE_REGISTER.md` and resolve the affected project's current `ACTIVE DEVELOPMENT`, `FIXED REVIEW`, `DONOR`, `PRODUCTION` and recovery identities.
4. Read `docs/GOLD_WORLD_CLASS_QUALITY_GATE.md`, `docs/control/GOLD_ENFORCEMENT_MATRIX.md`, `docs/control/GOLD_PRIMITIVE_REGISTRY.md` and the current `docs/control/GOLD_CURRENT_BRIEF.md` before any user-facing product/design change.
5. Inspect recent git history for the affected area.
6. Search for existing components/contracts before creating new architecture.
7. Run a baseline check appropriate to the task before changing code.
8. If the task depends on current programme state, goals, Founder decisions, project priority, partner status, capital status or another product's current candidate, require a fresh AXE/BRAIN context handoff. Do **not** infer those facts from old chat text, branch names, stale docs or repository history alone.

If current BRAIN context is required but unavailable, state `CURRENT BRAIN READ REQUIRED` and continue only with bounded repository-local work that does not depend on the missing state. Never ask the Founder to repeat information merely because the agent failed to retrieve it.

## Mandatory GOLD / WORLD CLASS pre-code contract

For every material user-facing mutation, **before implementation**, update `docs/control/GOLD_CURRENT_BRIEF.md` in the same bounded change and answer:
- USER ARRIVES BECAUSE;
- ONE THING TO UNDERSTAND;
- PRIMARY ACTION;
- SECONDARY DEPTH;
- P1 DOMINANT / P2 ORIENTATION / P3 ACTION / P4 DEPTH;
- WHAT CAN BE REMOVED;
- WHAT MUST BE REUSED;
- TRUTH BOUNDARY;
- MOBILE-FIRST RISK;
- HUMAN SUCCESS;
- donor decision when donor value is involved.

The standing product law is **REDUCE BEFORE GENERATE**: `DELETE → PRIORITISE → CONSOLIDATE → HUMANISE → TEST → REFINE`. Do not solve a quality problem by adding cards, boxes, copy, motion, gradients, local styles or bespoke components unless the user/task need justifies them.

A user-facing implementation is not complete merely because it builds. Before any GOLD or Founder-ready claim, apply the hierarchy/AI-Wash/mobile/accessibility/performance/truth gates, produce rendered evidence, and record open defects. `CANDIDATE` visual evidence is not Founder-approved. `APPROVED` visual baselines are controlled by `docs/control/GOLD_VISUAL_BASELINES.json` and must not silently drift.

A pattern is not a reusable system primitive until its maturity is recorded in `docs/control/GOLD_PRIMITIVE_REGISTRY.md`. Prefer proven shared primitives. Do not promote a product-local pattern to shared status by repetition alone.

## Mandatory code-lineage control

Every material code project uses a simple whole-number product sequence: `01`, `02`, `03`, `04`… recorded in `docs/control/CODE_LINEAGE_REGISTER.md`. Git branch names remain technical implementation details; they are not the product-version authority.

Before creating or materially editing a branch:
- confirm one and only one current `ACTIVE DEVELOPMENT` line for the affected product seam;
- record or confirm project version, role, parent/base SHA, branch, PR/issue, current exact SHA, preview when known, WHY, allowed donors and MUST PRESERVE set;
- classify sibling branches as `FIXED REVIEW`, `DONOR`, `SUPERSEDED`, `RECOVERY` or `PRODUCTION` rather than treating recency as authority;
- if a new branch is genuinely required, link it explicitly as a child of the current line before first material code change.

Before Founder review, merge or production promotion:
- compare the candidate against recent sibling/fixed-review/donor lines;
- record every material donor delta as `ADOPT | ALREADY PRESENT | REJECT WITH REASON | DEFER WITH REASON`;
- do not assume the newest branch is a superset;
- do not wholesale-merge a divergent donor merely to recover features;
- preserve exact rollback identity.

A material coding task that cannot resolve lineage is blocked as `CODE LINEAGE UNRESOLVED`; resolve control first rather than creating another candidate.

## TEST KING / LIVE KING authority

- `king/test` is the only moving 4PLANET integration/convergence line.
- LIVE KING is the exact production state and is changed only by a separately authorised promotion.
- Product/subbrand names are branches of the 4PLANET product tree, not permanent competing Git continuation branches.
- Historical product branches remain donor/recovery evidence.
- Unknown historical branches are candidates until explicitly dispositioned under issue #132.
- Do not create a new de facto product continuation outside `king/test` without explicit isolation purpose and lineage registration.
- A pull request or direct production change from a user-facing branch other than `king/test` is not an authorised LIVE promotion path.
- LIVE promotion requires a populated `docs/control/LIVE_PROMOTION_MANIFEST.json`, exact prior LIVE rollback identity, evidence and explicit Founder release authority. The fail-closed placeholder is not authority.

## Capability verification

Never claim that a connector, repository, branch, deployment path, tool or permission is unavailable until the relevant capability has actually been checked in the current run, unless a higher-level safety or authority rule prohibits the check.

## Truth and status vocabulary

Keep these states separate:
- SPECIFIED / PLANNED
- IMPLEMENTED
- TESTED / VERIFIED
- FOUNDER ACCEPTED
- MERGED
- DEPLOYED
- PRODUCTION

A commit, PR, CI pass or preview is not production. An agent report is not independent verification. Do not promote status by wording.

## Parallel work

- Work on one bounded objective at a time.
- Avoid duplicate work already owned by another active branch or task.
- Prefer independently seamed changes that can merge without destabilising other work.
- Do not redesign shared architecture to solve a local task unless the assigned task explicitly requires it.
- Preserve rollback and exact artifact identity.

## Verification

For this repository the normal commands are:
- `node scripts/gold-policy-check.mjs --mode=quality-contract`
- `npm ci`
- `npm run typecheck`
- `npm run assets:verify`
- `npm run lint`
- `npm run build`
- `npm run test:smoke`
- `npm run test:e2e` for runtime/UI journeys when applicable
- `node scripts/gold-visual-lock-check.mjs` after rendered product-proof evidence exists.

Run the smallest sufficient set during iteration, then the full relevant gate before claiming verified completion. For UI work, verify the user-visible journey, not only unit/build output.

## Return contract

Every material agent return must include:
- project/task identity
- product version from the Code Lineage Register
- branch
- exact commit SHA
- PR or issue when applicable
- changed files / human-visible change
- tests and runtime evidence
- user job and P1–P4 hierarchy for user-facing work
- removed / merged / reused inventory for user-facing work
- Human Craft / AI-Wash findings and structural corrections
- donor decisions made in this iteration
- known limitations or unresolved conflicts
- status using the vocabulary above
- human-test status/trigger when relevant
- next gate / next safe action

The return must be usable by AXE / GPT Project Lead for BRAIN writeback without reconstructing the session from scratch.

## Authority

Do not change Locked Canon, Founder decisions, binding commitments, production release state, legal/accounting conclusions or external relationship status by inference. AXE / GPT Project Lead controls synthesis and evidence classification; Founder authority remains separate where required.

## Learning

When a material failure or strong reusable pattern occurs, preserve the evidence and record: **OBSERVATION → ROOT CAUSE → GENERALISABLE RULE → AFFECTED PRODUCTS / COMPONENTS → CORRECTION → RE-TEST → BRAIN WRITEBACK**. Do not silently erase failure history. Recurrence of an already learned material defect is a programme-control failure.
