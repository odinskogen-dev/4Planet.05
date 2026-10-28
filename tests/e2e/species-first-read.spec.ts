import { expect, test } from "@playwright/test";

const assertNoHorizontalOverflow = async (page: import("@playwright/test").Page) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
};

test.describe("SPECIES first-read hierarchy", () => {
  test("Orca keeps the animal dominant and provenance out of the first-read hero", async ({ page }) => {
    await page.goto("/species/orca");
    const hero = page.locator('[data-species-section="hero"]');
    const animal = hero.locator("img");

    await expect(hero).toBeVisible();
    await expect(animal).toBeVisible();
    await expect(page.getByRole("heading", { name: "Orca", level: 1 })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    const viewport = page.viewportSize();
    if (viewport && viewport.width <= 620) {
      await expect(hero.getByText(/founder-supplied/i)).toBeHidden();
      await expect(hero.getByText(/commercial-rights claim/i)).toBeHidden();
      const mediaCredit = page.getByTestId("species-editorial-media-credit");
      await expect(mediaCredit).toBeVisible();
      await expect(mediaCredit.getByRole("link", { name: /taxon source/i })).toHaveAttribute("href", "https://www.gbif.org/species/2440483");
      await expect(mediaCredit.getByRole("link", { name: /image source/i })).toHaveCount(0);
      await expect(mediaCredit).toContainText("4PLANET — founder-supplied");
    } else {
      await expect(page.getByTestId("species-editorial-media-credit")).toBeHidden();
    }
  });

  test("Jaguar retains its verified Commons image-source file page", async ({ page }) => {
    await page.goto("/species/jaguar");
    const mediaCredit = page.getByTestId("species-editorial-media-credit");
    const viewport = page.viewportSize();

    if (viewport && viewport.width <= 620) {
      await expect(mediaCredit).toBeVisible();
      await expect(mediaCredit.getByRole("link", { name: /image source/i })).toHaveAttribute(
        "href",
        "https://commons.wikimedia.org/wiki/File:Jaguar_Pantanal.jpg",
      );
      await expect(mediaCredit.getByRole("link", { name: /taxon source/i })).toHaveCount(0);
    } else {
      await expect(mediaCredit).toBeHidden();
    }
  });
});
