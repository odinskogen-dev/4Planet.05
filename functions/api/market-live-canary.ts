interface Env {
  STRIPE_LIVE_SECRET_KEY?: string;
  MARKET_STRIPE_LIVE_CANARY_ENABLED?: string;
}

const PRODUCT_ID = "photo:arctic-white-angel-01";
const AMOUNT_MINOR = 300; // NOK 3.00 — Stripe minimum for NOK card charges.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function allowedOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return (
      url.protocol === "https:" &&
      (url.hostname === "4planetmarket.com" ||
        url.hostname === "www.4planetmarket.com" ||
        url.hostname.endsWith(".4planet-05.pages.dev"))
    );
  } catch {
    return false;
  }
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const origin = request.headers.get("origin") ?? "";

  if (!allowedOrigin(origin)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  if (env.MARKET_STRIPE_LIVE_CANARY_ENABLED !== "true") {
    return json({ ok: false, error: "live_canary_disabled" }, 503);
  }

  const secret = env.STRIPE_LIVE_SECRET_KEY?.trim();
  if (!secret || !secret.startsWith("sk_live_")) {
    return json({ ok: false, error: "stripe_live_secret_missing" }, 503);
  }

  let body: { productId?: string; acknowledge?: boolean };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (body.productId !== PRODUCT_ID || body.acknowledge !== true) {
    return json({ ok: false, error: "canary_acknowledgement_required" }, 400);
  }

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price_data][currency]", "nok");
  form.set("line_items[0][price_data][unit_amount]", String(AMOUNT_MINOR));
  form.set("line_items[0][price_data][product_data][name]", "4MARKET Live Payment Canary — Arctic White Angel");
  form.set(
    "line_items[0][price_data][product_data][description]",
    "LIVE NOK 3 payment-path validation. This does not purchase a physical print and triggers no fulfilment.",
  );
  form.set("line_items[0][quantity]", "1");
  form.set("customer_creation", "always");
  form.set("billing_address_collection", "auto");
  form.set("phone_number_collection[enabled]", "true");
  form.set("consent_collection[terms_of_service]", "required");
  form.set(
    "custom_text[submit][message]",
    "LIVE PAYMENT CANARY — NOK 3. No print will be produced or shipped from this transaction.",
  );
  form.set(
    "success_url",
    `${origin}/4market-live-canary.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
  );
  form.set("cancel_url", `${origin}/4market-live-canary.html?checkout=cancel`);
  form.set("metadata[market_product_id]", PRODUCT_ID);
  form.set("metadata[integration]", "4market_live_canary");
  form.set("metadata[fulfilment_authority]", "none");
  form.set("metadata[canary_amount_nok]", "3");
  form.set("payment_intent_data[metadata][market_product_id]", PRODUCT_ID);
  form.set("payment_intent_data[metadata][integration]", "4market_live_canary");
  form.set("payment_intent_data[metadata][fulfilment_authority]", "none");

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
    livemode?: boolean;
    error?: { type?: string };
  };

  if (
    !stripeResponse.ok ||
    !stripePayload.url ||
    !stripePayload.id?.startsWith("cs_live_") ||
    stripePayload.livemode !== true
  ) {
    return json(
      { ok: false, error: "live_checkout_create_failed", stripeType: stripePayload.error?.type ?? null },
      502,
    );
  }

  return json({
    ok: true,
    mode: "live_canary",
    amountNok: 3,
    productId: PRODUCT_ID,
    sessionId: stripePayload.id,
    url: stripePayload.url,
  });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
