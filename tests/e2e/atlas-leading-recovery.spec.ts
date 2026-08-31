import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const ATLAS = `${BASE}/atlas`;

test("recovered high-value ATLAS donor layers are present in the canonical console", async ({ page }) => {
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
  await page.getByRole("button", { name: "LAYERS" }).click();

  await expect(page.getByText("OCEAN · BATHYMETRY", { exact: true })).toBeVisible();
  await expect(page.getByText("SEABED · HABITATS 2025", { exact: true })).toBeVisible();
  await expect(page.getByText("OCEAN · OXYGEN CLIMATOLOGY", { exact: true })).toBeVisible();
  await expect(page.getByText("FISHING · VESSEL DENSITY", { exact: true })).toBeVisible();
});

test("expanded mobile layer console owns the interaction plane instead of overlapping controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
  await page.getByRole("button", { name: "LAYERS" }).click();

  const panel = page.locator(".atlas-panel:not(.rest)");
  await expect(panel).toBeVisible();
  const panelBox = await panel.boundingBox();
  if (!panelBox) throw new Error("Expanded layer panel has no box");

  const z = await panel.evaluate((node) => Number(getComputedStyle(node).zIndex));
  const lensZ = await page.locator(".search-wrap").evaluate((node) => Number(getComputedStyle(node).zIndex));
  const savedZ = await page.locator(".atlas-saved-views").evaluate((node) => Number(getComputedStyle(node).zIndex));
  expect(z).toBeGreaterThan(lensZ);
  expect(z).toBeGreaterThan(savedZ);
  expect(panelBox.x).toBeGreaterThanOrEqual(0);
  expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(390);
});
