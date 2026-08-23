import { trackEvent } from "@/analytics/Analytics";

const VISIT_KEY = "4planet.magazine.last-visit.v1";

export function trackMagazineEntry(entry: "home" | "article", slug?: string) {
  // GA is installed only after explicit analytics consent. Do not create a
  // separate tracking state before that consent exists.
  if (!window.gtag) return;

  const now = Date.now();
  const previousRaw = window.localStorage.getItem(VISIT_KEY);
  const previous = previousRaw ? Number(previousRaw) : 0;
  const daysSinceLast = previous > 0 ? Math.max(0, Math.floor((now - previous) / 86_400_000)) : -1;

  trackEvent("magazine_entry", {
    entry_type: entry,
    story_slug: slug || "",
    visitor_state: previous > 0 ? "returning" : "first_observed",
    days_since_last_observed_visit: daysSinceLast,
    referrer_host: safeReferrerHost(),
  });

  window.localStorage.setItem(VISIT_KEY, String(now));
}

export function trackMagazineSecondObject(storySlug: string, destination: string, kind: string) {
  trackEvent("magazine_relevant_second_object", {
    story_slug: storySlug,
    destination,
    destination_kind: kind,
  });
}

export function trackMagazineShare(storySlug: string, method: "native" | "copy") {
  trackEvent("magazine_share", { story_slug: storySlug, share_method: method });
}

function safeReferrerHost(): string {
  if (!document.referrer) return "direct_or_unknown";
  try {
    return new URL(document.referrer).hostname || "direct_or_unknown";
  } catch {
    return "invalid_referrer";
  }
}
