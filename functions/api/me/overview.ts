import { json, requestSession, rest, sessionCookieHeaders, type SupabaseEnv } from "../_shared/supabase";

type Env = SupabaseEnv & { AUTH_TEST_ENABLED?: string };

type ProfilePatch = {
  displayName?: unknown;
  memberRole?: unknown;
  countryCode?: unknown;
  locale?: unknown;
  marketingConsent?: unknown;
};

const ROLES = new Set(["4PEOPLE_MEMBER", "FOUNDING_MEMBER", "MISSION_BACKER", "4AMBASSADOR"]);

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function readJson(response: Response | null) {
  if (!response?.ok) return [];
  return await response.json().catch(() => []);
}

async function authenticated(request: Request, env: Env) {
  if (env.AUTH_TEST_ENABLED !== "true") return null;
  return requestSession(request, env);
}

function refreshedHeaders(session: Awaited<ReturnType<typeof requestSession>>) {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  if (session?.refreshed) for (const value of sessionCookieHeaders(session.refreshed)) headers.append("Set-Cookie", value);
  return headers;
}

export const onRequestGet = async (ctx: { request: Request; env: Env }) => {
  const session = await authenticated(ctx.request, ctx.env);
  if (!session) return json({ ok: false, error: "unauthenticated" }, 401);
  const uid = encodeURIComponent(session.user.id);

  const [profileRes, financeRes, impactRes, preferenceRes] = await Promise.all([
    rest(ctx.env, session.accessToken, `profiles?user_id=eq.${uid}&select=user_id,display_name,member_role,country_code,locale,created_at,updated_at&limit=1`),
    rest(ctx.env, session.accessToken, `commerce_financial_records?user_id=eq.${uid}&select=stripe_object_id,stripe_object_type,environment,product_key,product_family,currency,amount_minor,financial_state,mission,mission_slug,reference_key,updated_at&order=updated_at.desc&limit=100`),
    rest(ctx.env, session.accessToken, `impact_contributions?user_id=eq.${uid}&select=id,product_key,financial_state,delivery_state,evidence_state,outcome_state,partner_id,partner_project_id,created_at,updated_at&order=created_at.desc&limit=100`),
    rest(ctx.env, session.accessToken, `user_preferences?user_id=eq.${uid}&select=marketing_consent,product_updates,locale,updated_at&limit=1`),
  ]);

  const schemaReady = Boolean(profileRes?.ok);
  const payload = {
    ok: true,
    schemaReady,
    user: { id: session.user.id, email: session.user.email ?? null },
    profile: (await readJson(profileRes))[0] ?? null,
    payments: await readJson(financeRes),
    impact: await readJson(impactRes),
    preferences: (await readJson(preferenceRes))[0] ?? null,
  };
  return new Response(JSON.stringify(payload), { status: 200, headers: refreshedHeaders(session) });
};

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const session = await authenticated(ctx.request, ctx.env);
  if (!session) return json({ ok: false, error: "unauthenticated" }, 401);

  let body: ProfilePatch;
  try { body = await ctx.request.json(); } catch { return json({ ok: false, error: "invalid_json" }, 400); }
  const displayName = text(body.displayName, 100) || null;
  const memberRole = ROLES.has(text(body.memberRole, 40)) ? text(body.memberRole, 40) : "4PEOPLE_MEMBER";
  const countryCode = /^[A-Z]{2}$/.test(text(body.countryCode, 2).toUpperCase()) ? text(body.countryCode, 2).toUpperCase() : null;
  const locale = text(body.locale, 16) || "nb-NO";
  const marketingConsent = body.marketingConsent === true;

  const profileRes = await rest(ctx.env, session.accessToken, "profiles?on_conflict=user_id", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      user_id: session.user.id,
      display_name: displayName,
      member_role: memberRole,
      country_code: countryCode,
      locale,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!profileRes?.ok) return json({ ok: false, error: "profile_write_failed", schemaReady: false }, 503);

  const preferenceRes = await rest(ctx.env, session.accessToken, "user_preferences?on_conflict=user_id", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      user_id: session.user.id,
      marketing_consent: marketingConsent,
      locale,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!preferenceRes?.ok) return json({ ok: false, error: "preferences_write_failed" }, 503);

  await rest(ctx.env, session.accessToken, "consent_records", {
    method: "POST",
    headers: { prefer: "return=minimal" },
    body: JSON.stringify({
      user_id: session.user.id,
      consent_type: "MARKETING",
      granted: marketingConsent,
      source: "ME4PLANET_SETTINGS",
      policy_version: "2026-08-24",
    }),
  });

  return new Response(JSON.stringify({ ok: true, profile: await profileRes.json(), preferences: await preferenceRes.json() }), { status: 200, headers: refreshedHeaders(session) });
};

export const onRequest = (ctx: { request: Request; env: Env }) => {
  if (ctx.request.method === "GET") return onRequestGet(ctx);
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405);
};
