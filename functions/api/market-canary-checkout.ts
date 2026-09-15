import { createMarketCheckoutSession } from "../_lib/createMarketCheckout";
import {
  constantTimeEqual,
  json,
  productCanCanary,
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
  if (!runtime.isLive || !runtime.canaryEnabled || !runtime.canaryToken) return json({ ok: false, error: "live_canary_closed" }, 503);

  let body: { productId?: unknown; attemptId?: unknown; token?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  const token = typeof body.token === "string" ? body.token : "";
  if (!token || !constantTimeEqual(token, runtime.canaryToken)) return json({ ok: false, error: "invalid_canary_token" }, 401);

  const product = requireMarketProduct(body.productId);
  if (!product) return json({ ok: false, error: "unsupported_market_product" }, 400);
  if (!productCanCanary(product, env)) return json({ ok: false, error: "live_canary_infrastructure_not_ready" }, 503);

  const result = await createMarketCheckoutSession({
    runtime,
    product,
    origin: runtime.publicOrigin,
    attemptId: safeAttemptId(body.attemptId),
    canary: true,
  });
  const stripe = result.payload as { id?: string; url?: string; livemode?: boolean; error?: { type?: string } } | null;
  if (!result.ok || !stripe?.id?.startsWith("cs_live_") || !stripe.url || stripe.livemode !== true) {
    return json({ ok: false, error: "stripe_live_canary_create_failed", stripeType: stripe?.error?.type ?? null }, 502);
  }

  return json({
    ok: true,
    environment: "LIVE",
    canary: true,
    sessionId: stripe.id,
    url: stripe.url,
    productId: product.id,
    amountNok: product.commerce.candidatePriceNok,
    warning: "This checkout captures a real payment and, after payment, creates a real Prodigi fulfilment order.",
  });
};

export const onRequest = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
