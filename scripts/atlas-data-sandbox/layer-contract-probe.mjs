import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const UA = "4PLANET-ATLAS-DATA-SANDBOX/1.0 (+https://4planet.org; layer-contract probe)";
const TIMEOUT = 30000;
const daysAgo = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
const MAPLIBRE_TILE_BBOX_3857 = "0,5009377.085697311,5009377.085697311,10018754.171394622";
const wms3857 = (base, layer, { style = "", time, elevation, version = "1.1.1", bbox = MAPLIBRE_TILE_BBOX_3857 } = {}) => {
  const p = new URLSearchParams({ service: "WMS", request: "GetMap", version, layers: layer, styles: style, format: "image/png", transparent: "true", width: "256", height: "256", bbox });
  p.set(version === "1.3.0" ? "crs" : "srs", "EPSG:3857");
  if (time) p.set("time", time); if (elevation) p.set("elevation", elevation);
  return `${base}?${p}`;
};

const checks = [
  { id: "nasa-blue-marble", label: "Earth · Blue Marble", kind: "image", expected: "OPEN_BASELINE", url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/default/GoogleMapsCompatible_Level8/2/1/2.jpeg" },
  { id: "nasa-truecolor", label: "NASA Earthdata · True colour", kind: "image", expected: "OPEN_BASELINE", url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${daysAgo(2)}/GoogleMapsCompatible_Level9/2/1/2.jpg` },
  { id: "nasa-sst", label: "Ocean · Sea surface temperature", kind: "image", expected: "OPEN_BASELINE", url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GHRSST_L4_MUR_Sea_Surface_Temperature/default/${daysAgo(3)}/GoogleMapsCompatible_Level7/2/1/2.png` },
  { id: "nasa-night", label: "NASA · Night lights", kind: "image", expected: "OPEN_BASELINE", url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/2/1/2.png" },
  { id: "nasa-fires", label: "Active fires / thermal anomalies", kind: "image", expected: "OPEN_BASELINE", url: wms3857("https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi", "MODIS_Terra_Thermal_Anomalies_All", { time: daysAgo(1) }) },
  { id: "nasa-ndvi", label: "Vegetation · NDVI", kind: "image", expected: "OPEN_BASELINE", url: wms3857("https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi", "MODIS_Terra_NDVI_8Day", { time: daysAgo(10) }) },
  { id: "nasa-seaice", label: "Sea ice", kind: "image", expected: "OPEN_BASELINE", url: wms3857("https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi", "AMSRU2_Sea_Ice_Concentration_12km", { time: daysAgo(2) }) },
  { id: "nasa-aerosol", label: "Air · Aerosols", kind: "image", expected: "OPEN_BASELINE", url: wms3857("https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi", "MODIS_Combined_Value_Added_AOD", { time: daysAgo(2) }) },
  { id: "nasa-precip", label: "Precipitation", kind: "image", expected: "OPEN_BASELINE", url: wms3857("https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi", "IMERG_Precipitation_Rate", { time: daysAgo(1) }) },
  { id: "gbif-density", label: "Biodiversity density", kind: "image", expected: "OPEN_BASELINE", url: "https://api.gbif.org/v2/map/occurrence/density/2/2/1@1x.png?srs=EPSG%3A3857&style=green.poly" },
  { id: "obis-whales", label: "WH4LES occurrences", kind: "jsonRows", expected: "OPEN_BASELINE", url: "https://api.obis.org/v3/occurrence?scientificname=Cetacea&hascoordinate=true&size=5", rows: (d) => d?.results },
  { id: "gbif-species", label: "SPECIES occurrences", kind: "jsonRows", expected: "OPEN_BASELINE", url: "https://api.gbif.org/v1/occurrence/search?hasCoordinate=true&taxonKey=44&continent=EUROPE&limit=5", rows: (d) => d?.results },
  { id: "nasa-eonet", label: "Fire + events", kind: "jsonRows", expected: "OPEN_BASELINE", url: "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=5", rows: (d) => d?.events },
  { id: "usgs-quakes", label: "Quakes", kind: "jsonRows", expected: "OPEN_BASELINE", url: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", rows: (d) => d?.features },
  { id: "climate-trace-v7-power", label: "CLIM4TE TRACE · Power 2024", kind: "jsonRows", expected: "OPEN_REPAIRED", url: "https://api.climatetrace.org/v7/sources?year=2024&gas=co2e_100yr&sectors=power&limit=5", rows: (d) => d },
  { id: "emodnet-bathymetry", label: "Ocean · Bathymetry", kind: "image", expected: "OPEN_LAB", url: wms3857("https://ows.emodnet-bathymetry.eu/wms", "emodnet:mean_multicolour", { style: "mean_multicolour", version: "1.3.0" }) },
  { id: "emodnet-habitat", label: "Seabed habitats 2025 · MSFD 800 m", kind: "image", expected: "OPEN_LAB", url: wms3857("https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms", "eusm2025_msfd_800", { style: "eusm2019_msfd_800", version: "1.3.0" }) },
  { id: "emodnet-oxygen", label: "Ocean oxygen climatology · Aug surface", kind: "image", expected: "OPEN_LAB", url: wms3857("https://ec.oceanbrowser.net/emodnet/Python/web/wms", "All_European_Seas/Water_body_dissolved_oxygen_concentration.nc*Water_body_dissolved_oxygen_concentration_L2", { style: "pcolor_flat", time: "08", elevation: "-0.0", version: "1.3.0" }) },
  { id: "emodnet-fishing-density", label: "Fishing vessel density · 2023", kind: "image", expected: "OPEN_LAB", url: wms3857("https://ows.emodnet-humanactivities.eu/wms", "vesseldensity_01avg", { style: "VesselDensity", time: "2023-01-01T00:00:00Z" }) },
  { id: "noaa-coral-dhw", label: "Coral heat stress · latest", kind: "image", expected: "OPEN_REPAIRED", url: "https://coastwatch.noaa.gov/erddap/wms/noaacrwdhwDaily/request?service=WMS&version=1.3.0&request=GetMap&layers=noaacrwdhwDaily%3Adegree_heating_week&styles=&format=image%2Fpng&transparent=true&crs=CRS%3A84&width=512&height=256&time=current&bbox=-180,-35,180,35" },
  { id: "gfw-forest-loss", label: "Forest loss", kind: "image", expected: "OPEN_BASELINE", url: "https://tiles.globalforestwatch.org/umd_tree_cover_loss/v1.11/tcd_30/3/4/3.png" },
  { id: "iss", label: "ISS tracker", kind: "jsonObject", expected: "CONTEXT_ONLY", url: "https://api.wheretheiss.at/v1/satellites/25544" },
];

async function run(check) {
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), TIMEOUT); const started = performance.now();
  try {
    const response = await fetch(check.url, { headers: { accept: check.kind === "image" ? "image/*,*/*;q=0.5" : "application/json,*/*;q=0.5", "user-agent": UA }, signal: controller.signal });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) { const text = (await response.text()).slice(0, 500).replace(/\s+/g, " "); return { ...check, state: "SOURCE_OR_CONTRACT_DOWN", httpStatus: response.status, contentType, errorSnippet: text, durationMs: Math.round(performance.now() - started) }; }
    if (check.kind === "image") { const bytes = await response.arrayBuffer(); const good = contentType.toLowerCase().includes("image") && bytes.byteLength >= 100; const errorSnippet = good ? undefined : new TextDecoder().decode(bytes.slice(0, 500)).replace(/\s+/g, " "); return { ...check, state: good ? "LAYER_CONTRACT_GREEN" : "CONTRACT_MISMATCH", httpStatus: response.status, contentType, bytes: bytes.byteLength, errorSnippet, durationMs: Math.round(performance.now() - started) }; }
    const text = await response.text(); let data;
    try { data = JSON.parse(text); } catch { return { ...check, state: "CONTRACT_MISMATCH", httpStatus: response.status, contentType, errorSnippet: text.slice(0, 500).replace(/\s+/g, " "), durationMs: Math.round(performance.now() - started) }; }
    if (check.kind === "jsonRows") { const rows = check.rows(data); const count = Array.isArray(rows) ? rows.length : -1; return { ...check, state: count > 0 ? "LAYER_CONTRACT_GREEN" : "EMPTY_OR_CONTRACT_MISMATCH", httpStatus: response.status, contentType, count, durationMs: Math.round(performance.now() - started) }; }
    return { ...check, state: data && typeof data === "object" ? "LAYER_CONTRACT_GREEN" : "CONTRACT_MISMATCH", httpStatus: response.status, contentType, durationMs: Math.round(performance.now() - started) };
  } catch (error) { return { ...check, state: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_OR_TLS_ERROR", httpStatus: null, error: String(error?.message || error), durationMs: Math.round(performance.now() - started) }; }
  finally { clearTimeout(timer); }
}

const results = [];
for (const check of checks) { const result = await run(check); results.push(result); console.log(`${result.state.padEnd(28)} ${result.id.padEnd(31)} ${String(result.httpStatus ?? "-").padStart(3)} ${String(result.durationMs).padStart(6)}ms${result.errorSnippet ? ` :: ${result.errorSnippet.slice(0, 180)}` : ""}`); }
const counts = Object.fromEntries([...new Set(results.map((r) => r.state))].sort().map((state) => [state, results.filter((r) => r.state === state).length]));
const clean = results.map(({ rows, url, ...result }) => ({ ...result, url: new URL(url).origin + new URL(url).pathname }));
const report = { schemaVersion: 7, generatedAt: new Date().toISOString(), commitSha: process.env.GITHUB_SHA || null, counts, results: clean, note: "For seabed habitat, this exact contract is paired with the pixel-aware habitat candidate probe. Byte-level image transport alone is not sufficient MAP evidence." };
const md = ["# ATLAS DATA LAB — EXACT LAYER CONTRACT REPORT", "", `Generated: ${report.generatedAt}`, `Commit: ${report.commitSha || "local"}`, "", "This checks concrete tile/record requests shaped like ATLAS requests, not only the provider homepage/API root. LAYER_CONTRACT_GREEN still requires browser-visible proof before MAP_GREEN. Seabed habitat additionally requires non-transparent pixel evidence from the pixel-aware candidate probe.", "", "| Layer | Contract | HTTP | Evidence |", "|---|---|---:|---|", ...clean.map((r) => `| ${r.label} | ${r.state} | ${r.httpStatus ?? "—"} | ${r.bytes ? `${r.bytes} image bytes` : Number.isFinite(r.count) ? `${r.count} records` : r.errorSnippet || r.contentType || "—"} |`), "", "## Counts", ...Object.entries(counts).map(([state, count]) => `- ${state}: ${count}`), ""].join("\n");
await fs.mkdir(OUT_DIR, { recursive: true }); await fs.writeFile(path.join(OUT_DIR, "layer-contract-report.json"), JSON.stringify(report, null, 2) + "\n"); await fs.writeFile(path.join(OUT_DIR, "layer-contract-report.md"), md); console.log("\n" + md);
const blockers = results.filter((result) => String(result.expected).startsWith("OPEN_") && result.state !== "LAYER_CONTRACT_GREEN");
if (blockers.length) throw new Error(`Open ATLAS layer contract gate failed: ${blockers.map((b) => `${b.id}:${b.state}`).join(", ")}`);
