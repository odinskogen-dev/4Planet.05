import { expect, test } from "@playwright/test";

test("universal profile reuses the same TEST registry id", async ({ page }) => {
  await page.route("https://api.gbif.org/v2/species/match**", async (route) => {
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

  await page.route("https://artskart.artsdatabanken.no/publicapi/api/taxon**", async (route) => {
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

  await page.route("https://api.gbif.org/v1/occurrence/search**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ count: 1, results: [{ key: 42, decimalLatitude: 60.39, decimalLongitude: 5.32, eventDate: "2026-08-01" }] }),
    });
  });

  await page.goto("/species/lab");
  await page.getByRole("button", { name: /BUILD PROFILE/i }).click();
  await expect(page.getByText("CANONICAL_4P_TEST_REGISTRY")).toBeVisible();
  await expect(page.getByText("Gran", { exact: true })).toBeVisible();

  const registryCell = page.locator("text=4PLANET").locator("..").locator("div").nth(1);
  const firstId = await registryCell.textContent();
  expect(firstId).toMatch(/^taxon:4p:/);

  await page.getByRole("button", { name: /BUILD PROFILE/i }).click();
  await expect(page.getByText("CANONICAL_4P_TEST_REGISTRY")).toBeVisible();
  const secondId = await registryCell.textContent();
  expect(secondId).toBe(firstId);
});
