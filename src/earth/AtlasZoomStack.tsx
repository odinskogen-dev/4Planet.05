import { useEffect } from "react";

type ZoomStackMap = {
  getZoom: () => number;
  getStyle: () => { layers?: any[] } | undefined;
  getLayer: (id: string) => any;
  addLayer?: (layer: any, beforeId?: string) => void;
  removeLayer?: (id: string) => void;
  getLayoutProperty?: (id: string, name: string) => unknown;
  setLayoutProperty: (id: string, name: string, value: unknown) => void;
  setLayerZoomRange?: (id: string, minzoom: number, maxzoom: number) => void;
  setProjection?: (projection: { type: "globe" | "mercator" }) => void;
  getProjection?: () => { type?: string };
  on: (event: string, handler: () => void) => void;
  off: (event: string, handler: () => void) => void;
};

export type AtlasZoomBand = "GLOBAL" | "REGIONAL" | "LOCAL" | "STREET";

export const ATLAS_ZOOM_POLICY = {
  labelsStart: 4.6,
  localProjectionStart: 6.25,
  localProjectionRelease: 5.35,
  streetStart: 13,
  blueMarbleMaxZoom: 6.6,
} as const;

export function atlasZoomBand(zoom: number): AtlasZoomBand {
  if (zoom < ATLAS_ZOOM_POLICY.labelsStart) return "GLOBAL";
  if (zoom < 9) return "REGIONAL";
  if (zoom < ATLAS_ZOOM_POLICY.streetStart) return "LOCAL";
  return "STREET";
}

function userForcedFlat() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("p") === "2d";
}

function requestedLayer(id: string) {
  if (typeof window === "undefined") return false;
  const raw = new URLSearchParams(window.location.search).get("l");
  if (!raw) return id === "bluemarble";
  return raw.split(",").includes(id);
}

function sharedMap(): ZoomStackMap | undefined {
  return typeof window === "undefined" ? undefined : (window as any).__4planet_map;
}

function is4PlanetLayer(id: string) {
  return id.startsWith("4planet-") || id.startsWith("sandbox-") || id.startsWith("atlas-");
}

/**
 * Adaptive cartography recovered from the ATLAS Data Lab.
 * One canonical MapLibre engine remains authoritative: planetary imagery owns
 * global context, then the vector basemap progressively takes over local and
 * street detail so Blue Marble is never stretched into a pixelated street map.
 */
export default function AtlasZoomStack() {
  useEffect(() => {
    let disposed = false;
    let map: ZoomStackMap | undefined;
    let attachTimer: number | undefined;
    let scheduled = 0;
    let autoLocalProjection = false;
    const startupTimers: number[] = [];

    const clearReadiness = () => {
      const root = document.documentElement;
      delete root.dataset.atlasZoomBand;
      delete root.dataset.atlasProjectionMode;
      delete root.dataset.atlasPlaceLabels;
      delete root.dataset.atlasVectorSymbolLayers;
      delete root.dataset.atlasVisibleSymbolLayers;
      delete root.dataset.atlasStreetQuality;
      delete root.dataset.atlasBlueMarbleMaxZoom;
    };

    const apply = () => {
      scheduled = 0;
      if (!map || disposed) return;

      const zoom = map.getZoom();
      const band = atlasZoomBand(zoom);
      const forcedFlat = userForcedFlat();
      const root = document.documentElement;

      if (!forcedFlat) {
        if (!autoLocalProjection && zoom >= ATLAS_ZOOM_POLICY.localProjectionStart) autoLocalProjection = true;
        if (autoLocalProjection && zoom <= ATLAS_ZOOM_POLICY.localProjectionRelease) autoLocalProjection = false;
      }

      const projection: "globe" | "mercator" = forcedFlat || autoLocalProjection ? "mercator" : "globe";
      try {
        if (map.getProjection?.()?.type !== projection) map.setProjection?.({ type: projection });
      } catch { /* retry on next map event */ }

      // A style replacement can fire after the zoom policy first applies. Do not
      // publish the adaptive state as ready until the canonical map actually
      // reports the requested projection; this prevents a late World style.load
      // callback from silently restoring globe at local/street zoom.
      if (map.getProjection?.()?.type !== projection) {
        clearReadiness();
        return;
      }

      const styleLayers = map.getStyle()?.layers || [];

      // Blue Marble is global/regional context only. Dynamic overlays may mount
      // after the base style has already emitted its first styledata event, so do
      // not infer success from the serialised style object. Reassert the zoom
      // range whenever the layer exists. Some MapLibre builds apply
      // setLayerZoomRange at runtime without serialising maxzoom back through
      // getStyle(); the exact-head proof deliberately inspects that serialised
      // contract too. If it is absent, replace only this layer definition in
      // place, keeping the existing source, paint and stacking position.
      let blueMarbleReady = !requestedLayer("bluemarble");
      try {
        if (map.getLayer("bluemarble")) {
          map.setLayerZoomRange?.("bluemarble", 0, ATLAS_ZOOM_POLICY.blueMarbleMaxZoom);
          const currentLayers = map.getStyle()?.layers || [];
          const index = currentLayers.findIndex((layer: any) => layer?.id === "bluemarble");
          const serialised = index >= 0 ? currentLayers[index] : undefined;
          if (serialised && (typeof serialised.maxzoom !== "number" || serialised.maxzoom > ATLAS_ZOOM_POLICY.blueMarbleMaxZoom)) {
            const beforeId = currentLayers.slice(index + 1).find((layer: any) => layer?.id)?.id;
            const repaired = structuredClone(serialised);
            repaired.minzoom = 0;
            repaired.maxzoom = ATLAS_ZOOM_POLICY.blueMarbleMaxZoom;
            map.removeLayer?.("bluemarble");
            map.addLayer?.(repaired, beforeId);
          }
          const settled = map.getStyle()?.layers?.find((layer: any) => layer?.id === "bluemarble");
          blueMarbleReady = typeof settled?.maxzoom === "number" && settled.maxzoom <= ATLAS_ZOOM_POLICY.blueMarbleMaxZoom;
          if (blueMarbleReady) root.dataset.atlasBlueMarbleMaxZoom = String(ATLAS_ZOOM_POLICY.blueMarbleMaxZoom);
        }
      } catch { /* layer may be mounting; bounded startup retries cover it */ }

      // If Blue Marble is the requested active overlay, STREET/LOCAL readiness is
      // not truthful until its serialised zoom boundary exists. Existing map
      // events and bounded startup reconciliation will retry; no polling loop or
      // alternate map authority is introduced.
      if (!blueMarbleReady) {
        clearReadiness();
        return;
      }

      const showLabels = zoom >= ATLAS_ZOOM_POLICY.labelsStart || projection === "mercator";
      const targetVisibility = showLabels ? "visible" : "none";
      let symbolLayers = 0;
      let visibleSymbolLayers = 0;

      for (const layer of styleLayers) {
        if (layer?.type !== "symbol" || is4PlanetLayer(String(layer.id || ""))) continue;
        symbolLayers += 1;
        try {
          const current = map.getLayoutProperty?.(layer.id, "visibility") ?? layer.layout?.visibility ?? "visible";
          if (current !== targetVisibility) map.setLayoutProperty(layer.id, "visibility", targetVisibility);
          if (showLabels) visibleSymbolLayers += 1;
        } catch { /* style transition; next event retries */ }
      }

      root.dataset.atlasZoomBand = band;
      root.dataset.atlasProjectionMode = projection;
      root.dataset.atlasPlaceLabels = showLabels ? "visible" : "hidden";
      root.dataset.atlasVectorSymbolLayers = String(symbolLayers);
      root.dataset.atlasVisibleSymbolLayers = String(visibleSymbolLayers);
      root.dataset.atlasStreetQuality = band === "STREET" || band === "LOCAL" ? "vector" : "hybrid";
    };

    const schedule = () => {
      if (scheduled || disposed) return;
      scheduled = window.requestAnimationFrame(apply);
    };

    const reconcileStyle = () => {
      // Invalidate the prior readiness receipt synchronously. The next frame then
      // reasserts adaptive projection, Blue Marble bounds and labels after every
      // completed/replaced style, so consumers cannot observe a stale STREET
      // receipt while World or the basemap sync is still mutating the map.
      clearReadiness();
      schedule();
    };

    const attach = () => {
      if (disposed) return;
      map = sharedMap();
      if (!map) {
        attachTimer = window.setTimeout(attach, 100);
        return;
      }
      for (const event of ["zoom", "zoomend", "moveend", "sourcedata", "idle"]) map.on(event, schedule);
      for (const event of ["styledata", "style.load"]) map.on(event, reconcileStyle);
      schedule();

      // Bounded startup reconciliation. This is only to catch overlays added by
      // World after the initial vector style is ready; it never becomes a live
      // polling loop and releases completely after the startup window.
      for (const delay of [160, 420, 900, 1600, 2600]) {
        startupTimers.push(window.setTimeout(schedule, delay));
      }
    };

    attach();
    return () => {
      disposed = true;
      if (attachTimer) window.clearTimeout(attachTimer);
      if (scheduled) window.cancelAnimationFrame(scheduled);
      for (const timer of startupTimers) window.clearTimeout(timer);
      if (map) {
        for (const event of ["zoom", "zoomend", "moveend", "sourcedata", "idle"]) map.off(event, schedule);
        for (const event of ["styledata", "style.load"]) map.off(event, reconcileStyle);
      }
      clearReadiness();
    };
  }, []);

  return null;
}
