import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";

test("ATLAS Data Sandbox renders EMODnet Bathymetry through MapLibre", async ({ page }, testInfo) => {
  const sourceResponses: number[] = [];
  page.on("response", (response) => {
    if (response.url().startsWith("https://ows.emodnet-bathymetry.eu/wms")) {
      sourceResponses.push(response.status());
    }
  });

  await page.goto(`${BASE}/atlas-data-sandbox`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "ATLAS DATA SANDBOX" })).toBeVisible();
  await expect(page.getByText("EMODNET · BATHYMETRY")).toBeVisible();
  await expect(page.getByText("emodnet:mean_multicolour")).toBeVisible();
  await expect(page.getByText("MAP_GREEN")).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => sourceResponses.some((status) => status >= 200 && status < 300), { timeout: 30_000 }).toBeTruthy();

  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-emodnet-bathymetry.png`,
    fullPage: true,
  });
});
