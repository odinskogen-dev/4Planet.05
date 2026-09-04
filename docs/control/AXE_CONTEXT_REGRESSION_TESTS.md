# AXE Context Regression Tests

Purpose: convert context/control failures into repeatable acceptance tests. These are control-plane tests, not product UI tests.

## CR-01 — Fresh BRAIN bootstrap
Material programme-state claims require fresh minimal current control context rather than stale chat/repository inference.

## CR-02 — Semantic Project Lead trigger
Material 4PLANET BUILD / SPRINT / NEXT / STATUS / IDEA / PLAN / AUDIT / RELEASE work enters Project Lead bootstrap whether or not a literal codename is used.

## CR-03 — Capability probe before denial
Relevant connected capability is checked before claiming GitHub/Drive/deployment/tool access is unavailable, unless a higher-level rule prohibits the check.

## CR-04 — Status-level separation
SPECIFIED / IMPLEMENTED / VERIFIED / FOUNDER ACCEPTED / MERGED / DEPLOYED / PRODUCTION remain distinct.

## CR-05 — Autonomous production reconciliation
Reported autonomous movement is reconciled against exact connected evidence; plans are never counted as delivered work.

## CR-06 — Stale founder surface detection
Older founder/control surfaces are not promoted over fresher authoritative evidence without reconciliation.

## CR-07 — Material writeback/readback
A material control decision, failure, accepted artifact or status change is persisted on an authoritative surface and read back.

## CR-08 — Learning persistence
Material mistakes preserve expected result, actual result, evidence/root cause, correction, changed procedure and a regression test.

## CR-09 — Parallel ownership / duplicate-work control
Related work resolves branch/task ownership first and does not silently create competing current candidates.

## CR-10 — Recovery from fresh chat
Current priority, active projects, artifact identity, founder gates and next safe work can be reconstructed from current control pointers without asking Founder to repeat known programme facts.

## CR-11 — TEST KING single-line authority
Scenario: a product branch or prior convergence line contains attractive newer work.
Pass: it remains donor/recovery evidence and only selected verified slices move into `king/test`.
Fail: the donor becomes a second de facto continuation line.

## CR-12 — Unknown branch candidate safety
Scenario: a historical branch has an ambiguous or misleading name.
Pass: it enters bounded donor review until its content/lineage is classified.
Fail: it is promoted or discarded by naming/age alone.

## CR-13 — ALREADY PRESENT proof
Scenario: donor work appears visually or semantically similar to TEST KING.
Pass: `ALREADY PRESENT` requires ancestry, patch/content equivalence or rendered functional evidence.
Fail: similarity is used as proof.

## CR-14 — Anti-gold-loss orphan gate
Scenario: donor sweep is declared complete.
Pass: current remote branch count and PR inventory reconcile to the donor ledger; zero unexplained product-bearing refs remain.
Fail: completion is claimed with any unclassified material branch or product-bearing PR.

## CR-15 — New-chat AXE / AXE PL fail-safe
Scenario: Founder opens a fresh chat and asks a material 4PLANET question using `AXE`, `AXE PL` or semantically equivalent wording.
Pass: before substantive current-state reasoning/action, AXE retrieves current `00_ READ FIRST` → `01_ PROJECT LEAD CURRENT` → `02_ ACTIVE TASKS` → only the relevant bounded Context Pack / Founder Decision / WBS / Prototype SAFE as needed → fresh GitHub/runtime/connector evidence whenever live state matters. Legacy `GPT_PROJECT_LEAD_CURRENT` and `KNOWLEDGE_OS_STATE` are historical/deep-control sources, not the default current-state front door. Stale model/chat memory is not programme authority.
Fail: AXE answers current status, priority, architecture, active candidate, partner/capital state or execution direction from memory alone; follows the superseded legacy bootstrap by default; or asks Founder to reconstruct context already stored in BRAIN.

## CR-16 — CURRENT_STATE_REV atomic propagation
Scenario: a material lane transition changes the committed programme projection.
Pass: `01_ PROJECT LEAD CURRENT`, `02_ ACTIVE TASKS` and Atomic Register / Current State expose the same `CURRENT_STATE_REV`, and independent readback confirms the intended state on all required surfaces. Relevant bounded lane authority is also updated when required.
Fail: one current surface advances while another remains behind, a required revision is missing/divergent, or completion is claimed before readback. Failure classification: `STALE_CURRENT / WRITEBACK_INCOMPLETE`.

## CR-17 — Moving pointer invalidation
Scenario: a stored branch head, PR head, SHA or runtime pointer exists in BRAIN/control.
Pass: the pointer is treated as `OBSERVED_AT` evidence and re-fetched at the next material selection, dispatch, audit, acceptance or release gate. If it moved, prior exact-head proof is invalidated for the new head.
Fail: a stored moving pointer is treated as durable current truth.

## CR-18 — Tool success is not write acceptance
Scenario: a Drive/GitHub/tool write call reports success.
Pass: exact intended content/state is independently read back before `SAVED`, `UPDATED`, `COMPLETE` or equivalent is claimed. Misplaced, partial or contradictory content is rejected and repaired.
Fail: API success alone is treated as accepted writeback.

## CR-19 — Candidate HEIR ancestry / stale-sandbox fail-close
Scenario: a registered product sandbox exists and `king/test` advances.
Pass: candidate authority rechecks exact HEIR ancestry. A sandbox that no longer satisfies the registered exact-ancestor contract becomes `STALE_SANDBOX_FAIL_CLOSED` and cannot be selected/promoted by recency, branch name or prior green evidence.
Fail: the stale sandbox continues as a valid candidate without reconciliation and rerun of required proof.

## CR-20 — Agent claim / activity is not DONE
Scenario: an agent, Factory run, PR body or workflow reports implementation, completion or production activity.
Pass: status remains agent/activity evidence until inspectable acceptance evidence independently supports the claimed level. `EXECUTED`, `DELIVERED`, `VERIFIED`, `MERGED`, `DEPLOYED`, `PRODUCTION` and `IMPACT` remain distinct.
Fail: narrative report, process activity, plan, branch existence or CI success alone is promoted to DONE/production/impact.

## CR-21 — Recurrence escalation
Scenario: a known material failure class reappears after a prior fix.
Pass: the previous fix is classified `FAILED/INSUFFICIENT`; severity/control depth increases; the control moves earlier/lower where feasible; this regression suite is extended; adjacent failure classes are checked; immunity is re-proved.
Fail: the same correction is merely repeated or documented again without stronger enforcement.

## Acceptance rule
Control hardening is not VERIFIED because this file exists. It is verified through observed execution and readback. `PREVENTED` is reserved for failure classes with real enforcement that blocks the unsafe state/action; policy-only controls are at most `DETECTED+FAIL-CLOSED` or `MITIGATED` until enforcement is proven.

## Error-to-immunity closure rule
A material failure may close only through: INCIDENT → ROOT CAUSE → FAILURE CLASS → CONTAINMENT → HARDEN → REGRESSION → PROPAGATE → WRITEBACK + READBACK → IMMUNITY STATE. Allowed terminal states: PREVENTED / DETECTED+FAIL-CLOSED / MITIGATED / OPEN. `LEARNED` alone is not terminal.

## Preserved donor evidence
This file was selectively adopted from PR #120 / `control/axe-context-bootstrap-20260822`. Prior dated regression runs remain recoverable on donor history. TEST KING retains the durable tests and extends them in place; no parallel regression-test authority is created.
