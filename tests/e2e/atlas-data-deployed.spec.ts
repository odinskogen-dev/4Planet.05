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

test("deployed ATLAS lab uses working same-origin data bridges", async ({ page }, testInfo) => {
  const proxiedWms: string[] = [];
  const proxyFailures: string[] = [];
  page.on("response", (response) => {
    const url = response.url();
    if (url.includes("/api/atlas-wms?")) {
      if (response.ok()) proxiedWms.push(url);
      else proxyFailures.push(`${response.status()} ${url}`);
    }
  });

  // Bathymetry through real Cloudflare Pages Function path.
  await loadScene(page, "OCEAN_FOUNDATION");
  await expect.poll(() => proxiedWms.some((url) => decodeURIComponent(url).includes("source=emodnet-bathymetry")), { timeout: 40_000 }).toBeTruthy();
  await openLayers(page);
  const bathy = page.locator(".atlas-row").filter({ hasText: "OCEAN · BATHYMETRY" });
  await expect(bathy).toContainText("ON");
  await expect(bathy).not.toContainText("UNAVAILABLE");

  // Current NOAA coral product through CRS conversion bridge.
  const coral = page.locator(".atlas-row").filter({ hasText: "CORAL · HEAT STRESS · LATEST" });
  await coral.locator(".alyr").click();
  await expect.poll(() => proxiedWms.some((url) => decodeURIComponent(url).includes("source=noaa-coral-dhw")), { timeout: 40_000 }).toBeTruthy();
  await expect(coral).toContainText("ON");
  await expect(coral).not.toContainText("UNAVAILABLE");

  // Climate TRACE must return real source dots, never stale-contract zero.
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

  // TIME must modify the real proxied fishing WMS request, not just UI state.
  await loadScene(page, "OCEAN_PRESSURE");
  await expect.poll(() => proxiedWms.some((url) => decodeURIComponent(url).includes("source=emodnet-human-activities") && decodeURIComponent(url).includes("time=2023-01-01T00:00:00Z")), { timeout: 40_000 }).toBeTruthy();
  await page.getByRole("button", { name: /TIME/ }).click();
  await page.getByRole("button", { name: "2020", exact: true }).click();
  await expect.poll(() => proxiedWms.some((url) => decodeURIComponent(url).includes("source=emodnet-human-activities") && decodeURIComponent(url).includes("time=2020-01-01T00:00:00Z")), { timeout: 40_000 }).toBeTruthy();

  await testInfo.attach("proxy-failures", { body: proxyFailures.join("\n") || "NONE", contentType: "text/plain" });
  expect(proxyFailures.filter((entry) => /emodnet-bathymetry|noaa-coral-dhw|emodnet-human-activities/.test(decodeURIComponent(entry)))).toEqual([]);

  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-deployed-time-2020.png`,
    fullPage: true,
  });
});
