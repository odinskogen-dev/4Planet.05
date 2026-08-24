# TEST KING STRIPE ADOPTION 01

Status: ACTIVE RECOVERY / TEST ONLY  
Parent: issue #156 → #140 → #132  
Recovery lane: `recovery/testking-market`  
Canonical integration target: `king/test` / PR #131  
Production authority: NONE

## Founder direction — 24 AUG 2026

Start the Stripe foundation now for four IMPACT pathways and design the same payment layer so sponsor packages and recurring paid membership can be added without a second payment architecture.

## Current TEST catalogue materialised in Stripe sandbox

| Product key | Stripe test product | Stripe test price | Mode | Truth |
|---|---|---|---|---|
| `impact_tree_test` | `4p_impact_tree_test` | `price_1U7w9lBIIif9wShMBdiJkElA` | one-time | engineering test only |
| `impact_plastic_test` | `4p_impact_plastic_test` | `price_1U7w9uBIIif9wShMkSYviyab` | one-time | engineering test only |
| `impact_coral_test` | `4p_impact_coral_test` | `price_1U7wA2BIIif9wShMG7qg2s65` | one-time | engineering test only |
| `impact_rewild_test` | `4p_impact_rewild_test` | `price_1U7wABBIIif9wShMA2EXSeqQ` | one-time | engineering test only |
| `membership_supporter_test` | `4p_membership_supporter_test` | `price_1U7wGQBIIif9wShM2RckyATg` | monthly subscription | engineering test only |
| `sponsor_package_test` | `4p_sponsor_package_test` | `price_1U7wGeBIIif9wShMi9z76s8m` | one-time | engineering test only |

All current catalogue prices are NOK 10 engineering values in Stripe test mode. They are NOT public prices, partner economics, sponsorship rights, field-delivery commitments or ecological claims.

## Donor reconciliation

### PR #111 — Stripe foundation
Decision: **ADOPT SELECTIVELY**.

Retain:
- Stripe-hosted Checkout;
- Cloudflare Pages Functions;
- server-side secret only;
- signed webhook verification;
- test-first and fail-closed behaviour;
- strict separation between payment and downstream delivery/impact states.

Improve:
- browser sends a bounded product key rather than a raw Stripe Price ID;
- shared catalogue supports payment and subscription modes;
- IMPACT metadata explicitly prohibits interpreting payment as ecological delivery.

### PR #112 — bounded product-key checkout
Decision: **ADOPT + GENERALISE**.

Retain:
- client cannot choose amount/currency/Price ID;
- server-owned product mapping;
- same-origin / controlled-preview origin checks;
- truthful failure behaviour.

Generalise from `qa | primary` to a shared 4PLANET catalogue.

### PR #113 — order-status/live-canary
Decision: **ADOPT TEST STATUS VERIFICATION; DEFER LIVE CANARY**.

Retain:
- redirect is never payment proof;
- retrieve Checkout Session server-side;
- verify test mode + product metadata + settled state before confirming payment.

Defer:
- live canary until the connected live Stripe context, accounting/tax treatment and a Founder production gate are all explicit.

### PR #110 — commerce state architecture
Decision: **ADOPT SEMANTIC BOUNDARY; DEFER FULL MARKETPLACE SCHEMA**.

Retain payment/order/refund truth separation and provider-neutral architecture. Do not pull CRE4TORS marketplace complexity into first IMPACT checkout.

## Shared payment architecture

One payment foundation, three active TEST product archetypes plus one gated future archetype:

1. `IMPACT_UNIT`
   - one-time payment;
   - quantity-capable;
   - payment funds/records a Contribution only;
   - partner Delivery, Evidence, Outcome and System Impact remain separate states.

2. `SPONSOR_PACKAGE`
   - one-time or recurring depending on future package;
   - tied to an exact funding object / Mission / programme;
   - sponsor rights and editorial/scientific independence remain explicit;
   - current object is TEST only.

3. `MEMBERSHIP`
   - recurring Stripe Checkout / Billing;
   - Free membership remains outside Stripe;
   - paid membership uses the same Customer/payment foundation;
   - membership benefits do not automatically equal ecological units.

4. `SUPPORT` — GATED / NOT PUBLIC
   - potential voluntary contribution without a product unit;
   - do not label as tax-deductible donation unless the receiving entity is eligible/approved and the payment-provider route is cleared;
   - do not create ecological delivery or membership entitlement unless separately defined;
   - current build remains capable of adding this later without another payment architecture.

## Runtime contract

Browser sends only:
- `productKey`;
- bounded `quantity` where supported;
- optional email.

Server owns:
- Stripe Price ID;
- mode (`payment | subscription`);
- product family / kind;
- quantity rules;
- success/cancel route;
- metadata truth boundary.

Stripe owns:
- payment/subscription processing;
- Checkout Session state;
- payment/refund events.

4PLANET owns:
- catalogue semantics;
- inventory/cap reservations;
- ContributionRecord;
- membership/sponsor entitlement rules;
- partner request;
- DeliveryRecord;
- Evidence;
- Outcome;
- Personal Impact Record.

## Current test-only environment

Required Cloudflare server variables for the current six-object TEST catalogue:

- `STRIPE_TEST_SECRET_KEY`
- `STRIPE_CHECKOUT_TEST_ENABLED=true`
- `STRIPE_PRICE_IMPACT_TREE_TEST=price_1U7w9lBIIif9wShMBdiJkElA`
- `STRIPE_PRICE_IMPACT_PLASTIC_TEST=price_1U7w9uBIIif9wShMkSYviyab`
- `STRIPE_PRICE_IMPACT_CORAL_TEST=price_1U7wA2BIIif9wShMG7qg2s65`
- `STRIPE_PRICE_IMPACT_REWILD_TEST=price_1U7wABBIIif9wShMA2EXSeqQ`
- `STRIPE_PRICE_MEMBERSHIP_SUPPORTER_TEST=price_1U7wGQBIIif9wShM2RckyATg`
- `STRIPE_PRICE_SPONSOR_PACKAGE_TEST=price_1U7wGeBIIif9wShMi9z76s8m`
- `STRIPE_WEBHOOK_SECRET` after a test webhook endpoint is registered.

Price IDs are test identifiers, not secrets. Live price IDs and live secrets must not be hard-coded.

## Current backend implementation

`POST /api/stripe/checkout`
- accepts only the six bounded TEST product keys;
- refuses any secret that is not `sk_test_`;
- maps product key → Price ID on the server;
- uses `mode=payment` for IMPACT/sponsor;
- uses `mode=subscription` for paid membership;
- limits IMPACT quantities to 1–20 per checkout and sponsor/membership to 1;
- sends shared TEST truth metadata;
- refuses live Checkout sessions.

`GET /api/stripe/checkout-status`
- accepts only `cs_test_` sessions;
- reads the session from Stripe server-side;
- verifies bounded product metadata + TEST state;
- returns financial/checkout truth only;
- never treats payment as ecological Delivery or verified Impact.

`POST /api/stripe/webhook`
- verifies Stripe signature;
- rejects live events;
- accepts bounded financial lifecycle events for TEST logging/next-state work;
- does not mutate ecological Delivery/Evidence/Outcome/System Impact.

## Caps

Per-checkout quantity is bounded by the checkout endpoint.

A real total pilot cap such as `100 authorised / 37 funded / 63 available` requires durable, concurrency-safe reservation/persistence. Stripe quantity limits alone are not sufficient. That persistence belongs to the shared commerce/IMPACT state layer and must be implemented before public capped inventory is represented as real.

## B2B / larger sponsor route

Large Founding Partner, Pilot Funder and Mission Development Partner transactions should normally remain contract/invoice-led rather than a public card checkout. Stripe Dashboard + Hosted Invoice Page is sufficient initially; API automation comes only when recurring volume justifies it.

## Production boundary

This recovery pass remains test-only. No code in this lane may accept `sk_live_`, create `cs_live_` sessions, claim partner approval or represent payment as delivery.

Sandbox → live is a controlled configuration and release transition after:
- live Stripe account/context access;
- approved real Product/Price objects;
- tax/VAT/accounting treatment;
- partner unit/economics for IMPACT;
- terms/refund/remedy;
- support/donation entity and Stripe-policy clearance if that route is used;
- durable state where required;
- end-to-end test evidence;
- explicit Founder production authority.
