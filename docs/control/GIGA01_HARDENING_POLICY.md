# GIGA01 HARDENING POLICY

A rule is not immunity.

For every material recurring failure, closure requires:

INCIDENT → ROOT CAUSE → FAILURE CLASS → WHY CONTROL FAILED → CONTAINMENT → LOWER-STACK HARDENING → AUTOMATED REGRESSION → PROPAGATION → WRITEBACK → READBACK → IMMUNITY PROOF.

Valid closure states:
- PHYSICALLY_PREVENTED
- FAIL_CLOSED_BEFORE_CANONICAL_HARM

Invalid closure states:
- DOCUMENTED_ONLY
- AGENT_SAYS_FIXED
- TESTED_ONCE_WITHOUT_REGRESSION
- MANUAL_REMINDER
- NEWEST_VERSION_LOOKS_BETTER

P0/P1 repeat without changed lower-stack control automatically demotes the relevant Autonomy Budget capability.
