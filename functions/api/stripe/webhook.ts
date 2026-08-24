interface Env {
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_CHECKOUT_TEST_ENABLED?: string;
}

type StripeEvent = {
  id: string;
  type: string;
  livemode?: boolean;
  data?: { object?: { id?: string; metadata?: Record<string, string> | null; [key: string]: unknown } };
};

const encoder = new TextEncoder();
const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
const constantTimeEqual = (a: string, b: string) => { if (a.length !== b.length) return false; let result = 0; for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0; };

function parseStripeSignature(header: string) {
  let timestamp: string | undefined;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = value;
    if (key === "v1" && value) signatures.push(value);
  }
  return { timestamp, signatures };
}

async function verifySignature(payload: string, header: string, secret: string) {
  const { timestamp, signatures } = parseStripeSignature(header);
  if (!timestamp || signatures.length === 0) return false;
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)));
  return signatures.some((signature) => constantTimeEqual(expected, signature));
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  if (env.STRIPE_CHECKOUT_TEST_ENABLED !== "true") return new Response("disabled", { status: 503 });
  const secret = env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !secret.startsWith("whsec_")) return new Response("Webhook secret not configured", { status: 503 });
  const signature = request.headers.get("Stripe-Signature");
  if (!signature) return new Response("Missing Stripe-Signature", { status: 400 });
  const rawBody = await request.text();
  if (!(await verifySignature(rawBody, signature, secret))) return new Response("Invalid signature", { status: 400 });

  let event: StripeEvent;
  try { event = JSON.parse(rawBody) as StripeEvent; } catch { return new Response("Invalid payload", { status: 400 }); }
  if (event.livemode === true) return new Response("Live event rejected by test endpoint", { status: 400 });

  const object = event.data?.object;
  const productKey = object?.metadata?.["4planet_product_key"] ?? null;
  const truthState = object?.metadata?.truth_state ?? null;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.paid":
    case "invoice.payment_failed":
    case "charge.refunded":
      console.log("Stripe TEST event", { eventId: event.id, type: event.type, objectId: object?.id ?? null, productKey, truthState });
      break;
    default:
      console.log("Stripe TEST event ignored", { eventId: event.id, type: event.type });
  }

  // Financial-event truth ends here. IMPACT Delivery, Evidence, Outcome and System Impact
  // are separate states and cannot be inferred from Stripe events.
  return new Response("ok", { status: 200 });
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => ctx.request.method === "POST" ? onRequestPost(ctx) : new Response("method_not_allowed", { status: 405 });
