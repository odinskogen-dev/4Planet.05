import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";

test("ATLAS Data Sandbox loads three EMODnet WMS sources and records visual proof", async ({ page }, testInfo) => {
  const bathymetryResponses: number[] = [];
  const habitatResponses: number[] = [];
  const fishingDensityResponses: number[] = [];
  const habitatUrls: string[] = [];
  const fishingDensityUrls: string[] = [];

  page.on("response", (response) => {
    const url = response.url();
    if (url.startsWith("https://ows.emodnet-bathymetry.eu/wms")) bathymetryResponses.push(response.status());
    if (url.startsWith("https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms")) {
      habitatResponses.push(response.status());
      habitatUrls.push(url);
    }
    if (url.startsWith("https://ows.emodnet-humanactivities.eu/wms")) {
      fishingDensityResponses.push(response.status());
      fishingDensityUrls.push(url);
    }
  });

  await page.goto(`${BASE}/atlas-data-sandbox`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "ATLAS DATA SANDBOX" })).toBeVisible();

  await expect(page.getByText("EMODNET · BATHYMETRY")).toBeVisible();
  await expect(page.getByText("emodnet:mean_multicolour")).toBeVisible();
  await expect(page.getByText("SOURCE_LOADED")).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => bathymetryResponses.some((status) => status >= 200 && status < 300), { timeout: 30_000 }).toBeTruthy();
  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-emodnet-bathymetry.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: "SEABED HABITATS" }).click();
  await expect(page.getByText("EMODNET · SEABED HABITATS")).toBeVisible();
  await expect(page.getByText("eusm2025_msfd_800")).toBeVisible();
  await expect(page.getByText("eusm2019_msfd_800")).toBeVisible();
  await expect(page.getByText("SOURCE_LOADED")).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => habitatResponses.some((status) => status >= 200 && status < 300), { timeout: 30_000 }).toBeTruthy();
  await expect.poll(
    () => habitatUrls.some((url) => decodeURIComponent(url).includes("styles=eusm2019_msfd_800")),
    { timeout: 30_000 },
  ).toBeTruthy();
  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-emodnet-seabed-habitats.png`,
    fullPage: true,
  });

  await page.getByRole("button", { name: "FISHING DENSITY" }).click();
  await expect(page.getByText("EMODNET · HUMAN ACTIVITIES")).toBeVisible();
  await expect(page.getByText("Fishing vessel density · annual average · 2023", { exact: true })).toBeVisible();
  await expect(page.getByText("vesseldensity_01avg")).toBeVisible();
  await expect(page.getByText("VesselDensity")).toBeVisible();
  await expect(page.getByText("SOURCE_LOADED")).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => fishingDensityResponses.some((status) => status >= 200 && status < 300), { timeout: 30_000 }).toBeTruthy();
  await expect.poll(
    () => fishingDensityUrls.some((url) => {
      const decoded = decodeURIComponent(url);
      return decoded.includes("layers=vesseldensity_01avg") && decoded.includes("styles=VesselDensity") && decoded.includes("time=2023-01-01T00:00:00Z");
    }),
    { timeout: 30_000 },
  ).toBeTruthy();
  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-emodnet-fishing-vessel-density.png`,
    fullPage: true,
  });
});
