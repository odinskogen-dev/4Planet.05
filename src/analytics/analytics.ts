export type AnalyticsConsent = "granted" | "denied" | null;

export type AnalyticsParams = Record<
  string,
  string | number | boolean | null | undefined
>;

const CONSENT_KEY = "4p_analytics_consent";
const GA_SCRIPT_ID = "4p-ga4";
const GA4_MEASUREMENT_ID = (
  import.meta.env.VITE_GA4_MEASUREMENT_ID ?? ""
).trim();

let loadPromise: Promise<void> | null = null;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function isGa4Configured(): boolean {
  return /^G-[A-Z0-9]+$/i.test(GA4_MEASUREMENT_ID);
}

export function getAnalyticsConsent(): AnalyticsConsent {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(value: Exclude<AnalyticsConsent, null>): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Analytics must fail closed if storage is unavailable.
  }
}

function configureDataLayer(): void {
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };
}

function setGoogleConsent(value: "granted" | "denied"): void {
  window.gtag?.("consent", "update", {
    analytics_storage: value,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function disableAnalytics(): void {
  setAnalyticsConsent("denied");
  if (window.gtag) setGoogleConsent("denied");
}

export async function enableAnalytics(): Promise<void> {
  setAnalyticsConsent("granted");
  await ensureAnalyticsLoaded();
}

export async function ensureAnalyticsLoaded(): Promise<void> {
  if (!isGa4Configured()) return;
  if (getAnalyticsConsent() !== "granted") return;
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    configureDataLayer();

    window.gtag?.("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    setGoogleConsent("granted");
    window.gtag?.("js", new Date());
    window.gtag?.("config", GA4_MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    const existing = document.getElementById(GA_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("GA4 failed to load")), {
          once: true,
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      GA4_MEASUREMENT_ID
    )}`;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );
    script.addEventListener("error", () => reject(new Error("GA4 failed to load")), {
      once: true,
    });
    document.head.appendChild(script);
  }).catch((error) => {
    loadPromise = null;
    console.warn("4PLANET analytics unavailable", error);
  });

  return loadPromise;
}

function safeText(value: string | null | undefined, max = 120): string | undefined {
  if (!value) return undefined;
  return value.replace(/\s+/g, " ").trim().slice(0, max) || undefined;
}

export function trackEvent(name: string, params: AnalyticsParams = {}): void {
  if (!isGa4Configured()) return;
  if (getAnalyticsConsent() !== "granted") return;
  if (!window.gtag) return;

  const eventName = name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 40);

  window.gtag("event", eventName, params);
}

export function trackPageView(path: string, title: string): void {
  trackEvent("page_view", {
    page_path: safeText(path, 300),
    page_title: safeText(title, 150),
    page_location: `${window.location.origin}${path}`.slice(0, 500),
  });
}

export function inferSurface(pathname: string): string {
  const path = pathname.toLowerCase();
  if (path.startsWith("/atlas")) return "atlas";
  if (path.includes("species")) return "species";
  if (path.includes("living-system") || path.includes("living_system")) return "living_systems";
  if (path.includes("impact")) return "impact";
  if (path.includes("mission")) return "missions";
  if (path.includes("culture")) return "culture";
  return pathname === "/" ? "home" : "other";
}

export function trackSurfaceView(pathname: string): void {
  trackEvent("surface_view", {
    surface: inferSurface(pathname),
    path: safeText(pathname, 300),
  });
}

export function analyticsLabel(element: Element): string | undefined {
  const explicit = element.getAttribute("data-analytics-label");
  if (explicit) return safeText(explicit);
  return safeText(element.textContent);
}
