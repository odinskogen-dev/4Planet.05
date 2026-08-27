import { expect, test } from "@playwright/test";

test("SPECIES Engine materialises one source-aware Norway profile", async ({ page }) => {
  await page.route("**/v2/species/match?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        usage: {
          key: "TESTCOL1",
          name: "Picea abies (L.) H.Karst.",
          canonicalName: "Picea abies",
          authorship: "(L.) H.Karst.",
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

  await page.route("**/publicapi/api/taxon?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        TaxonId: 101,
        ValidScientificNameId: 202,
        ValidScientificName: "Picea abies",
        PrefferedPopularname: "gran",
        TaxonGroup: "Karplanter",
        ExistsInCountry: true,
      }),
    });
  });

  await page.route("**/v1/occurrence/search?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        count: 1234,
        results: [
          {
            key: 999,
            eventDate: "2026-08-20T00:00:00",
            decimalLatitude: 60.0,
            decimalLongitude: 10.7,
            coordinateUncertaintyInMeters: 25,
          },
        ],
      }),
    });
  });

  await page.goto("/species/lab");
  await page.getByRole("button", { name: /Gran · Picea abies/i }).click();

  const profile = page.getByTestId("species-engine-profile");
  await expect(profile).toBeVisible();
  await expect(profile).toContainText("gran");
  await expect(profile).toContainText("Picea abies");
  await expect(profile).toContainText("TESTCOL1");
  await expect(profile).toContainText("Recorded in Norway");
  await expect(profile).toContainText("1,234");
  await expect(profile).toContainText("CANONICAL_4P_TEST_REGISTRY");
  await expect(profile).toContainText(/persisted in the TEST browser registry only/i);
  await expect(profile).toContainText(/not range, abundance/i);
});

test("SPECIES Engine fails closed when taxonomy source cannot resolve", async ({ page }) => {
  await page.route("**/v2/species/match?**", async (route) => {
    await route.fulfill({ status: 503, body: "unavailable" });
  });

  await page.goto("/species/lab");
  await page.getByRole("button", { name: /Humle · Bombus/i }).click();
  await expect(page.getByRole("status").filter({ hasText: "SOURCE RESOLUTION FAILED" })).toContainText(
    "SOURCE RESOLUTION FAILED",
  );
  await expect(page.getByTestId("species-engine-profile")).toHaveCount(0);
});
