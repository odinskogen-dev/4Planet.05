# 4MARKET_ — Stripe Checkout control

Status: TEST INTEGRATION ONLY / NO LIVE COMMERCE

## Current architecture

4MARKET_'s first wedge is a physical fine-art photography print. Therefore this path uses standard Stripe Payments with Stripe-hosted Checkout. Managed Payments is not used for this physical-goods transaction path.

Founder-selected launch works:

- `photo:arctic-white-angel-01` — Arctic White Angel — current controlled Checkout canary.
- `photo:mulafossur-01` — Mulafossur — second launch candidate; commercial checkout not enabled yet.

The current 4MARKET prototype remains DEMO truth. Stripe TEST checkout is isolated from the synthetic creator/Impact ledger and does not promote any DEMO state to real.

## Checkout endpoint

`POST /api/market-checkout`

Accepted client payload:

```json
{"productId":"photo:arctic-white-angel-01"}
```

The client cannot submit price, currency or Stripe Price ID.

The canary amount is server-owned at **NOK 3.00**. Stripe's published minimum card charge for NOK is NOK 3, so a NOK 1 Checkout canary is not valid.

Required server environment:

- `STRIPE_TEST_SECRET_KEY` — must begin `sk_test_`; secret store only.
- `MARKET_STRIPE_TEST_ENABLED=true` — explicit kill-switch release.

Shipping-address collection is intentionally restricted to Norway during this technical test.

## Verified order confirmation

`GET /api/market-order-status?session_id=cs_test_...`

The browser redirect is never treated as payment proof. The server retrieves the Checkout Session directly from Stripe and confirms only when all are true:

- session is TEST mode;
- `status=complete`;
- `payment_status=paid`;
- currency is NOK;
- total is exactly NOK 3.00;
- metadata binds the session to `photo:arctic-white-angel-01` and `4market_test_checkout`.

The test launcher renders `PAYMENT CONFIRMED` only after this server-side verification.

## Signed webhook gate

`POST /api/market-stripe-webhook`

Required additional environment:

- `STRIPE_MARKET_TEST_WEBHOOK_SECRET` — Stripe webhook signing secret (`whsec_...`).

The endpoint:

- verifies the raw Stripe payload using `Stripe-Signature` HMAC-SHA256;
- enforces a 5-minute timestamp tolerance;
- rejects live events;
- accepts completion only for the bounded product, amount and integration metadata;
- emits `PAYMENT_CAPTURED` only after a paid Checkout completion event;
- otherwise emits `NO_PRODUCTION_AUTHORITY`.

For the controlled first canary, Stripe itself plus the server-verified Session is sufficient to prove the payment path. Durable internal order persistence remains a separate live-commerce release gate before automated fulfilment.

## Test launcher

`/4market-stripe-test.html`

This route is `noindex,nofollow`, states TEST / NO LIVE COMMERCE explicitly, launches the NOK 3 Stripe Checkout canary, then verifies the returned session server-side.

## Fail-closed controls

- no live Stripe key accepted by the test endpoint;
- host/origin allowlist;
- one hard-bounded market product ID;
- server-owned amount and currency;
- no live order state mutation;
- Checkout redirect is not proof of settlement;
- no creator payout, POD job, Impact funding or ecological outcome is inferred;
- no production action is authorised unless payment is verified.

## Live release gates

Do not activate a live 4MARKET purchase until all are closed:

1. actual creator and product approved, with rights evidence;
2. physical print/POD provider and product quality validated;
3. exact customer price and unit economics approved;
4. tax/VAT/accounting treatment confirmed for the exact transaction;
5. shipping geography, shipping price, returns/refunds and customer terms defined;
6. if an Impact Contract is sold/represented, one real provider/pathway is approved and evidence/claim rules are explicit;
7. live Stripe Product/Price created in the verified live account;
8. live Stripe secret stored in deployment secret store — never repository/browser/chat;
9. webhook-driven durable order/payment persistence implemented and verified;
10. one end-to-end live canary transaction and refund flow passes before public release.

## Marketplace boundary

This first release is direct 4PLANET commerce. It does not pay third-party creators through Stripe and does not require Connect yet. If 4MARKET later routes proceeds to independent sellers/creators, Stripe Connect becomes a separate architecture/review gate rather than being silently added to this direct-sale path.
