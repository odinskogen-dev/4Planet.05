# SUPERBRAIN REMOTE BLOCKER EVIDENCE — 2026-08-25

Observed via connected Supabase control plane:

- `4planet-staging` project ref `dcxiougjoazkafyeeaxi` reports `ACTIVE_HEALTHY`.
- Direct SQL readback `select current_database(), current_user, now(), version()` failed with `Connection terminated due to connection timeout`.
- `list_migrations` failed with the same connection timeout.
- Security advisor call reported project as `hibernated and will wake on next supported request`.
- Restore request returned: project is no longer paused, is `ACTIVE_HEALTHY`, and may take time to fully restore.
- Postgres/API logs returned no useful rows while this state persisted.

Conclusion: remote runtime readiness is NOT proven. Cutover remains blocked until successful SQL + migration readback. Do not infer readiness from dashboard/control-plane status.
