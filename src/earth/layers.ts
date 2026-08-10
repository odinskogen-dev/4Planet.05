/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — EARTH — LAYER SYSTEM
   PRESERVED FROM V36 (Atlas.tsx). VERBATIM.
   ───────────────────────────────────────────────────────────────────────────
   This file is a straight extraction of V36's layer model. Not one layer, note,
   legend ramp, opacity default, maxzoom, stacking rule or source attribution
   has been altered. The Mandate says: "Do not regress valuable existing
   capability." The layer console IS the valuable existing capability, and the
   notes attached to each layer are some of the most honest writing in the
   codebase ("A detection is heat, not proof of wildfire").

   It was moved out of the page component for one reason only: NOW, WATCH, PLACE
   and CONTEXT all need to read the layer model, and a 1,000-line page component
   could not be shared. Moving it changed nothing about what it says.
   ═══════════════════════════════════════════════════════════════════════════ */
/* eslint-disable */
// @ts-nocheck

export const MONO = "'Fragment Mono', ui-monospace, monospace";
export const C = {
  ink: "#080808", blue: "#2E2EFF", green: "#3AE86F",
  red: "#FF4D22", pink: "#FF5ACD", amber: "#FF7D50", white: "#FFFFFF",
};
export const DOT = "\u00B7";
export const DEG = "\u00B0";
export const ARROW = "\u2192";

export const titleCase = (s) => String(s ?? "").replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const stamp = () => new Date().toISOString().slice(11, 16) + "Z";
export const daysAgo = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().split("T")[0]; };
export const wms = (layer, time) =>
  "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi?service=WMS&request=GetMap&version=1.1.1" +
  `&layers=${layer}&styles=&format=image%2Fpng&transparent=true&srs=EPSG%3A3857` +
  (time ? `&time=${time}` : "") + "&width=256&height=256&bbox={bbox-epsg-3857}";
export const gibs = (layer, time, level, ext = "jpg") =>
  `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${time}/GoogleMapsCompatible_Level${level}/{z}/{y}/{x}.${ext}`;


/* ── day/night terminator — computed from the sun's position, no data source ── */
const RAD = Math.PI / 180;
export const nightPolygon = (date = new Date()) => {
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

export const inatPhoto = async (sci) => {
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

export const MODES = [
  { id: "PLANET", label: "PLANET", color: C.white, blurb: "Planetary signals from trusted public sources." },
  { id: "OCE4N", label: "OCE4N", color: C.blue, blurb: "Marine life, ocean signals and pressure." },
  { id: "E4RTH", label: "E4RTH", color: C.green, blurb: "Land, life and terrestrial change." },
  { id: "S4PIENS", label: "S4PIENS", color: C.red, blurb: "Human systems written across the planet." },
];

/* raster stacking order, bottom → top. Points always sit above all of these. */
export const RASTER_ORDER = ["bluemarble", "truecolor", "ndvi", "forest", "seaice", "coral", "precip", "sst", "aerosol", "night", "fires", "biodiv"];
/* the panel groups by DOMAIN — where a signal actually belongs.
   It does not burn at sea (fires = E4RTH); there is no sea temperature on land (SST = OCE4N). */
export const DOMAINS = [
  { id: "PLANET",  label: "PLANET",  color: C.white },
  { id: "OCE4N",   label: "OCE4N",   color: C.blue },
  { id: "E4RTH",   label: "E4RTH",   color: C.green },
  { id: "S4PIENS", label: "S4PIENS", color: C.red },
];

export const LAYERS = [
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
  { id: "emissions", dom: "S4PIENS", group: "SIGNALS", kind: "point", domain: ["PLANET", "S4PIENS", "E4RTH"],
    label: "CLIM4TE TRACE", color: C.orange, src: "Climate TRACE", r: 4,
    note: "Facility-level greenhouse-gas emissions from Climate TRACE \\u2014 power plants, oil & gas and other energy/industrial assets, located and sized by CO\\u2082e. These are modelled/measured source assets, not live plumes. Larger circles mean higher reported emissions.",
    legend: { ramp: "linear-gradient(90deg,#FF7D50,#FF5023,#842810)", lo: "LOWER", hi: "HIGHER CO\\u2082e", sub: "Climate TRACE asset emissions" },
    load: async () => {
      // Energy-relevant sectors first; proxied via /api/climate-trace (CORS-safe).
      const sectors = "electricity-generation,oil-and-gas-production-and-transport,oil-and-gas-refining,coal-mining";
      const r = await fetch(`/api/climate-trace?sectors=${encodeURIComponent(sectors)}&limit=1200`);
      const d = await r.json();
      if (!d || !d.ok || !Array.isArray(d.assets)) throw new Error("climate-trace unavailable");
      // Size by emissions on a gentle log scale so a few giants don't drown the rest.
      const vals = d.assets.map((a) => a.co2e).filter((v) => Number.isFinite(v) && v > 0);
      const max = vals.length ? Math.max(...vals) : 1;
      return d.assets.map((a) => {
        const frac = a.co2e > 0 ? Math.log10(a.co2e + 1) / Math.log10(max + 1) : 0;
        const sectorLabel = String(a.sector || "asset").replace(/-/g, " ").toUpperCase();
        const tonnes = Number.isFinite(a.co2e) ? `${Math.round(a.co2e).toLocaleString()} t CO\\u2082e${a.year ? ` (${a.year})` : ""}` : "CO\\u2082e NOT REPORTED";
        return { lon: a.lon, lat: a.lat, size: 3 + frac * 7,
          html: `<b>${esc(a.name || sectorLabel)}</b><br><span class="lat">${esc(sectorLabel)} ${DOT} ${esc(tonnes)}</span>` };
      });
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

export const BASE = {
  dark: "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
  light: "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
};
export const LABELS = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

export const makeStyle = (light) => ({
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
