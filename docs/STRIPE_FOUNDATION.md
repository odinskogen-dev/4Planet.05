# 4PLANET Stripe Foundation

Status: test-mode integration foundation. No production sale, creator payout, ecological delivery, or impact-outcome claim is implied by this branch.

## Accepted Stripe implementation plan

The Stripe implementation planner was run for 4Planet.org with the current business model.

### Payments

- Web browser checkout.
- Stripe as the primary processor.
- Stripe-hosted Checkout for the first integrated checkout flow.
- Keep Payment Links as a zero-code fallback for early/one-off sales.
- Use Adaptive Pricing for international sales where supported.
- Use Dynamic Payment Methods where compatible with the hosted Checkout configuration.
- Do not add Stripe Connect until CRE4TORS actually becomes a multi-seller marketplace.

### Invoicing

- Keep initial B2B invoicing low-code: Stripe Dashboard / ChatGPT-assisted invoice creation.
- Use invoice branding/templates to minimise repeat work.
- Use Stripe Hosted Invoice Page for customer-initiated invoice payment.
- Keep reconciliation in Stripe initially; add accounting/ERP synchronisation only when volume requires it.

## Important Managed Payments boundary

The planner's current Managed Payments eligibility path is for eligible digital-goods businesses. 4PLANET/CRE4TORS expects to sell physical prints and POD products, so the physical-goods checkout must not assume Managed Payments/Merchant-of-Record coverage.

Use standard Stripe Payments/Checkout for physical products unless Stripe explicitly confirms a different eligible configuration. Managed Payments can remain a later selective option for eligible digital products.

This also means physical-product VAT/sales-tax obligations are not automatically eliminated by selecting Managed Payments during onboarding. Stripe Tax can automate calculation/collection where configured, but registrations, accounting, and legal obligations remain separate.

## Secure runtime model

The browser never receives the Stripe secret key.

The first integration uses Cloudflare Pages Functions:

- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/webhook`

Hosted Checkout means the client does not need Stripe.js or a publishable key for the initial redirect flow.

### Required server-side secrets / variables

Configure in the Cloudflare Pages project environment, not in GitHub:

- `STRIPE_SECRET_KEY` — test secret first; live secret only after a controlled production gate.
- `STRIPE_WEBHOOK_SECRET` — signing secret for the deployed webhook endpoint.
- `STRIPE_ALLOWED_PRICE_IDS` — comma-separated allowlist of Stripe Price IDs permitted by the checkout API.
- `STRIPE_PHYSICAL_PRICE_IDS` — comma-separated subset requiring shipping-address collection.
- `STRIPE_SHIPPING_COUNTRIES` — comma-separated ISO country codes for allowed shipping destinations.
- `STRIPE_AUTOMATIC_TAX` — set to `true` only after Stripe Tax is deliberately configured for the relevant sales flow.
- `STRIPE_API_VERSION` — optional pinned API version if/when the account team chooses one.

The checkout endpoint refuses to create sessions when the price allowlist is empty. Physical prices also refuse checkout until shipping countries are configured.

## Client integration

Use:

```ts
import { startStripeCheckout } from "@/payments/stripe";

await startStripeCheckout({
  priceId: "price_...",
  quantity: 1,
  orderRef: "4P-ORDER-...",
});
```

The server validates the Price ID against `STRIPE_ALLOWED_PRICE_IDS`, creates the Stripe-hosted Checkout Session, and redirects the browser to Stripe.

## Webhook truth boundary

The webhook verifies Stripe's signature before accepting an event.

Initial observed events include:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `invoice.paid`
- `invoice.payment_failed`
- `charge.refunded`
- `credit_note.created`

The current foundation logs verified event identity/type only. It does not yet create a second payment ledger or pretend fulfilment exists.

Canonical state separation:

`PAYMENT -> ORDER/FULFILMENT -> CREATOR PAYOUT -> IMPACT CONTRIBUTION -> PROVIDER DELIVERY -> EVIDENCE -> OUTCOME`

A successful Stripe payment must never by itself be displayed as a tree planted, plastic removed, restoration completed, creator paid, or ecological outcome verified.

## CRE4TORS later

When external creators become real sellers/beneficiaries:

1. qualify the marketplace legal/economic model;
2. add Stripe Connect;
3. onboard connected accounts/KYC;
4. choose destination charges or separate charges/transfers based on the final merchant-of-record and refund/dispute model;
5. keep creator share, platform share, production cost, tax, and any impact allocation as explicit separate ledger fields.

Do not pre-build Connect before this model is real.

## Test sequence

1. Rotate any test secret that has been exposed in screenshots or chat.
2. Store the replacement test secret only in the Cloudflare server-side environment.
3. Create the first real test Product + Price in Stripe.
4. Add its Price ID to `STRIPE_ALLOWED_PRICE_IDS`.
5. If physical, add it to `STRIPE_PHYSICAL_PRICE_IDS` and configure `STRIPE_SHIPPING_COUNTRIES`.
6. Deploy the branch preview.
7. Register `/api/stripe/webhook` as a Stripe test webhook endpoint and store the returned signing secret as `STRIPE_WEBHOOK_SECRET`.
8. Execute successful, cancelled, failed/asynchronous, refund, and invoice test cases.
9. Verify no Stripe secret exists in the browser bundle, repository, logs, or source maps.
10. Only after test evidence passes, create a separate production activation decision.
