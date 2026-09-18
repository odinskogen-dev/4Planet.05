import { lazy, Suspense, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AtlasSavedViews } from "./AtlasSavedViews";
import { AtlasPlaceNameBridge } from "./AtlasPlaceNameBridge";
import { AtlasBasemapSync } from "./AtlasBasemapSync";
import { AtlasSearchIntentBridge } from "./AtlasSearchIntentBridge";
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

export default function PublicWorld() {
  const location = useLocation();
  const supported = useMemo(webglAvailable, []);

  // Camera reconstruction has exactly one authority: AtlasReturnCameraAuthority,
  // mounted at the BrowserRouter level. PublicWorld must never run a second
  // startup/resize camera reconciler against the same MapLibre instance; two
  // owners race on narrow responsive layouts and can overwrite the user-created
  // cross-product return camera. World still initialises directly from URL z/c,
  // while the single global authority protects that exact state through startup
  // settling and releases on genuine user camera input.
  if (supported) {
    return (
      <>
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
        <AtlasLiveEvidenceBridge />
        <AtlasSavedViews />
      </>
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
