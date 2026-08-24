import { clearCookieHeaders, json, readCookie, type SupabaseEnv } from "../_shared/supabase";

type Env = SupabaseEnv & { AUTH_TEST_ENABLED?: string };

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  const access = readCookie(request, "4p_access");
  const url = env.SUPABASE_URL?.replace(/\/$/, "");
  const key = env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (url && key && access) {
    await fetch(`${url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: key, authorization: `Bearer ${access}` },
    }).catch(() => null);
  }

  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  for (const value of clearCookieHeaders()) headers.append("Set-Cookie", value);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

export const onRequest = (ctx: { request: Request; env: Env }) =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
