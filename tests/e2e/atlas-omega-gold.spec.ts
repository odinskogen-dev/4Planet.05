import { test, expect, type Page, type TestInfo } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const ATLAS = `${BASE}/atlas`;
const REMOTE = process.env.REQUIRE_REMOTE_SOURCES === "1";
const EVIDENCE = process.env.ATLAS_GOLD_EVIDENCE_DIR || "artifacts/atlas-gold";

declare global {
  interface Window { __4planet_map: any; }
}

async function waitForAtlas(page: Page) {
  await page.waitForFunction(() => Boolean((window as any).__4planet_map?.isStyleLoaded?.()), undefined, { timeout: 25_000 });
}

async function waitForIdle(page: Page) {
  await page.waitForFunction(() => {
    const map = (window as any).__4planet_map;
    return Boolean(map && !map.isMoving?.() && !map.isZooming?.() && !map.isRotating?.());
  }, undefined, { timeout: 20_000 });
}

async function evidence(page: Page, name: string) {
  await page.screenshot({ path: `${EVIDENCE}/${name}`, fullPage: true });
}

async function selectOrca(page: Page) {
  const search = page.getByRole("textbox", { name: /search the living planet/i });
  await search.fill("orca");
  const row = page.locator(".results .ritem").filter({ hasText: "Orcinus orca" }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.click();
  await expect(page).toHaveURL(/entity=taxon%3Agbif%3A\d+|entity=taxon:gbif:\d+/, { timeout: 20_000 });
}

async function waitForSourceState(page: Page, key: "atlasFirmsRecordState" | "atlasInatRecordState") {
  await page.waitForFunction((datasetKey) => {
    const value = (document.documentElement.dataset as any)[datasetKey];
    return value && !["inactive", "loading"].includes(value);
  }, key, { timeout: 30_000 });
  return page.evaluate((datasetKey) => (document.documentElement.dataset as any)[datasetKey] || "", key);
}

test("OMEGA — ordinary typo still resolves human signal intent", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390", "webkit-desktop"].includes(testInfo.project.name), "bounded search proof");
  await page.goto(ATLAS);
  await waitForAtlas(page);
  const search = page.getByRole("textbox", { name: /search the living planet/i });
  await search.fill("earhquakes");
  const row = page.locator('[data-atlas-intent-layer="quakes"]').first();
  await expect(row).toBeVisible();
  await expect(row).toContainText("EARTHQUAKES");
});

test("OMEGA — FIRMS detail refines fires without turning failure or empty data into zero", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390", "webkit-desktop"].includes(testInfo.project.name), "bounded source-state proof");
  await page.goto(`${ATLAS}?l=bluemarble,fires,forest&c=-58,-7&z=5.4`);
  await waitForAtlas(page);
  const state = await waitForSourceState(page, "atlasFirmsRecordState");
  expect(["live", "empty", "stale", "unavailable", "zoom_required"]).toContain(state);

  if (state === "empty") {
    await expect(page.getByText(/NO DETECTIONS RETURNED.*NOT PROOF OF NO FIRE/i)).toBeVisible();
  }
  if (state === "unavailable") {
    await expect(page.getByText(/FIRMS DETAIL UNAVAILABLE/i)).toBeVisible();
  }
  if (state === "stale") {
    await expect(page.getByText(/LAST-GOOD DETECTIONS/i)).toBeVisible();
  }

  // The global NASA fire layer remains the stable context even when optional
  // record-level FIRMS detail cannot be returned.
  expect(await page.evaluate(() => Boolean((window as any).__4planet_map?.getLayer?.("fires")))).toBe(true);
});

test("OMEGA — exact Orca identity unlocks real iNaturalist observations with truth-safe semantics", async ({ page }, testInfo) => {
  test.skip(!["desktop-1440", "mobile-390", "webkit-desktop", "webkit-390"].includes(testInfo.project.name), "bounded species depth proof");
  await page.goto(ATLAS);
  await waitForAtlas(page);
  await selectOrca(page);
  const state = await waitForSourceState(page, "atlasInatRecordState");

  if (REMOTE) {
    expect(state).toBe("live");
    const count = Number(await page.evaluate(() => document.documentElement.dataset.atlasInatRecordCount || "0"));
    expect(count).toBeGreaterThan(0);
    await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.atlasInatTaxon || ""), { timeout: 20_000 }).toBe("Orcinus orca");
  } else {
    expect(["live", "empty", "stale", "unavailable"]).toContain(state);
  }

  if (state === "empty") await expect(page.getByText(/NO RECORDS RETURNED.*NOT PROOF OF SPECIES ABSENCE/i)).toBeVisible();
  if (state === "unavailable") await expect(page.getByText(/iNATURALIST OBSERVATIONS UNAVAILABLE/i)).toBeVisible();
});

test("OMEGA — deployed exact-name iNaturalist endpoint refuses fuzzy identity and returns real Orca records", async ({ page }, testInfo) => {
  test.skip(!REMOTE || !["desktop-1440", "webkit-desktop"].includes(testInfo.project.name), "deployed Functions proof only");
  await page.goto(ATLAS);
  await waitForAtlas(page);

  const result = await page.evaluate(async () => {
    const good = await fetch("/api/inaturalist?q=Orcinus%20orca&perPage=5&quality=research");
    const goodBody = await good.json();
    const fuzzy = await fetch("/api/inaturalist?q=Orcinus%20orcx&perPage=5&quality=research");
    const fuzzyBody = await fuzzy.json();
    return {
      goodStatus: good.status,
      goodBody,
      fuzzyStatus: fuzzy.status,
      fuzzyBody,
    };
  });

  expect(result.goodStatus).toBe(200);
  expect(result.goodBody?.ok).toBe(true);
  expect(result.goodBody?.resolvedTaxon?.name).toBe("Orcinus orca");
  expect(Array.isArray(result.goodBody?.records)).toBe(true);
  expect(result.goodBody.records.length).toBeGreaterThan(0);
  expect(result.fuzzyStatus).toBe(404);
  expect(result.fuzzyBody?.error).toBe("TAXON_NOT_EXACTLY_RESOLVED");
});

test("OMEGA — deployed selected observation answers the seven human questions", async ({ page }, testInfo) => {
  test.skip(!REMOTE || testInfo.project.name !== "desktop-1440", "single immutable desktop evidence capture");
  await page.goto(ATLAS);
  await waitForAtlas(page);
  await selectOrca(page);
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.atlasInatRecordState || ""), { timeout: 30_000 }).toBe("live");

  const record = await page.evaluate(async () => {
    const response = await fetch("/api/inaturalist?q=Orcinus%20orca&perPage=20&quality=research");
    const data = await response.json();
    return (data.records || []).find((row: any) => row?.publicCoordinates) || null;
  });
  expect(record?.publicCoordinates).toBeTruthy();

  await page.evaluate((row: any) => {
    const map = (window as any).__4planet_map;
    map.jumpTo({ center: [row.publicCoordinates.longitude, row.publicCoordinates.latitude], zoom: 13 });
  }, record);
  await waitForIdle(page);
  await page.waitForTimeout(1200);

  const point = await page.evaluate((row: any) => {
    const map = (window as any).__4planet_map;
    const projected = map.project([row.publicCoordinates.longitude, row.publicCoordinates.latitude]);
    return { x: projected.x, y: projected.y };
  }, record);
  await page.locator(".maplibregl-canvas").click({ position: { x: point.x, y: point.y } });

  const inspector = page.locator("[data-atlas-live-record-inspector]");
  await expect(inspector).toBeVisible({ timeout: 10_000 });
  for (const heading of ["WHAT IS THIS?", "WHERE?", "WHEN?", "SOURCE?", "WHAT DO WE KNOW?", "WHAT DON’T WE KNOW?", "WHAT CAN I EXPLORE NEXT?"]) {
    await expect(inspector.getByText(heading, { exact: true })).toBeVisible();
  }
  await expect(inspector).toContainText(/not range, abundance, population trend, live tracking/i);
  await evidence(page, "06-selected-record.png");
});

test("OMEGA EVIDENCE — immutable desktop global, close dark, multi-layer and search", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "single desktop evidence pack");

  await page.goto(ATLAS);
  await waitForAtlas(page);
  await waitForIdle(page);
  await evidence(page, "01-desktop-global.png");

  await page.goto(`${ATLAS}?l=bluemarble&c=10.7522,59.9139&z=15`);
  await waitForAtlas(page);
  await page.waitForFunction(() => document.documentElement.dataset.atlasZoomBand === "STREET", undefined, { timeout: 20_000 });
  await page.waitForFunction(() => String((window as any).__4planet_map?.getStyle?.()?.name || "").toLowerCase().includes("dark"), undefined, { timeout: 20_000 });
  await evidence(page, "02-desktop-close-dark.png");

  await page.goto(`${ATLAS}?l=bluemarble,fires,forest,quakes&c=-58,-7&z=5.4`);
  await waitForAtlas(page);
  await waitForIdle(page);
  await page.getByRole("button", { name: "LAYERS" }).click();
  for (const label of ["EARTH · BLUE MARBLE", "ACTIVE FIRES", "FOREST LOSS", "EARTHQUAKES"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await evidence(page, "04-multi-layer-amazonia.png");

  await page.goto(ATLAS);
  await waitForAtlas(page);
  const search = page.getByRole("textbox", { name: /search the living planet/i });
  await search.fill("wildfires");
  await expect(page.locator('[data-atlas-intent-layer="fires"]').first()).toBeVisible();
  await evidence(page, "05-search.png");
});

test("OMEGA EVIDENCE — iPhone 390 is a first-class ATLAS surface", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390", "single mobile evidence capture");
  await page.goto(ATLAS);
  await waitForAtlas(page);
  await expect(page.getByRole("textbox", { name: /search the living planet/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "LAYERS" })).toBeVisible();
  const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(390);
  await evidence(page, "03-iphone-390.png");
});
