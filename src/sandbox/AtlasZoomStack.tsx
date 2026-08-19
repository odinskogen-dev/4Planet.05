import { useEffect } from "react";

type AtlasMap = {
  getZoom: () => number;
  getStyle: () => { layers?: any[] } | undefined;
  getLayer: (id: string) => any;
  setLayoutProperty: (id: string, name: string, value: unknown) => void;
  setLayerZoomRange?: (id: string, minzoom: number, maxzoom: number) => void;
  setProjection?: (projection: { type: "globe" | "mercator" }) => void;
  getProjection?: () => { type?: string };
  on: (event: string, handler: () => void) => void;
  off: (event: string, handler: () => void) => void;
};

declare global {
  interface Window { __4planet_map?: AtlasMap }
}

export type AtlasZoomBand = "GLOBAL" | "REGIONAL" | "LOCAL" | "STREET";

export const ATLAS_ZOOM_POLICY = {
  labelsStart: 4.6,
  localProjectionStart: 6.25,
  localProjectionRelease: 5.35,
  streetStart: 13,
  // Blue Marble is a planetary context image, not a street basemap. Above this
  // zoom the vector base must own spatial detail rather than stretching pixels.
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

function is4PlanetLayer(id: string) {
  return id.startsWith("4planet-") || id.startsWith("sandbox-");
}

/**
 * Sandbox-only adaptive cartography controller.
 *
 * Global zoom remains a globe / imagery experience. Once the user moves into a
 * region, the same MapLibre engine progressively yields to the underlying
 * OpenFreeMap/OpenStreetMap vector map. At local/street zoom we switch to
 * Mercator and restore place/street labels so roads, neighbourhoods and names
 * remain sharp instead of stretching the planetary Blue Marble raster.
 *
 * This does not create a second map. It only changes projection / visibility
 * policy on the existing ATLAS map instance.
 */
export default function AtlasZoomStack() {
  useEffect(() => {
    let disposed = false;
    let map: AtlasMap | undefined;
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
      } catch { /* style/projection may be mid-transition; next event retries */ }

      // Do not let low-resolution planetary imagery pretend to be a street map.
      // MapLibre handles the handoff naturally at the layer zoom boundary.
      try {
        if (map.getLayer("bluemarble")) map.setLayerZoomRange?.("bluemarble", 0, ATLAS_ZOOM_POLICY.blueMarbleMaxZoom);
      } catch { /* layer may not be mounted yet */ }

      let symbolLayers = 0;
      let visibleSymbolLayers = 0;
      const showLabels = zoom >= ATLAS_ZOOM_POLICY.labelsStart || projection === "mercator";
      const styleLayers = map.getStyle()?.layers || [];

      for (const layer of styleLayers) {
        if (layer?.type !== "symbol" || is4PlanetLayer(String(layer.id || ""))) continue;
        symbolLayers += 1;
        try {
          map.setLayoutProperty(layer.id, "visibility", showLabels ? "visible" : "none");
          if (showLabels) visibleSymbolLayers += 1;
        } catch { /* source/style transition; retry later */ }
      }

      const root = document.documentElement;
      root.dataset.atlasZoomBand = band;
      root.dataset.atlasProjectionMode = projection;
      root.dataset.atlasPlaceLabels = showLabels ? "visible" : "hidden";
      root.dataset.atlasVectorSymbolLayers = String(symbolLayers);
      root.dataset.atlasVisibleSymbolLayers = String(visibleSymbolLayers);
      root.dataset.atlasStreetQuality = band === "STREET" ? "vector" : band === "LOCAL" ? "vector" : "hybrid";
    };

    const schedule = () => {
      if (scheduled || disposed) return;
      scheduled = window.requestAnimationFrame(apply);
    };

    const attach = () => {
      if (disposed) return;
      map = window.__4planet_map;
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
