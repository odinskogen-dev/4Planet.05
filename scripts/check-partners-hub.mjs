import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "src/content/partnersHub.json");
const pagePath = path.join(root, "src/pages/partners/PartnersHub.tsx");
const cssPath = path.join(root, "src/styles/partners-hub.css");
const appPath = path.join(root, "src/App.tsx");

for (const file of [dataPath, pagePath, cssPath, appPath]) {
  if (!fs.existsSync(file)) throw new Error(`PARTNERS_FAIL missing ${path.relative(root, file)}`);
}

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const page = fs.readFileSync(pagePath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const app = fs.readFileSync(appPath, "utf8");
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

// Dedicated preview identity is part of the public projection contract: exact Cloudflare
// candidate hosts must render the same Partners surface as the custom domain, while
// unrelated Pages hosts must remain on the main 4PLANET application.
assert(app.includes('host === "partners.4planet.org"'), "custom Partners host identity missing");
assert(app.includes('host === "4planet-partners.pages.dev"'), "root Partners Pages host identity missing");
assert(app.includes('host.endsWith(".4planet-partners.pages.dev")'), "hashed Partners preview identity missing");
assert(app.includes('if (isPartnersHost()) return <PartnersHub />;'), "Partners host does not select PartnersHub");
assert(!app.includes('host.endsWith(".pages.dev")'), "Partners host gate is too broad and could capture unrelated Pages apps");

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

console.log("PARTNERS_CONTRACT=PASS");
console.log("PARTNERS_PREVIEW_IDENTITY=PASS");
console.log(`PARTNERS_VERSION=${data.meta.version}`);
console.log(`PARTNERS_CORE_PRODUCTS=${data.products.length}`);
console.log(`PARTNERS_PROOF_CASES=${data.proofCases.length}`);
console.log(`PARTNERS_BRIEFS=${data.briefs.length}`);
