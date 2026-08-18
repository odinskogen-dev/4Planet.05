import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const catalogue = JSON.parse(await fs.readFile(path.join(root, "atlas-data-sandbox", "sources.json"), "utf8"));
const outDir = path.join(root, "artifacts", "atlas-data-sandbox");
const rawDir = path.join(outDir, "ogc-capabilities");
const timeoutMs = Number(process.env.ATLAS_PROBE_TIMEOUT_MS || 12000);
const userAgent = "4PLANET-ATLAS-DATA-SANDBOX/1.0 (+https://4planet.org; non-production OGC inventory)";

const ogc = catalogue.sources.filter((source) =>
  source.probeUrl && /GetCapabilities/i.test(source.probeUrl) && /WMS|WMTS|WFS|WCS/i.test(source.protocol || ""),
);

function decodeXml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(re);
  return match ? decodeXml(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")) : "";
}

function extractAllTags(xml, tag) {
  const values = new Set();
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let match;
  while ((match = re.exec(xml))) {
    const value = decodeXml(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
    if (value) values.add(value);
  }
  return [...values];
}

function styleNames(xml) {
  const names = [];
  const re = /<Style(?:\s[^>]*)?>([\s\S]*?)<\/Style>/gi;
  let match;
  while ((match = re.exec(xml))) {
    const name = extractTag(match[1], "Name");
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

function toNumber(value) {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function layerBlocks(xml) {
  // Capture the innermost named Layer blocks. The raw capability XML is also
  // retained because WMS properties such as CRS can be inherited from parents.
  const blocks = [];
  const re = /<Layer(?:\s[^>]*)?>((?:(?!<Layer(?:\s|>))[\s\S])*?)<\/Layer>/gi;
  let match;
  while ((match = re.exec(xml))) {
    const body = match[1];
    const name = extractTag(body, "Name");
    if (!name) continue;
    blocks.push({
      name,
      title: extractTag(body, "Title") || name,
      abstract: extractTag(body, "Abstract") || undefined,
      crs: [...new Set([...extractAllTags(body, "CRS"), ...extractAllTags(body, "SRS")])],
      styles: styleNames(body),
      minScaleDenominator: toNumber(extractTag(body, "MinScaleDenominator")),
      maxScaleDenominator: toNumber(extractTag(body, "MaxScaleDenominator")),
    });
  }
  return blocks;
}

async function inspect(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(source.probeUrl, {
      headers: { "user-agent": userAgent, accept: "application/xml,text/xml,*/*;q=0.5" },
      signal: controller.signal,
    });
    const xml = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const layers = layerBlocks(xml);
    await fs.mkdir(rawDir, { recursive: true });
    await fs.writeFile(path.join(rawDir, `${source.id}.xml`), xml);
    return {
      id: source.id,
      name: source.name,
      status: layers.length ? "OGC_INVENTORY_GREEN" : "OGC_INVENTORY_EMPTY",
      httpStatus: response.status,
      contentType: response.headers.get("content-type"),
      serviceTitle: extractTag(xml, "Title") || source.name,
      advertisedCrs: [...new Set([...extractAllTags(xml, "CRS"), ...extractAllTags(xml, "SRS")])],
      layerCount: layers.length,
      layers,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      id: source.id,
      name: source.name,
      status: error?.name === "AbortError" ? "TIMEOUT" : "OGC_INVENTORY_ERROR",
      httpStatus: null,
      layerCount: 0,
      layers: [],
      checkedAt: new Date().toISOString(),
      error: String(error?.message || error),
    };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const source of ogc) {
  const result = await inspect(source);
  results.push(result);
  console.log(`${result.status.padEnd(22)} ${result.id.padEnd(34)} ${String(result.layerCount).padStart(5)} layers`);
}

const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  baselineSha: catalogue.baselineSha,
  sourcesInspected: results.length,
  results,
};

const md = [
  "# ATLAS DATA SANDBOX — OGC LAYER INVENTORY",
  "",
  `Generated: ${report.generatedAt}`,
  `Sources inspected: ${report.sourcesInspected}`,
  "",
  "Layer names below are provider-advertised service identifiers. Presence does not equal semantic, rights, visible-map or production approval.",
  "",
  ...results.flatMap((result) => [
    `## ${result.name}`,
    "",
    `Status: ${result.status} · advertised leaf layers: ${result.layerCount}`,
    `Advertised CRS: ${(result.advertisedCrs || []).slice(0, 16).join(", ") || "not parsed"}`,
    "",
    ...result.layers.slice(0, 120).map((layer) => {
      const scale = layer.minScaleDenominator || layer.maxScaleDenominator
        ? ` · scale ${layer.minScaleDenominator ?? "—"} → ${layer.maxScaleDenominator ?? "—"}`
        : "";
      const styles = layer.styles?.length ? ` · styles ${layer.styles.join(", ")}` : "";
      return `- \`${layer.name}\` — ${layer.title}${scale}${styles}`;
    }),
    result.layers.length > 120 ? `- … ${result.layers.length - 120} additional advertised layers retained in JSON evidence.` : "",
    "",
  ]),
].join("\n");

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(path.join(outDir, "ogc-layer-inventory.json"), JSON.stringify(report, null, 2) + "\n");
await fs.writeFile(path.join(outDir, "ogc-layer-inventory.md"), md);
