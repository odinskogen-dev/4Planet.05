import { CATALOG, readCatalogKey, resolveEnvironment, resolvePriceId, type CatalogEntry, type StripeEnv } from "./catalog";
import { requestSession, sessionCookieHeaders, type SupabaseEnv } from "../_shared/supabase";

type Env = StripeEnv & SupabaseEnv;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function allowedOrigin(origin: string, environment: "TEST" | "LIVE") {
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

const MISSION_SLUGS = new Set([
  "cle4n", "wh4les", "cor4l", "rewild-marine", "clim4te", "am4zonia", "species", "rewild-land",
  "food", "en4rgy", "circular-city", "f4shion", "m4gazine", "4rt", "4film", "4play",
]);

function validateReference(entry: CatalogEntry, raw: unknown, env: StripeEnv, environment: "TEST" | "LIVE") {
  const reference = typeof raw === "string" ? raw.trim() : "";
  if (entry.kind === "MISSION_SPONSOR") {
    if (!MISSION_SLUGS.has(reference)) return null;
    return reference;
  }
  if (entry.kind === "PROJECT_SPONSOR") {
    if (!reference) return environment === "TEST" ? "test-project" : null;
    if (!/^[a-z0-9][a-z0-9_-]{1,79}$/.test(reference)) return null;
    if (environment === "TEST") return reference;
    const allowed = new Set((env.STRIPE_LIVE_PROJECT_SPONSOR_KEYS ?? "").split(",").map((value) => value.trim()).filter(Boolean));
    return allowed.has(reference) ? reference : null;
  }
  return reference || null;
}

function setMetadata(form: URLSearchParams, prefix: string, entry: CatalogEntry, environment: "TEST" | "LIVE", referenceKey: string | null, userId: string | null) {
  form.set(`${prefix}[4planet_product_key]`, entry.key);
  form.set(`${prefix}[product_kind]`, entry.kind);
  form.set(`${prefix}[product_family]`, entry.family);
  form.set(`${prefix}[truth_state]`, environment);
  form.set(`${prefix}[ecological_delivery_authority]`, "none");
  form.set(`${prefix}[tax_deductible_claim]`, "false");
  form.set(`${prefix}[catalog_version]`, "commerce-core-03");
  if (entry.action) form.set(`${prefix}[impact_action]`, entry.action);
  if (entry.mission) form.set(`${prefix}[mission]`, entry.mission);
  if (entry.missionSlug) form.set(`${prefix}[mission_slug]`, entry.missionSlug);
  if (referenceKey) form.set(`${prefix}[reference_key]`, referenceKey);
  if (userId) form.set(`${prefix}[4planet_user_id]`, userId);
}

function checkoutDisclosure(entry: CatalogEntry, environment: "TEST" | "LIVE") {
  if (environment === "TEST") return "TEST MODE — payment-path validation only. No real partner delivery, sponsorship rights, tax deduction or ecological outcome is created by this checkout.";
  if (entry.family === "IMPACT") return "Payment confirms a contribution only. Partner delivery, evidence and ecological outcomes are tracked separately and are never guaranteed by payment alone.";
  if (entry.family === "SUPPORT" || entry.family === "PATRON" || entry.family === "MISSION_SUPPORT") return "Support is not presented as a tax-deductible donation. Any stated benefits or allocation are limited to the terms shown by 4PLANET.";
  if (entry.family === "SPONSOR") return "Payment is for the specifically identified sponsorship package or allocation. Ecological delivery and outcomes, where relevant, remain separate evidence states.";
  return "Payment is processed by Stripe under the 4PLANET terms applicable to this product.";
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const runtime = resolveEnvironment(env);
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  if (!allowedOrigin(origin, runtime.environment)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  if (!runtime.enabled) return json({ ok: false, error: runtime.environment === "LIVE" ? "stripe_live_checkout_disabled" : "stripe_test_checkout_disabled" }, 503);
  if (!runtime.secret || !runtime.secret.startsWith(runtime.expectedSecretPrefix)) return json({ ok: false, error: runtime.environment === "LIVE" ? "stripe_live_secret_missing" : "stripe_test_secret_missing" }, 503);

  let body: { productKey?: unknown; quantity?: unknown; customerEmail?: unknown; referenceKey?: unknown; attemptId?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  const productKey = readCatalogKey(body.productKey);
  if (!productKey) return json({ ok: false, error: "unsupported_product" }, 400);
  const entry = CATALOG[productKey];
  if (entry.channel !== "checkout") return json({ ok: false, error: "invoice_product_requires_invoice_flow" }, 400);

  const quantity = safeQuantity(body.quantity, entry);
  if (quantity === null) return json({ ok: false, error: "invalid_quantity" }, 400);

  const accountSession = await requestSession(request, env).catch(() => null);
  const verifiedUserId = accountSession?.user.id ?? null;
  const verifiedUserEmail = accountSession?.user.email?.trim();
  const suppliedEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : undefined;
  const customerEmail = verifiedUserEmail || suppliedEmail;
  if (!validEmail(customerEmail)) return json({ ok: false, error: "invalid_email" }, 400);

  const referenceKey = validateReference(entry, body.referenceKey, env, runtime.environment);
  if ((entry.kind === "MISSION_SPONSOR" || entry.kind === "PROJECT_SPONSOR") && !referenceKey) return json({ ok: false, error: "approved_reference_required" }, 400);

  const priceId = resolvePriceId(entry, env, runtime.environment);
  if (!priceId) return json({ ok: false, error: runtime.environment === "LIVE" ? "live_price_not_configured" : "test_price_not_configured" }, 503);

  const form = new URLSearchParams();
  form.set("mode", entry.mode);
  form.set("line_items[0][price]", priceId);
  form.set("line_items[0][quantity]", String(quantity));
  form.set("billing_address_collection", "auto");
  form.set("success_url", `${origin}${entry.returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}${entry.returnPath}?checkout=cancel&product=${encodeURIComponent(productKey)}`);
  form.set("client_reference_id", verifiedUserId ? `4p_user_${verifiedUserId}` : `4p_${productKey}`);
  setMetadata(form, "metadata", entry, runtime.environment, referenceKey, verifiedUserId);

  if (entry.mode === "payment") {
    form.set("customer_creation", "always");
    setMetadata(form, "payment_intent_data[metadata]", entry, runtime.environment, referenceKey, verifiedUserId);
  } else {
    setMetadata(form, "subscription_data[metadata]", entry, runtime.environment, referenceKey, verifiedUserId);
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

  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  if (accountSession?.refreshed) for (const value of sessionCookieHeaders(accountSession.refreshed)) headers.append("Set-Cookie", value);
  return new Response(JSON.stringify({
    ok: true,
    environment: runtime.environment,
    checkoutMode: entry.mode,
    sessionId: stripePayload.id,
    url: stripePayload.url,
    productKey,
    productKind: entry.kind,
    productFamily: entry.family,
    quantity,
    referenceKey,
    accountLinked: Boolean(verifiedUserId),
    truthState: runtime.environment,
    deliveryAuthority: "none",
  }), { status: 200, headers });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
