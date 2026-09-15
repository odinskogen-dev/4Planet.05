import {
  json,
  prodigiGet,
  requireMarketProduct,
  resolveMarketCommerceRuntime,
  stripeGet,
  type MarketCommerceEnv,
} from "../_lib/marketCommerce";

type StripeSession = {
  id?: string;
  status?: string;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
  livemode?: boolean;
  metadata?: Record<string, string> | null;
};
type ProdigiShipment = {
  id?: string;
  status?: string;
  carrier?: string;
  dispatchDate?: string;
  tracking?: { url?: string | null; number?: string | null } | null;
  fulfillmentLocation?: { countryCode?: string | null; labCode?: string | null } | null;
};
type ProdigiOrder = {
  id?: string;
  merchantReference?: string;
  status?: { stage?: string; issues?: unknown[]; details?: Record<string, string> };
  shipments?: ProdigiShipment[];
};
type ProdigiResponse = { outcome?: string; order?: ProdigiOrder };

function allowedHost(hostname: string) {
  return hostname === "4planetmarket.com" || hostname === "www.4planetmarket.com" || hostname.endsWith(".4planet-05.pages.dev") || hostname === "localhost";
}

export const onRequestGet = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  if (!allowedHost(url.hostname)) return json({ ok: false, error: "host_not_allowed" }, 403);

  const runtime = resolveMarketCommerceRuntime(env);
  if (!runtime.stripeConfigured) return json({ ok: false, error: "stripe_runtime_not_configured" }, 503);
  const sessionId = url.searchParams.get("session_id")?.trim() ?? "";
  const expectedPrefix = runtime.isLive ? "cs_live_" : "cs_test_";
  if (!sessionId.startsWith(expectedPrefix)) return json({ ok: false, error: "invalid_market_session" }, 400);

  const stripeResult = await stripeGet(runtime, `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
  const session = stripeResult.payload as StripeSession | null;
  if (!stripeResult.ok || !session) return json({ ok: false, error: "stripe_session_lookup_failed" }, 502);
  if (session.metadata?.market_integration !== "4market_stripe_prodigi_v1") return json({ ok: false, error: "not_market_commerce_session" }, 400);

  const product = requireMarketProduct(session.metadata?.market_product_id);
  if (!product) return json({ ok: false, error: "unknown_market_product" }, 400);
  const paymentConfirmed = session.status === "complete" && session.payment_status === "paid";
  const prodigiOrderId = session.metadata?.prodigi_order_id ?? null;

  if (!prodigiOrderId || !runtime.prodigiConfigured) {
    return json({
      ok: true,
      environment: runtime.mode,
      sessionId,
      productId: product.id,
      title: product.title,
      creator: product.creator,
      amountNok: typeof session.amount_total === "number" ? session.amount_total / 100 : null,
      currency: session.currency?.toUpperCase() ?? null,
      paymentState: paymentConfirmed ? "PAID" : String(session.payment_status ?? session.status ?? "UNKNOWN").toUpperCase(),
      fulfilmentState: prodigiOrderId ? "PROVIDER_STATUS_UNAVAILABLE" : paymentConfirmed ? "AWAITING_PRODUCTION_ORDER" : "AWAITING_PAYMENT",
      prodigiOrderId,
      tracking: null,
    });
  }

  const prodigiResult = await prodigiGet(runtime, `/v4.0/orders/${encodeURIComponent(prodigiOrderId)}`);
  const prodigi = prodigiResult.payload as ProdigiResponse | null;
  const order = prodigi?.order;
  if (!prodigiResult.ok || !order || order.merchantReference !== sessionId) {
    return json({ ok: false, error: "prodigi_order_lookup_failed", paymentState: paymentConfirmed ? "PAID" : "NOT_CONFIRMED" }, 502);
  }

  const shipment = order.shipments?.find((item) => item.tracking?.url || item.tracking?.number) ?? order.shipments?.[0] ?? null;
  return json({
    ok: true,
    environment: runtime.mode,
    sessionId,
    productId: product.id,
    title: product.title,
    creator: product.creator,
    amountNok: typeof session.amount_total === "number" ? session.amount_total / 100 : null,
    currency: session.currency?.toUpperCase() ?? null,
    paymentState: paymentConfirmed ? "PAID" : String(session.payment_status ?? session.status ?? "UNKNOWN").toUpperCase(),
    fulfilmentState: order.status?.stage ?? "UNKNOWN",
    fulfilmentDetails: order.status?.details ?? null,
    issues: order.status?.issues ?? [],
    prodigiOrderId: order.id ?? prodigiOrderId,
    tracking: shipment ? {
      status: shipment.status ?? null,
      carrier: shipment.carrier ?? null,
      dispatchDate: shipment.dispatchDate ?? null,
      number: shipment.tracking?.number ?? null,
      url: shipment.tracking?.url ?? null,
      fulfilmentCountry: shipment.fulfillmentLocation?.countryCode ?? null,
    } : null,
  });
};

export const onRequest = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> =>
  ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
