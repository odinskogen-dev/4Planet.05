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
import maplibregl from "maplibre-gl";
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
    on: (p.get("l") || "bluemarble").split(",").filter((x) => LAYERS.some((l) => l.id === x)),
    light: p.get("t") === "light",
    flat: p.get("p") === "2d",
    lens: ["EARTH", "NOW", "WATCH"].includes(p.get("lens")) ? p.get("lens") : "EARTH",
    focus: p.get("entity") || p.get("f") || "",
    zoom: Number(p.get("z")) || 2.1,
    center: c.length === 2 && !c.some(isNaN) ? c : [10, 25],
  };
};

const SIGNAL_COLOR = { FIRE_ACTIVITY: C.red, NATURAL_EVENT: C.amber, SEISMIC: C.white, SPECIES_OBSERVATION: C.green };

/* V36's three panel groups, in display order. Layers self-declare their group. */
const LAYER_GROUPS = ["EARTH", "LIFE", "SIGNALS"];

/* Keyboard activation for div-based interactive rows (Enter / Space). */
const onKeyActivate = (fn) => (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); }
};

/* V40 P0: street-level vector basemap prototype. OpenFreeMap ships a fully
   MapLibre-compatible, no-cost vector style (OSM-derived, self-hostable) giving
   sharp roads / streets / place names / buildings / parks / water from planetary
   zoom to street level — the CARTO raster base (maxZoom 10) could not. 4PLANET's
   imagery + data overlays are added ON TOP via the existing registry, so basemap
   and science stay separate. On load failure the map falls back to raster. */
const VECTOR_STYLE = "https://tiles.openfreemap.org/styles/liberty";

/* MapLibre + third-party vector styles may render symbol glyphs from a world
   copy through the rear hemisphere. On the globe, 4PLANET therefore removes
   basemap symbol layers entirely; geometry and data layers remain. Mercator
   restores each layer's original visibility. This is deterministic, reversible
   and safer than trying to infer which rear-facing label should be visible. */
const setBackfaceSafeLabels = (m, flat, originalVisibility) => {
  const layers = m.getStyle()?.layers ?? [];
  layers.forEach((layer) => {
    if (layer.type !== "symbol" || String(layer.id).startsWith("4planet-")) return;
    if (!originalVisibility.has(layer.id)) {
      originalVisibility.set(layer.id, layer.layout?.visibility ?? "visible");
    }
    try {
      m.setLayoutProperty(layer.id, "visibility", flat ? originalVisibility.get(layer.id) : "none");
    } catch { /* style may be changing; next style.load reapplies */ }
  });
};

/* Watch items are two classes. These helpers read either without collapsing them. */
const watchItemId = (w) =>
  w.itemClass === "OBSERVATION" ? w.observation.id : w.signal.id;
const watchItemTitle = (w) =>
  w.itemClass === "OBSERVATION"
    ? (w.observation.occurrence.commonName || w.observation.taxon.label)
    : w.signal.title;
const watchItemSub = (w) =>
  w.itemClass === "OBSERVATION"
    ? `OBSERVATION RECORD · ${w.observation.occurrence.scientificName}`
    : `${w.signal.title}`;

function WorldInner() {
  const boxRef = useRef(null);
  const map = useRef(null);
  const timers = useRef({});
  const popup = useRef(null);
  const init = useRef(readUrl());

  // P0 (V38R): live refs so once-registered MapLibre handlers never call a stale
  // closure. Updated every render below.
  const askHereRef = useRef((_lng: number, _lat: number) => {});
  const writeUrlRef = useRef(() => {});
  const openEntityRef = useRef((_id: string) => {});
  const openLegacyRef = useRef((_p: any) => {});
  // V40 P0: has the user taken the camera since the last intentional focus?
  const userMoved = useRef(false);
  // The place/point the current context focused on, for the RECENTER control.
  const focusTarget = useRef<{ bbox?: number[]; lng?: number; lat?: number; zoom?: number } | null>(null);
  // V40: has the vector basemap failed (→ raster fallback)? And which overlays
  // are active right now, so any style reload can rehydrate them.
  const vectorFailed = useRef(false);
  const onRef = useRef<string[]>([]);
  const basemapSymbolVisibility = useRef(new Map());
  const flatRef = useRef(init.current.flat);

  /* ── V36 console state, preserved ─────────────────────────────────────── */
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState(init.current.mode);
  const [on, setOn] = useState(() => Object.fromEntries(init.current.on.map((id) => [id, true])));
  const [light, setLight] = useState(init.current.light);
  const [flat, setFlat] = useState(init.current.flat);
  flatRef.current = flat;
  const [status, setStatus] = useState({});
  const [busy, setBusy] = useState({});
  const [info, setInfo] = useState({});
  const [opacity, setOpacity] = useState({});
  const [collapsed, setCollapsed] = useState(true);
  const [satOffset, setSatOffset] = useState(2);
  const [sect, setSect] = useState({});
  const [utc, setUtc] = useState(new Date().toISOString().slice(11, 19) + "Z");
  const [copied, setCopied] = useState(false);

  /* ── v1 state ─────────────────────────────────────────────────────────── */
  const [lens, setLens] = useState(init.current.lens);
  const [ctx, setCtx] = useState<ContextState | null>(null);
  const [pool, setPool] = useState(EMPTY_POOL);
  const [poolLoading, setPoolLoading] = useState(true);
  const [q, setQ] = useState("");
  const [taxaHits, setTaxaHits] = useState([]);
  const [taxaSearchFailed, setTaxaSearchFailed] = useState(false);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [watchTaxaMatches, setWatchTaxaMatches] = useState([]);
  const [watchTaxaStatus, setWatchTaxaStatus] = useState("NOT_CHECKED");
  const [watchFailedTaxa, setWatchFailedTaxa] = useState([]);
  const [watchLoading, setWatchLoading] = useState(false);
  const [siteMenu, setSiteMenu] = useState(false);
  const [stripOpen, setStripOpen] = useState(false);

  const { follows, toggle: toggleFollow, following } = useFollows();

  useEffect(() => {
    const t = setInterval(() => setUtc(new Date().toISOString().slice(11, 19) + "Z"), 1000);
    return () => clearInterval(t);
  }, []);

  /* ── ONE SIGNAL POOL, loaded once, read by NOW / WATCH / PLACE ─────────── */
  useEffect(() => {
    let alive = true;
    loadSignalPool().then((p) => {
      if (!alive) return;
      setPool(p);
      setPoolLoading(false);
    });
    const t = setInterval(() => loadSignalPool().then((p) => alive && setPool(p)), 5 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  const writeUrl = useCallback((patch = {}) => {
    const m = map.current; if (!m) return;
    const current = new URLSearchParams(window.location.search);
    const p = new URLSearchParams();
    p.set("m", patch.mode ?? mode);
    const src = patch.on ?? on;
    const act = Object.keys(src).filter((k) => src[k]);
    if (act.length) p.set("l", act.join(","));
    if (patch.light ?? light) p.set("t", "light");
    if (patch.flat ?? flat) p.set("p", "2d");
    const ln = patch.lens ?? lens;
    if (ln !== "EARTH") p.set("lens", ln);
    const f = "focus" in patch ? patch.focus : ctx ? idOfCtx(ctx) : "";
    if (f) p.set("entity", f);
    ["journey", "record"].forEach((key) => {
      const value = current.get(key);
      if (value) p.set(key, value);
    });
    const c = m.getCenter();
    p.set("z", m.getZoom().toFixed(2));
    p.set("c", `${c.lng.toFixed(2)},${c.lat.toFixed(2)}`);
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
  }, [mode, on, light, flat, lens, ctx]);

  /* ── V36 layer machinery, preserved verbatim in behaviour ─────────────── */

  const rasterBefore = (id) => {
    const m = map.current;
    const i = RASTER_ORDER.indexOf(id);
    for (let j = i + 1; j < RASTER_ORDER.length; j++) if (m.getLayer(RASTER_ORDER[j])) return RASTER_ORDER[j];
    return m.getLayer("lbls") ? "lbls" : undefined;
  };

  const drawPoints = (id, label, srcName, note, rows, colorFallback, rFallback) => {
    const m = map.current; if (!m) return;
    const fc = {
      type: "FeatureCollection",
      features: rows.map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [p.lon, p.lat] },
        properties: {
          html: p.html, col: p.col || colorFallback, size: p.size || rFallback,
          sppKey: p.sppKey || "", aphia: p.aphia || "", eid: p.eid || "",
        },
      })),
    };
    if (m.getSource(id)) { m.getSource(id).setData(fc); return; }
    m.addSource(id, { type: "geojson", data: fc });
    m.addLayer({
      id, type: "circle", source: id,
      paint: {
        "circle-radius": ["get", "size"], "circle-color": ["get", "col"], "circle-opacity": 0.78,
        "circle-stroke-width": 1, "circle-stroke-color": ["get", "col"], "circle-stroke-opacity": 0.9,
      },
    });

    m.on("click", id, (e) => {
      const f = e.features && e.features[0]; if (!f) return;

      // v1: a point that carries a canonical id opens the shared context layer
      // instead of a dead-end popup. That is the entire difference between a map
      // and an interface.
      const eid = f.properties.eid;
      if (eid) { openEntityRef.current(eid); return; }

      // V39.1 Scope 01 / V40: a legacy point routes into the ONE shared context
      // surface as a display envelope — same world, one surface, no invented
      // semantics — carrying the source-aware detail the old popup showed.
      const col = f.properties.col;
      const html = f.properties.html || "";
      const sciName = (html.match(/<span class="lat">([^<]+)/) || [])[1];
      const commonName = (html.match(/<b class="nm">([^<]+)/) || html.match(/<b>([^<]+)/) || [])[1];
      const observedDate = (html.match(/<div class="when">([^<]+)/) || [])[1];
      const coords = (f.geometry && f.geometry.coordinates) || [e.lngLat.lng, e.lngLat.lat];
      const planetary = /ISS|SEISMIC|QUAKE|EARTHQUAKE/i.test(label);
      openLegacyRef.current({
        title: commonName || sciName || label,
        sub: label,
        scientificName: sciName,
        commonName: commonName && commonName !== sciName ? commonName : undefined,
        observedDate,
        lat: coords[1],
        lng: coords[0],
        sourceLabel: srcName,
        previewHtml: html,
        gbifKey: f.properties.sppKey,
        aphiaId: f.properties.aphia,
        planetaryContext: planetary,
        accent: col,
      });
      return;
    });
    m.on("mouseenter", id, () => { m.getCanvas().style.cursor = "pointer"; });
    m.on("mouseleave", id, () => { m.getCanvas().style.cursor = ""; });
  };

  const addLayer = useCallback(async (l, silent) => {
    const m = map.current; if (!m || !l) return;
    if (l.kind === "shade") {
      if (m.getSource("shade")) return;
      m.addSource("shade", { type: "geojson", data: nightPolygon() });
      m.addLayer({ id: "shade", type: "fill", source: "shade", paint: { "fill-color": "#02030a", "fill-opacity": 0.42 } },
        m.getLayer("lbls") ? "lbls" : undefined);
      if (!timers.current.shade) timers.current.shade = setInterval(() => {
        const s = map.current && map.current.getSource("shade");
        if (s) s.setData(nightPolygon());
      }, 60000);
      setStatus((st) => ({ ...st, shade: "LIVE" }));
      return;
    }
    if (l.kind === "planned") { setStatus((st) => ({ ...st, [l.id]: "PLANNED" })); return; }
    if (l.kind === "raster") {
      if (m.getSource(l.id)) return;
      const s = { type: "raster", tiles: [l.tiles(satOffset)], tileSize: 256, attribution: l.attr };
      if (!l.wms) s.maxzoom = l.maxzoom;
      m.addSource(l.id, s);
      m.addLayer({ id: l.id, type: "raster", source: l.id, paint: { "raster-opacity": opacity[l.id] ?? l.opacity } }, rasterBefore(l.id));
      setStatus((st) => ({ ...st, [l.id]: "ON" }));
      return;
    }
    if (!silent) { setBusy((s) => ({ ...s, [l.id]: true })); setStatus((s) => ({ ...s, [l.id]: DOT + DOT + DOT })); }
    let rows = [];
    try { rows = await l.load(); }
    catch { setStatus((s) => ({ ...s, [l.id]: "OFFLINE" })); setBusy((s) => ({ ...s, [l.id]: false })); return; }
    drawPoints(l.id, l.label, l.src, l.note, rows, l.color, l.r);
    if (!silent) { setStatus((s) => ({ ...s, [l.id]: `${rows.length} ${DOT} ${stamp()}` })); setBusy((s) => ({ ...s, [l.id]: false })); }
    if (l.kind === "live" && l.every && !timers.current[l.id]) {
      timers.current[l.id] = setInterval(async () => {
        try {
          const r = await l.load();
          drawPoints(l.id, l.label, l.src, l.note, r, l.color, l.r);
          setStatus((s) => ({ ...s, [l.id]: `${r.length} ${DOT} ${stamp()}` }));
        } catch { /* keep last good frame */ }
      }, l.every);
    }
  }, [satOffset, opacity]);

  const removeLayer = (l) => {
    const m = map.current; if (!m) return;
    if (timers.current[l.id]) { clearInterval(timers.current[l.id]); delete timers.current[l.id]; }
    if (m.getLayer(l.id)) m.removeLayer(l.id);
    if (m.getSource(l.id)) m.removeSource(l.id);
  };

  /* ── THE WORLD RESPONDS ────────────────────────────────────────────────── */

  /** Paint an arbitrary set of canonical objects onto Earth as a focus layer. */
  const paintFocus = (id, rows, color, radius = 4) => {
    const m = map.current; if (!m) return;
    drawPoints(id, "FOCUS", "4PLANET", null, rows, color, radius);
    if (m.getLayer(id)) m.moveLayer(id);
  };

  const clearFocus = (id) => {
    const m = map.current; if (!m) return;
    if (m.getLayer(id)) m.removeLayer(id);
    if (m.getSource(id)) m.removeSource(id);
  };

  const fitRows = (rows) => {
    const m = map.current; if (!m || !rows.length) return;
    const b = new maplibregl.LngLatBounds();
    rows.forEach((r) => b.extend([r.lon, r.lat]));
    try { m.fitBounds(b, { padding: 90, maxZoom: 6, duration: 1400 }); } catch { /* single point */ }
  };

  /* ── OPEN: the one function every lens routes through ──────────────────── */

  const openTaxon = useCallback(async (hit) => {
    const ref = {
      id: hit.id, type: "TAXON",
      label: hit.commonName || hit.scientificName,
      sub: hit.scientificName,
    };
    setCtx({ kind: "TAXON", ref, photo: null, occ: field("LOADING") });
    setOpen(false);
    setQ("");

    const [occ, photo] = await Promise.all([
      taxonOccurrences(hit.gbifKey, 400),
      taxonPhoto(hit.scientificName),
    ]);

    if (!occ.ok) {
      setCtx((c) => (c && c.kind === "TAXON" && c.ref.id === ref.id
        ? { ...c, photo, occ: field("SOURCE_UNAVAILABLE") } : c));
      return;
    }

    const rows = occ.data.rows.map((o) => ({
      lon: o.lng, lat: o.lat, col: C.green, size: 3.6, sppKey: hit.gbifKey,
      html: `<b class="nm">${esc(ref.label)}</b><br/><span class="lat">${esc(o.scientificName)}</span>${o.eventDate ? `<div class="when">${esc(o.eventDate)}</div>` : ""}`,
    }));

    paintFocus("focus", rows, C.green, 3.6);
    fitRows(rows);

    setCtx((c) => (c && c.kind === "TAXON" && c.ref.id === ref.id
      ? { ...c, photo, occ: occ.data.rows.length
          ? field("LIVE", { rows: occ.data.rows, total: occ.data.total })
          : field("NO_RECORDS") }
      : c));
  }, []);

  const openPlace = useCallback(async (place) => {
    const m = map.current;
    setOpen(false);
    setQ("");
    setCtx({ kind: "PLACE", place, life: field("LOADING"), signals: field("LOADING") });

    if (m) {
      // V40 P0: this is the ONE intentional focus for this place. Record it for
      // RECENTER, and reset the ownership flag — from here the camera is the
      // user's until they open something else.
      const [w, s, e, n] = place.bbox;
      focusTarget.current = { bbox: [w, s, e, n], lng: place.lng, lat: place.lat, zoom: place.zoom };
      userMoved.current = false;
      try { m.fitBounds([[w, s], [e, n]], { padding: 80, duration: 1600, maxZoom: 16 }); }
      catch { m.flyTo({ center: [place.lng, place.lat], zoom: place.zoom, duration: 1600 }); }
    }

    // Signals from the shared pool — no second network call, one source of truth.
    const near = signalsNear(pool, place, placeRadiusKm(place));
    const sigField = poolLoading
      ? field("LOADING")
      : near.length ? field("LIVE", near) : field("NO_RECORDS");

    const life = await occurrencesInWkt(bboxWkt(place), { limit: 300 });

    if (life.ok) {
      const rows = life.data.rows.map((o) => ({
        lon: o.lng, lat: o.lat, col: C.green, size: 3.2,
        html: `<b class="nm">${esc(o.scientificName)}</b><br/><span class="lat">${esc(o.scientificName)}</span>${o.eventDate ? `<div class="when">${esc(o.eventDate)}</div>` : ""}`,
      }));
      // Paint the records, but NEVER move the camera here — the user may already
      // be panning. Focus points only; no fit. (V40 P0.)
      paintFocus("focus", rows, C.green, 3.2);
    }

    setCtx((c) => (c && c.kind === "PLACE" && c.place.id === place.id
      ? {
          ...c,
          signals: sigField,
          life: !life.ok
            ? field("SOURCE_UNAVAILABLE")
            : life.data.total
              ? field("LIVE", { total: life.data.total, names: life.data.names })
              : field("NO_RECORDS"),
        }
      : c));
  }, [pool, poolLoading]);

  // V40 P0: RECENTER / FOCUS SELECTED — the user's escape hatch. The camera is
  // never locked to context; instead this puts it back on demand.
  const recenter = useCallback(() => {
    const m = map.current; const t = focusTarget.current; if (!m || !t) return;
    userMoved.current = false;
    if (t.bbox) {
      const [w, s, e, n] = t.bbox;
      try { m.fitBounds([[w, s], [e, n]], { padding: 80, duration: 900, maxZoom: 16 }); return; }
      catch { /* fall through */ }
    }
    if (t.lng != null && t.lat != null) {
      m.flyTo({ center: [t.lng, t.lat], zoom: t.zoom ?? Math.max(m.getZoom(), 5), duration: 900 });
    }
  }, []);

  const openSystem = useCallback(async (system) => {
    setOpen(false); setQ("");
    setCtx({ kind: "LIVING_SYSTEM", system });

    // A living system is not a point, but it is somewhere. Show where it lives.
    const places = (system.placeIds || []).map(placeById).filter(Boolean);
    if (places.length) {
      const rows = places.map((p) => ({
        lon: p.lng, lat: p.lat, col: TYPE_COLOR.LIVING_SYSTEM, size: 8, eid: p.id,
        html: `<b>${esc(p.name)}</b>`,
      }));
      paintFocus("focus", rows, TYPE_COLOR.LIVING_SYSTEM, 8);
      fitRows(rows);
    } else {
      clearFocus("focus");
    }
  }, []);

  const openSignal = useCallback((signal) => {
    const m = map.current;
    setOpen(false);
    setCtx({ kind: "SIGNAL", signal });
    focusTarget.current = { lng: signal.lng, lat: signal.lat, zoom: Math.max(m?.getZoom() ?? 4.2, 4.2) };
    userMoved.current = false;
    if (m) m.flyTo({ center: [signal.lng, signal.lat], zoom: Math.max(m.getZoom(), 4.2), duration: 1400 });
  }, []);

  // V39.1 Scope 01 / V40: open a legacy map point in the one shared context
  // surface. No camera move — the world stays exactly where it is — but we record
  // the point so RECENTER can bring the user to it on demand.
  const openLegacy = useCallback((payload) => {
    setOpen(false);
    setCtx({ kind: "LEGACY_POINT", ...payload });
    if (payload && payload.lng != null && payload.lat != null) {
      focusTarget.current = { lng: payload.lng, lat: payload.lat, zoom: Math.max(map.current?.getZoom() ?? 6, 6) };
    }
  }, []);

  const openPressure = useCallback((p) => {
    setOpen(false);
    setCtx({ kind: "PRESSURE", pressure: p });
    // Show the places where the systems it affects are represented.
    const places = p.affects
      .filter((id) => typeOf(id) === "LIVING_SYSTEM")
      .flatMap((id) => systemById(id)?.placeIds || [])
      .map(placeById)
      .filter(Boolean);
    if (places.length) {
      const rows = places.map((pl) => ({
        lon: pl.lng, lat: pl.lat, col: C.red, size: 7, eid: pl.id,
        html: `<b>${esc(pl.name)}</b>`,
      }));
      paintFocus("focus", rows, C.red, 7);
      fitRows(rows);
    }
  }, []);

  const askHere = useCallback(async (lng, lat) => {
    setOpen(false);
    setCtx({ kind: "COORDINATE", lat, lng, life: field("LOADING"), signals: field("LOADING") });

    const near = signalsNear(pool, { lat, lng }, 400);
    const sigField = poolLoading
      ? field("LOADING")
      : near.length ? field("LIVE", near) : field("NO_RECORDS");

    const d = 0.35;
    const wkt = `POLYGON((${lng - d} ${lat - d},${lng + d} ${lat - d},${lng + d} ${lat + d},${lng - d} ${lat + d},${lng - d} ${lat - d}))`;
    const life = await occurrencesInWkt(wkt, { limit: 100 });

    setCtx((c) => (c && c.kind === "COORDINATE" && c.lat === lat && c.lng === lng
      ? {
          ...c,
          signals: sigField,
          life: !life.ok
            ? field("SOURCE_UNAVAILABLE")
            : life.data.total
              ? field("LIVE", { total: life.data.total, names: life.data.names })
              : field("NO_RECORDS"),
        }
      : c));
  }, [pool, poolLoading]);

  /** Resolve ANY canonical id and open it. This is what makes the world one world. */
  const openEntity = useCallback(async (id) => {
    const t = typeOf(id);
    if (t === "PLACE") { const p = placeById(id); if (p) openPlace(p); return; }
    if (t === "LIVING_SYSTEM") { const s = systemById(id); if (s) openSystem(s); return; }
    if (t === "PRESSURE") { const p = pressureById(id); if (p) openPressure(p); return; }
    if (t === "SOLUTION") { const s = solutionById(id); if (s) { setOpen(false); setCtx({ kind: "SOLUTION", solution: s }); } return; }
    if (t === "MISSION") { const m = missionById(id); if (m) { setOpen(false); setCtx({ kind: "MISSION", mission: m }); } return; }
    if (t === "SIGNAL") {
      const s = pool.signals.find((x) => x.id === id);
      if (s) openSignal(s);
      return;
    }
    if (t === "OBSERVATION") {
      const w = watchTaxaMatches.find((x) => x.observation?.id === id);
      if (w?.observation) { setOpen(false); setCtx({ kind: "OBSERVATION", observation: w.observation }); }
      return;
    }
    if (t === "TAXON") {
      const authority = authorityOf(id);
      const key = sourceKeyOf(id);
      const n = nodeById(id);
      // A seeded node already knows its names. Skip the round trip.
      if (n) { openTaxon({ id, gbifKey: key, scientificName: n.sub || n.label, commonName: n.label }); return; }
      // P1 (V38R): the id format claims an authority, so honour it. Occurrence
      // resolution in v1 is GBIF-shaped only; a non-GBIF taxon id must not be
      // silently sent through the GBIF resolver as if it were a GBIF key.
      if (authority !== "gbif") {
        setOpen(false);
        setCtx({
          kind: "TAXON",
          ref: { id, type: "TAXON", label: key, sub: authority.toUpperCase() },
          photo: null,
          occ: field(
            "NOT_CHECKED",
            null,
            `This taxon is identified by ${authority.toUpperCase()}. 4PLANET's occurrence resolver is GBIF-only in v1, so it has not queried records for this id rather than pretend a ${authority.toUpperCase()} id is a GBIF key.`,
          ),
        });
        return;
      }
      const vern = await taxonVernacular(key);
      openTaxon({ id, gbifKey: key, scientificName: vern || key, commonName: vern });
      return;
    }
    // COORDINATE has no registry entry to open; it is created by a map click only.
    // UNKNOWN / FUNCTION / HUMAN_SYSTEM graph nodes have no map geometry and no
    // source record, so they are shown inside the relationship chain, never
    // opened as a standalone spatial object. Doing nothing here is the honest
    // behaviour — better than inventing a coordinate.
  }, [openPlace, openSystem, openPressure, openSignal, openTaxon, pool, watchTaxaMatches]);

  /* ── SEARCH THE LIVING PLANET_ ─────────────────────────────────────────── */

  useEffect(() => {
    const text = q.trim();
    if (text.length < 3) { setTaxaHits([]); setSearching(false); setTaxaSearchFailed(false); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const r = await searchTaxa(text);
      // P0 (V38R): a GBIF failure is not "no life matched". Record it distinctly
      // so the results panel can say the source is down rather than imply zero.
      setTaxaSearchFailed(!r.ok);
      setTaxaHits(r.ok ? r.data : []);
      setSearching(false);
    }, 260);
    return () => clearTimeout(t);
  }, [q]);

  const placeHits = useMemo(() => searchPlaces(q), [q]);
  const systemHits = useMemo(() => searchSystems(q), [q]);
  const hasResults = placeHits.length || systemHits.length || taxaHits.length;

  /* ── LENSES ────────────────────────────────────────────────────────────── */

  const watchPoolMatches = useMemo(() => matchPool(pool, follows), [pool, follows]);

  useEffect(() => {
    if (lens !== "WATCH") return;
    let alive = true;
    setWatchLoading(true);
    matchTaxa(follows).then((res) => {
      if (!alive) return;
      setWatchTaxaMatches(res.matches);
      setWatchTaxaStatus(res.status);
      setWatchFailedTaxa(res.failedTaxa);
      setWatchLoading(false);
    });
    return () => { alive = false; };
  }, [lens, follows]);

  const watchMatches = useMemo(
    () => [...watchPoolMatches, ...watchTaxaMatches],
    [watchPoolMatches, watchTaxaMatches],
  );

  /* Paint the active lens onto Earth. The world always shows what the lens means. */
  useEffect(() => {
    const m = map.current; if (!m || !ready) return;

    clearFocus("lens");

    const dim = (v) => {
      ["whales", "species", "events", "quakes", "iss", "focus"].forEach((id) => {
        if (m.getLayer(id)) m.setPaintProperty(id, "circle-opacity", v);
      });
    };

    if (lens === "EARTH") { dim(0.78); return; }

    if (lens === "NOW") {
      dim(0.14);
      const rows = pool.signals.map((s) => ({
        lon: s.lng, lat: s.lat, col: SIGNAL_COLOR[s.cls] || C.amber, size: s.cls === "SEISMIC" ? 3 : 5,
        eid: s.id, html: `<b>${esc(s.title)}</b>`,
      }));
      if (rows.length) paintFocus("lens", rows, C.amber, 5);
      return;
    }

    if (lens === "WATCH") {
      dim(0.1);
      const rows = watchMatches.map((w) => ({
        lon: w.lng, lat: w.lat,
        col: w.itemClass === "OBSERVATION" ? C.green : (SIGNAL_COLOR[w.signal?.cls] || C.amber), size: 6,
        eid: watchItemId(w), html: `<b>${esc(watchItemTitle(w))}</b>`,
      }));
      const placeRows = follows
        .filter((f) => f.type === "PLACE")
        .map(placeById)
        .filter(Boolean)
        .map((p) => ({ lon: p.lng, lat: p.lat, col: C.blue, size: 9, eid: p.id, html: `<b>${esc(p.name)}</b>` }));
      const all = [...placeRows, ...rows];
      if (all.length) paintFocus("lens", all, C.blue, 6);
      return;
    }
  }, [lens, pool, watchMatches, follows, ready]);

  /* ── map lifecycle (V36) ──────────────────────────────────────────────── */

  // Keep the live refs current so the once-registered handlers below always see
  // the latest askHere/writeUrl (and the state they close over).
  askHereRef.current = askHere;
  writeUrlRef.current = writeUrl;
  openEntityRef.current = openEntity;
  openLegacyRef.current = openLegacy;
  onRef.current = Object.keys(on).filter((k) => on[k]);

  useEffect(() => {
    if (map.current) return;
    const m = new maplibregl.Map({
      container: boxRef.current, style: VECTOR_STYLE, center: init.current.center,
      zoom: init.current.zoom, minZoom: 1, maxZoom: 22,
      attributionControl: { compact: true }, canvasContextAttributes: { antialias: true },
      // V40 P0: the persistent world must never freeze when context is open.
      // Every interaction is turned on explicitly so no default can silently drop.
      interactive: true,
      dragPan: true,
      dragRotate: true,
      scrollZoom: true,
      boxZoom: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
      touchPitch: true,
      keyboard: true,
      trackResize: true,
      renderWorldCopies: false,
    });
    map.current = m;
    // V40: expose the live map so behavioural browser tests can read real camera
    // state (center/zoom) and assert the world stays movable with context open.
    (window as any).__4planet_map = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    m.on("style.load", () => {
      const isFlat = flatRef.current;
      m.setProjection({ type: isFlat ? "mercator" : "globe" });
      setBackfaceSafeLabels(m, isFlat, basemapSymbolVisibility.current);
    });
    m.on("load", () => setReady(true));
    m.on("error", (e) => {
      const id = e && e.sourceId;
      if (id && LAYERS.some((l) => l.id === id)) setStatus((st) => ({ ...st, [id]: "UNAVAILABLE" }));
      // V40 P0: if the vector basemap itself fails to load, never leave a blank
      // world — fall back to the raster base and rehydrate overlays. Guarded so
      // it only triggers once, for a base-style (not overlay) failure.
      if (!id && !vectorFailed.current && !m.isStyleLoaded()) {
        vectorFailed.current = true;
        try {
          m.setStyle(makeStyle(light));
          m.once("styledata", () => {
            m.setProjection({ type: flatRef.current ? "mercator" : "globe" });
            setBackfaceSafeLabels(m, flatRef.current, basemapSymbolVisibility.current);
            onRef.current.forEach((lid) => addLayer(LAYERS.find((l) => l.id === lid), true));
          });
        } catch { /* keep whatever rendered */ }
      }
    });
    m.on("moveend", () => writeUrlRef.current());
    // V40 P0: the moment the user takes the camera, no async response may fit or
    // reset it. A Place focuses ONCE on open; after that the world is theirs.
    ["dragstart", "zoomstart", "rotatestart", "pitchstart"].forEach((ev) =>
      m.on(ev, () => { userMoved.current = true; }),
    );
    m.on("click", (e) => {
      const ids = ["whales", "species", "events", "quakes", "iss", "focus", "lens"].filter((id) => m.getLayer(id));
      const hit = ids.length ? m.queryRenderedFeatures(e.point, { layers: ids }) : [];
      if (!hit.length) askHereRef.current(e.lngLat.lng, e.lngLat.lat);
    });
    return () => { Object.values(timers.current).forEach(clearInterval); m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // V40 P0: when the context panel opens/closes or the breakpoint changes, the
  // map may need to recompute its canvas box. A missed resize is a classic cause
  // of a "dead" map. rAF lets the layout settle first.
  useEffect(() => {
    const m = map.current; if (!m) return;
    const id = requestAnimationFrame(() => m.resize());
    return () => cancelAnimationFrame(id);
  }, [ctx, lens]);

  useEffect(() => {
    if (!ready) return;
    init.current.on.forEach((id) => addLayer(LAYERS.find((l) => l.id === id)));
    // Deep link straight into an object: ?f=place:4p:bergen
    if (init.current.focus) openEntity(init.current.focus);
    // Workstream C — deterministic bundled whale record. ?record=orca-bundled
    // (or the canonical record id) paints a visible marker and opens the real
    // OBSERVATION Context panel, with NO live API dependency.
    const rec = new URLSearchParams(window.location.search).get("record");
    if (rec === "orca-bundled" || rec === DEMO_WHALE_OBSERVATION.provenance.sourceRecordId) {
      const o = DEMO_WHALE_OCCURRENCE;
      paintFocus("focus", [{ lon: o.lng, lat: o.lat, col: C.blue, size: 9, eid: DEMO_WHALE_OBSERVATION.id, html: `<b>${o.commonName}</b>` }], C.blue, 8);
      focusTarget.current = { lng: o.lng, lat: o.lat, zoom: Math.max(init.current.zoom, 6) };
      map.current?.flyTo({ center: [o.lng, o.lat], zoom: Math.max(init.current.zoom, 6), duration: 1400 });
      setCtx({ kind: "OBSERVATION", observation: DEMO_WHALE_OBSERVATION });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    const m = map.current; if (!m || !ready) return;
    // V40: on the vector basemap, light/dark reskins the 4PLANET chrome (the
    // .world.light class) and does NOT swap the base style — so overlays, context
    // and camera are never dropped by a theme toggle. Only if we already fell back
    // to the raster base do we re-theme it (and rehydrate overlays as before).
    if (vectorFailed.current) {
      const active = Object.keys(on).filter((k) => on[k]);
      m.setStyle(makeStyle(light));
      m.once("styledata", () => {
        m.setProjection({ type: flat ? "mercator" : "globe" });
        setBackfaceSafeLabels(m, flat, basemapSymbolVisibility.current);
        RASTER_ORDER.forEach((id) => { if (active.includes(id)) addLayer(LAYERS.find((l) => l.id === id), true); });
        active.filter((id) => !RASTER_ORDER.includes(id)).forEach((id) => addLayer(LAYERS.find((l) => l.id === id), true));
      });
    }
    writeUrl({ light });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [light]);

  const toggle = (l) => {
    if (busy[l.id]) return;
    if (on[l.id]) {
      removeLayer(l);
      const next = { ...on, [l.id]: false };
      setOn(next); setStatus((s) => ({ ...s, [l.id]: "" })); writeUrl({ on: next });
    } else {
      const next = { ...on, [l.id]: true };
      setOn(next); writeUrl({ on: next }); addLayer(l);
    }
  };

  const isolate = (l) => {
    const m = map.current; if (!m) return;
    Object.keys(on).filter((k) => on[k] && k !== l.id).forEach((k) => removeLayer(LAYERS.find((x) => x.id === k)));
    const next = { [l.id]: true };
    setOn(next); writeUrl({ on: next });
    if (!m.getLayer(l.id)) addLayer(l);
  };

  const setOpa = (l, v) => {
    setOpacity((s) => ({ ...s, [l.id]: v }));
    const m = map.current;
    if (m && m.getLayer(l.id)) m.setPaintProperty(l.id, "raster-opacity", v);
  };

  const setDate = (off) => {
    setSatOffset(off);
    const m = map.current; const l = LAYERS.find((x) => x.id === "truecolor");
    const s = m && m.getSource("truecolor");
    if (s && s.setTiles) s.setTiles([l.tiles(off)]);
  };

  const toggleProjection = () => {
    const next = !flat;
    flatRef.current = next;
    setFlat(next);
    map.current.setProjection({ type: next ? "mercator" : "globe" });
    setBackfaceSafeLabels(map.current, next, basemapSymbolVisibility.current);
    writeUrl({ flat: next });
  };

  const goHome = () => map.current.flyTo({ center: [10, 25], zoom: 2.1, duration: 1200 });

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { /* ignore */ }
  };

  const nearMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const { latitude: lat, longitude: lng } = p.coords;
        map.current.flyTo({ center: [lng, lat], zoom: 7, duration: 1800 });
        askHere(lng, lat); // used once, then forgotten. Brief §37.
      },
      () => {},
      { timeout: 8000 },
    );
  };

  /* ── mode switching (V36) ─────────────────────────────────────────────── */
  const applyMode = (id) => {
    setMode(id);
    const m = MODES.find((x) => x.id === id);
    if (!m || !m.layers) { writeUrl({ mode: id }); return; }
    Object.keys(on).filter((k) => on[k] && !m.layers.includes(k)).forEach((k) => removeLayer(LAYERS.find((x) => x.id === k)));
    const next = Object.fromEntries(m.layers.map((k) => [k, true]));
    setOn(next);
    writeUrl({ mode: id, on: next });
    RASTER_ORDER.forEach((lid) => { if (m.layers.includes(lid)) addLayer(LAYERS.find((l) => l.id === lid)); });
    m.layers.filter((lid) => !RASTER_ORDER.includes(lid)).forEach((lid) => addLayer(LAYERS.find((l) => l.id === lid)));
  };

  /* ── render ───────────────────────────────────────────────────────────── */

  const sources = pool.status;
  const liveCount = Object.values(sources).filter((s) => s === "LIVE").length;

  return (
    <div className={`world ${light ? "light" : ""}`}>
      <div ref={boxRef} style={{ position: "absolute", inset: 0 }} />

      {/* ── SEARCH THE LIVING PLANET_ ───────────────────────────────────── */}
      <div className="search-wrap">
        <div className="search-line">
          <span className="search-glyph">4P_</span>
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="SEARCH THE LIVING PLANET_"
            aria-label="Search the living planet — life, places and living systems"
            spellCheck={false}
          />
          {searching && <span className="search-glyph">···</span>}
          {q && (
            <button className="ctx-close" onClick={() => { setQ(""); setTaxaHits([]); clearFocus("focus"); }}>
              CLEAR
            </button>
          )}
          {/* The world is the door — but the door must open onto the rest of the house.
              Without this, Earth is a room you cannot leave. */}
          <button
            className="site-btn"
            aria-label="Open 4PLANET site menu"
            aria-expanded={siteMenu}
            onClick={() => setSiteMenu((v) => !v)}
          >
            {siteMenu ? "CLOSE" : "4PLANET_"}
          </button>
        </div>

        {siteMenu && (
          <nav className="site-menu" aria-label="4PLANET sections">
            <div className="rgrp">ENTER 4PLANET_</div>
            {[
              ["/story", "HOME", "The 4PLANET story"],
              ["/domains", "DOMAINS", "OCE4N · E4RTH · S4PIENS · 4CULTURE"],
              ["/missions", "MISSIONS", "Every active mission"],
              ["/impact", "IMPACT", "Pathways and proof"],
              ["/living-systems", "LIVING SYSTEMS", "Relationship intelligence"],
              ["/about", "ABOUT", "What 4PLANET is"],
              ["/atlas", "ATLAS", "The full data console"],
            ].map(([to, label, sub]) => (
              <Link key={to} to={to} className="ritem" onClick={() => setSiteMenu(false)}>
                <span className="rdot" style={{ background: C.blue }} />
                <span className="rmain">
                  <span className="rname">{label}</span>
                  <div className="rsub">{sub}</div>
                </span>
              </Link>
            ))}
          </nav>
        )}

        {open && q.trim().length >= 2 && (
          <div className="results" role="listbox" aria-label="Search results">
            {placeHits.length > 0 && <div className="rgrp">PLACES · SEEDED REGISTRY</div>}
            {placeHits.map((p) => (
              <div key={p.id} className="ritem" role="option" tabIndex={0}
                onClick={() => openPlace(p)} onKeyDown={onKeyActivate(() => openPlace(p))}>
                <span className="rdot" style={{ background: TYPE_COLOR.PLACE }} />
                <span className="rmain">
                  <span className="rname">{p.name}</span>
                  <div className="rsub">{p.kind.replace(/_/g, " ")}</div>
                </span>
              </div>
            ))}

            {systemHits.length > 0 && <div className="rgrp">LIVING SYSTEMS · SEEDED</div>}
            {systemHits.map((s) => (
              <div key={s.id} className="ritem" role="option" tabIndex={0}
                onClick={() => openSystem(s)} onKeyDown={onKeyActivate(() => openSystem(s))}>
                <span className="rdot" style={{ background: TYPE_COLOR.LIVING_SYSTEM }} />
                <span className="rmain">
                  <span className="rname">{s.name}</span>
                  <div className="rsub">{s.sub}</div>
                </span>
              </div>
            ))}

            {taxaHits.length > 0 && <div className="rgrp">LIFE · GBIF · LIVE</div>}
            {taxaHits.map((h) => (
              <div key={h.id} className="ritem" role="option" tabIndex={0}
                onClick={() => openTaxon(h)} onKeyDown={onKeyActivate(() => openTaxon(h))}>
                <span className="rdot" style={{ background: TYPE_COLOR.TAXON }} />
                <span className="rmain">
                  <span className="rname">{h.commonName || h.scientificName}</span>
                  <div className="rsub">{h.scientificName}</div>
                </span>
              </div>
            ))}

            {/* P0 (V38R): source failure is not the same as no match. Say so. */}
            {taxaSearchFailed && !searching && (
              <div className="rgrp" style={{ padding: "10px 12px", lineHeight: 1.7, color: C.red }}>
                GBIF DID NOT ANSWER
                <div style={{ opacity: 0.7, marginTop: 5, textTransform: "none", letterSpacing: 0, fontSize: 10 }}>
                  The life index is unreachable right now. This is a source failure, not an empty
                  result — there may well be matches. Places and living systems are still searchable.
                </div>
              </div>
            )}

            {!hasResults && !searching && !taxaSearchFailed && (
              <div className="rgrp" style={{ padding: "14px 12px", lineHeight: 1.7 }}>
                NOTHING MATCHED.
                <div style={{ opacity: 0.6, marginTop: 6, textTransform: "none", letterSpacing: 0, fontSize: 10 }}>
                  4PLANET searches life (GBIF), a seeded place registry and a seeded
                  living-systems graph. It does not yet search the whole world.
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LENSES ───────────────────────────────────────────────────── */}
        <div className="lens-rail">
          {[
            { id: "EARTH", label: "EARTH", color: "#fff" },
            { id: "NOW", label: "NOW", color: C.amber, count: pool.signals.length },
            { id: "WATCH", label: "WATCH", color: C.blue, count: follows.length },
          ].map((L) => (
            <button
              key={L.id}
              className={`lens ${lens === L.id ? "on" : ""}`}
              style={lens === L.id ? { color: L.color } : undefined}
              onClick={() => { setLens(L.id); writeUrl({ lens: L.id }); }}
            >
              {L.id !== "EARTH" && <span className="pip" />}
              {L.label}
              {typeof L.count === "number" && L.count > 0 && <span className="cnt">{L.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── LAYERS console (V36 machinery, demoted to a quiet instrument) ──
          V39.1 Scope 03/05: the resting state is Earth + Search + the current
          context. The full technical layer console is no longer an equal-weight
          dashboard — it collapses to a single line you open when you want it. */}
      <div className={`atlas-panel ${collapsed ? "rest" : ""}`} style={{ top: 112 }}>
        <button className="sect" onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed}>
          <span>{collapsed ? "LAYERS" : "4PLANET_ EARTH · LAYERS"}</span>
          <span>{collapsed ? "+" : "\u2212"}</span>
        </button>

        {!collapsed && (
          <>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", margin: "6px 0 10px" }}>
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className="chip"
                  style={mode === m.id ? { borderColor: m.color, color: m.color } : undefined}
                  onClick={() => applyMode(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {LAYER_GROUPS.map((groupName) => {
              // V36's real model: a layer belongs to the current mode when its
              // `domain` array includes the mode, and it sits in one of three
              // panel groups (EARTH / LIFE / SIGNALS) via its `group` field.
              const rows = LAYERS.filter(
                (l) => l.group === groupName && (l.domain ? l.domain.includes(mode) : true),
              );
              if (!rows.length) return null;
              return (
                <div key={groupName} style={{ marginBottom: 10 }}>
                  <div className="grp">{groupName}</div>
                  {rows.map((l) => {
                  const active = !!on[l.id];
                  return (
                    <div key={l.id}>
                      <div className="atlas-row" style={active ? { borderColor: l.color } : undefined}>
                        <span className="alyr" onClick={() => toggle(l)}>
                          <span className="dot" style={{ background: active ? l.color : "transparent", border: `1px solid ${l.color}` }} />
                          {l.label}
                        </span>
                        <span className="st" style={{ color: active ? l.color : undefined }}>{status[l.id] || ""}</span>
                        <button className="ibtn" onClick={() => setInfo((s) => ({ ...s, [l.id]: !s[l.id] }))}>i</button>
                      </div>

                      {info[l.id] && (
                        <div className="drawer">
                          <div className="foot">{l.note}</div>
                          {l.legend && (
                            <>
                              <div className="ramp" style={{ background: `linear-gradient(90deg, ${l.legend.stops.join(",")})`, marginTop: 7 }} />
                              <div className="hrow" style={{ fontSize: 8.5, opacity: 0.6 }}>
                                <span>{l.legend.lo}</span><span>{l.legend.hi}</span>
                              </div>
                            </>
                          )}
                          {l.kind === "raster" && active && (
                            <div className="hrow">
                              <span style={{ fontSize: 8.5, opacity: 0.6 }}>OPACITY</span>
                              <input
                                type="range" min={0} max={1} step={0.05}
                                value={opacity[l.id] ?? l.opacity}
                                onChange={(e) => setOpa(l, Number(e.target.value))}
                                style={{ width: 96 }}
                              />
                            </div>
                          )}
                          <button className="mbtn" style={{ marginTop: 7, width: "100%" }} onClick={() => isolate(l)}>
                            ISOLATE
                          </button>
                          <div className="foot" style={{ marginTop: 6 }}>SOURCE · {l.src}</div>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              );
            })}

            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
              <button className="mbtn" onClick={toggleProjection}>{flat ? "GLOBE" : "FLAT"}</button>
              <button className="mbtn" onClick={() => setLight(!light)}>{light ? "DARK" : "LIGHT"}</button>
              <button className="mbtn" onClick={goHome}>HOME</button>
              <button className="mbtn" onClick={nearMe}>NEAR ME</button>
              <button className="mbtn" onClick={share}>{copied ? "COPIED" : "SHARE"}</button>
            </div>

            {on.truecolor && (
              <div className="hrow">
                <span style={{ fontSize: 8.5, opacity: 0.6 }}>IMAGERY {daysAgo(satOffset)}</span>
                <input type="range" min={1} max={14} step={1} value={satOffset}
                  onChange={(e) => setDate(Number(e.target.value))} style={{ width: 96 }} />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── NOW / WATCH panel (the lens speaks) ─────────────────────────── */}
      {lens !== "EARTH" && !ctx && (
        <div className="ctx">
          <div className="ctx-head">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="ctx-kind" style={{ color: lens === "NOW" ? C.amber : C.blue }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: lens === "NOW" ? C.amber : C.blue }} />
                {lens === "NOW" ? "NOW · WHAT IS HAPPENING" : "WATCH · WHAT CHANGED WHERE YOU ARE LOOKING"}
              </div>
              <button className="ctx-close" onClick={() => { setLens("EARTH"); writeUrl({ lens: "EARTH" }); }}>CLOSE</button>
            </div>
            <div className="ctx-title">{lens === "NOW" ? "Now" : "Watch"}</div>
            <div className="ctx-sub">
              {lens === "NOW"
                ? `${pool.signals.length} open records · NASA EONET + USGS`
                : `${follows.length} followed · ${WATCH_WINDOW_DAYS}-day window`}
            </div>
          </div>

          <div className="ctx-body">
            {lens === "NOW" && (() => {
              // Product judgement (V38R): NOW asks "what is happening to the LIVING
              // planet?" Fire and natural events have plausible ecological bearing;
              // raw seismicity mostly does not. Rather than drop real USGS records
              // (which would be its own dishonesty) or let them dominate the feed
              // by volume, NOW leads with a LIVING PLANET band and demotes seismic
              // to a clearly-labelled PLANETARY CONTEXT band.
              const living = pool.signals.filter((s) => s.cls !== "SEISMIC");
              const seismic = pool.signals.filter((s) => s.cls === "SEISMIC");
              const Row = ({ s }) => (
                <div key={s.id} className="li" onClick={() => openSignal(s)}>
                  <span className="lidot" style={{ background: SIGNAL_COLOR[s.cls] || C.amber }} />
                  <span className="limain">
                    <span className="liname">{s.title}</span>
                    <div className="lisub">{CLASS_LABEL[s.cls]}</div>
                    {s.summary && <div className="liwhy">{s.summary}</div>}
                  </span>
                  <span className="liend">{timeAgo(s.provenance.occurredAt)}</span>
                </div>
              );
              return (
                <>
                  <div className="sec">
                    <div className="sec-h">
                      <span>LIVING PLANET</span>
                      <span className={`stat ${poolLoading ? "load" : living.length ? "live" : "none"}`}>
                        {poolLoading ? "···" : living.length ? "LIVE" : "NO RECORDS"}
                      </span>
                    </div>
                    <div className="sec-body">
                      <div className="note-box" style={{ color: C.amber }}>
                        Fire and natural-event records from NASA, ordered by when they happened.
                        Nothing is promoted to an alert — 4PLANET has no methodology for that and
                        will not invent one. Forest disturbance is absent because no per-event
                        forest source is connected yet.
                      </div>
                      {living.slice(0, 50).map((s) => <Row key={s.id} s={s} />)}
                      <div className="src-line">SOURCE · NASA EONET</div>
                    </div>
                  </div>

                  <div className="sec">
                    <div className="sec-h">
                      <span>PLANETARY CONTEXT</span>
                      <span className={`stat ${poolLoading ? "load" : seismic.length ? "live" : "none"}`}>
                        {poolLoading ? "···" : seismic.length ? "LIVE" : "NO RECORDS"}
                      </span>
                    </div>
                    <div className="sec-body">
                      <div className="note-box">
                        Recorded earthquakes, past 24 hours. Shown as planetary context, not as
                        living-planet change: a seismic event is a geophysical fact, and 4PLANET
                        draws no ecological conclusion from it.
                      </div>
                      {seismic.slice(0, 30).map((s) => <Row key={s.id} s={s} />)}
                      <div className="src-line">SOURCE · USGS Earthquake Hazards Program</div>
                    </div>
                  </div>
                </>
              );
            })()}

            {lens === "WATCH" && (
              <>
                {follows.length === 0 ? (
                  <div className="sec">
                    <div className="sec-h"><span>NOTHING FOLLOWED</span><span className="stat none">EMPTY</span></div>
                    <div className="sec-body">
                      <p className="prose">
                        WATCH remembers your attention. Search for a species, a place or a living
                        system, open it, and press FOLLOW. Then WATCH will tell you what the
                        connected sources report about it — and always why you are seeing it.
                      </p>
                      <div className="foot" style={{ marginTop: 12, lineHeight: 1.7 }}>
                        Follows are stored on this device only. Nothing is sent anywhere, and there
                        is no account.
                      </div>
                      <div style={{ marginTop: 14 }}>
                        {/* V39.1: canon-safe suggestions. FD-11 makes Oslofjorden the
                            proof place and B-01 leaves its geometry unresolved, so WATCH
                            suggests living systems (relationship intelligence) rather than
                            a place, avoiding any place-membership implication. */}
                        {[LIVING_SYSTEMS[0], LIVING_SYSTEMS[1]].filter(Boolean).map((x) => (
                          <div key={x.id} className="li" onClick={() => openEntity(x.id)}>
                            <span className="lidot" style={{ background: TYPE_COLOR[typeOf(x.id)] }} />
                            <span className="limain">
                              <span className="liname">{x.name}</span>
                              <div className="lisub">TRY THIS</div>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="sec">
                      <div className="sec-h">
                        <span>FOLLOWING</span>
                        <span className="stat live">{follows.length}</span>
                      </div>
                      <div className="sec-body">
                        {follows.map((f) => (
                          <div key={f.id} className="li" onClick={() => openEntity(f.id)}>
                            <span className="lidot" style={{ background: TYPE_COLOR[f.type] || "#fff" }} />
                            <span className="limain">
                              <span className="liname">{f.label}</span>
                              <div className="lisub">{f.sub || f.type}</div>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sec">
                      <div className="sec-h">
                        <span>MATCHED</span>
                        {(() => {
                          // P0 (V38R): a failed GBIF call must not read as "NO RECORDS".
                          const taxaFailed = watchTaxaStatus === "SOURCE_UNAVAILABLE";
                          const cls = watchLoading ? "load"
                            : taxaFailed ? "bad"
                            : watchMatches.length ? "live" : "none";
                          const txt = watchLoading ? "···"
                            : taxaFailed ? "SOURCE DOWN"
                            : watchMatches.length ? `${watchMatches.length}` : "NO RECORDS";
                          return <span className={`stat ${cls}`}>{txt}</span>;
                        })()}
                      </div>
                      <div className="sec-body">
                        {!watchLoading && watchFailedTaxa.length > 0 && (
                          <div className="note-box" style={{ color: C.red }}>
                            GBIF did not answer for: {watchFailedTaxa.join(", ")}. That is a source
                            failure, not an absence of records. 4PLANET is showing nothing for these
                            rather than pretending the answer is zero.
                          </div>
                        )}
                        {!watchLoading && watchMatches.length === 0 && watchTaxaStatus !== "SOURCE_UNAVAILABLE" && (
                          <>
                            <p className="prose" style={{ fontSize: 13 }}>{EMPTY_WATCH.headline}</p>
                            <div className="note-box">{EMPTY_WATCH.body}</div>
                          </>
                        )}
                        {watchMatches.slice(0, 60).map((w, i) => {
                          const isObs = w.itemClass === "OBSERVATION";
                          const dotColor = isObs ? C.green : (SIGNAL_COLOR[w.signal?.cls] || C.amber);
                          return (
                            <div
                              key={`${watchItemId(w)}-${i}`}
                              className="li"
                              onClick={() =>
                                isObs
                                  ? setCtx({ kind: "OBSERVATION", observation: w.observation })
                                  : openSignal(w.signal)
                              }
                            >
                              <span className="lidot" style={{ background: dotColor }} />
                              <span className="limain">
                                <span className="liname">{watchItemTitle(w)}</span>
                                <div className="lisub">
                                  {isObs ? "OBSERVATION RECORD" : CLASS_LABEL[w.signal.cls]} · {w.kind}
                                </div>
                                <div className="liwhy">{w.why}</div>
                              </span>
                              <span className="liend">{timeAgo(w.occurredAt)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* V40 P0: RECENTER — the camera is never locked to context. This puts it
          back on the selected place/point on demand, and only when it helps. */}
      {ctx && focusTarget.current && ["PLACE", "SIGNAL", "OBSERVATION", "COORDINATE", "LEGACY_POINT"].includes(ctx.kind) && (
        <button className="recenter-btn" onClick={recenter}>
          ⌖ RECENTER
        </button>
      )}

      {/* ── SHARED CONTEXT LAYER ────────────────────────────────────────── */}
      {ctx && (
        <ContextLayer
          ctx={ctx}
          onClose={() => { setCtx(null); clearFocus("focus"); writeUrl({ focus: "" }); }}
          onOpen={openEntity}
          following={following}
          onFollow={toggleFollow}
        />
      )}

      {/* ── STATUS STRIP: coverage is part of truth, but not the headline ──
          V39.1 Scope 05: at rest this is one quiet line. The full per-source
          readout is one tap away — reduced visual weight, evidence never hidden. */}
      <div className={`status-strip ${stripOpen ? "open" : ""}`}>
        <span className="s"><b>4PLANET_</b> v1</span>
        <button
          className="s strip-toggle"
          aria-expanded={stripOpen}
          onClick={() => setStripOpen((v) => !v)}
        >
          SOURCES <b style={{ color: liveCount ? C.green : undefined }}>
            {liveCount ? `${liveCount} LIVE` : poolLoading ? "···" : "—"}
          </b>
          <span style={{ opacity: 0.6, marginLeft: 6 }}>{stripOpen ? "▾" : "▸"}</span>
        </button>

        {stripOpen && (
          <>
            <span className="s">{utc}</span>
            <span className="s">
              EONET <b style={{ color: sources.eonet === "LIVE" ? C.green : C.red }}>{sources.eonet || "···"}</b>
            </span>
            <span className="s">
              USGS <b style={{ color: sources.usgs === "LIVE" ? C.green : C.red }}>{sources.usgs || "···"}</b>
            </span>
            <span className="s">GBIF <b style={{ color: C.green }}>ON DEMAND</b></span>
            <span className="s">FOREST EVENTS <b style={{ opacity: 0.6 }}>NO COVERAGE</b></span>
            <span className="s">SYSTEMS <b style={{ color: C.amber }}>SEEDED</b></span>
          </>
        )}
        <span className="spacer" />
        <span className="s"><Link to="/story">ENTER 4PLANET_ →</Link></span>
      </div>
    </div>
  );
}

/* Wrapped so a runtime throw degrades to an honest message, never a white screen. */
export default function World() {
  return (
    <WorldBoundary>
      <WorldInner />
    </WorldBoundary>
  );
}
