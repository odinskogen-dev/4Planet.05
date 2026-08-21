type Env = {
  STRIPE_WEBHOOK_SECRET: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

type StripeEvent = {
  id: string;
  type: string;
  data?: { object?: { id?: string; [key: string]: unknown } };
};

const encoder = new TextEncoder();

const hex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const constantTimeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
};

const parseStripeSignature = (header: string) => {
  let timestamp: string | undefined;
  const signatures: string[] = [];

  for (const part of header.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key === "t") timestamp = value;
    if (key === "v1" && value) signatures.push(value);
  }

  return { timestamp, signatures };
};

async function verifySignature(payload: string, header: string, secret: string) {
  const { timestamp, signatures } = parseStripeSignature(header);
  if (!timestamp || signatures.length === 0) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - timestampNumber);
  if (ageSeconds > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const expected = hex(
    await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`)),
  );

  return signatures.some((signature) => constantTimeEqual(expected, signature));
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Webhook secret not configured", { status: 503 });
  }

  const signature = request.headers.get("Stripe-Signature");
  if (!signature) {
    return new Response("Missing Stripe-Signature", { status: 400 });
  }

  const rawBody = await request.text();
  const valid = await verifySignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const objectId = event.data?.object?.id;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
    case "checkout.session.async_payment_failed":
    case "invoice.paid":
    case "invoice.payment_failed":
    case "charge.refunded":
    case "credit_note.created":
      console.log("Stripe event", { eventId: event.id, type: event.type, objectId });
      break;
    default:
      console.log("Stripe event ignored", { eventId: event.id, type: event.type });
  }

  // Payment truth ends here for now. Fulfilment, creator payout, impact contribution,
  // provider delivery, evidence and ecological outcome remain separate states.
  return new Response("ok", { status: 200 });
}
