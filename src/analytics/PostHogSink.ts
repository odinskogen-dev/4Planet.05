const POSTHOG_ANON_ID_KEY = "4planet.analytics.anonymous-id.v1";

export type AnalyticsValue = string | number | boolean;
export type AnalyticsProperties = Record<string, AnalyticsValue>;

function projectKey(): string {
  return import.meta.env.VITE_POSTHOG_PROJECT_KEY?.trim() || "";
}

function ingestHost(): string {
  const configured = import.meta.env.VITE_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
  return configured.replace(/\/+$/, "");
}

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function anonymousId(): string {
  const existing = window.localStorage.getItem(POSTHOG_ANON_ID_KEY);
  if (existing) return existing;
  const next = randomId();
  window.localStorage.setItem(POSTHOG_ANON_ID_KEY, next);
  return next;
}

/**
 * Minimal PostHog transport for the existing 4PLANET analytics event spine.
 *
 * Invariants:
 * - The caller owns consent + hostname gating.
 * - No autocapture, replay, query strings, free text, email/name, exact coordinates or raw payloads.
 * - Anonymous events do not create person profiles.
 * - Missing config fails closed without affecting the product or GA4.
 */
export function capturePostHog(event: string, properties: AnalyticsProperties = {}): boolean {
  const apiKey = projectKey();
  if (!apiKey || typeof window === "undefined" || typeof fetch !== "function") return false;

  const payload = {
    api_key: apiKey,
    event,
    distinct_id: anonymousId(),
    properties: {
      ...properties,
      $process_person_profile: false,
      $lib: "4planet-web",
      $lib_version: "1",
    },
  };

  void fetch(`${ingestHost()}/i/v0/e/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);

  return true;
}
