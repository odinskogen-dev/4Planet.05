var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../home/runner/work/4Planet.05/4Planet.05/src/market/firstCreatorCatalogue.ts
var photoCommerce = /* @__PURE__ */ __name(() => ({
  candidatePriceNok: 1290,
  printSize: "8 \xD7 12 IN",
  podSku: "GLOBAL-FAP-8X12",
  podSizing: "fitPrintArea",
  shippingMethod: "standard",
  shippingCountry: "NO",
  sampleState: "REQUIRED"
}), "photoCommerce");
var artCommerce = /* @__PURE__ */ __name(() => ({
  candidatePriceNok: 890,
  printSize: "6 \xD7 8 IN",
  podSku: "GLOBAL-FAP-6X8",
  podSizing: "fitPrintArea",
  shippingMethod: "standard",
  shippingCountry: "NO",
  sampleState: "REQUIRED"
}), "artCommerce");
var FIRST_MARKET_PRODUCTS = [
  {
    id: "market:odin:reinebringen-vista",
    slug: "reinebringen-vista",
    title: "Above the Fjord",
    creator: "Odin Oddekalv",
    location: "Reine, Lofoten \xB7 Norway",
    year: "2024",
    imageUrl: "/market/odin/reinebringen-vista.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: photoCommerce()
  },
  {
    id: "market:odin:fjord-island-cabins",
    slug: "fjord-island-cabins",
    title: "Turf Roofs, Inner Waterway",
    creator: "Odin Oddekalv",
    location: "Vestland \xB7 Norway",
    year: "2024",
    imageUrl: "/market/odin/fjord-island-cabins.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: { ...photoCommerce(), printSize: "8 \xD7 8 IN", podSku: "GLOBAL-FAP-8X8" }
  },
  {
    id: "market:odin:reinebringen-clifftop",
    slug: "reinebringen-clifftop",
    title: "Cliff Edge, Weather Coming In",
    creator: "Odin Oddekalv",
    location: "Reine, Lofoten \xB7 Norway",
    year: "2024",
    imageUrl: "/market/odin/reinebringen-clifftop.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: photoCommerce()
  },
  {
    id: "market:odin:lofoten-beach",
    slug: "lofoten-beach",
    title: "White Sand at Dusk",
    creator: "Odin Oddekalv",
    location: "Lofoten \xB7 Norway",
    year: "2024",
    imageUrl: "/market/odin/lofoten-beach.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: { ...photoCommerce(), printSize: "9 \xD7 12 IN", podSku: "GLOBAL-FAP-9X12" }
  },
  {
    id: "market:odin:seaweed-coast",
    slug: "seaweed-coast",
    title: "Kelp Line, Low Tide",
    creator: "Odin Oddekalv",
    location: "Lofoten \xB7 Norway",
    year: "2023",
    imageUrl: "/market/odin/seaweed-coast.jpg",
    productType: "PHOTOGRAPHIC PRINT",
    state: "RELEASE GATED",
    commerce: photoCommerce()
  },
  {
    id: "market:amalie:a01",
    slug: "amalie-a01-dense-animals-green-leaves",
    title: "Dense Animals / Green Leaves",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a01-dense-animals-green-leaves.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce()
  },
  {
    id: "market:amalie:a07",
    slug: "amalie-a07-people-on-pink",
    title: "People on Pink",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a07-people-on-pink.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce()
  },
  {
    id: "market:amalie:a12",
    slug: "amalie-a12-pirate-frogs",
    title: "Pirate Frogs",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a12-pirate-frogs.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce()
  },
  {
    id: "market:amalie:a13",
    slug: "amalie-a13-frog-holiday-pool-world",
    title: "Frog Holiday / Pool World",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a13-frog-holiday-pool-world.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce()
  },
  {
    id: "market:amalie:a14",
    slug: "amalie-a14-frog-treehouse-snake-mole",
    title: "Frog Treehouse / Snake / Mole",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a14-frog-treehouse-snake-mole.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce()
  },
  {
    id: "market:amalie:a15",
    slug: "amalie-a15-pig-society-turquoise",
    title: "Pig Society / Turquoise",
    creator: "Amalie Marie Myrtvedt",
    location: "Work on paper",
    year: "Year to confirm",
    imageUrl: "/market/amalie/a15-pig-society-turquoise.jpg",
    productType: "ART PRINT",
    state: "RELEASE GATED",
    commerce: artCommerce()
  }
];
function getFirstMarketProduct(id) {
  return FIRST_MARKET_PRODUCTS.find((product) => product.id === id || product.slug === id) ?? null;
}
__name(getFirstMarketProduct, "getFirstMarketProduct");

// ../home/runner/work/4Planet.05/4Planet.05/functions/_lib/marketCommerce.ts
var bool = /* @__PURE__ */ __name((value) => value === "true", "bool");
function canaryPrice(value) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 3 || parsed > 1e4) return null;
  return parsed;
}
__name(canaryPrice, "canaryPrice");
function resolveMarketCommerceRuntime(env) {
  const mode = env.MARKET_COMMERCE_ENV === "LIVE" ? "LIVE" : "TEST";
  const isLive = mode === "LIVE";
  const stripeSecret = (isLive ? env.STRIPE_LIVE_SECRET_KEY : env.STRIPE_TEST_SECRET_KEY)?.trim();
  const stripeWebhookSecret = (isLive ? env.STRIPE_MARKET_WEBHOOK_SECRET_LIVE ?? env.STRIPE_WEBHOOK_SECRET_LIVE : env.STRIPE_MARKET_WEBHOOK_SECRET_TEST ?? env.STRIPE_WEBHOOK_SECRET_TEST)?.trim();
  const prodigiKey = (isLive ? env.PRODIGI_LIVE_API_KEY ?? env.PRODIGI_API_KEY : env.PRODIGI_SANDBOX_API_KEY ?? env.PRODIGI_TEST_API_KEY)?.trim();
  const callbackToken = env.MARKET_PRODIGI_CALLBACK_TOKEN?.trim();
  const canaryToken = env.MARKET_LIVE_CANARY_TOKEN?.trim();
  const canaryPriceNok = canaryPrice(env.MARKET_CANARY_PRICE_NOK);
  const checkoutFlag = bool(isLive ? env.MARKET_STRIPE_LIVE_ENABLED : env.MARKET_STRIPE_TEST_ENABLED);
  const fulfilmentFlag = bool(isLive ? env.MARKET_FULFILMENT_LIVE_ENABLED : env.MARKET_FULFILMENT_TEST_ENABLED);
  const releaseApproved = !isLive || bool(env.MARKET_LIVE_RELEASE_APPROVED);
  const publicOrigin = safePublicOrigin(env.MARKET_PUBLIC_ORIGIN);
  const stripeConfigured = Boolean(stripeSecret?.startsWith(isLive ? "sk_live_" : "sk_test_"));
  const webhookConfigured = Boolean(stripeWebhookSecret?.startsWith("whsec_"));
  const prodigiConfigured = Boolean(prodigiKey && prodigiKey.length >= 16);
  const callbackConfigured = Boolean(callbackToken && callbackToken.length >= 24);
  const canaryEnabled = isLive && bool(env.MARKET_LIVE_CANARY_ENABLED) && Boolean(canaryToken && canaryToken.length >= 24);
  const providerFulfilmentReady = fulfilmentFlag && prodigiConfigured && callbackConfigured;
  return {
    mode,
    isLive,
    publicOrigin,
    stripeSecret,
    stripeWebhookSecret,
    prodigiKey,
    callbackToken,
    canaryToken,
    canaryPriceNok,
    prodigiBaseUrl: isLive ? "https://api.prodigi.com" : "https://api.sandbox.prodigi.com",
    checkoutFlag,
    fulfilmentFlag,
    releaseApproved,
    canaryEnabled,
    stripeConfigured,
    webhookConfigured,
    prodigiConfigured,
    callbackConfigured,
    providerFulfilmentReady,
    checkoutInfrastructureReady: checkoutFlag && releaseApproved && stripeConfigured,
    fulfilmentInfrastructureReady: providerFulfilmentReady && releaseApproved
  };
}
__name(resolveMarketCommerceRuntime, "resolveMarketCommerceRuntime");
function safePublicOrigin(value) {
  const fallback = "https://4planetmarket.com";
  if (!value) return fallback;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return fallback;
    return url.origin;
  } catch {
    return fallback;
  }
}
__name(safePublicOrigin, "safePublicOrigin");
function isAllowedMarketOrigin(origin, mode) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return false;
    if (url.hostname === "4planetmarket.com" || url.hostname === "www.4planetmarket.com") return true;
    if (mode === "TEST" && (url.hostname.endsWith(".4planet-05.pages.dev") || url.hostname === "localhost")) return true;
    return false;
  } catch {
    return false;
  }
}
__name(isAllowedMarketOrigin, "isAllowedMarketOrigin");
function productSampleApproved(product, env) {
  return product.productType === "PHOTOGRAPHIC PRINT" ? bool(env.MARKET_PHOTO_SAMPLE_APPROVED) : bool(env.MARKET_ART_SAMPLE_APPROVED);
}
__name(productSampleApproved, "productSampleApproved");
function productCanCheckout(product, env) {
  const runtime = resolveMarketCommerceRuntime(env);
  if (!runtime.checkoutInfrastructureReady) return false;
  if (!runtime.isLive) return true;
  return runtime.fulfilmentInfrastructureReady && runtime.webhookConfigured && productSampleApproved(product, env);
}
__name(productCanCheckout, "productCanCheckout");
function productCanCanary(product, env) {
  const runtime = resolveMarketCommerceRuntime(env);
  return runtime.isLive && runtime.canaryEnabled && runtime.stripeConfigured && runtime.webhookConfigured && runtime.providerFulfilmentReady && Boolean(product.commerce.podSku);
}
__name(productCanCanary, "productCanCanary");
function releasedMarketProductIds(env) {
  return FIRST_MARKET_PRODUCTS.filter((product) => productCanCheckout(product, env)).map((product) => product.id);
}
__name(releasedMarketProductIds, "releasedMarketProductIds");
function requireMarketProduct(value) {
  if (typeof value !== "string") return null;
  return getFirstMarketProduct(value.trim());
}
__name(requireMarketProduct, "requireMarketProduct");
function productAssetUrl(product, env) {
  const runtime = resolveMarketCommerceRuntime(env);
  return new URL(product.imageUrl, runtime.publicOrigin).toString();
}
__name(productAssetUrl, "productAssetUrl");
function prodigiCallbackUrl(env) {
  const runtime = resolveMarketCommerceRuntime(env);
  if (!runtime.callbackToken) return null;
  const url = new URL("/api/market-prodigi-callback", runtime.publicOrigin);
  url.searchParams.set("token", runtime.callbackToken);
  return url.toString();
}
__name(prodigiCallbackUrl, "prodigiCallbackUrl");
function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}
__name(json, "json");
async function stripeGet(runtime, path) {
  if (!runtime.stripeSecret) return { ok: false, status: 0, payload: null };
  const response = await fetch(`https://api.stripe.com${path}`, {
    headers: { authorization: `Bearer ${runtime.stripeSecret}` }
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}
__name(stripeGet, "stripeGet");
async function stripePostForm(runtime, path, form, idempotencyKey) {
  if (!runtime.stripeSecret) return { ok: false, status: 0, payload: null };
  const headers = {
    authorization: `Bearer ${runtime.stripeSecret}`,
    "content-type": "application/x-www-form-urlencoded"
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey.slice(0, 255);
  const response = await fetch(`https://api.stripe.com${path}`, { method: "POST", headers, body: form });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}
__name(stripePostForm, "stripePostForm");
async function updateStripeSessionMetadata(runtime, sessionId, metadata) {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(metadata)) form.set(`metadata[${key}]`, value.slice(0, 500));
  return stripePostForm(runtime, `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, form);
}
__name(updateStripeSessionMetadata, "updateStripeSessionMetadata");
async function prodigiGet(runtime, path) {
  if (!runtime.prodigiKey) return { ok: false, status: 0, payload: null };
  const response = await fetch(`${runtime.prodigiBaseUrl}${path}`, {
    headers: { "X-API-Key": runtime.prodigiKey }
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}
__name(prodigiGet, "prodigiGet");
async function prodigiPost(runtime, path, body) {
  if (!runtime.prodigiKey) return { ok: false, status: 0, payload: null };
  const response = await fetch(`${runtime.prodigiBaseUrl}${path}`, {
    method: "POST",
    headers: { "X-API-Key": runtime.prodigiKey, "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}
__name(prodigiPost, "prodigiPost");
var encoder = new TextEncoder();
var hex = /* @__PURE__ */ __name((buffer) => Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join(""), "hex");
function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
__name(constantTimeEqual, "constantTimeEqual");
async function verifyStripeSignature(payload, header, secret) {
  let timestamp = "";
  const signatures = [];
  for (const part of header.split(",")) {
    const [key2, value] = part.split("=", 2);
    if (key2 === "t") timestamp = value ?? "";
    if (key2 === "v1" && value) signatures.push(value);
  }
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || signatures.length === 0 || Math.abs(Date.now() / 1e3 - timestampNumber) > 300) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)));
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}
__name(verifyStripeSignature, "verifyStripeSignature");

// ../home/runner/work/4Planet.05/4Planet.05/functions/api/market-commerce-status.ts
var onRequestGet = /* @__PURE__ */ __name(async (ctx) => {
  const runtime = resolveMarketCommerceRuntime(ctx.env);
  const releasedProductIds = releasedMarketProductIds(ctx.env);
  return json({
    ok: true,
    environment: runtime.mode,
    publicCheckoutEnabled: runtime.isLive && releasedProductIds.length > 0,
    testCheckoutEnabled: !runtime.isLive && runtime.checkoutInfrastructureReady,
    checkoutInfrastructureReady: runtime.checkoutInfrastructureReady,
    fulfilmentInfrastructureReady: runtime.fulfilmentInfrastructureReady,
    webhookConfigured: runtime.webhookConfigured,
    releaseApproved: runtime.releaseApproved,
    photoSampleApproved: ctx.env.MARKET_PHOTO_SAMPLE_APPROVED === "true",
    artSampleApproved: ctx.env.MARKET_ART_SAMPLE_APPROVED === "true",
    releasedProductIds,
    productCount: 11,
    shippingCountry: "NO",
    paymentProvider: "Stripe",
    fulfilmentProvider: "Prodigi"
  });
}, "onRequestGet");
var onRequest = /* @__PURE__ */ __name(async (ctx) => ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "method_not_allowed" }, 405), "onRequest");

// ../home/runner/work/4Planet.05/4Planet.05/functions/_lib/createMarketCheckout.ts
async function createMarketCheckoutSession(args) {
  const { runtime, product, origin, attemptId, canary = false } = args;
  const checkoutPriceNok = canary && runtime.canaryPriceNok ? runtime.canaryPriceNok : product.commerce.candidatePriceNok;
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("line_items[0][price_data][currency]", "nok");
  form.set("line_items[0][price_data][unit_amount]", String(checkoutPriceNok * 100));
  form.set("line_items[0][price_data][product_data][name]", `${product.title} \u2014 ${product.creator}`);
  form.set("line_items[0][price_data][product_data][description]", `${product.productType} \xB7 ${product.commerce.printSize} \xB7 Enhanced Matte Art Paper \xB7 standard shipping in Norway included.`);
  form.set("line_items[0][quantity]", "1");
  form.set("customer_creation", "always");
  form.set("billing_address_collection", "auto");
  form.set("shipping_address_collection[allowed_countries][0]", "NO");
  form.set("phone_number_collection[enabled]", "true");
  form.set("success_url", `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${origin}/?checkout=cancel&product=${encodeURIComponent(product.slug)}`);
  form.set("client_reference_id", product.id);
  form.set("custom_text[submit][message]", canary ? "PRIVATE 4MARKET CANARY \u2014 this is a real payment and a real print-on-demand fulfilment test." : runtime.isLive ? "Your print will be produced on demand and shipped directly to the Norwegian delivery address entered here." : "TEST MODE \u2014 validates payment and fulfilment integration. No public sale is released by this checkout.");
  const metadata = {
    market_product_id: product.id,
    market_product_slug: product.slug,
    market_creator: product.creator,
    market_integration: "4market_stripe_prodigi_v1",
    market_environment: runtime.mode,
    market_canary: canary ? "true" : "false",
    market_price_nok: String(checkoutPriceNok),
    public_candidate_price_nok: String(product.commerce.candidatePriceNok),
    prodigi_sku: product.commerce.podSku,
    prodigi_sizing: product.commerce.podSizing,
    print_size: product.commerce.printSize,
    asset_path: product.imageUrl,
    shipping_method: product.commerce.shippingMethod,
    fulfilment_state: "AWAITING_PAYMENT"
  };
  for (const [key, value] of Object.entries(metadata)) {
    form.set(`metadata[${key}]`, value);
    form.set(`payment_intent_data[metadata][${key}]`, value);
  }
  return stripePostForm(
    runtime,
    "/v1/checkout/sessions",
    form,
    `4market_${runtime.mode.toLowerCase()}_${canary ? "canary_" : ""}${product.slug}_${attemptId}`
  );
}
__name(createMarketCheckoutSession, "createMarketCheckoutSession");

// ../home/runner/work/4Planet.05/4Planet.05/functions/api/market-checkout.ts
function safeAttemptId(value) {
  if (typeof value !== "string") return crypto.randomUUID();
  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{8,80}$/.test(trimmed) ? trimmed : crypto.randomUUID();
}
__name(safeAttemptId, "safeAttemptId");
var onRequestPost = /* @__PURE__ */ __name(async (ctx) => {
  const { request, env } = ctx;
  const runtime = resolveMarketCommerceRuntime(env);
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;
  if (!isAllowedMarketOrigin(origin, runtime.mode)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  const product = requireMarketProduct(body.productId);
  if (!product) return json({ ok: false, error: "unsupported_market_product" }, 400);
  if (!productCanCheckout(product, env)) {
    return json({ ok: false, error: runtime.isLive ? "market_product_not_released" : "market_checkout_not_ready", environment: runtime.mode }, 503);
  }
  const result = await createMarketCheckoutSession({
    runtime,
    product,
    origin,
    attemptId: safeAttemptId(body.attemptId)
  });
  const stripe = result.payload;
  const expectedPrefix = runtime.isLive ? "cs_live_" : "cs_test_";
  if (!result.ok || !stripe?.id?.startsWith(expectedPrefix) || !stripe.url || stripe.livemode !== runtime.isLive) {
    return json({ ok: false, error: "stripe_checkout_create_failed", stripeType: stripe?.error?.type ?? null }, 502);
  }
  return json({
    ok: true,
    environment: runtime.mode,
    sessionId: stripe.id,
    url: stripe.url,
    productId: product.id,
    amountNok: product.commerce.candidatePriceNok,
    currency: "NOK",
    fulfilment: "Prodigi POD",
    shippingCountry: "NO"
  });
}, "onRequestPost");
var onRequest2 = /* @__PURE__ */ __name(async (ctx) => ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405), "onRequest");

// ../home/runner/work/4Planet.05/4Planet.05/functions/api/market-canary-checkout.ts
function safeAttemptId2(value) {
  if (typeof value !== "string") return crypto.randomUUID();
  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{8,80}$/.test(trimmed) ? trimmed : crypto.randomUUID();
}
__name(safeAttemptId2, "safeAttemptId");
var onRequestPost2 = /* @__PURE__ */ __name(async (ctx) => {
  const { request, env } = ctx;
  const runtime = resolveMarketCommerceRuntime(env);
  if (!runtime.isLive || !runtime.canaryEnabled || !runtime.canaryToken) return json({ ok: false, error: "live_canary_closed" }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  const token = typeof body.token === "string" ? body.token : "";
  if (!token || !constantTimeEqual(token, runtime.canaryToken)) return json({ ok: false, error: "invalid_canary_token" }, 401);
  const product = requireMarketProduct(body.productId);
  if (!product) return json({ ok: false, error: "unsupported_market_product" }, 400);
  if (!productCanCanary(product, env)) return json({ ok: false, error: "live_canary_infrastructure_not_ready" }, 503);
  const result = await createMarketCheckoutSession({
    runtime,
    product,
    origin: runtime.publicOrigin,
    attemptId: safeAttemptId2(body.attemptId),
    canary: true
  });
  const stripe = result.payload;
  if (!result.ok || !stripe?.id?.startsWith("cs_live_") || !stripe.url || stripe.livemode !== true) {
    return json({ ok: false, error: "stripe_live_canary_create_failed", stripeType: stripe?.error?.type ?? null }, 502);
  }
  return json({
    ok: true,
    environment: "LIVE",
    canary: true,
    sessionId: stripe.id,
    url: stripe.url,
    productId: product.id,
    amountNok: runtime.canaryPriceNok ?? product.commerce.candidatePriceNok,
    warning: "This checkout captures a real payment and, after payment, creates a real Prodigi fulfilment order."
  });
}, "onRequestPost");
var onRequest3 = /* @__PURE__ */ __name(async (ctx) => ctx.request.method === "POST" ? onRequestPost2(ctx) : json({ ok: false, error: "method_not_allowed" }, 405), "onRequest");

// ../home/runner/work/4Planet.05/4Planet.05/functions/api/market-stripe-webhook.ts
function shippingFromSession(session) {
  return session.collected_information?.shipping_details ?? session.shipping_details ?? null;
}
__name(shippingFromSession, "shippingFromSession");
function orderRecipient(session) {
  const shipping = shippingFromSession(session);
  const address = shipping?.address ?? session.customer_details?.address ?? null;
  if (!address?.line1 || !address.postal_code || !address.city || address.country !== "NO") return null;
  return {
    name: shipping?.name || session.customer_details?.name || "4MARKET customer",
    email: session.customer_details?.email || void 0,
    phoneNumber: session.customer_details?.phone || void 0,
    address: {
      line1: address.line1,
      line2: address.line2 || void 0,
      postalOrZipCode: address.postal_code,
      countryCode: "NO",
      townOrCity: address.city,
      stateOrCounty: address.state || void 0
    }
  };
}
__name(orderRecipient, "orderRecipient");
async function loadAuthoritativeSession(runtime, id) {
  const response = await stripeGet(runtime, `/v1/checkout/sessions/${encodeURIComponent(id)}`);
  return response.ok ? response.payload : null;
}
__name(loadAuthoritativeSession, "loadAuthoritativeSession");
var onRequestPost3 = /* @__PURE__ */ __name(async (ctx) => {
  const { request, env } = ctx;
  const runtime = resolveMarketCommerceRuntime(env);
  if (!runtime.webhookConfigured || !runtime.stripeWebhookSecret) return json({ ok: false, error: "stripe_webhook_not_configured" }, 503);
  const signature = request.headers.get("Stripe-Signature") ?? request.headers.get("stripe-signature") ?? "";
  const rawBody = await request.text();
  if (!await verifyStripeSignature(rawBody, signature, runtime.stripeWebhookSecret)) return json({ ok: false, error: "invalid_signature" }, 400);
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ ok: false, error: "invalid_event_json" }, 400);
  }
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
  const expectedPriceNok = isCanary && runtime.canaryPriceNok ? runtime.canaryPriceNok : product.commerce.candidatePriceNok;
  const metadataPriceNok = Number(session.metadata?.market_price_nok ?? NaN);
  const amountOk = session.amount_total === expectedPriceNok * 100 && metadataPriceNok === expectedPriceNok && session.currency?.toLowerCase() === "nok";
  if (!amountOk) return json({ ok: false, error: "market_amount_mismatch" }, 503);
  const fulfilmentAllowed = isCanary ? runtime.canaryEnabled && runtime.providerFulfilmentReady : runtime.fulfilmentInfrastructureReady;
  if (!fulfilmentAllowed || !runtime.prodigiConfigured) {
    return json({ ok: false, error: isCanary ? "live_canary_fulfilment_not_ready" : "prodigi_fulfilment_not_ready" }, 503);
  }
  const recipient = orderRecipient(session);
  if (!recipient) return json({ ok: false, error: "norwegian_shipping_address_missing" }, 503);
  const callbackUrl = prodigiCallbackUrl(env);
  if (!callbackUrl) return json({ ok: false, error: "prodigi_callback_not_ready" }, 503);
  const item = {
    merchantReference: product.id,
    sku: product.commerce.podSku,
    copies: 1,
    sizing: product.commerce.podSizing,
    assets: [{ printArea: "default", url: productAssetUrl(product, env) }]
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
      marketCanary: isCanary
    }
  });
  const prodigi = prodigiResult.payload;
  const acceptableOutcome = ["created", "alreadyexists", "onhold"].includes(String(prodigi?.outcome ?? "").replace(/\s/g, "").toLowerCase());
  const prodigiOrderId = prodigi?.order?.id ?? "";
  if (!prodigiResult.ok || !acceptableOutcome || !prodigiOrderId.startsWith("ord_")) {
    await updateStripeSessionMetadata(runtime, sessionId, { fulfilment_state: "PRODIGI_CREATE_FAILED" });
    return json({ ok: false, error: "prodigi_order_create_failed", prodigiOutcome: prodigi?.outcome ?? null }, 503);
  }
  const metadataWrite = await updateStripeSessionMetadata(runtime, sessionId, {
    prodigi_order_id: prodigiOrderId,
    fulfilment_state: prodigi?.order?.status?.stage ?? "ORDER_CREATED",
    fulfilment_provider: "Prodigi"
  });
  if (!metadataWrite.ok) return json({ ok: false, error: "stripe_fulfilment_link_failed" }, 503);
  return json({
    ok: true,
    received: true,
    canary: isCanary,
    paymentState: "PAID",
    fulfilmentState: prodigi?.order?.status?.stage ?? "ORDER_CREATED",
    prodigiOrderId
  });
}, "onRequestPost");
var onRequest4 = /* @__PURE__ */ __name(async (ctx) => ctx.request.method === "POST" ? onRequestPost3(ctx) : json({ ok: false, error: "method_not_allowed" }, 405), "onRequest");

// ../home/runner/work/4Planet.05/4Planet.05/functions/api/market-order-status.ts
function allowedHost(hostname) {
  return hostname === "4planetmarket.com" || hostname === "www.4planetmarket.com" || hostname.endsWith(".4planet-05.pages.dev") || hostname === "localhost";
}
__name(allowedHost, "allowedHost");
var onRequestGet2 = /* @__PURE__ */ __name(async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  if (!allowedHost(url.hostname)) return json({ ok: false, error: "host_not_allowed" }, 403);
  const runtime = resolveMarketCommerceRuntime(env);
  if (!runtime.stripeConfigured) return json({ ok: false, error: "stripe_runtime_not_configured" }, 503);
  const sessionId = url.searchParams.get("session_id")?.trim() ?? "";
  const expectedPrefix = runtime.isLive ? "cs_live_" : "cs_test_";
  if (!sessionId.startsWith(expectedPrefix)) return json({ ok: false, error: "invalid_market_session" }, 400);
  const stripeResult = await stripeGet(runtime, `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
  const session = stripeResult.payload;
  if (!stripeResult.ok || !session) return json({ ok: false, error: "stripe_session_lookup_failed" }, 502);
  if (session.metadata?.market_integration !== "4market_stripe_prodigi_v1") return json({ ok: false, error: "not_market_commerce_session" }, 400);
  const product = requireMarketProduct(session.metadata?.market_product_id);
  if (!product) return json({ ok: false, error: "unknown_market_product" }, 400);
  const paymentConfirmed = session.status === "complete" && session.payment_status === "paid";
  const prodigiOrderId = session.metadata?.prodigi_order_id ?? null;
  if (!prodigiOrderId || !runtime.prodigiConfigured) {
    return json({
      ok: true,
      environment: runtime.mode,
      sessionId,
      productId: product.id,
      title: product.title,
      creator: product.creator,
      amountNok: typeof session.amount_total === "number" ? session.amount_total / 100 : null,
      currency: session.currency?.toUpperCase() ?? null,
      paymentState: paymentConfirmed ? "PAID" : String(session.payment_status ?? session.status ?? "UNKNOWN").toUpperCase(),
      fulfilmentState: prodigiOrderId ? "PROVIDER_STATUS_UNAVAILABLE" : paymentConfirmed ? "AWAITING_PRODUCTION_ORDER" : "AWAITING_PAYMENT",
      prodigiOrderId,
      tracking: null
    });
  }
  const prodigiResult = await prodigiGet(runtime, `/v4.0/orders/${encodeURIComponent(prodigiOrderId)}`);
  const prodigi = prodigiResult.payload;
  const order = prodigi?.order;
  if (!prodigiResult.ok || !order || order.merchantReference !== sessionId) {
    return json({ ok: false, error: "prodigi_order_lookup_failed", paymentState: paymentConfirmed ? "PAID" : "NOT_CONFIRMED" }, 502);
  }
  const shipment = order.shipments?.find((item) => item.tracking?.url || item.tracking?.number) ?? order.shipments?.[0] ?? null;
  return json({
    ok: true,
    environment: runtime.mode,
    sessionId,
    productId: product.id,
    title: product.title,
    creator: product.creator,
    amountNok: typeof session.amount_total === "number" ? session.amount_total / 100 : null,
    currency: session.currency?.toUpperCase() ?? null,
    paymentState: paymentConfirmed ? "PAID" : String(session.payment_status ?? session.status ?? "UNKNOWN").toUpperCase(),
    fulfilmentState: order.status?.stage ?? "UNKNOWN",
    fulfilmentDetails: order.status?.details ?? null,
    issues: order.status?.issues ?? [],
    prodigiOrderId: order.id ?? prodigiOrderId,
    tracking: shipment ? {
      status: shipment.status ?? null,
      carrier: shipment.carrier ?? null,
      dispatchDate: shipment.dispatchDate ?? null,
      number: shipment.tracking?.number ?? null,
      url: shipment.tracking?.url ?? null,
      fulfilmentCountry: shipment.fulfillmentLocation?.countryCode ?? null
    } : null
  });
}, "onRequestGet");
var onRequest5 = /* @__PURE__ */ __name(async (ctx) => ctx.request.method === "GET" ? onRequestGet2(ctx) : json({ ok: false, error: "method_not_allowed" }, 405), "onRequest");

// ../home/runner/work/4Planet.05/4Planet.05/functions/api/market-prodigi-callback.ts
function callbackOrderId(event) {
  if (event.subject?.startsWith("ord_")) return event.subject;
  const data = event.data;
  if (data?.order?.id?.startsWith("ord_")) return data.order.id;
  if (data?.id?.startsWith("ord_")) return data.id;
  return null;
}
__name(callbackOrderId, "callbackOrderId");
var onRequestPost4 = /* @__PURE__ */ __name(async (ctx) => {
  const { request, env } = ctx;
  const runtime = resolveMarketCommerceRuntime(env);
  const supplied = new URL(request.url).searchParams.get("token") ?? "";
  if (!runtime.callbackToken || !supplied || !constantTimeEqual(supplied, runtime.callbackToken)) {
    return json({ ok: false, error: "invalid_callback_token" }, 401);
  }
  if (!runtime.prodigiConfigured || !runtime.stripeConfigured) return json({ ok: false, error: "commerce_runtime_not_ready" }, 503);
  let event;
  try {
    event = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  const orderId = callbackOrderId(event);
  if (!orderId) return json({ ok: false, error: "prodigi_order_id_missing" }, 400);
  const prodigiResult = await prodigiGet(runtime, `/v4.0/orders/${encodeURIComponent(orderId)}`);
  const prodigi = prodigiResult.payload;
  const order = prodigi?.order;
  if (!prodigiResult.ok || !order?.id?.startsWith("ord_") || !order.merchantReference) {
    return json({ ok: false, error: "prodigi_readback_failed" }, 503);
  }
  const sessionId = order.merchantReference;
  const expectedSessionPrefix = runtime.isLive ? "cs_live_" : "cs_test_";
  if (!sessionId.startsWith(expectedSessionPrefix)) return json({ ok: false, error: "invalid_merchant_reference" }, 400);
  const stripeResult = await stripeGet(runtime, `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`);
  const session = stripeResult.payload;
  if (!stripeResult.ok || session?.metadata?.market_integration !== "4market_stripe_prodigi_v1") {
    return json({ ok: false, error: "stripe_market_session_readback_failed" }, 503);
  }
  const shipment = order.shipments?.find((item) => item.tracking?.number || item.tracking?.url) ?? order.shipments?.[0] ?? null;
  const metadata = {
    prodigi_order_id: order.id,
    fulfilment_state: order.status?.stage ?? "UNKNOWN",
    fulfilment_provider: "Prodigi",
    prodigi_last_event: event.type ?? "callback"
  };
  if (shipment?.status) metadata.shipment_status = shipment.status;
  if (shipment?.carrier) metadata.shipping_carrier = shipment.carrier;
  if (shipment?.dispatchDate) metadata.dispatch_date = shipment.dispatchDate;
  if (shipment?.tracking?.number) metadata.tracking_number = shipment.tracking.number;
  if (shipment?.tracking?.url) metadata.tracking_url = shipment.tracking.url;
  const metadataWrite = await updateStripeSessionMetadata(runtime, sessionId, metadata);
  if (!metadataWrite.ok) return json({ ok: false, error: "stripe_tracking_write_failed" }, 503);
  return json({
    ok: true,
    received: true,
    orderId: order.id,
    fulfilmentState: order.status?.stage ?? "UNKNOWN",
    trackingLinked: Boolean(shipment?.tracking?.number || shipment?.tracking?.url)
  });
}, "onRequestPost");
var onRequest6 = /* @__PURE__ */ __name(async (ctx) => ctx.request.method === "POST" ? onRequestPost4(ctx) : json({ ok: false, error: "method_not_allowed" }, 405), "onRequest");

// ../home/runner/work/4Planet.05/4Planet.05/workers/4planetmarket-commerce.ts
var FOUNDER_SAMPLE_PRODUCT_ID = "market:amalie:a14";
var FOUNDER_SAMPLE_ATTEMPT_ID = "founderA14PhysicalSample01";
async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
__name(sha256Hex, "sha256Hex");
function constantTimeEqual2(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}
__name(constantTimeEqual2, "constantTimeEqual");
async function founderTokenValid(token, env) {
  const expected = env.MARKET_FOUNDER_SAMPLE_TOKEN_SHA256?.trim() ?? "";
  if (!token || expected.length !== 64) return false;
  return constantTimeEqual2(await sha256Hex(token), expected);
}
__name(founderTokenValid, "founderTokenValid");
async function founderSampleCheckout(ctx) {
  if (ctx.request.method !== "POST") return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), { status: 405, headers: { "content-type": "application/json" } });
  let body;
  try {
    body = await ctx.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), { status: 400, headers: { "content-type": "application/json" } });
  }
  const founderToken = typeof body.token === "string" ? body.token : "";
  if (!await founderTokenValid(founderToken, ctx.env)) return new Response(JSON.stringify({ ok: false, error: "founder_sample_not_authorized" }), { status: 401, headers: { "content-type": "application/json" } });
  if (!ctx.env.MARKET_LIVE_CANARY_TOKEN) return new Response(JSON.stringify({ ok: false, error: "live_canary_closed" }), { status: 503, headers: { "content-type": "application/json" } });
  const internalRequest = new Request("https://4planetmarket.com/api/market-canary-checkout", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      productId: FOUNDER_SAMPLE_PRODUCT_ID,
      token: ctx.env.MARKET_LIVE_CANARY_TOKEN,
      attemptId: FOUNDER_SAMPLE_ATTEMPT_ID
    })
  });
  return onRequest3({ request: internalRequest, env: ctx.env });
}
__name(founderSampleCheckout, "founderSampleCheckout");
async function founderSamplePage(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  if (!await founderTokenValid(token, env)) return new Response("Not found", { status: 404 });
  const price = env.MARKET_CANARY_PRICE_NOK || "3";
  const safeToken = JSON.stringify(token);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Frog Treehouse \u2014 private sample</title>
<style>body{margin:0;background:#f5f2e8;color:#111;font-family:Arial,Helvetica,sans-serif}main{max-width:1120px;margin:0 auto;padding:24px}.top{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.12em;border-bottom:1px solid #111;padding-bottom:14px}.grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:42px;padding-top:32px}img{width:100%;display:block;background:#ddd}.eyebrow{font-size:12px;letter-spacing:.12em}.title{font-size:clamp(42px,7vw,88px);line-height:.9;margin:20px 0 18px;font-weight:700}.meta{font-size:15px;line-height:1.6}.price{font-size:34px;margin:28px 0 6px}.note{font-size:13px;line-height:1.5;max-width:460px}.buy{margin-top:24px;width:100%;padding:18px;border:0;background:#111;color:#fff;font-size:15px;font-weight:700;letter-spacing:.08em;cursor:pointer}.buy:disabled{opacity:.55}.status{margin-top:14px;font-size:13px}.back{display:inline-block;margin-top:24px;color:#111}@media(max-width:760px){.grid{grid-template-columns:1fr;gap:24px}.title{font-size:48px}}</style></head>
<body><main><div class="top"><strong>4PLANET_ MARKET</strong><span>PRIVATE PHYSICAL SAMPLE</span></div><div class="grid"><div><img src="/market/amalie/a14-frog-treehouse-snake-mole.jpg" alt="Frog Treehouse / Snake / Mole \u2014 Amalie Marie Myrtvedt"></div><div><div class="eyebrow">AMALIE MARIE MYRTVEDT \xB7 ART PRINT</div><h1 class="title">FROG<br>TREEHOUSE.</h1><div class="meta">6 \xD7 8 IN / 15 \xD7 20 CM<br>Enhanced Matte Art Paper \xB7 200 gsm<br>Standard shipping \xB7 Norway</div><div class="price">NOK ${price}</div><div class="note">Founder sample price. This is a real live payment and a real Prodigi print order. Prodigi production and shipping are charged separately to the 4PLANET Prodigi account.</div><button class="buy" id="buy">BUY SAMPLE \u2192</button><div class="status" id="status"></div><a class="back" href="/">\u2190 4PLANET MARKET</a></div></div></main>
<script>const token=${safeToken};const b=document.getElementById('buy');const s=document.getElementById('status');b.addEventListener('click',async()=>{b.disabled=true;b.textContent='OPENING SECURE CHECKOUT\u2026';s.textContent='';try{const r=await fetch('/api/market-founder-sample-checkout',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({token})});const p=await r.json();if(!r.ok||!p.url)throw new Error(p.error||'checkout_unavailable');location.assign(p.url)}catch(e){s.textContent='Checkout could not be opened. No payment was taken.';b.disabled=false;b.textContent='BUY SAMPLE \u2192'}});<\/script></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow, noarchive" } });
}
__name(founderSamplePage, "founderSamplePage");
var routes = {
  "/api/market-commerce-status": onRequest,
  "/api/market-checkout": onRequest2,
  "/api/market-canary-checkout": onRequest3,
  "/api/market-founder-sample-checkout": founderSampleCheckout,
  "/api/market-stripe-webhook": onRequest4,
  "/api/market-order-status": onRequest5,
  "/api/market-prodigi-callback": onRequest6
};
function withMarketHeaders(response, env) {
  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  headers.set("x-4planet-market", env.MARKET_MARKER || "4market-commerce");
  headers.set("x-4planet-market-source", env.MARKET_SOURCE_SHA || "unknown");
  headers.set("cache-control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
__name(withMarketHeaders, "withMarketHeaders");
async function proxyMarket(request, env) {
  if (!env.MARKET_UPSTREAM) return new Response("Market upstream unavailable", { status: 503 });
  const incoming = new URL(request.url);
  const upstreamBase = new URL(env.MARKET_UPSTREAM);
  const upstream = new URL(incoming.pathname || "/", upstreamBase);
  upstream.search = incoming.search;
  const headers = new Headers(request.headers);
  headers.delete("authorization");
  headers.delete("cookie");
  const proxied = new Request(upstream.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? void 0 : request.body,
    redirect: "manual"
  });
  return fetch(proxied);
}
__name(proxyMarket, "proxyMarket");
var planetmarket_commerce_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/market-health") {
      return withMarketHeaders(new Response(JSON.stringify({ ok: true, source: env.MARKET_SOURCE_SHA }), {
        headers: { "content-type": "application/json; charset=utf-8" }
      }), env);
    }
    if (url.pathname === "/sample/a14") {
      return withMarketHeaders(await founderSamplePage(request, env), env);
    }
    const handler = routes[url.pathname];
    if (handler) {
      try {
        return withMarketHeaders(await handler({ request, env }), env);
      } catch (error) {
        console.error("4MARKET commerce route failed", url.pathname, error instanceof Error ? error.message : "unknown");
        return withMarketHeaders(new Response(JSON.stringify({ ok: false, error: "market_runtime_error" }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8" }
        }), env);
      }
    }
    return withMarketHeaders(await proxyMarket(request, env), env);
  }
};
export {
  planetmarket_commerce_default as default
};
//# sourceMappingURL=4planetmarket-commerce.js.map
