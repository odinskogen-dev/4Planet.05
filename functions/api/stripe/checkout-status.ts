import { CATALOG, readCatalogKey, resolveEnvironment, type StripeEnv } from "./catalog";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function allowedHost(hostname: string) {
  return hostname === "4planet.org" || hostname === "www.4planet.org" || hostname.endsWith(".4planet-05.pages.dev") || hostname === "localhost";
}

type StripeCheckoutSession = {
  id?: string;
  status?: string;
  payment_status?: string;
  mode?: string;
  livemode?: boolean;
  amount_total?: number | null;
  currency?: string | null;
  customer?: string | null;
  subscription?: string | null;
  created?: number;
  customer_details?: { email?: string | null; name?: string | null } | null;
  metadata?: Record<string, string> | null;
  error?: { type?: string };
};

export const onRequestGet = async (ctx: { request: Request; env: StripeEnv }): Promise<Response> => {
  const { request, env } = ctx;
  const requestUrl = new URL(request.url);
  if (!allowedHost(requestUrl.hostname)) return json({ ok: false, error: "host_not_allowed" }, 403);

  const runtime = resolveEnvironment(env);
  if (!runtime.enabled) return json({ ok: false, error: runtime.environment === "LIVE" ? "stripe_live_checkout_disabled" : "stripe_test_checkout_disabled" }, 503);
  if (!runtime.secret || !runtime.secret.startsWith(runtime.expectedSecretPrefix)) return json({ ok: false, error: "stripe_secret_missing" }, 503);

  const sessionId = requestUrl.searchParams.get("session_id")?.trim() ?? "";
  if (!sessionId.startsWith(runtime.expectedSessionPrefix)) return json({ ok: false, error: "invalid_checkout_session" }, 400);

  const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { authorization: `Bearer ${runtime.secret}` },
  });
  const session = await stripeResponse.json().catch(() => null) as StripeCheckoutSession | null;
  if (!stripeResponse.ok || !session) return json({ ok: false, error: "stripe_session_lookup_failed", stripeType: session?.error?.type ?? null }, 502);

  const rawProductKey = session.metadata?.["4planet_product_key"] ?? null;
  const productKey = readCatalogKey(rawProductKey);
  const entry = productKey ? CATALOG[productKey] : null;
  const productKind = session.metadata?.product_kind ?? null;
  const productFamily = session.metadata?.product_family ?? null;
  const truthState = session.metadata?.truth_state ?? null;
  const deliveryAuthority = session.metadata?.ecological_delivery_authority ?? null;
  const taxDeductibleClaim = session.metadata?.tax_deductible_claim ?? null;
  const metadataOk = Boolean(entry) && truthState === runtime.environment && deliveryAuthority === "none" && taxDeductibleClaim === "false";
  const paymentSettled = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  const confirmed = session.livemode === runtime.livemode && session.id?.startsWith(runtime.expectedSessionPrefix) === true && session.status === "complete" && paymentSettled && metadataOk;

  return json({
    ok: true,
    environment: runtime.environment,
    confirmed,
    sessionId: session.id ?? sessionId,
    createdAt: typeof session.created === "number" ? new Date(session.created * 1000).toISOString() : null,
    checkoutStatus: session.status ?? null,
    paymentStatus: session.payment_status ?? null,
    checkoutMode: session.mode ?? null,
    amountMinor: session.amount_total ?? null,
    currency: session.currency ?? null,
    customerId: session.customer ?? null,
    customerEmail: session.customer_details?.email ?? null,
    customerName: session.customer_details?.name ?? null,
    subscriptionId: session.subscription ?? null,
    productKey,
    productKind,
    productFamily,
    mission: entry?.mission ?? null,
    missionSlug: entry?.missionSlug ?? null,
    referenceKey: session.metadata?.reference_key ?? null,
    truthState,
    ecologicalDeliveryAuthority: deliveryAuthority,
    taxDeductibleClaim: false,
    financialState: confirmed ? "CHECKOUT_CONFIRMED" : "NOT_CONFIRMED",
    impactState: productFamily === "IMPACT" ? "DELIVERY_NOT_ESTABLISHED" : "NOT_APPLICABLE",
    disclosure: productFamily === "IMPACT"
      ? "Payment confirmation is not partner delivery, ecological outcome or verified impact."
      : "Checkout confirmation establishes financial state only. Membership, sponsorship, support allocation and other rights remain governed separately.",
  });
};

export const onRequest = async (ctx: { request: Request; env: StripeEnv }): Promise<Response> =>
  ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
