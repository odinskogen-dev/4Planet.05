import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const PROFILES = [
  ["global-biodiversity-information-facility", "Global Biodiversity Information Facility"],
  ["iucn", "International Union for Conservation of Nature"],
  ["ocean-biodiversity-information-system", "Ocean Biodiversity Information System"],
  ["catalogue-of-life", "Catalogue of Life"],
  ["world-register-of-marine-species", "World Register of Marine Species"],
  ["nasa-earth-science-data-systems", "NASA Earth Science Data Systems"],
  ["copernicus-data-space-ecosystem", "Copernicus Data Space Ecosystem"],
  ["noaa-national-centers-for-environmental-information", "NOAA National Centers for Environmental Information"],
  ["ipbes", "Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services"],
  ["global-forest-watch", "Global Forest Watch"],
  ["mapbiomas", "MapBiomas"],
  ["artsdatabanken", "Artsdatabanken"],
] as const;

test("all twelve knowledge profiles resolve through one shared v2.1 surface", async ({ page }) => {
  for (const [slug, name] of PROFILES) {
    await page.goto(`${BASE}/actors/${slug}`);
    await expect(page.locator("h1").filter({ hasText: name })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Institution is not dataset/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Rights travel with the data/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Independent research, not an official organisation page/ })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://4planet.org/actors/${slug}`);
  }
});

test("knowledge profiles expose official sources, limitations and no-implied-partnership language", async ({ page }) => {
  await page.goto(`${BASE}/actors/world-register-of-marine-species`);
  await expect(page.getByText(/WoRMS is not a distribution database/)).toBeVisible();
  await expect(page.getByText(/not an official organisation page, verification or partnership/i).first()).toBeVisible();
  await expect(page.locator('.knowledge-source-list a[href^="https://www.marinespecies.org/"]').first()).toBeVisible();
});

test("NASA and MapBiomas preserve observation versus model-output boundaries", async ({ page }) => {
  await page.goto(`${BASE}/actors/nasa-earth-science-data-systems`);
  await expect(page.getByText(/Processed satellite products are not direct field truth/)).toBeVisible();
  await page.goto(`${BASE}/actors/mapbiomas`);
  await expect(page.getByText(/Classified pixels are model outputs, not direct field observations/)).toBeVisible();
});

test("Artsdatabanken preserves sensitive species-location boundary", async ({ page }) => {
  await page.goto(`${BASE}/actors/artsdatabanken`);
  await expect(page.getByText(/Sensitive species locations may be generalised or withheld/)).toBeVisible();
});
