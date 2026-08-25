# SUPERBRAIN REMOTE BLOCKER EVIDENCE — 2026-08-25

Observed via connected Supabase control plane:

- `4planet-staging` project ref `dcxiougjoazkafyeeaxi` reports `ACTIVE_HEALTHY`.
- Direct SQL readback `select current_database(), current_user, now(), version()` failed repeatedly with `Connection terminated due to connection timeout`.
- `list_migrations` failed with the same connection timeout.
- Security advisor call reported staging as `hibernated and will wake on next supported request`.
- Restore request returned: staging is no longer paused, is `ACTIVE_HEALTHY`, and may still be restoring.
- Postgres/API logs returned no useful rows while this state persisted.
- Control experiment: the independent `4Planet_ OS` project (`ghvdzetmplqkdtfqiror`), also reported `ACTIVE_HEALTHY`, failed the same harmless `select current_database(), current_user, now(), version()` readback with the identical connection-timeout error.

Interpretation: this is now evidenced as a cross-project SQL connectivity path problem, not safely attributable to the CNS schema or staging migration logic. The Supabase management/control plane is reachable; the connected SQL execution path is not.

Conclusion: remote runtime readiness is NOT proven. Cutover remains blocked until successful SQL + migration readback on the intended CNS target. Do not infer readiness from dashboard/control-plane status, and do not apply unverifiable DDL.
