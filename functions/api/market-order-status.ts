interface Env {
  STRIPE_TEST_SECRET_KEY?: string;
  MARKET_STRIPE_TEST_ENABLED?: string;
}

const TEST_PRODUCT_ID = "photo:arctic-white-angel-01";
const TEST_AMOUNT_MINOR = 300;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

function allowedHost(hostname: string) {
  return (
    hostname === "4planetmarket.com" ||
    hostname === "www.4planetmarket.com" ||
    hostname === "cre4tors.com" ||
    hostname === "www.cre4tors.com" ||
    hostname.endsWith(".4planet-05.pages.dev") ||
    hostname === "localhost"
  );
}

type StripeCheckoutSession = {
  id?: string;
  status?: string;
  payment_status?: string;
  amount_total?: number;
  currency?: string;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
  error?: { type?: string; message?: string };
};

export const onRequestGet = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const requestUrl = new URL(request.url);

  if (!allowedHost(requestUrl.hostname)) return json({ ok: false, error: "host_not_allowed" }, 403);
  if (env.MARKET_STRIPE_TEST_ENABLED !== "true") {
    return json({ ok: false, error: "market_stripe_test_disabled" }, 503);
  }

  const secret = env.STRIPE_TEST_SECRET_KEY?.trim();
  if (!secret || !secret.startsWith("sk_test_")) {
    return json({ ok: false, error: "stripe_test_secret_missing" }, 503);
  }

  const sessionId = requestUrl.searchParams.get("session_id")?.trim() ?? "";
  if (!sessionId.startsWith("cs_test_")) {
    return json({ ok: false, error: "invalid_test_session" }, 400);
  }

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: { authorization: `Bearer ${secret}` },
    },
  );

  const session = (await stripeResponse.json()) as StripeCheckoutSession;
  if (!stripeResponse.ok) {
    return json(
      { ok: false, error: "stripe_session_lookup_failed", stripeType: session.error?.type ?? null },
      502,
    );
  }

  const metadataOk =
    session.metadata?.integration === "4market_test_checkout" &&
    session.metadata?.market_product_id === TEST_PRODUCT_ID;
  const amountOk = session.amount_total === TEST_AMOUNT_MINOR && session.currency === "nok";
  const paymentConfirmed =
    session.status === "complete" && session.payment_status === "paid" && metadataOk && amountOk;

  return json({
    ok: true,
    mode: "test",
    confirmed: paymentConfirmed,
    sessionId: session.id ?? sessionId,
    checkoutStatus: session.status ?? null,
    paymentStatus: session.payment_status ?? null,
    amountNok: typeof session.amount_total === "number" ? session.amount_total / 100 : null,
    currency: session.currency ?? null,
    customerEmail: session.customer_details?.email ?? null,
    productId: session.metadata?.market_product_id ?? null,
    truthState: session.metadata?.truth_state ?? null,
  });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "GET") return onRequestGet(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
