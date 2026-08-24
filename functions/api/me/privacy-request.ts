import { json, requestSession, rest, type SupabaseEnv } from "../_shared/supabase";

type Env = SupabaseEnv & { AUTH_TEST_ENABLED?: string };
const TYPES = new Set(["ACCESS","EXPORT","RECTIFICATION","DELETION","RESTRICTION","OBJECTION","PORTABILITY"]);

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const session = await requestSession(ctx.request, ctx.env);
  if (!session) return json({ ok: false, error: "unauthenticated" }, 401);
  let body: { requestType?: unknown };
  try { body = await ctx.request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  const requestType = typeof body.requestType === "string" ? body.requestType.toUpperCase() : "";
  if (!TYPES.has(requestType)) return json({ ok: false, error: "unsupported_request_type" }, 400);

  const response = await rest(ctx.env, session.accessToken, "privacy_requests", {
    method: "POST",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({ user_id: session.user.id, request_type: requestType, status: "RECEIVED" }),
  });
  if (!response?.ok) return json({ ok: false, error: "privacy_request_write_failed" }, 503);
  const rows = await response.json().catch(() => []);
  return json({ ok: true, request: rows[0] ?? null });
};

export const onRequest = (ctx: { request: Request; env: Env }) =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
