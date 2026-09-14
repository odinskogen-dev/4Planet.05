import { lazy, Suspense, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AtlasSavedViews } from "./AtlasSavedViews";
import { AtlasPlaceNameBridge } from "./AtlasPlaceNameBridge";
import { AtlasBasemapSync } from "./AtlasBasemapSync";
import { AtlasSearchIntentBridge } from "./AtlasSearchIntentBridge";
import { AtlasLiveEvidenceBridge } from "./AtlasLiveEvidenceBridge";
import "./atlas-live-polish.css";

const World = lazy(() => import("./World"));

const fallbackStyle = {
  minHeight: "calc(100vh - 44px)",
  background: "#080808",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  padding: "clamp(32px, 7vw, 96px) clamp(20px, 6vw, 72px)",
} as const;

function retainedContext(search: string) {
  const current = new URLSearchParams(search);
  const retained = new URLSearchParams();
  for (const key of ["entity", "journey", "record"]) {
    const value = current.get(key);
    if (value) retained.set(key, value);
  }
  const query = retained.toString();
  return query ? `?${query}` : "";
}

function webglAvailable() {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const options: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true };
    return Boolean(
      canvas.getContext("webgl2", options) ||
      canvas.getContext("webgl", options) ||
      canvas.getContext("experimental-webgl", options),
    );
  } catch {
    return false;
  }
}

/**
 * Embedded WebKit can initialise MapLibre while the iframe is still settling at
 * a zero/stale layout size. The DOM shell then appears correctly while the WebGL
 * canvas stays black until a later resize. This recovery owns viewport sizing
 * only: it never changes camera, URL state, layers or product state.
 *
 * It deliberately applies to every `?embed=*` surface, so 4planet.org, Magazine
 * and future first-party projections all use the same renderer recovery rather
 * than accumulating host-specific hacks.
 */
function AtlasEmbeddedViewportRecovery({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let disposed = false;
    let pollId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let observedContainer: HTMLElement | null = null;
    const timeouts = new Set<number>();

    const sync = () => {
      if (disposed) return false;
      const atlasMap = (window as any).__4planet_map;
      if (!atlasMap || typeof atlasMap.resize !== "function") return false;

      const container = typeof atlasMap.getContainer === "function" ? atlasMap.getContainer() : null;
      if (!container) return false;
      const rect = container.getBoundingClientRect();
      if (rect.width < 32 || rect.height < 32) return false;

      try {
        atlasMap.resize();
        if (typeof atlasMap.triggerRepaint === "function") atlasMap.triggerRepaint();
      } catch {
        return false;
      }
      return true;
    };

    const afterLayout = () => {
      if (disposed) return;
      requestAnimationFrame(() => requestAnimationFrame(sync));
    };

    const settle = () => {
      afterLayout();
      [50, 150, 350, 750, 1500].forEach((delay) => {
        const id = window.setTimeout(sync, delay);
        timeouts.add(id);
      });
    };

    const attachObservers = () => {
      if (disposed) return false;
      const atlasMap = (window as any).__4planet_map;
      const container = atlasMap && typeof atlasMap.getContainer === "function" ? atlasMap.getContainer() : null;
      if (!container) return false;

      if (container !== observedContainer) {
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
        observedContainer = container;

        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => afterLayout());
          resizeObserver.observe(container);
        }
        if (typeof IntersectionObserver !== "undefined") {
          intersectionObserver = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) settle();
          }, { threshold: [0, 0.01, 0.25] });
          intersectionObserver.observe(container);
        }
      }

      settle();
      return true;
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") settle();
    };

    window.addEventListener("pageshow", settle);
    window.addEventListener("resize", afterLayout);
    window.addEventListener("orientationchange", settle);
    document.addEventListener("visibilitychange", onVisible);

    // World is lazy-loaded, so wait briefly for the one canonical MapLibre map
    // to expose itself. Stop polling as soon as observers are attached.
    let attempts = 0;
    pollId = window.setInterval(() => {
      attempts += 1;
      if (attachObservers() || attempts >= 60) {
        if (pollId !== null) window.clearInterval(pollId);
        pollId = null;
      }
    }, 50);
    attachObservers();

    return () => {
      disposed = true;
      if (pollId !== null) window.clearInterval(pollId);
      timeouts.forEach((id) => window.clearTimeout(id));
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener("pageshow", settle);
      window.removeEventListener("resize", afterLayout);
      window.removeEventListener("orientationchange", settle);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);

  return null;
}

export default function PublicWorld() {
  const location = useLocation();
  const supported = useMemo(webglAvailable, []);
  const embedMode = new URLSearchParams(location.search).get("embed");
  const embedded = Boolean(embedMode);
  const embedHome = embedMode === "home";

  // Camera reconstruction has exactly one authority: AtlasReturnCameraAuthority,
  // mounted at the BrowserRouter level. PublicWorld must never run a second
  // startup/resize camera reconciler against the same MapLibre instance; two
  // owners race on narrow responsive layouts and can overwrite the user-created
  // cross-product return camera. World still initialises directly from URL z/c,
  // while the single global authority protects that exact state through startup
  // settling and releases on genuine user camera input.
  if (supported) {
    return (
      <div className={`atlas-runtime${embedHome ? " atlas-runtime--embed-home" : ""}`} data-atlas-embed={embedMode || undefined}>
        <header className="atlas-product-identity" aria-label="4PLANET ATLAS">
          <Link to="/" className="atlas-product-identity-link" aria-label="4PLANET home">
            <span>4PLANET_</span><strong>ATLAS</strong>
          </Link>
        </header>
        {/* Founder-selected coherent ATLAS surface. Recovery sidecars add capability
            without adding a duplicate visual shell or competing state model. */}
        <AtlasPlaceNameBridge />
        <AtlasBasemapSync />
        <AtlasSearchIntentBridge />
        <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#080808" }} />}>
          <World />
        </Suspense>
        <AtlasEmbeddedViewportRecovery enabled={embedded} />
        <AtlasLiveEvidenceBridge />
        <AtlasSavedViews />
      </div>
    );
  }

  const context = retainedContext(location.search);

  return (
    <main id="main-content" style={fallbackStyle}>
      <section style={{ width: "min(820px, 100%)" }} aria-labelledby="atlas-fallback-title">
        <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: ".13em", color: "#3AE86F" }}>
          ATLAS_ · PUBLIC PREVIEW · CAPABILITY LIMIT
        </p>
        <h1 id="atlas-fallback-title" style={{ margin: "24px 0 0", fontSize: "clamp(40px, 8vw, 92px)", lineHeight: .94, letterSpacing: "-.055em", fontWeight: 500 }}>
          The living planet needs a capable canvas.
        </h1>
        <p role="status" style={{ margin: "28px 0 0", maxWidth: 650, color: "rgba(255,255,255,.78)", fontSize: "clamp(17px, 2vw, 22px)", lineHeight: 1.5 }}>
          This device or browser cannot provide the WebGL graphics support required by the interactive Earth. 4PLANET does not replace the missing map with fabricated activity or an inaccurate simulation.
        </p>
        <p style={{ margin: "16px 0 0", maxWidth: 650, color: "rgba(255,255,255,.62)", fontSize: 15, lineHeight: 1.6 }}>
          The rest of the Public Preview remains available. Explore the Orca profile, the connected Living Systems layer, or return to the main 4PLANET experience. Context from the current journey is retained where supported.
        </p>
        <nav aria-label="Continue without interactive Atlas" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 34 }}>
          <Link to={`/species/orca${context}`} style={{ color: "#080808", background: "#fff", padding: "13px 18px", textDecoration: "none", fontWeight: 600 }}>
            EXPLORE ORCA →
          </Link>
          <Link to={`/living-systems${context}`} style={{ color: "#fff", border: "1px solid rgba(255,255,255,.36)", padding: "13px 18px", textDecoration: "none", fontWeight: 600 }}>
            LIVING SYSTEMS →
          </Link>
          <Link to={`/${context}`} style={{ color: "#fff", border: "1px solid rgba(255,255,255,.36)", padding: "13px 18px", textDecoration: "none", fontWeight: 600 }}>
            4PLANET →
          </Link>
        </nav>
        <p style={{ marginTop: 32, fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,.48)", lineHeight: 1.6 }}>
          STATUS: INTERACTIVE ATLAS UNAVAILABLE ON THIS DEVICE · NO SOURCE, DELIVERY OR IMPACT STATUS HAS BEEN INFERRED.
        </p>
      </section>
    </main>
  );
}
