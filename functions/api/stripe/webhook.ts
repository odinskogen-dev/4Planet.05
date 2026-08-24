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
  current_period_end?: number;
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
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
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
    case "checkout.session.completed": return object.payment_status === "paid" || object.payment_status === "no_payment_required" ? "PAID" : "CHECKOUT_COMPLETE_PAYMENT_PENDING";
    case "checkout.session.async_payment_succeeded": return "PAID";
    case "checkout.session.async_payment_failed": return "PAYMENT_FAILED";
    case "checkout.session.expired": return "CHECKOUT_EXPIRED";
    case "payment_intent.succeeded": return "PAID";
    case "payment_intent.payment_failed": return "PAYMENT_FAILED";
    case "invoice.finalized": return "INVOICE_FINALIZED";
    case "invoice.paid": return "INVOICE_PAID";
    case "invoice.payment_failed": return "INVOICE_PAYMENT_FAILED";
    case "invoice.voided": return "INVOICE_VOIDED";
    case "charge.refunded": return object.refunded === true || (typeof object.amount === "number" && object.amount_refunded === object.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED";
    case "charge.dispute.created": return "DISPUTED";
    case "charge.dispute.closed": return `DISPUTE_${String(object.status ?? "CLOSED").toUpperCase()}`;
    case "customer.subscription.created": return `SUBSCRIPTION_${String(object.status ?? "CREATED").toUpperCase()}`;
    case "customer.subscription.updated": return `SUBSCRIPTION_${String(object.status ?? "UPDATED").toUpperCase()}`;
    case "customer.subscription.deleted": return "SUBSCRIPTION_CANCELLED";
    default: return "EVENT_RECORDED";
  }
}

function amountMinor(object: StripeObject) {
  for (const value of [object.amount_total, object.amount_paid, object.amount_received, object.amount, object.amount_due]) if (typeof value === "number") return value;
  return null;
}

function serviceConfig(env: WebhookEnv) {
  const url = env.SUPABASE_URL?.replace(/\/$/, "");
  const service = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && service ? { url, service } : null;
}

async function serviceFetch(env: WebhookEnv, path: string, init: RequestInit = {}) {
  const cfg = serviceConfig(env);
  if (!cfg) return null;
  const headers = new Headers(init.headers);
  headers.set("apikey", cfg.service);
  headers.set("authorization", `Bearer ${cfg.service}`);
  if (!headers.has("content-type") && init.body) headers.set("content-type", "application/json");
  return fetch(`${cfg.url}/rest/v1/${path}`, { ...init, headers });
}

async function supabaseWrite(env: WebhookEnv, table: string, body: unknown, conflict: string) {
  const response = await serviceFetch(env, `${table}?on_conflict=${encodeURIComponent(conflict)}`, {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(body),
  });
  return response ? { configured: true, ok: response.ok, status: response.status } : { configured: false, ok: false };
}

async function resolveUserId(env: WebhookEnv, environment: "TEST" | "LIVE", object: StripeObject) {
  const direct = object.metadata?.["4planet_user_id"];
  if (direct && UUID.test(direct)) return direct;
  if (!object.customer?.startsWith("cus_")) return null;
  const response = await serviceFetch(env, `stripe_customer_links?stripe_customer_id=eq.${encodeURIComponent(object.customer)}&environment=eq.${environment}&select=user_id&limit=1`);
  if (!response?.ok) return null;
  const rows = await response.json().catch(() => []) as Array<{ user_id?: string }>;
  return rows[0]?.user_id && UUID.test(rows[0].user_id) ? rows[0].user_id : null;
}

async function applyProjection(env: WebhookEnv, runtime: ReturnType<typeof webhookRuntime>, event: StripeEvent, object: StripeObject, metadata: Record<string, string>, userId: string | null, state: string, occurredAt: string) {
  if (!serviceConfig(env)) return { configured: false, ok: false };
  const rpc = await serviceFetch(env, "rpc/apply_commerce_financial_record", {
    method: "POST",
    body: JSON.stringify({
      p_stripe_object_id: object.id,
      p_stripe_object_type: object.object ?? "unknown",
      p_environment: runtime.environment,
      p_product_key: metadata["4planet_product_key"] ?? null,
      p_product_kind: metadata.product_kind ?? null,
      p_product_family: metadata.product_family ?? null,
      p_user_id: userId,
      p_customer_id: object.customer ?? null,
      p_subscription_id: object.subscription ?? (object.object === "subscription" ? object.id : null),
      p_invoice_id: object.invoice ?? (object.object === "invoice" ? object.id : null),
      p_payment_intent_id: object.payment_intent ?? (object.object === "payment_intent" ? object.id : null),
      p_currency: object.currency ?? null,
      p_amount_minor: amountMinor(object),
      p_financial_state: state,
      p_mission: metadata.mission ?? null,
      p_mission_slug: metadata.mission_slug ?? null,
      p_reference_key: metadata.reference_key ?? null,
      p_provider_event_created_at: occurredAt,
      p_updated_at: new Date().toISOString(),
    }),
  });
  if (rpc?.ok) return { configured: true, ok: true };

  // TEST may still exercise Stripe while a staging migration is unavailable. LIVE never falls back to an unguarded projection.
  if (runtime.environment === "TEST" && object.id) {
    return supabaseWrite(env, "commerce_financial_records", {
      stripe_object_id: object.id,
      stripe_object_type: object.object ?? "unknown",
      environment: runtime.environment,
      product_key: metadata["4planet_product_key"] ?? null,
      product_kind: metadata.product_kind ?? null,
      product_family: metadata.product_family ?? null,
      user_id: userId,
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
      provider_event_created_at: occurredAt,
      updated_at: new Date().toISOString(),
    }, "stripe_object_id");
  }
  return { configured: true, ok: false, status: rpc?.status };
}

async function persistFinancialTruth(env: WebhookEnv, runtime: ReturnType<typeof webhookRuntime>, event: StripeEvent) {
  const object = event.data?.object ?? {};
  const metadata = object.metadata ?? {};
  const state = financialState(event.type, object);
  const occurredAt = typeof event.created === "number" ? new Date(event.created * 1000).toISOString() : new Date().toISOString();
  const userId = await resolveUserId(env, runtime.environment, object);

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
      account_linked: Boolean(userId),
    },
  }, "stripe_event_id");

  if (userId && object.customer?.startsWith("cus_") && metadata["4planet_user_id"] === userId) {
    const linkWrite = await supabaseWrite(env, "stripe_customer_links", {
      user_id: userId,
      stripe_customer_id: object.customer,
      environment: runtime.environment,
      verified_at: new Date().toISOString(),
    }, "user_id,environment");
    if (runtime.environment === "LIVE" && linkWrite.configured && !linkWrite.ok) return { configured: true, ok: false, stage: "customer_link", status: linkWrite.status };
  }

  if (object.id) {
    const recordWrite = await applyProjection(env, runtime, event, object, metadata, userId, state, occurredAt);
    if (recordWrite.configured && !recordWrite.ok) return { configured: true, ok: false, stage: "record", status: recordWrite.status };
  }

  if (userId && metadata.product_family === "IMPACT" && event.type === "checkout.session.completed" && state === "PAID" && object.id) {
    const impactWrite = await supabaseWrite(env, "impact_contributions", {
      user_id: userId,
      stripe_object_id: object.id,
      product_key: metadata["4planet_product_key"] ?? "unknown",
      financial_state: "PAYMENT_RECEIVED",
      delivery_state: "DELIVERY_PENDING",
      evidence_state: "EVIDENCE_PENDING",
      outcome_state: "OUTCOME_NOT_ESTABLISHED",
      environment: runtime.environment,
      updated_at: new Date().toISOString(),
    }, "stripe_object_id,environment");
    if (runtime.environment === "LIVE" && impactWrite.configured && !impactWrite.ok) return { configured: true, ok: false, stage: "impact", status: impactWrite.status };
  }

  if (userId && object.object === "subscription") {
    const subscriptionId = object.id ?? object.subscription;
    if (metadata.product_kind === "MEMBERSHIP" && subscriptionId) {
      const entitlementWrite = await supabaseWrite(env, "membership_entitlements", {
        user_id: userId,
        product_key: metadata["4planet_product_key"] ?? "membership_supporter",
        stripe_subscription_id: subscriptionId,
        status: state,
        current_period_end: typeof object.current_period_end === "number" ? new Date(object.current_period_end * 1000).toISOString() : null,
        environment: runtime.environment,
        updated_at: new Date().toISOString(),
      }, "user_id,product_key,environment");
      if (runtime.environment === "LIVE" && entitlementWrite.configured && !entitlementWrite.ok) return { configured: true, ok: false, stage: "membership", status: entitlementWrite.status };
    }
    if (metadata.product_kind === "MISSION_SUPPORTER" && subscriptionId && metadata.mission_slug) {
      const missionWrite = await supabaseWrite(env, "mission_supports", {
        user_id: userId,
        mission_slug: metadata.mission_slug,
        product_key: metadata["4planet_product_key"] ?? "mission_supporter",
        stripe_subscription_id: subscriptionId,
        status: state,
        environment: runtime.environment,
        updated_at: new Date().toISOString(),
      }, "user_id,mission_slug,environment");
      if (runtime.environment === "LIVE" && missionWrite.configured && !missionWrite.ok) return { configured: true, ok: false, stage: "mission_support", status: missionWrite.status };
    }
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
    "checkout.session.expired",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.finalized",
    "invoice.paid",
    "invoice.payment_failed",
    "invoice.voided",
    "charge.refunded",
    "charge.dispute.created",
    "charge.dispute.closed",
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
