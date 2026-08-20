/**
 * POST /api/checkout — ZERO FOUNDER CASH prototype checkout adapter.
 *
 * Safety contract:
 * - No Stripe key or ZFC checkout flag => configured:false, no order, no charge.
 * - Test keys are accepted when ZERO_FOUNDER_CHECKOUT_ENABLED=true.
 * - Live keys are rejected unless ZERO_FOUNDER_ALLOW_LIVE=true as a separate explicit switch.
 * - Product IDs, names and amounts are server-side allowlisted. The client cannot set price.
 */

interface Env {
  STRIPE_SECRET_KEY?: string;
  ZERO_FOUNDER_CHECKOUT_ENABLED?: string;
  ZERO_FOUNDER_ALLOW_LIVE?: string;
}

type OfferId = "mission-supporter" | "project-supporter" | "pilot-funder";

type Offer = {
  id: OfferId;
  name: string;
  amount: number; // NOK minor units (øre)
  description: string;
};

const OFFERS: Record<OfferId, Offer> = {
  "mission-supporter": {
    id: "mission-supporter",
    name: "4PLANET MISSION SUPPORTER_",
    amount: 2_500_000,
    description: "Bounded support for one named 4PLANET Mission and shared public infrastructure.",
  },
  "project-supporter": {
    id: "project-supporter",
    name: "4PLANET PROJECT SUPPORTER_",
    amount: 10_000_000,
    description: "Bounded support for one named 4PLANET project or proof object.",
  },
  "pilot-funder": {
    id: "pilot-funder",
    name: "4PLANET PILOT FUNDER_",
    amount: 25_000_000,
    description: "Bounded support for a defined 4PLANET pilot and proof/learning package.",
  },
};

const clean = (v: unknown, max = 400): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const emailOk = (v: unknown): v is string => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json", "cache-control": "no-store" },
});

function safeOrigin(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;

  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  if (clean(data.company_hp)) return json({ ok: true, configured: false, reason: "filtered" });

  const offerId = clean(data.offerId) as OfferId;
  const offer = OFFERS[offerId];
  if (!offer) return json({ ok: false, error: "invalid_offer" }, 400);

  const company = clean(data.company, 160);
  const orgNumber = clean(data.orgNumber, 80);
  const name = clean(data.name, 120);
  const email = data.email;
  const website = clean(data.website, 240);
  const attribution = clean(data.attribution, 20);
  const termsVersion = clean(data.termsVersion, 80);

  if (!company) return json({ ok: false, error: "company_required" }, 400);
  if (!name) return json({ ok: false, error: "name_required" }, 400);
  if (!emailOk(email)) return json({ ok: false, error: "email_invalid" }, 400);
  if (data.termsAccepted !== true || !termsVersion) return json({ ok: false, error: "terms_required" }, 400);
  if (!new Set(["public", "private"]).has(attribution)) return json({ ok: false, error: "invalid_attribution" }, 400);

  const enabled = env.ZERO_FOUNDER_CHECKOUT_ENABLED === "true";
  const key = env.STRIPE_SECRET_KEY || "";
  if (!enabled || !key) return json({ ok: true, configured: false, reason: "not_configured" });

  const isTest = key.startsWith("sk_test_");
  const isLive = key.startsWith("sk_live_");
  if (!isTest && !isLive) return json({ ok: false, error: "invalid_stripe_key" }, 500);
  if (isLive && env.ZERO_FOUNDER_ALLOW_LIVE !== "true") {
    return json({ ok: true, configured: false, reason: "live_disabled" });
  }

  const origin = safeOrigin(request);
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${origin}/support?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/support?checkout=cancelled`);
  params.set("customer_email", email);
  params.set("client_reference_id", `${offer.id}:${Date.now()}`);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "nok");
  params.set("line_items[0][price_data][unit_amount]", String(offer.amount));
  params.set("line_items[0][price_data][product_data][name]", offer.name);
  params.set("line_items[0][price_data][product_data][description]", offer.description);
  params.set("metadata[offer_id]", offer.id);
  params.set("metadata[company]", company);
  params.set("metadata[org_number]", orgNumber);
  params.set("metadata[contact_name]", name);
  params.set("metadata[attribution]", attribution);
  params.set("metadata[website]", website);
  params.set("metadata[terms_version]", termsVersion);
  params.set("metadata[source]", "4planet-zero-founder-cash-v1");

  try {
    const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const body = await stripe.json().catch(() => ({})) as Record<string, unknown>;
    if (!stripe.ok) return json({ ok: false, error: "stripe_session_failed", detail: typeof body.error === "object" ? "stripe_error" : undefined }, 502);
    const url = typeof body.url === "string" ? body.url : "";
    const id = typeof body.id === "string" ? body.id : "";
    if (!url || !id) return json({ ok: false, error: "stripe_session_invalid" }, 502);

    return json({ ok: true, configured: true, mode: isTest ? "test" : "live", sessionId: id, url });
  } catch {
    return json({ ok: false, error: "stripe_unreachable" }, 502);
  }
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
