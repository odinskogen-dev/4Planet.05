import { trackEvent } from "@/analytics/Analytics";

const VISIT_KEY = "4planet.magazine.last-visit.v1";
const ATTRIBUTION_KEY = "4planet.magazine.attribution.v1";

interface MagazineAttribution {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  landingPath: string;
  capturedAt: number;
}

export function trackMagazineEntry(entry: "home" | "article", slug?: string) {
  // GA is installed only after explicit analytics consent. Do not create a
  // separate behavioural tracking state before that consent exists.
  if (!window.gtag) return;

  const now = Date.now();
  const previousRaw = window.localStorage.getItem(VISIT_KEY);
  const previous = previousRaw ? Number(previousRaw) : 0;
  const daysSinceLast = previous > 0 ? Math.max(0, Math.floor((now - previous) / 86_400_000)) : -1;
  const attribution = currentAttribution(now);

  trackEvent("magazine_entry", {
    entry_type: entry,
    story_slug: slug || "",
    visitor_state: previous > 0 ? "returning" : "first_observed",
    days_since_last_observed_visit: daysSinceLast,
    referrer_host: safeReferrerHost(),
    acquisition_source: attribution.source,
    acquisition_medium: attribution.medium,
    acquisition_campaign: attribution.campaign,
    acquisition_content: attribution.content,
    acquisition_landing_path: attribution.landingPath,
  });

  window.localStorage.setItem(VISIT_KEY, String(now));
}

export function trackMagazineSecondObject(storySlug: string, destination: string, kind: string) {
  const attribution = storedAttribution();
  trackEvent("magazine_relevant_second_object", {
    story_slug: storySlug,
    destination,
    destination_kind: kind,
    acquisition_source: attribution?.source || "direct_or_unknown",
    acquisition_medium: attribution?.medium || "unknown",
    acquisition_campaign: attribution?.campaign || "",
  });
}

export function trackMagazineShare(storySlug: string, method: "native" | "copy") {
  trackEvent("magazine_share", { story_slug: storySlug, share_method: method });
}

export function trackMagazinePartnerAction(actorId: string, action: "submission" | "share" | "profile_open" | "qualified_inbound", dispatchId?: string) {
  trackEvent("magazine_partner_loop", {
    actor_id: actorId,
    partner_action: action,
    dispatch_id: dispatchId || "",
  });
}

function currentAttribution(now: number): MagazineAttribution {
  const params = new URLSearchParams(window.location.search);
  const campaignPresent = ["utm_source", "utm_medium", "utm_campaign", "utm_content"].some((key) => params.has(key));
  const existing = storedAttribution();

  if (!campaignPresent && existing) return existing;

  const attribution: MagazineAttribution = {
    source: safeToken(params.get("utm_source")) || safeReferrerHost(),
    medium: safeToken(params.get("utm_medium")) || (document.referrer ? "referral" : "direct"),
    campaign: safeToken(params.get("utm_campaign")),
    content: safeToken(params.get("utm_content")),
    landingPath: window.location.pathname,
    capturedAt: now,
  };
  window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  return attribution;
}

function storedAttribution(): MagazineAttribution | null {
  const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<MagazineAttribution>;
    if (!parsed || typeof parsed.source !== "string" || typeof parsed.landingPath !== "string") return null;
    return {
      source: parsed.source,
      medium: typeof parsed.medium === "string" ? parsed.medium : "unknown",
      campaign: typeof parsed.campaign === "string" ? parsed.campaign : "",
      content: typeof parsed.content === "string" ? parsed.content : "",
      landingPath: parsed.landingPath,
      capturedAt: typeof parsed.capturedAt === "number" ? parsed.capturedAt : 0,
    };
  } catch {
    return null;
  }
}

function safeToken(value: string | null): string {
  if (!value) return "";
  return value.trim().slice(0, 120).replace(/[^a-zA-Z0-9._:-]/g, "_");
}

function safeReferrerHost(): string {
  if (!document.referrer) return "direct_or_unknown";
  try {
    return new URL(document.referrer).hostname || "direct_or_unknown";
  } catch {
    return "invalid_referrer";
  }
}
