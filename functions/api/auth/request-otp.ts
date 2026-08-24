import { configured, json, type SupabaseEnv } from "../_shared/supabase";

type Env = SupabaseEnv & { AUTH_TEST_ENABLED?: string };

function validEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validRole(value: unknown) {
  return typeof value === "string" && ["4PEOPLE_MEMBER", "FOUNDING_MEMBER", "MISSION_BACKER", "4AMBASSADOR"].includes(value);
}

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  if (env.AUTH_TEST_ENABLED !== "true") return json({ ok: false, error: "auth_disabled" }, 503);
  const cfg = configured(env);
  if (!cfg) return json({ ok: false, error: "supabase_not_configured" }, 503);

  let body: { email?: unknown; role?: unknown };
  try { body = await request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  if (!validEmail(body.email)) return json({ ok: false, error: "invalid_email" }, 400);
  const role = validRole(body.role) ? body.role : "4PEOPLE_MEMBER";

  const response = await fetch(`${cfg.url}/auth/v1/otp`, {
    method: "POST",
    headers: { apikey: cfg.key, "content-type": "application/json" },
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      create_user: true,
      data: { member_role: role, source: "me4planet" },
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { msg?: string; error_description?: string } | null;
    return json({ ok: false, error: "otp_send_failed", detail: payload?.msg ?? payload?.error_description ?? null }, response.status >= 500 ? 502 : 400);
  }

  return json({ ok: true, next: "verify_otp" });
};

export const onRequest = (ctx: { request: Request; env: Env }) =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
