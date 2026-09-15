import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const base = (process.env.PARTNERS_BASE_URL || "https://partners.4planet.org").replace(/\/$/, "");
const evidence = path.resolve("partners-release-evidence/live");
fs.mkdirSync(evidence, { recursive: true });

const routes = ["/", "/system", "/proof", "/partnerships", "/capital", "/trust", "/founder", "/briefs/overview", "/briefs/company"];
const browser = await chromium.launch({ headless: true });
const pageErrors = [];

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
  desktop.on("pageerror", (error) => pageErrors.push(String(error)));

  for (const route of routes) {
    const response = await desktop.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 30000 });
    if (!response || !response.ok()) throw new Error(`PARTNERS_LIVE_FAIL ${route} HTTP ${response?.status() ?? "none"}`);
    const body = await desktop.locator("body").innerText();
    if (!body.includes("4PLANET")) throw new Error(`PARTNERS_LIVE_FAIL rendered 4PLANET marker missing ${route}`);
  }

  await desktop.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30000 });
  const thesis = await desktop.locator("body").innerText();
  if (!thesis.includes("The living world is connected.")) throw new Error("PARTNERS_LIVE_FAIL rendered homepage thesis missing");

  const robots = await desktop.locator('meta[name="robots"]').getAttribute("content");
  if (!robots?.toLowerCase().includes("noindex")) throw new Error(`PARTNERS_LIVE_FAIL rendered meta robots=${robots}`);

  const h1Count = await desktop.locator("h1").count();
  if (h1Count < 1) throw new Error("PARTNERS_LIVE_FAIL homepage has no H1");
  await desktop.screenshot({ path: path.join(evidence, "partners-live-desktop-1440.png"), fullPage: true });

  const perf = await desktop.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    return {
      domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
      loadMs: nav ? Math.round(nav.loadEventEnd) : null,
      resourceCount: resources.length,
      transferKb: Math.round(resources.reduce((sum, item) => sum + (item.transferSize || 0), 0) / 1024),
    };
  });

  const tablet = await browser.newPage({ viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1 });
  tablet.on("pageerror", (error) => pageErrors.push(String(error)));
  await tablet.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30000 });
  const tabletOverflow = await tablet.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (tabletOverflow > 2) throw new Error(`PARTNERS_LIVE_FAIL tablet horizontal overflow ${tabletOverflow}px`);
  await tablet.screenshot({ path: path.join(evidence, "partners-live-tablet-820.png"), fullPage: true });
  await tablet.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  mobile.on("pageerror", (error) => pageErrors.push(String(error)));
  await mobile.goto(`${base}/`, { waitUntil: "networkidle", timeout: 30000 });
  const mobileOverflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (mobileOverflow > 2) throw new Error(`PARTNERS_LIVE_FAIL mobile horizontal overflow ${mobileOverflow}px`);

  await mobile.keyboard.press("Tab");
  const focusTag = await mobile.evaluate(() => document.activeElement?.tagName || "");
  if (!focusTag || focusTag === "BODY") throw new Error("PARTNERS_LIVE_FAIL keyboard focus did not enter an interactive element");

  await mobile.screenshot({ path: path.join(evidence, "partners-live-mobile-390.png"), fullPage: true });
  await mobile.close();
  await desktop.close();

  if (pageErrors.length) throw new Error(`PARTNERS_LIVE_FAIL uncaught page errors: ${pageErrors.join(" | ")}`);

  fs.writeFileSync(path.join(evidence, "partners-live-metrics.json"), JSON.stringify({ base, perf, tabletOverflow, mobileOverflow, h1Count, robots }, null, 2));
  console.log("PARTNERS_LIVE_BROWSER=PASS");
  console.log(`PARTNERS_LIVE_PERF=${JSON.stringify(perf)}`);
  console.log(`PARTNERS_LIVE_H1=${h1Count}`);
  console.log(`PARTNERS_LIVE_META_ROBOTS=${robots}`);
} finally {
  await browser.close();
}
