/**
 * POST /api/leads — bounded register-interest gateway for 4Planet.
 *
 * Canonical persistence is first-party Actor + Enquiry + Consent storage.
 * Configure only the public server endpoint here:
 *   JOIN_PERSISTENCE_URL=https://<project>.supabase.co/functions/v1/register-interest
 *
 * No database secret is exposed to the browser or stored in this Pages Function.
 * No user-agent or raw IP address is added to the application payload.
 * No secondary CRM/webhook is a source of truth in this phase.
 */

interface Env { JOIN_PERSISTENCE_URL?: string; }

const TYPES = ["4people", "4brands", "4partners", "4funders"] as const;
type LeadType = (typeof TYPES)[number];
const SOURCE_CHANNELS = new Set(["DIRECT", "SOCIAL", "PRESS", "PARTNER", "CAMPAIGN", "REFERRAL", "EVENT", "UNKNOWN"]);

const emailOk = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const clean = (value: unknown, max = 400): string => typeof value === "string" ? value.trim().slice(0, max) : "";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function cleanSourceDetail(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const v = clean(source[key], 120);
    if (v) out[key] = v;
  }
  return out;
}

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;
  const declaredLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(declaredLength) && declaredLength > 16_384) return json({ ok: false, error: "payload_too_large" }, 413);

  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  if (clean(data.company_hp, 80)) return json({ ok: true, delivered: false, stored: false, reason: "filtered" });

  const type = clean(data.type).toLowerCase() as LeadType;
  if (!TYPES.includes(type)) return json({ ok: false, error: "invalid_type" }, 400);

  const name = clean(data.name, 120);
  const email = clean(data.email, 254).toLowerCase();
  if (!name) return json({ ok: false, error: "name_required" }, 400);
  if (!emailOk(email)) return json({ ok: false, error: "email_invalid" }, 400);
  if (data.privacyAcknowledged !== true) return json({ ok: false, error: "privacy_acknowledgement_required" }, 400);

  const sourceChannelRaw = clean(data.sourceChannel, 30).toUpperCase() || "DIRECT";
  const payload = {
    type,
    name,
    email,
    organisation: clean(data.organisation, 160),
    interest: clean(data.interest, 80),
    message: clean(data.message, 1200),
    privacyAcknowledged: true,
    privacyNoticeVersion: clean(data.privacyNoticeVersion, 60),
    marketingConsent: data.marketingConsent === true,
    company_hp: "",
    sourceRoute: clean(data.sourceRoute, 200) || "/join",
    sourceChannel: SOURCE_CHANNELS.has(sourceChannelRaw) ? sourceChannelRaw : "UNKNOWN",
    sourceDetail: cleanSourceDetail(data.sourceDetail),
  };

  if (!payload.privacyNoticeVersion) return json({ ok: false, error: "privacy_notice_version_required" }, 400);
  if (!env.JOIN_PERSISTENCE_URL) {
    return json({ ok: true, delivered: false, stored: false, reason: "storage_not_configured" });
  }

  try {
    const upstream = await fetch(env.JOIN_PERSISTENCE_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const error = typeof body?.error === "string" ? body.error : "storage_failed";
      return json({ ok: false, delivered: false, stored: false, error }, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502);
    }
    if (body?.stored === true && body?.delivered === true) {
      return json({ ok: true, delivered: true, stored: true, enquiryId: body.enquiryId }, 201);
    }
    return json({ ok: true, delivered: false, stored: false, reason: body?.reason || "storage_not_confirmed" });
  } catch {
    return json({ ok: false, delivered: false, stored: false, error: "storage_unreachable" }, 502);
  }
};

export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
