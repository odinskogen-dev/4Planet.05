import { C, LAYERS, titleCase, esc } from "@/earth/layers";

function isHostedRuntime() {
  if (typeof window === "undefined") return false;
  return window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost";
}

function noaaCoralTileUrl() {
  // NOAA CoastWatch ERDDAP WMS supports CRS:84/EPSG:4326, not MapLibre's
  // EPSG:3857 tile bbox. The Cloudflare allowlisted WMS bridge converts the
  // bounds server-side. This current daily CRW product replaces the stale
  // NOAA_DHW/EPSG:3857 request inherited from the older ATLAS.
  return "/api/atlas-wms?source=noaa-coral-dhw&time=current&width=256&height=256&bbox={bbox-epsg-3857}";
}

async function loadEonet() {
  const endpoint = isHostedRuntime()
    ? "/api/atlas-feed?source=eonet"
    : "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=300";
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`EONET ${response.status}`);
  const payload = await response.json();
  const d = payload?.ok === true && payload?.data ? payload.data : payload;
  if (!Array.isArray(d?.events)) throw new Error("EONET contract mismatch");
  return d.events.map((e: any) => {
    const g = (e.geometry || []).slice(-1)[0];
    if (!g || !Array.isArray(g.coordinates) || typeof g.coordinates[0] !== "number") return null;
    const cat = (e.categories && e.categories[0] && e.categories[0].title) || "Event";
    const col = /storm/i.test(cat) ? C.blue : /ice/i.test(cat) ? C.white : /volcano/i.test(cat) ? C.pink : /fire/i.test(cat) ? C.amber : C.red;
    const kind = /storm/i.test(cat) ? "SEVERE STORM" : /ice/i.test(cat) ? "ICEBERG / SEA ICE"
      : /volcano/i.test(cat) ? "VOLCANIC ACTIVITY" : /fire/i.test(cat) ? "ACTIVE WILDFIRE" : String(cat).toUpperCase();
    return {
      lon: g.coordinates[0], lat: g.coordinates[1], col,
      html: `<b>${esc(kind)}</b><br><span class="lat">${esc(e.title || "")}</span>`,
    };
  }).filter(Boolean);
}

async function loadClimateTrace() {
  const sectors = "power";
  const response = await fetch(`/api/climate-trace?sectors=${sectors}&year=2024&gas=co2e_100yr&limit=1200`);
  if (!response.ok) throw new Error(`Climate TRACE proxy ${response.status}`);
  const d = await response.json();
  if (!d?.ok || !Array.isArray(d.assets) || d.assets.length === 0) {
    // Critical truth rule: a stale/changed contract must never render as "0".
    throw new Error(d?.error || "Climate TRACE empty/contract mismatch");
  }

  const vals = d.assets.map((a: any) => a.co2e).filter((v: any) => Number.isFinite(v) && v > 0);
  const max = vals.length ? Math.max(...vals) : 1;
  return d.assets.map((a: any) => {
    const frac = a.co2e > 0 ? Math.log10(a.co2e + 1) / Math.log10(max + 1) : 0;
    const sectorLabel = String(a.subsector || a.sector || "source").replace(/-/g, " ").toUpperCase();
    const tonnes = Number.isFinite(a.co2e)
      ? `${Math.round(a.co2e).toLocaleString()} t CO₂e${a.year ? ` (${a.year})` : ""}`
      : "CO₂e NOT REPORTED";
    return {
      lon: a.lon,
      lat: a.lat,
      size: 3 + frac * 7,
      html: `<b>${esc(a.name || titleCase(sectorLabel))}</b><br><span class="lat">${esc(sectorLabel)} · ${esc(tonnes)}</span>`,
    };
  });
}

/**
 * Sandbox-only compatibility hardening for the inherited V36/V40 layer model.
 *
 * Besides normalising legacy legend ramps, this repairs verified stale source
 * contracts only inside the isolated ATLAS Data Lab. Production remains on its
 * own branch until promotion review.
 */
export function hardenAtlasLegacyLayerMetadata() {
  let repairedLegends = 0;
  let repairedSources = 0;

  for (const layer of LAYERS as any[]) {
    const legend = layer?.legend;
    if (legend && !Array.isArray(legend.stops) && typeof legend.ramp === "string") {
      const colours = legend.ramp.match(/#[0-9a-fA-F]{3,8}/g) || [];
      if (colours.length >= 2) {
        legend.stops = colours;
        repairedLegends += 1;
      }
    }

    if (layer.id === "events") {
      layer.load = loadEonet;
      layer.note = "Provider-reported natural events currently open in NASA EONET. Hosted ATLAS uses a bounded same-origin proxy with short caching; source failure is never presented as no events.";
      repairedSources += 1;
    }

    if (layer.id === "emissions") {
      layer.label = "CLIM4TE TRACE · POWER 2024";
      layer.color = C.amber;
      layer.src = "Climate TRACE v7";
      layer.note = "Individual emitting power-sector sources from Climate TRACE v7 for 2024, sized by reported/estimated CO₂e_100yr. These are source assets, not live plumes and not proof of legal liability. A source/contract failure is never shown as zero.";
      layer.load = loadClimateTrace;
      repairedSources += 1;
    }

    if (layer.id === "coral") {
      layer.label = "CORAL · HEAT STRESS · LATEST";
      layer.src = "NOAA Coral Reef Watch / CoastWatch ERDDAP";
      layer.note = "Latest available NOAA Coral Reef Watch 5 km Degree Heating Week product. Heat stress is a pressure indicator, not observed bleaching. Hosted ATLAS converts MapLibre EPSG:3857 tile bounds to NOAA's supported CRS:84 through an allowlisted same-origin bridge.";
      layer.tiles = () => noaaCoralTileUrl();
      layer.attr = "NOAA Coral Reef Watch / CoastWatch ERDDAP";
      repairedSources += 1;
    }
  }

  return { repairedLegends, repairedSources };
}
