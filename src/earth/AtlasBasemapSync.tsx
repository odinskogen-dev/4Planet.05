import { useEffect } from "react";
import { LAYERS } from "./layers";

const STYLE = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/liberty",
} as const;

const BLUE_MARBLE_MAX_ZOOM = 6.6;
const CANONICAL_LAYER_IDS = new Set(LAYERS.map((layer) => layer.id));
const TRANSIENT_IDS = new Set(["shade", "focus", "lens"]);

function isAtlasLayer(layer: any) {
  if (!layer?.id) return false;
  if (CANONICAL_LAYER_IDS.has(layer.id) || TRANSIENT_IDS.has(layer.id)) return true;
  if (String(layer.id).endsWith("__hit")) return true;
  const source = typeof layer.source === "string" ? layer.source : "";
  return CANONICAL_LAYER_IDS.has(source) || TRANSIENT_IDS.has(source);
}

function normaliseAtlasLayer(layer: any) {
  const next = structuredClone(layer);
  if (next.id === "bluemarble") {
    next.minzoom = 0;
    next.maxzoom = BLUE_MARBLE_MAX_ZOOM;
  }
  return next;
}

function captureAtlasOverlays(map: any) {
  const style = map.getStyle?.();
  if (!style?.layers || !style?.sources) return { sources: {}, belowLabels: [], aboveLabels: [] };

  const atlasLayers = style.layers.filter(isAtlasLayer).map(normaliseAtlasLayer);
  const sourceIds = new Set<string>(
    atlasLayers
      .map((layer: any) => (typeof layer.source === "string" ? layer.source : ""))
      .filter((sourceId: string): sourceId is string => Boolean(sourceId)),
  );

  const sources: Record<string, any> = {};
  for (const sourceId of sourceIds) {
    if (style.sources[sourceId]) sources[sourceId] = structuredClone(style.sources[sourceId]);
  }

  const belowLabels: any[] = [];
  const aboveLabels: any[] = [];
  for (const layer of atlasLayers) {
    if (layer.type === "raster" || layer.id === "shade") belowLabels.push(layer);
    else aboveLabels.push(layer);
  }

  return { sources, belowLabels, aboveLabels };
}

function mergeStyle(base: any, overlays: ReturnType<typeof captureAtlasOverlays>) {
  const next = structuredClone(base);
  next.sources = { ...(next.sources ?? {}), ...overlays.sources };
  const baseLayers = Array.isArray(next.layers) ? next.layers : [];
  const firstSymbol = baseLayers.findIndex((layer: any) => layer.type === "symbol");
  const insertAt = firstSymbol >= 0 ? firstSymbol : baseLayers.length;
  baseLayers.splice(insertAt, 0, ...overlays.belowLabels);
  baseLayers.push(...overlays.aboveLabels);
  next.layers = baseLayers;
  return next;
}

function firstSymbolLayerId(map: any) {
  const layers = map.getStyle?.()?.layers || [];
  return layers.find((layer: any) => layer.type === "symbol" && !isAtlasLayer(layer))?.id;
}

function restoreAtlasOverlays(map: any, overlays: ReturnType<typeof captureAtlasOverlays>) {
  for (const [sourceId, source] of Object.entries(overlays.sources)) {
    try {
      if (!map.getSource?.(sourceId)) map.addSource?.(sourceId, structuredClone(source));
    } catch { /* style transition; next style event can retry */ }
  }

  const beforeId = firstSymbolLayerId(map);
  for (const layer of overlays.belowLabels) {
    try {
      if (!map.getLayer?.(layer.id)) map.addLayer?.(structuredClone(layer), beforeId);
    } catch { /* preserve last working map; exact-head proof catches failure */ }
  }
  for (const layer of overlays.aboveLabels) {
    try {
      if (!map.getLayer?.(layer.id)) map.addLayer?.(structuredClone(layer));
    } catch { /* preserve last working map; exact-head proof catches failure */ }
  }

  try {
    if (map.getLayer?.("bluemarble")) map.setLayerZoomRange?.("bluemarble", 0, BLUE_MARBLE_MAX_ZOOM);
  } catch { /* layer can still be settling; verifyOrRepair retries */ }
}

function styleMatchesMode(map: any, mode: "dark" | "light") {
  if (!map?.isStyleLoaded?.()) return false;
  const name = String(map.getStyle?.()?.name || "").toLowerCase();
  return name.includes(mode);
}

/**
 * Keeps the existing ATLAS map engine and overlays, while matching the street
 * basemap to ATLAS dark/light mode. OpenFreeMap is already the canonical basemap
 * provider in World; this only chooses its official Dark or Liberty style.
 *
 * Important: World has a one-shot vector fallback for genuine initial provider
 * failures. A deliberate style replacement can briefly look like that failure.
 * Therefore this component treats the requested mode as accepted only after a
 * completed style.load proves the expected style identity. If another handler
 * replaces the first attempt, the same requested mode is retried on the same map
 * rather than silently accepting the wrong basemap.
 *
 * Zero-loss invariant: a theme switch may never discard active ATLAS overlays.
 * We merge them into the new style and independently rehydrate any source/layer
 * MapLibre drops during a full style replacement. Blue Marble is also kept
 * explicitly global/regional so imagery cannot stretch into street-level proof.
 */
export function AtlasBasemapSync() {
  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let observer: MutationObserver | null = null;
    let attachedMap: any = null;
    let activeMode = "";
    let changing = false;
    let retryTimer = 0;
    let retryCount = 0;
    const styleCache = new Map<string, any>();

    const loadStyle = async (mode: "dark" | "light") => {
      if (styleCache.has(mode)) return structuredClone(styleCache.get(mode));
      const response = await fetch(STYLE[mode]);
      if (!response.ok) throw new Error(`OpenFreeMap ${mode} style unavailable`);
      const style = await response.json();
      style.name = mode === "dark" ? "4PLANET ATLAS DARK · OpenFreeMap" : "4PLANET ATLAS LIGHT · OpenFreeMap";
      styleCache.set(mode, style);
      return structuredClone(style);
    };

    const desiredMode = (world: HTMLElement): "dark" | "light" =>
      world.classList.contains("light") ? "light" : "dark";

    const sync = async (map: any, world: HTMLElement) => {
      const mode = desiredMode(world);
      if (mode === activeMode || changing || cancelled) return;
      changing = true;

      try {
        const base = await loadStyle(mode);
        if (cancelled) return;
        const overlays = captureAtlasOverlays(map);
        const merged = mergeStyle(base, overlays);
        map.once?.("style.load", () => restoreAtlasOverlays(map, overlays));
        map.setStyle(merged, { diff: false });
      } catch {
        // Keep the last working map rather than blanking ATLAS when the optional
        // style endpoint is unavailable.
      } finally {
        changing = false;
      }
    };

    const verifyOrRepair = () => {
      if (cancelled || !attachedMap) return;
      const world = document.querySelector<HTMLElement>(".world");
      if (!world) return;
      const mode = desiredMode(world);

      if (styleMatchesMode(attachedMap, mode)) {
        try {
          if (attachedMap.getLayer?.("bluemarble")) attachedMap.setLayerZoomRange?.("bluemarble", 0, BLUE_MARBLE_MAX_ZOOM);
        } catch { /* next style event retries */ }
        activeMode = mode;
        retryCount = 0;
        return;
      }

      // The initial World fallback can legitimately win the first style race.
      // Retry a bounded number of times after the completed style event. The
      // fallback itself is one-shot, so a healthy provider converges without a
      // loop. Never mark a mismatched style as accepted.
      activeMode = "";
      if (retryCount >= 3 || retryTimer) return;
      retryCount += 1;
      retryTimer = window.setTimeout(() => {
        retryTimer = 0;
        void sync(attachedMap, world);
      }, 80);
    };

    const attach = () => {
      if (cancelled) return;
      const map = (window as any).__4planet_map;
      const world = document.querySelector<HTMLElement>(".world");
      if (!map || !world || !map.getStyle?.()) {
        frame = requestAnimationFrame(attach);
        return;
      }

      attachedMap = map;
      map.on?.("style.load", verifyOrRepair);
      observer = new MutationObserver(() => {
        activeMode = "";
        retryCount = 0;
        void sync(map, world);
      });
      observer.observe(world, { attributes: true, attributeFilter: ["class"] });

      if (styleMatchesMode(map, desiredMode(world))) {
        activeMode = desiredMode(world);
        try {
          if (map.getLayer?.("bluemarble")) map.setLayerZoomRange?.("bluemarble", 0, BLUE_MARBLE_MAX_ZOOM);
        } catch { /* bounded startup events retry */ }
      } else {
        void sync(map, world);
      }
    };

    attach();
    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      if (retryTimer) window.clearTimeout(retryTimer);
      observer?.disconnect();
      attachedMap?.off?.("style.load", verifyOrRepair);
    };
  }, []);

  return null;
}
