import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const OUTPUT = "artifacts/product-proof";

mkdirSync(OUTPUT, { recursive: true });

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function settleVisuals(page: import("@playwright/test").Page) {
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}" });
  await page.waitForTimeout(800);
}

async function verifySharedNavigation(page: import("@playwright/test").Page) {
  const trigger = page.getByRole("button", { name: /Switch product, current product/ }).first();
  await expect(trigger).toBeVisible();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Switch product" });
  await expect(dialog).toBeVisible();
  for (const name of ["4PLANET", "ATLAS", "SPECIES", "IMPACT"]) {
    await expect(dialog.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  }
  await expect(dialog.getByText("PUBLIC PREVIEW", { exact: false })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
}

async function waitForAtlasRenderable(page: import("@playwright/test").Page) {
  // `Map#isStyleLoaded()` is stricter than the user-visible readiness contract:
  // it can remain false while optional remote style resources are still settling,
  // even though the MapLibre canvas and style layers are already rendered and
  // interactive. Product proof therefore verifies the actual rendered map seam,
  // not indefinite third-party network quiescence.
  await page.waitForFunction(() => {
    const map = (window as any).__4planet_map;
    const canvas = document.querySelector<HTMLCanvasElement>(".maplibregl-canvas");
    if (!map || !canvas || canvas.width < 100 || canvas.height < 100) return false;
    try {
      const style = map.getStyle?.();
      return map.getCanvas?.() === canvas && Array.isArray(style?.layers) && style.layers.length > 0;
    } catch {
      return false;
    }
  });
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
}

test("desktop proof captures the public entry, source-aware Orca profile and retained ATLAS context", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto(`${BASE}/`);
  await verifySharedNavigation(page);
  await expect(page.locator("main")).toBeVisible();
  await settleVisuals(page);
  await page.screenshot({ path: `${OUTPUT}/01-4planet-desktop.png` });

  await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif`);
  await verifySharedNavigation(page);
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  await expect(page.getByText("GBIF TAXON · ACCEPTED")).toBeVisible();
  await expect(page.getByText("SOURCE RECORD", { exact: true })).toBeVisible();
  await expect(page.getByText("5939349319", { exact: true })).toBeVisible();
  await expect(page.getByText("NONE CREATED", { exact: true })).toBeVisible();
  await expect(page.getByText(/does not establish range, abundance, population trend/i)).toBeVisible();
  await settleVisuals(page);
  await page.screenshot({ path: `${OUTPUT}/02-orca-source-proof-desktop.png`, fullPage: true });

  const watchButton = page.getByRole("button", { name: "ADD TO LOCAL WATCH" });
  await expect(watchButton).toBeVisible();
  await watchButton.click();
  await expect(page.getByRole("button", { name: "WATCHING LOCALLY" })).toBeVisible();

  await page.getByRole("link", { name: /OPEN SAME ENTITY IN ATLAS/ }).click();
  await expect(page).toHaveURL(/\/atlas\?/);
  await expect(page).toHaveURL(/entity=taxon%3Agbif%3A2440483/);
  await expect(page).toHaveURL(/journey=orca-gbif/);
  await waitForAtlasRenderable(page);
  await page.waitForTimeout(2500);
  await settleVisuals(page);
  await page.screenshot({ path: `${OUTPUT}/03-atlas-context-desktop.png` });
});

test("mobile proof preserves navigation, source limits, local Watch and a readable footer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto(`${BASE}/`);
  await verifySharedNavigation(page);
  await expect(page.locator("main")).toBeVisible();
  await settleVisuals(page);
  await page.screenshot({ path: `${OUTPUT}/04-4planet-mobile.png` });

  await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif`);
  await verifySharedNavigation(page);
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  await expect(page.getByText("SOURCE REVIEW PENDING", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/do not establish range, abundance, population trend or live tracking/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /ADD TO LOCAL WATCH|WATCHING LOCALLY/ })).toBeVisible();
  await settleVisuals(page);

  const mobileLayout = await page.evaluate(() => {
    const footerGrid = document.querySelector<HTMLElement>(".foot-grid");
    if (!footerGrid) return null;
    return {
      columns: getComputedStyle(footerGrid).gridTemplateColumns.split(" ").filter(Boolean).length,
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });
  expect(mobileLayout).not.toBeNull();
  expect(mobileLayout!.columns).toBe(1);
  expect(mobileLayout!.pageWidth).toBeLessThanOrEqual(mobileLayout!.viewportWidth + 1);

  // WebKit has a hard 32767px screenshot dimension limit. The Orca page can be
  // taller than that on mobile, so fullPage capture is not a valid product gate.
  // Capture the current proof viewport, then the verified footer itself. This
  // keeps visual evidence while preventing browser-engine limits from being
  // misclassified as a product failure.
  await page.screenshot({ path: `${OUTPUT}/05-orca-source-proof-mobile.png` });
  const footer = page.locator(".foot-grid").first();
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await footer.screenshot({ path: `${OUTPUT}/05b-orca-footer-mobile.png` });
});

test("IMPACT direct routes remain explicit local tests with no physical delivery", async ({ page }) => {
  for (const unit of ["tree", "plastic"]) {
    await page.goto(`${BASE}/impact/lab/${unit}`);
    await verifySharedNavigation(page);
    await expect(page.getByText("TEST RECORD — NO PHYSICAL DELIVERY", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("NOT DELIVERED", { exact: false }).first()).toBeVisible();
    await settleVisuals(page);
    await page.screenshot({ path: `${OUTPUT}/06-${unit}-test-journey.png`, fullPage: true });
  }
});