# ME4PLANET + PAYMENT READINESS 01

Status: TEST candidate only. No LIVE payment or public account release is authorised by this build.

## Receiver
- Seller / payment receiver: SKOG COMMUNICATIONS AS
- Org.nr.: 923 003 789
- Address: Sandakerveien 52, 0477 Oslo
- Current declared VAT state: not registered in the Norwegian VAT Register.

## Built in this branch
- consumer pre-checkout review with server-verified Stripe price and recurring interval;
- explicit payment-obligation CTA before Stripe Hosted Checkout;
- Norwegian terms, payment/cancellation/withdrawal information and withdrawal form;
- account/payment GDPR notice and equal-weight analytics consent choices;
- ME4PLANET email OTP account shell with HttpOnly server session cookies;
- member-role capture: 4PEOPLE MEMBER, FOUNDING MEMBER, MISSION BACKER, 4AMBASSADOR;
- separate opt-in marketing consent, default false, with consent record;
- own profile/payment/IMPACT view and data-export/privacy-request endpoints;
- strict planned RLS schema for user-linked data;
- server-owned Stripe Customer ↔ user binding;
- authenticated Stripe Customer Portal boundary;
- LIVE checkout origin narrowed to 4planet.org / www.4planet.org;
- expanded Stripe webhook event coverage for checkout, payment, subscriptions, invoices, refunds and disputes;
- atomic stale-event projection guard migration;
- B2B invoice exact-draft-first flow with rollback if line creation fails;
- HSTS, CSP hardening and no-store controls for sensitive routes;
- dedicated ME4PLANET/payment security contract tests added to normal smoke/contracts gates.

## External TEST Stripe state changed
Sandbox webhook endpoint `we_1U7z9oBIIif9wShM87C2Jry8` is enabled at `https://king-test.4planet-05.pages.dev/api/stripe/webhook` with the expanded financial event set.

## Fail-closed blockers
1. Current Stripe connector still exposes only `4Planet sandbox`; LIVE Stripe account is not connected in this session.
2. Supabase `4planet-staging` and `4Planet_ OS` report ACTIVE_HEALTHY, but SQL/migration calls time out. The ME4PLANET and stale-event migrations are therefore CODED BUT NOT APPLIED OR VERIFIED.
3. Cloudflare environment secrets for Auth/Stripe/Supabase must be configured server-side; secrets must never be committed.
4. Production auth still requires custom SMTP + SPF/DKIM/DMARC, bot protection/Turnstile and privileged-account MFA policy.
5. Stripe Customer Portal configuration must be enabled/configured in the relevant Stripe environment before `/me` billing management can work.
6. Product-family accounting/VAT classification remains a human accounting/legal gate. Non-registration in the VAT Register does not resolve whether a product category is VAT-liable or when registration obligations arise.
7. IMPACT cannot go LIVE until a concrete partner/unit contract defines allocation, delivery, evidence, refund/remedy and claims.
8. No LIVE price, LIVE webhook, LIVE secret or real-money checkout is enabled by this branch.

## First LIVE canary rule
Do not use IMPACT as the first real-money canary. Prefer one legally/accounting-reviewed simple 4PLANET support/service object. Freeze exact TEST KING SHA, prove TEST checkout → webhook → ledger → ME4PLANET → cancellation/refund, then connect LIVE Stripe, create one LIVE product/price, run one minimum-value real payment and reconcile payout/refund before opening public traffic.
