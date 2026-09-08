import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const base = (process.env.PARTNERS_BASE_URL || "http://127.0.0.1:4173").replace(/\/$/, "");
const out = path.resolve("dist/downloads");
const evidence = path.resolve("partners-release-evidence");
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(evidence, { recursive: true });

const briefs = [
  ["overview", "4planet-overview.pdf"],
  ["partner", "4planet-partner-brief.pdf"],
  ["capital", "4planet-capital-funder-brief.pdf"],
  ["company", "4planet-company-pilot-brief.pdf"],
  ["foundation", "4planet-foundation-brief.pdf"],
  ["science", "4planet-science-data-brief.pdf"],
];

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  await desktop.goto(`${base}/`, { waitUntil: "networkidle" });
  const body = await desktop.locator("body").innerText();
  if (!body.includes("The living world is connected.")) throw new Error("PARTNERS_RENDER_FAIL homepage thesis missing");
  const robots = await desktop.locator('meta[name="robots"]').getAttribute("content");
  if (!robots?.includes("noindex")) throw new Error("PARTNERS_RENDER_FAIL noindex meta missing");
  await desktop.screenshot({ path: path.join(evidence, "partners-home-desktop.png"), fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await mobile.goto(`${base}/`, { waitUntil: "networkidle" });
  const horizontalOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (horizontalOverflow > 2) throw new Error(`PARTNERS_RENDER_FAIL mobile horizontal overflow ${horizontalOverflow}px`);
  await mobile.screenshot({ path: path.join(evidence, "partners-home-mobile.png"), fullPage: true });
  await mobile.close();

  for (const [slug, filename] of briefs) {
    await desktop.goto(`${base}/briefs/${slug}`, { waitUntil: "networkidle" });
    const text = await desktop.locator("body").innerText();
    if (!text.includes("4PLANET")) throw new Error(`PARTNERS_RENDER_FAIL brief content missing ${slug}`);
    const target = path.join(out, filename);
    await desktop.pdf({
      path: target,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
    });
    const stat = fs.statSync(target);
    if (stat.size < 15000) throw new Error(`PARTNERS_RENDER_FAIL PDF suspiciously small ${filename} ${stat.size}`);
    const header = fs.readFileSync(target).subarray(0, 5).toString("ascii");
    if (header !== "%PDF-") throw new Error(`PARTNERS_RENDER_FAIL invalid PDF signature ${filename}`);
  }
  await desktop.close();
} finally {
  await browser.close();
}

console.log(`PARTNERS_BRIEFS_RENDERED=${briefs.length}`);
console.log(`PARTNERS_EVIDENCE_DIR=${evidence}`);
