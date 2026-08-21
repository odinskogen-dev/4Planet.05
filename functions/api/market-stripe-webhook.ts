interface Env {
  STRIPE_MARKET_TEST_WEBHOOK_SECRET?: string;
  MARKET_STRIPE_TEST_ENABLED?: string;
}

type StripeEvent = {
  id?: string;
  type?: string;
  livemode?: boolean;
  data?: {
    object?: {
      id?: string;
      status?: string;
      payment_status?: string;
      amount_total?: number;
      currency?: string;
      metadata?: Record<string, string> | null;
    };
  };
};

const TEST_PRODUCT_ID = "photo:arctic-white-angel-01";
const TEST_AMOUNT_MINOR = 300;
const SIGNATURE_TOLERANCE_SECONDS = 300;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });

function parseStripeSignature(header: string) {
  const values = header.split(",").map((part) => part.trim());
  const timestamp = values.find((part) => part.startsWith("t="))?.slice(2) ?? "";
  const signatures = values
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
    .filter(Boolean);
  return { timestamp, signatures };
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

async function verifySignature(rawBody: string, header: string, secret: string) {
  const { timestamp, signatures } = parseStripeSignature(header);
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || signatures.length === 0) return false;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestampNumber) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`),
  );
  const expected = bytesToHex(digest);
  return signatures.some((candidate) => constantTimeEqual(candidate, expected));
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  if (env.MARKET_STRIPE_TEST_ENABLED !== "true") {
    return json({ ok: false, error: "market_stripe_test_disabled" }, 503);
  }

  const webhookSecret = env.STRIPE_MARKET_TEST_WEBHOOK_SECRET?.trim();
  if (!webhookSecret || !webhookSecret.startsWith("whsec_")) {
    return json({ ok: false, error: "webhook_secret_missing" }, 503);
  }

  const signatureHeader = request.headers.get("stripe-signature") ?? "";
  const rawBody = await request.text();
  if (!(await verifySignature(rawBody, signatureHeader, webhookSecret))) {
    return json({ ok: false, error: "invalid_signature" }, 400);
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return json({ ok: false, error: "invalid_event_json" }, 400);
  }

  if (event.livemode) return json({ ok: false, error: "live_event_rejected" }, 400);

  const session = event.data?.object;
  const metadataOk =
    session?.metadata?.integration === "4market_test_checkout" &&
    session?.metadata?.market_product_id === TEST_PRODUCT_ID;
  const amountOk = session?.amount_total === TEST_AMOUNT_MINOR && session?.currency === "nok";

  const isCompletionEvent =
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded";
  const paymentConfirmed =
    isCompletionEvent && session?.payment_status === "paid" && metadataOk && amountOk;

  // Cloudflare logs provide an audit trace for the controlled canary. Durable order
  // persistence is intentionally a separate live-commerce gate.
  console.log(
    JSON.stringify({
      kind: "4market_stripe_event",
      eventId: event.id ?? null,
      eventType: event.type ?? null,
      sessionId: session?.id ?? null,
      paymentConfirmed,
      orderState: paymentConfirmed ? "PAYMENT_CAPTURED" : "NO_PRODUCTION_AUTHORITY",
    }),
  );

  return json({
    ok: true,
    received: true,
    paymentConfirmed,
    orderState: paymentConfirmed ? "PAYMENT_CAPTURED" : "NO_PRODUCTION_AUTHORITY",
  });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
