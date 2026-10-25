import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { capturePostHog } from "@/analytics/PostHogSink";
import { isAtlasEmbedKind } from "@/earth/atlasViewContract";

export const ANALYTICS_STORAGE_KEY = "4planet.analytics.consent.v1";
export const INTERNAL_ANALYTICS_STORAGE_KEY = "4planet.analytics.internal.v1";
const INTERNAL_ANALYTICS_QUERY_KEY = "4p_internal";

const DEFAULT_GA_MEASUREMENT_ID = "G-Q79Y9HJRL8";
const DEFAULT_ANALYTICS_DOMAINS = [
  "4planet.org",
  "id.4planet.org",
  "labs.4planet.org",
  "4sapien.com",
  "4planetatlas.com",
  "4brain.app",
  "4planetmagazine.com",
  "s4piens.com",
  "4species.com",
  "4brands.org",
  "4nation.org",
  "cre4tor.com",
  "cre4tor.4planet.org",
  "cre4tors.com",
  "4planetmarket.com",
] as const;

type ConsentState = "granted" | "denied" | null;
type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

function measurementId(): string {
  return import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_MEASUREMENT_ID;
}

function canonicalHost(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

const DISCOVERY_SESSION_KEY = "4planet.discovery.entry.v1";

type DiscoveryChannel =
  | "AI_CHATGPT"
  | "AI_PERPLEXITY"
  | "AI_CLAUDE"
  | "AI_GEMINI"
  | "AI_COPILOT"
  | "SEARCH_GOOGLE"
  | "SEARCH_BING"
  | "SEARCH_ECOSIA"
  | "SEARCH_DUCKDUCKGO"
  | "SOCIAL_INSTAGRAM"
  | "SOCIAL_FACEBOOK"
  | "SOCIAL_LINKEDIN"
  | "EMAIL"
  | "DIRECT"
  | "INTERNAL_4PLANET"
  | "AUTH_OR_INFRA"
  | "REFERRAL_OTHER";

function safeHostname(rawUrl: string): string {
  if (!rawUrl) return "";
  try {
    return canonicalHost(new URL(rawUrl).hostname);
  } catch {
    return "";
  }
}

export function isInternalOrInfrastructureReferrer(hostname: string): boolean {
  const host = canonicalHost(hostname);
  if (!host) return false;
  return isAnalyticsHostAllowed(host)
    || host === "accounts.google.com"
    || host.endsWith(".workers.dev")
    || host.endsWith(".pages.dev")
    || host === "localhost"
    || host.endsWith(".localhost");
}

function classifyDiscoveryEntry(): DiscoveryChannel {
  const source = (new URLSearchParams(window.location.search).get("utm_source") || "").trim().toLowerCase();
  const medium = (new URLSearchParams(window.location.search).get("utm_medium") || "").trim().toLowerCase();
  const referrerHost = safeHostname(document.referrer);

  if (isAnalyticsHostAllowed(referrerHost)) return "INTERNAL_4PLANET";
  if (referrerHost === "accounts.google.com" || referrerHost.endsWith(".workers.dev") || referrerHost.endsWith(".pages.dev")) return "AUTH_OR_INFRA";
  if (source.includes("chatgpt") || referrerHost === "chatgpt.com" || referrerHost.endsWith(".chatgpt.com")) return "AI_CHATGPT";
  if (source.includes("perplexity") || referrerHost === "perplexity.ai" || referrerHost.endsWith(".perplexity.ai")) return "AI_PERPLEXITY";
  if (source.includes("claude") || referrerHost === "claude.ai" || referrerHost.endsWith(".claude.ai")) return "AI_CLAUDE";
  if (source.includes("gemini") || referrerHost === "gemini.google.com") return "AI_GEMINI";
  if (source.includes("copilot") || referrerHost === "copilot.microsoft.com" || referrerHost === "copilot.microsoft365.com") return "AI_COPILOT";
  if (source === "google" || referrerHost.startsWith("google.") || referrerHost.includes(".google.")) return "SEARCH_GOOGLE";
  if (source === "bing" || referrerHost === "bing.com" || referrerHost.endsWith(".bing.com")) return "SEARCH_BING";
  if (source === "ecosia" || referrerHost === "ecosia.org" || referrerHost.endsWith(".ecosia.org")) return "SEARCH_ECOSIA";
  if (source === "duckduckgo" || referrerHost === "duckduckgo.com" || referrerHost.endsWith(".duckduckgo.com")) return "SEARCH_DUCKDUCKGO";
  if (source.includes("instagram") || source === "ig" || referrerHost === "instagram.com" || referrerHost.endsWith(".instagram.com")) return "SOCIAL_INSTAGRAM";
  if (source.includes("facebook") || referrerHost === "facebook.com" || referrerHost.endsWith(".facebook.com")) return "SOCIAL_FACEBOOK";
  if (source.includes("linkedin") || referrerHost === "linkedin.com" || referrerHost.endsWith(".linkedin.com")) return "SOCIAL_LINKEDIN";
  if (medium === "email" || medium === "newsletter" || source.includes("newsletter")) return "EMAIL";
  if (!referrerHost && !source) return "DIRECT";
  return "REFERRAL_OTHER";
}

function trackDiscoveryEntryOnce(pagePath: string) {
  if (window.sessionStorage.getItem(DISCOVERY_SESSION_KEY)) return;
  const discoveryChannel = classifyDiscoveryEntry();
  if (discoveryChannel === "INTERNAL_4PLANET" || discoveryChannel === "AUTH_OR_INFRA") {
    window.sessionStorage.setItem(DISCOVERY_SESSION_KEY, discoveryChannel);
    return;
  }
  const tracked = trackEvent("discovery_entry", {
    discovery_channel: discoveryChannel,
    landing_product: productArea(pagePath, window.location.hostname),
    landing_path: pagePath,
  });
  if (tracked) window.sessionStorage.setItem(DISCOVERY_SESSION_KEY, discoveryChannel);
}

function configuredDomains(): string[] {
  const configured = (import.meta.env.VITE_ANALYTICS_DOMAINS || "")
    .split(",")
    .map(canonicalHost)
    .filter(Boolean);
  return Array.from(new Set(configured.length ? configured : DEFAULT_ANALYTICS_DOMAINS));
}

export function isAnalyticsHostAllowed(hostname: string): boolean {
  const host = canonicalHost(hostname);
  if (
    !host
    || host === "localhost"
    || host.endsWith(".localhost")
    || host.endsWith(".pages.dev")
    || host.endsWith(".workers.dev")
    || host === "test.4planet.org"
    || host.endsWith(".test.4planet.org")
  ) return false;
  return configuredDomains().includes(host);
}

/**
 * Block analytics while OAuth credentials, one-time codes or authorisation
 * identifiers remain in the browser URL. The identity SDK owns their removal.
 */
function decodeForAnalyticsInspection(value: string): string {
  let decoded = value;
  for (let pass = 0; pass < 2; pass += 1) {
    try {
      const next = decodeURIComponent(decoded.replace(/\+/g, "%20"));
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded.normalize("NFC");
}

function hasUnsupportedNestedAnalyticsEncoding(value: string): boolean {
  const inspected = decodeForAnalyticsInspection(value);
  try {
    return decodeURIComponent(inspected.replace(/\+/g, "%20")) !== inspected;
  } catch {
    return true;
  }
}

function containsSensitiveAnalyticsMaterial(value: string): boolean {
  if (hasUnsupportedNestedAnalyticsEncoding(value)) return true;
  const inspected = decodeForAnalyticsInspection(value);
  return /(?:^|[/?#&])(?:access_token|refresh_token|id_token|token_hash|authorization_code|authorization_id|code|state|client_secret|session_token|auth_return)=/i.test(inspected)
    || /[\p{L}\p{M}\p{N}._%+-]+@(?:[\p{L}\p{M}\p{N}-]+\.)+[\p{L}\p{M}]{2,}/u.test(inspected)
    || /eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}/.test(inspected)
    || /\bbearer[\s_:.-]+[A-Za-z0-9._~-]{8,}/i.test(inspected)
    || /(?:\p{Nd}[^\p{L}\p{N}]*){7}/u.test(inspected);
}

export function isSensitiveAnalyticsNavigation(): boolean {
  if (typeof window === "undefined") return false;
  const { pathname, search, hash } = window.location;
  const inspectedPath = decodeForAnalyticsInspection(pathname);
  if (/^\/(?:auth\/(?:4planet\/)?callback|oauth\/(?:callback|consent))\/?$/i.test(inspectedPath)) return true;
  return containsSensitiveAnalyticsMaterial(`${pathname}${search}${hash}`);
}

function readConsent(): ConsentState {
  const value = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

function applyInternalAnalyticsControl(): boolean {
  const params = new URLSearchParams(window.location.search);
  // A public acquisition URL is not authority to classify a browser as internal.
  // Keep scrubbing the legacy control parameter, but only an out-of-band,
  // explicitly provisioned browser marker may suppress measurement.
  if (params.has(INTERNAL_ANALYTICS_QUERY_KEY)) {
    params.delete(INTERNAL_ANALYTICS_QUERY_KEY);
    const query = params.toString();
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }
  return window.localStorage.getItem(INTERNAL_ANALYTICS_STORAGE_KEY) === "1";
}

function isInternalAnalyticsBrowser(): boolean {
  return window.localStorage.getItem(INTERNAL_ANALYTICS_STORAGE_KEY) === "1";
}

function productArea(pathname: string, hostname: string): string {
  const host = canonicalHost(hostname);
  if (host === "4brands.org" || pathname.startsWith("/4brand")) return "4brands";
  if (host === "4nation.org" || pathname.startsWith("/4nation")) return "4nation";
  if (host === "4species.com") return "species";
  if (host === "4planetmagazine.com") return "magazine";
  if (host === "4sapien.com" || pathname.startsWith("/4sapien")) return "4sapien";
  if (host === "4planetatlas.com" || pathname.startsWith("/atlas")) return "atlas";
  if (host === "s4piens.com" || pathname === "/domains/s4piens" || pathname.startsWith("/s4piens/")) return "s4piens";
  if (host === "4planetmarket.com" || pathname === "/market" || pathname.startsWith("/market/")) return "market";
  if (host === "cre4tor.com" || host === "cre4tors.com" || host === "cre4tor.4planet.org" || pathname.startsWith("/cre4tor") || pathname.startsWith("/creator/")) return "creator";
  if (pathname.startsWith("/magazine")) return "magazine";
  if (pathname.startsWith("/species")) return "species";
  if (pathname === "/livingsystems" || pathname.startsWith("/livingsystems/") || pathname.startsWith("/living-systems")) return "living_systems";
  if (pathname.startsWith("/impact")) return "impact";
  if (pathname.startsWith("/missions")) return "missions";
  if (pathname.startsWith("/domains")) return "domains";
  return "4planet";
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  if (window.gtag) return;
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  } as Gtag;
}

function setConsentDefaultDenied() {
  ensureGtag();
  window.gtag?.("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
}

function updateConsent(next: Exclude<ConsentState, null>) {
  ensureGtag();
  window.gtag?.("consent", "update", {
    analytics_storage: next,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function installGoogleTag(id: string, domains: string[]) {
  if (!id || isSensitiveAnalyticsNavigation() || document.getElementById("4planet-ga4")) return;

  ensureGtag();
  updateConsent("granted");

  if (domains.length > 1) {
    window.gtag?.("set", "linker", {
      domains,
      decorate_forms: true,
    });
  }

  const safeConfig = privacySafeEventParameters({ page_path: window.location.pathname });
  const safePath = safeConfig.page_path;
  if (typeof safePath !== "string") return;

  window.gtag?.("js", new Date());
  window.gtag?.("config", id, {
    send_page_view: false,
    // Initial automatic events must use a privacy-safe, token-free path.
    page_location: `${window.location.origin}${safePath}`,
    page_path: safePath,
    ignore_referrer: isInternalOrInfrastructureReferrer(safeHostname(document.referrer)),
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.id = "4planet-ga4";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

/**
 * No free-text, PII, OAuth material or session credentials in event payloads.
 * This applies to both GA4 and PostHog, without changing authorised product events.
 */
export function privacySafeEventParameters(parameters: Record<string, string | number | boolean>) {
  const safe: Record<string, string | number | boolean> = {};
  const allowedKeys = new Set([
    "action_id", "action_kind", "activation_kind", "actor_id", "analysis_status", "attempts", "auth_method",
    "campaign_id", "canonical_entity", "claim_kind", "completion_type", "confirmation_state",
    "content_group", "country_scope", "creation_kind", "decision_kind", "decision_state",
    "decision_states", "destination", "destination_product", "destination_type",
    "discovery_channel", "entry_kind", "entry_path", "error_kind", "event_id",
    "evidence_ready_items", "from_product", "has_canonical_entity", "interest_surface",
    "internal", "item_count", "landing_path", "landing_product", "legal_identity",
    "memory_kind", "object_id", "object_kind", "object_slug", "object_type",
    "opportunity_count", "opportunity_id", "option_count", "page_path", "placement",
    "product_area", "product_key", "project_id", "public_slug", "result_count", "share_method",
    "site_host", "source_count", "source_host", "source_id", "source_kind",
    "species_slug", "target_host", "to_product", "unsupported_items", "use_kind",
    "value_kind", "variant_id", "actor_type", "lifecycle_stage", "evidence_state",
    "returning",
  ]);
  const pathKeys = new Set(["entry_path", "landing_path", "page_path"]);
  const hostKeys = new Set(["site_host", "source_host", "target_host"]);
  const numericCounterKeys = new Set([
    "attempts", "decision_states", "evidence_ready_items", "item_count", "opportunity_count",
    "option_count", "result_count", "source_count", "unsupported_items",
  ]);
  const lifecycleEnumValues: Record<string, ReadonlySet<string>> = {
    actor_type: new Set(["PERSON", "COMPANY"]),
    lifecycle_stage: new Set(["STATE", "DECISION", "ACTION", "OUTCOME", "PROOF", "RETURN"]),
    evidence_state: new Set(["SOURCE_REFERENCED", "USER_CONFIRMED", "DEMO_FIXTURE_NOT_VERIFIED", "UNKNOWN"]),
  };
  const publicIdentifierValuePatterns: Record<string, RegExp> = {
    action_id: /^action:4p:impact:[a-z0-9][a-z0-9._:-]{0,119}$/,
    actor_id: /^(?:actor:4p:impact:[a-z0-9][a-z0-9._:-]{0,119}|P17-A[0-9]{3,})$/,
    campaign_id: /^(?:campaign:[a-z0-9][a-z0-9._:-]{0,119}|[a-z][a-z0-9._-]{0,99})$/,
    canonical_entity: /^(?:[a-z][a-z0-9._-]{0,99}|[a-z][a-z0-9._-]{0,39}:[a-z0-9][a-z0-9._:-]{0,119})$/,
    event_id: /^(?:event:[a-z0-9][a-z0-9._:-]{0,119}|[a-z][a-z0-9._-]{0,99})$/,
    legal_identity: /^(?:brreg_exact|unresolved)$/,
    object_id: /^(?:[a-z][a-z0-9._-]{0,79}|[a-z][a-z0-9._-]{0,39}:[a-z0-9][a-z0-9._:-]{0,119})$/,
    object_slug: /^[a-z][a-z0-9._-]{0,99}$/,
    opportunity_id: /^(?:opportunity:[a-z0-9][a-z0-9._:-]{0,119}|[a-z][a-z0-9._-]{0,99})$/,
    product_key: /^[a-z][a-z0-9._-]{0,99}$/,
    project_id: /^project:4p:impact:[a-z0-9][a-z0-9._:-]{0,119}$/,
    public_slug: /^[a-z][a-z0-9._-]{0,99}$/,
    source_id: /^source:[a-z][a-z0-9._-]{0,119}$/,
    species_slug: /^[a-z][a-z0-9._-]{0,99}$/,
    variant_id: /^(?:variant:[a-z0-9][a-z0-9._:-]{0,119}|[a-z][a-z0-9._-]{0,99})$/,
  };
  const blockedKeys = /(?:^|_)(?:access_token|refresh_token|id_token|token_hash|session_token|authorization_code|authorization_id|client_secret|password|email|phone|secret|api_key|apikey|jwt|otp)(?:$|_)/i;
  // Treat seven or more digits as identity-shaped even when punctuation splits
  // the sequence. A public-looking namespace is not proof of public provenance.
  const tokenValue = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/;
  const pathValue = /^\/[A-Za-z0-9._~!$'()*+,;=:@%/-]{0,219}$/;
  const hostValue = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

  for (const [key, value] of Object.entries(parameters)) {
    const flatKey = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (!allowedKeys.has(key)
      || blockedKeys.test(key)
      || /(?:accesstoken|refreshtoken|idtoken|tokenhash|authorizationcode|authorizationid|clientsecret|emailaddress|phonenumber|password|apikey|sessiontoken|jwt|onetimesecret)/.test(flatKey)) continue;
    const lifecycleValues = lifecycleEnumValues[key];
    if (lifecycleValues) {
      if (typeof value === "string" && lifecycleValues.has(value)) safe[key] = value;
      continue;
    }
    if (key === "returning") {
      if (typeof value === "boolean") safe[key] = value;
      continue;
    }
    const publicIdentifierValuePattern = publicIdentifierValuePatterns[key];
    if (publicIdentifierValuePattern) {
      if (typeof value === "string") {
        const bounded = value.trim();
        // Public canonical IDs are namespaced/slugs, never raw long digit sequences
        // that can be mistaken for identity, telephone or payment-card data.
        if (!containsSensitiveAnalyticsMaterial(bounded) && publicIdentifierValuePattern.test(bounded)) safe[key] = bounded;
      }
      continue;
    }
    if (typeof value === "number") {
      // Numbers are admitted only where current producers define aggregate counts.
      // A generic allowlisted key is not permission to forward numeric identifiers.
      if (numericCounterKeys.has(key)
        && Number.isSafeInteger(value)
        && value >= 0
        && value <= 100_000) safe[key] = value;
      continue;
    }
    if (typeof value === "boolean") {
      safe[key] = value;
      continue;
    }
    const bounded = value.trim();
    if (!bounded || bounded.length > 220 || containsSensitiveAnalyticsMaterial(bounded)) continue;
    if (pathKeys.has(key)) {
      const inspected = decodeForAnalyticsInspection(bounded);
      if (pathValue.test(bounded) && !/[?#]/.test(inspected)) safe[key] = bounded;
      continue;
    }
    if (hostKeys.has(key)) {
      const host = bounded.toLowerCase().replace(/^www\./, "");
      if (hostValue.test(host)) safe[key] = host;
      continue;
    }
    if (tokenValue.test(bounded)) safe[key] = bounded;
  }
  return safe;
}

export function trackEvent(name: string, parameters: Record<string, string | number | boolean> = {}): boolean {
  if (!/^[a-z][a-z0-9_]{0,39}$/.test(name)
    || readConsent() !== "granted"
    || isInternalAnalyticsBrowser()
    || !isAnalyticsHostAllowed(window.location.hostname)
    || isEmbeddedAnalyticsSurface(window.location.pathname, window.location.search)
    || isSensitiveAnalyticsNavigation()) return false;

  const shared = privacySafeEventParameters({
    ...parameters,
    site_host: canonicalHost(window.location.hostname),
  });

  return dispatchAnalyticsEvent(name, shared);
}

function dispatchAnalyticsEvent(
  name: string,
  properties: Record<string, string | number | boolean>,
): boolean {
  let delivered = false;
  const ga4Installed = typeof window.gtag === "function"
    && Boolean(document.getElementById("4planet-ga4"));
  if (ga4Installed) {
    // Never allow GA4 to infer a full browser URL containing OAuth material.
    const safePath = privacySafeEventParameters({ page_path: window.location.pathname }).page_path;
    if (typeof safePath === "string" && !isSensitiveAnalyticsNavigation()) {
      window.gtag?.("event", name, {
        ...properties,
        page_location: `${window.location.origin}${safePath}`,
      });
      delivered = true;
    }
  }
  if (capturePostHog(name, properties)) delivered = true;
  return delivered;
}

export function resetAnalyticsConsent() {
  window.localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  window.location.reload();
}

export function isEmbeddedAnalyticsSurface(pathname: string, search: string): boolean {
  if (pathname !== "/atlas" && pathname !== "/embed/atlas") return false;
  return isAtlasEmbedKind(new URLSearchParams(search).get("embed"));
}

export function Analytics() {
  const location = useLocation();
  const id = measurementId();
  const allowedHost = useMemo(() => isAnalyticsHostAllowed(window.location.hostname), []);
  const embeddedSurface = useMemo(
    () => isEmbeddedAnalyticsSurface(location.pathname, location.search),
    [location.pathname, location.search],
  );
  const [internalTraffic] = useState(() => applyInternalAnalyticsControl());
  const [consent, setConsent] = useState<ConsentState>(() => readConsent());

  useEffect(() => {
    if (!allowedHost || !id || internalTraffic || embeddedSurface) return;
    setConsentDefaultDenied();
    if (consent === "denied") updateConsent("denied");
  }, [allowedHost, consent, embeddedSurface, id, internalTraffic]);

  useEffect(() => {
    if (!allowedHost || !id || internalTraffic || embeddedSurface || consent !== "granted" || isSensitiveAnalyticsNavigation()) return;
    installGoogleTag(id, configuredDomains());

    // Deliberately exclude query strings and fragments from analytics. OAuth
    // callbacks and other routes can carry credentials or personal data there.
    const sharedPageProperties = privacySafeEventParameters({
      page_path: location.pathname,
      content_group: productArea(location.pathname, window.location.hostname),
      site_host: canonicalHost(window.location.hostname),
    });
    if (typeof sharedPageProperties.page_path !== "string") return;

    // Supply an explicit, scrubbed URL on every SPA route transition.
    window.gtag?.("event", "page_view", {
      ...sharedPageProperties,
      page_location: `${window.location.origin}${sharedPageProperties.page_path}`,
    });
    capturePostHog("$pageview", sharedPageProperties);
    trackDiscoveryEntryOnce(location.pathname);
  }, [allowedHost, consent, embeddedSurface, id, internalTraffic, location.pathname]);

  if (!allowedHost || !id || internalTraffic || embeddedSurface || consent !== null || isSensitiveAnalyticsNavigation()) return null;

  const decide = (next: Exclude<ConsentState, null>) => {
    window.localStorage.setItem(ANALYTICS_STORAGE_KEY, next);
    updateConsent(next);
    setConsent(next);
  };

  return (
    <aside
      role="region"
      aria-label="Analytics preferences"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 9999,
        maxWidth: 760,
        margin: "0 auto",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
        flexWrap: "wrap",
        background: "#080808",
        color: "#fff",
        border: "1px solid rgba(255,255,255,.2)",
        fontFamily: "DM Sans, sans-serif",
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <div style={{ maxWidth: 500 }}>
        Allow optional usage analytics to help improve 4PLANET. Advertising signals are disabled. {" "}
        <a href="/privacy" style={{ color: "inherit", textUnderlineOffset: 3 }}>Privacy</a>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => decide("denied")}
          style={{ border: "1px solid rgba(255,255,255,.45)", background: "transparent", color: "#fff", padding: "8px 12px", cursor: "pointer" }}
        >
          DECLINE
        </button>
        <button
          type="button"
          onClick={() => decide("granted")}
          style={{ border: "1px solid #fff", background: "#fff", color: "#080808", padding: "8px 12px", cursor: "pointer" }}
        >
          ALLOW
        </button>
      </div>
    </aside>
  );
}
