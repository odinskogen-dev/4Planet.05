import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";
const OUTPUT = "artifacts/founder-gate";
mkdirSync(OUTPUT, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function freeze(page: import("@playwright/test").Page) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" });
  await page.waitForTimeout(500);
}

async function noHorizontalOverflow(page: import("@playwright/test").Page) {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test("first five seconds explains the system and exposes the four-product shell", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Everything we depend on");
  await expect(page.getByText(/makes the living systems under pressure easier to understand/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /MAKE AN IMPACT/ })).toBeVisible();
  const switcher = page.getByRole("button", { name: /Switch product, current product/ }).first();
  await switcher.click();
  const dialog = page.getByRole("dialog", { name: "Switch product" });
  for (const product of ["4PLANET", "ATLAS", "SPECIES", "IMPACT"]) {
    await expect(dialog.getByRole("link", { name: new RegExp(product) })).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await freeze(page);
  await page.screenshot({ path: `${OUTPUT}/01-home-desktop.png`, fullPage: false });
});

test("Orca keeps source truth across SPECIES and ATLAS", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif`);
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  await expect(page.getByText("GBIF TAXON · ACCEPTED")).toBeVisible();
  await expect(page.getByText("POPULATION-SPECIFIC CLAIMS CONTROLLED")).toBeVisible();
  await expect(page.getByText("SOURCE RECORD", { exact: true })).toBeVisible();
  await expect(page.getByText("5939349319", { exact: true })).toBeVisible();
  await expect(page.getByText("NONE CREATED", { exact: true })).toBeVisible();
  await expect(page.getByText(/does not establish range, abundance, population trend/i)).toBeVisible();
  await page.getByRole("link", { name: /OPEN SAME ENTITY IN ATLAS/ }).click();
  await expect(page).toHaveURL(/\/atlas\?/);
  await expect(page).toHaveURL(/entity=taxon%3Agbif%3A2440483/);
  await expect(page).toHaveURL(/journey=orca-gbif/);
  await page.waitForFunction(() => Boolean((window as any).__4planet_map?.isStyleLoaded?.()));
  await freeze(page);
  await page.screenshot({ path: `${OUTPUT}/02-atlas-orca-desktop.png` });
});

test("IMPACT Tree and Plastic remain explicit non-delivery test journeys", async ({ page }) => {
  for (const unit of ["tree", "plastic"]) {
    await page.goto(`${BASE}/impact/lab/${unit}`);
    await expect(page.getByText("TEST RECORD — NO PHYSICAL DELIVERY", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("NOT DELIVERED", { exact: false }).first()).toBeVisible();
  }
});

test("mobile shell, menu, Orca and ATLAS remain keyboard-readable without overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`);
  await noHorizontalOverflow(page);
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif`);
  await noHorizontalOverflow(page);
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  await freeze(page);
  await page.screenshot({ path: `${OUTPUT}/03-orca-mobile.png`, fullPage: true });
});

test("Oslofjord and Amazonia routes are reachable and do not claim completeness", async ({ page }) => {
  await page.goto(`${BASE}/atlas?place=oslofjord&journey=oslofjord-proof`);
  await expect(page.locator("body")).not.toContainText(/complete planetary intelligence|fully verified|live tracking/i);
  await page.goto(`${BASE}/missions/am4zonia`);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/fully protected|verified outcome|delivery complete/i);
});
