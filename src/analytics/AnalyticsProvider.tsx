import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  analyticsLabel,
  ensureAnalyticsLoaded,
  getAnalyticsConsent,
  isGa4Configured,
  trackEvent,
  trackPageView,
  trackSurfaceView,
} from "./analytics";

export function AnalyticsProvider() {
  const location = useLocation();

  useEffect(() => {
    if (!isGa4Configured() || getAnalyticsConsent() !== "granted") return;

    const path = `${location.pathname}${location.search}`;
    void ensureAnalyticsLoaded().then(() => {
      trackPageView(path, document.title);
      trackSurfaceView(location.pathname);
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;

      const tagged = target.closest<HTMLElement>("[data-analytics-event]");
      if (tagged) {
        const eventName = tagged.dataset.analyticsEvent;
        if (eventName) {
          trackEvent(eventName, {
            label: analyticsLabel(tagged),
            surface: tagged.dataset.analyticsSurface,
            entity_id: tagged.dataset.analyticsEntityId,
          });
        }
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) {
          trackEvent("outbound_click", {
            link_domain: url.hostname.slice(0, 120),
            link_text: analyticsLabel(anchor),
          });
        }
      } catch {
        // Ignore malformed or non-standard links.
      }
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
