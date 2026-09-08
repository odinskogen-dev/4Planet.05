import { test, expect, type Locator, type Page } from "@playwright/test";

async function waitForAtlas(page: Page) {
  await page.waitForFunction(() => {
    const map = (window as any).__4planet_map;
    return Boolean(map?.isStyleLoaded?.());
  }, undefined, { timeout: 25_000 });
}

async function visibleBox(locator: Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

async function expectNoOverlap(a: Locator, b: Locator) {
  const [boxA, boxB] = await Promise.all([visibleBox(a), visibleBox(b)]);
  expect(overlaps(boxA, boxB)).toBe(false);
}

test("CORE PARENT — ATLAS carries explicit 4PLANET identity", async ({ page }) => {
  await page.goto("/atlas");
  await waitForAtlas(page);
  const identity = page.locator(".atlas-product-identity");
  await expect(identity).toBeVisible();
  await expect(identity).toContainText("4PLANET_");
  await expect(identity).toContainText("ATLAS");
  await expect(identity.getByRole("link")).toHaveAttribute("href", "/");
});

test("CORE PARENT — mobile ATLAS primary controls do not collide", async ({ page }, testInfo) => {
  test.skip(!["mobile-390", "mobile-430", "webkit-390", "webkit-430"].includes(testInfo.project.name), "mobile geometry proof only");
  await page.goto("/atlas");
  await waitForAtlas(page);

  const identity = page.locator(".atlas-product-identity");
  const search = page.locator(".search-line");
  const lenses = page.locator(".lens-rail");
  const layers = page.locator(".atlas-panel.rest");
  const myAtlas = page.locator(".atlas-saved-views");
  const status = page.locator(".status-strip");
  const mapControls = page.locator(".maplibregl-ctrl-bottom-right");

  for (const locator of [identity, search, lenses, layers, myAtlas, status, mapControls]) {
    await expect(locator).toBeVisible();
  }

  await expectNoOverlap(identity, search);
  await expectNoOverlap(search, lenses);
  await expectNoOverlap(lenses, layers);
  await expectNoOverlap(lenses, myAtlas);
  await expectNoOverlap(layers, myAtlas);
  await expectNoOverlap(mapControls, status);

  const time = page.locator(".atlas-leading-time");
  if (await time.isVisible().catch(() => false)) {
    await expectNoOverlap(layers, time);
    await expectNoOverlap(myAtlas, time);
  }

  const viewport = page.viewportSize()!;
  const floating = [identity, search, lenses, layers, myAtlas, mapControls];
  for (const locator of floating) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-0.5);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 0.5);
    expect(box!.y).toBeGreaterThanOrEqual(-0.5);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 0.5);
  }
});

test("CORE PARENT — returned mobile camera remains the user-created camera after responsive settling", async ({ page }, testInfo) => {
  test.skip(!["mobile-390", "mobile-430", "webkit-390", "webkit-430"].includes(testInfo.project.name), "mobile return-camera proof only");

  const target = { zoom: 7.35, lng: -6.25, lat: 46.4 };
  await page.goto(`/atlas?record=orca-bundled&z=${target.zoom}&c=${target.lng},${target.lat}`);
  await waitForAtlas(page);
  await page.getByText("BUNDLED SOURCE SNAPSHOT", { exact: false }).waitFor({ state: "visible", timeout: 20_000 });

  await page.waitForTimeout(4_200);
  const settled = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const center = map.getCenter();
    return { zoom: map.getZoom(), lng: center.lng, lat: center.lat };
  });

  expect(Math.abs(settled.zoom - target.zoom)).toBeLessThanOrEqual(0.05);
  expect(Math.abs(settled.lng - target.lng)).toBeLessThanOrEqual(0.05);
  expect(Math.abs(settled.lat - target.lat)).toBeLessThanOrEqual(0.05);

  // The camera becomes user-owned only after a genuine input boundary. A raw
  // map.jumpTo() is application code, not a user gesture, so it must not be used
  // to claim that startup authority should have released. Explicitly cross the
  // same pointer boundary a real touch/drag crosses, then prove later map state
  // is no longer reclaimed by return-camera reconstruction.
  const canvas = page.locator("canvas.maplibregl-canvas");
  await canvas.dispatchEvent("pointerdown", { pointerType: "touch", isPrimary: true, button: 0, buttons: 1 });
  await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    map.jumpTo({ center: [-7.1, 47.1], zoom: 8.1 });
  });
  await page.waitForTimeout(700);
  const userOwned = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const center = map.getCenter();
    return { zoom: map.getZoom(), lng: center.lng, lat: center.lat };
  });
  expect(Math.abs(userOwned.zoom - 8.1)).toBeLessThanOrEqual(0.05);
  expect(Math.abs(userOwned.lng - -7.1)).toBeLessThanOrEqual(0.05);
  expect(Math.abs(userOwned.lat - 47.1)).toBeLessThanOrEqual(0.05);
});
