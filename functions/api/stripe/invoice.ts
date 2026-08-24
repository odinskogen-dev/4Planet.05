import { CATALOG, resolvePriceId, type StripeEnv } from "./catalog";

type InvoiceEnv = StripeEnv & {
  STRIPE_INVOICE_TEST_ENABLED?: string;
  STRIPE_INVOICE_LIVE_ENABLED?: string;
  STRIPE_INTERNAL_BILLING_TOKEN?: string;
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function runtime(env: InvoiceEnv) {
  const environment = env.STRIPE_PAYMENT_ENV === "LIVE" ? "LIVE" : "TEST";
  if (environment === "LIVE") return { environment, enabled: env.STRIPE_INVOICE_LIVE_ENABLED === "true" && env.STRIPE_LIVE_RELEASE_APPROVED === "true", secret: env.STRIPE_LIVE_SECRET_KEY?.trim(), expectedSecretPrefix: "sk_live_", livemode: true } as const;
  return { environment, enabled: env.STRIPE_INVOICE_TEST_ENABLED === "true", secret: env.STRIPE_TEST_SECRET_KEY?.trim(), expectedSecretPrefix: "sk_test_", livemode: false } as const;
}

function authorised(request: Request, env: InvoiceEnv) {
  const expected = env.STRIPE_INTERNAL_BILLING_TOKEN?.trim();
  return Boolean(expected && expected.length >= 24 && request.headers.get("authorization") === `Bearer ${expected}`);
}

function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function safeText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function stripePost(secret: string, path: string, form: URLSearchParams, idempotencyKey: string) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}`, "content-type": "application/x-www-form-urlencoded", "Idempotency-Key": idempotencyKey.slice(0, 255) },
    body: form,
  });
  const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
  return { response, payload };
}

async function deleteDraftInvoice(secret: string, invoiceId: string) {
  return fetch(`https://api.stripe.com/v1/invoices/${encodeURIComponent(invoiceId)}`, { method: "DELETE", headers: { authorization: `Bearer ${secret}` } }).catch(() => null);
}

export const onRequestPost = async (ctx: { request: Request; env: InvoiceEnv }): Promise<Response> => {
  const { request, env } = ctx;
  if (!authorised(request, env)) return json({ ok: false, error: "unauthorised" }, 401);

  const current = runtime(env);
  if (!current.enabled) return json({ ok: false, error: current.environment === "LIVE" ? "live_invoicing_disabled" : "test_invoicing_disabled" }, 503);
  if (!current.secret || !current.secret.startsWith(current.expectedSecretPrefix)) return json({ ok: false, error: "stripe_secret_missing" }, 503);

  let body: { customerEmail?: unknown; customerName?: unknown; stripeCustomerId?: unknown; fundingObjectKey?: unknown; referenceKey?: unknown; dueDays?: unknown; attemptId?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  const entry = CATALOG.b2b_pilot_funder;
  const priceId = resolvePriceId(entry, env, current.environment);
  if (!priceId) return json({ ok: false, error: current.environment === "LIVE" ? "live_price_not_configured" : "test_price_not_configured" }, 503);

  const fundingObjectKey = safeText(body.fundingObjectKey, 80);
  const referenceKey = safeText(body.referenceKey, 80);
  if (!fundingObjectKey || !/^[a-zA-Z0-9._:-]{2,80}$/.test(fundingObjectKey)) return json({ ok: false, error: "funding_object_key_required" }, 400);
  if (current.environment === "LIVE") {
    const allowed = new Set((env.STRIPE_LIVE_B2B_FUNDING_KEYS ?? "").split(",").map((value) => value.trim()).filter(Boolean));
    if (!allowed.has(fundingObjectKey)) return json({ ok: false, error: "funding_object_not_approved" }, 400);
  }

  const dueDays = body.dueDays === 30 ? 30 : 14;
  const attemptId = typeof body.attemptId === "string" && /^[A-Za-z0-9_-]{8,80}$/.test(body.attemptId) ? body.attemptId : crypto.randomUUID();

  let customerId = safeText(body.stripeCustomerId, 80);
  if (customerId && !customerId.startsWith("cus_")) return json({ ok: false, error: "invalid_customer_id" }, 400);
  if (!customerId) {
    if (!validEmail(body.customerEmail)) return json({ ok: false, error: "customer_email_required" }, 400);
    const customerForm = new URLSearchParams();
    customerForm.set("email", body.customerEmail.trim());
    const name = safeText(body.customerName, 120);
    if (name) customerForm.set("name", name);
    customerForm.set("metadata[4planet_funding_object_key]", fundingObjectKey);
    customerForm.set("metadata[truth_state]", current.environment);
    const created = await stripePost(current.secret, "customers", customerForm, `4p_${current.environment}_customer_${attemptId}`);
    const candidate = typeof created.payload?.id === "string" ? created.payload.id : "";
    if (!created.response.ok || !candidate.startsWith("cus_")) return json({ ok: false, error: "stripe_customer_create_failed" }, 502);
    customerId = candidate;
  }

  // Create the exact draft first. This prevents a failed invoice-create step from leaving a pending item that can leak into a later invoice.
  const invoiceForm = new URLSearchParams();
  invoiceForm.set("customer", customerId);
  invoiceForm.set("collection_method", "send_invoice");
  invoiceForm.set("days_until_due", String(dueDays));
  invoiceForm.set("auto_advance", "false");
  invoiceForm.set("pending_invoice_items_behavior", "exclude");
  invoiceForm.set("description", `4PLANET funding object: ${fundingObjectKey}`);
  invoiceForm.set("metadata[4planet_product_key]", entry.key);
  invoiceForm.set("metadata[product_kind]", entry.kind);
  invoiceForm.set("metadata[product_family]", entry.family);
  invoiceForm.set("metadata[funding_object_key]", fundingObjectKey);
  invoiceForm.set("metadata[reference_key]", referenceKey || "none");
  invoiceForm.set("metadata[truth_state]", current.environment);
  invoiceForm.set("metadata[ecological_delivery_authority]", "none");
  invoiceForm.set("metadata[contract_review_required]", "true");
  const invoice = await stripePost(current.secret, "invoices", invoiceForm, `4p_${current.environment}_invoice_${attemptId}`);
  const invoiceId = typeof invoice.payload?.id === "string" ? invoice.payload.id : "";
  const livemode = invoice.payload?.livemode === true;
  if (!invoice.response.ok || !invoiceId.startsWith("in_") || livemode !== current.livemode) return json({ ok: false, error: "stripe_invoice_create_failed" }, 502);

  // Attach the line item to this exact draft; never to an unspecified future invoice.
  const itemForm = new URLSearchParams();
  itemForm.set("invoice", invoiceId);
  itemForm.set("customer", customerId);
  itemForm.set("pricing[price]", priceId);
  itemForm.set("quantity", "1");
  itemForm.set("metadata[4planet_product_key]", entry.key);
  itemForm.set("metadata[funding_object_key]", fundingObjectKey);
  itemForm.set("metadata[reference_key]", referenceKey || "none");
  itemForm.set("metadata[truth_state]", current.environment);
  itemForm.set("metadata[ecological_delivery_authority]", "none");
  const item = await stripePost(current.secret, "invoiceitems", itemForm, `4p_${current.environment}_invoiceitem_${attemptId}`);
  if (!item.response.ok || typeof item.payload?.id !== "string") {
    await deleteDraftInvoice(current.secret, invoiceId);
    return json({ ok: false, error: "stripe_invoice_item_create_failed", draftRolledBack: true }, 502);
  }

  return json({
    ok: true,
    environment: current.environment,
    invoiceId,
    invoiceItemId: item.payload.id,
    customerId,
    fundingObjectKey,
    referenceKey: referenceKey || null,
    status: invoice.payload?.status ?? "draft",
    reviewRequired: true,
    sent: false,
    disclosure: "Draft only. Contract, tax/VAT, customer and funding-object terms must be reviewed before finalisation or sending.",
  });
};

export const onRequest = async (ctx: { request: Request; env: InvoiceEnv }): Promise<Response> =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
