import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { AtlasSavedViews } from "./AtlasSavedViews";
import { AtlasPlaceNameBridge } from "./AtlasPlaceNameBridge";
import { AtlasBasemapSync } from "./AtlasBasemapSync";
import { AtlasLiveEvidenceBridge } from "./AtlasLiveEvidenceBridge";

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
    // Capability, not a benchmark or GPU policy: if the browser can create a
    // standard WebGL context it should reach MapLibre. Renderer selection belongs
    // to MapLibre/browser; ATLAS separately bounds runtime cost.
    return Boolean(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

export default function PublicWorld() {
  const location = useLocation();
  const supported = useMemo(webglAvailable, []);
  const homepageEmbed = location.pathname.startsWith("/embed/atlas");
  const [homepageLayersOpen, setHomepageLayersOpen] = useState(false);

  // Camera reconstruction has exactly one authority: AtlasReturnCameraAuthority,
  // mounted at the BrowserRouter level. PublicWorld must never run a second
  // startup/resize camera reconciler against the same MapLibre instance; two
  // owners race on narrow responsive layouts and can overwrite the user-created
  // cross-product return camera. World still initialises directly from URL z/c,
  // while the single global authority protects that exact state through startup
  // settling and releases on genuine user camera input.
  if (supported && homepageEmbed) {
    return (
      <>
        <div className={"home-atlas-embed-runtime" + (homepageLayersOpen ? " layers-open" : "")}>
          <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#fff" }} />}>
            <World />
          </Suspense>
          <button
            type="button"
            className="home-atlas-layers-button"
            aria-expanded={homepageLayersOpen}
            onClick={() => {
              const canonicalToggle = document.querySelector(".home-atlas-embed-runtime .atlas-panel .sect") as HTMLButtonElement | null;
              canonicalToggle?.click();
              setHomepageLayersOpen((value) => !value);
            }}
          >
            Layers
          </button>
        </div>
        <style>{`
          .home-atlas-embed-runtime{position:fixed;inset:0;background:#fff;overflow:hidden}
          .home-atlas-embed-runtime .world{background:#fff!important}
          .home-atlas-embed-runtime .search-wrap,
          .home-atlas-embed-runtime .lens-rail,
          .home-atlas-embed-runtime .status-strip,
          .home-atlas-embed-runtime .ctx,
          .home-atlas-embed-runtime .recenter-btn,
          .home-atlas-embed-runtime .maplibregl-ctrl-top-left,
          .home-atlas-embed-runtime .maplibregl-ctrl-top-right,
          .home-atlas-embed-runtime .maplibregl-ctrl-bottom-left,
          .home-atlas-embed-runtime .maplibregl-ctrl-bottom-right{display:none!important}
          .home-atlas-layers-button{position:fixed!important;top:76px;left:18px;z-index:1000!important;pointer-events:auto!important;touch-action:manipulation;min-height:38px;padding:9px 14px;border:0;border-radius:999px;background:#2E2EFF;color:#fff;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;letter-spacing:0;box-shadow:0 8px 24px rgba(46,46,255,.20);cursor:pointer}
          .home-atlas-layers-button:focus-visible{outline:2px solid #080808;outline-offset:3px}
          .home-atlas-embed-runtime .atlas-panel{display:none!important;top:124px!important;left:18px!important;right:auto!important;width:min(300px,calc(100vw - 36px));max-height:calc(100vh - 142px);border:0!important;border-radius:18px!important;background:rgba(255,255,255,.98)!important;box-shadow:0 14px 40px rgba(0,0,0,.10)!important;padding:12px!important}
          .home-atlas-embed-runtime.layers-open .atlas-panel{display:block!important}
          .home-atlas-embed-runtime.layers-open .atlas-panel.rest{display:block!important}
          .home-atlas-embed-runtime .atlas-panel .sect{display:none!important}
          .home-atlas-embed-runtime .maplibregl-canvas-container,
          .home-atlas-embed-runtime .maplibregl-canvas{background:#fff!important}
        `}</style>
      </>
    );
  }

  if (supported) {
    return (
      <>
        <Seo
          title="4PLANET ATLAS — Planetary Intelligence Map"
          description="Explore the living planet through source-grounded planetary layers, Biodiversity observations, places, living systems and recent open records."
          path="/atlas"
          jsonLd={({ canonicalUrl }) => ({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "4PLANET ATLAS",
            applicationCategory: "ReferenceApplication",
            operatingSystem: "Web",
            url: canonicalUrl,
            description: "Planetary intelligence map with source-grounded environmental layers, Biodiversity observations and connected living-system context.",
          })}
        />
        <header className="atlas-product-identity" aria-label="4PLANET ATLAS">
          <Link to="/" className="atlas-product-identity-link" aria-label="4PLANET home">
            <span>4PLANET_</span><strong>ATLAS</strong>
          </Link>
        </header>
        {/* Founder-selected coherent ATLAS surface. Recovery sidecars add capability
            without adding a duplicate visual shell or competing state model. */}
        <AtlasPlaceNameBridge />
        <AtlasBasemapSync />
        <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#080808" }} />}>
          <World />
        </Suspense>
        <AtlasLiveEvidenceBridge />
        <AtlasSavedViews />
      </>
    );
  }

  if (homepageEmbed) {
    return (
      <main id="main-content" style={{ position: "fixed", inset: 0, background: "#fff", overflow: "hidden" }}>
        <img
          src="/assets/brand/earthrise.jpg"
          alt="Earth rising above the lunar horizon"
          style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff" }}
        />
      </main>
    );
  }

  const context = retainedContext(location.search);

  return (
    <>
      <Seo
        title="4PLANET ATLAS — Planetary Intelligence Map"
        description="Explore the living planet through source-grounded planetary layers, Biodiversity observations, places, living systems and recent open records."
        path="/atlas"
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "4PLANET ATLAS",
          applicationCategory: "ReferenceApplication",
          operatingSystem: "Web",
          url: canonicalUrl,
          description: "Planetary intelligence map with source-grounded environmental layers, Biodiversity observations and connected living-system context.",
        })}
      />
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
    </>
  );
}
