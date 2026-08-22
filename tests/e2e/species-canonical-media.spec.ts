import { expect, test, type Page, type Route } from "@playwright/test";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n+8AAAAASUVORK5CYII=",
  "base64",
);

async function mockSpeciesSources(page: Page) {
  await page.route("https://api.gbif.org/v2/species/match**", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        usage: {
          key: "6T8S",
          name: "Picea abies (L.) H.Karst.",
          canonicalName: "Picea abies",
          rank: "SPECIES",
          status: "ACCEPTED",
        },
        classification: [
          { key: "PLANTAE", name: "Plantae", rank: "KINGDOM" },
          { key: "PINACEAE", name: "Pinaceae", rank: "FAMILY" },
          { key: "PICEA", name: "Picea", rank: "GENUS" },
        ],
      }),
    });
  });

  await page.route("https://artskart.artsdatabanken.no/publicapi/api/taxon**", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{
        TaxonId: 1001,
        ValidScientificNameId: 2001,
        ValidScientificName: "Picea abies",
        PrefferedPopularname: "Gran",
        TaxonGroup: "Karplanter",
        ExistsInCountry: true,
      }]),
    });
  });

  await page.route("https://api.gbif.org/v1/occurrence/search**", async (route: Route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("mediaType") === "StillImage") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          count: 2,
          results: [{
            key: 4242,
            scientificName: "Picea abies",
            datasetName: "Norway field images",
            publisher: "Example biodiversity publisher",
            media: [
              {
                type: "StillImage",
                format: "image/png",
                identifier: "https://images.example/picea.png",
                description: "Norway spruce",
                creator: "Example photographer",
                license: "CC BY 4.0",
                rightsHolder: "Example photographer",
              },
              {
                type: "StillImage",
                format: "image/png",
                identifier: "https://images.example/uncleared.png",
                description: "Uncleared image",
                creator: "Unknown rights photographer",
              },
            ],
          }],
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 17,
        results: [{ key: 42, decimalLatitude: 60.39, decimalLongitude: 5.32, eventDate: "2026-08-01" }],
      }),
    });
  });

  await page.route("https://images.example/picea.png", async (route: Route) => {
    await route.fulfill({ status: 200, contentType: "image/png", body: onePixelPng });
  });
}

test("new taxon gets a canonical universal page with rights-gated source media", async ({ page }) => {
  await mockSpeciesSources(page);
  await page.goto("/species/picea-abies");

  await expect(page.getByRole("heading", { name: "Gran" })).toBeVisible();
  await expect(page.getByText("/species/picea-abies", { exact: true })).toBeVisible();
  await expect(page.getByText("Primary image", { exact: true })).toBeVisible();
  await expect(page.getByText("CC BY 4.0", { exact: true })).toBeVisible();
  await expect(page.getByText("Example photographer", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/1 media item was withheld because the licence was missing or requires review/i)).toBeVisible();
  await expect(page.getByText("Unknown rights photographer", { exact: true })).toHaveCount(0);
  await expect(page.getByText("17", { exact: true })).toBeVisible();
  await expect(page.getByText("UNIVERSAL · NOT GOLD", { exact: true })).toBeVisible();
});

test("curated Gold species keep their existing renderer", async ({ page }) => {
  await page.goto("/species/orca");
  await expect(page.getByText("4PLANET SPECIES_", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("Orcinus orca", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("UNIVERSAL · NOT GOLD", { exact: true })).toHaveCount(0);
});
