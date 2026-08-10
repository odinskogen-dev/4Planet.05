import {
  bodyWithinLimit,
  clean,
  emailOk,
  environment,
  idempotencyFrom,
  json,
  nullable,
  productionConfigured,
  sameOrigin,
  sha256,
  supabaseGet,
  supabaseInsert,
  verifyTurnstile,
  type ProductionEnv,
} from "../_shared/production";

/**
 * POST /api/leads — durable, server-side registration intake for 4PLANET.
 *
 * Activation requires explicit server-side configuration:
 *   PUBLIC_INTAKE_ENABLED=true
 *   SUPABASE_URL
 *   SUPABASE_SECRET_KEY      modern sb_secret_... key; never expose in the client
 * Optional hardening:
 *   PUBLIC_ORIGIN
 *   TURNSTILE_SECRET_KEY     when configured, a valid turnstileToken is required
 *
 * No payment, account, membership, partnership or funding status is created here.
 */

const TYPES = ["4people", "4brands", "4partners", "4funders"] as const;
type LeadType = (typeof TYPES)[number];

function attribution(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  const pairs: [string, string][] = [
    ["channel", clean(input.channel, 100)],
    ["campaign", clean(input.campaign, 160)],
    ["contentId", clean(input.contentId, 160)],
    ["storyId", clean(input.storyId, 160)],
    ["goldVerticalId", clean(input.goldVerticalId, 160)],
    ["outreachActorId", clean(input.outreachActorId, 160)],
    ["utmSource", clean(input.utmSource, 160)],
    ["utmMedium", clean(input.utmMedium, 160)],
    ["utmCampaign", clean(input.utmCampaign, 160)],
    ["utmContent", clean(input.utmContent, 160)],
    ["referrerHost", clean(input.referrerHost, 253)],
  ];
  return Object.fromEntries(pairs.filter(([, v]) => Boolean(v)));
}

async function recordSignupEvent(
  env: ProductionEnv & { SUPABASE_URL: string; SUPABASE_SECRET_KEY: string },
  idempotencyKey: string,
  sourceRoute: string,
  attributionData: Record<string, string>,
) {
  if (env.MEASUREMENT_ENABLED !== "true") return false;
  const eventPayload = {
    idempotency_key: `lead:${idempotencyKey}:signup-complete`.slice(0, 160),
    event_name: "signup_completion",
    occurred_at: new Date().toISOString(),
    environment: environment(env),
    session_id: null,
    source_route: sourceRoute,
    entity_type: "registration",
    entity_id: null,
    channel: attributionData.channel || null,
    campaign: attributionData.campaign || null,
    content_id: attributionData.contentId || null,
    story_id: attributionData.storyId || null,
    gold_vertical_id: attributionData.goldVerticalId || null,
    outreach_actor_id: attributionData.outreachActorId || null,
    utm_source: attributionData.utmSource || null,
    utm_medium: attributionData.utmMedium || null,
    utm_campaign: attributionData.utmCampaign || null,
    utm_content: attributionData.utmContent || null,
    referrer_host: attributionData.referrerHost || null,
    release_sha: env.CF_PAGES_COMMIT_SHA || null,
    properties: {},
  };
  try {
    const res = await supabaseInsert(env, "product_events", eventPayload);
    return res.ok || res.status === 409;
  } catch {
    return false;
  }
}

export const onRequestPost = async (ctx: { request: Request; env: ProductionEnv }): Promise<Response> => {
  const { request, env } = ctx;

  if (env.PUBLIC_INTAKE_ENABLED !== "true") {
    return json({ ok: true, delivered: false, reason: "intake_disabled" });
  }
  if (!sameOrigin(request, env)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  if (!bodyWithinLimit(request)) return json({ ok: false, error: "payload_too_large" }, 413);
  if (!productionConfigured(env)) return json({ ok: false, error: "intake_misconfigured" }, 503);

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Honeypot: real users never fill this field. Do not tell bots why they were dropped.
  if (clean(data.company_hp)) return json({ ok: true, delivered: false, reason: "filtered" });

  if (env.TURNSTILE_SECRET_KEY) {
    const turnstileOk = await verifyTurnstile(request, env.TURNSTILE_SECRET_KEY, clean(data.turnstileToken, 2048));
    if (!turnstileOk) return json({ ok: false, error: "human_verification_failed" }, 400);
  }

  const type = clean(data.type).toLowerCase() as LeadType;
  if (!TYPES.includes(type)) return json({ ok: false, error: "invalid_type" }, 400);

  const name = clean(data.name, 120);
  const email = clean(data.email, 254).toLowerCase();
  const interest = clean(data.interest, 600);
  const sourceRoute = clean(data.sourceRoute, 200) || "/join";
  if (!name) return json({ ok: false, error: "name_required" }, 400);
  if (!emailOk(email)) return json({ ok: false, error: "email_invalid" }, 400);
  if (!interest) return json({ ok: false, error: "interest_required" }, 400);
  if (data.consent !== true) return json({ ok: false, error: "consent_required" }, 400);

  const interests = Array.isArray(data.interests)
    ? data.interests.map((x) => clean(x, 60)).filter(Boolean).slice(0, 20)
    : [];
  const attributionData = attribution(data.attribution);
  const dedupeKey = await sha256(`${email}|${type}|${interest.toLowerCase()}`);
  const fallbackIdempotency = `auto:${await sha256(`${dedupeKey}|${sourceRoute}|${clean(data.message, 1200)}`)}`;
  const idempotencyKey = idempotencyFrom(request, fallbackIdempotency);

  try {
    const lookup = await supabaseGet(
      env,
      `public_registrations?dedupe_key=eq.${encodeURIComponent(dedupeKey)}&select=id,relationship_status&limit=1`,
    );
    if (!lookup.ok) return json({ ok: false, error: "storage_unavailable" }, 503);
    const existing = (await lookup.json()) as Array<{ id: string; relationship_status: string }>;
    if (existing.length > 0) {
      await recordSignupEvent(env, idempotencyKey, sourceRoute, attributionData);
      return json({ ok: true, delivered: true, duplicateSuppressed: true });
    }

    const now = new Date().toISOString();
    const registration = {
      idempotency_key: idempotencyKey,
      dedupe_key: dedupeKey,
      lead_type: type,
      name,
      email,
      organisation: nullable(data.organisation ?? data.company, 160),
      role: nullable(data.role, 120),
      website: nullable(data.website, 200),
      work_area: nullable(data.workArea, 300),
      funding_interest: nullable(data.fundingInterest, 300),
      interest,
      interests,
      message: nullable(data.message, 1200),
      consent_scope: "registration_contact_v1",
      consent_at: now,
      marketing_permission: false,
      source_route: sourceRoute,
      attribution: attributionData,
      relationship_status: "RECEIVED",
    };

    const inserted = await supabaseInsert(env, "public_registrations", registration);
    if (!inserted.ok) {
      // A concurrent identical submission may have won the unique dedupe race.
      if (inserted.status === 409) {
        const raceLookup = await supabaseGet(
          env,
          `public_registrations?dedupe_key=eq.${encodeURIComponent(dedupeKey)}&select=id&limit=1`,
        );
        if (raceLookup.ok && ((await raceLookup.json()) as unknown[]).length > 0) {
          await recordSignupEvent(env, idempotencyKey, sourceRoute, attributionData);
          return json({ ok: true, delivered: true, duplicateSuppressed: true });
        }
      }
      return json({ ok: false, error: "storage_failed" }, 502);
    }

    const measurementRecorded = await recordSignupEvent(env, idempotencyKey, sourceRoute, attributionData);
    return json({ ok: true, delivered: true, duplicateSuppressed: false, measurementRecorded });
  } catch {
    return json({ ok: false, error: "storage_error" }, 502);
  }
};

export const onRequest = async (ctx: { request: Request; env: ProductionEnv }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405, { allow: "POST" });
};
