import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";

function successful(statuses: number[]) {
  return statuses.some((status) => status >= 200 && status < 300);
}

test("ATLAS Data Lab is canonical ATLAS plus four sandbox-only EMODnet layers", async ({ page }, testInfo) => {
  const bathymetryResponses: number[] = [];
  const habitatResponses: number[] = [];
  const oxygenResponses: number[] = [];
  const fishingResponses: number[] = [];
  const habitatUrls: string[] = [];
  const oxygenUrls: string[] = [];
  const fishingUrls: string[] = [];

  page.on("response", (response) => {
    const url = response.url();
    if (url.startsWith("https://ows.emodnet-bathymetry.eu/wms")) bathymetryResponses.push(response.status());
    if (url.startsWith("https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms")) {
      habitatResponses.push(response.status());
      habitatUrls.push(url);
    }
    if (url.startsWith("https://ec.oceanbrowser.net/emodnet/Python/web/wms")) {
      oxygenResponses.push(response.status());
      oxygenUrls.push(url);
    }
    if (url.startsWith("https://ows.emodnet-humanactivities.eu/wms")) {
      fishingResponses.push(response.status());
      fishingUrls.push(url);
    }
  });

  await page.goto(`${BASE}/atlas-data-sandbox`, { waitUntil: "domcontentloaded" });

  // Architecture proof: this route is the real World interface, not the old
  // diagnostic viewer. Search, lens controls and canonical layer console remain.
  await expect(page.locator("html")).toHaveAttribute("data-atlas-lab", "true");
  await expect(page.locator("html")).toHaveAttribute("data-atlas-lab-extensions", "4");
  await expect(page.locator("html")).toHaveAttribute("data-atlas-lab-scene", "OCEAN_FOUNDATION");
  await expect(page.getByLabel("Search the living planet — life, places and living systems")).toBeVisible();
  await expect(page.getByRole("button", { name: "LAYERS" })).toBeVisible();

  // Default scene: OCE4N + Blue Marble + bathymetry.
  await expect.poll(() => new URL(page.url()).searchParams.get("m"), { timeout: 10_000 }).toBe("OCE4N");
  await expect.poll(
    () => (new URL(page.url()).searchParams.get("l") || "").includes("sandbox-emodnet-bathymetry"),
    { timeout: 10_000 },
  ).toBeTruthy();
  await expect.poll(() => successful(bathymetryResponses), { timeout: 30_000 }).toBeTruthy();

  await page.getByRole("button", { name: "LAYERS" }).click();
  await expect(page.getByText("OCEAN · BATHYMETRY", { exact: true })).toBeVisible();
  await expect(page.getByText("SEABED · HABITATS 2025", { exact: true })).toBeVisible();
  await expect(page.getByText("OCEAN · OXYGEN CLIMATOLOGY", { exact: true })).toBeVisible();
  await expect(page.getByText("FISHING · VESSEL DENSITY 2023", { exact: true })).toBeVisible();

  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-canonical-atlas-bathymetry.png`,
    fullPage: true,
  });

  // Toggle habitat through the existing ATLAS ON/OFF layer row.
  await page.getByText("SEABED · HABITATS 2025", { exact: true }).click();
  await expect.poll(() => successful(habitatResponses), { timeout: 30_000 }).toBeTruthy();
  await expect.poll(
    () => habitatUrls.some((url) => decodeURIComponent(url).includes("styles=eusm2019_msfd_800")),
    { timeout: 30_000 },
  ).toBeTruthy();

  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-canonical-atlas-habitats.png`,
    fullPage: true,
  });

  // Condition layer: explicit monthly climatology at the surface. This must
  // never be described as current/live oxygen state.
  await page.getByText("OCEAN · OXYGEN CLIMATOLOGY", { exact: true }).click();
  await expect.poll(() => successful(oxygenResponses), { timeout: 30_000 }).toBeTruthy();
  await expect.poll(
    () => oxygenUrls.some((url) => {
      const decoded = decodeURIComponent(url);
      return decoded.includes("Water_body_dissolved_oxygen_concentration_L2")
        && decoded.includes("styles=pcolor_flat")
        && decoded.includes("time=08")
        && decoded.includes("elevation=-0.0")
        && decoded.includes("version=1.3.0")
        && decoded.includes("crs=EPSG:3857");
    }),
    { timeout: 30_000 },
  ).toBeTruthy();

  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-canonical-atlas-oxygen-climatology.png`,
    fullPage: true,
  });

  // Toggle historical fishing-density pressure in exactly the same layer machine.
  await page.getByText("FISHING · VESSEL DENSITY 2023", { exact: true }).click();
  await expect.poll(() => successful(fishingResponses), { timeout: 30_000 }).toBeTruthy();
  await expect.poll(
    () => fishingUrls.some((url) => {
      const decoded = decodeURIComponent(url);
      return decoded.includes("layers=vesseldensity_01avg")
        && decoded.includes("styles=VesselDensity")
        && decoded.includes("time=2023-01-01T00:00:00Z");
    }),
    { timeout: 30_000 },
  ).toBeTruthy();

  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-canonical-atlas-fishing-density.png`,
    fullPage: true,
  });
});
