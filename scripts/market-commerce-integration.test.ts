import { createHmac } from "node:crypto";
import { onRequestPost as checkout } from "../functions/api/market-checkout";
import { onRequestPost as webhook } from "../functions/api/market-stripe-webhook";
import { onRequestPost as prodigiCallback } from "../functions/api/market-prodigi-callback";
import { onRequestGet as orderStatus } from "../functions/api/market-order-status";
import type { MarketCommerceEnv } from "../functions/_lib/marketCommerce";

const env: MarketCommerceEnv = {
  MARKET_COMMERCE_ENV: "TEST",
  MARKET_PUBLIC_ORIGIN: "https://4planetmarket.com",
  MARKET_STRIPE_TEST_ENABLED: "true",
  MARKET_FULFILMENT_TEST_ENABLED: "true",
  STRIPE_TEST_SECRET_KEY: "sk_test_market_contract_1234567890",
  STRIPE_MARKET_WEBHOOK_SECRET_TEST: "whsec_market_contract_1234567890",
  PRODIGI_SANDBOX_API_KEY: "prodigi_sandbox_contract_key_1234567890",
  MARKET_PRODIGI_CALLBACK_TOKEN: "market_callback_contract_token_1234567890",
};

const sessionId = "cs_test_4market_contract_001";
const prodigiOrderId = "ord_4market_contract_001";
const productId = "market:odin:reinebringen-vista";
const expectedAmount = 129000;
const expectedSku = "GLOBAL-FAP-8X12";
const prodigiPosts: unknown[] = [];
const stripeMetadataWrites: URLSearchParams[] = [];
let checkoutForm: URLSearchParams | null = null;
let prodigiCreateCount = 0;

const session = {
  id: sessionId,
  object: "checkout.session",
  livemode: false,
  status: "complete",
  payment_status: "paid",
  amount_total: expectedAmount,
  currency: "nok",
  metadata: {
    market_product_id: productId,
    market_product_slug: "reinebringen-vista",
    market_creator: "Odin Oddekalv",
    market_integration: "4market_stripe_prodigi_v1",
    market_environment: "TEST",
    market_canary: "false",
    market_price_nok: "1290",
    prodigi_sku: expectedSku,
    prodigi_sizing: "fitPrintArea",
    print_size: "8 × 12 IN",
    asset_path: "/market/odin/reinebringen-vista.jpg",
    shipping_method: "Standard",
    fulfilment_state: "AWAITING_PAYMENT",
  },
  customer_details: {
    email: "test@example.com",
    name: "Test Customer",
    phone: "+4712345678",
  },
  collected_information: {
    shipping_details: {
      name: "Test Customer",
      address: {
        line1: "Testveien 1",
        line2: null,
        postal_code: "2000",
        city: "Lillestrom",
        state: null,
        country: "NO",
      },
    },
  },
};

const prodigiOrder = {
  id: prodigiOrderId,
  merchantReference: sessionId,
  status: { stage: "InProgress", issues: [], details: { progress: "Printing" } },
  shipments: [{
    id: "shp_contract_001",
    status: "Shipped",
    carrier: "Posten",
    dispatchDate: "2026-09-15T15:00:00Z",
    tracking: { number: "TESTTRACK123", url: "https://tracking.example/TESTTRACK123" },
    fulfillmentLocation: { countryCode: "NO", labCode: "TEST-LAB" },
  }],
};

const originalFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();

  if (url === "https://api.stripe.com/v1/checkout/sessions" && method === "POST") {
    checkoutForm = new URLSearchParams(String(init?.body ?? ""));
    return Response.json({ id: sessionId, url: "https://checkout.stripe.com/c/pay/test_4market_contract", livemode: false });
  }
  if (url === `https://api.stripe.com/v1/checkout/sessions/${sessionId}` && method === "GET") {
    return Response.json(session);
  }
  if (url === `https://api.stripe.com/v1/checkout/sessions/${sessionId}` && method === "POST") {
    stripeMetadataWrites.push(new URLSearchParams(String(init?.body ?? "")));
    return Response.json({ id: sessionId, object: "checkout.session" });
  }
  if (url === "https://api.sandbox.prodigi.com/v4.0/orders" && method === "POST") {
    prodigiCreateCount += 1;
    prodigiPosts.push(JSON.parse(String(init?.body ?? "{}")));
    return Response.json({ outcome: prodigiCreateCount === 1 ? "Created" : "AlreadyExists", order: prodigiOrder });
  }
  if (url === `https://api.sandbox.prodigi.com/v4.0/orders/${prodigiOrderId}` && method === "GET") {
    return Response.json({ outcome: "Ok", order: prodigiOrder });
  }
  throw new Error(`Unexpected fetch ${method} ${url}`);
}) as typeof fetch;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function bodyJson(response: Response) {
  return await response.json() as Record<string, any>;
}

try {
  const checkoutResponse = await checkout({
    env,
    request: new Request("https://4planetmarket.com/api/market-checkout", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://4planetmarket.com" },
      body: JSON.stringify({ productId, attemptId: "contractattempt001" }),
    }),
  });
  const checkoutBody = await bodyJson(checkoutResponse);
  assert(checkoutResponse.status === 200 && checkoutBody.ok === true, "Checkout must be created");
  assert(checkoutForm instanceof URLSearchParams, "Stripe checkout form not captured");
  assert(checkoutForm.get("line_items[0][price_data][unit_amount]") === String(expectedAmount), "Stripe amount mismatch");
  assert(checkoutForm.get("metadata[market_product_id]") === productId, "Stripe product metadata mismatch");
  assert(checkoutForm.get("metadata[prodigi_sku]") === expectedSku, "Stripe SKU metadata mismatch");
  assert(checkoutForm.get("shipping_address_collection[allowed_countries][0]") === "NO", "Checkout shipping boundary must be NO");

  const timestamp = Math.floor(Date.now() / 1000);
  const event = JSON.stringify({
    id: "evt_4market_contract_001",
    type: "checkout.session.completed",
    livemode: false,
    data: { object: { id: sessionId } },
  });
  const signature = createHmac("sha256", env.STRIPE_MARKET_WEBHOOK_SECRET_TEST!).update(`${timestamp}.${event}`).digest("hex");
  const stripeSignature = `t=${timestamp},v1=${signature}`;

  for (let i = 0; i < 2; i += 1) {
    const response = await webhook({
      env,
      request: new Request("https://4planetmarket.com/api/market-stripe-webhook", {
        method: "POST",
        headers: { "Stripe-Signature": stripeSignature, "content-type": "application/json" },
        body: event,
      }),
    });
    const body = await bodyJson(response);
    assert(response.status === 200 && body.ok === true, `Webhook delivery ${i + 1} failed`);
    assert(body.prodigiOrderId === prodigiOrderId, "Webhook must link Prodigi order");
  }

  assert(prodigiPosts.length === 2, "Expected provider to receive retried idempotent request twice");
  const first = prodigiPosts[0] as any;
  const second = prodigiPosts[1] as any;
  assert(first.idempotencyKey === `4market-${sessionId}`, "Prodigi idempotency key wrong");
  assert(second.idempotencyKey === first.idempotencyKey, "Webhook retry changed idempotency key");
  assert(first.merchantReference === sessionId && second.merchantReference === sessionId, "Merchant reference changed on retry");
  assert(first.items?.[0]?.sku === expectedSku, "Prodigi SKU wrong");
  assert(first.items?.[0]?.assets?.[0]?.url === "https://4planetmarket.com/market/odin/reinebringen-vista.jpg", "Prodigi print asset URL wrong");
  assert(first.recipient?.address?.countryCode === "NO" && first.recipient?.address?.postalOrZipCode === "2000", "Prodigi recipient address wrong");

  const callbackResponse = await prodigiCallback({
    env,
    request: new Request(`https://4planetmarket.com/api/market-prodigi-callback?token=${env.MARKET_PRODIGI_CALLBACK_TOKEN}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "cb_001", type: "order.shipment.updated", subject: prodigiOrderId }),
    }),
  });
  const callbackBody = await bodyJson(callbackResponse);
  assert(callbackResponse.status === 200 && callbackBody.ok === true && callbackBody.trackingLinked === true, "Prodigi callback/tracking link failed");

  const statusResponse = await orderStatus({
    env,
    request: new Request(`https://4planetmarket.com/api/market-order-status?session_id=${sessionId}`),
  });
  const statusBody = await bodyJson(statusResponse);
  assert(statusResponse.status === 200 && statusBody.ok === true, "Order status failed");
  assert(statusBody.paymentState === "PAID", "Order status payment truth wrong");
  assert(statusBody.fulfilmentState === "InProgress", "Order status fulfilment truth wrong");
  assert(statusBody.tracking?.number === "TESTTRACK123", "Tracking number missing");
  assert(statusBody.tracking?.url === "https://tracking.example/TESTTRACK123", "Tracking URL missing");
  assert(stripeMetadataWrites.some(params => params.get("metadata[prodigi_order_id]") === prodigiOrderId), "Prodigi order was not linked back to Stripe metadata");
  assert(stripeMetadataWrites.some(params => params.get("metadata[tracking_number]") === "TESTTRACK123"), "Tracking was not linked back to Stripe metadata");

  const badSignatureResponse = await webhook({
    env,
    request: new Request("https://4planetmarket.com/api/market-stripe-webhook", {
      method: "POST",
      headers: { "Stripe-Signature": `t=${timestamp},v1=deadbeef`, "content-type": "application/json" },
      body: event,
    }),
  });
  assert(badSignatureResponse.status === 400, "Invalid Stripe signature must fail closed");

  console.log("PASS — simulated E2E: catalogue → Stripe amount/SKU → signed paid webhook → idempotent Prodigi order → provider readback → tracking/customer status.");
} finally {
  globalThis.fetch = originalFetch;
}
