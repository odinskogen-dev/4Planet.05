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
import { UNESCO_DATASETS, fetchUnescoDataset, normaliseUnescoAtlasRecord } from "../data/unescoOpenData";

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

export const gbifLicenceClass = (value) => {
  const licence = String(value ?? "").trim();
  if (!licence) return "REVIEW_REQUIRED";

  try {
    const url = new URL(licence);
    const officialHost = url.hostname === "creativecommons.org" || url.hostname === "www.creativecommons.org";
    const path = url.pathname.toLowerCase().replace(/\/+$/, "");
    if (!officialHost || !["https:", "http:"].includes(url.protocol)) return "REVIEW_REQUIRED";
    if (/^\/publicdomain\/zero\/\d+(?:\.\d+)?(?:\/legalcode)?$/.test(path)) return "OPEN_CC0";
    if (/^\/licenses\/by\/\d+(?:\.\d+)?(?:\/legalcode)?$/.test(path)) return "OPEN_ATTRIBUTION";
    return "REVIEW_REQUIRED";
  } catch {
    // Non-URL values must match a small explicit token allow-list below.
  }

  const normalised = licence.toUpperCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (/\b(?:NOT|NO|NON)\b/.test(normalised)) return "REVIEW_REQUIRED";
  if (/^(?:CC0|CC ZERO)(?: \d+(?:\.\d+)?)?$/.test(normalised) || normalised === "PUBLIC DOMAIN") return "OPEN_CC0";
  if (/^CC BY(?: \d+(?:\.\d+)?)?$/.test(normalised)) return "OPEN_ATTRIBUTION";
  return "REVIEW_REQUIRED";
};

export const safeHttpHref = (value) => {
  try {
    const url = new URL(String(value ?? "").trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
};

const STRICT_DECIMAL = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

export const strictCoordinateNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || !STRICT_DECIMAL.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const obisOccurrencePoint = (record, retrievedAt = "") => {
  const occurrenceStatus = String(record?.occurrenceStatus ?? "").trim().toUpperCase();
  if (occurrenceStatus !== "PRESENT") return null;
  const lat = strictCoordinateNumber(record?.latitude);
  const lon = strictCoordinateNumber(record?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  if (!["OPEN_CC0", "OPEN_ATTRIBUTION"].includes(String(record?.licenceClass ?? ""))) return null;
  if (Array.isArray(record?.licenceRestrictions) && record.licenceRestrictions.length > 0) return null;
  if (record?.locationSensitive === true || String(record?.informationWithheld ?? "").trim() || String(record?.dataGeneralizations ?? "").trim()) return null;

  const rawUncertainty = record?.coordinateUncertaintyM;
  const parsedUncertainty = rawUncertainty === null || rawUncertainty === undefined || rawUncertainty === "" ? null : Number(rawUncertainty);
  return {
    lon,
    lat,
    occurrenceStatus,
    scientificName: String(record?.scientificName ?? "Cetacea").trim() || "Cetacea",
    eventDate: String(record?.eventDate ?? "").trim(),
    coordinateUncertaintyM: Number.isFinite(parsedUncertainty) && parsedUncertainty >= 0 ? parsedUncertainty : null,
    datasetName: String(record?.datasetName ?? record?.datasetId ?? "").trim(),
    datasetCitation: String(record?.datasetCitation ?? "").trim(),
    datasetDoi: String(record?.datasetDoi ?? "").trim(),
    datasetUrl: safeHttpHref(record?.datasetUrl),
    sourceRecordUrl: safeHttpHref(record?.sourceRecordUrl),
    provider: String(record?.provider ?? record?.institutionCode ?? record?.collectionCode ?? "").trim(),
    licence: String(record?.licence ?? "").trim(),
    licenceClass: String(record?.licenceClass ?? "").trim(),
    occurrenceId: String(record?.occurrenceId ?? "").trim(),
    retrievedAt: String(retrievedAt ?? "").trim(),
  };
};

export const gbifOccurrencePoint = (record, retrievedAt = new Date().toISOString()) => {
  const lat = strictCoordinateNumber(record?.decimalLatitude);
  const lon = strictCoordinateNumber(record?.decimalLongitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  const occurrenceStatus = String(record?.occurrenceStatus ?? "").trim().toUpperCase();
  if (occurrenceStatus !== "PRESENT") return null;

  const issues = Array.isArray(record?.issues) ? record.issues.map((issue) => String(issue)) : [];
  const hasCoordinateIssue = record?.hasGeospatialIssues === true || issues.some((issue) => /COORDINATE|GEOSPATIAL|COUNTRY_COORDINATE/.test(issue));
  if (hasCoordinateIssue) return null;

  const licenceClass = gbifLicenceClass(record?.license ?? record?.licence);
  if (!["OPEN_CC0", "OPEN_ATTRIBUTION"].includes(licenceClass)) return null;

  const rawUncertainty = record?.coordinateUncertaintyInMeters;
  const parsedUncertainty = rawUncertainty === null || rawUncertainty === undefined || rawUncertainty === ""
    ? null : Number(rawUncertainty);
  const coordinateUncertaintyM = Number.isFinite(parsedUncertainty) && parsedUncertainty >= 0 ? parsedUncertainty : null;
  const datasetIdentifier = String(record?.datasetKey ?? record?.datasetID ?? "").trim();
  const candidateDoi = String(record?.datasetID ?? "").trim();
  const datasetDoi = /^10\.\d{4,9}\//i.test(candidateDoi) ? candidateDoi : "";

  return {
    lon, lat, occurrenceStatus, coordinateUncertaintyM,
    geospatialState: record?.hasGeospatialIssues === false ? "NO KNOWN GEOSPATIAL ISSUE" : "GEOSPATIAL QUALITY UNKNOWN",
    eventDate: String(record?.eventDate ?? "").trim(),
    retrievedAt,
    licence: String(record?.license ?? record?.licence ?? "").trim(),
    licenceClass,
    datasetTitle: String(record?.datasetTitle ?? record?.datasetName ?? "").trim(),
    datasetIdentifier,
    datasetDoi,
    occurrenceId: String(record?.occurrenceID ?? record?.key ?? "").trim(),
    gbifKey: String(record?.key ?? "").trim(),
    speciesKey: String(record?.speciesKey ?? "").trim(),
    scientificName: String(record?.scientificName ?? record?.species ?? "Unidentified").trim(),
  };
};
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

const formatCount = (value) => Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-GB") : "UNKNOWN";
const formatPct = (value) => Number.isFinite(Number(value)) ? `${(Number(value) * 100).toFixed(1)}%` : "UNKNOWN";

const unescoAtlasRows = async (datasetId) => {
  const response = await fetchUnescoDataset(datasetId);
  const metadata = UNESCO_DATASETS[datasetId];
  return response.records
    .map((record) => normaliseUnescoAtlasRecord(datasetId, record))
    .filter(Boolean)
    .map((record) => {
      const sourceHref = safeHttpHref(record.sourceUrl);
      const sourceLink = sourceHref ? `<a class="pl" href="${esc(sourceHref)}" target="_blank" rel="noopener">Open source ↗</a>` : "";
      const licenceLink = `<a class="pl" href="${metadata.rights.licenceUrl}" target="_blank" rel="noopener">CC BY-SA 4.0 ↗</a>`;
      const referenceHref = safeHttpHref(metadata.edition?.referenceUrl);
      const referenceLink = referenceHref ? `<a class="pl" href="${esc(referenceHref)}" target="_blank" rel="noopener">Current UNESCO list ↗</a>` : "";
      let detail = "";
      if (record.kind === "OCEAN_BIODIVERSITY_AREA") {
        const m = record.metrics || {};
        detail = `<span class="lat">${esc(record.category || "OCEAN AREA")}</span><br><span class="lat">${formatCount(m.species)} recorded species · ${formatCount(m.observations)} occurrence records</span><br><span class="lat">${formatCount(m.datasets)} contributing datasets · threatened share ${formatPct(m.threatenedShare)}</span><br><span class="lat">record span ${esc(m.firstYear || "UNKNOWN")}–${esc(m.lastYear || "UNKNOWN")}</span>`;
      } else if (record.kind === "GLOBAL_GEOPARK" && metadata.edition) {
        const retrievedDate = String(response.retrievedAt || "").slice(0, 10) || "UNKNOWN";
        detail = `<span class="lat">UNESCO GLOBAL GEOPARK · designation record ${esc(record.date || "UNKNOWN")}</span><br><span class="lat">legal protection UNKNOWN · revalidation status UNKNOWN · ecological outcome UNKNOWN</span><br><span class="lat">DataHub eg0001 records retrieved ${esc(retrievedDate)} · description ${esc(metadata.edition.datasetDescriptionAsOf)} (stale)</span><br><span class="lat">${esc(metadata.edition.referenceCountSummary)} · official list updated ${esc(metadata.edition.referenceUpdatedAt)} · mixed edition</span><br>`;
      } else {
        const context = [record.country || record.iso2 || "", record.category || "", record.date || ""].filter(Boolean).join(" · ");
        detail = context ? `<span class="lat">${esc(context)}</span>` : "";
      }
      return {
        lon: record.lon,
        lat: record.lat,
        html: `<b>${esc(record.title)}</b><br>${detail}${sourceLink}${referenceLink}${licenceLink}`,
      };
    });
};

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

  { id: "unesco-biospheres", dom: "E4RTH", group: "PLACES", kind: "point", domain: ["PLANET", "E4RTH", "OCE4N"],
    label: "BIOSPHERE RESERVES", color: C.green, src: "UNESCO / MAB", r: 4,
    note: "UNESCO Man and the Biosphere designation records. Points are source-provided representative coordinates — not reserve boundaries or proof of current ecosystem health.",
    rights: "CC BY-SA 4.0 · attribution + ShareAlike", period: "Designation / source-record dates",
    load: async () => unescoAtlasRows("mab001") },
  { id: "unesco-world-heritage", dom: "PLANET", group: "PLACES", kind: "point", domain: ["PLANET", "E4RTH", "OCE4N", "S4PIENS"],
    label: "WORLD HERITAGE", color: C.amber, src: "UNESCO World Heritage", r: 4,
    note: "UNESCO World Heritage sites. A designation is not a measure of present ecological or cultural condition; the source point is not the full site boundary.",
    rights: "CC BY-SA 4.0 · attribution + ShareAlike", period: "Inscription / annual list state",
    load: async () => unescoAtlasRows("whc001") },
  { id: "unesco-geoparks", dom: "E4RTH", group: "PLACES", kind: "point", domain: ["PLANET", "E4RTH", "S4PIENS"],
    label: "GLOBAL GEOPARKS", color: C.pink, src: "UNESCO Global Geoparks", r: 4,
    note: "UNESCO Global Geopark designation records. Points are representative coordinates, not boundaries. Legal protection, current revalidation status and ecological outcome remain UNKNOWN unless separately sourced; mixed source editions are shown in each record.",
    rights: "CC BY-SA 4.0 · attribution + ShareAlike", period: "Designation records · mixed edition visible",
    load: async () => unescoAtlasRows("eg0001") },
  { id: "unesco-ocean-biodiversity", dom: "OCE4N", group: "LIFE", kind: "point", domain: ["PLANET", "OCE4N", "S4PIENS"],
    label: "OCEAN BIODIVERSITY AREAS", color: C.blue, src: "IOC-UNESCO / OBIS", r: 5,
    note: "Area-level OBIS biodiversity summaries for EEZ, high-seas/ABNJ and EBSA areas. Counts reflect occurrence records and sampling effort — not abundance, complete richness, range or live positions. Points are representative area coordinates, not boundaries.",
    rights: "CC BY-SA 4.0 · attribution + ShareAlike", period: "Historical record span per area",
    load: async () => unescoAtlasRows("ioc001") },

  { id: "biodiv", dom: "E4RTH", group: "LIFE", kind: "raster", domain: ["PLANET", "E4RTH", "OCE4N"],
    label: "BIODIVERSITY DENSITY", color: C.green, src: "GBIF", opacity: 0.85, maxzoom: 14, xyz: true,
    note: "Every biodiversity record GBIF holds \u2014 well over a billion \u2014 drawn as density. Bright means heavily recorded, not necessarily most alive: this map shows where people have looked.",
    legend: { ramp: "linear-gradient(90deg,#0b2a1a,#1f7a45,#3AE86F,#C8FF6B,#ffffff)", lo: "FEW RECORDS", hi: "MANY", sub: "GBIF occurrence density" },
    tiles: () => "https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}@1x.png?srs=EPSG%3A3857&style=green.poly",
    attr: "GBIF occurrence density" },
  { id: "whales", dom: "OCE4N", group: "LIFE", kind: "point", domain: ["PLANET", "OCE4N"],
    label: "WH4LES", color: C.blue, src: "OBIS", r: 4,
    note: "Recorded cetacean occurrences from original datasets indexed by OBIS. These are not live positions, migration routes, abundance or range; original dataset rights still apply.",
    load: async () => {
      const response = await fetch("/api/obis?scientificName=Cetacea&size=200");
      if (!response.ok) throw new Error(`OBIS_BRIDGE_${response.status}`);
      const payload = await response.json();
      if (!payload?.ok || !Array.isArray(payload.records) || !payload.retrievedAt) throw new Error("OBIS_CONTRACT_MISMATCH");
      return payload.records.map((record) => obisOccurrencePoint(record, payload.retrievedAt)).filter(Boolean).map((point) => {
        const eventDate = point.eventDate || "UNKNOWN";
        const uncertainty = point.coordinateUncertaintyM === null ? "UNKNOWN" : `${Math.round(point.coordinateUncertaintyM)} m`;
        const dataset = point.datasetName || "UNKNOWN";
        const citation = point.datasetCitation || "UNKNOWN";
        const provider = point.provider || "UNKNOWN";
        const doiHref = /^10\.\d{4,9}\//i.test(point.datasetDoi)
          ? `https://doi.org/${encodeURIComponent(point.datasetDoi)}`
          : "";
        const doiLink = doiHref ? `<a class="pl" href="${doiHref}" target="_blank" rel="noopener">Dataset DOI ↗</a>` : "";
        const datasetLink = point.datasetUrl ? `<a class="pl" href="${esc(point.datasetUrl)}" target="_blank" rel="noopener">Original dataset ↗</a>` : "";
        const occurrenceLink = point.sourceRecordUrl ? `<a class="pl" href="${esc(point.sourceRecordUrl)}" target="_blank" rel="noopener">Original occurrence ↗</a>` : "";
        return {
          lon: point.lon, lat: point.lat, occurrenceId: point.occurrenceId,
          html: `<b class="nm">${esc(point.scientificName)}</b><br><span class="lat">OBIS-INDEXED OCCURRENCE · NOT A LIVE POSITION</span><div class="when">EVENT · ${esc(eventDate)}</div><br><span class="lat">COORDINATE UNCERTAINTY · ${esc(uncertainty)}</span><br><span class="lat">DATASET · ${esc(dataset)}</span><br><span class="lat">PROVIDER · ${esc(provider)}</span><br><span class="lat">CITATION · ${esc(citation)}</span><br><span class="lat">ORIGINAL RIGHTS · ${esc(point.licence || "UNKNOWN")} · ${esc(point.licenceClass)}</span><br><span class="lat">RETRIEVED · ${esc(point.retrievedAt)}</span><br><span class="lat">RIGHTS BOUNDARY · OBIS DERIVED PRODUCTS MAY BE CC0; ORIGINAL DATASET RIGHTS STILL APPLY</span><a class="pl" href="https://obis.org" target="_blank" rel="noopener">OBIS source ↗</a>${doiLink}${datasetLink}${occurrenceLink}`
        };
      });
    } },
  { id: "species", dom: "E4RTH", group: "LIFE", kind: "point", domain: ["PLANET", "E4RTH"],
    label: "SPECIES", color: C.green, src: "GBIF", r: 3,
    note: "Chordate occurrence records reported as PRESENT, sampled across continents. A point is a source record — not a live position, abundance estimate or species range. Absence of dots is not absence of life.",
    load: async () => {
      const conts = ["EUROPE", "NORTH_AMERICA", "SOUTH_AMERICA", "AFRICA", "ASIA", "OCEANIA"];
      const retrievedAt = new Date().toISOString();
      const parts = await Promise.all(conts.map(async (continent) => {
        const response = await fetch(
          `https://api.gbif.org/v1/occurrence/search?hasCoordinate=true&hasGeospatialIssue=false&occurrenceStatus=PRESENT&taxonKey=44&continent=${continent}&limit=150`
        );
        if (!response.ok) throw new Error(`GBIF_UPSTREAM_${response.status}`);
        const payload = await response.json();
        if (!payload || !Array.isArray(payload.results)) throw new Error("GBIF_CONTRACT_MISMATCH");
        return payload.results;
      }));
      return parts.flat().map((record) => gbifOccurrencePoint(record, retrievedAt)).filter(Boolean).map((point) => {
        const occurrenceLink = point.gbifKey
          ? `<a class="pl" href="https://www.gbif.org/occurrence/${encodeURIComponent(point.gbifKey)}" target="_blank" rel="noopener">Open GBIF record \u2197</a>`
          : "";
        const datasetLink = point.datasetIdentifier
          ? `<a class="pl" href="https://www.gbif.org/dataset/${encodeURIComponent(point.datasetIdentifier)}" target="_blank" rel="noopener">Original dataset \u2197</a>`
          : "";
        const uncertainty = point.coordinateUncertaintyM === null ? "UNKNOWN" : `${Math.round(point.coordinateUncertaintyM)} m`;
        const eventDate = point.eventDate || "UNKNOWN";
        const dataset = point.datasetTitle || point.datasetIdentifier || "UNKNOWN";
        const doi = point.datasetDoi || "UNKNOWN";
        return {
          lon: point.lon, lat: point.lat, sppKey: point.speciesKey,
          html: `<b class="nm">${esc(point.scientificName)}</b><br><span class="lat">REPORTED PRESENT · CHORDATA</span><div class="when">EVENT · ${esc(eventDate)}</div><br><span class="lat">COORDINATE UNCERTAINTY · ${esc(uncertainty)} · ${esc(point.geospatialState)}</span><br><span class="lat">DATASET · ${esc(dataset)}</span><br><span class="lat">DOI · ${esc(doi)}</span><br><span class="lat">LICENCE · ${esc(point.licence || "UNKNOWN")} · ${esc(point.licenceClass)}</span><br><span class="lat">RETRIEVED · ${esc(point.retrievedAt)}</span>${occurrenceLink}${datasetLink}`
        };
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
        const sourceId = a.sourceId ?? a.id ?? "UNKNOWN";
        return { lon: a.lon, lat: a.lat, size: 3 + frac * 7,
          html: `<b>${esc(a.name || sectorLabel)}</b><br><span class="lat">${esc(sectorLabel)} ${DOT} ${esc(tonnes)}</span><br><span class="lat">CLIMATE TRACE SOURCE ${esc(sourceId)}</span>` };
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
