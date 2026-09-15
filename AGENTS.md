# 4PLANET Agent Operating Contract

This repository is an execution surface. It is **not** the sole source of programme truth. Current programme state, priorities, authority, Founder decisions and cross-project context live in the 4PLANET BRAIN / Knowledge OS and are synthesised by AXE / GPT Project Lead.

## ELITE OPERATING DOCTRINE / SYSTEM 2.0 — mandatory for all material work

Read `docs/control/ELITE_OPERATING_DOCTRINE.md` and `docs/control/ELITE_OPERATING_DOCTRINE.json` before material work. Their canonical authority is the Founder Decision in Knowledge OS `SYSTEM — MANDATORY OPERATING RULES & WRITEBACK PROTOCOL v1.0`; the repository files are memoryless-agent projections, not a parallel BRAIN or management system.

Apply the relevant material-work loop:

`HUMAN VALUE / FOUNDER INTENT → PROGRAMME ADMISSION when applicable → QUESTION REQUIREMENTS → DELETE → SIMPLIFY / OPTIMISE → SIMPLEST CAPABLE EXECUTION → DESIRED STATE + PROOF + ROLLBACK → EXECUTE → JIDOKA / ANDON → INDEPENDENT VERIFICATION / VALIDATION where material → evaluator improvement only with trustworthy fitness → RELIABILITY / VALUE MEASUREMENT → ERROR-TO-IMMUNITY → WRITEBACK + READBACK → DESIRED / OBSERVED RECONCILIATION`.

Hard rules:
- **SIMPLEST CAPABLE EXECUTION:** deterministic/existing primitive → simple workflow → LLM workflow → single agent → multi-agent. Escalate only when the simpler mechanism cannot responsibly solve the task.
- **PROGRAMME ADMISSION:** a new major programme, permanent system or high-recursive-cost architecture expansion must pass the Heilmeier-class admission questions in the doctrine before WBS/automation is created.
- **HUMAN GOLD BACKWARDS:** substantial user-facing work starts from the human outcome and extends the existing GOLD Current Brief; never create a competing product-spec system.
- **TWO-WAY DOOR / ONE-WAY DOOR:** reversible bounded decisions may be delegated inside authority; irreversible/external decisions retain existing Founder/professional gates.
- **JIDOKA / ANDON:** unresolved authority, stale/current-state conflict, source-isolation breach, protected-Gold/lineage loss, protected-invariant regression, unsupported claim promotion, security/secret risk, destructive uncertainty, scope breach, critical evaluator failure, writeback/readback mismatch or missing rollback identity stops mutation/promotion. Preserve evidence, correct, regression-test, then resume.
- **AUTONOMY IS EARNED:** expand automation/agent authority only from measured reliability; activity volume or confidence does not increase authority.
- **MAKER ≠ SOLE JUDGE:** material truth/source/security/release/impact/acceptance gates require independent verification/validation proportional to risk.
- **EVALUATOR DISCIPLINE:** optimisation/evolution requires a trustworthy fitness function and may never autonomously promote Canon or truth.
- **DESIRED STATE RECONCILIATION:** compare current Founder/Canon/WBS/HEIR desired state with fresh Git/runtime/source/agent evidence. Material drift becomes explicit correction or an explicit accepted exception, never silent divergence.
- **NO PARALLEL METHOD LAYER:** this doctrine extends SpaceX/GBrain, GOLD, ZERO LOSS, ONE BRAIN / ONE FACTORY / ONE TEST KING and Error-to-Immunity. Do not create another BRAIN, Factory, task system or methodology stack.

Run `node scripts/elite-operating-doctrine-gate.mjs` as part of repository-level control verification. Do not bypass, disable or weaken it to make work pass.

## AXE / AXE PL current-context fail-safe

Every material 4PLANET request addressed to **AXE / AXE PL** — and every semantically equivalent material 4PLANET request even when those words are omitted — requires a **fresh connected BRAIN bootstrap before substantive current-state reasoning, prioritisation, architecture changes or execution**. Local chat context and model memory are orientation only, never programme authority.

Minimum current-state path: `00_ READ FIRST → 01_ PROJECT LEAD CURRENT — NOW, PRIORITIES, GATES & NEXT ACTIONS → 02_ ACTIVE TASKS — SMALL EXECUTION SURFACE → relevant bounded Context Pack / Founder Decision / WBS / Prototype SAFE only as needed → fresh GitHub/runtime/connector/external evidence whenever live state matters`.

`01_ PROJECT LEAD CURRENT`, `02_ ACTIVE TASKS` and Atomic Register / Current State must expose the same `CURRENT_STATE_REV` for a committed programme projection. If they disagree, are missing, or fresher same-lane evidence proves a later material transition, classify `STALE_CURRENT / WRITEBACK_INCOMPLETE` and fail closed for the affected current-state action until propagation + readback is repaired. Legacy `GPT_PROJECT_LEAD_CURRENT` and `KNOWLEDGE_OS_STATE` are historical/deep-control sources, not the default current-state front door unless specifically required.

If the required BRAIN/current-state read cannot be completed, fail closed on the affected claim with `CURRENT BRAIN READ REQUIRED` rather than guessing. Continue only bounded work that does not depend on missing state. After a material Founder decision, accepted/rejected artifact, code-line change or durable learning, write back to existing canonical authorities and read back in the same work cycle. Do not create another memory or management system.

## FOUR-STATE PRODUCT AUTHORITY — mandatory before user-facing mutation

Every material public-product task must resolve the current four human-visible product states before changing code:

1. `LIVE` — current public production artifact/domain.
2. `HEIR` — the one and only leading successor; integrated through `king/test`.
3. `SANDBOX` — at most one registered active user-facing sandbox for the affected product.
4. `ARCHIVED` — immutable historical deliveries/donors; never an active continuation line.

Read these current repository projections before any material user-facing mutation:
- `docs/control/FOUR_STATE_PRODUCT_CONTROL.md`;
- `docs/control/PRODUCT_SURFACE_REGISTRY.json`;
- `docs/control/PROJECT_CANDIDATE_AUTHORITY.json`;
- `docs/control/CODE_LINEAGE_REGISTER.md`.

Resolve all of the following before writing product code:
- affected product/seam;
- current LIVE URL and exact artifact/SHA when relevant;
- current HEIR branch, exact SHA and Founder-review URL;
- registered SANDBOX branch/SHA/review URL or explicit `NONE`;
- allowed donors and archive constraints;
- exact parent SHA;
- write scope and WBS/task authority;
- human-review gate;
- return path to HEIR;
- rollback identity.

If this cannot be resolved, stop material user-facing mutation with:

`PRODUCT AUTHORITY CONTEXT UNRESOLVED`

The agent may inspect, audit or research, but it may not create another candidate, user-facing branch, stable preview authority, production mutation or competing product line.

Hard laws:
- **ONE HEIR PER PRODUCT.**
- **MAX ONE ACTIVE USER-FACING SANDBOX PER PRODUCT.**
- A branch, PR, deployment alias, recency, `GOLD`, `RECOVERY`, `CANDIDATE`, `RELEASE`, `AGENT`, `WORK` or `SANDBOX` name confers **zero authority** by itself.
- Unknown historical/user-facing lineage is `HISTORY_DONOR_ARCHIVE_QUARANTINE` and fails closed for mutation.
- A new user-facing branch must be registered as the one allowed product SANDBOX **before the first material user-facing edit**.
- User-facing PRs return only to `king/test` unless an explicit Founder/AXE control exception exists.
- Technical PASS is not Human Gold. Every material user-facing delivery requires a working Founder-visible URL before it may be presented as a candidate for adoption.
- SANDBOX → HEIR requires exact-SHA gates plus human visual/use judgement.
- HEIR → LIVE requires exact tested artifact identity plus explicit Founder release.
- Prior LIVE/HEIR/SANDBOX value is archived before promotion or destructive cleanup.
- Archived deliveries are read-only evidence/donors and may never silently regain authority.

`node scripts/product-authority-gate.mjs` is a mandatory fail-closed authority check for user-facing work. Do not bypass, disable or weaken it to make a branch pass.

## Mandatory start-of-task bootstrap

Before material work:
1. Read this file.
2. Read `docs/control/ELITE_OPERATING_DOCTRINE.md` and resolve the applicable elite-contract fields before mutation.
3. Inspect the assigned task/issue/PR and exact branch.
4. For public-product work, complete the FOUR-STATE PRODUCT AUTHORITY bootstrap above.
5. Read `docs/control/CODE_LINEAGE_REGISTER.md` and resolve the affected project's current `ACTIVE DEVELOPMENT`, `FIXED REVIEW`, `DONOR`, `PRODUCTION` and recovery identities.
6. Read `docs/GOLD_WORLD_CLASS_QUALITY_GATE.md`, `docs/control/GOLD_ENFORCEMENT_MATRIX.md`, `docs/control/GOLD_PRIMITIVE_REGISTRY.md` and the current `docs/control/GOLD_CURRENT_BRIEF.md` before any user-facing product/design change.
7. Inspect recent git history for the affected area.
8. Search for existing components/contracts before creating new architecture.
9. Run a baseline check appropriate to the task before changing code.
10. If the task depends on current programme state, goals, Founder decisions, project priority, partner status, capital status or another product's current candidate, require a fresh AXE/BRAIN context handoff. Do **not** infer those facts from old chat text, branch names, stale docs or repository history alone.

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

## HEIR / SANDBOX / LIVE authority

- `king/test` is the only moving integrated 4PLANET HEIR line.
- Current Founder-review surfaces are governed by `docs/control/PRODUCT_SURFACE_REGISTRY.json`; the canonical review world is `test.4planet.org` and the visual archive is `archive.4planet.org`.
- LIVE is exact production state and is changed only by a separately authorised exact-artifact promotion.
- Product/subbrand names are branches of the 4PLANET product tree, not permanent competing Git continuation branches.
- Historical product branches remain donor/archive/recovery evidence with no mutation authority unless explicitly registered into the one SANDBOX slot.
- Do not create a new de facto product continuation outside `king/test` or the single registered SANDBOX.
- A pull request or direct production change from an unregistered user-facing branch is not an authorised product path.
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
- Multiple technical workers may support one registered SANDBOX, but they do not create additional product candidates or Founder-visible authority states.

## Verification

For this repository the normal commands are:
- `node scripts/elite-operating-doctrine-gate.mjs` for operating-doctrine drift;
- `node scripts/product-authority-gate.mjs` for user-facing authority;
- `node scripts/gold-policy-check.mjs --mode=quality-contract`;
- `npm ci`;
- `npm run typecheck`;
- `npm run assets:verify`;
- `npm run lint`;
- `npm run build`;
- `npm run test:smoke`;
- `npm run test:e2e` for runtime/UI journeys when applicable;
- `node scripts/gold-visual-lock-check.mjs` after rendered product-proof evidence exists.

Run the smallest sufficient set during iteration, then the full relevant gate before claiming verified completion. For UI work, verify the user-visible journey, not only unit/build output.

## Return contract

Every material agent return must include:
- project/task identity;
- HUMAN VALUE / FOUNDER INTENT;
- PROGRAMME ADMISSION status when applicable;
- QUESTION / DELETE / SIMPLIFY / REUSE decision;
- SIMPLEST CAPABLE EXECUTION class and escalation reason when relevant;
- DOOR CLASS + authority for material decisions;
- DESIRED STATE and protected invariants/Gold;
- proof / acceptance evidence;
- rollback / reversibility;
- ANDON / STOP conditions and whether any fired;
- independent verifier/validator status where material;
- fitness/evaluator basis when optimisation/evolution was used;
- reliability/value evidence where relevant;
- WRITEBACK + READBACK targets/status;
- DESIRED ↔ OBSERVED reconciliation and material drift;
- learning/immunity delta;
- affected product;
- resolved four-state identity: LIVE / HEIR / SANDBOX / ARCHIVED relationship;
- product version from the Code Lineage Register;
- branch;
- exact commit SHA;
- Founder-visible HEIR/SANDBOX URL when user-facing;
- PR or issue when applicable;
- changed files / human-visible change;
- tests and runtime evidence;
- user job and P1–P4 hierarchy for user-facing work;
- removed / merged / reused inventory for user-facing work;
- Human Craft / AI-Wash findings and structural corrections;
- donor decisions made in this iteration;
- known limitations or unresolved conflicts;
- status using the vocabulary above;
- human-test status/trigger when relevant;
- next gate / next safe action.

The return must be usable by AXE / GPT Project Lead for BRAIN writeback without reconstructing the session from scratch. `NOT APPLICABLE` is allowed for an elite-contract field only with a reason; silently omitted applicable fields make the return incomplete.

## Authority

Do not change Locked Canon, Founder decisions, binding commitments, production release state, legal/accounting conclusions or external relationship status by inference. AXE / GPT Project Lead controls synthesis and evidence classification; Founder authority remains separate where required.

## Learning

When a material failure or strong reusable pattern occurs, preserve the evidence and record: **OBSERVATION → ROOT CAUSE → GENERALISABLE RULE → AFFECTED PRODUCTS / COMPONENTS → CORRECTION → RE-TEST → BRAIN WRITEBACK**. Do not silently erase failure history. Recurrence of an already learned material defect is a programme-control failure. A learning record is not IMMUNE until the changed control/test/contract has been propagated, exercised and read back.
