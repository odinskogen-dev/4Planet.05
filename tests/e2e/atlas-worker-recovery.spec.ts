import { test, expect } from "@playwright/test";

/**
 * Isolated regression for Magazine release's MapLibre v6 runtime.
 * The missing worker previously resolved to SPA HTML (HTTP 200, text/html).
 * Do not waive map readiness or permit a false positive on status 200 alone.
 */
test("ATLAS receives executable MapLibre worker and reaches a loaded map state", async ({ page }) => {
  const workerResponses: { url: string; status: number; type: string }[] = [];
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (!/maplibre-gl-worker|maplibre.*worker/i.test(response.url())) return;
    workerResponses.push({
      url: response.url(),
      status: response.status(),
      type: response.headers()["content-type"] || "",
    });
  });
  await page.goto("/atlas?record=orca-bundled", { waitUntil: "load" });
  await page.waitForFunction(
    () => Boolean((window as any).__4planet_map),
    undefined,
    { timeout: 20_000 },
  );
  await page.waitForFunction(
    () => Boolean((window as any).__4planet_map?.isStyleLoaded()),
    undefined,
    { timeout: 40_000 },
  );
  expect(workerResponses.length, "No dedicated MapLibre worker request observed").toBeGreaterThan(0);
  for (const response of workerResponses) {
    expect(response.status, response.url).toBe(200);
    expect(response.type, "Map worker must be JavaScript, not SPA HTML").toMatch(/javascript|ecmascript/);
  }
  expect(errors.filter(x => /worker|maplibre/i.test(x)), "Map worker errors").toEqual([]);
  const state = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const canvas = map.getCanvas();
    return { zoom: map.getZoom(), center: map.getCenter(), canvasWidth: canvas.width, canvasHeight: canvas.height };
  });
  // Dynamic overlays may temporarily unset isStyleLoaded() *after* the successful
  // readiness wait above. A second read here would race later style updates.
  expect(state.canvasWidth).toBeGreaterThan(0);
  expect(state.canvasHeight).toBeGreaterThan(0);
  expect(Number.isFinite(state.zoom)).toBe(true);
  expect(Number.isFinite(state.center.lng)).toBe(true);
});
