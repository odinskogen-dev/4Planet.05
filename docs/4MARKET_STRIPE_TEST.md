# 4MARKET_ — Stripe Checkout control

Status: TEST INTEGRATION ONLY / NO LIVE COMMERCE

## Current architecture

4MARKET_'s first wedge is a physical fine-art print. Therefore this path uses standard Stripe Payments with Stripe-hosted Checkout. Managed Payments is not used for this physical-goods transaction path.

The current 4MARKET prototype remains DEMO truth. Stripe TEST checkout is isolated from the synthetic creator/Impact ledger and does not promote any DEMO state to real.

## Server endpoint

`POST /api/market-checkout`

Accepted client payload:

```json
{"productId":"print:tidal-memory-01"}
```

The client cannot submit price, currency or Stripe Price ID.

Required server environment:

- `STRIPE_TEST_SECRET_KEY` — must begin `sk_test_`; secret store only.
- `MARKET_STRIPE_TEST_ENABLED=true` — explicit kill-switch release.
- optional `STRIPE_MARKET_TEST_PRICE_TIDAL_MEMORY_01` — test Price override.

If the optional Price is absent, the endpoint uses the existing NOK 1 technical QA Price `price_1U6qNKBIIif9wShMqKsefBys`. That fallback is not the commercial product price.

Shipping-address collection is intentionally restricted to Norway during this technical test.

## Test launcher

`/4market-stripe-test.html`

This route is `noindex,nofollow` and states TEST / NO LIVE COMMERCE explicitly.

## Fail-closed controls

- no live Stripe key accepted by the test endpoint;
- origin allowlist;
- one hard-bounded market product ID;
- server-owned Price ID;
- no amount or currency from browser;
- no live order state mutation;
- Checkout return is not proof of settlement;
- no creator payout, POD job, Impact funding or ecological outcome is inferred.

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
9. webhook-driven order/payment persistence implemented and verified;
10. one end-to-end test transaction and refund flow passes before public release.

## Marketplace boundary

This first release is direct 4PLANET commerce. It does not pay third-party creators through Stripe and does not require Connect yet. If 4MARKET later routes proceeds to independent sellers/creators, Stripe Connect becomes a separate architecture/review gate rather than being silently added to this direct-sale path.
