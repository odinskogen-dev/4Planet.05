# 4PLANET Durable Workers — Temporal spike 01

Status: PREPARED / NOT DEPLOYED / FAIL-CLOSED.

This directory is an isolated proof-quality runtime scaffold for long-running 4PLANET jobs that genuinely need durable multi-step execution. It does not replace 4PLANET BRAIN, NATUREBRAIN, Supabase cron, GitHub Actions, or existing source ingests.

## Why this exists

Temporal should be used only for workflows where retries, waits, approvals, fan-out, long-lived state or multi-system orchestration matter. Simple scheduled source acquisition should remain on the existing Supabase pg_cron + Edge Functions path. Code QA should remain in CI unless a longer workflow is required.

Initial allowlisted worker identities:

- public-rd
- capital
- procurement
- nature-change
- source
- seo
- game-qa

The workflow runs DISCOVER -> NORMALISE -> QUALIFY -> ROUTE, can pause on a founder/release signal, then writes an execution receipt.

## Safety boundary

The Temporal event history is execution state, not canonical knowledge.
Canonical organisational truth stays in 4PLANET BRAIN.
Living-world evidence stays in NATUREBRAIN/planetbrain.
Tenant/private truth stays inside its existing authority boundary.

Activities are deliberately fail-closed until an authenticated 4PLANET robot gateway exists. No external action, BRAIN mutation, email, submission, payment, public release or founder-gated action is performed by this scaffold.

## Local spike

Requirements: authentic Node.js 20/22/24 and a Temporal Service.

1. Run a local Temporal dev service: temporal server start-dev
2. npm install
3. Configure FOURPLANET_ROBOT_GATEWAY_URL and FOURPLANET_ROBOT_GATEWAY_TOKEN only after the gateway is implemented.
4. npm run worker
5. npm run start:workflow -- public-rd

Without the gateway, the workflow fails closed by design.

## Production gate

Do not deploy this Worker inside Cloudflare Pages/Workers. Temporal Worker-level TypeScript SDK features rely on Node-specific native modules, worker_threads, vm and AsyncLocalStorage.

Before production:
1. implement and security-test the authenticated robot gateway;
2. define BRAIN receipt/writeback contracts and idempotency keys;
3. run one bounded PUBLIC-RD workflow locally;
4. prove restart/retry recovery;
5. add observability + dead-letter/failure review;
6. choose an always-on Node worker host and Temporal Cloud or self-hosted Temporal Service;
7. promote only after exact-run evidence.
