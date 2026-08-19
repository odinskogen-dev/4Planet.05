import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";

async function mapReady(page) {
  await expect.poll(
    () => page.evaluate(() => Boolean((window as any).__4planet_map)),
    { timeout: 30_000 },
  ).toBeTruthy();
}

async function jump(page, center: [number, number], zoom: number) {
  await page.evaluate(({ center, zoom }) => {
    const map = (window as any).__4planet_map;
    map.jumpTo({ center, zoom });
  }, { center, zoom });
}

async function renderedNameCount(page) {
  return page.evaluate(() => {
    const map = (window as any).__4planet_map;
    if (!map) return 0;
    const names = new Set<string>();
    for (const feature of map.queryRenderedFeatures()) {
      const layer = map.getLayer(feature.layer?.id);
      if (!layer || layer.type !== "symbol") continue;
      const p = feature.properties || {};
      const name = p.name || p.name_en || p["name:latin"] || p.ref;
      if (typeof name === "string" && name.trim()) names.add(name.trim());
    }
    return names.size;
  });
}

test("ATLAS zoom stack hands off from planetary imagery to sharp local vector cartography", async ({ page }, testInfo) => {
  await page.goto(`${BASE}/atlas-data-sandbox?m=PLANET&l=bluemarble&z=3.00&c=10.75,59.91`, { waitUntil: "domcontentloaded" });
  await mapReady(page);

  await expect(page.locator("html")).toHaveAttribute("data-atlas-zoom-band", "GLOBAL");
  await expect(page.locator("html")).toHaveAttribute("data-atlas-projection-mode", "globe");

  // Oslo street-level proof: this must be vector detail, not a stretched Blue Marble.
  await jump(page, [10.7522, 59.9139], 14.5);
  await expect(page.locator("html")).toHaveAttribute("data-atlas-zoom-band", "STREET", { timeout: 15_000 });
  await expect(page.locator("html")).toHaveAttribute("data-atlas-projection-mode", "mercator");
  await expect(page.locator("html")).toHaveAttribute("data-atlas-place-labels", "visible");
  await expect(page.locator("html")).toHaveAttribute("data-atlas-street-quality", "vector");

  const zoomPolicy = await page.evaluate(() => {
    const map = (window as any).__4planet_map;
    const layer = map.getStyle()?.layers?.find((candidate: any) => candidate.id === "bluemarble");
    return {
      maxzoom: layer?.maxzoom ?? null,
      symbolLayers: Number(document.documentElement.dataset.atlasVectorSymbolLayers || 0),
      visibleSymbolLayers: Number(document.documentElement.dataset.atlasVisibleSymbolLayers || 0),
    };
  });
  expect(zoomPolicy.maxzoom).not.toBeNull();
  expect(zoomPolicy.maxzoom).toBeLessThanOrEqual(6.61);
  expect(zoomPolicy.symbolLayers).toBeGreaterThan(10);
  expect(zoomPolicy.visibleSymbolLayers).toBeGreaterThan(10);

  // A high-quality street map without actual rendered names is not accepted.
  await expect.poll(() => renderedNameCount(page), { timeout: 30_000 }).toBeGreaterThan(5);

  await page.screenshot({
    path: `artifacts/atlas-data-sandbox/${testInfo.project.name}-street-oslo-vector-labels.png`,
    fullPage: true,
  });

  // The same engine must return cleanly to the globe when the user zooms out.
  await jump(page, [10, 25], 3);
  await expect(page.locator("html")).toHaveAttribute("data-atlas-zoom-band", "GLOBAL", { timeout: 15_000 });
  await expect(page.locator("html")).toHaveAttribute("data-atlas-projection-mode", "globe");
});
