import { lazy, Suspense, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AtlasSavedViews } from "./AtlasSavedViews";

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

function restoredCamera(search: string) {
  const params = new URLSearchParams(search);
  if (!params.has("z") || !params.has("c")) return null;
  const zoom = Number(params.get("z"));
  const center = (params.get("c") || "").split(",").map(Number);
  if (!Number.isFinite(zoom) || center.length !== 2 || center.some((value) => !Number.isFinite(value))) return null;
  return { zoom, center: center as [number, number] };
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

  // Explicit ATLAS return state owns only the bounded startup reconstruction.
  // MapLibre may resize after style/projection and the narrow mobile sheet settle,
  // so fixed timers alone are not sufficient. Reconcile after actual canvas-size
  // changes during a short startup window, then release permanently. Any real
  // user camera input releases immediately; this never becomes a camera lock.
  useEffect(() => {
    if (!supported) return;
    const target = restoredCamera(location.search);
    if (!target) return;

    let cancelled = false;
    let released = false;
    let probeFrame = 0;
    let firstFrame = 0;
    let resizeFrame = 0;
    let settleTimer = 0;
    const timers: number[] = [];
    let canvasRef: HTMLCanvasElement | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let lastCanvasSize = "";

    const stopStartupAuthority = () => {
      released = true;
      resizeObserver?.disconnect();
      resizeObserver = null;
      if (settleTimer) {
        window.clearTimeout(settleTimer);
        settleTimer = 0;
      }
    };

    const reconcile = (map: any) => {
      if (cancelled || released) return;
      const center = map.getCenter?.();
      const zoom = Number(map.getZoom?.());
      const needsCenter = !center || Math.abs(center.lng - target.center[0]) > 0.00001 || Math.abs(center.lat - target.center[1]) > 0.00001;
      const needsZoom = !Number.isFinite(zoom) || Math.abs(zoom - target.zoom) > 0.01;
      map.resize();
      if (needsCenter || needsZoom) map.jumpTo({ center: target.center, zoom: target.zoom });
    };

    const bindUserRelease = (map: any) => {
      canvasRef = map.getCanvas?.() || null;
      if (!canvasRef) return;
      canvasRef.addEventListener("pointerdown", stopStartupAuthority, { passive: true });
      canvasRef.addEventListener("touchstart", stopStartupAuthority, { passive: true });
      canvasRef.addEventListener("wheel", stopStartupAuthority, { passive: true });
    };

    const observeStartupResizes = (map: any) => {
      if (!canvasRef || typeof ResizeObserver === "undefined") return;
      const scheduleReconcile = () => {
        if (cancelled || released) return;
        if (resizeFrame) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => reconcile(map));
      };
      resizeObserver = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (!rect) return;
        const nextSize = `${Math.round(rect.width)}x${Math.round(rect.height)}`;
        if (nextSize === lastCanvasSize) return;
        lastCanvasSize = nextSize;
        scheduleReconcile();
      });
      resizeObserver.observe(canvasRef);
      // Long enough to cover mobile bottom-sheet/style settling; short enough to
      // be strictly startup-only. User input always releases sooner.
      settleTimer = window.setTimeout(stopStartupAuthority, 2800);
    };

    const apply = (map: any) => {
      if (cancelled || released) return;
      bindUserRelease(map);
      observeStartupResizes(map);

      firstFrame = requestAnimationFrame(() => reconcile(map));
      for (const delay of [120, 360, 760, 1400, 2200]) {
        timers.push(window.setTimeout(() => reconcile(map), delay));
      }

      // First fully-settled render remains a reconciliation point; subsequent
      // canvas-size changes inside the bounded startup window are also covered.
      map.once("idle", () => reconcile(map));
    };

    const attach = () => {
      if (cancelled) return;
      const map = (window as any).__4planet_map;
      if (!map) {
        probeFrame = requestAnimationFrame(attach);
        return;
      }
      if (map.isStyleLoaded()) apply(map);
      else map.once("style.load", () => apply(map));
    };

    attach();
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (probeFrame) cancelAnimationFrame(probeFrame);
      if (firstFrame) cancelAnimationFrame(firstFrame);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      if (settleTimer) window.clearTimeout(settleTimer);
      for (const timer of timers) window.clearTimeout(timer);
      if (canvasRef) {
        canvasRef.removeEventListener("pointerdown", stopStartupAuthority);
        canvasRef.removeEventListener("touchstart", stopStartupAuthority);
        canvasRef.removeEventListener("wheel", stopStartupAuthority);
      }
    };
  }, [supported, location.pathname, location.search]);

  if (supported) {
    return (
      <>
        <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#080808" }} />}>
          <World />
        </Suspense>
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
        <p style={{ margin: "28px 0 0", maxWidth: 650, color: "rgba(255,255,255,.78)", fontSize: "clamp(17px, 2vw, 22px)", lineHeight: 1.5 }}>
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
