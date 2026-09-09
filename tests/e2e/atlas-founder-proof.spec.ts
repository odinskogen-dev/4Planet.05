import { test, expect, type Page, type TestInfo } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const ATLAS = `${BASE}/atlas`;

declare global {
  interface Window { __4planet_map: any; }
}

async function waitForAtlas(page: Page) {
  await page.waitForFunction(() => {
    const map = (window as any).__4planet_map;
    return Boolean(map?.isStyleLoaded?.());
  }, undefined, { timeout: 20_000 });
}

async function waitForMapIdle(page: Page) {
  await page.waitForFunction(() => {
    const map = (window as any).__4planet_map;
    return map && !map.isMoving() && !map.isZooming() && !map.isRotating();
  }, undefined, { timeout: 15_000 });
}

async function shot(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({ path: testInfo.outputPath(name), fullPage: true });
}

async function moveMap(page: Page, center: [number, number], zoom: number) {
  await page.evaluate(({ center, zoom }) => {
    const map = (window as any).__4planet_map;
    map.jumpTo({ center, zoom });
  }, { center, zoom });
  await waitForMapIdle(page);
}

test("FOUNDER PROOF — desktop ATLAS is one coherent product surface", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "desktop Founder evidence only");
  await page.goto(ATLAS);
  await waitForAtlas(page);
  await expect(page.locator(".atlas-identity")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: /search the living planet/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "LAYERS" })).toBeVisible();
  await shot(page, testInfo, "founder-01-desktop-atlas.png");
});

test("FOUNDER PROOF — iPhone-sized ATLAS is composed without control collisions", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390", "mobile Founder evidence only");
  await page.goto(ATLAS);
  await waitForAtlas(page);
  await expect(page.getByRole("textbox", { name: /search the living planet/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "LAYERS" })).toBeVisible();
  await shot(page, testInfo, "founder-02-iphone-390-atlas.png");
});

test("FOUNDER PROOF — premium dark vector map survives street-level zoom", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "desktop close-zoom Founder evidence only");
  await page.goto(`${ATLAS}?l=bluemarble&c=10.7522,59.9139&z=15`);
  await waitForAtlas(page);
  await page.waitForFunction(() => document.documentElement.dataset.atlasZoomBand === "STREET", undefined, { timeout: 15_000 });
  await page.waitForFunction(() => String((window as any).__4planet_map?.getStyle?.()?.name || "").toLowerCase().includes("dark"), undefined, { timeout: 15_000 });
  const proof = await page.evaluate(() => ({
    band: document.documentElement.dataset.atlasZoomBand,
    quality: document.documentElement.dataset.atlasStreetQuality,
    symbols: Number(document.documentElement.dataset.atlasVisibleSymbolLayers || "0"),
    projection: (window as any).__4planet_map?.getProjection?.()?.type,
    style: String((window as any).__4planet_map?.getStyle?.()?.name || ""),
  }));
  expect(proof.band).toBe("STREET");
  expect(proof.quality).toBe("vector");
  expect(proof.symbols).toBeGreaterThan(0);
  expect(proof.projection).toBe("mercator");
  expect(proof.style.toLowerCase()).toContain("dark");
  await shot(page, testInfo, "founder-03-dark-close-zoom-oslo.png");
});

test("FOUNDER PROOF — multiple planetary data layers coexist on the same map", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "desktop multi-layer Founder evidence only");
  await page.goto(`${ATLAS}?l=bluemarble,fires,forest,quakes&c=-58,-7&z=4.6`);
  await waitForAtlas(page);
  await page.waitForFunction(() => {
    const map = (window as any).__4planet_map;
    return ["bluemarble", "fires", "forest", "quakes"].filter((id) => Boolean(map?.getLayer?.(id))).length >= 4;
  }, undefined, { timeout: 20_000 });
  await waitForMapIdle(page);
  await page.getByRole("button", { name: "LAYERS" }).click();
  for (const label of ["EARTH · BLUE MARBLE", "ACTIVE FIRES", "FOREST LOSS", "EARTHQUAKES"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await shot(page, testInfo, "founder-04-multi-layer-amazonia.png");
});

test("FOUNDER PROOF — ordinary language search activates the correct source layer", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "desktop search Founder evidence only");
  await page.goto(ATLAS);
  await waitForAtlas(page);
  const search = page.getByRole("textbox", { name: /search the living planet/i });
  await search.fill("wildfires");
  const result = page.locator('[data-atlas-intent-layer="fires"]').first();
  await expect(result).toBeVisible();
  await expect(result).toContainText("ACTIVE FIRES");
  await expect(result).toContainText("NASA GIBS / MODIS");
  await shot(page, testInfo, "founder-05-search-wildfires.png");
  await result.click();
  await waitForAtlas(page);
  await expect(page).toHaveURL(/(?:^|[?&])l=[^&]*fires/);
  expect(await page.evaluate(() => Boolean((window as any).__4planet_map?.getLayer?.("fires")))).toBe(true);
});

test("real GBIF Orca source snapshot moves ATLAS → SPECIES → back without losing map context", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "webkit-desktop", "mobile-390", "webkit-390"].includes(testInfo.project.name), "core cross-product projects only");
  await page.goto(`${ATLAS}?record=orca-bundled&c=-5,46&z=6&l=bluemarble`);
  await waitForAtlas(page);
  await expect(page.locator(".ctx-kind")).toContainText("OBSERVATION");
  await expect(page.getByText(/BUNDLED SOURCE SNAPSHOT · NOT LIVE/i)).toBeVisible();
  await expect(page.getByText(/historical observation, not the animal's current position/i)).toBeVisible();
  await expect(page.getByText(/See this record at GBIF/i)).toBeVisible();

  const before = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const c = map.getCenter();
    return { lng: c.lng, lat: c.lat, zoom: map.getZoom() };
  });

  const speciesLink = page.getByRole("link", { name: /Open Orca in SPECIES/i });
  await expect(speciesLink).toBeVisible();
  await speciesLink.click();
  await expect(page).toHaveURL(/\/species\/orca/);
  await expect(page).toHaveURL(/returnTo=/);
  await expect(page.getByText(/Orca|Killer whale/i).first()).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/atlas\?/);
  await expect(page).toHaveURL(/record=orca-bundled/);
  await waitForAtlas(page);
  await expect(page.locator(".ctx-kind")).toContainText("OBSERVATION");
  const after = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const c = map.getCenter();
    return { lng: c.lng, lat: c.lat, zoom: map.getZoom() };
  });
  expect(Math.abs(after.lng - before.lng)).toBeLessThan(0.05);
  expect(Math.abs(after.lat - before.lat)).toBeLessThan(0.05);
  expect(Math.abs(after.zoom - before.zoom)).toBeLessThan(0.05);
});

test("dark/light switches preserve active layers and camera", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "webkit-desktop", "mobile-390", "webkit-390"].includes(testInfo.project.name), "core theme projects only");
  await page.goto(`${ATLAS}?l=bluemarble,fires&c=10.7522,59.9139&z=8`);
  await waitForAtlas(page);
  await page.getByRole("button", { name: "LAYERS" }).click();
  const before = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const c = map.getCenter();
    return { lng: c.lng, lat: c.lat, zoom: map.getZoom(), fires: Boolean(map.getLayer("fires")) };
  });
  expect(before.fires).toBe(true);
  await page.getByRole("button", { name: "LIGHT" }).click();
  await page.waitForFunction(() => String((window as any).__4planet_map?.getStyle?.()?.name || "").toLowerCase().includes("light"), undefined, { timeout: 15_000 });
  expect(await page.evaluate(() => Boolean((window as any).__4planet_map?.getLayer?.("fires")))).toBe(true);
  await page.getByRole("button", { name: "DARK" }).click();
  await page.waitForFunction(() => String((window as any).__4planet_map?.getStyle?.()?.name || "").toLowerCase().includes("dark"), undefined, { timeout: 15_000 });
  const after = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const c = map.getCenter();
    return { lng: c.lng, lat: c.lat, zoom: map.getZoom(), fires: Boolean(map.getLayer("fires")) };
  });
  expect(after.fires).toBe(true);
  expect(Math.abs(after.lng - before.lng)).toBeLessThan(0.05);
  expect(Math.abs(after.lat - before.lat)).toBeLessThan(0.05);
  expect(Math.abs(after.zoom - before.zoom)).toBeLessThan(0.05);
});

test("repeated layer/context open-close never locks pan or zoom", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "webkit-desktop"].includes(testInfo.project.name), "desktop interaction proof only");
  await page.goto(ATLAS);
  await waitForAtlas(page);
  for (let i = 0; i < 3; i += 1) {
    await page.getByRole("button", { name: "LAYERS" }).click();
    await expect(page.locator(".atlas-panel:not(.rest)")).toBeVisible();
    await page.locator(".atlas-panel .sect").click();
    await expect(page.locator(".atlas-panel.rest")).toBeVisible();
  }

  const search = page.getByRole("textbox", { name: /search the living planet/i });
  await search.fill("Oslofjord");
  await page.locator(".results .ritem").filter({ hasText: "Oslofjord" }).first().click();
  await expect(page.locator(".ctx")).toBeVisible();
  await page.locator(".ctx-close").click();
  await expect(page.locator(".ctx")).toBeHidden();

  const before = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const c = map.getCenter();
    return { lng: c.lng, lat: c.lat, zoom: map.getZoom() };
  });
  await moveMap(page, [before.lng + 1.5, before.lat + 0.5], before.zoom + 1);
  const after = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const c = map.getCenter();
    return { lng: c.lng, lat: c.lat, zoom: map.getZoom() };
  });
  expect(Math.abs(after.lng - before.lng) + Math.abs(after.lat - before.lat)).toBeGreaterThan(0.2);
  expect(after.zoom).toBeGreaterThan(before.zoom + 0.5);
});
