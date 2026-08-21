type MarketProductId = "print:tidal-memory-01";

interface Env {
  STRIPE_TEST_SECRET_KEY?: string;
  STRIPE_MARKET_TEST_PRICE_TIDAL_MEMORY_01?: string;
  MARKET_STRIPE_TEST_ENABLED?: string;
}

const FALLBACK_TEST_PRICE = "price_1U6qNKBIIif9wShMqKsefBys";
const MARKET_PRODUCT: MarketProductId = "print:tidal-memory-01";

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

  const price = env.STRIPE_MARKET_TEST_PRICE_TIDAL_MEMORY_01?.trim() || FALLBACK_TEST_PRICE;
  if (!price.startsWith("price_")) return json({ ok: false, error: "stripe_test_price_invalid" }, 503);

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price]", price);
  form.set("line_items[0][quantity]", "1");
  form.set("customer_creation", "always");
  form.set("billing_address_collection", "auto");
  form.set("shipping_address_collection[allowed_countries][0]", "NO");
  form.set("success_url", `${origin}/?stripe_test=1&checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/?stripe_test=1&checkout=cancel`);
  form.set("metadata[market_product_id]", MARKET_PRODUCT);
  form.set("metadata[truth_state]", "DEMO");
  form.set("metadata[integration]", "4market_test_checkout");
  form.set("payment_intent_data[metadata][market_product_id]", MARKET_PRODUCT);
  form.set("payment_intent_data[metadata][truth_state]", "DEMO");

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

  if (!stripeResponse.ok || !stripePayload.url) {
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
  });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
