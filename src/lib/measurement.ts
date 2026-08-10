export const PRODUCT_EVENT_NAMES = [
  "landing",
  "gold_vertical_entry",
  "atlas_interaction",
  "species_interaction",
  "source_open",
  "relationship_reveal",
  "impact_member_cta",
  "signup_start",
  "signup_completion",
  "contact_enquiry",
  "return_visit",
  "content_referral",
  "payment_intent",
  "checkout",
  "payment_success",
  "payment_failure",
  "payment_refund",
] as const;

export type ProductEventName = (typeof PRODUCT_EVENT_NAMES)[number];

export interface AttributionContext {
  channel?: string;
  campaign?: string;
  contentId?: string;
  storyId?: string;
  goldVerticalId?: string;
  outreachActorId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  referrerHost?: string;
}

export interface ProductEventContext {
  entityType?: string;
  entityId?: string;
  attribution?: AttributionContext;
  properties?: Record<string, string | number | boolean | null>;
}

const SESSION_KEY = "4p_measurement_session_v1";

function bounded(value: string | null, max: number): string | undefined {
  const trimmed = value?.trim().slice(0, max);
  return trimmed || undefined;
}

function referrerHost(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    return bounded(new URL(document.referrer).hostname, 253);
  } catch {
    return undefined;
  }
}

export function currentAttribution(): AttributionContext {
  const params = new URLSearchParams(window.location.search);
  const attribution: AttributionContext = {
    channel: bounded(params.get("channel"), 100),
    campaign: bounded(params.get("campaign"), 160),
    contentId: bounded(params.get("content"), 160),
    storyId: bounded(params.get("story"), 160),
    goldVerticalId: bounded(params.get("vertical"), 160),
    outreachActorId: bounded(params.get("actor"), 160),
    utmSource: bounded(params.get("utm_source"), 160),
    utmMedium: bounded(params.get("utm_medium"), 160),
    utmCampaign: bounded(params.get("utm_campaign"), 160),
    utmContent: bounded(params.get("utm_content"), 160),
    referrerHost: referrerHost(),
  };
  return Object.fromEntries(Object.entries(attribution).filter(([, value]) => Boolean(value))) as AttributionContext;
}

export function measurementSessionId(): string | undefined {
  try {
    const current = sessionStorage.getItem(SESSION_KEY);
    if (current) return current;
    const created = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    return undefined;
  }
}

export async function trackProductEvent(eventName: ProductEventName, context: ProductEventContext = {}): Promise<boolean> {
  const occurredAt = new Date().toISOString();
  const idempotencyKey = `evt:${crypto.randomUUID()}`;
  try {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
      },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        occurredAt,
        sessionId: measurementSessionId(),
        sourceRoute: `${window.location.pathname}${window.location.search}`.slice(0, 300),
        attribution: context.attribution ?? currentAttribution(),
        entityType: context.entityType,
        entityId: context.entityId,
        properties: context.properties ?? {},
      }),
    });
    if (!response.ok) return false;
    const result = (await response.json().catch(() => ({}))) as { recorded?: boolean };
    return result.recorded === true;
  } catch {
    return false;
  }
}
