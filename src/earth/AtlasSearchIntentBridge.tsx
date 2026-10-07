import { LAYERS } from "./layers";
import { repairAtlasLayerRegistry } from "./atlasRuntimeRepairs";

repairAtlasLayerRegistry();

export type AtlasLayerIntent = {
  layerId: string;
  label: string;
  source: string;
  aliases: string[];
};

const INTENTS: AtlasLayerIntent[] = [
  { layerId: "fires", label: "ACTIVE FIRES", source: "NASA GIBS / MODIS + FIRMS DETAIL", aliases: ["fire", "fires", "wildfire", "wildfires", "active fires", "thermal anomalies", "fire detections"] },
  { layerId: "events", label: "FIRE + EVENTS", source: "NASA EONET", aliases: ["natural events", "events", "storms", "volcanoes", "open events"] },
  { layerId: "quakes", label: "EARTHQUAKES", source: "USGS", aliases: ["earthquake", "earthquakes", "quake", "quakes", "seismic"] },
  { layerId: "forest", label: "FOREST LOSS", source: "Global Forest Watch / UMD", aliases: ["forest loss", "deforestation", "tree cover loss", "forest change"] },
  { layerId: "emissions", label: "CLIMATE TRACE", source: "Climate TRACE", aliases: ["emissions", "climate trace", "greenhouse gas", "greenhouse gases", "co2 emissions", "industrial emissions", "power plant emissions", "power plants", "methane", "climate pollution"] },
  { layerId: "emodnet-bathymetry", label: "OCEAN · BATHYMETRY", source: "EMOdnet Bathymetry", aliases: ["bathymetry", "ocean depth", "seabed depth", "sea floor", "seafloor"] },
  { layerId: "emodnet-seabed-habitats", label: "SEABED · HABITATS 2025", source: "EMOdnet Seabed Habitats", aliases: ["seabed habitat", "seabed habitats", "benthic habitat", "benthic habitats", "euseamap"] },
  { layerId: "emodnet-dissolved-oxygen-climatology", label: "OCEAN · OXYGEN CLIMATOLOGY", source: "EMOdnet Chemistry", aliases: ["dissolved oxygen", "ocean oxygen", "oxygen climatology", "marine oxygen"] },
  { layerId: "emodnet-fishing-vessel-density", label: "FISHING · VESSEL DENSITY", source: "EMOdnet Human Activities", aliases: ["fishing vessels", "fishing vessel density", "vessel density", "fishing density", "fishing activity"] },
  { layerId: "coral", label: "CORAL HEAT STRESS", source: "NOAA Coral Reef Watch", aliases: ["coral heat", "coral heat stress", "coral reef heat", "coral bleaching risk", "coral bleaching"] },
  { layerId: "sst", label: "OCEAN · SEA SURFACE TEMP", source: "NASA GIBS / GHRSST", aliases: ["sea surface temperature", "ocean temperature", "sst", "marine heat", "ocean heat"] },
  { layerId: "seaice", label: "SEA ICE", source: "NASA GIBS / AMSRU2", aliases: ["sea ice", "arctic ice", "polar ice"] },
  { layerId: "ndvi", label: "VEGETATION · NDVI", source: "NASA GIBS / MODIS", aliases: ["vegetation", "ndvi", "plant cover", "greenness"] },
  { layerId: "aerosol", label: "AIR · AEROSOLS", source: "NASA GIBS / MODIS", aliases: ["aerosols", "aerosol", "smoke", "dust", "air pollution"] },
  { layerId: "precip", label: "PRECIPITATION", source: "NASA GIBS / IMERG", aliases: ["precipitation", "rain", "rainfall", "snowfall"] },
  { layerId: "night", label: "NASA · NIGHT LIGHTS", source: "NASA GIBS / Black Marble", aliases: ["night lights", "city lights", "light footprint"] },
  { layerId: "biodiv", label: "BIODIVERSITY DENSITY", source: "GBIF", aliases: ["biodiversity", "biodiversity density", "species density", "life density"] },
  { layerId: "whales", label: "WH4LES", source: "OBIS", aliases: ["whale records", "whales", "cetaceans", "cetacean records", "dolphin records"] },
  { layerId: "species", label: "SPECIES", source: "GBIF + iNaturalist depth", aliases: ["species observations", "species records", "occurrence records", "biodiversity records", "observations"] },
];

const norm = (value: string) => value.trim().toLowerCase().replace(/[\s_-]+/g, " ");

function editDistance(a: string, b: string) {
  const aa = norm(a);
  const bb = norm(b);
  if (aa === bb) return 0;
  if (!aa.length) return bb.length;
  if (!bb.length) return aa.length;
  const previous = Array.from({ length: bb.length + 1 }, (_, index) => index);
  for (let i = 1; i <= aa.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= bb.length; j += 1) {
      const above = previous[j];
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + cost);
      diagonal = above;
    }
  }
  return previous[bb.length];
}

function fuzzyScore(query: string, alias: string) {
  const q = norm(query);
  const a = norm(alias);
  // Fuzzy matching is intentionally conservative. It only catches ordinary
  // human typos once enough characters exist to avoid broad accidental matches.
  if (q.length < 5 || a.length < 5) return 0;
  const maxDistance = Math.max(q.length, a.length) >= 10 ? 2 : 1;
  const distance = editDistance(q, a);
  return distance <= maxDistance ? 80 - distance * 10 : 0;
}

export function atlasLayerIntentMatches(query: string): AtlasLayerIntent[] {
  const q = norm(query);
  if (q.length < 2) return [];
  const available = new Set(LAYERS.map((layer) => layer.id));
  return INTENTS
    .filter((intent) => available.has(intent.layerId))
    .map((intent) => {
      const exact = intent.aliases.some((alias) => norm(alias) === q);
      const prefix = intent.aliases.some((alias) => norm(alias).startsWith(q) || q.startsWith(norm(alias)));
      const contains = intent.aliases.some((alias) => norm(alias).includes(q) || q.includes(norm(alias)));
      const fuzzy = Math.max(0, ...intent.aliases.map((alias) => fuzzyScore(q, alias)));
      return { intent, score: exact ? 300 : prefix ? 200 : contains ? 100 : fuzzy };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.intent.label.localeCompare(b.intent.label))
    .slice(0, 4)
    .map((row) => row.intent);
}

function activateLayer(layerId: string) {
  const url = new URL(window.location.href);
  const explicit = (url.searchParams.get("l") || "").split(",").filter(Boolean);
  const active = new Set(explicit.length ? explicit : ["bluemarble"]);
  active.add(layerId);
  url.searchParams.set("l", Array.from(active).join(","));
  window.location.assign(url.toString());
}

function makeIntentRow(intent: AtlasLayerIntent) {
  const row = document.createElement("div");
  row.className = "ritem atlas-intent-result";
  row.setAttribute("role", "option");
  row.tabIndex = 0;
  row.dataset.atlasIntentLayer = intent.layerId;
  row.dataset.atlasIntentBridge = "result";

  const dot = document.createElement("span");
  dot.className = "rdot";
  dot.style.background = "#2E2EFF";

  const main = document.createElement("span");
  main.className = "rmain";
  const name = document.createElement("span");
  name.className = "rname";
  name.textContent = intent.label;
  const sub = document.createElement("div");
  sub.className = "rsub";
  sub.textContent = `DATA LAYER · ${intent.source}`;
  main.append(name, sub);
  row.append(dot, main);

  const open = () => activateLayer(intent.layerId);
  row.addEventListener("click", open);
  row.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  });
  return row;
}
