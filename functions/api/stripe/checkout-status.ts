interface Env {
  STRIPE_TEST_SECRET_KEY?: string;
  STRIPE_CHECKOUT_TEST_ENABLED?: string;
}

const ALLOWED_PRODUCT_KEYS = new Set([
  "impact_tree_test",
  "impact_plastic_test",
  "impact_coral_test",
  "impact_rewild_test",
  "membership_supporter_test",
  "sponsor_package_test",
]);

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

function allowedHost(hostname: string) {
  return hostname === "4planet.org" || hostname === "www.4planet.org" || hostname.endsWith(".4planet-05.pages.dev") || hostname === "localhost";
}

type StripeCheckoutSession = {
  id?: string; status?: string; payment_status?: string; mode?: string; livemode?: boolean;
  amount_total?: number | null; currency?: string | null; customer?: string | null; subscription?: string | null;
  metadata?: Record<string, string> | null; error?: { type?: string };
};

export const onRequestGet = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const requestUrl = new URL(request.url);
  if (!allowedHost(requestUrl.hostname)) return json({ ok: false, error: "host_not_allowed" }, 403);
  if (env.STRIPE_CHECKOUT_TEST_ENABLED !== "true") return json({ ok: false, error: "stripe_test_checkout_disabled" }, 503);
  const secret = env.STRIPE_TEST_SECRET_KEY?.trim();
  if (!secret || !secret.startsWith("sk_test_")) return json({ ok: false, error: "stripe_test_secret_missing" }, 503);

  const sessionId = requestUrl.searchParams.get("session_id")?.trim() ?? "";
  if (!sessionId.startsWith("cs_test_")) return json({ ok: false, error: "invalid_test_session" }, 400);

  const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, { headers: { authorization: `Bearer ${secret}` } });
  const session = await stripeResponse.json().catch(() => null) as StripeCheckoutSession | null;
  if (!stripeResponse.ok || !session) return json({ ok: false, error: "stripe_session_lookup_failed", stripeType: session?.error?.type ?? null }, 502);

  const productKey = session.metadata?.["4planet_product_key"] ?? null;
  const productKind = session.metadata?.product_kind ?? null;
  const productFamily = session.metadata?.product_family ?? null;
  const truthState = session.metadata?.truth_state ?? null;
  const deliveryAuthority = session.metadata?.ecological_delivery_authority ?? null;
  const metadataOk = typeof productKey === "string" && ALLOWED_PRODUCT_KEYS.has(productKey) && truthState === "TEST" && deliveryAuthority === "none";
  const paymentSettled = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  const confirmed = session.livemode === false && session.id?.startsWith("cs_test_") === true && session.status === "complete" && paymentSettled && metadataOk;

  return json({
    ok: true,
    environment: "TEST",
    confirmed,
    sessionId: session.id ?? sessionId,
    checkoutStatus: session.status ?? null,
    paymentStatus: session.payment_status ?? null,
    checkoutMode: session.mode ?? null,
    amountMinor: session.amount_total ?? null,
    currency: session.currency ?? null,
    customerId: session.customer ?? null,
    subscriptionId: session.subscription ?? null,
    productKey,
    productKind,
    productFamily,
    truthState,
    ecologicalDeliveryAuthority: deliveryAuthority,
    financialState: confirmed ? "CHECKOUT_CONFIRMED" : "NOT_CONFIRMED",
    impactState: productFamily === "IMPACT" ? "DELIVERY_NOT_ESTABLISHED" : "NOT_APPLICABLE",
    disclosure: productFamily === "IMPACT" ? "Payment confirmation is not partner delivery, ecological outcome or verified impact." : "Checkout confirmation establishes payment or subscription state only; product rights and benefits remain governed separately.",
  });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
