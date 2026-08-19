import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "https://sandbox-atlas-data-lab-20260.4planet-05.pages.dev";

async function openLayers(page) {
  const button = page.getByRole("button", { name: "LAYERS" });
  if (await button.isVisible()) await button.click();
}

async function loadScene(page, scene: string) {
  await page.goto(`${BASE}/atlas-data-sandbox?scene=${scene}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-atlas-lab-scene", scene);
}

const decodedHas = (urls: string[], ...needles: string[]) =>
  urls.some((url) => {
    const decoded = decodeURIComponent(url);
    return needles.every((needle) => decoded.includes(needle));
  });

test("deployed ATLAS lab repairs every layer that was broken in founder screenshots", async ({ page }, testInfo) => {
  const proxiedRaster: string[] = [];
  const proxiedFeeds: string[] = [];
  const proxyFailures: string[] = [];
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/api/atlas-wms?")) {
      if (response.ok()) proxiedRaster.push(url);
      else proxyFailures.push(`${response.status()} ${url}`);
    }
    if (url.includes("/api/atlas-feed?")) {
      if (response.ok()) proxiedFeeds.push(url);
      else proxyFailures.push(`${response.status()} ${url}`);
    }
  });

  // 01 Bathymetry
  await loadScene(page, "OCEAN_FOUNDATION");
  await expect.poll(() => decodedHas(proxiedRaster, "source=emodnet-bathymetry"), { timeout: 40_000 }).toBeTruthy();
  await openLayers(page);
  const bathy = page.locator(".atlas-row").filter({ hasText: "OCEAN · BATHYMETRY" });
  await expect(bathy).toContainText("ON");
  await expect(bathy).not.toContainText("UNAVAILABLE");

  // 02 Fire + Events — the screenshot showed OFFLINE. Hosted ATLAS must now use
  // the bounded EONET same-origin feed and expose a positive record count.
  const events = page.locator(".atlas-row").filter({ hasText: "FIRE + EVENTS" });
  await expect(events).toBeVisible();
  await events.locator(".alyr").click();
  await expect.poll(() => decodedHas(proxiedFeeds, "source=eonet"), { timeout: 40_000 }).toBeTruthy();
  await expect.poll(async () => {
    const text = await events.locator(".st").innerText();
    return Number.parseInt(text, 10) > 0;
  }, { timeout: 40_000 }).toBeTruthy();
  await expect(events).not.toContainText("OFFLINE");

  // 03 Seabed habitat — use the broad-Europe 2023 scale-adaptive WMS product
  // that already passed desktop + 390 px visual QA. Newer 2025 paths remain
  // candidates until they pass the same evidence gate.
  await loadScene(page, "OCEAN_HABITAT");
  await expect.poll(
    () => decodedHas(
      proxiedRaster,
      "source=emodnet-seabed-habitats",
      "layers=eusm2023_eunis2019_group",
      "styles=default-style-eusm2023_eunis2019_group",
    ),
    { timeout: 40_000 },
  ).toBeTruthy();
  await openLayers(page);
  const habitat = page.locator(".atlas-row").filter({ hasText: "SEABED · HABITATS 2023" });
  await expect(habitat).toContainText("ON");
  await expect(habitat).not.toContainText("UNAVAILABLE");

  // 04 Oxygen + real TIME month switch.
  await loadScene(page, "OCEAN_CONDITION");
  await expect.poll(() => decodedHas(proxiedRaster, "source=emodnet-chemistry", "time=08"), { timeout: 40_000 }).toBeTruthy();
  await openLayers(page);
  const oxygen = page.locator(".atlas-row").filter({ hasText: "OCEAN · OXYGEN CLIMATOLOGY" });
  await expect(oxygen).toContainText("ON");
  await expect(oxygen).not.toContainText("UNAVAILABLE");
  await page.getByRole("button", { name: /TIME/ }).click();
  await page.getByRole("button", { name: "FEB", exact: true }).click();
  await expect.poll(() => decodedHas(proxiedRaster, "source=emodnet-chemistry", "time=02"), { timeout: 40_000 }).toBeTruthy();

  // 05 NOAA Coral Heat Stress — current daily CRW through CRS-converting bridge.
  await loadScene(page, "OCEAN_FOUNDATION");
  await openLayers(page);
  const coral = page.locator(".atlas-row").filter({ hasText: "CORAL · HEAT STRESS · LATEST" });
  await coral.locator(".alyr").click();
  await expect.poll(() => decodedHas(proxiedRaster, "source=noaa-coral-dhw"), { timeout: 40_000 }).toBeTruthy();
  await expect(coral).toContainText("ON");
  await expect(coral).not.toContainText("UNAVAILABLE");

  // 06 Climate TRACE — the screenshot's '0' was a stale v6 /assets contract.
  // v7 /sources must now produce real source dots, never false zero on failure.
  await page.getByRole("button", { name: "S4PIENS", exact: true }).click();
  const climate = page.locator(".atlas-row").filter({ hasText: "CLIM4TE TRACE · POWER 2024" });
  await expect(climate).toBeVisible();
  await climate.locator(".alyr").click();
  await expect.poll(async () => {
    const text = await climate.locator(".st").innerText();
    const count = Number.parseInt(text, 10);
    return Number.isFinite(count) && count > 0;
  }, { timeout: 40_000 }).toBeTruthy();
  await expect(climate).not.toContainText("OFFLINE");

  // 07 Fishing density + real TIME annual switch.
  await loadScene(page, "OCEAN_PRESSURE");
  await expect.poll(() => decodedHas(proxiedRaster, "source=emodnet-human-activities", "time=2023-01-01T00:00:00Z"), { timeout: 40_000 }).toBeTruthy();
  await openLayers(page);
  const fishing = page.locator(".atlas-row").filter({ hasText: "FISHING · VESSEL DENSITY 2023" });
  await expect(fishing).toContainText("ON");
  await expect(fishing).not.toContainText("UNAVAILABLE");
  await page.getByRole("button", { name: /TIME/ }).click();
  await page.getByRole("button", { name: "2020", exact: true }).click();
  await expect.poll(() => decodedHas(proxiedRaster, "source=emodnet-human-activities", "time=2020-01-01T00:00:00Z"), { timeout: 40_000 }).toBeTruthy();

  await testInfo.attach("proxy-failures", { body: proxyFailures.join("\n") || "NONE", contentType: "text/plain" });
  expect(proxyFailures.filter((entry) => /emodnet-bathymetry|emodnet-seabed-habitats|emodnet-chemistry|noaa-coral-dhw|emodnet-human-activities|source=eonet/.test(decodeURIComponent(entry)))).toEqual([]);

  await page.screenshot({ path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-repaired-founder-layers-time-2020.png`, fullPage: true });
});
