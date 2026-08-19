import fs from "node:fs/promises";
import path from "node:path";
import { inflateSync } from "node:zlib";

const OUT_DIR = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const CAPS = "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/gwc/service/wmts?REQUEST=GetCapabilities&SERVICE=WMTS&VERSION=1.0.0";
// Re-test the last lineage product with manually inspected desktop/mobile visual evidence.
// Do not promote the newer EUNIS candidate merely because its endpoint is newer.
const layer = "eusm2025_msfd_800";
const style = "emodnet_view:eusm2019_msfd_800";
const matrixSet = "EPSG:900913";
const samples = [
  { id: "broad", z: 3, x: 4, y: 2 },
  { id: "north-sea", z: 6, x: 33, y: 19 },
  { id: "north-sea-south", z: 6, x: 33, y: 20 },
  { id: "north-sea-detail", z: 7, x: 66, y: 39 },
];

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function inspectPng(bytes) {
  if (Buffer.from(bytes.subarray(0, 8)).toString("hex") !== "89504e470d0a1a0a") return { inspectable: false, reason: "NOT_PNG" };
  let offset = 8, width = 0, height = 0, bitDepth = 0, colorType = -1, interlace = -1;
  const idat = [];
  while (offset + 12 <= bytes.length) {
    const length = Buffer.from(bytes.subarray(offset, offset + 4)).readUInt32BE(0);
    const type = Buffer.from(bytes.subarray(offset + 4, offset + 8)).toString("ascii");
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = Buffer.from(data.subarray(0, 4)).readUInt32BE(0);
      height = Buffer.from(data.subarray(4, 8)).readUInt32BE(0);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === "IDAT") idat.push(Buffer.from(data));
    offset += 12 + length;
    if (type === "IEND") break;
  }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (!width || !height || bitDepth !== 8 || interlace !== 0 || !channels || !idat.length) {
    return { inspectable: false, reason: `PNG_UNSUPPORTED_${width}x${height}_bd${bitDepth}_ct${colorType}_i${interlace}` };
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const recon = Buffer.alloc(stride * height);
  let read = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[read++];
    for (let x = 0; x < stride; x++) {
      const value = raw[read++];
      const left = x >= channels ? recon[y * stride + x - channels] : 0;
      const up = y > 0 ? recon[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? recon[(y - 1) * stride + x - channels] : 0;
      let decoded;
      if (filter === 0) decoded = value;
      else if (filter === 1) decoded = (value + left) & 255;
      else if (filter === 2) decoded = (value + up) & 255;
      else if (filter === 3) decoded = (value + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) decoded = (value + paeth(left, up, upLeft)) & 255;
      else return { inspectable: false, reason: `PNG_FILTER_${filter}` };
      recon[y * stride + x] = decoded;
    }
  }
  let visiblePixels = 0;
  const colours = new Set();
  for (let i = 0; i < width * height; i++) {
    const base = i * channels;
    const alpha = colorType === 6 ? recon[base + 3] : colorType === 4 ? recon[base + 1] : 255;
    if (alpha === 0) continue;
    visiblePixels++;
    if (colours.size < 64) {
      if (colorType === 6 || colorType === 2) colours.add(`${recon[base]},${recon[base + 1]},${recon[base + 2]},${alpha}`);
      else colours.add(`${recon[base]},${alpha}`);
    }
  }
  return { inspectable: true, width, height, colorType, visiblePixels, visibleRatio: visiblePixels / (width * height), sampledColourCount: colours.size };
}

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
    const imageContract = r.ok && type.toLowerCase().includes("image") && bytes.byteLength >= 100;
    const pixel = imageContract ? inspectPng(bytes) : null;
    const pixelEvidence = Boolean(pixel?.inspectable && pixel.visiblePixels > 0 && pixel.sampledColourCount > 1);
    const transparentEmpty = Boolean(pixel?.inspectable && pixel.visiblePixels === 0);
    const state = !imageContract ? "WMTS_CONTRACT_BAD" : pixelEvidence ? "WMTS_PIXEL_EVIDENCE" : transparentEmpty ? "WMTS_EMPTY_TRANSPARENT" : "WMTS_IMAGE_AMBIGUOUS";
    if (imageContract) await fs.writeFile(path.join(OUT_DIR, `habitat-wmts-${sample.id}-z${sample.z}-x${sample.x}-y${sample.y}.png`), bytes);
    return { ...sample, httpStatus: r.status, contentType: type, bytes: bytes.byteLength, state, pixel };
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
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    httpStatus: r.status,
    capabilityBytes: Buffer.byteLength(xml),
    layer, style, matrixSet, tiles,
    acceptanceBoundary: "WMTS_PIXEL_EVIDENCE proves only the exact cached tile contract. MAP_GREEN still requires the same product on the deployed sandbox map on desktop and mobile.",
    interpretation: "Re-test the last visually documented broad-scale MSFD product through the provider cache. Empty/transparent tiles remain distinct from source failure and never count as data evidence.",
  };
  await fs.writeFile(path.join(OUT_DIR, "habitat-wmts-contract.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));

  const visible = tiles.filter((tile) => tile.state === "WMTS_PIXEL_EVIDENCE");
  if (!visible.length) throw new Error(`Stable MSFD habitat cache produced no non-transparent pixel evidence: ${JSON.stringify(tiles)}`);
} finally {
  clearTimeout(capTimer);
}
