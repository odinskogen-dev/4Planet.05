import { useEffect } from "react";

type ZoomStackMap = {
  getZoom: () => number;
  getStyle: () => { layers?: any[] } | undefined;
  getLayer: (id: string) => any;
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

    const apply = () => {
      scheduled = 0;
      if (!map || disposed) return;

      const zoom = map.getZoom();
      const band = atlasZoomBand(zoom);
      const forcedFlat = userForcedFlat();

      if (!forcedFlat) {
        if (!autoLocalProjection && zoom >= ATLAS_ZOOM_POLICY.localProjectionStart) autoLocalProjection = true;
        if (autoLocalProjection && zoom <= ATLAS_ZOOM_POLICY.localProjectionRelease) autoLocalProjection = false;
      }

      const projection: "globe" | "mercator" = forcedFlat || autoLocalProjection ? "mercator" : "globe";
      try {
        if (map.getProjection?.()?.type !== projection) map.setProjection?.({ type: projection });
      } catch { /* retry on next map event */ }

      const styleLayers = map.getStyle()?.layers || [];

      // Blue Marble is global/regional context only. Above this point the sharp
      // vector map underneath owns roads, buildings, settlements and labels.
      try {
        const blueMarble = styleLayers.find((layer) => layer?.id === "bluemarble");
        if (map.getLayer("bluemarble") && (!Number.isFinite(blueMarble?.maxzoom) || blueMarble.maxzoom > ATLAS_ZOOM_POLICY.blueMarbleMaxZoom + 0.001)) {
          map.setLayerZoomRange?.("bluemarble", 0, ATLAS_ZOOM_POLICY.blueMarbleMaxZoom);
        }
      } catch { /* layer may not be mounted yet */ }

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

      const root = document.documentElement;
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

    const attach = () => {
      if (disposed) return;
      map = sharedMap();
      if (!map) {
        attachTimer = window.setTimeout(attach, 100);
        return;
      }
      map.on("zoom", schedule);
      map.on("zoomend", schedule);
      map.on("moveend", schedule);
      map.on("styledata", schedule);
      schedule();
    };

    attach();
    return () => {
      disposed = true;
      if (attachTimer) window.clearTimeout(attachTimer);
      if (scheduled) window.cancelAnimationFrame(scheduled);
      if (map) {
        map.off("zoom", schedule);
        map.off("zoomend", schedule);
        map.off("moveend", schedule);
        map.off("styledata", schedule);
      }
      const root = document.documentElement;
      delete root.dataset.atlasZoomBand;
      delete root.dataset.atlasProjectionMode;
      delete root.dataset.atlasPlaceLabels;
      delete root.dataset.atlasVectorSymbolLayers;
      delete root.dataset.atlasVisibleSymbolLayers;
      delete root.dataset.atlasStreetQuality;
    };
  }, []);

  return null;
}
