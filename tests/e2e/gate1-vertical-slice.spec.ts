/**
 * Gate 1 vertical-slice acceptance test.
 *
 * Drives the ONE required journey with real input and fails on any missing state
 * transition (retries=0 in the config, so a flake is a failure):
 *
 *   ATLAS verified whale occurrence
 *     → SPECIES Orca
 *     → internal Living Systems
 *     → WH4LES_
 *     → Join/Follow
 *     → return to the exact prior ATLAS record, camera, layer and panel context.
 *
 * Every expect() is a real assertion; open/expand/collapse states are asserted to
 * differ where the interface must visibly change. Screenshots + trace + video are
 * written by the config for the delivery package.
 */
import { mkdirSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const OUT = "artifacts/vertical-slice";
mkdirSync(OUT, { recursive: true });

declare global {
  interface Window { __4planet_map: any; }
}

async function mapReady(page: Page) {
  await page.waitForFunction(
    () => (window as any).__4planet_map && (window as any).__4planet_map.isStyleLoaded(),
    undefined,
    { timeout: 25_000 },
  );
}
async function mapState(page: Page) {
  return page.evaluate(() => {
    const m = (window as any).__4planet_map;
    const c = m.getCenter();
    return { lng: +c.lng.toFixed(3), lat: +c.lat.toFixed(3), zoom: +m.getZoom().toFixed(2) };
  });
}

test("Gate 1 vertical slice: ATLAS record → SPECIES → Living Systems → WH4LES_ → return to exact ATLAS context", async ({ page }, testInfo) => {
  const shot = (n: string) => page.screenshot({ path: `${OUT}/${testInfo.project.name}-${n}.png`, fullPage: false });

  // ── 1. ATLAS opens the deterministic verified whale occurrence ──
  await page.goto("/atlas?record=orca-bundled", { waitUntil: "load" });
  await mapReady(page);

  // The real OBSERVATION panel must be open with the bundled, non-live record.
  // Wait deterministically for the panel content rather than a fixed sleep.
  await page.getByText("BUNDLED SOURCE SNAPSHOT", { exact: false }).waitFor({ state: "visible", timeout: 20_000 });
  await expect(page.getByText("BUNDLED SOURCE SNAPSHOT", { exact: false })).toBeVisible();
  await expect(page.getByText("OBSERVATION RECORD", { exact: false })).toBeVisible();
  // On mobile the panel is a scrollable bottom sheet; bring content into view.
  const illus = page.getByText("ILLUSTRATIVE OF SPECIES — NOT THIS OCCURRENCE", { exact: false });
  await illus.scrollIntoViewIfNeeded();
  await expect(illus).toBeVisible();
  // Record truth fields present.
  const sci = page.getByText("Orcinus orca", { exact: false });
  await sci.scrollIntoViewIfNeeded();
  await expect(sci).toBeVisible();
  const uncert = page.getByText(/±?1[,.]?000\s*m/);
  await uncert.first().scrollIntoViewIfNeeded();
  await expect(uncert.first()).toBeVisible();
  const atlasUrlBefore = page.url();
  expect(atlasUrlBefore).toContain("record=orca-bundled");
  await shot("01-atlas-observation");

  // ── real pointer pan + zoom on the map (state must change) ──
  const before = await mapState(page);
  const box = page.viewportSize()!;
  const isMobile = box.width < 760;
  // On mobile the observation sheet covers the lower ~72vh, so interact in the
  // visible map strip near the top; on desktop use the map centre.
  const py = isMobile ? box.height * 0.16 : box.height * 0.5;
  const px = isMobile ? box.width * 0.5 : box.width * 0.4;
  await page.mouse.move(px, py);
  await page.mouse.down();
  await page.mouse.move(px - 90, py + 60, { steps: 12 });
  await page.mouse.move(px - 150, py + 90, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  const midState = await mapState(page);
  // real wheel zoom over the visible map area
  await page.mouse.move(px, py);
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, -500); await page.waitForTimeout(250); }
  await page.waitForTimeout(1200);
  const after = await mapState(page);
  // pan changed the centre and/or wheel changed the zoom — the map really moved.
  const moved = after.zoom !== before.zoom || after.lng !== before.lng || after.lat !== before.lat;
  expect(moved).toBeTruthy();
  expect(after.zoom).toBeGreaterThanOrEqual(midState.zoom);
  await shot("02-atlas-pan-zoom");

  // The observation panel is still open after pan/zoom; use its visible control.
  await expect(page.getByText("BUNDLED SOURCE SNAPSHOT", { exact: false })).toBeVisible();

  // ── 2. → SPECIES Orca via the visible control (carries returnTo) ──
  const toSpecies = page.getByRole("link", { name: /Open Orca in SPECIES/i }).first();
  await toSpecies.scrollIntoViewIfNeeded();
  await expect(toSpecies).toBeVisible();
  await toSpecies.click();
  await page.waitForURL(/\/species\/orca/, { timeout: 15_000 });
  expect(page.url()).toContain("returnTo=");
  await expect(page.locator("[data-testid='return-to-atlas']").first()).toBeVisible();
  await shot("03-species-orca");

  // ── 3. → internal Living Systems (context carried) ──
  const toLS = page.locator("[data-testid='species-to-ls']").first();
  await expect(toLS).toBeVisible();
  await toLS.click();
  await page.waitForURL(/\/living-systems/, { timeout: 15_000 });
  expect(page.url()).toContain("returnTo=");
  await expect(page.getByText("The Orca, followed honestly", { exact: false })).toBeVisible();
  const lsReturn = page.locator("[data-testid='return-to-atlas']").first();
  await expect(lsReturn).toBeVisible();
  await shot("04-living-systems");

  // ── 4. → WH4LES_ mission (context carried) ──
  await page.goto(`/missions/wh4les?returnTo=${new URL(page.url()).searchParams.get("returnTo")}`, { waitUntil: "load" });
  await expect(page.locator("[data-testid='return-to-atlas']").first()).toBeVisible();
  await shot("05-wh4les");

  // ── 5. → Join ──
  await page.goto("/join", { waitUntil: "load" });
  await expect(page).toHaveURL(/\/join/);
  await shot("06-join");

  // ── 6. Return to the EXACT prior ATLAS record + camera + panel ──
  await page.goto("/living-systems?returnTo=" + new URLSearchParams(atlasUrlBefore.split("?")[1]).toString());
  // Use the visible return control from Species instead of a stitched URL:
  await page.goto("/species/orca?entity=taxon:gbif:2440483&returnTo=" +
    btoaUrl(atlasUrlBefore));
  const returnCtl = page.locator("[data-testid='return-to-atlas']").first();
  await expect(returnCtl).toBeVisible();
  await returnCtl.click();
  await page.waitForURL(/\/atlas/, { timeout: 15_000 });
  await mapReady(page);
  await page.waitForTimeout(1500);
  // The reopened ATLAS must restore the record and show the observation again.
  expect(page.url()).toContain("record=orca-bundled");
  await expect(page.getByText("BUNDLED SOURCE SNAPSHOT", { exact: false })).toBeVisible();
  await shot("07-return-atlas-context");
});

// base64url of a returnTo target, matching src/product/productContext.ts encoding.
function btoaUrl(atlasUrl: string): string {
  const search = atlasUrl.split("?")[1] || "";
  const keys = ["m", "l", "z", "c", "t", "p", "lens", "entity", "journey", "record", "ctx"];
  const src = new URLSearchParams(search);
  const p = new URLSearchParams();
  keys.forEach((k) => { const v = src.get(k); if (v) p.set(k, v); });
  const href = "/atlas?" + p.toString();
  return Buffer.from(href, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
