/**
 * POST /api/leads — server-side lead capture for 4Planet.
 *
 * Client forms submit ONLY here. Secrets live in server-side env (never Vite client vars):
 *   LEAD_WEBHOOK_URL     forward validated leads here (Make / Zapier / Formspree / Brevo / Kit / HubSpot…)
 *   LEAD_WEBHOOK_SECRET  optional shared secret, sent as X-4P-Secret + in body
 *
 * Honest contract:
 *   - configured   → forwards, returns { ok:true, delivered:true }
 *   - NOT configured → returns { ok:true, delivered:false, reason:"not_configured" }
 *                      (client then shows "opening soon — not collecting yet", never a fake success)
 *   - invalid      → 400 { ok:false, error }
 *   - honeypot hit → 200 { ok:true, delivered:false, reason:"filtered" } (silently dropped bot)
 */

interface Env { LEAD_WEBHOOK_URL?: string; LEAD_WEBHOOK_SECRET?: string; }

const TYPES = ["4people", "4brands", "4partners", "4funders"] as const;
type LeadType = (typeof TYPES)[number];

const emailOk = (e: unknown): e is string => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
const clean = (v: unknown, max = 400): string => (typeof v === "string" ? v.trim().slice(0, max) : "");
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const onRequestPost = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  const { request, env } = ctx;

  let data: Record<string, unknown>;
  try { data = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  // honeypot — a hidden field real users never fill
  if (clean(data.company_hp)) return json({ ok: true, delivered: false, reason: "filtered" });

  const type = clean(data.type).toLowerCase() as LeadType;
  if (!TYPES.includes(type)) return json({ ok: false, error: "invalid_type" }, 400);

  const name = clean(data.name, 120);
  const email = data.email;
  if (!name) return json({ ok: false, error: "name_required" }, 400);
  if (!emailOk(email)) return json({ ok: false, error: "email_invalid" }, 400);
  if (data.consent !== true) return json({ ok: false, error: "consent_required" }, 400);

  const payload = {
    source: "4planet-public-world",
    leadType: type,
    name,
    email,
    company: clean(data.company, 160),
    organisation: clean(data.organisation, 160),
    role: clean(data.role, 120),
    website: clean(data.website, 200),
    workArea: clean(data.workArea, 300),
    fundingInterest: clean(data.fundingInterest, 300),
    interest: clean(data.interest, 600),
    interests: Array.isArray(data.interests) ? data.interests.map((x) => clean(x, 60)).slice(0, 20) : [],
    message: clean(data.message, 1200),
    consent: true,
    sourceRoute: clean(data.sourceRoute, 200),
    submittedAt: new Date().toISOString(),
    userAgent: clean(request.headers.get("user-agent"), 300),
  };

  // Not configured → be honest, do not pretend to store anything.
  if (!env.LEAD_WEBHOOK_URL) return json({ ok: true, delivered: false, reason: "not_configured" });

  try {
    const res = await fetch(env.LEAD_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json", ...(env.LEAD_WEBHOOK_SECRET ? { "X-4P-Secret": env.LEAD_WEBHOOK_SECRET } : {}) },
      body: JSON.stringify(env.LEAD_WEBHOOK_SECRET ? { ...payload, secret: env.LEAD_WEBHOOK_SECRET } : payload),
    });
    if (!res.ok) return json({ ok: false, error: "forward_failed", status: res.status }, 502);
    return json({ ok: true, delivered: true });
  } catch {
    return json({ ok: false, error: "forward_error" }, 502);
  }
};

// Any non-POST method → 405
export const onRequest = async (ctx: { request: Request; env: Env }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
