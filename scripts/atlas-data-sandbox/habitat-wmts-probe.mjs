import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const CAPS = "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/gwc/service/wmts?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0";
const layer = "eusm2025_eunis2019_full";
const style = "emodnet_view:eusm2021_eunis2019_l2_fulldetail";
const matrixSet = "EPSG:900913";
const samples = [
  { id: "broad", z: 3, x: 4, y: 2 },
  { id: "north-sea", z: 6, x: 33, y: 20 },
];

async function fetchTile(sample) {
  const url = `https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/gwc/service/wmts/rest/${layer}/${encodeURIComponent(style)}/${matrixSet}/${matrixSet}:${sample.z}/${sample.y}/${sample.x}?format=image/png8`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const r = await fetch(url, {
      headers: { accept: "image/png,image/*,*/*;q=0.5", "user-agent": "4PLANET-ATLAS-DATA-SANDBOX/1.0" },
      signal: controller.signal,
    });
    const type = r.headers.get("content-type") || "";
    const bytes = new Uint8Array(await r.arrayBuffer());
    const image = r.ok && type.toLowerCase().includes("image") && bytes.byteLength >= 100;
    if (image) await fs.writeFile(path.join(OUT_DIR, `habitat-wmts-${sample.id}-z${sample.z}-x${sample.x}-y${sample.y}.png`), bytes);
    return { ...sample, httpStatus: r.status, contentType: type, bytes: bytes.byteLength, state: image ? "WMTS_TILE_GREEN" : "WMTS_TILE_BAD" };
  } catch (error) {
    return { ...sample, state: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR", error: String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

const capController = new AbortController();
const capTimer = setTimeout(() => capController.abort(), 30000);
try {
  const r = await fetch(CAPS, {
    headers: { accept: "application/xml,text/xml,*/*;q=0.5", "user-agent": "4PLANET-ATLAS-DATA-SANDBOX/1.0" },
    signal: capController.signal,
  });
  const xml = await r.text();
  if (!r.ok) throw new Error(`WMTS capabilities ${r.status}: ${xml.slice(0, 500)}`);
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, "emodnet-seabed-habitat-wmts-capabilities.xml"), xml);

  const blocks = [...xml.matchAll(/<Layer>([\s\S]*?)<\/Layer>/g)].map((m) => m[1]);
  const block = blocks.find((value) => value.includes(`<ows:Identifier>${layer}</ows:Identifier>`));
  if (!block) throw new Error(`WMTS capabilities do not advertise ${layer}`);
  const styles = [...block.matchAll(/<Style[^>]*>[\s\S]*?<ows:Identifier>([^<]+)<\/ows:Identifier>[\s\S]*?<\/Style>/g)].map((m) => m[1]);
  const matrixSets = [...block.matchAll(/<TileMatrixSet>([^<]+)<\/TileMatrixSet>/g)].map((m) => m[1]);
  if (!styles.includes(style)) throw new Error(`Expected style not advertised: ${style}`);
  if (!matrixSets.includes(matrixSet)) throw new Error(`Expected matrix set not advertised: ${matrixSet}`);

  const tiles = [];
  for (const sample of samples) tiles.push(await fetchTile(sample));
  const evidence = {
    generatedAt: new Date().toISOString(),
    httpStatus: r.status,
    capabilityBytes: Buffer.byteLength(xml),
    layer, style, matrixSet, tiles,
    interpretation: "The cached full-detail product is scale-sensitive. A transparent broad tile is valid outside/under the product's useful scale; ATLAS must not mark the whole source unavailable because one requested tile is empty or outside coverage.",
  };
  await fs.writeFile(path.join(OUT_DIR, "habitat-wmts-contract.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));

  const detail = tiles.find((tile) => tile.id === "north-sea");
  if (!detail || detail.state !== "WMTS_TILE_GREEN" || detail.bytes < 1000) {
    throw new Error(`Cached habitat detail tile did not produce substantial image evidence: ${JSON.stringify(detail)}`);
  }
} finally {
  clearTimeout(capTimer);
}
