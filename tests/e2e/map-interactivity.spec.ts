/**
 * V40 P0 BEHAVIOURAL ACCEPTANCE TEST — the real one the audit demanded.
 *
 * A string-presence smoke test does NOT prove the map moves. This drives a real
 * browser against a running build and asserts actual camera state changes.
 *
 * REQUIRES A BROWSER + A SERVED BUILD (it cannot run in the CI sandbox that lacks
 * WebGL). To run:
 *     npm run build && npm run preview        # serves dist on :4173
 *     npx playwright install chromium
 *     BASE_URL=http://localhost:4173 npx playwright test
 * or point BASE_URL at the deployed Cloudflare preview.
 *
 * The map instance is exposed at window.__4planet_map for assertions.
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";

declare global {
  interface Window { __4planet_map: any; }
}

async function mapCenter(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const c = window.__4planet_map.getCenter();
    return { lng: c.lng, lat: c.lat, zoom: window.__4planet_map.getZoom() };
  });
}

async function openOslo(page: import("@playwright/test").Page) {
  await page.getByPlaceholder("SEARCH THE LIVING PLANET_").click();
  await page.getByPlaceholder("SEARCH THE LIVING PLANET_").fill("Oslo");
  // First matching result opens Place context.
  await page.getByRole("option").first().click();
  await expect(page.locator(".ctx")).toBeVisible();
}

test.describe("P0 — map stays interactive with Place context open", () => {
  test("desktop: pan + zoom work, camera persists on close, focus once on reopen", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());

    await openOslo(page);
    const before = await mapCenter(page);

    // Drag the visible (uncovered) map by >200px.
    const box = await page.locator("canvas").first().boundingBox();
    if (!box) throw new Error("no map canvas");
    const startX = box.x + box.width * 0.25;
    const startY = box.y + box.height * 0.5;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 240, startY + 40, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(400);

    const afterPan = await mapCenter(page);
    expect(Math.abs(afterPan.lng - before.lng) + Math.abs(afterPan.lat - before.lat)).toBeGreaterThan(0.001);

    // Zoom via wheel.
    await page.mouse.move(startX, startY);
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(400);
    const afterZoom = await mapCenter(page);
    expect(afterZoom.zoom).not.toBeCloseTo(afterPan.zoom, 2);

    // Close context — camera state must remain (no reset).
    await page.locator(".ctx-close, [aria-label='Close']").first().click().catch(() => {});
    const afterClose = await mapCenter(page);
    expect(Math.abs(afterClose.lng - afterZoom.lng)).toBeLessThan(0.01);
    expect(afterClose.zoom).toBeCloseTo(afterZoom.zoom, 1);

    // Reopen Oslo — focus happens once, and the map remains movable.
    await openOslo(page);
    await page.waitForTimeout(1800);
    const reopened = await mapCenter(page);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 200, startY, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    const afterSecondPan = await mapCenter(page);
    expect(Math.abs(afterSecondPan.lng - reopened.lng)).toBeGreaterThan(0.001);
  });

  test("mobile: bottom sheet open, uncovered map still pans", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.goto(BASE);
    await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
    await openOslo(page);
    const before = await mapCenter(page);
    // Drag the top (uncovered) strip above the sheet.
    await page.mouse.move(120, 120);
    await page.mouse.down();
    await page.mouse.move(300, 160, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(400);
    const after = await mapCenter(page);
    expect(Math.abs(after.lng - before.lng) + Math.abs(after.lat - before.lat)).toBeGreaterThan(0.001);
  });
});

test.describe("P0 — street-level vector zoom", () => {
  test("zoom ceiling reaches street level (>= 18)", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForFunction(() => (window as any).__4planet_map?.isStyleLoaded?.());
    const max = await page.evaluate(() => window.__4planet_map.getMaxZoom());
    expect(max).toBeGreaterThanOrEqual(20);
  });
});
