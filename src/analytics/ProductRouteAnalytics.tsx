import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackEvent } from "@/analytics/Analytics";
import { trackMeaningfulUse, trackProductEntry, type ProductArea } from "@/analytics/ProductAnalytics";

function classifyProduct(pathname: string): ProductArea {
  if (pathname.startsWith("/magazine")) return "magazine";
  if (pathname.startsWith("/atlas")) return "atlas";
  if (pathname.startsWith("/species")) return "species";
  if (pathname.startsWith("/living-systems") || pathname.startsWith("/ecosystem")) return "living_systems";
  if (pathname.startsWith("/impact")) return "impact";
  if (pathname.startsWith("/missions") || pathname.startsWith("/mission/")) return "missions";
  if (pathname.startsWith("/domains") || pathname.startsWith("/domain/")) return "domains";
  return "4planet";
}

function entryKind(): "direct" | "internal" | "shared_link" {
  if (typeof document === "undefined" || !document.referrer) return "direct";
  try {
    return new URL(document.referrer).host === window.location.host ? "internal" : "shared_link";
  } catch {
    return "direct";
  }
}

/**
 * Shared route-level measurement only. No query strings, hashes, user IDs,
 * referrer URLs, free text or exact coordinates are emitted.
 *
 * A route becomes "meaningful use" only after 20 seconds of foreground-visible
 * attention. Background-tab time does not qualify and the signal is emitted once
 * per route per browser session.
 */
export function ProductRouteAnalytics() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const product = classifyProduct(pathname);
    const routeKey = `4p:entry:${pathname}`;
    if (!window.sessionStorage.getItem(routeKey)) {
      trackProductEntry(product, pathname, entryKind());
      window.sessionStorage.setItem(routeKey, "1");
    }

    const sessionKey = `4p:session:${product}`;
    const historyKey = `4p:seen:${product}`;
    if (!window.sessionStorage.getItem(sessionKey)) {
      if (window.localStorage.getItem(historyKey)) {
        trackEvent("return_visit", { product_area: product });
      }
      window.sessionStorage.setItem(sessionKey, "1");
      window.localStorage.setItem(historyKey, "1");
    }

    const engagedKey = `4p:engaged:${pathname}`;
    if (window.sessionStorage.getItem(engagedKey)) return;

    let visibleSince = document.visibilityState === "visible" ? performance.now() : null;
    let accumulatedMs = 0;
    let timer: number | null = null;
    const thresholdMs = 20_000;

    const clearTimer = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    };

    const emitIfQualified = () => {
      if (window.sessionStorage.getItem(engagedKey)) return;
      const currentVisibleMs = visibleSince === null ? 0 : performance.now() - visibleSince;
      if (accumulatedMs + currentVisibleMs < thresholdMs) return;
      trackMeaningfulUse(product, "engaged_time", "route");
      window.sessionStorage.setItem(engagedKey, "1");
      clearTimer();
    };

    const schedule = () => {
      clearTimer();
      if (document.visibilityState !== "visible" || window.sessionStorage.getItem(engagedKey)) return;
      const elapsed = accumulatedMs + (visibleSince === null ? 0 : performance.now() - visibleSince);
      timer = window.setTimeout(emitIfQualified, Math.max(0, thresholdMs - elapsed));
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (visibleSince !== null) accumulatedMs += performance.now() - visibleSince;
        visibleSince = null;
        clearTimer();
        return;
      }
      visibleSince = performance.now();
      schedule();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    schedule();

    return () => {
      if (visibleSince !== null) accumulatedMs += performance.now() - visibleSince;
      emitIfQualified();
      clearTimer();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname]);

  return null;
}
