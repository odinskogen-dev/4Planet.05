# SUPERBRAIN RECONCILIATION NOTE — 2026-08-25

Before remote cutover work proceeds, the CNS shadow branch must include the current TEST KING line and then be re-certified on the resulting exact head.

Observed divergence before sync:
- CNS branch had 27 commits not in TEST KING.
- TEST KING had 217 commits not in the CNS branch.

This is expected branch evolution, but it invalidates treating the previously certified CNS SHA as sufficient current-state proof. Reconciliation is therefore a mandatory P0 gate, not optional housekeeping.
