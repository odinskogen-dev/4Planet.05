// @ts-nocheck
/* ───────────────────────────────────────────────────────────────────────────
   4PLANET_ ATLAS — planetary intelligence
   v32: usable, not just beautiful.
   - legends for raster layers (a colour ramp with no scale is decoration)
   - per-layer (i) note in the panel, not hidden in a popup
   - SPECIES SEARCH: type a species, see where it has been observed (GBIF)
   - fixed layer stacking, per-layer opacity, 2D/3D, home, share, UTC clock
   Sources are authoritative third parties, surfaced & credited — not ours.
   ─────────────────────────────────────────────────────────────────────────── */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MONO = "'Fragment Mono', ui-monospace, monospace";
const C = {
  ink: "#080808", blue: "#2E2EFF", green: "#3AE86F",
  red: "#FF4D22", pink: "#FF5ACD", amber: "#FF7D50", white: "#FFFFFF",
};
const DOT = "\u00B7";
const DEG = "\u00B0";
const ARROW = "\u2192";

const titleCase = (s) => String(s ?? "").replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const stamp = () => new Date().toISOString().slice(11, 16) + "Z";
const daysAgo = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().split("T")[0]; };
const wms = (layer, time) =>
  "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?service=WMS&request=GetMap&version=1.1.1" +
  `&layers=${layer}&styles=&format=image%2Fpng&transparent=true&srs=EPSG%3A3857` +
  (time ? `&time=${time}` : "") + "&width=256&height=256&bbox={bbox-epsg-3857}";
const gibs = (layer, time, level, ext = "jpg") =>
  `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${time}/GoogleMapsCompatible_Level${level}/{z}/{y}/{x}.${ext}`;


/* ── day/night terminator — computed from the sun's position, no data source ── */
const RAD = Math.PI / 180;
const nightPolygon = (date = new Date()) => {
  const julian = date / 86400000 + 2440587.5;
  const n = julian - 2451545.0;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = (357.528 + 0.9856003 * n) % 360;
  const lambda = L + 1.915 * Math.sin(g * RAD) + 0.02 * Math.sin(2 * g * RAD);
  const eps = 23.439 - 0.0000004 * n;
  let alpha = Math.atan(Math.cos(eps * RAD) * Math.tan(lambda * RAD)) / RAD;
  const delta = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD)) / RAD;
  alpha += Math.floor(lambda / 90) * 90 - Math.floor(alpha / 90) * 90;
  const gst = (18.697374558 + 24.06570982441908 * n) % 24;
  const coords = [];
  for (let lng = -180; lng <= 180; lng += 1) {
    const ha = (gst + lng / 15) * 15 - alpha;
    const lat = Math.atan(-Math.cos(ha * RAD) / Math.tan(delta * RAD)) / RAD;
    coords.push([lng, lat]);
  }
  if (delta < 0) { coords.unshift([-180, 90]); coords.push([180, 90]); }
  else { coords.unshift([-180, -90]); coords.push([180, -90]); }
  coords.push(coords[0]);
  return { type: "FeatureCollection", features: [{ type: "Feature", geometry: { type: "Polygon", coordinates: [coords] }, properties: {} }] };
};

const inatPhoto = async (sci) => {
  const q = String(sci || "").trim();
  if (!q) return null;
  try {
    const d = await (await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(q)}&per_page=5`)).json();
    // iNat fuzzy-matches: asking for "Cetacea" once returned a deer. Only trust an exact name match.
    const want = q.toLowerCase();
    const t = (d.results || []).find((r) => String(r.name || "").toLowerCase() === want);
    const url = t && t.default_photo && (t.default_photo.medium_url || t.default_photo.square_url);
    return url ? { url, attr: (t.default_photo.attribution || "iNaturalist").replace(/<[^>]*>/g, "") } : null;
  } catch { return null; }
};

const MODES = [
  { id: "PLANET", label: "PLANET", color: C.white, blurb: "Planetary signals from trusted public sources." },
  { id: "OCE4N", label: "OCE4N", color: C.blue, blurb: "Marine life, ocean signals and pressure." },
  { id: "E4RTH", label: "E4RTH", color: C.green, blurb: "Land, life and terrestrial change." },
  { id: "S4PIENS", label: "S4PIENS", color: C.red, blurb: "Human systems written across the planet." },
];

/* raster stacking order, bottom → top. Points always sit above all of these. */
const RASTER_ORDER = ["bluemarble", "truecolor", "ndvi", "forest", "seaice", "coral", "precip", "sst", "aerosol", "night", "fires", "biodiv"];
/* the panel groups by DOMAIN — where a signal actually belongs.
   It does not burn at sea (fires = E4RTH); there is no sea temperature on land (SST = OCE4N). */
const DOMAINS = [
  { id: "PLANET",  label: "PLANET",  color: C.white },
  { id: "OCE4N",   label: "OCE4N",   color: C.blue },
  { id: "E4RTH",   label: "E4RTH",   color: C.green },
  { id: "S4PIENS", label: "S4PIENS", color: C.red },
];

const LAYERS = [
  { id: "bluemarble", dom: "PLANET", group: "EARTH", kind: "raster", domain: ["PLANET", "OCE4N", "E4RTH", "S4PIENS"],
    label: "EARTH " + DOT + " BLUE MARBLE", color: C.white, src: "NASA GIBS", opacity: 1, maxzoom: 8,
    note: "A seamless composite of Earth — full coverage, no daily gaps. The base view.",
    tiles: () => gibs("BlueMarble_ShadedRelief_Bathymetry", "default", 8, "jpeg"),
    attr: "Imagery: NASA GIBS / Blue Marble" },
  { id: "truecolor", dom: "PLANET", group: "EARTH", kind: "raster", dated: true, domain: ["PLANET", "OCE4N", "E4RTH", "S4PIENS"],
    label: "NASA EARTHDATA " + DOT + " TODAY", color: C.amber, src: "NASA GIBS / MODIS", opacity: 0.92, maxzoom: 8,
    note: "What the satellites actually saw on a given day. Dark wedges are areas not yet imaged — real gaps, not errors.",
    tiles: (off) => gibs("MODIS_Terra_CorrectedReflectance_TrueColor", daysAgo(off ?? 2), 9, "jpg"),
    attr: "Imagery: NASA GIBS / EOSDIS" },
  { id: "sst", dom: "OCE4N", group: "EARTH", kind: "raster", domain: ["PLANET", "OCE4N"],
    label: "OCEAN " + DOT + " SEA SURFACE TEMP", color: C.blue, src: "NASA GIBS / GHRSST", opacity: 0.8, maxzoom: 6,
    note: "Sea surface temperature (GHRSST L4 MUR). A gap-free daily analysis — warm currents, cold upwellings, marine heat.",
    legend: { ramp: "linear-gradient(90deg,#4B0082,#2E2EFF,#00C2D1,#3AE86F,#F2E600,#FF7D50,#C21807)",
      lo: "COLD", hi: "WARM", sub: "NASA GIBS palette (approx. \u22122 \u00B0C \u2192 35 \u00B0C)" },
    tiles: () => gibs("GHRSST_L4_MUR_Sea_Surface_Temperature", daysAgo(3), 7, "png"),
    attr: "Imagery: NASA GIBS / GHRSST" },
  { id: "night", dom: "S4PIENS", group: "EARTH", kind: "raster", domain: ["PLANET", "S4PIENS"],
    label: "NASA " + DOT + " NIGHT LIGHTS", color: C.red, src: "NASA GIBS / Black Marble", opacity: 0.9, maxzoom: 7,
    note: "Our light footprint at night (VIIRS composite). Brightness tracks energy use, cities and infrastructure.",
    legend: { ramp: "linear-gradient(90deg,#05070f,#3a2f1a,#8a6a25,#e8c15a,#fff6d8)", lo: "DARK", hi: "BRIGHT",
      sub: "Relative night-time radiance" },
    tiles: () => gibs("VIIRS_Black_Marble", "2016-01-01", 8, "png"),
    attr: "Imagery: NASA GIBS / Black Marble" },

  { id: "fires", dom: "E4RTH", group: "EARTH", kind: "raster", domain: ["PLANET", "E4RTH", "S4PIENS"],
    label: "ACTIVE FIRES", color: C.red, src: "NASA GIBS / MODIS", opacity: 1, maxzoom: 9, wms: true,
    note: "Thermal anomalies detected by satellite in the last 24h — active fires, gas flares and industrial heat. A detection is heat, not proof of wildfire.",
    legend: { ramp: "linear-gradient(90deg,#FF7D50,#FF4D22,#C21807)", lo: "DETECTED", hi: "INTENSE", sub: "MODIS thermal anomalies (day + night)" },
    tiles: () => wms("MODIS_Terra_Thermal_Anomalies_All", daysAgo(1)),
    attr: "NASA GIBS / MODIS" },
  { id: "ndvi", dom: "E4RTH", group: "EARTH", kind: "raster", domain: ["PLANET", "E4RTH"],
    label: "VEGETATION " + DOT + " NDVI", color: C.green, src: "NASA GIBS / MODIS", opacity: 0.85, maxzoom: 8, wms: true,
    note: "How green the land is. NDVI measures living plant cover — forests, crops, grassland. Deserts and ice read as bare.",
    legend: { ramp: "linear-gradient(90deg,#8a6a4a,#c9c07a,#8FBF5A,#3AE86F,#0d6b2f)", lo: "BARE", hi: "DENSE", sub: "MODIS 8-day vegetation index" },
    tiles: () => wms("MODIS_Terra_NDVI_8Day", daysAgo(10)),
    attr: "NASA GIBS / MODIS" },
  { id: "seaice", dom: "OCE4N", group: "EARTH", kind: "raster", domain: ["PLANET", "OCE4N"],
    label: "SEA ICE", color: C.white, src: "NASA GIBS / AMSRU2", opacity: 0.85, maxzoom: 6, wms: true,
    note: "Sea ice concentration at the poles. Watch it retreat and rebuild with the seasons — one of the clearest signals of a warming planet.",
    legend: { ramp: "linear-gradient(90deg,#0b2a4a,#2E2EFF,#8ec9ff,#ffffff)", lo: "OPEN WATER", hi: "SOLID ICE", sub: "AMSRU2 sea ice concentration" },
    tiles: () => wms("AMSRU2_Sea_Ice_Concentration_12km", daysAgo(2)),
    attr: "NASA GIBS / AMSRU2" },
  { id: "aerosol", dom: "S4PIENS", group: "EARTH", kind: "raster", domain: ["PLANET", "S4PIENS"],
    label: "AIR " + DOT + " AEROSOLS", color: C.amber, src: "NASA GIBS / MODIS", opacity: 0.8, maxzoom: 6, wms: true,
    note: "Aerosol optical depth — how much smoke, dust and pollution hangs in the air column. A proxy for air quality, not a ground measurement.",
    legend: { ramp: "linear-gradient(90deg,#1b2a4a,#3AE86F,#F2E600,#FF7D50,#C21807)", lo: "CLEAR", hi: "THICK", sub: "MODIS aerosol optical depth" },
    tiles: () => wms("MODIS_Combined_Value_Added_AOD", daysAgo(2)),
    attr: "NASA GIBS / MODIS" },
  { id: "precip", dom: "PLANET", group: "EARTH", kind: "raster", domain: ["PLANET", "OCE4N", "E4RTH"],
    label: "PRECIPITATION", color: C.blue, src: "NASA GIBS / IMERG", opacity: 0.85, maxzoom: 6, wms: true,
    note: "Rain and snow falling right now, measured from orbit (IMERG). The planet's water cycle, live.",
    legend: { ramp: "linear-gradient(90deg,#0b1a3a,#2E2EFF,#00C2D1,#3AE86F,#F2E600,#FF4D22)", lo: "LIGHT", hi: "HEAVY", sub: "IMERG precipitation rate" },
    tiles: () => wms("IMERG_Precipitation_Rate", daysAgo(1)),
    attr: "NASA GIBS / GPM IMERG" },

  { id: "shade", dom: "PLANET", group: "EARTH", kind: "shade", domain: ["PLANET", "OCE4N", "E4RTH", "S4PIENS"],
    label: "DAY / NIGHT", color: C.white, src: "Computed",
    note: "Where the sun is up right now, and where it has set. Calculated live from the sun's position — updates every minute.",
    attr: "" },
  { id: "forest", dom: "E4RTH", group: "EARTH", kind: "raster", domain: ["PLANET", "E4RTH"],
    label: "FOREST LOSS", color: C.green, src: "Global Forest Watch / UMD", opacity: 0.9, maxzoom: 12, xyz: true,
    note: "Tree cover lost since 2000 (Hansen/UMD). Loss is not always deforestation — it also captures fire, storms and harvest cycles.",
    legend: { ramp: "linear-gradient(90deg,#3AE86F,#F2E600,#FF7D50,#C21807)", lo: "EARLY", hi: "RECENT", sub: "Year of tree cover loss, 2001\u2013present" },
    tiles: () => "https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.11/tcd_30/{z}/{x}/{y}.png",
    attr: "Hansen/UMD/Google/USGS/NASA \u00b7 Global Forest Watch" },
  { id: "coral", dom: "OCE4N", group: "EARTH", kind: "raster", domain: ["PLANET", "OCE4N"],
    label: "CORAL HEAT STRESS", color: C.pink, src: "NOAA Coral Reef Watch", opacity: 0.9, maxzoom: 6, wms: true, wmsBase: "noaa",
    note: "Accumulated heat stress on coral reefs (Degree Heating Weeks). Sustained heat is what drives bleaching — this is the pressure, not the bleaching itself.",
    legend: { ramp: "linear-gradient(90deg,#2E2EFF,#3AE86F,#F2E600,#FF7D50,#C21807,#7a0d0d)", lo: "NO STRESS", hi: "SEVERE", sub: "NOAA CRW degree heating weeks" },
    tiles: () => "https://coastwatch.pfeg.noaa.gov/erddap/wms/NOAA_DHW/request?service=WMS&version=1.3.0&request=GetMap" +
      "&layers=NOAA_DHW:CRW_DHW&styles=&format=image%2Fpng&transparent=true&crs=EPSG%3A3857&width=256&height=256" +
      `&time=${daysAgo(2)}T12%3A00%3A00Z&bbox={bbox-epsg-3857}`,
    attr: "NOAA Coral Reef Watch" },
  { id: "protected", dom: "E4RTH", group: "EARTH", kind: "planned", domain: ["PLANET", "E4RTH", "OCE4N"],
    label: "PROTECTED AREAS", color: C.green, src: "Protected Planet / WDPA",
    note: "The world's protected areas (WDPA). The API needs a free UNEP-WCMC token, which we have not wired up yet \u2014 so no protected-area polygons are drawn. We would rather show nothing than fake a boundary.",
    attr: "" },

  { id: "biodiv", dom: "E4RTH", group: "LIFE", kind: "raster", domain: ["PLANET", "E4RTH", "OCE4N"],
    label: "BIODIVERSITY DENSITY", color: C.green, src: "GBIF", opacity: 0.85, maxzoom: 14, xyz: true,
    note: "Every biodiversity record GBIF holds \u2014 well over a billion \u2014 drawn as density. Bright means heavily recorded, not necessarily most alive: this map shows where people have looked.",
    legend: { ramp: "linear-gradient(90deg,#0b2a1a,#1f7a45,#3AE86F,#C8FF6B,#ffffff)", lo: "FEW RECORDS", hi: "MANY", sub: "GBIF occurrence density" },
    tiles: () => "https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?srs=EPSG%3A3857&style=green.poly",
    attr: "GBIF occurrence density" },
  { id: "whales", dom: "OCE4N", group: "LIFE", kind: "point", domain: ["PLANET", "OCE4N"],
    label: "WH4LES", color: C.blue, src: "OBIS", r: 4,
    note: "Recorded sightings and samples of cetaceans. These are occurrence records — not live positions or migration routes.",
    load: async () => {
      const d = await (await fetch("https://api.obis.org/v3/occurrence?scientificname=Cetacea&hascoordinate=true&size=800")).json();
      return (d.results || []).filter((o) => o.decimalLatitude && o.decimalLongitude).map((o) => {
        const sci = o.scientificName || "Cetacea";
        const common = o.vernacularName ? titleCase(o.vernacularName) : "";
        const link = o.aphiaID ? `<a class="pl" href="https://www.marinespecies.org/aphia.php?p=taxdetails&id=${o.aphiaID}" target="_blank" rel="noopener">Read on WoRMS \u2197</a>` : "";
        return { lon: o.decimalLongitude, lat: o.decimalLatitude, aphia: o.aphiaID || "",
          html: `<b class="nm">${esc(common || sci)}</b><br><span class="lat">${esc(sci)}</span>${link}` };
      });
    } },
  { id: "species", dom: "E4RTH", group: "LIFE", kind: "point", domain: ["PLANET", "E4RTH"],
    label: "SPECIES", color: C.green, src: "GBIF", r: 3,
    note: "Vertebrate occurrence records, sampled across continents. A record means someone observed it there — absence of dots is not absence of life.",
    load: async () => {
      const conts = ["EUROPE", "NORTH_AMERICA", "SOUTH_AMERICA", "AFRICA", "ASIA", "OCEANIA"];
      const parts = await Promise.all(conts.map((c) =>
        fetch(`https://api.gbif.org/v1/occurrence/search?hasCoordinate=true&taxonKey=44&continent=${c}&limit=150`)
          .then((r) => r.json()).catch(() => ({ results: [] }))));
      return parts.flatMap((p) => p.results || []).filter((o) => o.decimalLatitude && o.decimalLongitude).map((o) => {
        const sci = o.scientificName || o.species || "Unidentified";
        const link = o.speciesKey ? `<a class="pl" href="https://www.gbif.org/species/${o.speciesKey}" target="_blank" rel="noopener">Read on GBIF \u2197</a>` : "";
        return { lon: o.decimalLongitude, lat: o.decimalLatitude, sppKey: o.speciesKey || "",
          html: `<b class="nm">${esc(sci)}</b><br><span class="lat">${esc(sci)}</span>${link}` };
      });
    } },

  { id: "events", dom: "PLANET", group: "SIGNALS", kind: "point", domain: ["PLANET", "E4RTH", "OCE4N"],
    label: "FIRE + EVENTS", color: C.amber, src: "NASA EONET", r: 5,
    note: "Natural events currently open in NASA's EONET feed: wildfires, volcanoes, severe storms, sea ice.",
    load: async () => {
      const d = await (await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=300")).json();
      return (d.events || []).map((e) => {
        const g = (e.geometry || []).slice(-1)[0];
        if (!g || !Array.isArray(g.coordinates) || typeof g.coordinates[0] !== "number") return null;
        const cat = (e.categories && e.categories[0] && e.categories[0].title) || "Event";
        const col = /storm/i.test(cat) ? C.blue : /ice/i.test(cat) ? C.white : /volcano/i.test(cat) ? C.pink : /fire/i.test(cat) ? C.amber : C.red;
        const kind = /storm/i.test(cat) ? "SEVERE STORM" : /ice/i.test(cat) ? "ICEBERG / SEA ICE"
          : /volcano/i.test(cat) ? "VOLCANIC ACTIVITY" : /fire/i.test(cat) ? "ACTIVE WILDFIRE" : cat.toUpperCase();
        return { lon: g.coordinates[0], lat: g.coordinates[1], col,
          html: `<b>${esc(kind)}</b><br><span class="lat">${esc(e.title || "")}</span>` };
      }).filter(Boolean);
    } },
  { id: "quakes", dom: "E4RTH", group: "SIGNALS", kind: "point", domain: ["PLANET", "S4PIENS", "E4RTH"],
    label: "QU4KES", color: C.red, src: "USGS", r: 4,
    note: "Every earthquake recorded worldwide in the past 24 hours. Circle size scales with magnitude.",
    load: async () => {
      const d = await (await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson")).json();
      return (d.features || []).map((f) => ({
        lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1],
        size: Math.max(3, (f.properties.mag || 1) * 1.6),
        html: `<b>M ${esc(f.properties.mag)}</b><br><span class="lat">${esc(f.properties.place || "")}</span>` }));
    } },
  { id: "iss", dom: "PLANET", group: "SIGNALS", kind: "live", domain: ["PLANET", "S4PIENS"], every: 5000,
    label: "ISS_ TRACKER", color: C.white, src: "wheretheiss.at", r: 6,
    note: "Live position of the International Space Station, refreshed every 5 seconds. Planetary perspective — not ecological data.",
    load: async () => {
      const d = await (await fetch("https://api.wheretheiss.at/v1/satellites/25544")).json();
      return [{ lon: d.longitude, lat: d.latitude,
        html: `<b>ISS_ ORBITAL TRACK</b><br><span class="lat">ALT ${Math.round(d.altitude)} KM ${DOT} VEL ${Math.round(d.velocity)} KM/H</span>` }];
    } },
];

const BASE = {
  dark: "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
  light: "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
};
const LABELS = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const makeStyle = (light) => ({
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    base: { type: "raster", tiles: [light ? BASE.light : BASE.dark], tileSize: 256, maxzoom: 18, attribution: "&copy; OpenStreetMap &copy; CARTO" },
    lbls: { type: "raster", tiles: [LABELS], tileSize: 256, maxzoom: 16, attribution: "Labels &copy; Esri" },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": light ? "#f2f3f5" : C.ink } },
    { id: "base", type: "raster", source: "base", paint: { "raster-opacity": light ? 0.9 : 1 } },
    { id: "lbls", type: "raster", source: "lbls", paint: { "raster-opacity": light ? 0.55 : 0.5 } },
  ],
  sky: {
    "sky-color": light ? "#e8edf7" : "#05070f",
    "horizon-color": light ? "#ffffff" : "#101636",
    "fog-color": light ? "#ffffff" : "#05070f",
    "fog-ground-blend": 0.6,
  },
});

const readUrl = () => {
  const p = new URLSearchParams(window.location.search);
  const c = (p.get("c") || "").split(",").map(Number);
  return {
    mode: MODES.some((m) => m.id === p.get("m")) ? p.get("m") : "PLANET",
    on: (p.get("l") || "bluemarble").split(",").filter((x) => LAYERS.some((l) => l.id === x)),
    light: p.get("t") === "light",
    flat: p.get("p") === "2d",
    zoom: Number(p.get("z")) || 2.1,
    center: c.length === 2 && !c.some(isNaN) ? c : [10, 25],
  };
};

function AtlasMap() {
  const boxRef = useRef(null);
  const map = useRef(null);
  const timers = useRef({});
  const popup = useRef(null);
  const init = useRef(readUrl());

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState(init.current.mode);
  const [on, setOn] = useState(() => Object.fromEntries(init.current.on.map((id) => [id, true])));
  const [light, setLight] = useState(init.current.light);
  const [flat, setFlat] = useState(init.current.flat);
  const [status, setStatus] = useState({});
  const [busy, setBusy] = useState({});
  const [info, setInfo] = useState({});
  const [opacity, setOpacity] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [satOffset, setSatOffset] = useState(2);
  const [sect, setSect] = useState({});
  const [utc, setUtc] = useState(new Date().toISOString().slice(11, 19) + "Z");
  const [copied, setCopied] = useState(false);

  // species search
  const [q, setQ] = useState("");
  const [hits, setHits] = useState([]);
  const [found, setFound] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setUtc(new Date().toISOString().slice(11, 19) + "Z"), 1000);
    return () => clearInterval(t);
  }, []);

  const writeUrl = useCallback((patch = {}) => {
    const m = map.current; if (!m) return;
    const p = new URLSearchParams();
    p.set("m", patch.mode ?? mode);
    const src = patch.on ?? on;
    const act = Object.keys(src).filter((k) => src[k]);
    if (act.length) p.set("l", act.join(","));
    if (patch.light ?? light) p.set("t", "light");
    if (patch.flat ?? flat) p.set("p", "2d");
    const c = m.getCenter();
    p.set("z", m.getZoom().toFixed(2));
    p.set("c", `${c.lng.toFixed(2)},${c.lat.toFixed(2)}`);
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
  }, [mode, on, light, flat]);

  /* raster layers must stack in a fixed order, and points must sit above them */
  const rasterBefore = (id) => {
    const m = map.current;
    const i = RASTER_ORDER.indexOf(id);
    for (let j = i + 1; j < RASTER_ORDER.length; j++) if (m.getLayer(RASTER_ORDER[j])) return RASTER_ORDER[j];
    return m.getLayer("lbls") ? "lbls" : undefined;
  };

  const drawPoints = (id, label, src, note, rows, colorFallback, rFallback) => {
    const m = map.current;
    const fc = { type: "FeatureCollection", features: rows.map((p) => ({
      type: "Feature", geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      properties: { html: p.html, col: p.col || colorFallback, size: p.size || rFallback, sppKey: p.sppKey || "", aphia: p.aphia || "" } })) };
    if (m.getSource(id)) { m.getSource(id).setData(fc); return; }
    m.addSource(id, { type: "geojson", data: fc });
    m.addLayer({ id, type: "circle", source: id, paint: {
      "circle-radius": ["get", "size"], "circle-color": ["get", "col"], "circle-opacity": 0.78,
      "circle-stroke-width": 1, "circle-stroke-color": ["get", "col"], "circle-stroke-opacity": 0.9 } });
    m.on("click", id, (e) => {
      const f = e.features && e.features[0]; if (!f) return;
      const col = f.properties.col;
      if (popup.current) popup.current.remove();
      popup.current = new maplibregl.Popup({ closeButton: true, maxWidth: "300px" })
        .setLngLat(f.geometry.coordinates.slice())
        .setHTML(`<div class="atlas-pop" style="border-color:${col}"><div class="pt" style="color:${col}">${label} ${DOT} ${src}</div>${f.properties.html}${note ? `<div class="note">${esc(note)}</div>` : ""}</div>`)
        .addTo(m);
      const root = popup.current.getElement();
      const el = root && root.querySelector(".nm");
      const key = f.properties.sppKey;
      const aphia = f.properties.aphia;
      // a Latin string is a label; a photo is a creature.
      const sciForPhoto = (f.properties.html.match(/<span class="lat">([^<]+)/) || [])[1];
      if (root && sciForPhoto) {
        inatPhoto(sciForPhoto).then((ph) => {
          const box = popup.current && popup.current.getElement() && popup.current.getElement().querySelector(".atlas-pop");
          if (ph && box && !box.querySelector("img")) {
            const im = document.createElement("img");
            im.src = ph.url; im.alt = sciForPhoto;
            box.insertBefore(im, box.children[1] || null);
          }
        });
      }
      if (el && key) {
        fetch(`https://api.gbif.org/v1/species/${key}/vernacularNames?limit=60`)
          .then((r) => r.json())
          .then((d) => { const en = (d.results || []).find((v) => v.language === "eng" && v.vernacularName); if (en) el.textContent = titleCase(en.vernacularName); })
          .catch(() => {});
      } else if (el && aphia) {
        // OBIS records frequently carry no vernacular name — WoRMS has one.
        fetch(`https://www.marinespecies.org/rest/AphiaVernacularsByAphiaID/${aphia}`)
          .then((r) => (r.ok ? r.json() : []))
          .then((d) => { const en = (d || []).find((v) => v.language_code === "eng" && v.vernacular); if (en) el.textContent = titleCase(en.vernacular); })
          .catch(() => {});
      }
    });
    m.on("mouseenter", id, () => { m.getCanvas().style.cursor = "pointer"; });
    m.on("mouseleave", id, () => { m.getCanvas().style.cursor = ""; });
  };

  const addLayer = useCallback(async (l, silent) => {
    const m = map.current; if (!m || !l) return;
    if (l.kind === "shade") {
      if (m.getSource("shade")) return;
      m.addSource("shade", { type: "geojson", data: nightPolygon() });
      m.addLayer({ id: "shade", type: "fill", source: "shade",
        paint: { "fill-color": "#02030a", "fill-opacity": 0.42 } }, m.getLayer("lbls") ? "lbls" : undefined);
      if (!timers.current.shade) timers.current.shade = setInterval(() => {
        const src = map.current && map.current.getSource("shade");
        if (src) src.setData(nightPolygon());
      }, 60000);
      setStatus((st) => ({ ...st, shade: "LIVE" }));
      return;
    }
    if (l.kind === "planned") { setStatus((st) => ({ ...st, [l.id]: "PLANNED" })); return; }

    if (l.kind === "raster") {
      if (m.getSource(l.id)) return;
      const src = { type: "raster", tiles: [l.tiles(satOffset)], tileSize: 256, attribution: l.attr };
      if (!l.wms) src.maxzoom = l.maxzoom;
      m.addSource(l.id, src);
      m.addLayer({ id: l.id, type: "raster", source: l.id,
        paint: { "raster-opacity": opacity[l.id] ?? l.opacity } }, rasterBefore(l.id));
      setStatus((st) => ({ ...st, [l.id]: "ON" }));
      return;
    }
    if (!silent) { setBusy((s) => ({ ...s, [l.id]: true })); setStatus((s) => ({ ...s, [l.id]: "\u00b7\u00b7\u00b7" })); }
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

  useEffect(() => {
    if (map.current) return;
    const m = new maplibregl.Map({
      container: boxRef.current, style: makeStyle(init.current.light),
      center: init.current.center, zoom: init.current.zoom, minZoom: 1, maxZoom: 10,
      attributionControl: { compact: true }, canvasContextAttributes: { antialias: true },
    });
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
    m.on("style.load", () => m.setProjection({ type: init.current.flat ? "mercator" : "globe" }));
    m.on("load", () => setReady(true));
    // A raster source that 404s used to just render nothing while the row said ON.
    // Now we say so.
    m.on("error", (e) => {
      const id = e && e.sourceId;
      if (id && LAYERS.some((l) => l.id === id)) setStatus((st) => ({ ...st, [id]: "UNAVAILABLE" }));
    });
    m.on("moveend", () => writeUrl());
    m.on("click", (e) => {
      const ids = ["whales", "species", "events", "quakes", "iss", "search", "nearme"].filter((id) => m.getLayer(id));
      const hit = ids.length ? m.queryRenderedFeatures(e.point, { layers: ids }) : [];
      if (!hit.length) askHere(e.lngLat.lng, e.lngLat.lat);
    });
    return () => { Object.values(timers.current).forEach(clearInterval); m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    init.current.on.forEach((id) => addLayer(LAYERS.find((l) => l.id === id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  useEffect(() => {
    const m = map.current; if (!m || !ready) return;
    const active = Object.keys(on).filter((k) => on[k]);
    const hadSearch = !!found;
    m.setStyle(makeStyle(light));
    m.once("styledata", () => {
      m.setProjection({ type: flat ? "mercator" : "globe" });
      RASTER_ORDER.forEach((id) => { if (active.includes(id)) addLayer(LAYERS.find((l) => l.id === id), true); });
      active.filter((id) => !RASTER_ORDER.includes(id)).forEach((id) => addLayer(LAYERS.find((l) => l.id === id), true));
      if (hadSearch) drawPoints("search", "SEARCH", "GBIF", found.note, found.rows, C.pink, 4);
    });
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

  const setOpa = (l, v) => {
    setOpacity((s) => ({ ...s, [l.id]: v }));
    const m = map.current;
    if (m && m.getLayer(l.id)) m.setPaintProperty(l.id, "raster-opacity", v);
  };

  const setDate = (off) => {
    setSatOffset(off);
    const m = map.current; const l = LAYERS.find((x) => x.id === "truecolor");
    const src = m && m.getSource("truecolor");
    if (src && src.setTiles) src.setTiles([l.tiles(off)]);
  };

  const toggleProjection = () => {
    const next = !flat;
    setFlat(next);
    map.current.setProjection({ type: next ? "mercator" : "globe" });
    writeUrl({ flat: next });
  };

  const goHome = () => map.current.flyTo({ center: [10, 25], zoom: 2.1, duration: 1200 });

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };

  /* ── SPECIES SEARCH ─────────────────────────────────────────────────── */


  const [here, setHere] = useState(null);

  const askHere = useCallback(async (lng, lat) => {
    setHere({ lng, lat, loading: true });
    const d = 0.35;
    const wkt = `POLYGON((${lng - d} ${lat - d},${lng + d} ${lat - d},${lng + d} ${lat + d},${lng - d} ${lat + d},${lng - d} ${lat - d}))`;
    const km = (a, b) => {
      const R = 6371, p = Math.PI / 180;
      const dLa = (b.lat - a.lat) * p, dLo = (b.lng - a.lng) * p;
      const h = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(dLo / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    };
    const nearFeatures = (id, radius) => {
      const m = map.current;
      if (!m.getSource(id) || !m.getLayer(id)) return [];
      return m.querySourceFeatures(id).filter((f) => {
        const c = f.geometry && f.geometry.coordinates;
        return c && km({ lng, lat }, { lng: c[0], lat: c[1] }) < radius;
      });
    };
    let species = [], nSp = 0;
    try {
      const r = await (await fetch(
        `https://api.gbif.org/v1/occurrence/search?hasCoordinate=true&geometry=${encodeURIComponent(wkt)}&limit=100`)).json();
      nSp = r.count || 0;
      species = [...new Set((r.results || []).map((o) => o.species || o.scientificName).filter(Boolean))].slice(0, 5);
    } catch { /* leave empty */ }
    const events = nearFeatures("events", 400).map((f) => (f.properties.html.match(/<b>([^<]+)/) || [])[1]).filter(Boolean);
    const quakes = nearFeatures("quakes", 400).length;
    const whales = nearFeatures("whales", 200).length;
    setHere({ lng, lat, loading: false, nSp, species, events: [...new Set(events)].slice(0, 3), quakes, whales });
  }, []);

  const [near, setNear] = useState(null);
  const [nearBusy, setNearBusy] = useState(false);

  const nearMe = () => {
    if (!navigator.geolocation) { setNear({ err: "Location not available in this browser." }); return; }
    setNearBusy(true); setNear(null);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: la, longitude: lo } = pos.coords;
      map.current.flyTo({ center: [lo, la], zoom: 7, duration: 1600 });
      const d = 0.6; // ~60 km box
      const wkt = `POLYGON((${lo - d} ${la - d},${lo + d} ${la - d},${lo + d} ${la + d},${lo - d} ${la + d},${lo - d} ${la - d}))`;
      try {
        const r = await (await fetch(
          `https://api.gbif.org/v1/occurrence/search?hasCoordinate=true&taxonKey=44&geometry=${encodeURIComponent(wkt)}&limit=300`)).json();
        const rows = (r.results || []).filter((o) => o.decimalLatitude && o.decimalLongitude).map((o) => {
          const sci = o.scientificName || o.species || "Unidentified";
          const link = o.speciesKey ? `<a class="pl" href="https://www.gbif.org/species/${o.speciesKey}" target="_blank" rel="noopener">Read on GBIF \u2197</a>` : "";
          return { lon: o.decimalLongitude, lat: o.decimalLatitude, sppKey: o.speciesKey || "",
            html: `<b class="nm">${esc(sci)}</b><br><span class="lat">${esc(sci)}</span>${link}` };
        });
        const note = "Vertebrates recorded near you (GBIF). Records show where people have looked and reported — not everything that lives here.";
        drawPoints("nearme", "NEAR ME", "GBIF", note, rows, C.green, 4);
        const names = [...new Set(rows.map((x) => x.html.match(/<b class="nm">([^<]+)/)[1]))].slice(0, 6);
        setNear({ n: rows.length, names });
      } catch { setNear({ err: "Could not reach GBIF." }); }
      setNearBusy(false);
    }, () => { setNear({ err: "Location permission denied." }); setNearBusy(false); }, { timeout: 10000 });
  };

  const clearNear = () => {
    const m = map.current;
    if (m.getLayer("nearme")) m.removeLayer("nearme");
    if (m.getSource("nearme")) m.removeSource("nearme");
    setNear(null);
  };

  const suggest = async (text) => {
    setQ(text);
    if (text.trim().length < 3) { setHits([]); return; }
    const t = text.trim().toLowerCase();
    const url = (extra) =>
      `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(text)}&rank=SPECIES&status=ACCEPTED${extra}&limit=20`;
    try {
      // one query across ALL life (oak, coral, fungi) + one biased to vertebrates, merged.
      // A single unfiltered query buried "orca" under ants and foraminifera; ranking fixes that
      // without amputating the rest of the tree of life.
      const [all, vert] = await Promise.all([
        fetch(url("")).then((r) => r.json()).catch(() => ({ results: [] })),
        fetch(url("&highertaxonKey=44")).then((r) => r.json()).catch(() => ({ results: [] })),
      ]);
      const seen = new Set();
      const rows = [...(vert.results || []), ...(all.results || [])]
        .filter((h) => h.key && h.scientificName && !seen.has(h.key) && seen.add(h.key))
        .map((h) => {
          const vn = (h.vernacularNames || []).find((v) => v.language === "eng" && v.vernacularName);
          const common = vn ? titleCase(vn.vernacularName) : "";
          const c = common.toLowerCase(), sci = h.scientificName.toLowerCase();
          const score = c.startsWith(t) ? 0 : c.includes(t) ? 1 : sci.startsWith(t) ? 2 : sci.includes(t) ? 3 : 4;
          return { key: h.key, scientificName: h.scientificName, common, score };
        });
      rows.sort((a, b) => a.score - b.score);
      setHits(rows.slice(0, 7));
    } catch { setHits([]); }
  };

  const pickSpecies = async (h) => {
    setHits([]); setSearching(true); setQ(h.common || h.scientificName);
    try {
      const [occ, vern, photo] = await Promise.all([
        fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${h.key}&hasCoordinate=true&limit=300`).then((r) => r.json()),
        fetch(`https://api.gbif.org/v1/species/${h.key}/vernacularNames?limit=60`).then((r) => r.json()).catch(() => ({ results: [] })),
        inatPhoto(h.scientificName),
      ]);
      const en = (vern.results || []).find((v) => v.language === "eng" && v.vernacularName);
      const common = h.common || (en ? titleCase(en.vernacularName) : "");
      const rows = (occ.results || []).filter((o) => o.decimalLatitude && o.decimalLongitude).map((o) => ({
        lon: o.decimalLongitude, lat: o.decimalLatitude,
        html: `<b>${esc(common || h.scientificName)}</b><br><span class="lat">${esc(h.scientificName)}</span>` +
              (o.eventDate ? `<div class="when">Observed ${esc(String(o.eventDate).slice(0, 10))}</div>` : "") +
              (o.key ? `<a class="pl" href="https://www.gbif.org/occurrence/${o.key}" target="_blank" rel="noopener">See this record \u2197</a>` : "") +
              `<a class="pl" href="https://www.gbif.org/species/${h.key}" target="_blank" rel="noopener">About the species \u2197</a>`,
      }));
      const note = "Where this species has been observed and recorded (GBIF). Records reflect where people looked, not the full range.";
      drawPoints("search", "SEARCH", "GBIF", note, rows, C.pink, 4);
      setFound({ name: common || h.scientificName, sci: h.scientificName, n: rows.length, rows, note, photo, key: h.key });
      if (rows.length) {
        const lons = rows.map((r) => r.lon), lats = rows.map((r) => r.lat);
        map.current.fitBounds([[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
          { padding: 90, maxZoom: 5, duration: 1400 });
      }
    } catch { setFound(null); }
    setSearching(false);
  };

  /* ISOLATE — mute every other point layer so one species can be read on its own */
  const [isolate, setIsolate] = useState(false);
  const applyIsolate = (v) => {
    setIsolate(v);
    const m = map.current;
    ["whales", "species", "events", "quakes", "iss", "nearme"].forEach((id) => {
      if (m.getLayer(id)) m.setLayoutProperty(id, "visibility", v ? "none" : "visible");
    });
  };

  const clearSearch = () => {
    const m = map.current;
    if (m.getLayer("search")) m.removeLayer("search");
    if (m.getSource("search")) m.removeSource("search");
    setFound(null); setQ(""); setHits([]);
    if (isolate) applyIsolate(false);
  };

  const visible = LAYERS.filter((l) => l.domain.includes(mode));
  const activeLayers = RASTER_ORDER.concat(["shade", "whales", "species", "events", "quakes", "iss"])
    .map((id) => visible.find((l) => l.id === id)).filter((l) => l && on[l.id]);

  const row = (l) => (
    <React.Fragment key={l.id}>
      <div className="atlas-row" style={{ borderColor: on[l.id] ? l.color : undefined }}>
        <span className="alyr" onClick={() => toggle(l)} style={{ cursor: "pointer" }}>
          <span className="dot" style={{ background: l.color }} />{l.label}
        </span>
        <button className="ibtn" aria-label="About this layer"
          onClick={() => setInfo((st) => ({ ...st, [l.id]: !st[l.id] }))}>i</button>
        <span className="st" onClick={() => toggle(l)}
          style={{ color: status[l.id] === "UNAVAILABLE" ? C.red : (on[l.id] ? l.color : undefined), cursor: "pointer" }}>
          {busy[l.id] ? "\u00b7\u00b7\u00b7" : on[l.id] ? (status[l.id] || "ON") : (l.kind === "planned" ? "PLANNED" : "OFF")}
        </span>
      </div>
      {info[l.id] && (
        <div className="drawer">
          <div className="foot">{l.note}</div>
          <div className="foot" style={{ marginTop: 5, opacity: .75 }}>SOURCE {DOT} {l.src}</div>
        </div>
      )}
      {on[l.id] && l.legend && status[l.id] !== "UNAVAILABLE" && (
        <div className="drawer">
          <div className="ramp" style={{ background: l.legend.ramp }} />
          <div className="foot" style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span>{l.legend.lo}</span><span>{l.legend.hi}</span>
          </div>
          <div className="foot" style={{ marginTop: 2, opacity: .75 }}>{l.legend.sub}</div>
        </div>
      )}
      {on[l.id] && l.dated && (
        <div className="drawer">
          <div className="foot" style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span>IMAGERY DATE</span><span>{satOffset === 0 ? "TODAY" : daysAgo(satOffset)}</span>
          </div>
          <input type="range" min={0} max={14} value={14 - satOffset}
            onChange={(e) => setDate(14 - Number(e.target.value))}
            style={{ width: "100%", accentColor: light ? C.blue : "#fff" }} />
        </div>
      )}
      {on[l.id] && l.kind === "raster" && status[l.id] !== "UNAVAILABLE" && (
        <div className="drawer">
          <div className="foot" style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span>OPACITY</span><span>{Math.round((opacity[l.id] ?? l.opacity) * 100)}%</span>
          </div>
          <input type="range" min={0} max={100} value={Math.round((opacity[l.id] ?? l.opacity) * 100)}
            onChange={(e) => setOpa(l, Number(e.target.value) / 100)}
            style={{ width: "100%", accentColor: l.color }} />
        </div>
      )}
    </React.Fragment>
  );

  return (
    <div className={light ? "atlas light" : "atlas"} style={{ position: "fixed", inset: 0, background: light ? "#f2f3f5" : C.ink, color: light ? C.ink : "#fff", fontFamily: MONO }}>
      <style>{`
        .maplibregl-canvas-container canvas{outline:none}
        .maplibregl-popup-content{background:rgba(8,8,8,.96);color:#fff;border-radius:0;box-shadow:none;padding:10px 12px;font-family:${MONO};font-size:11px;line-height:1.5}
        .atlas.light .maplibregl-popup-content{background:#fff;color:${C.ink};box-shadow:0 2px 18px rgba(8,8,8,.16)}
        .maplibregl-popup-tip{display:none}
        .maplibregl-popup-close-button{color:inherit;font-size:15px;padding:2px 7px}
        .atlas-pop{border-left:2px solid #fff;padding-left:10px}
        .atlas-pop .pt{font-size:9.5px;letter-spacing:.14em;margin-bottom:5px}
        .atlas-pop .lat{opacity:.6;font-size:10px}
        .atlas-pop .note{opacity:.45;font-size:9px;margin-top:7px;line-height:1.4}
        .atlas-pop .pl{display:block;margin-top:7px;color:#fff;opacity:.85;font-size:10px;text-decoration:underline}
        .atlas.light .atlas-pop .pl{color:${C.blue};opacity:1}
        .maplibregl-ctrl-attrib{background:transparent!important;font-size:9px}
        .maplibregl-ctrl-attrib a{color:${C.blue}}
        .maplibregl-ctrl-group{background:rgba(8,8,8,.9);border:1px solid rgba(255,255,255,.14)}
        .maplibregl-ctrl-group button span{filter:invert(1)}
        .atlas.light .maplibregl-ctrl-group{background:#fff;border-color:rgba(8,8,8,.15)}
        .atlas.light .maplibregl-ctrl-group button span{filter:none}
        .atlas-panel{position:absolute;top:14px;left:14px;z-index:10;width:264px;max-width:calc(100vw - 28px);max-height:calc(100vh - 28px);overflow-y:auto;
          background:rgba(8,8,8,.88);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);padding:13px}
        .atlas-panel::-webkit-scrollbar{width:5px}
        .atlas-panel::-webkit-scrollbar-thumb{background:rgba(255,255,255,.16)}
        .sect{display:flex;align-items:center;justify-content:space-between;width:100%;background:transparent;border:none;
          color:inherit;font-family:${MONO};font-size:9.5px;letter-spacing:.16em;padding:3px 0 5px;cursor:pointer}
        .atlas.light .atlas-panel{background:rgba(255,255,255,.95);border-color:rgba(46,46,255,.25);box-shadow:0 2px 30px rgba(8,8,8,.12)}
        .chip{background:transparent;border:1px solid rgba(255,255,255,.2);color:#fff;font-family:${MONO};font-size:10px;letter-spacing:.08em;padding:3px 8px;cursor:pointer}
        .atlas.light .chip{border-color:rgba(46,46,255,.4);color:${C.blue}}
        .mbtn{background:transparent;border:1px solid rgba(255,255,255,.16);color:rgba(255,255,255,.7);font-family:${MONO};font-size:9.5px;letter-spacing:.06em;padding:5px 7px;cursor:pointer;transition:border-color .18s,color .18s}
        .atlas.light .mbtn{border-color:rgba(8,8,8,.16);color:rgba(8,8,8,.65)}
        .grp{font-size:9px;letter-spacing:.16em;color:rgba(255,255,255,.4);margin-bottom:2px}
        .atlas.light .grp{color:rgba(8,8,8,.45)}
        .foot{font-size:8.5px;letter-spacing:.04em;color:rgba(255,255,255,.46);line-height:1.55}
        .atlas.light .foot{color:rgba(8,8,8,.55)}
        .atlas-row{display:flex;align-items:center;justify-content:space-between;width:100%;padding:6px 8px;margin-top:4px;
          background:transparent;border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.9);cursor:pointer;
          font-family:${MONO};font-size:10.5px;letter-spacing:.02em;transition:border-color .18s,color .18s}
        .atlas.light .atlas-row{border-color:rgba(8,8,8,.16);color:rgba(8,8,8,.9)}
        .atlas-row:hover{color:#fff}
        .atlas.light .atlas-row:hover{color:${C.blue};border-color:${C.blue}}
        .atlas-row .dot{width:8px;height:8px;border-radius:50%;margin-right:9px;flex:0 0 auto}
        .atlas-row .alyr{display:flex;align-items:center;flex:1;min-width:0;color:inherit}
        .atlas-row .st{opacity:.72;font-size:10px;white-space:nowrap;margin-left:8px}
        .ibtn{border:1px solid rgba(255,255,255,.28);color:inherit;background:transparent;width:15px;height:15px;line-height:1;
          font-size:9px;font-family:${MONO};border-radius:50%;margin-left:7px;cursor:pointer;flex:0 0 auto;padding:0}
        .atlas.light .ibtn{border-color:rgba(8,8,8,.3)}
        .drawer{border:1px solid rgba(255,255,255,.10);border-top:none;padding:7px 8px}
        .atlas.light .drawer{border-color:rgba(8,8,8,.12)}
        .ramp{height:7px;width:100%;border:1px solid rgba(255,255,255,.15)}
        .atlas.light .ramp{border-color:rgba(8,8,8,.15)}
        .sinput{width:100%;background:transparent;border:1px solid rgba(255,255,255,.18);color:inherit;font-family:${MONO};
          font-size:10.5px;padding:6px 8px;outline:none}
        .atlas.light .sinput{border-color:rgba(8,8,8,.2)}
        .sinput:focus{border-color:${C.pink}}
        .shit{padding:5px 8px;border:1px solid rgba(255,255,255,.10);border-top:none;cursor:pointer;font-size:10px}
        .atlas.light .shit{border-color:rgba(8,8,8,.12)}
        .shit:hover{color:${C.pink};border-color:${C.pink}}
        .here-panel{position:absolute;top:14px;right:14px;z-index:10;width:262px;max-width:calc(100vw - 28px);
          background:rgba(8,8,8,.88);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);padding:13px}
        .atlas.light .here-panel{background:rgba(255,255,255,.95);border-color:rgba(46,46,255,.25);box-shadow:0 2px 30px rgba(8,8,8,.12)}
        .hrow{display:flex;justify-content:space-between;align-items:center;font-size:10px;margin-top:7px;letter-spacing:.03em}
        .atlas-pop .when{opacity:.7;font-size:9.5px;margin-top:5px}
        .atlas-pop img{width:100%;height:88px;object-fit:cover;display:block;margin:6px 0 2px}
        @media (max-width:640px){ .here-panel{display:none} .atlas-panel{width:214px;padding:11px;top:10px;left:10px} }
      `}</style>

      <div className="atlas-panel">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, letterSpacing: ".14em", fontWeight: 700 }}>4PLANET_ ATLAS</div>
            <div style={{ fontSize: 9, letterSpacing: ".14em", marginTop: 4, color: light ? C.blue : "#fff", opacity: light ? 1 : 0.85 }}>PLANETARY INTELLIGENCE</div>
            <div className="foot" style={{ marginTop: 5, letterSpacing: ".1em" }}>{utc}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="chip" onClick={() => setLight((v) => !v)}>{light ? "DARK" : "LIGHT"}</button>
            <button className="chip" onClick={() => setCollapsed((v) => !v)}>{collapsed ? "+" : "\u2013"}</button>
          </div>
        </div>

        {!collapsed && (
          <>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button className="chip" onClick={toggleProjection}>{flat ? "3D" : "2D"}</button>
              <button className="chip" onClick={goHome}>HOME</button>
              <button className="chip" onClick={share} style={copied ? { borderColor: C.green, color: C.green } : undefined}>{copied ? "COPIED" : "SHARE"}</button>
              <button className="chip" onClick={nearMe} style={near && near.n ? { borderColor: C.green, color: C.green } : undefined}>
                {nearBusy ? "\u00b7\u00b7\u00b7" : "NEAR ME"}
              </button>
            </div>

            {near && (
              <div className="drawer" style={{ marginTop: 8, borderTop: `1px solid ${near.err ? C.red : C.green}` }}>
                {near.err
                  ? <div className="foot">{near.err}</div>
                  : (<>
                      <div style={{ fontSize: 11, color: C.green }}>{near.n} records near you</div>
                      <div className="foot" style={{ marginTop: 5 }}>{near.names.join(", ")}</div>
                      <button className="chip" style={{ marginTop: 8 }} onClick={clearNear}>CLEAR</button>
                    </>)}
              </div>
            )}

            {/* SPECIES SEARCH */}
            <div style={{ marginTop: 13 }}>
              <div className="grp">FIND A SPECIES</div>
              <div style={{ marginTop: 8 }}>
                <input className="sinput" value={q} placeholder={"orca, oak, blue tit\u2026"}
                  onChange={(e) => suggest(e.target.value)} aria-label="Search for a species" />
                {hits.map((h) => (
                  <div key={h.key} className="shit" onClick={() => pickSpecies(h)}>
                    {h.common || h.scientificName}
                    {h.common ? <div className="foot" style={{ marginTop: 2 }}>{h.scientificName}</div> : null}
                  </div>
                ))}
                {searching && <div className="foot" style={{ marginTop: 7 }}>{"Searching GBIF\u2026"}</div>}
                {found && (
                  <div className="drawer" style={{ borderTop: `1px solid ${C.pink}`, marginTop: 6 }}>
                    {found.photo && (
                      <img src={found.photo.url} alt={found.name}
                        style={{ width: "100%", height: 96, objectFit: "cover", display: "block", marginBottom: 7 }} />
                    )}
                    <div style={{ fontSize: 11, color: C.pink }}>{found.name}</div>
                    <div className="foot" style={{ marginTop: 2 }}>{found.sci}</div>
                    <div className="foot" style={{ marginTop: 4 }}>{found.n} recorded observations shown.</div>
                    {found.photo && <div className="foot" style={{ marginTop: 3, opacity: .6 }}>Photo {DOT} {found.photo.attr}</div>}
                    <div className="foot" style={{ marginTop: 4, opacity: .8 }}>{found.note}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
                      <button className="chip" onClick={() => applyIsolate(!isolate)}
                        style={isolate ? { borderColor: C.pink, color: C.pink } : undefined}>
                        {isolate ? "SHOW ALL" : "ISOLATE"}
                      </button>
                      <button className="chip" onClick={clearSearch}>CLEAR</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 13 }}>
              <div className="grp">MODE</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {MODES.map((md) => (
                  <button key={md.id} className="mbtn" onClick={() => { setMode(md.id); writeUrl({ mode: md.id }); }}
                    style={mode === md.id ? { borderColor: md.color, color: light && md.id === "PLANET" ? C.ink : md.color } : undefined}>
                    {md.label}
                  </button>
                ))}
              </div>
              <div className="foot" style={{ marginTop: 9 }}>{(MODES.find((md) => md.id === mode) || {}).blurb}</div>
            </div>

            {/* ACTIVE — whatever is on, pinned to the top so it is never buried */}
            {activeLayers.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div className="grp">ACTIVE</div>
                {activeLayers.map((l) => row(l))}
              </div>
            )}

            {/* everything else, grouped by the domain it actually belongs to */}
            {DOMAINS.map((d) => {
              const rows = visible.filter((l) => l.dom === d.id && !on[l.id]);
              if (!rows.length) return null;
              const open_ = sect[d.id] !== false;
              return (
                <div key={d.id} style={{ marginTop: 14 }}>
                  <button className="sect" onClick={() => setSect((st) => ({ ...st, [d.id]: !open_ }))}>
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <span className="dot" style={{ background: d.color }} />
                      <span style={{ color: d.color }}>{d.label}</span>
                    </span>
                    <span style={{ opacity: .5 }}>{open_ ? "\u2013" : "+"}</span>
                  </button>
                  {open_ && rows.map((l) => row(l))}
                </div>
              );
            })}

            <div style={{ marginTop: 16, paddingTop: 12, borderTop: light ? "1px solid rgba(8,8,8,.12)" : "1px solid rgba(255,255,255,.1)" }}>
              <div className="grp" style={{ marginBottom: 9 }}>DOMAINS</div>
              {[["OCE4N", C.blue], ["E4RTH", C.green], ["S4PIENS", C.red], ["4CULTURE", C.pink]].map(([n, c]) => (
                <div key={n} className="foot" style={{ display: "flex", alignItems: "center", fontSize: 10, marginTop: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, marginRight: 9 }} />{n}
                </div>
              ))}
            </div>

            {activeLayers.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: light ? "1px solid rgba(8,8,8,.12)" : "1px solid rgba(255,255,255,.1)" }}>
                <div className="grp" style={{ marginBottom: 5 }}>SOURCE FRESHNESS</div>
                {activeLayers.map((l) => (
                  <div key={l.id} className="hrow" style={{ fontSize: 9 }}>
                    <span style={{ opacity: .7 }}>{l.label}</span>
                    <span style={{ color: status[l.id] === "UNAVAILABLE" ? C.red : l.color }}>{status[l.id] || "ON"}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="foot" style={{ marginTop: 14 }}>
              SRC {DOT} OBIS {DOT} GBIF {DOT} USGS {DOT} NASA EONET/GIBS {DOT} iNaturalist {DOT} NOAA {DOT} GFW<br />
              Surfaced &amp; curated by 4PLANET. Data belongs to its sources.
            </div>
            <Link to="/" style={{ display: "inline-block", marginTop: 14, fontSize: 11, letterSpacing: ".1em", color: C.blue, fontWeight: 500 }}>
              {"\u2190"} 4PLANET_
            </Link>
          </>
        )}
      </div>

      {here && (
        <div className="here-panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="grp">WHAT IS HAPPENING HERE</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {Math.abs(here.lat).toFixed(2)}{DEG}{here.lat >= 0 ? "N" : "S"} {DOT} {Math.abs(here.lng).toFixed(2)}{DEG}{here.lng >= 0 ? "E" : "W"}
              </div>
            </div>
            <button className="chip" onClick={() => setHere(null)}>CLOSE</button>
          </div>

          {here.loading ? (
            <div className="foot" style={{ marginTop: 10 }}>{"Reading the sources\u2026"}</div>
          ) : (
            <>
              <div className="hrow"><span>Species records nearby</span><span style={{ color: C.green }}>{here.nSp}</span></div>
              {here.species.length > 0 && <div className="foot" style={{ marginTop: 4 }}>{here.species.join(", ")}</div>}
              <div className="hrow"><span>Cetacean records</span><span style={{ color: C.blue }}>{here.whales}</span></div>
              <div className="hrow"><span>Earthquakes (24h)</span><span style={{ color: C.red }}>{here.quakes}</span></div>
              <div className="hrow"><span>Open events</span><span style={{ color: C.amber }}>{here.events.length}</span></div>
              {here.events.length > 0 && <div className="foot" style={{ marginTop: 4 }}>{here.events.join(", ")}</div>}
              <div className="foot" style={{ marginTop: 10, opacity: .75 }}>
                Nothing here does not mean nothing is here. It means no loaded source reported anything in this window.
                Counts come from the layers currently switched on, plus a live GBIF query.
              </div>
            </>
          )}
        </div>
      )}

      <div ref={boxRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

/* One bad API response should degrade a layer, not the whole Atlas. */
class AtlasBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ position: "fixed", inset: 0, background: C.ink, color: "#fff", fontFamily: MONO,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 13, letterSpacing: ".14em", fontWeight: 700 }}>4PLANET_ ATLAS</div>
          <div style={{ fontSize: 9, letterSpacing: ".14em", marginTop: 4, color: C.blue }}>PLANETARY INTELLIGENCE</div>
          <div style={{ fontSize: 12, marginTop: 20, lineHeight: 1.6 }}>
            The Atlas hit an error and stopped rather than showing you something wrong.
          </div>
          <div style={{ fontSize: 9.5, marginTop: 12, opacity: .5, lineHeight: 1.5 }}>{String(this.state.err)}</div>
          <button onClick={() => window.location.assign("/atlas")}
            style={{ marginTop: 18, background: "transparent", border: `1px solid ${C.blue}`, color: C.blue,
              fontFamily: MONO, fontSize: 11, letterSpacing: ".1em", padding: "7px 12px", cursor: "pointer" }}>
            RELOAD ATLAS
          </button>
          <a href="/" style={{ display: "block", marginTop: 14, fontSize: 11, color: C.blue, letterSpacing: ".1em" }}>
            {"\u2190"} 4PLANET_
          </a>
        </div>
      </div>
    );
  }
}

export default function Atlas() {
  return (
    <AtlasBoundary>
      <AtlasMap />
    </AtlasBoundary>
  );
}
