import {
  isAllowedMarketOrigin,
  json,
  productCanCheckout,
  requireMarketProduct,
  resolveMarketCommerceRuntime,
  stripePostForm,
  type MarketCommerceEnv,
} from "../_lib/marketCommerce";

function safeAttemptId(value: unknown) {
  if (typeof value !== "string") return crypto.randomUUID();
  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{8,80}$/.test(trimmed) ? trimmed : crypto.randomUUID();
}

export const onRequestPost = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> => {
  const { request, env } = ctx;
  const runtime = resolveMarketCommerceRuntime(env);
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  if (!isAllowedMarketOrigin(origin, runtime.mode)) return json({ ok: false, error: "origin_not_allowed" }, 403);

  let body: { productId?: unknown; attemptId?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  const product = requireMarketProduct(body.productId);
  if (!product) return json({ ok: false, error: "unsupported_market_product" }, 400);
  if (!productCanCheckout(product, env)) {
    return json({
      ok: false,
      error: runtime.isLive ? "market_product_not_released" : "market_checkout_not_ready",
      environment: runtime.mode,
    }, 503);
  }

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price_data][currency]", "nok");
  form.set("line_items[0][price_data][unit_amount]", String(product.commerce.candidatePriceNok * 100));
  form.set("line_items[0][price_data][product_data][name]", `${product.title} — ${product.creator}`);
  form.set("line_items[0][price_data][product_data][description]", `${product.productType} · ${product.commerce.printSize} · Enhanced Matte Art Paper · standard shipping in Norway included.`);
  form.set("line_items[0][quantity]", "1");
  form.set("customer_creation", "always");
  form.set("billing_address_collection", "auto");
  form.set("shipping_address_collection[allowed_countries][0]", "NO");
  form.set("phone_number_collection[enabled]", "true");
  form.set("consent_collection[terms_of_service]", "required");
  form.set("success_url", `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/?checkout=cancel&product=${encodeURIComponent(product.slug)}`);
  form.set("client_reference_id", product.id);
  form.set("custom_text[submit][message]", runtime.isLive
    ? "Your print will be produced on demand and shipped to the Norwegian delivery address entered here."
    : "TEST MODE — validates payment and fulfilment integration. No public sale is released by this checkout.");

  const metadata: Record<string, string> = {
    market_product_id: product.id,
    market_product_slug: product.slug,
    market_creator: product.creator,
    market_integration: "4market_stripe_prodigi_v1",
    market_environment: runtime.mode,
    market_price_nok: String(product.commerce.candidatePriceNok),
    prodigi_sku: product.commerce.podSku,
    prodigi_sizing: product.commerce.podSizing,
    print_size: product.commerce.printSize,
    asset_path: product.imageUrl,
    shipping_method: product.commerce.shippingMethod,
    fulfilment_state: "AWAITING_PAYMENT",
  };
  for (const [key, value] of Object.entries(metadata)) {
    form.set(`metadata[${key}]`, value);
    form.set(`payment_intent_data[metadata][${key}]`, value);
  }

  const attemptId = safeAttemptId(body.attemptId);
  const result = await stripePostForm(
    runtime,
    "/v1/checkout/sessions",
    form,
    `4market_${runtime.mode.toLowerCase()}_${product.slug}_${attemptId}`,
  );
  const stripe = result.payload as { id?: string; url?: string; livemode?: boolean; payment_status?: string; error?: { type?: string } } | null;
  const expectedPrefix = runtime.isLive ? "cs_live_" : "cs_test_";
  if (!result.ok || !stripe?.id?.startsWith(expectedPrefix) || !stripe.url || stripe.livemode !== runtime.isLive) {
    return json({ ok: false, error: "stripe_checkout_create_failed", stripeType: stripe?.error?.type ?? null }, 502);
  }

  return json({
    ok: true,
    environment: runtime.mode,
    sessionId: stripe.id,
    url: stripe.url,
    productId: product.id,
    amountNok: product.commerce.candidatePriceNok,
    currency: "NOK",
    fulfilment: "Prodigi POD",
    shippingCountry: "NO",
  });
};

export const onRequest = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
