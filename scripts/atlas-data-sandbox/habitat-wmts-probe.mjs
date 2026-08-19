import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const CAPS = "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/gwc/service/wmts?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0";
const wanted = "eusm2025_eunis2019_full";
const expectedStyle = "emodnet_view:eusm2021_eunis2019_l2_fulldetail";
const expectedMatrixSet = "EPSG:900913";
const sample = { z: 3, x: 4, y: 2 };
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 30000);

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
  const block = layerBlocks.find((value) => value.includes(`<ows:Identifier>${wanted}</ows:Identifier>`));
  if (!block) throw new Error(`WMTS capabilities do not advertise ${wanted}`);

  const styles = [...block.matchAll(/<Style[^>]*>[\s\S]*?<ows:Identifier>([^<]+)<\/ows:Identifier>[\s\S]*?<\/Style>/g)].map((m) => m[1]);
  const formats = [...block.matchAll(/<Format>([^<]+)<\/Format>/g)].map((m) => m[1]);
  const matrixSets = [...block.matchAll(/<TileMatrixSet>([^<]+)<\/TileMatrixSet>/g)].map((m) => m[1]);
  const resourceUrls = [...block.matchAll(/<ResourceURL\s+([^>]+)>/g)].map((m) => m[1]);

  if (!styles.includes(expectedStyle)) throw new Error(`Expected style not advertised: ${expectedStyle}`);
  if (!matrixSets.includes(expectedMatrixSet)) throw new Error(`Expected matrix set not advertised: ${expectedMatrixSet}`);

  const tileUrl = `https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/gwc/service/wmts/rest/${wanted}/${encodeURIComponent(expectedStyle)}/${expectedMatrixSet}/${expectedMatrixSet}:${sample.z}/${sample.y}/${sample.x}?format=image/png8`;
  const tileController = new AbortController();
  const tileTimer = setTimeout(() => tileController.abort(), 15000);
  let tileEvidence;
  try {
    const tile = await fetch(tileUrl, {
      headers: { accept: "image/png,image/*,*/*;q=0.5", "user-agent": "4PLANET-ATLAS-DATA-SANDBOX/1.0" },
      signal: tileController.signal,
    });
    const type = tile.headers.get("content-type") || "";
    const bytes = new Uint8Array(await tile.arrayBuffer());
    const green = tile.ok && type.toLowerCase().includes("image") && bytes.byteLength >= 100;
    tileEvidence = { httpStatus: tile.status, contentType: type, bytes: bytes.byteLength, state: green ? "WMTS_TILE_GREEN" : "WMTS_TILE_BAD" };
    if (!green) throw new Error(`WMTS sample tile failed: ${tile.status} ${type} ${bytes.byteLength}`);
    await fs.writeFile(path.join(OUT_DIR, "habitat-wmts-sample-z3-x4-y2.png"), bytes);
  } finally {
    clearTimeout(tileTimer);
  }

  const evidence = {
    generatedAt: new Date().toISOString(),
    httpStatus: r.status,
    capabilityBytes: Buffer.byteLength(xml),
    layer: wanted,
    styles,
    formats,
    matrixSets,
    resourceUrls,
    selected: { style: expectedStyle, matrixSet: expectedMatrixSet, format: "image/png8" },
    sample,
    tileEvidence,
  };
  await fs.writeFile(path.join(OUT_DIR, "habitat-wmts-contract.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  clearTimeout(timer);
}
