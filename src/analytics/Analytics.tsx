import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const ANALYTICS_STORAGE_KEY = "4planet.analytics.consent.v1";

type ConsentState = "granted" | "denied" | null;
type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

function measurementId(): string {
  return import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || "";
}

function configuredDomains(): string[] {
  return (import.meta.env.VITE_ANALYTICS_DOMAINS || "")
    .split(",")
    .map((domain) => domain.trim())
    .filter(Boolean);
}

function readConsent(): ConsentState {
  const value = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

function productArea(pathname: string): string {
  if (pathname.startsWith("/magazine")) return "magazine";
  if (pathname.startsWith("/atlas")) return "atlas";
  if (pathname.startsWith("/species")) return "species";
  if (pathname.startsWith("/living-systems")) return "living_systems";
  if (pathname.startsWith("/impact")) return "impact";
  if (pathname.startsWith("/missions")) return "missions";
  if (pathname.startsWith("/domains")) return "domains";
  if (pathname.startsWith("/me")) return "me4planet";
  return "4planet";
}

function installGoogleTag(id: string, domains: string[]) {
  if (!id || document.getElementById("4planet-ga4")) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  } as Gtag;

  if (domains.length > 1) {
    window.gtag("set", "linker", {
      domains,
      decorate_forms: true,
    });
  }

  window.gtag("js", new Date());
  window.gtag("config", id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.id = "4planet-ga4";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function trackEvent(name: string, parameters: Record<string, string | number | boolean> = {}) {
  if (readConsent() !== "granted" || !window.gtag) return;
  window.gtag("event", name, parameters);
}

export function resetAnalyticsConsent() {
  window.localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  window.location.reload();
}

export function Analytics() {
  const location = useLocation();
  const id = measurementId();
  const [consent, setConsent] = useState<ConsentState>(() => readConsent());

  useEffect(() => {
    if (!id || consent !== "granted") return;
    installGoogleTag(id, configuredDomains());

    window.gtag?.("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
      content_group: productArea(location.pathname),
      site_host: window.location.hostname,
    });
  }, [consent, id, location.pathname, location.search]);

  if (!id || consent !== null) return null;

  const decide = (next: Exclude<ConsentState, null>) => {
    window.localStorage.setItem(ANALYTICS_STORAGE_KEY, next);
    setConsent(next);
  };

  const choiceStyle: React.CSSProperties = {
    minWidth: 112,
    border: "1px solid #fff",
    background: "transparent",
    color: "#fff",
    padding: "9px 13px",
    cursor: "pointer",
    font: "inherit",
    fontWeight: 600,
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
        border: "1px solid rgba(255,255,255,.35)",
        fontFamily: "DM Sans, sans-serif",
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      <div style={{ maxWidth: 500 }}>
        Optional product analytics can help improve 4PLANET. No optional analytics loads before you choose. {" "}
        <a href="/privacy" style={{ color: "inherit", textUnderlineOffset: 3 }}>Privacy</a>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => decide("denied")} style={choiceStyle}>DECLINE</button>
        <button type="button" onClick={() => decide("granted")} style={choiceStyle}>ALLOW</button>
      </div>
    </aside>
  );
}
