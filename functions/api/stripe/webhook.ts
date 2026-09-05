import type { StripeEnv } from "./catalog";

type WebhookEnv = StripeEnv & {
  STRIPE_WEBHOOK_TEST_ENABLED?: string;
  STRIPE_WEBHOOK_LIVE_ENABLED?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

type StripeObject = {
  id?: string;
  object?: string;
  customer?: string | null;
  subscription?: string | null;
  invoice?: string | null;
  payment_intent?: string | null;
  payment_status?: string;
  status?: string;
  amount?: number;
  amount_total?: number | null;
  amount_due?: number;
  amount_paid?: number;
  amount_received?: number;
  amount_refunded?: number;
  currency?: string | null;
  refunded?: boolean;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, string> | null;
};

type StripeEvent = {
  id: string;
  type: string;
  livemode?: boolean;
  created?: number;
  data?: { object?: StripeObject };
};

const encoder = new TextEncoder();
const hex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
const constantTimeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return result === 0;
};

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

function webhookRuntime(env: WebhookEnv) {
  const environment = env.STRIPE_PAYMENT_ENV === "LIVE" ? "LIVE" : "TEST";
  if (environment === "LIVE") {
    return {
      environment,
      enabled: env.STRIPE_WEBHOOK_LIVE_ENABLED === "true" && env.STRIPE_LIVE_RELEASE_APPROVED === "true",
      secret: env.STRIPE_WEBHOOK_SECRET_LIVE?.trim(),
      livemode: true,
    } as const;
  }
  return {
    environment,
    enabled: env.STRIPE_WEBHOOK_TEST_ENABLED === "true" || env.STRIPE_CHECKOUT_TEST_ENABLED === "true",
    secret: (env.STRIPE_WEBHOOK_SECRET_TEST ?? env.STRIPE_WEBHOOK_SECRET)?.trim(),
    livemode: false,
  } as const;
}

function financialState(type: string, object: StripeObject) {
  switch (type) {
    case "checkout.session.completed":
      return object.payment_status === "paid" || object.payment_status === "no_payment_required" ? "PAID" : "CHECKOUT_COMPLETE_PAYMENT_PENDING";
    case "checkout.session.async_payment_succeeded": return "PAID";
    case "checkout.session.async_payment_failed": return "PAYMENT_FAILED";
    case "payment_intent.succeeded": return "PAID";
    case "payment_intent.payment_failed": return "PAYMENT_FAILED";
    case "invoice.paid": return "INVOICE_PAID";
    case "invoice.payment_failed": return "INVOICE_PAYMENT_FAILED";
    case "charge.refunded":
      return object.refunded === true || (typeof object.amount === "number" && object.amount_refunded === object.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED";
    case "customer.subscription.created": return `SUBSCRIPTION_${String(object.status ?? "CREATED").toUpperCase()}`;
    case "customer.subscription.updated": return `SUBSCRIPTION_${String(object.status ?? "UPDATED").toUpperCase()}`;
    case "customer.subscription.deleted": return "SUBSCRIPTION_CANCELLED";
    default: return "EVENT_RECORDED";
  }
}

function amountMinor(object: StripeObject) {
  for (const value of [object.amount_total, object.amount_paid, object.amount_received, object.amount, object.amount_due]) {
    if (typeof value === "number") return value;
  }
  return null;
}

async function supabaseWrite(env: WebhookEnv, table: string, body: unknown, conflict: string) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return { configured: false, ok: false };
  const response = await fetch(`${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(body),
  });
  return { configured: true, ok: response.ok, status: response.status };
}

async function persistFinancialTruth(env: WebhookEnv, runtime: ReturnType<typeof webhookRuntime>, event: StripeEvent) {
  const object = event.data?.object ?? {};
  const metadata = object.metadata ?? {};
  const state = financialState(event.type, object);
  const occurredAt = typeof event.created === "number" ? new Date(event.created * 1000).toISOString() : new Date().toISOString();

  const eventWrite = await supabaseWrite(env, "commerce_events", {
    stripe_event_id: event.id,
    environment: runtime.environment,
    event_type: event.type,
    stripe_object_id: object.id ?? null,
    stripe_object_type: object.object ?? null,
    product_key: metadata["4planet_product_key"] ?? null,
    product_family: metadata.product_family ?? null,
    financial_state: state,
    occurred_at: occurredAt,
    metadata: {
      mission: metadata.mission ?? null,
      mission_slug: metadata.mission_slug ?? null,
      reference_key: metadata.reference_key ?? null,
      truth_state: metadata.truth_state ?? null,
      ecological_delivery_authority: metadata.ecological_delivery_authority ?? null,
    },
  }, "stripe_event_id");

  if (object.id) {
    const recordWrite = await supabaseWrite(env, "commerce_financial_records", {
      stripe_object_id: object.id,
      stripe_object_type: object.object ?? "unknown",
      environment: runtime.environment,
      product_key: metadata["4planet_product_key"] ?? null,
      product_kind: metadata.product_kind ?? null,
      product_family: metadata.product_family ?? null,
      customer_id: object.customer ?? null,
      subscription_id: object.subscription ?? (object.object === "subscription" ? object.id : null),
      invoice_id: object.invoice ?? (object.object === "invoice" ? object.id : null),
      payment_intent_id: object.payment_intent ?? (object.object === "payment_intent" ? object.id : null),
      currency: object.currency ?? null,
      amount_minor: amountMinor(object),
      financial_state: state,
      mission: metadata.mission ?? null,
      mission_slug: metadata.mission_slug ?? null,
      reference_key: metadata.reference_key ?? null,
      ecological_delivery_authority: "none",
      updated_at: new Date().toISOString(),
    }, "stripe_object_id");
    if (recordWrite.configured && !recordWrite.ok) return { configured: true, ok: false, stage: "record", status: recordWrite.status };
  }

  if (eventWrite.configured && !eventWrite.ok) return { configured: true, ok: false, stage: "event", status: eventWrite.status };
  return { configured: eventWrite.configured, ok: eventWrite.ok };
}

export const onRequestPost = async (ctx: { request: Request; env: WebhookEnv }): Promise<Response> => {
  const { request, env } = ctx;
  const runtime = webhookRuntime(env);
  if (!runtime.enabled) return new Response("disabled", { status: 503 });
  if (!runtime.secret || !runtime.secret.startsWith("whsec_")) return new Response("Webhook secret not configured", { status: 503 });

  const signature = request.headers.get("Stripe-Signature");
  if (!signature) return new Response("Missing Stripe-Signature", { status: 400 });
  const rawBody = await request.text();
  if (!(await verifySignature(rawBody, signature, runtime.secret))) return new Response("Invalid signature", { status: 400 });

  let event: StripeEvent;
  try { event = JSON.parse(rawBody) as StripeEvent; } catch { return new Response("Invalid payload", { status: 400 }); }
  if (event.livemode !== runtime.livemode) return new Response("Environment mismatch", { status: 400 });

  const supported = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
    "charge.refunded",
  ]);

  if (!supported.has(event.type)) {
    console.log("Stripe event ignored", { eventId: event.id, type: event.type, environment: runtime.environment });
    return new Response("ok", { status: 200 });
  }

  const persistence = await persistFinancialTruth(env, runtime, event);
  if (runtime.environment === "LIVE" && (!persistence.configured || !persistence.ok)) {
    console.error("Stripe LIVE financial ledger persistence failed", { eventId: event.id, type: event.type, persistence });
    return new Response("ledger_unavailable", { status: 503 });
  }

  console.log("Stripe financial event", {
    eventId: event.id,
    type: event.type,
    environment: runtime.environment,
    financialState: financialState(event.type, event.data?.object ?? {}),
    persisted: persistence.configured && persistence.ok,
  });

  // Hard truth boundary: no Stripe event may mutate ecological Delivery, Evidence,
  // Outcome or System Impact. Stripe establishes financial truth only.
  return new Response("ok", { status: 200 });
};

export const onRequest = async (ctx: { request: Request; env: WebhookEnv }): Promise<Response> =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : new Response("method_not_allowed", { status: 405 });
