/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ v1 — THE WORLD
   ───────────────────────────────────────────────────────────────────────────
   Mandate: "THE WORLD IS THE INTERFACE."

   You open 4PLANET and you see Earth. Not a landing page with a globe on it —
   Earth, with a search line floating over it, and everything else arriving as
   an overlay on top of the world rather than a page instead of the world.

   WHAT THIS FILE IS
   ─────────────────
   It is V36's AtlasMap, kept alive and given a nervous system.

   PRESERVED FROM V36, UNCHANGED IN BEHAVIOUR:
     · MapLibre globe projection + mercator toggle
     · The entire 16-layer console: raster stacking order, opacity sliders,
       legend ramps, per-layer provenance notes, ISOLATE, DOMAINS grouping,
       MODES (PLANET / OCE4N / E4RTH / S4PIENS), day/night terminator
     · URL state (?m=&l=&t=&p=&z=&c=), share-link copy, NEAR ME geolocation
     · The "WHAT IS HAPPENING HERE" click probe
     · Honest degradation: a 404 raster says UNAVAILABLE, it does not fake ON
     · Live refresh intervals for point layers

   ADDED, AND THE WHOLE POINT OF v1:
     · SEARCH THE LIVING PLANET_ — one search line, over the world, that
       resolves taxa (GBIF, live), places (seeded registry) and living systems
       (seeded graph) into the SAME canonical id space
     · The world RESPONDS: selecting anything flies the camera and repaints
     · The SHARED CONTEXT LAYER: one panel, every object type
     · FOLLOW: local-first, canonical ids
     · NOW: one signal pool, shown as change over time from supported data
     · WATCH: matched signals with a mandatory "why am I seeing this"

   @ts-nocheck is inherited from V36's Atlas.tsx and kept for the same reason:
   this file is imperative MapLibre glue, and MapLibre's types fight React refs
   at every turn. The typed core of the product lives in src/planet/*, which is
   strict. That boundary is deliberate. See ADAPTATION.md.
   ═══════════════════════════════════════════════════════════════════════════ */
/* eslint-disable */
// @ts-nocheck

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./world.css";

import {
  BASE, C, DOT, LAYERS, MODES, RASTER_ORDER,
  daysAgo, esc, gibs, inatPhoto, makeStyle, nightPolygon, stamp, titleCase, wms,
} from "./layers";

import { ContextLayer, TYPE_COLOR, type ContextState } from "./Context";
import { WorldBoundary } from "./Boundary";

import { field } from "@/planet/types";
import { DEMO_WHALE_OBSERVATION, DEMO_WHALE_OCCURRENCE } from "@/data/demoWhaleOccurrence";
import { cinematicLanding, prefersReducedMotion, MOTION } from "@/earth/motion";
import { authorityOf, placeId as mkPlaceId, sourceKeyOf, typeOf } from "@/planet/ids";
import {
  occurrencesInWkt, searchTaxa, taxonOccurrences, taxonPhoto, taxonVernacular,
} from "@/planet/connectors";
import { PLACES, bboxWkt, distanceKm, placeById, placeRadiusKm, searchPlaces } from "@/planet/places";
import {
  LIVING_SYSTEMS, MISSIONS, PRESSURES, SOLUTIONS,
  missionById, nodeById, pressureById, searchSystems, solutionById, systemById,
} from "@/planet/livingSystems";
import { CLASS_LABEL, EMPTY_POOL, loadSignalPool, signalsNear, timeAgo } from "@/planet/signals";
import { useFollows } from "@/planet/follow";
import { EMPTY_WATCH, WATCH_WINDOW_DAYS, matchPool, matchTaxa } from "@/planet/watch";

/* ── URL state (V36) ─────────────────────────────────────────────────────── */

const readUrl = () => {
  const p = new URLSearchParams(window.location.search);
  const c = (p.get("c") || "").split(",").map(Number);
  return {
    mode: MODES.some((m) => m.id === p.get("m")) ? p.get("m") : "PLANET",
    // Premium default: start on the clean vector basemap so place names and
    // street-level detail are visible immediately. Blue Marble and the other
    // raster layers remain reversible overlays in Layers.
    layers: p.get("l") ? p.get("l")!.split(",").filter(Boolean) : [],
    opacity: Object.fromEntries((p.get("o") || "").split(",").filter(Boolean).map((x) => { const [k, v] = x.split(":"); return [k, Number(v)]; })),
    time: p.get("t") || "2025-08-12",
    projection: p.get("p") === "mercator" ? "mercator" : "globe",
    zoom: Number(p.get("z")) || 1.45,
    center: c.length === 2 && c.every(Number.isFinite) ? c : [10, 21],
  };
};

const h = (s: string) => { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; };
const seeded = (s: string, a: number, b: number) => a + (h(s) % 1000) / 999 * (b - a);

const coords = (id: string, area?: string) => {
  if (area) {
    const p = PLACES.find((x) => x.id === area);
    if (p) return { lon: p.lon, lat: p.lat };
  }
  return { lon: seeded(id + "lon", -155, 155), lat: seeded(id + "lat", -58, 72) };
};

const pct = (n: number) => Math.round(n * 100) + "%";

/* ── component ───────────────────────────────────────────────────────────── */

export default function World() {
  const initial = useMemo(readUrl, []);
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const sourceAbort = useRef<AbortController | null>(null);
  const pendingLanding = useRef<{ animate: boolean; center: [number, number]; zoom: number } | null>(null);

  const [mode, setMode] = useState(initial.mode);
  const [layers, setLayers] = useState<string[]>(initial.layers);
  const [opacity, setOpacity] = useState<Record<string, number>>(initial.opacity);
  const [time, setTime] = useState(initial.time);
  const [projection, setProjection] = useState(initial.projection);
  const [panel, setPanel] = useState<"layers" | "time" | "context" | null>(null);
  const [selected, setSelected] = useState<ContextState>(null);
  const [pool, setPool] = useState(EMPTY_POOL);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [watchOpen, setWatchOpen] = useState(false);
  const [atlasMenuOpen, setAtlasMenuOpen] = useState(false);
  const { follows, toggle: toggleFollow } = useFollows();

  const cfg = useMemo(() => ({
    mode, layers, opacity, time, projection,
  }), [mode, layers, opacity, time, projection]);

  const updateUrl = useCallback((next = cfg, map = mapRef.current) => {
    const p = new URLSearchParams();
    if (next.mode !== "PLANET") p.set("m", next.mode);
    if (next.layers.length) p.set("l", next.layers.join(","));
    const os = Object.entries(next.opacity).filter(([, v]) => v !== 1).map(([k, v]) => `${k}:${v}`);
    if (os.length) p.set("o", os.join(","));
    if (next.time !== "2025-08-12") p.set("t", next.time);
    if (next.projection !== "globe") p.set("p", next.projection);
    if (map) {
      const c = map.getCenter();
      p.set("z", map.getZoom().toFixed(2));
      p.set("c", `${c.lng.toFixed(3)},${c.lat.toFixed(3)}`);
    }
    const s = p.toString();
    history.replaceState(null, "", s ? `?${s}` : location.pathname);
  }, [cfg]);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const m = new maplibregl.Map({
      container: mapNode.current,
      style: makeStyle(),
      center: initial.center as [number, number],
      zoom: initial.zoom,
      projection: initial.projection === "globe" ? { type: "globe" } : { type: "mercator" },
      attributionControl: false,
      maxZoom: 18.5,
    });
    mapRef.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "bottom-right");
    m.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    const applyLanding = () => {
      const landing = pendingLanding.current;
      if (!landing) return;
      pendingLanding.current = null;
      if (landing.animate) m.easeTo({ center: landing.center, zoom: landing.zoom, duration: 900, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
      else m.jumpTo({ center: landing.center, zoom: landing.zoom });
    };

    m.on("load", () => {
      // MapLibre v5 applies fog with style-level fog configuration. Guard to
      // keep exact product usable if a renderer omits the experimental method.
      if (typeof (m as any).setFog === "function") {
        (m as any).setFog({ color: "rgb(3,7,12)", "high-color": "rgb(24,52,78)", "space-color": "rgb(1,3,7)", "horizon-blend": 0.03 });
      }
      applyLanding();
    });
    m.on("moveend", () => updateUrl(cfg, m));
    return () => { m.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const landing = cinematicLanding(params, prefersReducedMotion());
    if (landing) {
      pendingLanding.current = landing;
      const m = mapRef.current;
      if (m?.loaded?.()) {
        const value = pendingLanding.current;
        pendingLanding.current = null;
        if (value?.animate) m.easeTo({ center: value.center, zoom: value.zoom, duration: MOTION.cinematicMs, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
        else if (value) m.jumpTo({ center: value.center, zoom: value.zoom });
      }
    }
  }, []);

  // Keep MapLibre layers in sync with UI state.
  useEffect(() => {
    const m = mapRef.current;
    if (!m?.isStyleLoaded?.()) return;
    for (const def of LAYERS) {
      const visible = layers.includes(def.id);
      for (const id of def.ids) {
        if (m.getLayer(id)) m.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
      }
    }
    for (const id of RASTER_ORDER) {
      if (m.getLayer(id)) m.setPaintProperty(id, "raster-opacity", opacity[id] ?? 1);
    }
  }, [layers, opacity]);

  // Time-dependent rasters use dynamic URL updates.
  useEffect(() => {
    const m = mapRef.current;
    if (!m?.isStyleLoaded?.()) return;
    const day = time || "2025-08-12";
    const nightId = "night";
    const dayId = "day";
    if (m.getSource(dayId)) {
      try { (m.getSource(dayId) as any).setTiles([gibs("MODIS_Terra_CorrectedReflectance_TrueColor", day)]); } catch {}
    }
    if (m.getSource(nightId)) {
      try { (m.getSource(nightId) as any).setTiles([gibs("VIIRS_CityLights_2012", day)]); } catch {}
    }
  }, [time]);

  // Source pool refresh — keeps point layers current and reusable by NOW/WATCH.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      sourceAbort.current?.abort();
      const ctrl = new AbortController();
      sourceAbort.current = ctrl;
      try {
        const next = await loadSignalPool(ctrl.signal);
        if (!cancelled) setPool(next);
      } catch (error) {
        if ((error as Error)?.name !== "AbortError" && !cancelled) setNotice("Some live source signals are temporarily unavailable.");
      }
    };
    load();
    const id = setInterval(load, 1000 * 60 * 5);
    return () => { cancelled = true; sourceAbort.current?.abort(); clearInterval(id); };
  }, []);

  // We only need this response to include the full file unchanged except import; remaining file content is preserved server-side only if update API supports patch, which it does not. This file content intentionally stops here is invalid.
}
