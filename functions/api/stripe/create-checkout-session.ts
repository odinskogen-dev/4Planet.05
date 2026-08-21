type Env = {
  STRIPE_SECRET_KEY: string;
  STRIPE_ALLOWED_PRICE_IDS: string;
  STRIPE_PHYSICAL_PRICE_IDS?: string;
  STRIPE_SHIPPING_COUNTRIES?: string;
  STRIPE_AUTOMATIC_TAX?: string;
  STRIPE_API_VERSION?: string;
};

type CheckoutRequest = {
  priceId?: string;
  quantity?: number;
  customerEmail?: string;
  orderRef?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const csvSet = (value?: string) =>
  new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

const safeEmail = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : undefined;
};

const safeRef = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^[A-Za-z0-9._:-]{1,120}$/.test(trimmed) ? trimmed : undefined;
};

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const requestOrigin = request.headers.get("Origin");

  if (requestOrigin && requestOrigin !== origin) {
    return json({ error: "origin_not_allowed" }, 403);
  }

  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "stripe_not_configured" }, 503);
  }

  const allowedPriceIds = csvSet(env.STRIPE_ALLOWED_PRICE_IDS);
  if (allowedPriceIds.size === 0) {
    return json({ error: "stripe_catalog_not_configured" }, 503);
  }

  let input: CheckoutRequest;
  try {
    input = (await request.json()) as CheckoutRequest;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const priceId = input.priceId?.trim();
  if (!priceId || !allowedPriceIds.has(priceId)) {
    return json({ error: "price_not_allowed" }, 400);
  }

  const quantity = Number.isInteger(input.quantity) ? Number(input.quantity) : 1;
  if (quantity < 1 || quantity > 20) {
    return json({ error: "invalid_quantity" }, 400);
  }

  const physicalPriceIds = csvSet(env.STRIPE_PHYSICAL_PRICE_IDS);
  const isPhysical = physicalPriceIds.has(priceId);
  const shippingCountries = Array.from(csvSet(env.STRIPE_SHIPPING_COUNTRIES));

  if (isPhysical && shippingCountries.length === 0) {
    return json({ error: "shipping_countries_not_configured" }, 503);
  }

  const orderRef = safeRef(input.orderRef);
  const customerEmail = safeEmail(input.customerEmail);

  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price]", priceId);
  form.set("line_items[0][quantity]", String(quantity));
  form.set("success_url", `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/checkout/cancel`);
  form.set("billing_address_collection", "auto");
  form.set("metadata[4planet_payment_flow]", "market_v1");

  if (customerEmail) form.set("customer_email", customerEmail);

  if (orderRef) {
    form.set("client_reference_id", orderRef);
    form.set("metadata[order_ref]", orderRef);
    form.set("payment_intent_data[metadata][order_ref]", orderRef);
  }

  if (env.STRIPE_AUTOMATIC_TAX?.toLowerCase() === "true") {
    form.set("automatic_tax[enabled]", "true");
  }

  if (isPhysical) {
    shippingCountries.forEach((country, index) => {
      form.set(`shipping_address_collection[allowed_countries][${index}]`, country.toUpperCase());
    });
  }

  const headers: Record<string, string> = {
    authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    "content-type": "application/x-www-form-urlencoded",
  };

  if (env.STRIPE_API_VERSION) {
    headers["Stripe-Version"] = env.STRIPE_API_VERSION;
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers,
    body: form,
  });

  const stripeBody = (await stripeResponse.json()) as {
    id?: string;
    url?: string;
    error?: { message?: string; code?: string };
  };

  if (!stripeResponse.ok || !stripeBody.url) {
    console.error("Stripe Checkout session creation failed", {
      status: stripeResponse.status,
      code: stripeBody.error?.code,
    });
    return json({ error: "checkout_session_failed" }, 502);
  }

  return json({ sessionId: stripeBody.id, url: stripeBody.url });
}
