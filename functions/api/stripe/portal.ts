import { resolveEnvironment, type StripeEnv } from "./catalog";
import { json, requestSession, serviceRest, sessionCookieHeaders, type SupabaseEnv } from "../_shared/supabase";

type Env = StripeEnv & SupabaseEnv & { AUTH_TEST_ENABLED?: string; STRIPE_PORTAL_TEST_ENABLED?: string; STRIPE_PORTAL_LIVE_ENABLED?: string };

type Link = { stripe_customer_id?: string };

export const onRequestPost = async (ctx: { request: Request; env: Env }) => {
  const { request, env } = ctx;
  const session = await requestSession(request, env);
  if (!session) return json({ ok: false, error: "unauthenticated" }, 401);

  const runtime = resolveEnvironment(env);
  const portalEnabled = runtime.environment === "LIVE"
    ? env.STRIPE_PORTAL_LIVE_ENABLED === "true" && env.STRIPE_LIVE_RELEASE_APPROVED === "true"
    : env.STRIPE_PORTAL_TEST_ENABLED === "true";
  if (!portalEnabled) return json({ ok: false, error: "billing_portal_disabled" }, 503);
  if (!runtime.secret || !runtime.secret.startsWith(runtime.expectedSecretPrefix)) return json({ ok: false, error: "stripe_secret_missing" }, 503);

  const uid = encodeURIComponent(session.user.id);
  const environment = encodeURIComponent(runtime.environment);
  const linkResponse = await serviceRest(env, `stripe_customer_links?user_id=eq.${uid}&environment=eq.${environment}&select=stripe_customer_id&limit=1`);
  const links = linkResponse?.ok ? await linkResponse.json().catch(() => []) as Link[] : [];
  const customerId = links[0]?.stripe_customer_id;
  if (!customerId?.startsWith("cus_")) return json({ ok: false, error: "stripe_customer_not_linked" }, 409);

  const origin = new URL(request.url).origin;
  const form = new URLSearchParams();
  form.set("customer", customerId);
  form.set("return_url", `${origin}/me`);
  const stripeResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: { authorization: `Bearer ${runtime.secret}`, "content-type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const payload = await stripeResponse.json().catch(() => null) as { url?: string; livemode?: boolean } | null;
  if (!stripeResponse.ok || !payload?.url || payload.livemode !== runtime.livemode) return json({ ok: false, error: "billing_portal_unavailable" }, 502);

  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  if (session.refreshed) for (const value of sessionCookieHeaders(session.refreshed)) headers.append("Set-Cookie", value);
  return new Response(JSON.stringify({ ok: true, url: payload.url }), { status: 200, headers });
};

export const onRequest = (ctx: { request: Request; env: Env }) =>
  ctx.request.method === "POST" ? onRequestPost(ctx) : json({ ok: false, error: "method_not_allowed" }, 405);
