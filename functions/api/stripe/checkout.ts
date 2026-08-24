import { CATALOG, readCatalogKey, resolveEnvironment, resolvePriceId, type CatalogEntry, type PaymentEnvironment, type StripeEnv } from "./catalog";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function allowedOrigin(origin: string, environment: PaymentEnvironment) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return false;
    if (environment === "LIVE") return url.hostname === "4planet.org" || url.hostname === "www.4planet.org";
    return url.hostname === "4planet.org" || url.hostname === "www.4planet.org" || url.hostname.endsWith(".4planet-05.pages.dev") || url.hostname === "localhost";
  } catch { return false; }
}

function validEmail(email?: string) {
  return !email || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254);
}

function safeQuantity(value: unknown, entry: CatalogEntry) {
  const quantity = typeof value === "number" && Number.isInteger(value) ? value : 1;
  return quantity >= entry.minQuantity && quantity <= entry.maxQuantityPerCheckout ? quantity : null;
}

function safeAttemptId(value: unknown) {
  if (typeof value !== "string") return crypto.randomUUID();
  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{8,80}$/.test(trimmed) ? trimmed : crypto.randomUUID();
}

function setMetadata(form: URLSearchParams, prefix: string, entry: CatalogEntry, environment: PaymentEnvironment) {
  form.set(`${prefix}[4planet_product_key]`, entry.key);
  form.set(`${prefix}[product_kind]`, entry.kind);
  form.set(`${prefix}[product_family]`, entry.family);
  form.set(`${prefix}[truth_state]`, environment);
  form.set(`${prefix}[ecological_delivery_authority]`, "none");
  form.set(`${prefix}[tax_deductible_claim]`, "false");
  form.set(`${prefix}[catalog_version]`, "payments-live-model-01");
  if (entry.action) form.set(`${prefix}[impact_action]`, entry.action);
  if (entry.mission) form.set(`${prefix}[mission]`, entry.mission);
  if (entry.missionSlug) form.set(`${prefix}[mission_slug]`, entry.missionSlug);
}

function checkoutDisclosure(entry: CatalogEntry, environment: PaymentEnvironment) {
  if (environment === "TEST") return "TEST MODE — payment-path validation only. No real partner delivery, tax deduction or ecological outcome is created by this checkout.";
  if (entry.family === "SUPPORT") return "Recurring support for building and operating 4PLANET. It is not presented as a tax-deductible donation and is not tied to a specific ecological delivery or outcome. Cancel future renewals at any time.";
  if (entry.family === "MISSION_SUPPORT") return "Recurring support for the named 4PLANET Mission pathway. It is not presented as a tax-deductible donation and does not by itself establish a specific ecological delivery or outcome. Cancel future renewals at any time.";
  return "Payment is processed by Stripe under the 4PLANET terms shown before Checkout.";
}

export const onRequestPost = async (ctx: { request: Request; env: StripeEnv }): Promise<Response> => {
  const { request, env } = ctx;
  const runtime = resolveEnvironment(env);
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  if (!allowedOrigin(origin, runtime.environment)) return json({ ok: false, error: "origin_not_allowed" }, 403);

  if (!runtime.enabled) return json({ ok: false, error: runtime.environment === "LIVE" ? "stripe_live_checkout_disabled" : "stripe_test_checkout_disabled" }, 503);
  if (!runtime.secret || !runtime.secret.startsWith(runtime.expectedSecretPrefix)) return json({ ok: false, error: runtime.environment === "LIVE" ? "stripe_live_secret_missing" : "stripe_test_secret_missing" }, 503);

  let body: { productKey?: unknown; quantity?: unknown; customerEmail?: unknown; attemptId?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  const productKey = readCatalogKey(body.productKey);
  if (!productKey) return json({ ok: false, error: "unsupported_product" }, 400);
  const entry = CATALOG[productKey];
  if (entry.channel !== "checkout") return json({ ok: false, error: entry.channel === "invoice" ? "negotiated_offer_requires_enquiry" : "product_not_publicly_available" }, 400);
  if (runtime.environment === "LIVE" && !entry.liveEnabled) return json({ ok: false, error: "product_not_released_live" }, 403);

  const quantity = safeQuantity(body.quantity, entry);
  if (quantity === null) return json({ ok: false, error: "invalid_quantity" }, 400);
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : undefined;
  if (!validEmail(customerEmail)) return json({ ok: false, error: "invalid_email" }, 400);

  const priceId = resolvePriceId(entry, runtime.environment);
  if (!priceId) return json({ ok: false, error: runtime.environment === "LIVE" ? "live_price_not_released" : "test_price_not_configured" }, 503);

  const form = new URLSearchParams();
  form.set("mode", entry.mode);
  form.set("line_items[0][price]", priceId);
  form.set("line_items[0][quantity]", String(quantity));
  form.set("billing_address_collection", "auto");
  form.set("success_url", `${origin}${entry.returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}${entry.returnPath}?checkout=cancel&product=${encodeURIComponent(productKey)}`);
  form.set("client_reference_id", `4p_${productKey}`);
  setMetadata(form, "metadata", entry, runtime.environment);

  if (entry.mode === "payment") {
    form.set("customer_creation", "always");
    setMetadata(form, "payment_intent_data[metadata]", entry, runtime.environment);
  } else {
    setMetadata(form, "subscription_data[metadata]", entry, runtime.environment);
  }

  form.set("custom_text[submit][message]", checkoutDisclosure(entry, runtime.environment));
  if (customerEmail) form.set("customer_email", customerEmail);

  const attemptId = safeAttemptId(body.attemptId);
  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${runtime.secret}`,
      "content-type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `4p_${runtime.environment.toLowerCase()}_${productKey}_${attemptId}`.slice(0, 255),
    },
    body: form,
  });
  const stripePayload = await stripeResponse.json().catch(() => null) as { id?: string; url?: string; livemode?: boolean; mode?: string; error?: { type?: string } } | null;

  if (!stripeResponse.ok || !stripePayload?.url || !stripePayload.id?.startsWith(runtime.expectedSessionPrefix) || stripePayload.livemode !== runtime.livemode || (stripePayload.mode && stripePayload.mode !== entry.mode)) {
    return json({ ok: false, error: "stripe_checkout_create_failed", stripeType: stripePayload?.error?.type ?? null }, 502);
  }

  return json({
    ok: true,
    environment: runtime.environment,
    checkoutMode: entry.mode,
    sessionId: stripePayload.id,
    url: stripePayload.url,
    productKey,
    productKind: entry.kind,
    productFamily: entry.family,
    quantity,
    referenceKey: null,
    truthState: runtime.environment,
    deliveryAuthority: "none",
  });
};

export const onRequest = async (ctx: { request: Request; env: StripeEnv }): Promise<Response> =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
