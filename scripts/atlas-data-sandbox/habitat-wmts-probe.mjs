import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const CAPS = "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/gwc/service/wmts?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0";
const expectedMatrixSet = "EPSG:900913";
const sample = { z: 3, x: 4, y: 2 };
const candidates = [
  { id: "eunis2019-full", layer: "eusm2025_eunis2019_full", style: "emodnet_view:eusm2021_eunis2019_l2_fulldetail" },
  { id: "msfd-800", layer: "eusm2025_msfd_800", style: "emodnet_view:eusm2019_msfd_800" },
  { id: "eunis2007-800", layer: "eusm2025_eunis2007_800", style: "emodnet_view:eusm2021_eunis2007_800" },
];
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 30000);

async function getTile(candidate) {
  const tileUrl = `https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/gwc/service/wmts/rest/${candidate.layer}/${encodeURIComponent(candidate.style)}/${expectedMatrixSet}/${expectedMatrixSet}:${sample.z}/${sample.y}/${sample.x}?format=image/png8`;
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 15000);
  try {
    const r = await fetch(tileUrl, {
      headers: { accept: "image/png,image/*,*/*;q=0.5", "user-agent": "4PLANET-ATLAS-DATA-SANDBOX/1.0" },
      signal: c.signal,
    });
    const type = r.headers.get("content-type") || "";
    const bytes = new Uint8Array(await r.arrayBuffer());
    const image = r.ok && type.toLowerCase().includes("image") && bytes.byteLength >= 100;
    if (image) await fs.writeFile(path.join(OUT_DIR, `habitat-wmts-${candidate.id}-z3-x4-y2.png`), bytes);
    return { id: candidate.id, layer: candidate.layer, style: candidate.style, httpStatus: r.status, contentType: type, bytes: bytes.byteLength, state: image ? "WMTS_TILE_GREEN" : "WMTS_TILE_BAD" };
  } catch (error) {
    return { id: candidate.id, layer: candidate.layer, style: candidate.style, state: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR", error: String(error?.message || error) };
  } finally {
    clearTimeout(t);
  }
}

try {
  const r = await fetch(CAPS, {
    headers: { accept: "application/xml,text/xml,*/*;q=0.5", "user-agent": "4PLANET-ATLAS-DATA-SANDBOX/1.0" },
    signal: controller.signal,
  });
  const xml = await r.text();
  if (!r.ok) throw new Error(`WMTS capabilities ${r.status}: ${xml.slice(0, 500)}`);

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, "emodnet-seabed-habitat-wmts-capabilities.xml"), xml);

  const layerBlocks = [...xml.matchAll(/<Layer>([\s\S]*?)<\/Layer>/g)].map((m) => m[1]);
  const advertised = [];
  for (const candidate of candidates) {
    const block = layerBlocks.find((value) => value.includes(`<ows:Identifier>${candidate.layer}</ows:Identifier>`));
    if (!block) throw new Error(`WMTS capabilities do not advertise ${candidate.layer}`);
    const styles = [...block.matchAll(/<Style[^>]*>[\s\S]*?<ows:Identifier>([^<]+)<\/ows:Identifier>[\s\S]*?<\/Style>/g)].map((m) => m[1]);
    const matrixSets = [...block.matchAll(/<TileMatrixSet>([^<]+)<\/TileMatrixSet>/g)].map((m) => m[1]);
    if (!styles.includes(candidate.style)) throw new Error(`Expected style not advertised for ${candidate.layer}: ${candidate.style}`);
    if (!matrixSets.includes(expectedMatrixSet)) throw new Error(`EPSG:900913 not advertised for ${candidate.layer}`);
    advertised.push({ ...candidate, styles, matrixSets });
  }

  const tiles = [];
  for (const candidate of candidates) tiles.push(await getTile(candidate));

  const evidence = {
    generatedAt: new Date().toISOString(),
    httpStatus: r.status,
    capabilityBytes: Buffer.byteLength(xml),
    matrixSet: expectedMatrixSet,
    sample,
    advertised,
    tiles,
  };
  await fs.writeFile(path.join(OUT_DIR, "habitat-wmts-contract.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
  if (!tiles.some((tile) => tile.state === "WMTS_TILE_GREEN" && tile.bytes > 1000)) {
    throw new Error("No broad-view cached habitat candidate returned a substantial tile");
  }
} finally {
  clearTimeout(timer);
}
