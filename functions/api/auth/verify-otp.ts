import { configured, json, sessionCookieHeaders, type AuthSession, type SupabaseEnv } from "../_shared/supabase";

type Env = SupabaseEnv & { AUTH_TEST_ENABLED?: string };

function validEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validToken(value: unknown): value is string {
  return typeof value === "string" && /^\d{6,8}$/.test(value.trim());
}

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  if (env.AUTH_TEST_ENABLED !== "true") return json({ ok: false, error: "auth_disabled" }, 503);
  const cfg = configured(env);
  if (!cfg) return json({ ok: false, error: "supabase_not_configured" }, 503);

  let body: { email?: unknown; token?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  if (!validEmail(body.email) || !validToken(body.token)) return json({ ok: false, error: "invalid_credentials" }, 400);

  const response = await fetch(`${cfg.url}/auth/v1/verify`, {
    method: "POST",
    headers: { apikey: cfg.key, "content-type": "application/json" },
    body: JSON.stringify({ email: body.email.trim().toLowerCase(), token: body.token.trim(), type: "email" }),
  });
  const payload = await response.json().catch(() => null) as AuthSession | { msg?: string; error_description?: string } | null;
  if (!response.ok || !payload || !("access_token" in payload) || !payload.access_token || !payload.refresh_token) {
    const detail = payload && "msg" in payload ? payload.msg : payload && "error_description" in payload ? payload.error_description : null;
    return json({ ok: false, error: "otp_verify_failed", detail }, 401);
  }

  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  for (const value of sessionCookieHeaders(payload)) headers.append("Set-Cookie", value);
  return new Response(JSON.stringify({ ok: true, user: { id: payload.user?.id ?? null, email: payload.user?.email ?? body.email } }), { status: 200, headers });
};

export const onRequest = (ctx: { request: Request; env: Env }) =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
