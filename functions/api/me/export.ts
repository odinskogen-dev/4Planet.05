import { json, requestSession, rest, type SupabaseEnv } from "../_shared/supabase";

type Env = SupabaseEnv & { AUTH_TEST_ENABLED?: string };

async function rows(env: Env, accessToken: string, path: string) {
  const response = await rest(env, accessToken, path);
  return response?.ok ? await response.json().catch(() => []) : [];
}

export const onRequestGet = async (ctx: { request: Request; env: Env }) => {
  const session = await requestSession(ctx.request, ctx.env);
  if (!session) return json({ ok: false, error: "unauthenticated" }, 401);
  const uid = encodeURIComponent(session.user.id);
  const [profiles, preferences, consents, payments, impact, privacyRequests] = await Promise.all([
    rows(ctx.env, session.accessToken, `profiles?user_id=eq.${uid}&select=*`),
    rows(ctx.env, session.accessToken, `user_preferences?user_id=eq.${uid}&select=*`),
    rows(ctx.env, session.accessToken, `consent_records?user_id=eq.${uid}&select=*&order=recorded_at.asc`),
    rows(ctx.env, session.accessToken, `commerce_financial_records?user_id=eq.${uid}&select=*&order=updated_at.asc`),
    rows(ctx.env, session.accessToken, `impact_contributions?user_id=eq.${uid}&select=*&order=created_at.asc`),
    rows(ctx.env, session.accessToken, `privacy_requests?user_id=eq.${uid}&select=id,request_type,status,requested_at,completed_at&order=requested_at.asc`),
  ]);

  const exportBody = {
    generated_at: new Date().toISOString(),
    format: "4PLANET_ME_EXPORT_V1",
    account: { user_id: session.user.id, email: session.user.email ?? null },
    profiles,
    preferences,
    consent_records: consents,
    financial_records: payments,
    impact_contributions: impact,
    privacy_requests: privacyRequests,
    note: "Stripe card numbers/CVC are not stored by 4PLANET and are therefore not part of this export.",
  };
  const filename = `4planet-me-export-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(exportBody, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename=\"${filename}\"`,
      "cache-control": "no-store",
    },
  });
};

export const onRequest = (ctx: { request: Request; env: Env }) =>
  ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
