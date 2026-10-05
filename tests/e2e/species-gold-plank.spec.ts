import { expect, test, type Page } from "@playwright/test";

const occurrencePayload = (taxonKey: string) => ({
  count: 2,
  results: [
    {
      key: Number(taxonKey) * 10 + 1,
      taxonKey: Number(taxonKey),
      scientificName: taxonKey === "2440483" ? "Orcinus orca" : "Panthera onca",
      eventDate: "2026-09-01T00:00:00Z",
      decimalLatitude: taxonKey === "2440483" ? 60.4 : -16.5,
      decimalLongitude: taxonKey === "2440483" ? 4.9 : -56.1,
      coordinateUncertaintyInMeters: 100,
    },
    {
      key: Number(taxonKey) * 10 + 2,
      taxonKey: Number(taxonKey),
      scientificName: taxonKey === "2440483" ? "Orcinus orca" : "Panthera onca",
      eventDate: "2026-08-01T00:00:00Z",
      decimalLatitude: taxonKey === "2440483" ? 59.9 : -15.7,
      decimalLongitude: taxonKey === "2440483" ? 5.2 : -55.7,
      coordinateUncertaintyInMeters: 250,
    },
  ],
});

async function stubOccurrences(page: Page) {
  await page.route("**/v1/occurrence/search?**", async (route) => {
    const url = new URL(route.request().url());
    const taxonKey = url.searchParams.get("taxonKey") ?? "0";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(occurrencePayload(taxonKey)),
    });
  });
}

async function sectionOrder(page: Page) {
  return page.locator("[data-species-section]").evaluateAll((nodes) =>
    nodes
      .map((node) => node.getAttribute("data-species-section"))
      .filter((value): value is string => Boolean(value) && value !== "field-media"),
  );
}

test.beforeEach(async ({ page }) => {
  await stubOccurrences(page);
});

test("Gold Plank renders Orca through the shared Human-First parent", async ({ page }) => {
  await page.goto("/species/orca");

  await expect(page.getByRole("heading", { level: 1, name: "Orca" })).toBeVisible();
  await expect(page.getByText("Orcinus orca", { exact: true })).toBeVisible();
  await expect(page.locator('[data-species-section="hero"]')).toBeVisible();
  await expect(page.locator('[data-species-section="habitat"]')).toBeVisible();
  await expect(page.locator('[data-species-section="lead-story"]')).toBeVisible();
  await expect(page.locator('[data-species-section="atlas"]')).toBeVisible();
  await expect(page.locator('[data-species-section="sources"]')).toBeVisible();

  const atlas = page.getByTestId("species-to-atlas");
  await expect(atlas).toHaveAttribute("href", /2440483/);
  await expect(page.getByText(/occurrence records for Orca/i)).toBeVisible();

  const watch = page.getByRole("button", { name: "ADD TO LOCAL WATCH" });
  await expect(watch).toBeVisible();
  await watch.focus();
  await expect(watch).toBeFocused();

  await expect(page.getByTestId("species-source-evidence-seam")).toBeVisible();
  await expect(page.getByText(/SPECIES ENGINE · MATERIALISING LIVE PROFILE/i)).toHaveCount(0);
});

test("Gold Plank renders Jaguar through the same truth-bounded parent", async ({ page }) => {
  await page.goto("/species/jaguar");

  await expect(page.getByRole("heading", { level: 1, name: "Jaguar" })).toBeVisible();
  await expect(page.getByText("Panthera onca", { exact: true })).toBeVisible();
  await expect(page.locator('[data-species-section="hero"]')).toBeVisible();
  await expect(page.locator('[data-species-section="habitat"]')).toBeVisible();
  await expect(page.locator('[data-species-section="lead-story"]')).toBeVisible();
  await expect(page.locator('[data-species-section="atlas"]')).toBeVisible();
  await expect(page.locator('[data-species-section="sources"]')).toBeVisible();

  const body = await page.locator("body").innerText();
  expect(body).not.toContain("signals connected, functioning forest");
  expect(body).not.toContain("173,000");
  expect(body).not.toContain("57,000");
  expect(body).not.toContain("64,000");
  expect(body).not.toContain("89%");
  expect(body).toMatch(/sighting alone does not prove local population health or ecosystem condition/i);
  expect(body).toMatch(/not a complete range map or a live animal position/i);

  await expect(page.getByTestId("species-to-atlas")).toHaveAttribute("href", /5219426/);
  await expect(page.getByText(/occurrence records for Jaguar/i)).toBeVisible();
  await expect(page.getByTestId("species-source-evidence-seam")).toBeVisible();
});

test("Orca and Jaguar share the same mandatory parent section grammar", async ({ page }) => {
  await page.goto("/species/orca");
  const orca = await sectionOrder(page);

  await page.goto("/species/jaguar");
  const jaguar = await sectionOrder(page);

  expect(orca).toEqual(jaguar);
  expect(orca).toEqual([
    "hero",
    "habitat",
    "lead-story",
    "supporting-story",
    "supporting-story",
    "known",
    "atlas",
    "sources",
  ]);
});


test("Gold Plank transfers across bird, insect and marine-invertebrate profiles", async ({ page }) => {
  const representatives = [
    { slug: "emperor-penguin", name: "Emperor Penguin" },
    { slug: "western-honey-bee", name: "Western Honey Bee" },
    { slug: "blue-mussel", name: "Blue Mussel" },
  ];

  for (const representative of representatives) {
    await page.goto(`/species/${representative.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: representative.name })).toBeVisible();
    await expect(page.locator('[data-species-section="hero"]')).toBeVisible();
    await expect(page.locator('[data-species-section="habitat"]')).toBeVisible();
    await expect(page.locator('[data-species-section="atlas"]')).toBeVisible();
    await expect(page.locator('[data-species-section="sources"]')).toBeVisible();
    await expect(page.getByTestId("species-to-atlas")).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(dimensions.scrollWidth, representative.slug).toBeLessThanOrEqual(dimensions.innerWidth + 1);
  }
});

test("Gold Plank remains usable on narrow screens and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/species/jaguar");

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.innerWidth + 1);

  const atlas = page.getByTestId("species-to-atlas");
  await atlas.focus();
  await expect(atlas).toBeFocused();
  await expect(page.locator('[data-species-section="sources"] summary')).toBeVisible();
});
