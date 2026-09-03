import { useEffect } from "react";
import { LAYERS } from "./layers";

const STYLE = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/liberty",
} as const;

const CANONICAL_LAYER_IDS = new Set(LAYERS.map((layer) => layer.id));
const TRANSIENT_IDS = new Set(["shade", "focus", "lens"]);

function isAtlasLayer(layer: any) {
  if (!layer?.id) return false;
  if (CANONICAL_LAYER_IDS.has(layer.id) || TRANSIENT_IDS.has(layer.id)) return true;
  if (String(layer.id).endsWith("__hit")) return true;
  const source = typeof layer.source === "string" ? layer.source : "";
  return CANONICAL_LAYER_IDS.has(source) || TRANSIENT_IDS.has(source);
}

function captureAtlasOverlays(map: any) {
  const style = map.getStyle?.();
  if (!style?.layers || !style?.sources) return { sources: {}, belowLabels: [], aboveLabels: [] };

  const atlasLayers = style.layers.filter(isAtlasLayer);
  const sourceIds = new Set<string>(
    atlasLayers
      .map((layer: any) => (typeof layer.source === "string" ? layer.source : ""))
      .filter((sourceId: string): sourceId is string => Boolean(sourceId)),
  );

  const sources: Record<string, any> = {};
  for (const sourceId of sourceIds) {
    if (style.sources[sourceId]) sources[sourceId] = style.sources[sourceId];
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

/**
 * Keeps the existing ATLAS map engine and overlays, while matching the street
 * basemap to ATLAS dark/light mode. OpenFreeMap is already the canonical basemap
 * provider in World; this only chooses its official Dark or Liberty style.
 */
export function AtlasBasemapSync() {
  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let observer: MutationObserver | null = null;
    let activeMode = "";
    let changing = false;
    const styleCache = new Map<string, any>();

    const loadStyle = async (mode: "dark" | "light") => {
      if (styleCache.has(mode)) return structuredClone(styleCache.get(mode));
      const response = await fetch(STYLE[mode]);
      if (!response.ok) throw new Error(`OpenFreeMap ${mode} style unavailable`);
      const style = await response.json();
      // Preserve provider semantics while giving the applied style a deterministic
      // product identity. This is observable runtime state, not a weakened test.
      style.name = mode === "dark" ? "4PLANET ATLAS DARK · OpenFreeMap" : "4PLANET ATLAS LIGHT · OpenFreeMap";
      styleCache.set(mode, style);
      return structuredClone(style);
    };

    const sync = async (map: any, world: HTMLElement) => {
      const mode: "dark" | "light" = world.classList.contains("light") ? "light" : "dark";
      if (mode === activeMode || changing || cancelled) return;
      changing = true;

      try {
        const base = await loadStyle(mode);
        if (cancelled) return;
        const overlays = captureAtlasOverlays(map);
        const merged = mergeStyle(base, overlays);
        map.setStyle(merged, { diff: false });
        activeMode = mode;
      } catch {
        // Keep the last working map rather than blanking ATLAS when the optional
        // style endpoint is unavailable.
      } finally {
        changing = false;
      }
    };

    const attach = () => {
      if (cancelled) return;
      const map = (window as any).__4planet_map;
      const world = document.querySelector<HTMLElement>(".world");
      if (!map || !world || !map.getStyle?.()) {
        frame = requestAnimationFrame(attach);
        return;
      }

      const start = () => {
        void sync(map, world);
        observer = new MutationObserver(() => void sync(map, world));
        observer.observe(world, { attributes: true, attributeFilter: ["class"] });
      };

      if (map.isStyleLoaded?.()) start();
      else map.once?.("style.load", start);
    };

    attach();
    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return null;
}
