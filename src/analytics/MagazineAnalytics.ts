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
  const returning = previous > 0;
  const daysSinceLast = returning ? Math.max(0, Math.floor((now - previous) / 86_400_000)) : -1;
  const attribution = currentAttribution(now);

  trackEvent("magazine_entry", {
    entry_type: entry,
    story_slug: slug || "",
    visitor_state: returning ? "returning" : "first_observed",
    days_since_last_observed_visit: daysSinceLast,
    referrer_host: safeReferrerHost(),
    acquisition_source: attribution.source,
    acquisition_medium: attribution.medium,
    acquisition_campaign: attribution.campaign,
    acquisition_content: attribution.content,
    acquisition_landing_path: attribution.landingPath,
  });

  if (entry === "article" && slug) {
    trackEvent("article_open", { story_slug: slug, visitor_state: returning ? "returning" : "first_observed" });
  }
  if (returning) {
    trackEvent("returning_reader", { days_since_last_observed_visit: daysSinceLast, entry_type: entry });
  }

  window.localStorage.setItem(VISIT_KEY, String(now));
}

export function trackMagazineEngagedRead(storySlug: string, seconds: number) {
  trackEvent("engaged_read", { story_slug: storySlug, engaged_seconds: seconds });
}

export function trackMagazineReadDepth(storySlug: string, depth: number) {
  trackEvent("read_depth", { story_slug: storySlug, depth_percent: depth });
}

export function trackMagazineReadComplete(storySlug: string) {
  trackEvent("read_complete", { story_slug: storySlug });
}

export function trackMagazineTopicOpen(topic: string, source: string = "navigation") {
  trackEvent("topic_open", { topic: safeToken(topic), source });
}

export function trackMagazineSearch(query: string, resultCount?: number) {
  const clean = query.trim().slice(0, 120);
  if (!clean) return;
  trackEvent("search", { search_term: clean, ...(typeof resultCount === "number" ? { result_count: resultCount } : {}) });
}

export function trackMagazineSave(storySlug: string, state: "saved" | "removed") {
  trackEvent("save", { story_slug: storySlug, state });
}

export function trackMagazineShare(storySlug: string, method: "native" | "copy") {
  trackEvent("share", { story_slug: storySlug, share_method: method });
}

export function trackMagazineRelatedStoryOpen(storySlug: string, destinationSlug: string) {
  trackEvent("related_story_open", { story_slug: storySlug, destination_story_slug: destinationSlug });
}

export function trackMagazineSourceOpen(storySlug: string, sourceUrl: string, sourceLabel?: string) {
  let sourceHost = "invalid_source";
  try { sourceHost = new URL(sourceUrl).hostname; } catch { /* keep bounded fallback */ }
  trackEvent("source_open", { story_slug: storySlug, source_host: sourceHost, source_label: (sourceLabel || "").slice(0, 120) });
}

export function trackMagazineAtlasOpen(source: string = "magazine") {
  trackEvent("atlas_open", { source });
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
