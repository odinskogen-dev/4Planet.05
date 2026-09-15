import {
  json,
  productAssetUrl,
  prodigiCallbackUrl,
  prodigiPost,
  requireMarketProduct,
  resolveMarketCommerceRuntime,
  stripeGet,
  updateStripeSessionMetadata,
  verifyStripeSignature,
  type MarketCommerceEnv,
} from "../_lib/marketCommerce";

type Address = {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};
type ShippingDetails = { name?: string | null; address?: Address | null };
type StripeSession = {
  id?: string;
  object?: string;
  livemode?: boolean;
  status?: string;
  payment_status?: string;
  amount_total?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
  customer_details?: { email?: string | null; name?: string | null; phone?: string | null; address?: Address | null } | null;
  shipping_details?: ShippingDetails | null;
  collected_information?: { shipping_details?: ShippingDetails | null } | null;
};
type StripeEvent = { id?: string; type?: string; livemode?: boolean; data?: { object?: StripeSession } };
type ProdigiOrder = { id?: string; merchantReference?: string; status?: { stage?: string; issues?: unknown[] } };
type ProdigiCreate = { outcome?: string; order?: ProdigiOrder };

function shippingFromSession(session: StripeSession) {
  return session.collected_information?.shipping_details ?? session.shipping_details ?? null;
}

function orderRecipient(session: StripeSession) {
  const shipping = shippingFromSession(session);
  const address = shipping?.address ?? session.customer_details?.address ?? null;
  if (!address?.line1 || !address.postal_code || !address.city || address.country !== "NO") return null;
  return {
    name: shipping?.name || session.customer_details?.name || "4MARKET customer",
    email: session.customer_details?.email || undefined,
    phoneNumber: session.customer_details?.phone || undefined,
    address: {
      line1: address.line1,
      line2: address.line2 || undefined,
      postalOrZipCode: address.postal_code,
      countryCode: "NO",
      townOrCity: address.city,
      stateOrCounty: address.state || undefined,
    },
  };
}

async function loadAuthoritativeSession(runtime: ReturnType<typeof resolveMarketCommerceRuntime>, id: string) {
  const response = await stripeGet(runtime, `/v1/checkout/sessions/${encodeURIComponent(id)}`);
  return response.ok ? response.payload as StripeSession : null;
}

export const onRequestPost = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> => {
  const { request, env } = ctx;
  const runtime = resolveMarketCommerceRuntime(env);
  if (!runtime.webhookConfigured || !runtime.stripeWebhookSecret) return json({ ok: false, error: "stripe_webhook_not_configured" }, 503);

  const signature = request.headers.get("Stripe-Signature") ?? request.headers.get("stripe-signature") ?? "";
  const rawBody = await request.text();
  if (!(await verifyStripeSignature(rawBody, signature, runtime.stripeWebhookSecret))) return json({ ok: false, error: "invalid_signature" }, 400);

  let event: StripeEvent;
  try { event = JSON.parse(rawBody) as StripeEvent; } catch { return json({ ok: false, error: "invalid_event_json" }, 400); }
  if (event.livemode !== runtime.isLive) return json({ ok: false, error: "environment_mismatch" }, 400);
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return json({ ok: true, received: true, action: "ignored" });
  }

  const sessionId = event.data?.object?.id ?? "";
  const expectedPrefix = runtime.isLive ? "cs_live_" : "cs_test_";
  if (!sessionId.startsWith(expectedPrefix)) return json({ ok: false, error: "invalid_market_session" }, 400);

  const session = await loadAuthoritativeSession(runtime, sessionId);
  if (!session) return json({ ok: false, error: "stripe_session_lookup_failed" }, 503);
  if (session.payment_status !== "paid" || session.status !== "complete") return json({ ok: true, received: true, action: "payment_not_settled" });
  if (session.metadata?.market_integration !== "4market_stripe_prodigi_v1") return json({ ok: true, received: true, action: "not_market_commerce" });

  const product = requireMarketProduct(session.metadata?.market_product_id);
  if (!product) return json({ ok: false, error: "unknown_market_product" }, 503);
  const isCanary = session.metadata?.market_canary === "true";
  const expectedPriceNok = isCanary && runtime.canaryPriceNok
    ? runtime.canaryPriceNok
    : product.commerce.candidatePriceNok;
  const metadataPriceNok = Number(session.metadata?.market_price_nok ?? NaN);
  const amountOk = session.amount_total === expectedPriceNok * 100
    && metadataPriceNok === expectedPriceNok
    && session.currency?.toLowerCase() === "nok";
  if (!amountOk) return json({ ok: false, error: "market_amount_mismatch" }, 503);

  const fulfilmentAllowed = isCanary
    ? runtime.canaryEnabled && runtime.providerFulfilmentReady
    : runtime.fulfilmentInfrastructureReady;
  if (!fulfilmentAllowed || !runtime.prodigiConfigured) {
    return json({ ok: false, error: isCanary ? "live_canary_fulfilment_not_ready" : "prodigi_fulfilment_not_ready" }, 503);
  }

  const recipient = orderRecipient(session);
  if (!recipient) return json({ ok: false, error: "norwegian_shipping_address_missing" }, 503);
  const callbackUrl = prodigiCallbackUrl(env);
  if (!callbackUrl) return json({ ok: false, error: "prodigi_callback_not_ready" }, 503);

  const item: Record<string, unknown> = {
    merchantReference: product.id,
    sku: product.commerce.podSku,
    copies: 1,
    sizing: product.commerce.podSizing,
    assets: [{ printArea: "default", url: productAssetUrl(product, env) }],
  };
  if (!isCanary) {
    item.recipientCost = { amount: product.commerce.candidatePriceNok.toFixed(2), currency: "NOK" };
  }

  const prodigiResult = await prodigiPost(runtime, "/v4.0/orders", {
    merchantReference: sessionId,
    idempotencyKey: `4market-${sessionId}`,
    shippingMethod: product.commerce.shippingMethod.toLowerCase(),
    callbackUrl,
    recipient,
    items: [item],
    metadata: {
      stripeSessionId: sessionId,
      marketProductId: product.id,
      marketEnvironment: runtime.mode,
      marketCanary: isCanary,
    },
  });
  const prodigi = prodigiResult.payload as ProdigiCreate | null;
  const acceptableOutcome = ["created", "alreadyexists", "onhold"].includes(String(prodigi?.outcome ?? "").replace(/\s/g, "").toLowerCase());
  const prodigiOrderId = prodigi?.order?.id ?? "";
  if (!prodigiResult.ok || !acceptableOutcome || !prodigiOrderId.startsWith("ord_")) {
    await updateStripeSessionMetadata(runtime, sessionId, { fulfilment_state: "PRODIGI_CREATE_FAILED" });
    return json({ ok: false, error: "prodigi_order_create_failed", prodigiOutcome: prodigi?.outcome ?? null }, 503);
  }

  const metadataWrite = await updateStripeSessionMetadata(runtime, sessionId, {
    prodigi_order_id: prodigiOrderId,
    fulfilment_state: prodigi?.order?.status?.stage ?? "ORDER_CREATED",
    fulfilment_provider: "Prodigi",
  });
  if (!metadataWrite.ok) return json({ ok: false, error: "stripe_fulfilment_link_failed" }, 503);

  return json({
    ok: true,
    received: true,
    canary: isCanary,
    paymentState: "PAID",
    fulfilmentState: prodigi?.order?.status?.stage ?? "ORDER_CREATED",
    prodigiOrderId,
  });
};

export const onRequest = async (ctx: { request: Request; env: MarketCommerceEnv }): Promise<Response> =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
