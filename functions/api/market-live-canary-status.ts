interface Env {
  STRIPE_LIVE_SECRET_KEY?: string;
  MARKET_STRIPE_LIVE_CANARY_ENABLED?: string;
}

const PRODUCT_ID = "photo:arctic-white-angel-01";
const AMOUNT_MINOR = 300;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function allowedHost(hostname: string) {
  return (
    hostname === "4planetmarket.com" ||
    hostname === "www.4planetmarket.com" ||
    hostname.endsWith(".4planet-05.pages.dev")
  );
}

type Session = {
  id?: string;
  livemode?: boolean;
  status?: string;
  payment_status?: string;
  amount_total?: number;
  currency?: string;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
  payment_intent?: string | null;
  error?: { type?: string };
};

export const onRequestGet = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const url = new URL(request.url);

  if (!allowedHost(url.hostname)) return json({ ok: false, error: "host_not_allowed" }, 403);
  if (env.MARKET_STRIPE_LIVE_CANARY_ENABLED !== "true") {
    return json({ ok: false, error: "live_canary_disabled" }, 503);
  }

  const secret = env.STRIPE_LIVE_SECRET_KEY?.trim();
  if (!secret || !secret.startsWith("sk_live_")) {
    return json({ ok: false, error: "stripe_live_secret_missing" }, 503);
  }

  const sessionId = url.searchParams.get("session_id")?.trim() ?? "";
  if (!sessionId.startsWith("cs_live_")) return json({ ok: false, error: "invalid_live_session" }, 400);

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { authorization: `Bearer ${secret}` } },
  );
  const session = (await stripeResponse.json()) as Session;

  if (!stripeResponse.ok) {
    return json(
      { ok: false, error: "stripe_session_lookup_failed", stripeType: session.error?.type ?? null },
      502,
    );
  }

  const metadataOk =
    session.metadata?.integration === "4market_live_canary" &&
    session.metadata?.market_product_id === PRODUCT_ID &&
    session.metadata?.fulfilment_authority === "none";
  const amountOk = session.amount_total === AMOUNT_MINOR && session.currency === "nok";
  const confirmed =
    session.livemode === true &&
    session.status === "complete" &&
    session.payment_status === "paid" &&
    metadataOk &&
    amountOk;

  return json({
    ok: true,
    confirmed,
    mode: "live_canary",
    sessionId: session.id ?? sessionId,
    paymentIntentId: session.payment_intent ?? null,
    checkoutStatus: session.status ?? null,
    paymentStatus: session.payment_status ?? null,
    amountNok: typeof session.amount_total === "number" ? session.amount_total / 100 : null,
    currency: session.currency ?? null,
    customerEmail: session.customer_details?.email ?? null,
    productId: session.metadata?.market_product_id ?? null,
    fulfilmentAuthority: session.metadata?.fulfilment_authority ?? null,
  });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "GET") return onRequestGet(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
