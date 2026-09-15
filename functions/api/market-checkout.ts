import { createMarketCheckoutSession } from "../_lib/createMarketCheckout";
import {
  isAllowedMarketOrigin,
  json,
  productCanCheckout,
  requireMarketProduct,
  resolveMarketCommerceRuntime,
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
    return json({ ok: false, error: runtime.isLive ? "market_product_not_released" : "market_checkout_not_ready", environment: runtime.mode }, 503);
  }

  const result = await createMarketCheckoutSession({
    runtime,
    product,
    origin,
    attemptId: safeAttemptId(body.attemptId),
  });
  const stripe = result.payload as { id?: string; url?: string; livemode?: boolean; error?: { type?: string } } | null;
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
