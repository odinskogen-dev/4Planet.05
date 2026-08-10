import {
  EVENT_NAMES,
  PAYMENT_EVENTS,
  bodyWithinLimit,
  boundedProperties,
  clean,
  environment,
  idempotencyFrom,
  json,
  nullable,
  productionConfigured,
  sameOrigin,
  sha256,
  supabaseInsert,
  validOccurredAt,
  type EventName,
  type ProductionEnv,
} from "../_shared/production";

/**
 * POST /api/events — bounded first-party product measurement.
 *
 * Explicitly excluded: IP address, full referrer URL, User-Agent persistence,
 * device fingerprinting, advertising identifiers and arbitrary PII properties.
 */

function optionalAttribution(data: Record<string, unknown>) {
  const attribution = data.attribution && typeof data.attribution === "object" && !Array.isArray(data.attribution)
    ? (data.attribution as Record<string, unknown>)
    : {};
  return {
    channel: nullable(attribution.channel, 100),
    campaign: nullable(attribution.campaign, 160),
    content_id: nullable(attribution.contentId, 160),
    story_id: nullable(attribution.storyId, 160),
    gold_vertical_id: nullable(attribution.goldVerticalId, 160),
    outreach_actor_id: nullable(attribution.outreachActorId, 160),
    utm_source: nullable(attribution.utmSource, 160),
    utm_medium: nullable(attribution.utmMedium, 160),
    utm_campaign: nullable(attribution.utmCampaign, 160),
    utm_content: nullable(attribution.utmContent, 160),
    referrer_host: nullable(attribution.referrerHost, 253),
  };
}

export const onRequestPost = async (ctx: { request: Request; env: ProductionEnv }): Promise<Response> => {
  const { request, env } = ctx;
  if (env.MEASUREMENT_ENABLED !== "true") return json({ ok: true, recorded: false, reason: "measurement_disabled" });
  if (!sameOrigin(request, env)) return json({ ok: false, error: "origin_not_allowed" }, 403);
  if (!bodyWithinLimit(request)) return json({ ok: false, error: "payload_too_large" }, 413);
  if (!productionConfigured(env)) return json({ ok: false, error: "measurement_misconfigured" }, 503);

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const eventName = clean(data.eventName, 80) as EventName;
  if (!EVENT_NAMES.includes(eventName)) return json({ ok: false, error: "event_not_allowed" }, 400);
  if (PAYMENT_EVENTS.has(eventName) && env.PAYMENTS_ENABLED !== "true") {
    return json({ ok: false, error: "payments_disabled" }, 409);
  }

  const occurredAt = validOccurredAt(data.occurredAt);
  if (!occurredAt) return json({ ok: false, error: "occurred_at_invalid" }, 400);
  const sourceRoute = clean(data.sourceRoute, 300);
  if (!sourceRoute.startsWith("/")) return json({ ok: false, error: "source_route_invalid" }, 400);

  const properties = boundedProperties(data.properties);
  if (properties === null) return json({ ok: false, error: "properties_not_allowed" }, 400);
  const sessionId = nullable(data.sessionId, 80);
  const fallbackIdempotency = `event:${await sha256(`${eventName}|${occurredAt}|${sessionId || "none"}|${sourceRoute}`)}`;
  const idempotencyKey = idempotencyFrom(request, fallbackIdempotency);

  const payload = {
    idempotency_key: idempotencyKey,
    event_name: eventName,
    occurred_at: occurredAt,
    environment: environment(env),
    session_id: sessionId,
    source_route: sourceRoute,
    entity_type: nullable(data.entityType, 80),
    entity_id: nullable(data.entityId, 200),
    ...optionalAttribution(data),
    release_sha: env.CF_PAGES_COMMIT_SHA || null,
    properties,
  };

  try {
    const result = await supabaseInsert(env, "product_events", payload);
    if (result.ok) return json({ ok: true, recorded: true });
    if (result.status === 409) return json({ ok: true, recorded: true, duplicateSuppressed: true });
    return json({ ok: false, error: "measurement_storage_failed" }, 502);
  } catch {
    return json({ ok: false, error: "measurement_storage_error" }, 502);
  }
};

export const onRequest = async (ctx: { request: Request; env: ProductionEnv }): Promise<Response> => {
  if (ctx.request.method === "POST") return onRequestPost(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405, { allow: "POST" });
};
