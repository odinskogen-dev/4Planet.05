import { FIRST_MARKET_PRODUCTS, getFirstMarketProduct, type FirstMarketProduct } from "../../src/market/firstCreatorCatalogue";

export type MarketCommerceMode = "TEST" | "LIVE";

export interface MarketCommerceEnv {
  MARKET_COMMERCE_ENV?: string;
  MARKET_PUBLIC_ORIGIN?: string;
  MARKET_STRIPE_TEST_ENABLED?: string;
  MARKET_STRIPE_LIVE_ENABLED?: string;
  MARKET_FULFILMENT_TEST_ENABLED?: string;
  MARKET_FULFILMENT_LIVE_ENABLED?: string;
  MARKET_LIVE_RELEASE_APPROVED?: string;
  MARKET_PHOTO_SAMPLE_APPROVED?: string;
  MARKET_ART_SAMPLE_APPROVED?: string;
  STRIPE_TEST_SECRET_KEY?: string;
  STRIPE_LIVE_SECRET_KEY?: string;
  STRIPE_MARKET_WEBHOOK_SECRET_TEST?: string;
  STRIPE_MARKET_WEBHOOK_SECRET_LIVE?: string;
  STRIPE_WEBHOOK_SECRET_TEST?: string;
  STRIPE_WEBHOOK_SECRET_LIVE?: string;
  PRODIGI_SANDBOX_API_KEY?: string;
  PRODIGI_TEST_API_KEY?: string;
  PRODIGI_LIVE_API_KEY?: string;
  PRODIGI_API_KEY?: string;
  MARKET_PRODIGI_CALLBACK_TOKEN?: string;
}

const bool = (value?: string) => value === "true";

export function resolveMarketCommerceRuntime(env: MarketCommerceEnv) {
  const mode: MarketCommerceMode = env.MARKET_COMMERCE_ENV === "LIVE" ? "LIVE" : "TEST";
  const isLive = mode === "LIVE";
  const stripeSecret = (isLive ? env.STRIPE_LIVE_SECRET_KEY : env.STRIPE_TEST_SECRET_KEY)?.trim();
  const stripeWebhookSecret = (isLive
    ? env.STRIPE_MARKET_WEBHOOK_SECRET_LIVE ?? env.STRIPE_WEBHOOK_SECRET_LIVE
    : env.STRIPE_MARKET_WEBHOOK_SECRET_TEST ?? env.STRIPE_WEBHOOK_SECRET_TEST)?.trim();
  const prodigiKey = (isLive
    ? env.PRODIGI_LIVE_API_KEY ?? env.PRODIGI_API_KEY
    : env.PRODIGI_SANDBOX_API_KEY ?? env.PRODIGI_TEST_API_KEY)?.trim();
  const callbackToken = env.MARKET_PRODIGI_CALLBACK_TOKEN?.trim();
  const checkoutFlag = bool(isLive ? env.MARKET_STRIPE_LIVE_ENABLED : env.MARKET_STRIPE_TEST_ENABLED);
  const fulfilmentFlag = bool(isLive ? env.MARKET_FULFILMENT_LIVE_ENABLED : env.MARKET_FULFILMENT_TEST_ENABLED);
  const releaseApproved = !isLive || bool(env.MARKET_LIVE_RELEASE_APPROVED);
  const publicOrigin = safePublicOrigin(env.MARKET_PUBLIC_ORIGIN);
  const stripeConfigured = Boolean(stripeSecret?.startsWith(isLive ? "sk_live_" : "sk_test_"));
  const webhookConfigured = Boolean(stripeWebhookSecret?.startsWith("whsec_"));
  const prodigiConfigured = Boolean(prodigiKey && prodigiKey.length >= 16);
  const callbackConfigured = Boolean(callbackToken && callbackToken.length >= 24);

  return {
    mode,
    isLive,
    publicOrigin,
    stripeSecret,
    stripeWebhookSecret,
    prodigiKey,
    callbackToken,
    prodigiBaseUrl: isLive ? "https://api.prodigi.com" : "https://api.sandbox.prodigi.com",
    checkoutFlag,
    fulfilmentFlag,
    releaseApproved,
    stripeConfigured,
    webhookConfigured,
    prodigiConfigured,
    callbackConfigured,
    checkoutInfrastructureReady: checkoutFlag && releaseApproved && stripeConfigured,
    fulfilmentInfrastructureReady: fulfilmentFlag && releaseApproved && prodigiConfigured && callbackConfigured,
  } as const;
}

function safePublicOrigin(value?: string) {
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

export function isAllowedMarketOrigin(origin: string, mode: MarketCommerceMode) {
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

export function productSampleApproved(product: FirstMarketProduct, env: MarketCommerceEnv) {
  return product.productType === "PHOTOGRAPHIC PRINT"
    ? bool(env.MARKET_PHOTO_SAMPLE_APPROVED)
    : bool(env.MARKET_ART_SAMPLE_APPROVED);
}

export function productCanCheckout(product: FirstMarketProduct, env: MarketCommerceEnv) {
  const runtime = resolveMarketCommerceRuntime(env);
  if (!runtime.checkoutInfrastructureReady) return false;
  if (!runtime.isLive) return true;
  return runtime.fulfilmentInfrastructureReady && runtime.webhookConfigured && productSampleApproved(product, env);
}

export function releasedMarketProductIds(env: MarketCommerceEnv) {
  return FIRST_MARKET_PRODUCTS.filter((product) => productCanCheckout(product, env)).map((product) => product.id);
}

export function requireMarketProduct(value: unknown) {
  if (typeof value !== "string") return null;
  return getFirstMarketProduct(value.trim());
}

export function productAssetUrl(product: FirstMarketProduct, env: MarketCommerceEnv) {
  const runtime = resolveMarketCommerceRuntime(env);
  return new URL(product.imageUrl, runtime.publicOrigin).toString();
}

export function prodigiCallbackUrl(env: MarketCommerceEnv) {
  const runtime = resolveMarketCommerceRuntime(env);
  if (!runtime.callbackToken) return null;
  const url = new URL("/api/market-prodigi-callback", runtime.publicOrigin);
  url.searchParams.set("token", runtime.callbackToken);
  return url.toString();
}

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function stripeGet(runtime: ReturnType<typeof resolveMarketCommerceRuntime>, path: string) {
  if (!runtime.stripeSecret) return { ok: false, status: 0, payload: null as unknown };
  const response = await fetch(`https://api.stripe.com${path}`, {
    headers: { authorization: `Bearer ${runtime.stripeSecret}` },
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}

export async function stripePostForm(runtime: ReturnType<typeof resolveMarketCommerceRuntime>, path: string, form: URLSearchParams, idempotencyKey?: string) {
  if (!runtime.stripeSecret) return { ok: false, status: 0, payload: null as unknown };
  const headers: Record<string, string> = {
    authorization: `Bearer ${runtime.stripeSecret}`,
    "content-type": "application/x-www-form-urlencoded",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey.slice(0, 255);
  const response = await fetch(`https://api.stripe.com${path}`, { method: "POST", headers, body: form });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}

export async function updateStripeSessionMetadata(
  runtime: ReturnType<typeof resolveMarketCommerceRuntime>,
  sessionId: string,
  metadata: Record<string, string>,
) {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(metadata)) form.set(`metadata[${key}]`, value.slice(0, 500));
  return stripePostForm(runtime, `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, form);
}

export async function prodigiGet(runtime: ReturnType<typeof resolveMarketCommerceRuntime>, path: string) {
  if (!runtime.prodigiKey) return { ok: false, status: 0, payload: null as unknown };
  const response = await fetch(`${runtime.prodigiBaseUrl}${path}`, {
    headers: { "X-API-Key": runtime.prodigiKey },
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}

export async function prodigiPost(runtime: ReturnType<typeof resolveMarketCommerceRuntime>, path: string, body: unknown) {
  if (!runtime.prodigiKey) return { ok: false, status: 0, payload: null as unknown };
  const response = await fetch(`${runtime.prodigiBaseUrl}${path}`, {
    method: "POST",
    headers: { "X-API-Key": runtime.prodigiKey, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, payload };
}

const encoder = new TextEncoder();
const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
export function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function verifyStripeSignature(payload: string, header: string, secret: string) {
  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = value ?? "";
    if (key === "v1" && value) signatures.push(value);
  }
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || signatures.length === 0 || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)));
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}
