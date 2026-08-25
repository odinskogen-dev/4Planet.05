# SUPERBRAIN CUTOVER CONTROL — 2026-08-25

Status: P0. Existing CNS Kernel 02 remains SHADOW until all gates below are physically proven.

## Authority
Legacy BRAIN / Founder Control / Prototype SAFE / live GitHub remain authoritative until explicit Founder cutover.
No parallel BRAIN. No destructive retirement of legacy truth before zero-loss proof.

## Required gates
- [ ] CNS branch reconciled against current TEST KING and re-certified at exact head.
- [ ] Remote Supabase SQL readback works on staging/target.
- [ ] CNS migrations applied/read back remotely.
- [ ] Active portfolio hydrated through raw staging.
- [ ] Legacy↔CNS parity = zero unexplained loss/mismatch.
- [ ] Live GitHub observer proves current code/prototype state.
- [ ] True fresh-session recovery reconstructs current state deterministically.
- [ ] Dual-read comparison passes.
- [ ] Backup/restore + event replay rebuilds current projections.
- [ ] Security/RLS/advisors/rights/privacy readback passes.
- [ ] Claim/evidence/method/conflict/decision-learning truth tests pass.
- [ ] Doctor/Librarian/Evaluator/Traffic adversarial tests pass.
- [ ] Explicit Founder cutover.

## Current external blocker
Supabase project `4planet-staging` reports `ACTIVE_HEALTHY` at the control plane while SQL/migration requests currently terminate by connection timeout. Security-advisor call reports the project as hibernated/waking. A restore request confirms it is no longer paused and may still be restoring. This contradiction must be resolved by successful SQL readback; status labels alone are not accepted as evidence.

## Truth rule
A green local/CI suite is necessary but insufficient for production authority. UNKNOWN/BLOCKED remains the correct state until remote proof exists.
