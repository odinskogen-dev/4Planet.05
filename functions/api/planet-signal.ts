/**
 * PLANET SIGNAL consent gateway.
 * POST /api/planet-signal
 *
 * One source of audience truth: Resend global Contact + dedicated Segment + Topic.
 * No local subscriber database. No welcome email is sent from this endpoint.
 */
interface Env { RESEND_API_KEY?: string }

const SEGMENT_ID = "5a37316f-cf91-42d9-a5df-bddf715e2d72";
const TOPIC_ID = "cd9c9b30-ff3b-4b33-9c67-5abbd6d049ea";
const API = "https://api.resend.com";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});
const validEmail = (value: unknown): value is string =>
  typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

async function resend(env: Env, path: string, init: RequestInit = {}) {
  const key = env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("not_configured");
  return fetch(API + path, {
    ...init,
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(init.headers || {}),
    },
  });
}

async function subscribeExisting(env: Env, email: string): Promise<Response> {
  const encoded = encodeURIComponent(email);
  const contact = await resend(env, `/contacts/${encoded}`, {
    method: "PATCH",
    body: JSON.stringify({ unsubscribed: false }),
  });
  if (!contact.ok) return contact;

  const segment = await resend(env, `/contacts/${encoded}/segments/${SEGMENT_ID}`, { method: "POST" });
  if (!segment.ok && segment.status !== 409) return segment;

  return resend(env, `/contacts/${encoded}/topics`, {
    method: "PATCH",
    body: JSON.stringify({ topics: [{ id: TOPIC_ID, subscription: "opt_in" }] }),
  });
}

export const onRequestGet = async ({ env }: { env: Env }) =>
  json({ ok: true, ready: Boolean(env.RESEND_API_KEY?.trim()) });

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }): Promise<Response> => {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }

  // Honeypot: bots get a neutral success without creating a contact.
  if (typeof body.company === "string" && body.company.trim()) return json({ ok: true, subscribed: false, filtered: true });

  if (!validEmail(body.email)) return json({ ok: false, error: "email_invalid" }, 400);
  if (body.consent !== true) return json({ ok: false, error: "consent_required" }, 400);
  if (!env.RESEND_API_KEY?.trim()) return json({ ok: false, error: "not_configured" }, 503);

  const email = body.email.trim().toLowerCase();

  try {
    const existing = await resend(env, `/contacts/${encodeURIComponent(email)}`, { method: "GET" });
    let result: Response;

    if (existing.ok) {
      result = await subscribeExisting(env, email);
    } else if (existing.status === 404) {
      result = await resend(env, "/contacts", {
        method: "POST",
        body: JSON.stringify({
          email,
          unsubscribed: false,
          segments: [{ id: SEGMENT_ID }],
          topics: [{ id: TOPIC_ID, subscription: "opt_in" }],
        }),
      });
    } else {
      return json({ ok: false, error: "provider_lookup_failed", status: existing.status }, 502);
    }

    if (!result.ok) return json({ ok: false, error: "provider_write_failed", status: result.status }, 502);
    return json({ ok: true, subscribed: true });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error && error.message === "not_configured" ? "not_configured" : "provider_unavailable" }, 503);
  }
};

export const onRequest = async (ctx: { request: Request; env: Env }) => {
  if (ctx.request.method === "GET") return onRequestGet(ctx);
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
