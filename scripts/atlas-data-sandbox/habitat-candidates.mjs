import fs from "node:fs/promises";
import path from "node:path";
import { inflateSync } from "node:zlib";

const OUT_DIR = path.join(process.cwd(), "artifacts", "atlas-data-sandbox");
const BASES = [
  "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/ows",
  "https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms",
];
const BBOX = "0,5009377.085697311,5009377.085697311,10018754.171394622";
const candidates = [
  ["eunis-2025-800", "eusm2025_eunis2019_800", "eusm2021_eunis2019_l2_800", "EUNIS 2019", "broad candidate"],
  ["eunis-2025-400", "eusm2025_eunis2019_400", "eusm2021_eunis2019_l2_400", "EUNIS 2019", "max scale denominator 7,000,000"],
  ["eunis-2025-200", "eusm2025_eunis2019_200", "eusm2021_eunis2019_l2_200", "EUNIS 2019", "max scale denominator 1,500,000"],
  ["eunis-2025-full", "eusm2025_eunis2019_full", "eusm2021_eunis2019_l2_fulldetail", "EUNIS 2019", "max scale denominator 500,000"],
  ["msfd-2025-800", "eusm2025_msfd_800", "eusm2019_msfd_800", "MSFD", "provider advertises 7,000,001–15,500,000,000"],
  ["msfd-2025-400", "eusm2025_msfd_400", "eusm2019_msfd_400", "MSFD", "provider advertises 1,500,001–7,000,000"],
  ["msfd-2025-200", "eusm2025_msfd_200", "eusm2019_msfd_200", "MSFD", "provider advertises 500,001–1,500,000"],
  ["msfd-2025-full", "eusm2025_msfd_full", "eusm2019_msfd_full", "MSFD", "max scale denominator 500,000"],
  ["eunis-2023-group", "eusm2023_eunis2019_group", "default-style-eusm2023_eunis2019_group", "EUNIS 2019", "legacy comparison only"],
];

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function inspectPng(bytes) {
  const signature = "89504e470d0a1a0a";
  if (Buffer.from(bytes.subarray(0, 8)).toString("hex") !== signature) return { inspectable: false, reason: "NOT_PNG" };
  let offset = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = -1, interlace = -1;
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
  let visible = 0;
  const colours = new Set();
  for (let i = 0; i < width * height; i++) {
    const base = i * channels;
    const alpha = colorType === 6 ? recon[base + 3] : colorType === 4 ? recon[base + 1] : 255;
    if (alpha === 0) continue;
    visible++;
    if (colours.size < 64) {
      if (colorType === 6 || colorType === 2) colours.add(`${recon[base]},${recon[base + 1]},${recon[base + 2]},${alpha}`);
      else colours.add(`${recon[base]},${alpha}`);
    }
  }
  return {
    inspectable: true,
    width,
    height,
    colorType,
    visiblePixels: visible,
    visibleRatio: visible / (width * height),
    sampledColourCount: colours.size,
  };
}

const rows = [];
for (const base of BASES) {
  for (const [id, layer, style, classification, scaleSemantics] of candidates) {
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
      const imageContract = r.ok && type.toLowerCase().includes("image") && bytes.byteLength >= 100;
      const pixel = imageContract ? inspectPng(bytes) : null;
      const pixelEvidence = Boolean(pixel?.inspectable && pixel.visiblePixels > 0 && pixel.sampledColourCount > 1);
      const transparentEmpty = Boolean(pixel?.inspectable && pixel.visiblePixels === 0);
      const state = !imageContract ? "CONTRACT_FAIL" : pixelEvidence ? "PIXEL_EVIDENCE" : transparentEmpty ? "EMPTY_TRANSPARENT" : "IMAGE_AMBIGUOUS";
      const body = imageContract ? "" : new TextDecoder().decode(bytes.slice(0, 800)).replace(/\s+/g, " ");
      const result = {
        id, endpoint: base.endsWith("/ows") ? "OWS" : "WMS", layer, style, classification, scaleSemantics,
        httpStatus: r.status, contentType: type, bytes: bytes.byteLength, state, pixel, body,
      };
      rows.push(result);
      console.log(`${result.state.padEnd(18)} ${result.endpoint} ${id.padEnd(18)} ${r.status} ${type} ${bytes.byteLength}${pixel?.inspectable ? ` visible=${(pixel.visibleRatio * 100).toFixed(2)}% colours>=${pixel.sampledColourCount}` : ""}`);
      if (imageContract) await fs.mkdir(OUT_DIR, { recursive: true }).then(() => fs.writeFile(path.join(OUT_DIR, `habitat-${result.endpoint.toLowerCase()}-${id}.png`), bytes));
    } catch (error) {
      rows.push({ id, endpoint: base.endsWith("/ows") ? "OWS" : "WMS", layer, style, classification, scaleSemantics, state: error?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR", error: String(error?.message || error) });
    } finally {
      clearTimeout(timer);
    }
  }
}

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(path.join(OUT_DIR, "habitat-candidates.json"), JSON.stringify({
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  bbox3857: BBOX,
  acceptanceBoundary: "PIXEL_EVIDENCE is candidate request evidence only. It is never MAP_GREEN without exact deployed desktop + mobile browser proof.",
  rows,
}, null, 2) + "\n");

const md = [
  "# EMODNET SEABED HABITAT — CANDIDATE CONTRACTS",
  "",
  "A 2xx image response is not enough: fully transparent rasters are classified EMPTY_TRANSPARENT, not green. PIXEL_EVIDENCE remains research evidence only until the exact product passes deployed desktop/mobile map proof.",
  "",
  "| Candidate | Class | Endpoint | State | HTTP | Visible pixels | Bytes / error |",
  "|---|---|---|---|---:|---:|---|",
  ...rows.map((r) => `| ${r.id} | ${r.classification} | ${r.endpoint} | ${r.state} | ${r.httpStatus ?? "—"} | ${r.pixel?.inspectable ? `${(r.pixel.visibleRatio * 100).toFixed(2)}%` : "—"} | ${r.bytes ?? r.error ?? "—"} |`),
  "",
].join("\n");
await fs.writeFile(path.join(OUT_DIR, "habitat-candidates.md"), md);
console.log("\n" + md);
