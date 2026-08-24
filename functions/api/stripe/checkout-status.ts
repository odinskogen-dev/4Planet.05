interface Env {
  STRIPE_TEST_SECRET_KEY?: string;
  STRIPE_CHECKOUT_TEST_ENABLED?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
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
  livemode?: boolean;
  metadata?: Record<string, string> | null;
  error?: { type?: string };
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

  const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { authorization: `Bearer ${secret}` },
  });
  const session = (await stripeResponse.json().catch(() => null)) as StripeCheckoutSession | null;
  if (!stripeResponse.ok || !session) return json({ ok: false, error: "stripe_session_lookup_failed", stripeType: session?.error?.type ?? null }, 502);

  const productKey = session.metadata?.["4planet_product_key"] ?? null;
  const truthState = session.metadata?.truth_state ?? null;
  const deliveryAuthority = session.metadata?.ecological_delivery_authority ?? null;
  const metadataOk = typeof productKey === "string" && productKey.startsWith("impact_") && truthState === "TEST" && deliveryAuthority === "none";
  const confirmed = session.livemode === false && session.id?.startsWith("cs_test_") === true && session.status === "complete" && session.payment_status === "paid" && metadataOk;

  return json({
    ok: true,
    mode: "test",
    confirmed,
    sessionId: session.id ?? sessionId,
    checkoutStatus: session.status ?? null,
    paymentStatus: session.payment_status ?? null,
    productKey,
    truthState,
    ecologicalDeliveryAuthority: deliveryAuthority,
    contributionState: confirmed ? "PAYMENT_CONFIRMED_ONLY" : "NOT_CONFIRMED",
    disclosure: "Payment confirmation is not partner delivery, ecological outcome or verified impact.",
  });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "GET") return onRequestGet(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
