import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type AtlasMapLike = {
  getZoom: () => number;
  getCenter: () => { lng: number; lat: number };
  jumpTo: (options: { center: [number, number]; zoom: number }) => void;
  on: (event: string, handler: () => void) => void;
  off: (event: string, handler: () => void) => void;
  getCanvas?: () => HTMLCanvasElement;
};

declare global {
  interface Window {
    __4planet_map?: AtlasMapLike;
  }
}

const EPSILON_ZOOM = 0.01;
const EPSILON_CENTER = 0.01;

/**
 * Explicit ATLAS return-camera authority.
 *
 * A cross-product return carrying both `z` and `c` is an explicit user-created
 * camera state. Responsive MapLibre/layout settling may otherwise adjust that
 * camera after construction (the 430px Gate-1 failure). Preserve the explicit
 * camera through load/style/resize/idle settling, then relinquish authority on
 * the first genuine user camera gesture. This is event-driven: no polling and
 * no permanent camera lock.
 */
export function AtlasReturnCameraAuthority() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!pathname.startsWith("/atlas")) return;

    const params = new URLSearchParams(search);
    const zoom = Number(params.get("z"));
    const center = (params.get("c") || "").split(",").map(Number);
    if (!Number.isFinite(zoom) || center.length !== 2 || center.some((n) => !Number.isFinite(n))) return;

    // This guard is specifically for reconstructed cross-product/record context,
    // not generic ATLAS deep links. A plain explicit camera still remains fully
    // user-owned from first render.
    if (!params.get("record")) return;

    const target = { zoom, center: [center[0], center[1]] as [number, number] };
    let disposed = false;
    let released = false;
    let map: AtlasMapLike | undefined;
    let canvas: HTMLCanvasElement | undefined;
    let mountFrame = 0;

    const restore = () => {
      if (disposed || released || !map) return;
      const current = map.getCenter();
      const zoomDelta = Math.abs(map.getZoom() - target.zoom);
      const lngDelta = Math.abs(current.lng - target.center[0]);
      const latDelta = Math.abs(current.lat - target.center[1]);
      if (zoomDelta <= EPSILON_ZOOM && lngDelta <= EPSILON_CENTER && latDelta <= EPSILON_CENTER) return;
      map.jumpTo({ center: target.center, zoom: target.zoom });
    };

    const release = () => {
      if (released) return;
      released = true;
      if (map) ["load", "style.load", "resize", "idle"].forEach((event) => map!.off(event, restore));
      window.removeEventListener("resize", restore);
      canvas?.removeEventListener("pointerdown", release);
      canvas?.removeEventListener("touchstart", release);
      canvas?.removeEventListener("wheel", release);
    };

    const attach = () => {
      if (disposed) return;
      const candidate = window.__4planet_map;
      const candidateCanvas = candidate?.getCanvas?.();

      // Cross-product navigation can leave window.__4planet_map pointing at the
      // previously unmounted ATLAS instance until the new World publishes its
      // map. Never bind return-camera authority to a detached/stale canvas;
      // wait one frame for the current ATLAS map instead.
      if (!candidate || (candidateCanvas && !candidateCanvas.isConnected)) {
        mountFrame = requestAnimationFrame(attach);
        return;
      }

      map = candidate;
      canvas = candidateCanvas;
      ["load", "style.load", "resize", "idle"].forEach((event) => map!.on(event, restore));
      window.addEventListener("resize", restore, { passive: true });
      canvas?.addEventListener("pointerdown", release, { passive: true });
      canvas?.addEventListener("touchstart", release, { passive: true });
      canvas?.addEventListener("wheel", release, { passive: true });

      // Apply after the current World map has been exposed, then let the event
      // hooks own any subsequent responsive/style settling until the user takes
      // control.
      restore();
      requestAnimationFrame(restore);
    };

    attach();
    return () => {
      disposed = true;
      if (mountFrame) cancelAnimationFrame(mountFrame);
      release();
    };
  }, [pathname, search]);

  return null;
}
