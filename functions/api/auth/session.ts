import { json, requestSession, sessionCookieHeaders, type SupabaseEnv } from "../_shared/supabase";

type Env = SupabaseEnv & { AUTH_TEST_ENABLED?: string };

export const onRequestGet = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  if (env.AUTH_TEST_ENABLED !== "true") return json({ ok: false, authenticated: false, error: "auth_disabled" }, 503);
  const session = await requestSession(request, env);
  if (!session) return json({ ok: true, authenticated: false });

  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  if (session.refreshed) for (const value of sessionCookieHeaders(session.refreshed)) headers.append("Set-Cookie", value);
  return new Response(JSON.stringify({
    ok: true,
    authenticated: true,
    user: { id: session.user.id, email: session.user.email ?? null, metadata: session.user.user_metadata ?? {} },
  }), { status: 200, headers });
};

export const onRequest = (ctx: { request: Request; env: Env }) =>
  ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
