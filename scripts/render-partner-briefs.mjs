import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const base = (process.env.PARTNERS_BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
let ready = false;
let lastBody = "";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 20000 });
      lastBody = await page.locator("body").innerText().catch(() => "");
      if (response?.ok() && lastBody.includes("The living world is connected.")) {
        ready = true;
        console.log(`PARTNERS_PREVIEW_RENDER_READY attempt=${attempt}`);
        break;
      }
      console.log(`PARTNERS_PREVIEW_RENDER_PENDING attempt=${attempt} http=${response?.status() ?? "none"}`);
    } catch (error) {
      console.log(`PARTNERS_PREVIEW_RENDER_PENDING attempt=${attempt} error=${String(error).slice(0, 180)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
} finally {
  await browser.close();
}

if (!ready) {
  throw new Error(`PARTNERS_PREVIEW_RENDER_FAIL thesis unavailable after bounded readiness window; body=${lastBody.slice(0, 240)}`);
}

await import("./render-partner-briefs-v2.mjs");

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
