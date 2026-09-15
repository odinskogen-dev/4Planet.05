# STRIPE TEST KING ADOPTION 01

Status: IMPLEMENTED ON TEST KING / TEST-ONLY / RUNTIME CONFIGURATION PENDING

Authority: Founder direction 24 Aug 2026; issue #156 with IMPACT coordination through #151. LIVE KING remains unchanged.

## Donor decisions

- PR #111 hosted Checkout + signed webhook: ADOPT SELECTIVELY.
- PR #112 server-owned product-key mapping: ADOPT + GENERALISE.
- PR #113 server Checkout-session verification: ADOPT TEST VERIFICATION; DEFER LIVE CANARY.
- PR #110 payment/order/refund separation: ADOPT SEMANTIC BOUNDARY; DEFER marketplace complexity.

## TEST catalogue

- `impact_tree_test` → one-time
- `impact_plastic_test` → one-time
- `impact_coral_test` → one-time
- `impact_rewild_test` → one-time
- `membership_supporter_test` → monthly subscription
- `sponsor_package_test` → one-time

The matching six Product/Price objects already exist in the connected `4Planet sandbox`. Their NOK 10 values are engineering TEST values only.

## Runtime

- `POST /api/stripe/checkout` — bounded product key → server-owned test Price → Stripe-hosted Checkout.
- `GET /api/stripe/checkout-status` — server-side confirmation of `cs_test_` state.
- `POST /api/stripe/webhook` — signed webhook; live events rejected.
- `src/payments/stripe.ts` — bounded browser helper; no secret or Price ID in client input.

IMPACT truth boundary: Stripe can establish financial Contribution state. Stripe cannot establish partner Delivery, Evidence, Outcome or verified System Impact.

## Required TEST environment configuration

- `STRIPE_TEST_SECRET_KEY`
- `STRIPE_CHECKOUT_TEST_ENABLED=true`
- `STRIPE_PRICE_IMPACT_TREE_TEST=price_1U7w9lBIIif9wShMBdiJkElA`
- `STRIPE_PRICE_IMPACT_PLASTIC_TEST=price_1U7w9uBIIif9wShMkSYviyab`
- `STRIPE_PRICE_IMPACT_CORAL_TEST=price_1U7wA2BIIif9wShMG7qg2s65`
- `STRIPE_PRICE_IMPACT_REWILD_TEST=price_1U7wABBIIif9wShMA2EXSeqQ`
- `STRIPE_PRICE_MEMBERSHIP_SUPPORTER_TEST=price_1U7wGQBIIif9wShM2RckyATg`
- `STRIPE_PRICE_SPONSOR_PACKAGE_TEST=price_1U7wGeBIIif9wShMi9z76s8m`
- `STRIPE_WEBHOOK_SECRET`

Secret values must live only in the deployment environment.

## Donation / support gate

No public generic DONATE product is part of this adoption. A later `SUPPORT` product may reuse this engine after receiving-entity/accounting and Stripe fundraising-policy clearance. No tax-deductibility claim is authorised.

## Remaining gates

1. TEST deployment variables/secrets configured.
2. Test webhook endpoint registered and signing secret stored.
3. Successful/cancelled/failed/refund/subscription lifecycle exercised end-to-end.
4. Durable global pilot-cap reservation/persistence before any real capped quantity is advertised.
5. User-facing buttons added only through the relevant current GOLD brief.
6. LIVE requires a separate exact-SHA Founder promotion gate plus live Stripe account/context and approved economics/tax/terms.
