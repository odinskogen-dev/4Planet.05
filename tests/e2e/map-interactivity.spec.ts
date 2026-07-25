/**
 * Behavioural acceptance tests for the public ATLAS route.
 *
 * These tests drive a real browser. They verify that the map remains usable,
 * that projection changes do not reintroduce labels on the back of the globe,
 * and that the selected species context survives product navigation.
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const ATLAS = `${BASE}/atlas`;

declare global {
  interface Window { __4planet_map: any; }
}

async function mapCenter(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const c = window.__4planet_map.getCenter();
    return { lng: c.lng, lat: c.lat, zoom: window.__4planet_map.getZoom() };
  });
}

async function mapIsIdle(page: import("@playwright/test").Page) {
  await page.waitForFunction(() => {
    const map = (window as any).__4planet_map;
    return map && !map.isMoving() && !map.isZooming() && !map.isRotating();
  });
}

async function openOslo(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("SEARCH THE LIVING PLANET_").click();
  await page.getByPlaceholder("SEARCH THE LIVING PLANET_").fill("Oslo");
  await page.getByRole("option").first().click();
  await expect(page.locator(".ctx")).toBeVisible();
}

test.describe("ATLAS remains interactive while place context is open", () => {
  test("desktop pan and zoom work and the camera remains usable after reopening context", async ({ page }) => {
    await page.goto(ATLAS);
    await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());

    await openOslo(page);
    const before = await mapCenter(page);

    const box = await page.locator("canvas").first().boundingBox();
    if (!box) throw new Error("No map canvas was rendered");
    const startX = box.x + box.width * 0.25;
    const startY = box.y + box.height * 0.5;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 240, startY + 40, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(400);

    const afterPan = await mapCenter(page);
    expect(Math.abs(afterPan.lng - before.lng) + Math.abs(afterPan.lat - before.lat)).toBeGreaterThan(0.001);

    await page.mouse.move(startX, startY);
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(400);
    const afterZoom = await mapCenter(page);
    expect(afterZoom.zoom).not.toBeCloseTo(afterPan.zoom, 2);

    await page.locator(".ctx-close, [aria-label='Close']").first().click().catch(() => {});
    await mapIsIdle(page);
    const afterClose = await mapCenter(page);
    expect(Math.abs(afterClose.lng - afterZoom.lng) + Math.abs(afterClose.lat - afterZoom.lat)).toBeLessThan(1);
    expect(afterClose.zoom).toBeCloseTo(afterZoom.zoom, 1);

    await openOslo(page);
    await mapIsIdle(page);
    const reopened = await mapCenter(page);
    const reopenedBox = await page.locator("canvas").first().boundingBox();
    if (!reopenedBox) throw new Error("No map canvas was rendered after reopening context");
    const secondX = reopenedBox.x + reopenedBox.width * 0.18;
    const secondY = reopenedBox.y + reopenedBox.height * 0.58;
    await page.mouse.move(secondX, secondY);
    await page.mouse.down();
    await page.mouse.move(secondX - 220, secondY - 35, { steps: 24 });
    await page.mouse.up();
    await page.waitForTimeout(500);
    const afterSecondPan = await mapCenter(page);
    expect(Math.abs(afterSecondPan.lng - reopened.lng) + Math.abs(afterSecondPan.lat - reopened.lat)).toBeGreaterThan(0.001);
  });

  test("mobile bottom sheet leaves enough visible map area to pan", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.goto(ATLAS);
    await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
    await openOslo(page);
    const before = await mapCenter(page);
    await page.mouse.move(120, 120);
    await page.mouse.down();
    await page.mouse.move(300, 160, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    const after = await mapCenter(page);
    expect(Math.abs(after.lng - before.lng) + Math.abs(after.lat - before.lat)).toBeGreaterThan(0.001);
  });
});

test.describe("ATLAS map configuration", () => {
  test("zoom ceiling reaches street level", async ({ page }) => {
    await page.goto(ATLAS);
    await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
    const max = await page.evaluate(() => window.__4planet_map.getMaxZoom());
    expect(max).toBeGreaterThanOrEqual(20);
  });

  test("globe hides basemap symbols and flat projection restores them", async ({ page }) => {
    await page.goto(ATLAS);
    await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());

    const globe = await page.evaluate(() => {
      const map = window.__4planet_map;
      return map.getStyle().layers
        .filter((layer: any) => layer.type === "symbol" && !String(layer.id).startsWith("4planet-"))
        .every((layer: any) => map.getLayoutProperty(layer.id, "visibility") === "none");
    });
    expect(globe).toBe(true);

    await page.getByRole("button", { name: "LAYERS" }).click();
    await page.getByRole("button", { name: "FLAT" }).click();
    const visibleSymbols = await page.evaluate(() => {
      const map = window.__4planet_map;
      return map.getStyle().layers
        .filter((layer: any) => layer.type === "symbol" && !String(layer.id).startsWith("4planet-"))
        .some((layer: any) => map.getLayoutProperty(layer.id, "visibility") !== "none");
    });
    expect(visibleSymbols).toBe(true);
  });
});

test("the same species and journey survive navigation from SPECIES to ATLAS", async ({ page }) => {
  await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif`);
  await page.getByRole("link", { name: "ATLAS", exact: true }).click();
  await expect(page).toHaveURL(/\/atlas\?/);
  await expect(page).toHaveURL(/entity=taxon%3Agbif%3A2440483/);
  await expect(page).toHaveURL(/journey=orca-gbif/);
});
