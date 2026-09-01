import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const ATLAS = `${BASE}/atlas`;

function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

test("recovered high-value ATLAS donor layers are present in the canonical console", async ({ page }) => {
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
  await page.getByRole("button", { name: "LAYERS" }).click();

  await expect(page.getByText("OCEAN · BATHYMETRY", { exact: true })).toBeVisible();
  await expect(page.getByText("SEABED · HABITATS 2025", { exact: true })).toBeVisible();
  await expect(page.getByText("OCEAN · OXYGEN CLIMATOLOGY", { exact: true })).toBeVisible();
  await expect(page.getByText("FISHING · VESSEL DENSITY", { exact: true })).toBeVisible();
});

test("high-intent species search resolves canonical Orca and Humpback results", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390"].includes(testInfo.project.name), "bounded live-search proof");
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());

  const input = page.getByRole("textbox", { name: /search the living planet/i });
  await input.fill("orca");
  const orca = page.locator(".results .ritem").filter({ hasText: "Orcinus orca" }).first();
  await expect(orca).toBeVisible({ timeout: 15_000 });
  await expect(orca).toContainText(/Orca|Killer Whale|Orcinus orca/i);

  await input.fill("humpback whale");
  const humpback = page.locator(".results .ritem").filter({ hasText: "Megaptera novaeangliae" }).first();
  await expect(humpback).toBeVisible({ timeout: 15_000 });
  await expect(humpback).toContainText(/Humpback Whale|Megaptera novaeangliae/i);
});

test("adaptive zoom stops stretching Blue Marble and hands local detail to vectors", async ({ page }) => {
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());

  await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    map.jumpTo({ center: [10.7522, 59.9139], zoom: 15 });
  });
  await page.waitForFunction(() => document.documentElement.dataset.atlasZoomBand === "STREET");

  const state = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const blueMarble = map.getStyle()?.layers?.find((layer: any) => layer.id === "bluemarble");
    return {
      projection: map.getProjection?.()?.type,
      blueMarbleMaxZoom: blueMarble?.maxzoom,
      band: document.documentElement.dataset.atlasZoomBand,
      streetQuality: document.documentElement.dataset.atlasStreetQuality,
      visibleSymbols: Number(document.documentElement.dataset.atlasVisibleSymbolLayers || "0"),
    };
  });

  expect(state.projection).toBe("mercator");
  expect(state.blueMarbleMaxZoom).toBeLessThanOrEqual(6.6);
  expect(state.band).toBe("STREET");
  expect(state.streetQuality).toBe("vector");
  expect(state.visibleSymbols).toBeGreaterThan(0);
});

test("resting mobile controls do not physically collide", async ({ page }, testInfo) => {
  test.skip(!["mobile-390", "mobile-430", "webkit-390", "webkit-430"].includes(testInfo.project.name), "mobile geometry only");
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());

  const search = await page.locator(".search-line").boundingBox();
  const layers = await page.locator(".atlas-panel.rest").boundingBox();
  const saved = await page.locator(".atlas-saved-views").boundingBox();
  if (!search || !layers || !saved) throw new Error("Expected mobile Atlas controls are missing");

  expect(overlaps(search, layers)).toBe(false);
  expect(overlaps(search, saved)).toBe(false);
  expect(overlaps(layers, saved)).toBe(false);
});

test("expanded mobile layer console owns the interaction plane instead of overlapping controls", async ({ page }, testInfo) => {
  test.skip(!["mobile-390", "mobile-430", "webkit-390", "webkit-430"].includes(testInfo.project.name), "mobile hierarchy only");
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
  await page.getByRole("button", { name: "LAYERS" }).click();

  const panel = page.locator(".atlas-panel:not(.rest)");
  await expect(panel).toBeVisible();
  const panelBox = await panel.boundingBox();
  if (!panelBox) throw new Error("Expanded layer panel has no box");

  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Viewport missing");
  const z = await panel.evaluate((node) => Number(getComputedStyle(node).zIndex));
  const searchZ = await page.locator(".search-wrap").evaluate((node) => Number(getComputedStyle(node).zIndex));
  const savedStyle = await page.locator(".atlas-saved-views").evaluate((node) => ({
    z: Number(getComputedStyle(node).zIndex),
    opacity: Number(getComputedStyle(node).opacity),
    pointerEvents: getComputedStyle(node).pointerEvents,
  }));
  const lensStyle = await page.locator(".lens-rail").evaluate((node) => ({
    opacity: Number(getComputedStyle(node).opacity),
    pointerEvents: getComputedStyle(node).pointerEvents,
  }));

  expect(z).toBeGreaterThan(searchZ);
  expect(z).toBeGreaterThan(savedStyle.z);
  expect(savedStyle.opacity).toBe(0);
  expect(savedStyle.pointerEvents).toBe("none");
  expect(lensStyle.opacity).toBe(0);
  expect(lensStyle.pointerEvents).toBe("none");
  expect(panelBox.x).toBeGreaterThanOrEqual(0);
  expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(viewport.width);
});