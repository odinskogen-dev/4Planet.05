import { CATALOG, readCatalogKey, resolveEnvironment, resolvePriceId, type StripeEnv } from "./catalog";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

type StripePrice = {
  id?: string;
  livemode?: boolean;
  currency?: string;
  unit_amount?: number | null;
  recurring?: { interval?: string; interval_count?: number } | null;
  product?: string | { id?: string; name?: string; description?: string | null; active?: boolean };
};

export const onRequestGet = async (ctx: { request: Request; env: StripeEnv }) => {
  const url = new URL(ctx.request.url);
  const productKey = readCatalogKey(url.searchParams.get("productKey"));
  if (!productKey) return json({ ok: false, error: "unsupported_product" }, 400);
  const entry = CATALOG[productKey];
  if (entry.channel !== "checkout") return json({ ok: false, error: "invoice_offer_not_public" }, 400);

  const runtime = resolveEnvironment(ctx.env);
  if (!runtime.enabled) return json({ ok: false, error: runtime.environment === "LIVE" ? "stripe_live_checkout_disabled" : "stripe_test_checkout_disabled" }, 503);
  if (!runtime.secret || !runtime.secret.startsWith(runtime.expectedSecretPrefix)) return json({ ok: false, error: "stripe_secret_missing" }, 503);
  const priceId = resolvePriceId(entry, ctx.env, runtime.environment);
  if (!priceId) return json({ ok: false, error: "price_not_configured" }, 503);

  const response = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}?expand[]=product`, {
    headers: { authorization: `Bearer ${runtime.secret}` },
  });
  const price = await response.json().catch(() => null) as StripePrice | null;
  if (!response.ok || !price?.id || price.livemode !== runtime.livemode || typeof price.unit_amount !== "number") {
    return json({ ok: false, error: "stripe_price_unavailable" }, 502);
  }

  const product = typeof price.product === "object" ? price.product : null;
  return json({
    ok: true,
    environment: runtime.environment,
    productKey: entry.key,
    productKind: entry.kind,
    productFamily: entry.family,
    checkoutMode: entry.mode,
    name: product?.name ?? entry.key,
    description: product?.description ?? null,
    unitAmount: price.unit_amount,
    currency: price.currency ?? "nok",
    recurring: price.recurring ? { interval: price.recurring.interval ?? null, intervalCount: price.recurring.interval_count ?? 1 } : null,
    maxQuantity: entry.maxQuantityPerCheckout,
    taxDeductibleClaim: false,
    ecologicalDeliveryAuthority: "none",
    legalVersion: "2026-08-24",
  });
};

export const onRequest = (ctx: { request: Request; env: StripeEnv }) =>
  ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
