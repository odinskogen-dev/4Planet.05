import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const BASES = [
  "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/ows",
  "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms",
];
const BBOX = "0,5009377.085697311,5009377.085697311,10018754.171394622";
const candidates = [
  ["2025-800", "eusm2025_eunis2019_800", "eusm2021_eunis2019_l2_800"],
  ["2025-400", "eusm2025_eunis2019_400", "eusm2021_eunis2019_l2_400"],
  ["2025-200", "eusm2025_eunis2019_200", "eusm2021_eunis2019_l2_200"],
  ["2025-full", "eusm2025_eunis2019_full", "eusm2021_eunis2019_l2_fulldetail"],
  ["2023-group", "eusm2023_eunis2019_group", "default-style-eusm2023_eunis2019_group"],
];

const rows = [];
for (const base of BASES) {
  for (const [id, layer, style] of candidates) {
    const p = new URLSearchParams({
      SERVICE: "WMS", REQUEST: "GetMap", VERSION: "1.3.0",
      LAYERS: layer, STYLES: style, FORMAT: "image/png", TRANSPARENT: "true",
      CRS: "EPSG:3857", WIDTH: "256", HEIGHT: "256", BBOX,
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const r = await fetch(`${base}?${p}`, {
        headers: { accept: "image/png,image/*,*/*;q=0.5", "user-agent": "4PLANET-ATLAS-DATA-SANDBOX/1.0" },
        signal: controller.signal,
      });
      const type = r.headers.get("content-type") || "";
      const bytes = new Uint8Array(await r.arrayBuffer());
      const image = r.ok && type.toLowerCase().includes("image") && bytes.byteLength >= 100;
      const body = image ? "" : new TextDecoder().decode(bytes.slice(0, 800)).replace(/\s+/g, " ");
      const result = { id, endpoint: base.endsWith("/ows") ? "OWS" : "WMS", layer, style, httpStatus: r.status, contentType: type, bytes: bytes.byteLength, state: image ? "IMAGE_GREEN" : "FAIL", body };
      rows.push(result);
      console.log(`${result.state.padEnd(12)} ${result.endpoint} ${id.padEnd(12)} ${r.status} ${type} ${bytes.byteLength}`);
      if (image) await fs.mkdir(OUT_DIR, { recursive: true }).then(() => fs.writeFile(path.join(OUT_DIR, `habitat-${result.endpoint.toLowerCase()}-${id}.png`), bytes));
    } catch (error) {
      rows.push({ id, endpoint: base.endsWith("/ows") ? "OWS" : "WMS", layer, style, state: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR", error: String(error?.message || error) });
    } finally {
      clearTimeout(timer);
    }
  }
}

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(path.join(OUT_DIR, "habitat-candidates.json"), JSON.stringify({ generatedAt: new Date().toISOString(), bbox3857: BBOX, rows }, null, 2) + "\n");

const md = [
  "# EMODNET SEABED HABITAT — CANDIDATE CONTRACTS",
  "",
  "| Candidate | Endpoint | State | HTTP | Bytes / error |",
  "|---|---|---|---:|---|",
  ...rows.map((r) => `| ${r.id} | ${r.endpoint} | ${r.state} | ${r.httpStatus ?? "—"} | ${r.bytes ?? r.error ?? "—"} |`),
  "",
].join("\n");
await fs.writeFile(path.join(OUT_DIR, "habitat-candidates.md"), md);
console.log("\n" + md);
