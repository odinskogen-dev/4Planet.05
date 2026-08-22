import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";

function successful(statuses: number[]) { return statuses.some((status) => status >= 200 && status < 300); }
async function openLayers(page) { const layersButton = page.getByRole("button", { name: "LAYERS" }); if (await layersButton.isVisible()) await layersButton.click(); }
async function loadScene(page, scene: string) {
  await page.goto(`${BASE}/atlas-data-sandbox?scene=${scene}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-atlas-lab-scene", scene);
  await expect(page.getByLabel("Search the living planet — life, places and living systems")).toBeVisible();
}

test("ATLAS Data Lab is canonical ATLAS plus admitted layers and a real TIME engine", async ({ page }, testInfo) => {
  const bathymetryResponses: number[] = [], oxygenResponses: number[] = [], fishingResponses: number[] = [];
  const habitatUrls: string[] = [], oxygenUrls: string[] = [], fishingUrls: string[] = [];
  page.on("response", (response) => {
    const url = response.url();
    if (url.startsWith("https://ows.emodnet-bathymetry.eu/wms")) bathymetryResponses.push(response.status());
    if (url.startsWith("https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms")) habitatUrls.push(url);
    if (url.startsWith("https://ec.oceanbrowser.net/emodnet/Python/web/wms")) { oxygenResponses.push(response.status()); oxygenUrls.push(url); }
    if (url.startsWith("https://ows.emodnet-humanactivities.eu/wms")) { fishingResponses.push(response.status()); fishingUrls.push(url); }
  });
  page.on("request", (request) => {
    const url = request.url();
    if (url.startsWith("https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_view/wms")) habitatUrls.push(url);
  });

  await loadScene(page, "OCEAN_FOUNDATION");
  await expect(page.locator("html")).toHaveAttribute("data-atlas-lab", "true");
  await expect(page.locator("html")).toHaveAttribute("data-atlas-lab-extensions", "4");
  await expect.poll(async () => Number(await page.locator("html").getAttribute("data-atlas-lab-legend-repairs")) > 0).toBeTruthy();
  await expect.poll(async () => Number(await page.locator("html").getAttribute("data-atlas-lab-source-repairs")) >= 3).toBeTruthy();
  await expect(page.getByRole("button", { name: "LAYERS" })).toBeVisible();
  await expect.poll(() => new URL(page.url()).searchParams.get("m"), { timeout: 10_000 }).toBe("OCE4N");
  await expect.poll(() => successful(bathymetryResponses), { timeout: 30_000 }).toBeTruthy();

  await openLayers(page);
  await expect(page.getByText("OCEAN · BATHYMETRY", { exact: true })).toBeVisible();
  await expect(page.getByText("SEABED · HABITATS 2025", { exact: true })).toBeVisible();
  await expect(page.getByText("OCEAN · OXYGEN CLIMATOLOGY", { exact: true })).toBeVisible();
  await expect(page.getByText("FISHING · VESSEL DENSITY 2023", { exact: true })).toBeVisible();

  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 640) {
    const panelBox = await page.locator(".atlas-panel:not(.rest)").boundingBox();
    const lensBox = await page.locator(".lens-rail").boundingBox();
    expect(panelBox).not.toBeNull(); expect(lensBox).not.toBeNull();
    expect(panelBox!.y).toBeGreaterThanOrEqual(lensBox!.y + lensBox!.height + 4);
  }

  const bathymetryRow = page.locator(".atlas-row").filter({ hasText: "OCEAN · BATHYMETRY" });
  await expect(bathymetryRow).toContainText("ON");
  await bathymetryRow.locator(".alyr").click();
  await expect.poll(() => !(new URL(page.url()).searchParams.get("l") || "").includes("sandbox-emodnet-bathymetry"), { timeout: 10_000 }).toBeTruthy();
  await bathymetryRow.locator(".alyr").click();
  await expect.poll(() => (new URL(page.url()).searchParams.get("l") || "").includes("sandbox-emodnet-bathymetry"), { timeout: 10_000 }).toBeTruthy();
  await bathymetryRow.getByRole("button", { name: "i" }).click();
  const bathymetryDrawer = bathymetryRow.locator("..").locator(".drawer");
  const opacity = bathymetryDrawer.locator('input[type="range"]');
  await expect(opacity).toBeVisible(); await opacity.fill("0.45"); await expect(opacity).toHaveValue("0.45");
  const sstRow = page.locator(".atlas-row").filter({ hasText: "OCEAN · SEA SURFACE TEMP" });
  await sstRow.getByRole("button", { name: "i" }).click();
  await expect(sstRow.locator("..").locator(".drawer .ramp")).toBeVisible();
  await page.screenshot({ path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-scene-ocean-foundation.png`, fullPage: true });

  await loadScene(page, "OCEAN_HABITAT");
  // Local Vite preview exercises the direct third-party WMS request contract.
  // Provider render availability is intentionally owned by the separate deployed
  // Cloudflare gate, where the same request is proxied and must return real pixels.
  // This prevents a stalled external WMS connection on a GitHub runner from
  // masquerading as an ATLAS regression while preserving exact layer/style proof.
  await expect.poll(() => habitatUrls.some((url) => {
    const decoded = decodeURIComponent(url);
    return decoded.includes("layers=eusm2025_msfd_800") && decoded.includes("styles=eusm2019_msfd_800");
  }), { timeout: 30_000 }).toBeTruthy();
  await page.screenshot({ path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-scene-ocean-habitat.png`, fullPage: true });

  await loadScene(page, "OCEAN_CONDITION");
  await expect.poll(() => successful(oxygenResponses), { timeout: 30_000 }).toBeTruthy();
  await expect.poll(() => oxygenUrls.some((url) => {
    const decoded = decodeURIComponent(url);
    return decoded.includes("Water_body_dissolved_oxygen_concentration_L2") && decoded.includes("styles=pcolor_flat") && decoded.includes("time=08") && decoded.includes("elevation=-0.0") && decoded.includes("version=1.3.0") && decoded.includes("crs=EPSG:3857");
  }), { timeout: 30_000 }).toBeTruthy();
  const timeToggleCondition = page.getByRole("button", { name: /TIME/ });
  await expect(timeToggleCondition).toBeVisible(); await timeToggleCondition.click();
  await page.getByRole("button", { name: "FEB", exact: true }).click();
  await expect.poll(() => oxygenUrls.some((url) => decodeURIComponent(url).includes("time=02")), { timeout: 30_000 }).toBeTruthy();
  await expect.poll(async () => (await page.locator("html").getAttribute("data-atlas-time-state") || "").includes('"sandbox-emodnet-dissolved-oxygen-climatology":"02"')).toBeTruthy();
  await page.screenshot({ path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-scene-ocean-condition-time-feb.png`, fullPage: true });

  await loadScene(page, "OCEAN_PRESSURE");
  await expect.poll(() => successful(fishingResponses), { timeout: 30_000 }).toBeTruthy();
  await expect.poll(() => fishingUrls.some((url) => {
    const decoded = decodeURIComponent(url);
    return decoded.includes("layers=vesseldensity_01avg") && decoded.includes("styles=VesselDensity") && decoded.includes("time=2023-01-01T00:00:00Z");
  }), { timeout: 30_000 }).toBeTruthy();
  const timeTogglePressure = page.getByRole("button", { name: /TIME/ });
  await expect(timeTogglePressure).toBeVisible(); await timeTogglePressure.click();
  await page.getByRole("button", { name: "2020", exact: true }).click();
  await expect.poll(() => fishingUrls.some((url) => decodeURIComponent(url).includes("time=2020-01-01T00:00:00Z")), { timeout: 30_000 }).toBeTruthy();
  await expect.poll(async () => (await page.locator("html").getAttribute("data-atlas-time-state") || "").includes('"sandbox-emodnet-fishing-vessel-density":"2020-01-01T00:00:00Z"')).toBeTruthy();
  await page.screenshot({ path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-scene-ocean-pressure-time-2020.png`, fullPage: true });
});

test("Orca search preserves canonical taxon intent and bounded Bay of Biscay context", async ({ page }, testInfo) => {
  await page.goto(`${BASE}/atlas-data-sandbox?scene=OCEAN_FOUNDATION`, { waitUntil: "domcontentloaded" });
  const search = page.getByLabel("Search the living planet — life, places and living systems");
  await expect(search).toBeVisible();
  await search.fill("orca");

  const canonical = page.locator('[data-atlas-taxon-intent="taxon:gbif:2440483"]');
  await expect(canonical).toBeVisible({ timeout: 10_000 });
  await expect(canonical).toContainText("Orcinus orca");
  await expect(canonical).toContainText("CANONICAL TAXON");
  await expect(canonical).toContainText("observations remain source records");

  await search.press("Enter");
  await expect.poll(() => new URL(page.url()).searchParams.get("entity"), { timeout: 15_000 }).toBe("taxon:gbif:2440483");
  await expect.poll(() => new URL(page.url()).searchParams.get("intent"), { timeout: 15_000 }).toBe("taxon");
  await expect.poll(() => new URL(page.url()).searchParams.get("context"), { timeout: 15_000 }).toBe("bay-of-biscay-proof-context");

  const context = page.locator('[data-atlas-intent-context="bay-of-biscay-proof-context"]');
  await expect(context).toBeVisible({ timeout: 15_000 });
  await expect(context).toContainText("ORCA · TAXON INTENT");
  await expect(context).toContainText("not a range map");
  await expect(page.locator(".ctx")).toContainText("Orca", { timeout: 20_000 });
  await expect(page.locator(".ctx")).toContainText("taxon:gbif:2440483");
  await expect(page.locator(".ctx")).toContainText("RECORDED OBSERVATIONS");

  await expect.poll(async () => await page.locator("html").getAttribute("data-atlas-taxon-context-stabilised"), { timeout: 25_000 }).toBe("true");
  const camera = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const c = map?.getCenter?.();
    return { lng: c?.lng, lat: c?.lat, zoom: map?.getZoom?.() };
  });
  expect(camera.lng).toBeGreaterThan(-7.5);
  expect(camera.lng).toBeLessThan(-2.5);
  expect(camera.lat).toBeGreaterThan(43.5);
  expect(camera.lat).toBeLessThan(47.5);
  expect(camera.zoom).toBeGreaterThan(3.5);
  expect(camera.zoom).toBeLessThan(5.2);

  await page.screenshot({ path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-orca-taxon-intent.png`, fullPage: true });
});
