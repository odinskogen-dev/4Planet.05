import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

export const ANALYTICS_STORAGE_KEY = "4planet.analytics.consent.v1";
const GA_MEASUREMENT_ID = "G-Q79Y9HJRL8";
const LIVE_DOMAINS = ["4planet.org", "4planetmagazine.com", "s4piens.com", "cre4tors.com", "4planetmarket.com"] as const;

type ConsentState = "granted" | "denied" | null;
type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

function canonicalHost(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

export function isAnalyticsHostAllowed(hostname: string): boolean {
  const host = canonicalHost(hostname);
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".pages.dev")) return false;
  return LIVE_DOMAINS.includes(host as (typeof LIVE_DOMAINS)[number]);
}

function readConsent(): ConsentState {
  const value = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

function productArea(pathname: string): string {
  const host = canonicalHost(window.location.hostname);
  if (host === "4planetmagazine.com") return "magazine";
  if (host === "cre4tors.com") return "cre4tors";
  if (host === "4planetmarket.com") return "market";
  if (host === "s4piens.com") return "s4piens";
  if (pathname.startsWith("/magazine")) return "magazine";
  if (pathname.startsWith("/atlas")) return "atlas";
  if (pathname.startsWith("/species")) return "species";
  if (pathname.startsWith("/living-systems")) return "living_systems";
  if (pathname.startsWith("/impact")) return "impact";
  if (pathname.startsWith("/missions")) return "missions";
  return "4planet";
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  if (window.gtag) return;
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  } as Gtag;
}

function updateConsent(next: "granted" | "denied") {
  ensureGtag();
  window.gtag?.("consent", "update", {
    analytics_storage: next,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

function installGoogleTag() {
  if (document.getElementById("4planet-ga4")) return;
  ensureGtag();
  window.gtag?.("set", "linker", { domains: [...LIVE_DOMAINS], decorate_forms: true });
  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement("script");
  script.id = "4planet-ga4";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function trackEvent(name: string, parameters: Record<string, string | number | boolean> = {}) {
  if (readConsent() !== "granted" || !isAnalyticsHostAllowed(window.location.hostname) || !window.gtag) return;
  window.gtag("event", name, { ...parameters, site_host: canonicalHost(window.location.hostname) });
}

export function resetAnalyticsConsent() {
  window.localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  window.location.reload();
}

export function Analytics() {
  const location = useLocation();
  const allowedHost = useMemo(() => isAnalyticsHostAllowed(window.location.hostname), []);
  const [consent, setConsent] = useState<ConsentState>(() => readConsent());

  useEffect(() => {
    if (!allowedHost) return;
    ensureGtag();
    window.gtag?.("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });
    if (consent === "denied") updateConsent("denied");
  }, [allowedHost, consent]);

  useEffect(() => {
    if (!allowedHost || consent !== "granted") return;
    updateConsent("granted");
    installGoogleTag();
    window.gtag?.("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
      content_group: productArea(location.pathname),
      site_host: canonicalHost(window.location.hostname),
    });
  }, [allowedHost, consent, location.pathname, location.search]);

  if (!allowedHost || consent !== null) return null;

  const decide = (next: "granted" | "denied") => {
    window.localStorage.setItem(ANALYTICS_STORAGE_KEY, next);
    updateConsent(next);
    setConsent(next);
  };

  return (
    <aside role="region" aria-label="Analytics preferences" style={{ position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 9999, maxWidth: 760, margin: "0 auto", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", background: "#080808", color: "#fff", border: "1px solid rgba(255,255,255,.2)", fontFamily: "DM Sans, sans-serif", fontSize: 13, lineHeight: 1.45 }}>
      <div style={{ maxWidth: 500 }}>Allow optional usage analytics to help improve 4PLANET. Advertising signals are disabled.</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => decide("denied")} style={{ border: "1px solid rgba(255,255,255,.45)", background: "transparent", color: "#fff", padding: "8px 12px", cursor: "pointer" }}>DECLINE</button>
        <button type="button" onClick={() => decide("granted")} style={{ border: "1px solid #fff", background: "#fff", color: "#080808", padding: "8px 12px", cursor: "pointer" }}>ALLOW</button>
      </div>
    </aside>
  );
}
