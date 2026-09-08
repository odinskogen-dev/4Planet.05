import fs from "node:fs";
import path from "node:path";
import "./render-partner-briefs-v2.mjs";

const expectedPages = new Map([
  ["4planet-overview.pdf", 1],
  ["4planet-partner-brief.pdf", 4],
  ["4planet-capital-funder-brief.pdf", 4],
  ["4planet-company-pilot-brief.pdf", 4],
  ["4planet-foundation-brief.pdf", 4],
  ["4planet-science-data-brief.pdf", 4],
]);

for (const [filename, expected] of expectedPages) {
  const file = path.resolve("dist/downloads", filename);
  const binary = fs.readFileSync(file).toString("latin1");
  const pages = (binary.match(/\/Type\s*\/Page\b/g) || []).length;
  if (pages !== expected) {
    throw new Error(`PARTNERS_PDF_CONTRACT_FAIL ${filename} pages=${pages} expected=${expected}`);
  }
  console.log(`PARTNERS_PDF_PAGES ${filename}=${pages}`);
}

console.log("PARTNERS_PDF_SEMANTIC_CONTRACT=PASS");
