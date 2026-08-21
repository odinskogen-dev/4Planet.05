/**
 * POST /api/checkout — create a Stripe-hosted Checkout Session.
 *
 * Server-side secrets only:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_QA           internal test-mode price
 *   STRIPE_PRICE_PRIMARY      founder-approved public/live price when available
 *
 * Client input never controls amount, currency or Stripe price IDs.
 * Product keys are mapped to server-side environment variables.
 */

interface Env {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_QA?: string;
  STRIPE_PRICE_PRIMARY?: string;
}

type ProductKey = "qa" | "primary";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const allowedOrigin = (request: Request): string | null => {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const ownOrigin = url.origin;

  // Same-origin browser requests are preferred. Cloudflare preview hosts are allowed
  // because this endpoint must be QA-able before production promotion.
  if (!origin) return ownOrigin;
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname.toLowerCase();
    if (origin === ownOrigin || host === "4planet.org" || host === "www.4planet.org" || host.endsWith(".4planet-05.pages.dev")) {
      return origin;
    }
  } catch {
    return null;
  }
  return null;
};

const readBody = async (request: Request): Promise<{ product?: ProductKey; customerEmail?: string }> => {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const product = body.product === "qa" || body.product === "primary" ? body.product : undefined;
    const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().slice(0, 254) : undefined;
    return { product, customerEmail };
  } catch {
    return {};
  }
};

const emailOk = (email?: string) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const origin = allowedOrigin(request);
  if (!origin) return json({ ok: false, error: "origin_not_allowed" }, 403);
  if (!env.STRIPE_SECRET_KEY) return json({ ok: false, error: "stripe_not_configured" }, 503);

  const { product, customerEmail } = await readBody(request);
  if (!product) return json({ ok: false, error: "invalid_product" }, 400);
  if (!emailOk(customerEmail)) return json({ ok: false, error: "invalid_email" }, 400);

  const priceId = product === "qa" ? env.STRIPE_PRICE_QA : env.STRIPE_PRICE_PRIMARY;
  if (!priceId) return json({ ok: false, error: "price_not_configured" }, 503);

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price]", priceId);
  form.set("line_items[0][quantity]", "1");
  form.set("success_url", `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/payment/cancelled`);
  form.set("client_reference_id", `4p_${product}`);
  form.set("metadata[4planet_product_key]", product);
  if (customerEmail) form.set("customer_email", customerEmail);

  const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const payload = (await stripe.json().catch(() => null)) as null | Record<string, unknown>;
  if (!stripe.ok) {
    return json(
      {
        ok: false,
        error: "stripe_checkout_failed",
        stripeType: payload && typeof payload.error === "object" && payload.error ? (payload.error as Record<string, unknown>).type : undefined,
      },
      502,
    );
  }

  const url = payload && typeof payload.url === "string" ? payload.url : null;
  const id = payload && typeof payload.id === "string" ? payload.id : null;
  if (!url || !id) return json({ ok: false, error: "stripe_checkout_invalid_response" }, 502);

  return json({ ok: true, id, url });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
