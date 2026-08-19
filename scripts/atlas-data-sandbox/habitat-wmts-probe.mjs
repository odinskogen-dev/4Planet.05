import fs from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const URL = "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/gwc/service/wmts?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0";
const wanted = "eusm2025_eunis2019_800";
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 30000);

try {
  const r = await fetch(URL, {
    headers: { accept: "application/xml,text/xml,*/*;q=0.5", "user-agent": "4PLANET-ATLAS-DATA-SANDBOX/1.0" },
    signal: controller.signal,
  });
  const xml = await r.text();
  if (!r.ok) throw new Error(`WMTS capabilities ${r.status}: ${xml.slice(0, 500)}`);

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, "emodnet-seabed-habitat-wmts-capabilities.xml"), xml);

  const layerBlocks = [...xml.matchAll(/<Layer>([\s\S]*?)<\/Layer>/g)].map((m) => m[1]);
  const matches = layerBlocks.filter((block) => block.includes(wanted));
  const parsed = matches.map((block) => ({
    identifiers: [...block.matchAll(/<(?:ows:)?Identifier>([^<]+)<\/(?:ows:)?Identifier>/g)].map((m) => m[1]),
    styles: [...block.matchAll(/<Style[^>]*>[\s\S]*?<(?:ows:)?Identifier>([^<]+)<\/(?:ows:)?Identifier>[\s\S]*?<\/Style>/g)].map((m) => m[1]),
    formats: [...block.matchAll(/<Format>([^<]+)<\/Format>/g)].map((m) => m[1]),
    matrixSets: [...block.matchAll(/<TileMatrixSet>([^<]+)<\/TileMatrixSet>/g)].map((m) => m[1]),
    resourceUrls: [...block.matchAll(/<ResourceURL\s+([^>]+)>/g)].map((m) => m[1]),
  }));

  const matrixIds = [...xml.matchAll(/<TileMatrixSet>[\s\S]*?<(?:ows:)?Identifier>([^<]+)<\/(?:ows:)?Identifier>/g)].map((m) => m[1]);
  const evidence = {
    generatedAt: new Date().toISOString(),
    httpStatus: r.status,
    bytes: Buffer.byteLength(xml),
    wanted,
    matchCount: matches.length,
    parsed,
    matrixIds: [...new Set(matrixIds)].slice(0, 50),
  };
  await fs.writeFile(path.join(OUT_DIR, "habitat-wmts-contract.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
  if (!matches.length) throw new Error(`WMTS capabilities do not advertise ${wanted}`);
} finally {
  clearTimeout(timer);
}
