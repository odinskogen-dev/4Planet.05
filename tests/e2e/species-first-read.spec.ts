import { expect, test } from "@playwright/test";

const assertNoHorizontalOverflow = async (page: import("@playwright/test").Page) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
};

test.describe("SPECIES first-read hierarchy", () => {
  test("Orca keeps the animal dominant and provenance out of compact hero", async ({ page }) => {
    await page.goto("/species/orca");
    const hero = page.locator(".sp-hero__media");
    const animal = hero.locator("img");

    await expect(hero).toBeVisible();
    await expect(animal).toBeVisible();
    await expect(page.getByRole("heading", { name: "Orca", level: 1 })).toBeVisible();
    await assertNoHorizontalOverflow(page);

    const viewport = page.viewportSize();
    if (viewport && viewport.width <= 620) {
      await expect(hero.getByText(/founder-supplied/i)).toBeHidden();
      await expect(hero.getByText(/commercial-rights claim/i)).toBeHidden();
    }
  });
});
