import { expect, test, type Page } from "@playwright/test";

const batch = [
  { slug: "african-savanna-elephant", name: "African Savanna Elephant", taxon: "2435350" },
  { slug: "cheetah", name: "Cheetah", taxon: "2435270" },
  { slug: "blue-whale", name: "Blue Whale", taxon: "2440735" },
  { slug: "tiger", name: "Tiger", taxon: "5219416" },
  { slug: "polar-bear", name: "Polar Bear", taxon: "2433451" },
  { slug: "whale-shark", name: "Whale Shark", taxon: "2417522" },
  { slug: "green-sea-turtle", name: "Green Sea Turtle", taxon: "2442225" },
  { slug: "emperor-penguin", name: "Emperor Penguin", taxon: "2481661" },
  { slug: "giant-panda", name: "Giant Panda", taxon: "2433399" },
  { slug: "acropora-palmata", name: "Elkhorn Coral", taxon: "5184657" },
];

async function stubOccurrences(page: Page) {
  await page.route("**/v1/occurrence/search?**", async (route) => {
    const url = new URL(route.request().url());
    const taxonKey = url.searchParams.get("taxonKey") ?? "0";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 1,
        results: [{
          key: Number(taxonKey) * 10 + 1,
          taxonKey: Number(taxonKey),
          scientificName: "source-reported taxon",
          eventDate: "2026-09-01T00:00:00Z",
          decimalLatitude: 0,
          decimalLongitude: 0,
          coordinateUncertaintyInMeters: 1000,
        }],
      }),
    });
  });
}

test.beforeEach(async ({ page }) => { await stubOccurrences(page); });

test("Factory batch 01 renders ten strategic species through one Human-First plank", async ({ page }) => {
  for (const item of batch) {
    await page.goto(`/species/${item.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: item.name })).toBeVisible();
    await expect(page.locator('[data-species-section="hero"]')).toBeVisible();
    await expect(page.locator('[data-species-section="habitat"]')).toBeVisible();
    await expect(page.locator('[data-species-section="known"]')).toBeVisible();
    await expect(page.locator('[data-species-section="atlas"]')).toBeVisible();
    await expect(page.locator('[data-species-section="sources"]')).toBeVisible();
    await expect(page.getByTestId("species-to-atlas")).toHaveAttribute("href", new RegExp(item.taxon));
    await expect(page.getByTestId("species-source-evidence-seam")).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/species/${item.slug}$`));
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
    expect(dimensions.scrollWidth, item.slug).toBeLessThanOrEqual(dimensions.innerWidth + 1);
  }
});

test("new Elkhorn Coral asset fails closed when no rights-cleared photograph exists", async ({ page }) => {
  await page.goto("/species/acropora-palmata");
  await expect(page.getByText(/RIGHTS-CLEARED PHOTOGRAPH NOT AVAILABLE/i)).toBeVisible();
  const body = await page.locator("body").innerText();
  expect(body).toMatch(/threatened under the U\.S\. Endangered Species Act/i);
  expect(body).toMatch(/not a measurement of coral cover/i);
  expect(body).not.toMatch(/live coral position/i);
});
