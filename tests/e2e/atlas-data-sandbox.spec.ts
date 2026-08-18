import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";

test("ATLAS Data Sandbox renders two EMODnet layers through MapLibre", async ({ page }, testInfo) => {
  const bathymetryResponses: number[] = [];
  const habitatResponses: number[] = [];

  page.on("response", (response) => {
    if (response.url().startsWith("https://ows.emodnet-bathymetry.eu/wms")) bathymetryResponses.push(response.status());
    if (response.url().startsWith("https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms")) habitatResponses.push(response.status());
  });

  await page.goto(`${BASE}/atlas-data-sandbox`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "ATLAS DATA SANDBOX" })).toBeVisible();

  await expect(page.getByText("EMODNET · BATHYMETRY")).toBeVisible();
  await expect(page.getByText("emodnet:mean_multicolour")).toBeVisible();
  await expect(page.getByText("MAP_GREEN")).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => bathymetryResponses.some((status) => status >= 200 && status < 300), { timeout: 30_000 }).toBeTruthy();
  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-emodnet-bathymetry.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: "SEABED HABITATS" }).click();
  await expect(page.getByText("EMODNET · SEABED HABITATS")).toBeVisible();
  await expect(page.getByText("eusm2025_msfd_800")).toBeVisible();
  await expect(page.getByText("MAP_GREEN")).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => habitatResponses.some((status) => status >= 200 && status < 300), { timeout: 30_000 }).toBeTruthy();
  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-emodnet-seabed-habitats.png`,
    fullPage: true,
  });
});
