import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const OUTPUT = "artifacts/product-proof/oslofjord";
mkdirSync(OUTPUT, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function settle(page: import("@playwright/test").Page) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" });
  await page.waitForTimeout(1200);
}

async function waitForMap(page: import("@playwright/test").Page) {
  await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 20_000 });
  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(".maplibregl-canvas");
    return Boolean(canvas && canvas.width > 100 && canvas.height > 100);
  });
  await expect(page.getByText("MAP · READY", { exact: true })).toBeVisible({ timeout: 20_000 });
}

async function verifyHumanReadingContract(page: import("@playwright/test").Page) {
  for (const section of ["What’s happening", "Why", "What changed", "What can be done", "Read this correctly"]) {
    await expect(page.getByText(section, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText(/does not mean the whole Oslofjord ecosystem has been restored/i)).toBeVisible();
}

test("Oslofjord desktop is a source-backed human-first Planet proof", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/living-systems/oslofjord`, { waitUntil: "domcontentloaded" });

  await expect(page).toHaveURL(/\/living-systems\/oslofjord$/);
  await expect(page.getByRole("heading", { name: "Oslofjorden", exact: true })).toBeVisible();
  await waitForMap(page);
  await verifyHumanReadingContract(page);

  for (const layer of ["SEABED / DEPTH", "ECOLOGICAL STATUS", "PHYSICAL INTERVENTIONS"]) {
    await expect(page.getByRole("button", { name: new RegExp(layer.replace("/", "\\/"), "i") })).toBeVisible();
  }

  const sourceLinks = page.locator(".proof-source-links a, .editorial-list a");
  expect(await sourceLinks.count()).toBeGreaterThanOrEqual(6);

  await settle(page);
  await page.screenshot({ path: `${OUTPUT}/01-oslofjord-desktop-first-screen.png` });
  await page.locator("section[aria-label='Explore the fjord map']").screenshot({ path: `${OUTPUT}/02-oslofjord-desktop-map.png` });
  await page.screenshot({ path: `${OUTPUT}/03-oslofjord-desktop-full.png`, fullPage: true });
});

test("Oslofjord mobile remains readable, interactive and source-inspectable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/living-systems/oslofjord`, { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Oslofjorden", exact: true })).toBeVisible();
  await waitForMap(page);
  await verifyHumanReadingContract(page);

  const layout = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);

  const statusButton = page.getByRole("button", { name: /ECOLOGICAL STATUS/i });
  await statusButton.click();
  await expect(page.getByText("MAP · READY", { exact: true })).toBeVisible();

  await settle(page);
  await page.screenshot({ path: `${OUTPUT}/04-oslofjord-mobile-first-screen.png` });
  await page.locator("section[aria-label='Explore the fjord map']").screenshot({ path: `${OUTPUT}/05-oslofjord-mobile-map.png` });
});

test("Norwegian Oslofjorden alias reconciles to canonical registered Oslofjord route", async ({ page }) => {
  await page.goto(`${BASE}/living-systems/oslofjorden`, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/living-systems\/oslofjord$/);
  await expect(page.getByRole("heading", { name: "Oslofjorden", exact: true })).toBeVisible();
});
