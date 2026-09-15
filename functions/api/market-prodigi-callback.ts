import {
  constantTimeEqual,
  json,
  prodigiGet,
  resolveMarketCommerceRuntime,
  stripeGet,
  updateStripeSessionMetadata,
  type MarketCommerceEnv,
} from "../_lib/marketCommerce";

type ProdigiShipment = {
  status?: string;
  carrier?: string;
  dispatchDate?: string;
  tracking?: { url?: string | null; number?: string | null } | null;
};
type ProdigiOrder = {
  id?: string;
  merchantReference?: string;
  status?: { stage?: string; issues?: unknown[] };
  shipments?: ProdigiShipment[];
};
type ProdigiResponse = { outcome?: string; order?: ProdigiOrder };
type CallbackEvent = {
  id?: string;
  subject?: string;
  type?: string;
  data?: { order?: ProdigiOrder; id?: string } | ProdigiOrder;
};
type StripeSession = { id?: string; metadata?: Record<string, string> | null };

function callbackOrderId(event: CallbackEvent) {
  if (event.subject?.startsWith("ord_")) return event.subject;
  const data = event.data as { order?: ProdigiOrder; id?: string } | undefined;
  if (data?.order?.id?.startsWith("ord_")) return data.order.id;
  if (data?.id?.startsWith("ord_")) return data.id;
  return null;
}

export const onRequestPost = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> => {
  const { request, env } = ctx;
  const runtime = resolveMarketCommerceRuntime(env);
  const supplied = new URL(request.url).searchParams.get("token") ?? "";
  if (!runtime.callbackToken || !supplied || !constantTimeEqual(supplied, runtime.callbackToken)) {
    return json({ ok: false, error: "invalid_callback_token" }, 401);
  }
  if (!runtime.prodigiConfigured || !runtime.stripeConfigured) return json({ ok: false, error: "commerce_runtime_not_ready" }, 503);

  let event: CallbackEvent;
  try { event = await request.json() as CallbackEvent; } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  const orderId = callbackOrderId(event);
  if (!orderId) return json({ ok: false, error: "prodigi_order_id_missing" }, 400);

  // Do not trust the callback body as fulfilment truth. Read the order back from Prodigi.
  const prodigiResult = await prodigiGet(runtime, `/v4.0/orders/${encodeURIComponent(orderId)}`);
  const prodigi = prodigiResult.payload as ProdigiResponse | null;
  const order = prodigi?.order;
  if (!prodigiResult.ok || !order?.id?.startsWith("ord_") || !order.merchantReference) {
    return json({ ok: false, error: "prodigi_readback_failed" }, 503);
  }

  const sessionId = order.merchantReference;
  const expectedSessionPrefix = runtime.isLive ? "cs_live_" : "cs_test_";
  if (!sessionId.startsWith(expectedSessionPrefix)) return json({ ok: false, error: "invalid_merchant_reference" }, 400);
  const stripeResult = await stripeGet(runtime, `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
  const session = stripeResult.payload as StripeSession | null;
  if (!stripeResult.ok || session?.metadata?.market_integration !== "4market_stripe_prodigi_v1") {
    return json({ ok: false, error: "stripe_market_session_readback_failed" }, 503);
  }

  const shipment = order.shipments?.find((item) => item.tracking?.number || item.tracking?.url) ?? order.shipments?.[0] ?? null;
  const metadata: Record<string, string> = {
    prodigi_order_id: order.id,
    fulfilment_state: order.status?.stage ?? "UNKNOWN",
    fulfilment_provider: "Prodigi",
    prodigi_last_event: event.type ?? "callback",
  };
  if (shipment?.status) metadata.shipment_status = shipment.status;
  if (shipment?.carrier) metadata.shipping_carrier = shipment.carrier;
  if (shipment?.dispatchDate) metadata.dispatch_date = shipment.dispatchDate;
  if (shipment?.tracking?.number) metadata.tracking_number = shipment.tracking.number;
  if (shipment?.tracking?.url) metadata.tracking_url = shipment.tracking.url;

  const metadataWrite = await updateStripeSessionMetadata(runtime, sessionId, metadata);
  if (!metadataWrite.ok) return json({ ok: false, error: "stripe_tracking_write_failed" }, 503);

  return json({
    ok: true,
    received: true,
    orderId: order.id,
    fulfilmentState: order.status?.stage ?? "UNKNOWN",
    trackingLinked: Boolean(shipment?.tracking?.number || shipment?.tracking?.url),
  });
};

export const onRequest = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
