# PSI Phase 06 — Controlled remote staging runbook

Status: `DEPLOYMENT_READY_NOT_EXECUTED`

This runbook exists because the Phase 06 execution environment can validate PostgreSQL/PostGIS ephemerally in CI but does not expose an approved Supabase staging project ref or deployment credentials. It must not be pointed at production.

## Preconditions

1. Founder explicitly identifies/approves a disposable or controlled staging Supabase project.
2. The operator verifies the project ref from the Supabase dashboard.
3. A Supabase access token is available to the operator/CI secret store.
4. If required for non-interactive CI, the staging database password is available as `SUPABASE_DB_PASSWORD`.
5. The linked project is independently checked to be staging, not production.
6. Current branch SHA and migration history are recorded before changes.

## Safe sequence

```bash
supabase login
supabase link --project-ref <APPROVED_STAGING_PROJECT_REF>
supabase db push --dry-run
```

Review the dry-run output. Only if it contains the expected unapplied migrations and the linked project is confirmed staging:

```bash
supabase db push
```

Do **not** use `--include-seed` for production. For Phase 06, the Decision-Proof cohort should be loaded through the explicit bounded staging fixture/pipeline after schema deployment, not silently bundled into canonical migrations.

## Validation after push

Run at minimum:

- PostGIS version / extension check;
- Phase 05 BRAIN SQL contract tests;
- Phase 05 reviewed-context test;
- Phase 06 Decision-Proof SQL gate;
- RLS/public-read safety test;
- generated schema types;
- database lint;
- application typecheck/build;
- bounded Context Pack v4 retrieval.

Capture project ref, migration history, exact Git SHA and results in the Phase 06 deployment report.

## Stop conditions

Stop before applying migrations if:

- project identity is uncertain;
- the target may contain production data;
- remote migration history differs materially from Git without reconciliation;
- dry-run shows unexpected destructive changes;
- required rollback path is not understood;
- founder has not released remote staging deployment.

Never treat local/ephemeral CI validation as remote staging deployment.
