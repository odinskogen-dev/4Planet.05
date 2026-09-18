import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const dataPath = path.join(root, "src/content/partnersHub.json");
const pagePath = path.join(root, "src/pages/partners/PartnersHub.tsx");
const cssPath = path.join(root, "src/styles/partners-hub.css");
const appPath = path.join(root, "src/App.tsx");
const entryPath = path.join(root, "src/partners-main.tsx");
const vitePath = path.join(root, "vite.config.ts");

for (const file of [dataPath, pagePath, cssPath, appPath, entryPath, vitePath]) {
  if (!fs.existsSync(file)) throw new Error(`PARTNERS_FAIL missing ${path.relative(root, file)}`);
}

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const page = fs.readFileSync(pagePath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const app = fs.readFileSync(appPath, "utf8");
const entry = fs.readFileSync(entryPath, "utf8");
const vite = fs.readFileSync(vitePath, "utf8");
const corpus = `${JSON.stringify(data)}\n${page}`.toLowerCase();

const assert = (condition, message) => { if (!condition) throw new Error(`PARTNERS_FAIL ${message}`); };

assert(data.meta?.version === "PARTNERS-GOLD-01", "unexpected content version");
assert(data.meta?.canonicalHost === "partners.4planet.org", "canonical host mismatch");
assert(Array.isArray(data.products) && data.products.length === 4, "public core must contain exactly four current core products");
assert(data.products.map((x) => x.name).join("|") === "ATLAS|SPECIES|LIVING SYSTEMS|IMPACT", "core product order drift");
assert(Array.isArray(data.system) && data.system.length === 7, "system loop must contain seven bounded steps");
assert(Array.isArray(data.proofCases) && data.proofCases.length >= 3, "proof library too shallow");
assert(Array.isArray(data.trust?.invariants) && data.trust.invariants.includes("PROTOTYPE ≠ PRODUCT-MARKET FIT"), "prototype/PMF truth boundary missing");
assert(data.trust.invariants.includes("MONEY ≠ IMPACT"), "money/impact truth boundary missing");
assert(page.includes('noindex, nofollow, noarchive, nosnippet'), "noindex meta missing");
assert(page.includes("Download PDF"), "downloadable brief surface missing");
assert(css.includes("prefers-reduced-motion"), "reduced-motion control missing");
assert(css.includes("@media print"), "print brief support missing");

// Dedicated preview identity remains a defence-in-depth runtime fallback for any shared build.
assert(app.includes('host === "partners.4planet.org"'), "custom Partners host identity missing");
assert(app.includes('host === "4planet-partners.pages.dev"'), "root Partners Pages host identity missing");
assert(app.includes('host.endsWith(".4planet-partners.pages.dev")'), "hashed Partners preview identity missing");
assert(app.includes('if (isPartnersHost()) return <PartnersHub />;'), "Partners host does not select PartnersHub");
assert(!app.includes('host.endsWith(".pages.dev")'), "Partners host gate is too broad and could capture unrelated Pages apps");

// The dedicated release must physically exclude the main 4PLANET application and its map/router runtime.
assert(entry.includes('PartnersHub from "@/pages/partners/PartnersHub"'), "isolated Partners entry missing canonical PartnersHub");
assert(!entry.includes('from "@/App"') && !entry.includes('from "./App"'), "isolated Partners entry imports main App");
assert(vite.includes('GITHUB_WORKFLOW === "4PLANET Partners Gold Release"'), "Partners release build identity missing");
assert(vite.includes("/src/partners-main.tsx"), "Partners release does not select isolated entry");
assert(vite.includes('/node_modules/maplibre-gl/'), "MapLibre module-graph exclusion gate missing");
assert(vite.includes('/node_modules/react-router/'), "React Router module-graph exclusion gate missing");
assert(vite.includes('PARTNERS_ISOLATION_FAIL'), "Partners module-graph fail-closed gate missing");

const forbidden = [
  "world-leading",
  "game-changing",
  "guaranteed impact",
  "verified partner",
  "official partner of",
  "first-cash top20",
  "x500",
  "conversion likelihood",
  "recipient odds",
  "company g1",
];
for (const phrase of forbidden) assert(!corpus.includes(phrase), `forbidden/confidential public phrase: ${phrase}`);

for (const product of data.products) {
  assert(/^https:\/\/4planet\.org\//.test(product.href), `core product URL is not canonical public 4planet.org: ${product.name}`);
}
for (const proof of data.proofCases) {
  assert(/^https:\/\/4planet\.org\//.test(proof.href), `proof URL is not canonical public 4planet.org: ${proof.name}`);
  assert(typeof proof.boundary === "string" && proof.boundary.length > 30, `proof boundary missing: ${proof.name}`);
}

assert(!/@[a-z0-9.-]+\.[a-z]{2,}/i.test(JSON.stringify(data)), "email address leaked into public projection content");

// Repository audit is still surfaced. A critical/high package may be accepted here only when it
// is the specifically-known shared MapLibre debt AND the later Vite module-graph gate proves it
// is absent from the Partners artifact. Any other high/critical production package fails closed.
if (process.env.GITHUB_ACTIONS === "true") {
  const runAudit = (extraArgs = []) => {
    const proc = spawnSync("npm", ["audit", ...extraArgs, "--json"], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    });
    let parsed;
    try {
      parsed = JSON.parse(proc.stdout || "{}");
    } catch (error) {
      throw new Error(`PARTNERS_FAIL npm audit JSON unreadable: ${error.message}`);
    }
    if (!parsed.metadata?.vulnerabilities) {
      throw new Error(`PARTNERS_FAIL npm audit metadata missing: ${(proc.stderr || "").slice(0, 500)}`);
    }
    return parsed;
  };

  const printFindings = (prefix, audit) => {
    for (const [name, finding] of Object.entries(audit.vulnerabilities || {})) {
      if (!["moderate", "high", "critical"].includes(finding.severity)) continue;
      const fix = finding.fixAvailable === true ? "available" : finding.fixAvailable ? "breaking-or-specific" : "none";
      const via = Array.isArray(finding.via)
        ? finding.via.map((item) => typeof item === "string" ? item : `${item.source || "advisory"}:${item.title || "untitled"}`).join(" | ")
        : String(finding.via || "unknown");
      console.log(`${prefix}_AUDIT_FINDING package=${name} severity=${finding.severity} direct=${Boolean(finding.isDirect)} fix=${fix} via=${via}`);
    }
  };

  const prodAudit = runAudit(["--omit=dev"]);
  const prodCounts = prodAudit.metadata.vulnerabilities;
  console.log(`PARTNERS_REPO_PROD_DEP_AUDIT critical=${prodCounts.critical || 0} high=${prodCounts.high || 0} moderate=${prodCounts.moderate || 0} low=${prodCounts.low || 0}`);
  printFindings("PARTNERS_REPO_PROD", prodAudit);

  const blocking = Object.entries(prodAudit.vulnerabilities || {}).filter(([name, finding]) =>
    ["high", "critical"].includes(finding.severity) && name !== "maplibre-gl",
  );
  assert(blocking.length === 0, `unisolated high/critical repository dependency: ${blocking.map(([name]) => name).join(",")}`);
  const maplibreFinding = prodAudit.vulnerabilities?.["maplibre-gl"];
  if (maplibreFinding && ["high", "critical"].includes(maplibreFinding.severity)) {
    console.log("PARTNERS_SHARED_APP_SECURITY_DEBT=maplibre-gl; artifact release requires module-graph exclusion PASS");
  }

  const fullAudit = runAudit([]);
  const fullCounts = fullAudit.metadata.vulnerabilities;
  console.log(`PARTNERS_FULL_DEP_AUDIT critical=${fullCounts.critical || 0} high=${fullCounts.high || 0} moderate=${fullCounts.moderate || 0} low=${fullCounts.low || 0}`);
  printFindings("PARTNERS_FULL", fullAudit);
}

console.log("PARTNERS_CONTRACT=PASS");
console.log("PARTNERS_PREVIEW_IDENTITY=PASS");
console.log("PARTNERS_SOURCE_ISOLATION=PASS");
console.log(`PARTNERS_VERSION=${data.meta.version}`);
console.log(`PARTNERS_CORE_PRODUCTS=${data.products.length}`);
console.log(`PARTNERS_PROOF_CASES=${data.proofCases.length}`);
console.log(`PARTNERS_BRIEFS=${data.briefs.length}`);
