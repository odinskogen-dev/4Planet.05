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

test("4PLANET ATLAS identity is visible on the canonical product", async ({ page }) => {
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
  await expect(page.getByLabel("4PLANET ATLAS")).toBeVisible();
  await expect(page.getByLabel("4PLANET ATLAS")).toContainText("4PLANET ATLAS");
});

test("recovered high-value ATLAS donor layers are present in the canonical console", async ({ page }) => {
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
  await page.getByRole("button", { name: "LAYERS" }).click();

  await expect(page.getByText("OCEAN · BATHYMETRY", { exact: true })).toBeVisible();
  await expect(page.getByText("SEABED · HABITATS 2025", { exact: true })).toBeVisible();
  await expect(page.getByText("OCEAN · OXYGEN CLIMATOLOGY", { exact: true })).toBeVisible();
  await expect(page.getByText("FISHING · VESSEL DENSITY", { exact: true })).toBeVisible();
});

test("dark ATLAS uses the existing provider dark street style without losing overlays", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390", "webkit-desktop"].includes(testInfo.project.name), "bounded basemap proof");
  await page.goto(`${ATLAS}?l=bluemarble`);
  await page.waitForFunction(() => {
    const map = (window as any).__4planet_map;
    const styleName = String(map?.getStyle?.()?.name || "").toLowerCase();
    return map?.isStyleLoaded?.() && styleName.includes("dark");
  }, undefined, { timeout: 15_000 });

  const state = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    return {
      name: String(map.getStyle?.()?.name || ""),
      blueMarble: Boolean(map.getLayer?.("bluemarble")),
    };
  });
  expect(state.name.toLowerCase()).toContain("dark");
  expect(state.blueMarble).toBe(true);
});

test("clicked-location naming never sends the recovered BigDataCloud arbitrary-coordinate request", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390"].includes(testInfo.project.name), "bounded runtime-rights proof");
  let leaked = 0;
  page.on("request", (request) => {
    if (request.url().includes("api.bigdatacloud.net/data/reverse-geocode-client")) leaked += 1;
  });

  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
  await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    map.jumpTo({ center: [10.7522, 59.9139], zoom: 14 });
  });
  await page.waitForTimeout(500);
  await page.locator(".maplibregl-canvas").click({ position: { x: 240, y: 220 } });
  await page.waitForTimeout(500);
  expect(leaked).toBe(0);
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

test("priority place language resolves Norway, Oslofjord, Bay of Biscay and Amazonia", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390"].includes(testInfo.project.name), "bounded place-search proof");
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());

  const input = page.getByRole("textbox", { name: /search the living planet/i });
  for (const [query, expected] of [
    ["Norway", "Norway"],
    ["Oslofjord", "Oslofjord"],
    ["Bay of Biscay", "Bay of Biscay"],
    ["Amazonia", "Amazon Basin"],
  ] as const) {
    await input.fill(query);
    await expect(page.locator(".results .ritem").filter({ hasText: expected }).first()).toBeVisible({ timeout: 5_000 });
  }
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

test("TIME state survives sharing, camera movement and deep-link restore", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390", "webkit-desktop"].includes(testInfo.project.name), "bounded time/deeplink proof");
  await page.goto(`${ATLAS}?l=emodnet-fishing-vessel-density`);
  await page.waitForFunction(() => (window as any).__4planet_map?.getSource?.("emodnet-fishing-vessel-density"));

  await page.getByRole("button", { name: /TIME/ }).click();
  await page.getByRole("button", { name: "2021", exact: true }).click();
  await expect(page).toHaveURL(/atlasTime=emodnet-fishing-vessel-density%3A2021-01-01T00%3A00%3A00Z/);

  await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    map.jumpTo({ center: [-5, 46], zoom: 5.2 });
  });
  await page.waitForFunction(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("atlasTime")?.includes("emodnet-fishing-vessel-density:2021-01-01T00:00:00Z");
  });

  const shared = page.url();
  await page.goto(shared);
  await page.waitForFunction(() => (window as any).__4planet_map?.getSource?.("emodnet-fishing-vessel-density"));
  await page.getByRole("button", { name: /TIME/ }).click();
  await expect(page.getByRole("button", { name: "2021", exact: true })).toHaveClass(/on/);
});

test("My Atlas explains local storage in human language", async ({ page }) => {
  await page.goto(ATLAS);
  await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
  await page.getByRole("button", { name: /MY ATLAS/ }).click();
  await expect(page.getByText("SAVED ON THIS DEVICE", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "SAVE CURRENT VIEW +", exact: true })).toBeVisible();
  await expect(page.getByText(/Nothing is uploaded or shared unless you choose to share a link/i)).toBeVisible();
});
