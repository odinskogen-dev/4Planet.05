# 4PLANET_ PUBLIC PRODUCTION INFRASTRUCTURE, SECURITY, DATA & MEASUREMENT — HARDENING v1

**Date:** 10 August 2026  
**Status:** WORKING IMPLEMENTATION / PRE-PRODUCTION / NOT HOSTED-VERIFIED  
**Founder authority:** Odin Oddekalv  
**Programme control:** GPT  
**Base candidate:** PR #25 lineage, base SHA `df9732cce5d3e103361da93919cab3fe00eb8b36`  
**Hardening branch:** `agent/public-production-hardening-v1`  

No production deployment, database migration, payment activation, external communication, membership activation or ecological-delivery claim is authorised by this artifact.

## 00 — EXECUTIVE VERDICT

The current ONE INTERFACE candidate already had useful pre-production controls: a real `/join` route, fail-closed form behaviour, static security headers, explicit TEST Impact separation and a Supabase truth-spine migration. The material production gaps were persistent signup storage, explicit access control for signup data, abuse controls, idempotency/deduplication, product-event architecture, privacy/retention alignment, API response hardening, observability and a controlled release queue.

This branch closes a substantial part of those gaps **in code only**. Hosted verification is still blocked because every accessible Supabase project is currently inactive and no production Supabase destination has been founder-approved. No project was restored or created during this sprint.

**Payment readiness verdict: HOLD / DO NOT ACTIVATE.** The current company-purpose amendment is still on hold and not registered; accounting/tax/VAT/bank/payment-processor boundaries remain open; provider/Impact production gates remain open. The honest public path remains registration / expression of interest with zero payment.

## 01 — PRODUCTION ARCHITECTURE

### Target minimum-safe path

```text
Browser
  |
  | HTTPS
  v
Cloudflare Pages / 4planet.org
  |-- static ONE INTERFACE
  |-- /api/health
  |-- /api/leads
  `-- /api/events
         |
         | server-side only
         | SUPABASE_SECRET_KEY in Cloudflare secret binding
         v
Supabase/Postgres
  |-- truth spine / source records
  |-- public_registrations          PRIVATE TO SERVER ROLE
  |-- public_privacy_requests       PRIVATE TO SERVER ROLE
  `-- product_events                PRIVATE TO SERVER ROLE

BRAIN remains authority for canon, source/claim truth and durable learning decisions.
Runtime product events do not become a second analytics truth database or silently alter canon.
```

### Environment separation

**STAGING**
- Use the existing `4planet-staging` project only after explicit restoration approval.
- Apply migrations first in staging.
- Use non-production Cloudflare secret bindings.
- Use `PUBLIC_ENVIRONMENT=PREVIEW`.
- Keep `PAYMENTS_ENABLED=false`.
- Verify migration, RLS, anon/auth denial, rollback and readback before any production target is touched.

**PRODUCTION**
- Must be a separately identified and founder-approved Supabase destination.
- Do not use `4PLANET_ BRAIN` as the public product transactional database.
- Do not assume the legacy “Foundation Website & Webshop” project is the correct production destination without explicit review.
- Use distinct production secrets and access scope.
- Use `PUBLIC_ENVIRONMENT=PRODUCTION` only after release gate closure.

### Cloudflare / domain

Current repo is built for Cloudflare Pages and Pages Functions. Exact live `4planet.org` DNS attachment, redirect policy, SSL certificate state, production project binding and Pages environment-variable state were not independently verified in this sprint and remain P0 release checks.

Required production domain state:
- canonical HTTPS host chosen;
- apex/www redirect deterministic;
- valid managed TLS;
- no mixed content;
- Pages production branch explicitly known;
- preview and production environment variables separated;
- rollback target known before release;
- cache policy preserves immutable hashed assets and no-store HTML where appropriate.

### Environment-variable contract — NAMES ONLY

Never write values into BRAIN, docs, Git or chat.

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY` — server only, modern secret key preferred
- `PUBLIC_INTAKE_ENABLED` — default closed
- `MEASUREMENT_ENABLED` — default closed
- `PAYMENTS_ENABLED` — default closed and must remain false for current release
- `PUBLIC_ENVIRONMENT` — PREVIEW or PRODUCTION
- `PUBLIC_ORIGIN` — optional explicit allowed origin
- `TURNSTILE_SECRET_KEY` — optional until Turnstile is activated
- `CF_PAGES_COMMIT_SHA` — platform-provided build identity where available

## 02 — DATABASE & ACCESS CONTROL

### Existing truth spine

The existing migration keeps Source Record, Observation, Signal, Interpretation, Contribution, Delivery, Outcome and Impact separate and enables RLS. Public contribution/delivery/outcome/impact writes remain revoked.

### New server-only tables

`public_registrations`
- durable registration/enquiry record;
- explicit consent scope/time;
- separate `marketing_permission=false` default;
- idempotency key;
- dedupe key;
- bounded attribution;
- relationship status;
- deletion-request state;
- provisional 180-day review deadline.

`public_privacy_requests`
- ACCESS / EXPORT / CORRECTION / DELETION / WITHDRAW_CONSENT request state;
- no automatic disclosure/deletion before identity verification.

`product_events`
- allowlisted product events only;
- no arbitrary event names;
- no public reads/writes;
- payment events rejected by API while payments are disabled;
- no intended IP, User-Agent, fingerprint or full-referrer storage.

All three tables:
- RLS enabled;
- no anon/authenticated policies;
- all anon/authenticated table privileges revoked;
- server/service role only.

### Existing Source Record red-team correction

The prior truth-spine migration granted table-wide public SELECT on `source_records` for rows that pass RLS. Because the table contains `raw_payload`, that public surface is broader than the current public product needs.

Hardening migration `20260810004500_source_record_public_surface.sql`:
- preserves the existing Source Record table and RLS semantics;
- revokes table-wide public SELECT;
- grants public SELECT only to the explicit safe source/provenance columns;
- keeps `raw_payload` and `content_sha256` server-side.

This requires staging compatibility testing before production use.

## 03 — MEMBER / SIGNUP DATA LIFECYCLE

Implemented current path:

```text
CTA
-> /join form
-> local HTML validation
-> consent checkbox
-> signup_start event attempt
-> same-origin /api/leads
-> body-size + type + email + honeypot validation
-> optional Turnstile verification when configured
-> deterministic dedupe
-> idempotency
-> durable Supabase insert
-> signup_completion event attempt
-> truthful UI receipt ONLY after durable record exists
```

Failure behaviour:
- intake disabled -> no success claim;
- database misconfigured -> 503 / no success claim;
- storage error -> error / form remains;
- duplicate registration -> existing durable record satisfies receipt, duplicate write suppressed.

Current registration is **not**:
- an account;
- paid membership;
- partner status;
- funder status;
- a subscription to unrelated marketing;
- Impact evidence.

### Confirmation

P0 confirmation is the durable in-product receipt after the database write. Email confirmation remains P1 and requires an approved domain mailbox/provider, delivery logging and unsubscribe handling.

### CRM / relationship view

The persistent registration table is the system record for public intake. Do not create a second person database merely for outreach. A CRM connector/view may mirror approved fields later, but the sync needs:
- actor/contact ID mapping;
- sync receipt;
- conflict rule;
- deletion propagation;
- consent/marketing scope preservation.

## 04 — ABUSE, SPAM & FAILURE

Implemented:
- same-origin enforcement;
- 16 KB request-body ceiling;
- honeypot;
- strict lead-type/event allowlists;
- bounded field lengths;
- idempotency;
- deterministic registration dedupe;
- optional server-side Turnstile verification;
- payment-event kill switch;
- analytics PII-key rejection;
- API responses with explicit security headers;
- fail-closed data storage.

P0 provider configuration before meaningful public traffic:
- Cloudflare WAF/rate-limit rule for `/api/leads` and `/api/events`;
- abuse threshold chosen from actual early traffic;
- verify that Pages Functions receive the intended origin/host behaviour.

P1 before large outreach:
- Turnstile widget/site key + secret where form abuse warrants it;
- confirmation-email rate limits;
- suppression rules for repeated failed privacy requests;
- operational failure alert channel.

### Retry / dead-letter rule

For public registration, **do not acknowledge then queue an uncertain write**. Durable database write is the success boundary. If storage fails, the browser receives an error and the form is not reset. This removes the need for a P0 lead dead-letter queue.

For product analytics, lost low-value events are preferable to blocking user journeys or collecting excessive retry state. Critical business records must never depend on analytics delivery.

For future email/CRM/payment/provider jobs, use bounded retries + DEAD_LETTER semantics. The Brand OS activation donor already implements this pattern for publishing jobs and should be reused rather than creating a second queue model.

## 05 — PAYMENT READINESS VERDICT

**VERDICT: NO PUBLIC PAYMENT ACTIVATION NOW.**

Reasons:
1. Company-purpose/register-change package is on HOLD and not registered.
2. Current accounting, tax/VAT, bank and payment-flow treatment is not closed.
3. Merchant/processor architecture and contractual entity are not approved.
4. Terms, cancellation, refund, receipt and complaint handling are not final.
5. Production member/support product definition is not final.
6. Production Impact provider/delivery/proof gates are not closed.
7. No need to create payment risk to validate the current public product.

Current honest alternative:
- free registration of interest;
- founding/support/funding enquiry;
- no checkout;
- no payment intent;
- no card data;
- no paid membership claim.

Payment code/event taxonomy may remain prepared behind `PAYMENTS_ENABLED=false`, but no payment route may be enabled until the full payment gate is signed off.

## 06 — PRIVACY & DATA GOVERNANCE

### Field-control matrix

| Data | Purpose | Proposed basis / gate | Access | Retention | Deletion/export |
|---|---|---|---|---|---|
| Name | process stated registration/enquiry | explicit registration consent; legal review before activation | server/admin only | 180-day technical review default unless relationship justifies approved longer period | verified request |
| Email | reply/contact about stated interest | explicit registration consent; legal review before activation | server/admin only | same as above | verified request |
| Organisation/role | qualify organisation-specific enquiry when supplied | same stated enquiry purpose; optional/minimised | server/admin only | same as above | verified request |
| Interest/message | route the request | same stated enquiry purpose | server/admin only | same as above | verified request |
| Consent scope/time | prove what permission was given | compliance record tied to registration | server/admin only | at least while underlying processing/claim needs evidence; final schedule requires review | retained as legally necessary audit evidence after withdrawal, otherwise minimised |
| Campaign/UTM/referrer host | bounded source attribution | bundled only where disclosed; final legal/cookie basis must be approved | server/admin only | no longer than underlying registration/measurement need | deletion with related personal record where applicable |
| Product event + session ID | product learning | **BLOCKED until tracking/cookie/legal basis is approved** | server/admin only | short/minimised; final schedule required | deletion where linkable/required |
| IP/User-Agent/fingerprint/full referrer | not required for product learning | EXCLUDED from application analytics store | n/a | n/a | n/a |

### Sensitive-data exclusion

4PLANET registration is not designed to collect health, religion, political opinion, sexuality, biometric data, precise private location or other special-category/sensitive personal information. Free-text fields should carry a public warning not to submit sensitive personal data. If such information is nevertheless received, it must not be re-used for unrelated profiling or marketing and should be minimised/deleted according to the approved privacy process.

### Privacy activation gates

Before `PUBLIC_INTAKE_ENABLED=true`:
- legal operator confirmed;
- privacy contact at approved domain active;
- processor list complete;
- retention/deletion schedule approved;
- consent wording approved;
- access/export/deletion verification procedure approved;
- breach-response owner defined.

Before `MEASUREMENT_ENABLED=true`:
- exact event list approved;
- tracking/cookie legal basis decided;
- user information/consent mechanism implemented if required;
- retention approved;
- no invasive fields added.

## 07 — OBSERVABILITY

### Minimum stack

Use existing infrastructure first:
- GitHub Actions: build, typecheck, contracts, lint, dependency audit, secret-pattern gate;
- Cloudflare Pages/Functions: deployment status, request/function failures, WAF/rate-limit state;
- `/api/health`: coarse release state, intake/measurement/payment flag safety and build SHA without secrets;
- Supabase: API/Postgres/auth/storage logs after a project is active;
- source-health states inside ATLAS for provider-specific failures.

Do not add a large observability vendor solely for first release.

### P0 operational alerts

P0 = immediate release stop / rollback candidate:
- private registration table readable or writable through public credentials;
- secret exposed in client/Git/log output;
- `PAYMENTS_ENABLED=true` without payment gate;
- signup UI reports success without durable record;
- destructive migration/data loss;
- public app or core route unavailable after deploy;
- database restore/rollback cannot be performed when needed;
- material truth/source boundary violation that creates false public evidence.

### P1 operational alerts

P1 = urgent correction before scaling traffic:
- sustained `/api/leads` 5xx or storage failures;
- rate-limit/spam spike;
- event ingestion unavailable for an extended period;
- repeated source adapter outage affecting a flagship journey;
- significant performance regression;
- confirmation-email/CRM sync backlog after those systems are introduced;
- security/dependency high severity finding in active release candidate.

## 08 — MEASUREMENT EVENT TAXONOMY

Canonical v1 event names:

1. `landing`
2. `gold_vertical_entry`
3. `atlas_interaction`
4. `species_interaction`
5. `source_open`
6. `relationship_reveal`
7. `impact_member_cta`
8. `signup_start`
9. `signup_completion`
10. `contact_enquiry`
11. `return_visit`
12. `content_referral`
13. `payment_intent` — disabled while payment gate closed
14. `checkout` — disabled while payment gate closed
15. `payment_success` — disabled while payment gate closed
16. `payment_failure` — disabled while payment gate closed
17. `payment_refund` — disabled while payment gate closed

Current implementation coverage:
- `signup_start`: client wired on `/join` submit attempt;
- `signup_completion`: server wired after a durable registration exists;
- all other events: taxonomy/API contract prepared, UI instrumentation not yet complete;
- payment events: API rejects while `PAYMENTS_ENABLED != true`.

### Allowed event context

- session-scoped random ID;
- route;
- canonical entity type/id where useful;
- channel/campaign/content/story/gold-vertical/outreach-actor IDs;
- UTM source/medium/campaign/content;
- referrer **host only**;
- bounded non-PII properties;
- release SHA.

Do not collect:
- keystrokes;
- heatmaps/session replay;
- cross-site advertising IDs;
- full IP history;
- full referrer URL history;
- device fingerprint;
- arbitrary form contents in analytics.

## 09 — ATTRIBUTION ARCHITECTURE

Attribution describes recorded path metadata; it does not establish causality.

Controlled dimensions:
- `channel`
- `campaign`
- `contentId`
- `storyId`
- `goldVerticalId`
- `outreachActorId`
- `utmSource`
- `utmMedium`
- `utmCampaign`
- `utmContent`
- `referrerHost`

Rules:
- preserve literal campaign metadata;
- do not transform attribution into “this caused conversion”;
- use stable IDs where campaign/story/actor objects already exist;
- do not create a second campaign truth registry in analytics;
- retain source/campaign definitions in existing Brand/Outreach/BRAIN systems and store only references here.

## 10 — LEARNING LOOP

Target loop:

```text
RELEASE
-> RECEIPT
-> EVENT
-> METRIC
-> OBSERVATION
-> LEARNING
-> PRODUCT / CONTENT DECISION
-> BRAIN WRITEBACK
```

Authority boundary:
- release receipt/event/metric = runtime evidence;
- observation = analysis of evidence;
- learning = bounded interpretation;
- product/content decision = controlled decision record;
- BRAIN writeback = only after audit/authority rules;
- performance never silently rewrites canon, claims or rights.

Reuse the existing Brand OS donor structures for publication receipts, metric events, learning decisions, founder interventions and incidents. Do not create a parallel Brand analytics database.

## 11 — SECURITY / PRIVACY RED TEAM

### Findings closed in branch code

**RT-01 — Generic lead webhook had no durable database lifecycle.**  
Closed in code: server-to-Supabase durable registration model.

**RT-02 — Existing lead endpoint stored User-Agent while privacy copy said only entered details were collected.**  
Closed in code: User-Agent removed from application storage; privacy notice aligned.

**RT-03 — No registration idempotency/deduplication.**  
Closed in code: idempotency + deterministic dedupe.

**RT-04 — No event allowlist / bounded analytics model.**  
Closed in code: allowlist and PII-property rejection.

**RT-05 — Static `_headers` do not guarantee Function response headers.**  
Closed in code: Pages Function JSON helper adds explicit security headers.

**RT-06 — Public Source Record grant included raw provider payload.**  
Closed in migration proposal: column-level public Source Record grant; staging compatibility proof still required.

**RT-07 — Payment events could be confused with active payment capability.**  
Closed in API: payment events return `payments_disabled` unless the explicit gate is enabled.

### Red-team findings still OPEN

**RT-08 — Hosted RLS cannot be proved while Supabase projects are inactive.** P0 before public intake.

**RT-09 — Exact Cloudflare production DNS/SSL/env/secret binding not independently verified.** P0 release check.

**RT-10 — No WAF/rate-limit configuration evidence.** P0 before meaningful traffic.

**RT-11 — Turnstile client integration not present.** P1 before large outreach if abuse risk requires it.

**RT-12 — Privacy request backend/self-service verification flow is only data-model prepared, not operational.** P1; manual verified email path remains interim.

**RT-13 — Product-event legal/cookie basis not approved.** Measurement remains disabled.

**RT-14 — Backup/restore/PITR state and restore drill not verified.** P0 before durable public capture.

**RT-15 — Public source-record column restriction may affect future persisted-source consumers.** Must pass staging tests before promotion.

**RT-16 — Domain mailbox/privacy mailbox not live.** P1 before large outreach; current Gmail is temporary pre-release contact.

## 12 — P0 / P1 / P2 IMPLEMENTATION QUEUE

### P0 — BEFORE ANY INTENTIONAL PUBLIC TRAFFIC / DATA CAPTURE

1. Close founder decision on staging and production Supabase destinations.
2. Restore staging only after approval; do not restore BRAIN/OS by accident.
3. Apply both hardening migrations in staging.
4. Run Supabase security advisors and inspect RLS/grants.
5. Prove anon/authenticated cannot read/write `public_registrations`, `public_privacy_requests`, `product_events`.
6. Prove anon cannot select `source_records.raw_payload` or `content_sha256`.
7. Run registration create/readback/duplicate/error tests server-side.
8. Verify rollback scripts on staging and prove restore path/backups.
9. Configure Cloudflare preview secrets using secret bindings; no Git values.
10. Verify exact production-domain DNS, TLS, apex/www redirect and production branch.
11. Configure WAF/rate limits for `/api/leads` and `/api/events`.
12. Keep `PUBLIC_INTAKE_ENABLED=false`, `MEASUREMENT_ENABLED=false`, `PAYMENTS_ENABLED=false` until their gates pass.
13. Approve privacy operator, processor list, retention, consent, deletion/export process.
14. Run exact-SHA CI and dependency audit green.
15. Run browser test proving false success cannot occur when database is unavailable.

### P1 — BEFORE LARGE AUTUMN OUTREACH

1. Activate canonical `@4planet.org` privacy/contact mailbox.
2. Add Turnstile client flow if spam evidence or traffic volume warrants it.
3. Add email confirmation with delivery receipt and unsubscribe/withdrawal handling.
4. Implement privacy-request intake/identity-verification workflow.
5. Instrument the remaining non-payment product events on flagship journeys.
6. Decide tracking/cookie basis before enabling product events.
7. Add campaign/story/gold-vertical stable IDs from existing Brand/Outreach registries.
8. Add CRM sync only after actor/contact ID and deletion-propagation contract is proven.
9. Add external uptime check for `/`, `/api/health`, `/join`, `/atlas`, `/species/orca`, `/impact`.
10. Define alert recipient/escalation owner and incident-response template.
11. Run mobile performance and critical-journey synthetic tests against release candidate.
12. Re-run security/privacy red team after all runtime bindings are live.

### P2 — AFTER INITIAL LEARNING

1. Tune rate limits from real traffic rather than guessed enterprise thresholds.
2. Add bounded retention automation after production retention evidence exists.
3. Add event aggregation/reporting views after real questions emerge.
4. Add source-specific SLOs only for sources that materially affect users.
5. Add CRM/relationship automation only where it reduces founder load.
6. Consider payment preparation only after company/accounting/legal/member-product gates close.
7. Consider additional observability vendor only if native logs are insufficient.
8. Use observed event/metric patterns to propose, not auto-apply, BRAIN/product decisions.

## 13 — EXACT FOUNDER / PROVIDER DEPENDENCIES

### Founder decisions

- authoritative staging Supabase project;
- authoritative production transactional database project;
- production operating/legal entity for public registration and later payment;
- final privacy retention schedule;
- registration consent language;
- privacy processor/vendor list;
- production privacy mailbox;
- whether/when product analytics is enabled;
- release domain and production branch;
- whether a CRM mirror is necessary before outreach;
- payment remains HOLD until separate founder release.

### Company / professional gates

- company-purpose/register state confirmed before public company-purpose claims;
- shareholder/signatory authority evidence where needed;
- accountant/tax/VAT review before paid support/membership;
- lawyer/privacy review before persistent public capture at scale;
- payment/refund/terms review before checkout;
- Impact provider/legal/scientific gates before any paid ecological unit.

### Cloudflare

- DNS/TLS/domain mapping;
- Pages production/preview environment separation;
- secret bindings;
- WAF/rate-limit rules;
- Turnstile site/secret keys if activated;
- Functions/deployment logs.

### Supabase

- staged project restoration/selection;
- production project selection;
- modern secret key for server-side service;
- migration application;
- RLS/advisor/readback evidence;
- backup/restore configuration and exercise;
- database/API logs.

### Email / CRM

Not required for P0 durable on-page registration. Required before large outreach if automatic confirmation, newsletter/subscription or CRM sync is activated.

## 14 — ROLLBACK

Code rollback:
- hardening branch is separate from the current founder candidate;
- do not merge until exact-SHA acceptance passes;
- revert hardening commits or drop branch without changing PR #25.

Database rollback:
- `20260810003400_public_production_core_rollback.sql` removes only the three new transactional tables;
- `20260810004500_source_record_public_surface_rollback.sql` restores prior Source Record table-wide SELECT grant;
- never run destructive rollback without explicit target confirmation and retained-data decision.

Release rollback:
- Cloudflare production release must identify the prior known-good deployment before promotion;
- database migrations and code release must not be treated as one irreversible action.

## 15 — CURRENT STATUS CLASSIFICATION

**VERIFIED IMPLEMENTATION IN GIT**
- hardening branch exists from PR #25 head;
- server-only registration/event migrations committed;
- source-record public-column restriction committed;
- fail-closed durable lead API committed;
- bounded event API committed;
- privacy-minimal client measurement helper committed;
- `/join` idempotency/attribution wiring committed;
- privacy notice aligned;
- `/api/health` committed;
- hardening contract tests and CI workflow committed.

**NOT YET VERIFIED**
- final CI conclusion after latest branch head;
- Cloudflare branch/runtime behaviour after latest branch head;
- hosted database migrations;
- hosted RLS read/write denial;
- backups/restore;
- WAF/rate limit;
- exact 4planet.org DNS/SSL production mapping;
- measurement legal basis;
- privacy self-service workflow.

**BLOCKED / CLOSED BY POLICY**
- production payment;
- paid membership;
- checkout;
- ecological delivery claims;
- external outreach;
- production merge/release without founder gate.

## 16 — SUCCESS INTERPRETATION

This sprint is not complete merely because code exists. Full success requires hosted proof that:
- a real registration creates exactly one durable record;
- the user never sees a false success;
- public credentials cannot access private records;
- failures are observable;
- rollback/restore are proven;
- bounded measurement can be enabled lawfully and intentionally;
- release events can feed the existing learning/writeback contract without becoming a competing truth system.
