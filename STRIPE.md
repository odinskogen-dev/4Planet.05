# 4PLANET Stripe Checkout Foundation

Status: INTERNAL / FAIL-CLOSED / NO PRODUCTION PAYMENT ACTIVATION BY THIS BRANCH.

## Chosen launch architecture

- Stripe-hosted Checkout.
- One-time digital products/pilots first.
- Managed Payments is the intended account-level path where eligible.
- Stripe Radar Standard remains account-level fraud protection.
- Subscriptions and invoice automation are Phase 2.
- CRE4TORS / multi-seller marketplace is explicitly separate and requires a later Connect decision.

## Security boundary

Never commit Stripe secret keys, webhook secrets or live Price IDs.

Cloudflare server-side environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_QA`
- `STRIPE_PRICE_PRIMARY`
- later: `STRIPE_WEBHOOK_SECRET`

The browser may send only a bounded product key. It never controls amount, currency or Stripe Price ID.

## Current QA object

A Stripe test-mode product exists for integration QA only:

- Product: `4PLANET Checkout QA — TEST ONLY`
- Product ID: `prod_V74W2OCVmONPBW`
- Price ID: `price_1U6qNKBIIif9wShMqKsefBys`
- Amount: NOK 1.00
- Live mode: false

This object is not a public commercial offer and must not be copied to live as a real product.

## API

`POST /api/checkout`

Example request:

```json
{ "product": "qa" }
```

The function creates a Stripe-hosted Checkout Session and returns:

```json
{ "ok": true, "id": "cs_...", "url": "https://checkout.stripe.com/..." }
```

The client should redirect the browser to `url`.

## Release gates

Before a real public payment button can activate:

1. Founder-approved exact product/service object.
2. Founder-approved exact live price and VAT/accounting treatment.
3. Live Stripe connector/account scope independently verified.
4. `STRIPE_SECRET_KEY` stored only in the production Cloudflare secret store.
5. `STRIPE_PRICE_PRIMARY` set to the approved live Price ID.
6. Success/cancel surfaces reviewed.
7. Webhook signature verification + transaction persistence/fulfilment path completed where fulfilment depends on payment state.
8. Test-mode end-to-end payment passes first.
9. Production release remains a separate controlled action.

## Known account/admin follow-up

- BRREG company address is known to require correction ASAP.
- Public Stripe profile must not expose stale company-address information.
