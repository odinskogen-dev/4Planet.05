import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";
const ATLAS = `${BASE}/atlas`;

declare global {
  interface Window { __4planet_map: any; }
}

const fixtures: Record<string, unknown[]> = {
  mab001: [{
    mab_id: "MAB-TEST-01",
    title_en: "Test Biosphere Reserve",
    iso2: "NO",
    country_title_en: "Norway",
    date: "2024",
    introduction_en: "Bounded QA fixture",
    coordinates: { lat: 60, lon: 10 },
  }],
  whc001: [{
    id_no: 101,
    name_en: "Test World Heritage Site",
    category: "Natural",
    states_names: "Norway",
    iso_codes: "NO",
    date_inscribed: "2005",
    short_description_en: "Bounded QA fixture",
    coordinates: { lat: 61, lon: 11 },
  }],
  eg0001: [{
    ugg_id: "UGG-TEST-01",
    title_en: "Test Global Geopark",
    countries: "NO",
    date: "2025",
    introduction_en: "Bounded QA fixture",
    coordinates: { lat: 62, lon: 12 },
  }],
  ioc001: [{
    area_id: "EEZ:TEST",
    area_name: "Test Ocean Biodiversity Area",
    area_type: "EEZ",
    country_iso2: "NO",
    country_title_en: "Norway",
    n_observations: 1500,
    n_species: 220,
    n_taxa: 280,
    n_datasets: 18,
    n_threatened_species: 4,
    pct_threatened: 0.018,
    year_first: 1980,
    year_last: 2026,
    source_url: "https://obis.org",
    coordinates: { lat: 58, lon: 5 },
  }],
};

async function installUnescoFixtures(page: Page, failingDataset?: string) {
  await page.route(/\/api\/unesco-data\?dataset=/, async (route) => {
    const url = new URL(route.request().url());
    const dataset = url.searchParams.get("dataset") || "";
    if (dataset === failingDataset) {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, dataset, error: "QA_UPSTREAM_UNAVAILABLE", records: [] }),
      });
      return;
    }
    const records = fixtures[dataset] || [];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        dataset,
        retrievedAt: "2026-10-13T12:00:00Z",
        totalCount: records.length,
        truncated: false,
        records,
        rights: {
          licence: "CC BY-SA 4.0",
          licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
          attribution: dataset === "ioc001" ? "OBIS" : "UNESCO",
          shareAlike: true,
          termsCheckedAt: "2026-10-13",
        },
      }),
    });
  });
}

async function waitForAtlas(page: Page) {
  await page.waitForFunction(() => Boolean((window as any).__4planet_map?.isStyleLoaded?.()), undefined, { timeout: 25_000 });
}

test("GREEN DATA — four curated UNESCO layers render through the existing ATLAS engine", async ({ page }) => {
  await installUnescoFixtures(page);
  await page.goto(
    `${ATLAS}?l=unesco-biospheres,unesco-world-heritage,unesco-geoparks,unesco-ocean-biodiversity&c=9,60&z=4`,
  );
  await waitForAtlas(page);

  const ids = [
    "unesco-biospheres",
    "unesco-world-heritage",
    "unesco-geoparks",
    "unesco-ocean-biodiversity",
  ];

  await page.waitForFunction((layerIds) => {
    const map = (window as any).__4planet_map;
    return layerIds.every((id: string) => Boolean(map?.getLayer?.(id)) && Boolean(map?.getSource?.(id)));
  }, ids, { timeout: 25_000 });

  const counts = await page.evaluate((layerIds) => {
    const map = (window as any).__4planet_map;
    return Object.fromEntries(layerIds.map((id: string) => [id, map.querySourceFeatures(id).length]));
  }, ids);
  for (const id of ids) expect(counts[id]).toBeGreaterThan(0);

  await page.getByRole("button", { name: "LAYERS" }).click();
  for (const label of ["BIOSPHERE RESERVES", "WORLD HERITAGE", "GLOBAL GEOPARKS", "OCEAN BIODIVERSITY AREAS"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }

  const biosphereRow = page.locator(".atlas-row").filter({ hasText: "BIOSPHERE RESERVES" }).first();
  await biosphereRow.getByRole("button", { name: "About this layer" }).click();
  await expect(page.getByText(/representative coordinates.*not reserve boundaries/i)).toBeVisible();
  await expect(page.getByText(/RIGHTS.*CC BY-SA 4\.0.*ShareAlike/i)).toBeVisible();
  await expect(page.getByText(/TIME.*Designation \/ source-record dates/i)).toBeVisible();

  const bodyWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const viewport = page.viewportSize();
  if (viewport) expect(bodyWidth).toBeLessThanOrEqual(viewport.width);
});

test("GREEN DATA — source failure remains unavailable and never becomes a zero-data claim", async ({ page }) => {
  await installUnescoFixtures(page, "eg0001");
  await page.goto(`${ATLAS}?l=unesco-geoparks&c=10,60&z=4`);
  await waitForAtlas(page);

  await page.getByRole("button", { name: "LAYERS" }).click();
  const row = page.locator(".atlas-row").filter({ hasText: "GLOBAL GEOPARKS" }).first();
  await expect(row.locator(".st")).toHaveText("OFFLINE", { timeout: 20_000 });

  const state = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    return { layer: Boolean(map?.getLayer?.("unesco-geoparks")), source: Boolean(map?.getSource?.("unesco-geoparks")) };
  });
  expect(state).toEqual({ layer: false, source: false });
  await expect(row).not.toContainText(/0\s*[·•]/);
});
