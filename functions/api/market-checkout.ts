type MarketProductId = "photo:arctic-white-angel-01";

interface Env {
  STRIPE_TEST_SECRET_KEY?: string;
  MARKET_STRIPE_TEST_ENABLED?: string;
}

const MARKET_PRODUCT: MarketProductId = "photo:arctic-white-angel-01";
const TEST_AMOUNT_MINOR = 300; // NOK 3.00 — Stripe minimum for NOK card charges.
const TEST_CURRENCY = "nok";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

function allowedOrigin(origin: string) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return false;
    return (
      url.hostname === "4planetmarket.com" ||
      url.hostname === "www.4planetmarket.com" ||
      url.hostname === "cre4tors.com" ||
      url.hostname === "www.cre4tors.com" ||
      url.hostname.endsWith(".4planet-05.pages.dev") ||
      url.hostname === "localhost"
    );
  } catch {
    return false;
  }
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const origin = request.headers.get("origin") ?? "";

  if (!allowedOrigin(origin)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  if (env.MARKET_STRIPE_TEST_ENABLED !== "true") {
    return json({ ok: false, error: "market_stripe_test_disabled" }, 503);
  }

  const secret = env.STRIPE_TEST_SECRET_KEY?.trim();
  if (!secret || !secret.startsWith("sk_test_")) {
    return json({ ok: false, error: "stripe_test_secret_missing" }, 503);
  }

  let body: { productId?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (body.productId !== MARKET_PRODUCT) {
    return json({ ok: false, error: "unsupported_market_product" }, 400);
  }

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price_data][currency]", TEST_CURRENCY);
  form.set("line_items[0][price_data][unit_amount]", String(TEST_AMOUNT_MINOR));
  form.set("line_items[0][price_data][product_data][name]", "Arctic White Angel — 4MARKET Checkout Canary (TEST)");
  form.set(
    "line_items[0][price_data][product_data][description]",
    "Technical payment-path validation only. This is not the commercial fine-art print price.",
  );
  form.set("line_items[0][quantity]", "1");
  form.set("customer_creation", "always");
  form.set("billing_address_collection", "auto");
  form.set("shipping_address_collection[allowed_countries][0]", "NO");
  form.set(
    "success_url",
    `${origin}/4market-stripe-test.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
  );
  form.set("cancel_url", `${origin}/4market-stripe-test.html?checkout=cancel`);
  form.set("metadata[market_product_id]", MARKET_PRODUCT);
  form.set("metadata[truth_state]", "DEMO");
  form.set("metadata[integration]", "4market_test_checkout");
  form.set("metadata[test_amount_nok]", "3");
  form.set("payment_intent_data[metadata][market_product_id]", MARKET_PRODUCT);
  form.set("payment_intent_data[metadata][truth_state]", "DEMO");
  form.set("payment_intent_data[metadata][integration]", "4market_test_checkout");

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form,
  });

  const stripePayload = (await stripeResponse.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string; type?: string };
  };

  if (!stripeResponse.ok || !stripePayload.url || !stripePayload.id?.startsWith("cs_test_")) {
    return json(
      {
        ok: false,
        error: "stripe_checkout_create_failed",
        stripeType: stripePayload.error?.type ?? null,
      },
      502,
    );
  }

  return json({
    ok: true,
    mode: "test",
    sessionId: stripePayload.id,
    url: stripePayload.url,
    productId: MARKET_PRODUCT,
    amountNok: 3,
  });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
