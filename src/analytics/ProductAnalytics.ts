import { trackEvent } from "@/analytics/Analytics";

export type ProductArea = "4planet" | "magazine" | "atlas" | "species" | "living_systems" | "impact" | "missions" | "domains";
export type MeaningfulUseKind =
  | "search"
  | "record_open"
  | "layer_interaction"
  | "journey_progress"
  | "source_open"
  | "watch_follow"
  | "article_depth";

function safeToken(value: string | undefined, max = 160): string {
  if (!value) return "";
  return value.trim().slice(0, max).replace(/[^a-zA-Z0-9._:/-]/g, "_");
}

/**
 * Privacy-safe shared funnel primitives. Never pass names, email addresses,
 * free-text queries, exact coordinates, raw source payloads or other PII here.
 * GA4 remains dormant unless a real VITE_GA_MEASUREMENT_ID exists and consent
 * has been granted by Analytics.tsx.
 */
export function trackProductEntry(product: ProductArea, entryPath: string, entryKind: "direct" | "internal" | "editorial" | "shared_link" = "direct") {
  trackEvent("product_entry", {
    product_area: product,
    entry_path: safeToken(entryPath, 220),
    entry_kind: entryKind,
  });
}

export function trackMeaningfulUse(product: ProductArea, kind: MeaningfulUseKind, objectType?: string) {
  trackEvent("meaningful_use", {
    product_area: product,
    use_kind: kind,
    object_type: safeToken(objectType),
  });
}

export function trackCompletion(product: ProductArea, completionType: "article" | "journey" | "task", objectId?: string) {
  trackEvent("product_completion", {
    product_area: product,
    completion_type: completionType,
    object_id: safeToken(objectId),
  });
}

export function trackDeeperExploration(product: ProductArea, destinationProduct: ProductArea, destinationType: string) {
  trackEvent("deeper_exploration", {
    product_area: product,
    destination_product: destinationProduct,
    destination_type: safeToken(destinationType),
  });
}

export function trackShareReferral(product: ProductArea, method: "native" | "copy" | "link") {
  trackEvent("share_referral", {
    product_area: product,
    share_method: method,
  });
}

export function trackJoinInterest(product: ProductArea, surface: "join" | "follow" | "watch" | "partner" | "fund") {
  trackEvent("join_interest", {
    product_area: product,
    interest_surface: surface,
  });
}
