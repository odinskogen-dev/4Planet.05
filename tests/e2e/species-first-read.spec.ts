import { expect, test } from "@playwright/test";

const assertNoHorizontalOverflow = async (page: import("@playwright/test").Page) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
};

test.describe("SPECIES first-read hierarchy", () => {
  test("blocked Orca photo paths are absent from the preview artifact", async ({ request }) => {
    for (const path of [
      "/assets/species/orca/hero.jpg",
      "/assets/species/orca/hero-mobile.jpg",
    ]) {
      const response = await request.get(path);
      expect(response.status(), `${path} must fail closed`).toBe(404);
    }
    const illustration = await request.get("/assets/species/orca/illustration.jpg");
    expect(illustration.status()).toBe(200);
  });

  test("Orca fails canonical blocked media closed while keeping the factual profile usable", async ({ page }) => {
    await page.goto("/species/orca");
    const hero = page.locator('[data-species-section="hero"]');
    const animal = hero.locator("img");

    await expect(hero).toBeVisible();
    await expect(animal).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Orca", level: 1 })).toBeVisible();
    await expect(page.getByText(/rights-cleared photograph not available/i)).toBeVisible();
    await expect(page.getByTestId("species-editorial-media-credit")).toHaveCount(0);
    await assertNoHorizontalOverflow(page);
  });

  test("Jaguar retains its verified Commons image-source file page", async ({ page }) => {
    await page.goto("/species/jaguar");
    await expect(page.locator('[data-species-section="hero"] img')).toBeVisible();
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
