import { CATALOG, readCatalogKey, type ProductKey, type StripeEnv } from "./catalog";

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
  if (environment === "LIVE") return {
    environment,
    enabled: env.STRIPE_INVOICE_LIVE_ENABLED === "true" && env.STRIPE_LIVE_RELEASE_APPROVED === "true",
    secret: env.STRIPE_LIVE_SECRET_KEY?.trim(),
    expectedSecretPrefix: "sk_live_",
    livemode: true,
  } as const;
  return {
    environment,
    enabled: env.STRIPE_INVOICE_TEST_ENABLED === "true",
    secret: env.STRIPE_TEST_SECRET_KEY?.trim(),
    expectedSecretPrefix: "sk_test_",
    livemode: false,
  } as const;
}

function authorised(request: Request, env: InvoiceEnv) {
  const expected = env.STRIPE_INTERNAL_BILLING_TOKEN?.trim();
  if (!expected || expected.length < 24) return false;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function safeText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validAgreementKey(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{3,79}$/.test(value);
}

const NEGOTIATED_KEYS = new Set<ProductKey>([
  "project_sponsor",
  "mission_sponsor",
  "founding_patron",
  "sponsor_package",
  "b2b_pilot_funder",
]);
const MISSION_SLUGS = new Set(["cle4n", "wh4les", "cor4l", "rewild-marine", "clim4te", "am4zonia", "species", "rewild-land", "food", "en4rgy", "circular-city", "f4shion", "m4gazine", "4rt", "4film", "4play"]);

function lineItemDescription(productKey: ProductKey, referenceKey: string) {
  const ref = referenceKey ? ` · ${referenceKey}` : "";
  switch (productKey) {
    case "founding_patron": return `Founding Patron support${ref}`;
    case "mission_sponsor": return `Mission sponsorship${ref}`;
    case "project_sponsor": return `Project sponsorship${ref}`;
    case "sponsor_package": return `4PLANET sponsorship package${ref}`;
    case "b2b_pilot_funder": return `4PLANET pilot / funding engagement${ref}`;
    default: return `4PLANET negotiated support${ref}`;
  }
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

async function stripeDelete(secret: string, path: string) {
  return fetch(`https://api.stripe.com/v1/${path}`, { method: "DELETE", headers: { authorization: `Bearer ${secret}` } });
}

export const onRequestPost = async (ctx: { request: Request; env: InvoiceEnv }): Promise<Response> => {
  const { request, env } = ctx;
  if (!authorised(request, env)) return json({ ok: false, error: "unauthorised" }, 401);
  const current = runtime(env);
  if (!current.enabled) return json({ ok: false, error: current.environment === "LIVE" ? "live_invoicing_disabled" : "test_invoicing_disabled" }, 503);
  if (!current.secret || !current.secret.startsWith(current.expectedSecretPrefix)) return json({ ok: false, error: "stripe_secret_missing" }, 503);

  let body: {
    productKey?: unknown; amountNok?: unknown; customerEmail?: unknown; customerName?: unknown; stripeCustomerId?: unknown;
    agreementKey?: unknown; referenceKey?: unknown; dueDays?: unknown; attemptId?: unknown;
  };
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  const productKey = readCatalogKey(body.productKey);
  if (!productKey || !NEGOTIATED_KEYS.has(productKey)) return json({ ok: false, error: "negotiated_product_required" }, 400);
  const entry = CATALOG[productKey];
  if (entry.channel !== "invoice" || typeof entry.negotiatedMinNok !== "number" || typeof entry.negotiatedMaxNok !== "number") return json({ ok: false, error: "invoice_contract_invalid" }, 500);

  const amountNok = typeof body.amountNok === "number" && Number.isInteger(body.amountNok) ? body.amountNok : null;
  if (amountNok === null || amountNok < entry.negotiatedMinNok || amountNok > entry.negotiatedMaxNok) return json({ ok: false, error: "amount_outside_approved_corridor" }, 400);

  const agreementKey = safeText(body.agreementKey, 80);
  if (!validAgreementKey(agreementKey)) return json({ ok: false, error: "approved_agreement_key_required" }, 400);
  const referenceKey = safeText(body.referenceKey, 80);
  if (productKey === "mission_sponsor" && !MISSION_SLUGS.has(referenceKey)) return json({ ok: false, error: "canonical_mission_required" }, 400);
  if (productKey === "project_sponsor" && !/^[A-Za-z0-9][A-Za-z0-9._:-]{2,79}$/.test(referenceKey)) return json({ ok: false, error: "project_reference_required" }, 400);

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
    customerForm.set("metadata[4planet_agreement_key]", agreementKey);
    customerForm.set("metadata[truth_state]", current.environment);
    const created = await stripePost(current.secret, "customers", customerForm, `4p_${current.environment}_customer_${attemptId}`);
    const candidate = typeof created.payload?.id === "string" ? created.payload.id : "";
    if (!created.response.ok || !candidate.startsWith("cus_")) return json({ ok: false, error: "stripe_customer_create_failed" }, 502);
    customerId = candidate;
  }

  // Draft first. The line item is attached to this exact draft so a partial failure cannot leak into a future invoice.
  const invoiceForm = new URLSearchParams();
  invoiceForm.set("customer", customerId);
  invoiceForm.set("collection_method", "send_invoice");
  invoiceForm.set("days_until_due", String(dueDays));
  invoiceForm.set("auto_advance", "false");
  invoiceForm.set("description", `4PLANET ${productKey.replaceAll("_", " ")} · agreement ${agreementKey}`);
  invoiceForm.set("metadata[4planet_product_key]", entry.key);
  invoiceForm.set("metadata[product_kind]", entry.kind);
  invoiceForm.set("metadata[product_family]", entry.family);
  invoiceForm.set("metadata[agreement_key]", agreementKey);
  invoiceForm.set("metadata[reference_key]", referenceKey || "none");
  invoiceForm.set("metadata[truth_state]", current.environment);
  invoiceForm.set("metadata[ecological_delivery_authority]", "none");
  invoiceForm.set("metadata[contract_review_required]", "true");
  invoiceForm.set("metadata[tax_review_required]", "true");

  const invoice = await stripePost(current.secret, "invoices", invoiceForm, `4p_${current.environment}_invoice_${attemptId}`);
  const invoiceId = typeof invoice.payload?.id === "string" ? invoice.payload.id : "";
  const livemode = invoice.payload?.livemode === true;
  if (!invoice.response.ok || !invoiceId.startsWith("in_") || livemode !== current.livemode) return json({ ok: false, error: "stripe_invoice_create_failed" }, 502);

  const itemForm = new URLSearchParams();
  itemForm.set("customer", customerId);
  itemForm.set("invoice", invoiceId);
  itemForm.set("amount", String(amountNok * 100));
  itemForm.set("currency", "nok");
  itemForm.set("description", lineItemDescription(productKey, referenceKey));
  itemForm.set("metadata[4planet_product_key]", entry.key);
  itemForm.set("metadata[agreement_key]", agreementKey);
  itemForm.set("metadata[reference_key]", referenceKey || "none");
  itemForm.set("metadata[truth_state]", current.environment);
  itemForm.set("metadata[ecological_delivery_authority]", "none");
  const item = await stripePost(current.secret, "invoiceitems", itemForm, `4p_${current.environment}_invoiceitem_${attemptId}`);
  if (!item.response.ok || typeof item.payload?.id !== "string") {
    await stripeDelete(current.secret, `invoices/${encodeURIComponent(invoiceId)}`).catch(() => undefined);
    return json({ ok: false, error: "stripe_invoice_item_create_failed_draft_rolled_back" }, 502);
  }

  return json({
    ok: true,
    environment: current.environment,
    productKey,
    invoiceId,
    customerId,
    agreementKey,
    referenceKey: referenceKey || null,
    amountNok,
    status: invoice.payload?.status ?? "draft",
    reviewRequired: true,
    sent: false,
    disclosure: "DRAFT ONLY. Human contract, tax/VAT, counterparty, amount and reference review is required before finalisation or sending.",
  });
};

export const onRequest = async (ctx: { request: Request; env: InvoiceEnv }): Promise<Response> =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
