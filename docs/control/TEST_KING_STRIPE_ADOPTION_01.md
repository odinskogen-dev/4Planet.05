# TEST KING STRIPE ADOPTION 01

Status: ACTIVE RECOVERY / TEST ONLY  
Parent: issue #156 → #140 → #132  
Recovery lane: `recovery/testking-market`  
Canonical integration target: `king/test` / PR #131  
Production authority: NONE

## Founder direction — 24 AUG 2026

Start the Stripe foundation now for four IMPACT pathways and design the same payment layer so sponsor packages and recurring paid membership can be added without a second payment architecture.

Current IMPACT test catalogue materialised in Stripe sandbox:

| Product key | Stripe test product | Stripe test price | Mode | Truth |
|---|---|---|---|---|
| `impact_tree_test` | `4p_impact_tree_test` | `price_1U7w9lBIIif9wShMBdiJkElA` | one-time | engineering test only |
| `impact_plastic_test` | `4p_impact_plastic_test` | `price_1U7w9uBIIif9wShMkSYviyab` | one-time | engineering test only |
| `impact_coral_test` | `4p_impact_coral_test` | `price_1U7wA2BIIif9wShMG7qg2s65` | one-time | engineering test only |
| `impact_rewild_test` | `4p_impact_rewild_test` | `price_1U7wABBIIif9wShMA2EXSeqQ` | one-time | engineering test only |

All four prices are NOK 10 engineering prices in Stripe test mode. They are NOT partner economics, public prices, field-delivery commitments or ecological claims.

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
- browser must send a bounded product key rather than a raw Stripe Price ID;
- shared catalogue must support payment and subscription modes;
- IMPACT metadata must explicitly prohibit interpreting payment as ecological delivery.

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
- verify test mode + product metadata + paid state before confirming payment.

Defer:
- live canary until the connected live Stripe context, accounting/tax treatment and a Founder production gate are all explicit.

### PR #110 — commerce state architecture
Decision: **ADOPT SEMANTIC BOUNDARY; DEFER FULL MARKETPLACE SCHEMA**.

Retain payment/order/refund truth separation and provider-neutral architecture. Do not pull CRE4TORS marketplace complexity into first IMPACT checkout.

## Shared payment architecture

One payment foundation, three product archetypes:

1. `IMPACT_UNIT`
   - one-time payment;
   - quantity-capable;
   - payment creates/funds a Contribution only;
   - partner Delivery, Evidence, Outcome and System Impact remain separate states.

2. `SPONSOR_PACKAGE`
   - one-time or recurring depending on package;
   - tied to an exact funding object / Mission / programme;
   - sponsor rights and editorial/scientific independence must remain explicit;
   - no generic sponsor payment is activated by this pass.

3. `MEMBERSHIP`
   - recurring Stripe Checkout / Billing;
   - Free membership remains outside Stripe;
   - paid membership uses the same Customer/payment foundation;
   - membership benefits do not automatically equal ecological units.

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
- partner request;
- DeliveryRecord;
- Evidence;
- Outcome;
- Personal Impact Record.

## Current test-only environment

Required Cloudflare server variables for the four current IMPACT test objects:

- `STRIPE_TEST_SECRET_KEY`
- `STRIPE_CHECKOUT_TEST_ENABLED=true`
- `STRIPE_PRICE_IMPACT_TREE_TEST=price_1U7w9lBIIif9wShMBdiJkElA`
- `STRIPE_PRICE_IMPACT_PLASTIC_TEST=price_1U7w9uBIIif9wShMkSYviyab`
- `STRIPE_PRICE_IMPACT_CORAL_TEST=price_1U7wA2BIIif9wShMG7qg2s65`
- `STRIPE_PRICE_IMPACT_REWILD_TEST=price_1U7wABBIIif9wShMA2EXSeqQ`
- `STRIPE_WEBHOOK_SECRET` after a test webhook endpoint is registered.

Price IDs are test identifiers, not secrets. Live price IDs and live secrets must not be hard-coded.

## Caps

Per-checkout quantity is bounded by the checkout endpoint.

A real total pilot cap such as `100 authorised / 37 funded / 63 available` requires durable, concurrency-safe reservation/persistence. Stripe quantity limits alone are not sufficient. That persistence belongs to the shared commerce/IMPACT state layer and must be implemented before public capped inventory is represented as real.

## Production boundary

This recovery pass must remain test-only. No code in this lane may accept `sk_live_`, create `cs_live_` sessions, claim partner approval or represent payment as delivery.

Sandbox → live is a configuration and release transition after:
- live Stripe account/context access;
- approved real Product/Price objects;
- tax/VAT/accounting treatment;
- partner unit/economics for IMPACT;
- terms/refund/remedy;
- durable state where required;
- end-to-end test evidence;
- explicit Founder production authority.
