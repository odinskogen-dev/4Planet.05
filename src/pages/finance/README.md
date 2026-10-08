# CAP-PLATFORM-01 — Finance Intelligence MVP

Project Home: https://docs.google.com/document/d/1kvvQNv5ZjMKHMny_mVDlH2kILSaA0Bj0cfCUjsgmrWk/edit

Product host target: finance.4planet.org. Internal preview route: /finance. Owner: existing 4PLANET CAPITAL + RESOURCES.

Implemented frontend candidate:
- Minimal premium responsive public home, funding discovery, funder actor and programme profiles, separate annual calls.
- User workspace dashboard, filterable CRM, saved opportunities, year wheel, projects, application status view and relationship graph.
- Shared canonical 4PLANET ID client import and trusted finance hostname bridge.
- Browser-local demo persistence isolated between 4PLANET/PERSONAL fictional demo workspaces, with reset.
- DEMO: all organisations, calls, dates, amounts, statuses and user workspaces are fictional and never public finance claims.

What is NOT done:
- No real x500/Capital Control Tower source data imported. Real source, eligibility, license checks and as-of reconciliation remain.
- No authenticated Supabase workspace storage, tenant RLS or 2-user security proof; the demo data is only on device.
- No verified cross-domain login on finance.4planet.org, no published domain/DNS, no external review or Gold sign-off.
- No grants have been applied for or sent, no funds awarded or received, and no commercial product or checkout.

Existing truth authority: x500 Capital Control Tower spreadsheet 1rX-ENgkxF68V980X2ae270VggzKvNk-ag8cFkTfV6NA; tabs 01_OPPORTUNITIES / 04_SUBMISSIONS / 28_FOUNDER_VIEW / 29_DEADLINE_ASSURANCE; funder/submission masters own historical sources. IMPORTANT: Founder View already marks historic KPI counts unsafe without fresh reconciliation.

Before live:
1. Reconcile actor, programme, annual call, opportunity and applicant case IDs with source masters.
2. Add secure per-tenant persistence in approved existing Supabase 4Planet OS, use existing 4PLANET ID, test two users and session refresh. NO parallel login/database.
3. Source-verify all actor and call pages; keep 2027 deadlines UNKNOWN unless officially published.
4. Connect first-party task and deadline reminders without changing existing automations.
5. Independent Gold QA and actual mobile/desktop runtime verification, then only Founder-approved custom-domain release.
6. Verify original currency and type: programme envelope is not individual grant, application is not award/cash, historic call is not automatically active.

Checks: npm ci; npm run typecheck; node --test scripts/finance-mvp-contract.test.mjs; npm run build.

Strict status: GitHub review candidate, not production or a tested complete multi-tenant MVP.