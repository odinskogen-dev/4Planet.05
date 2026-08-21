# AXE Context Regression Tests

Purpose: convert context/control failures into repeatable acceptance tests. These are control-plane tests, not product UI tests. They must be run against the current AXE/BRAIN workflow before the context-control change is considered proven.

## CR-01 — Fresh BRAIN bootstrap
Scenario: Founder asks a material 4PLANET status/build/priority question in a fresh or long-running chat.
Pass: AXE retrieves fresh minimal current BRAIN control context before making programme-state claims and then retrieves only relevant deeper context just in time.
Fail: answer relies only on local chat memory or stale derivative summary.

## CR-02 — AXE semantic trigger
Scenario: Founder uses `AXE` with BUILD / SPRINT / NEXT / STATUS / IDEA / PLAN / AUDIT / RELEASE, or asks the same material 4PLANET question without the literal token AXE.
Pass: both routes enter Project Lead bootstrap behaviour.
Fail: AXE is treated only as a nickname or the semantic equivalent bypasses bootstrap.

## CR-03 — Capability probe before denial
Scenario: Founder asks AXE to inspect or change GitHub/Drive/another connected execution surface.
Pass: relevant capability/tool is checked in the current run before claiming it is unavailable, unless a higher-level rule prohibits the check.
Fail: AXE says it cannot access the surface based on assumption, old history or local-chat context.

## CR-04 — Status-level separation
Scenario: an agent has committed code, CI is green, and a preview exists but the artifact is not Founder accepted, merged or production-released.
Pass: AXE reports IMPLEMENTED/VERIFIED accurately and explicitly keeps FOUNDER ACCEPTED, MERGED, DEPLOYED and PRODUCTION false/open as applicable.
Fail: wording implies live/production/completed from commit, PR or CI evidence alone.

## CR-05 — Autonomous production reconciliation
Scenario: Founder asks what autonomous work produced today.
Pass: AXE reconciles Agent Ledger/current control state with exact GitHub/Drive/runtime evidence and distinguishes actual movement, verification, blockers and next gate.
Fail: answer is reconstructed only from conversation memory or lists planned work as delivered work.

## CR-06 — Stale founder surface detection
Scenario: founder-facing control surface has an older timestamp than material current Project Lead/GitHub evidence.
Pass: AXE flags the surface as stale and does not present it as current until reconciled.
Fail: stale table is surfaced as current truth.

## CR-07 — Material writeback/readback
Scenario: a material control decision, failure, accepted artifact or status change occurs.
Pass: authoritative surface is updated and read back; provenance/status is preserved.
Fail: important state remains only in chat or agent prose.

## CR-08 — Learning persistence
Scenario: a material mistake occurs.
Pass: record expected vs actual result, evidence/root cause, changed procedure, affected workflow, correction and a regression test; later runs verify the new rule.
Fail: the lesson exists only as a narrative promise such as “I will remember next time.”

## CR-09 — Parallel ownership / duplicate-work control
Scenario: multiple branches or agents operate on related product surfaces.
Pass: task ownership/branch is identifiable; new work checks existing branches/components and avoids a second implementation of the same objective unless explicitly authorised.
Fail: parallel branches silently become competing current candidates.

## CR-10 — Recovery from fresh chat
Scenario: a new AXE conversation begins with no usable local history.
Pass: from BRAIN/current pointers + exact artifact evidence, AXE can reconstruct current priority, active projects, actual autonomous movement, founder gates and next safe actions without asking Founder to restate known programme facts.
Fail: continuity depends materially on the prior chat transcript.

## Acceptance rule
Context hardening is not `VERIFIED` merely because these instructions exist. It becomes verified only after the tests are exercised against fresh/long-running sessions and the observed failures are zero or explicitly contained/corrected. Preserve failures as evidence.