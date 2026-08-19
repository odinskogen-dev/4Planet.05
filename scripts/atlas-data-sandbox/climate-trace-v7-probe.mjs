import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const BASE = "https://api.climatetrace.org/v7";
const UA = "4PLANET-ATLAS-DATA-SANDBOX/1.0 (+https://4planet.org; non-production contract probe)";
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 15000);

async function getJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": UA },
    signal: controller.signal,
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${url} :: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

function compact(value, depth = 0) {
  if (depth > 3) return typeof value;
  if (Array.isArray(value)) return value.slice(0, 2).map((v) => compact(v, depth + 1));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).slice(0, 30).map(([k, v]) => [k, compact(v, depth + 1)]));
}

try {
  const sectors = await getJson(`${BASE}/definitions/sectors`);
  const url = new URL(`${BASE}/sources`);
  url.searchParams.set("year", "2024");
  url.searchParams.set("gas", "co2e_100yr");
  url.searchParams.set("sectors", "power");
  url.searchParams.set("limit", "5");
  const sources = await getJson(url);
  const rows = Array.isArray(sources) ? sources : (sources?.sources || sources?.data || sources?.results || []);

  const evidence = {
    schemaVersion: 1,
    checkedAt: new Date().toISOString(),
    api: "Climate TRACE v7",
    endpoint: "/v7/sources",
    request: { year: 2024, gas: "co2e_100yr", sectors: "power", limit: 5 },
    sectorDefinitionShape: compact(sectors),
    sourceCount: rows.length,
    firstSourceShape: rows.length ? compact(rows[0]) : null,
    topLevelType: Array.isArray(sources) ? "array" : typeof sources,
    topLevelKeys: sources && !Array.isArray(sources) && typeof sources === "object" ? Object.keys(sources) : [],
  };

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, "climate-trace-v7-contract.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
  if (!rows.length) throw new Error("Climate TRACE v7 /sources returned no power sources for the bounded 2024 probe");
} finally {
  clearTimeout(timer);
}
