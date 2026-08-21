# 4PLANET Agent Operating Contract

This repository is an execution surface. It is **not** the sole source of programme truth. Current programme state, priorities, authority, Founder decisions and cross-project context live in the 4PLANET BRAIN / Knowledge OS and are synthesised by AXE / GPT Project Lead.

## Mandatory start-of-task bootstrap

Before material work:
1. Read this file.
2. Inspect the assigned task/issue/PR and exact branch.
3. Read recent git history for the affected area.
4. Search for existing components/contracts before creating new architecture.
5. Run a baseline check appropriate to the task before changing code.
6. If the task depends on current programme state, goals, Founder decisions, project priority, partner status, capital status or another product's current candidate, require a fresh AXE/BRAIN context handoff. Do **not** infer those facts from old chat text, branch names, stale docs or repository history alone.

If current BRAIN context is required but unavailable, state `CURRENT BRAIN READ REQUIRED` and continue only with bounded repository-local work that does not depend on the missing state. Never ask the Founder to repeat information merely because the agent failed to retrieve it.

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
- `npm ci`
- `npm run typecheck`
- `npm run assets:verify`
- `npm run lint`
- `npm run build`
- `npm run test:smoke`
- `npm run test:e2e` for runtime/UI journeys when applicable

Run the smallest sufficient set during iteration, then the full relevant gate before claiming verified completion. For UI work, verify the user-visible journey, not only unit/build output.

## Return contract

Every material agent return must include:
- project/task identity
- branch
- exact commit SHA
- PR or issue when applicable
- changed files / human-visible change
- tests and runtime evidence
- known limitations or unresolved conflicts
- status using the vocabulary above
- next gate / next safe action

The return must be usable by AXE / GPT Project Lead for BRAIN writeback without reconstructing the session from scratch.

## Authority

Do not change Locked Canon, Founder decisions, binding commitments, production release state, legal/accounting conclusions or external relationship status by inference. AXE / GPT Project Lead controls synthesis and evidence classification; Founder authority remains separate where required.

## Learning

When a material failure occurs, preserve the failed attempt and record: expected result, actual result, evidence, likely cause, correction, verification and any procedural rule that should change. Do not silently erase failure history.