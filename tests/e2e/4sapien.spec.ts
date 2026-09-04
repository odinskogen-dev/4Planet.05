import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 2);
}

test.describe("4SAPIEN Personal Choice Proof", () => {
  test("Embla front door states its human job and one first action", async ({ page }) => {
    await page.goto("/4sapien");
    await expect(page).toHaveURL(/\/4sapien$/);

    await expect(page.getByRole("heading", { name: "Choose better." })).toBeVisible();
    await expect(page.getByText(/says plainly\s+when it does not know/i)).toBeVisible();
    await expect(page.getByLabel("What are you choosing?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();

    // The front door promises only what the evidence path can currently do.
    await expect(page.getByText(/Comparisons run inside controlled groups/i)).toBeVisible();
    await expect(page.getByText(/an honest .not enough evidence./i)).toBeVisible();

    const foodWorkspace = page.getByRole("link", { name: /FOOD evidence workspace/i });
    await expect(foodWorkspace).toHaveAttribute("href", "/4sapien/food");
    await foodWorkspace.click();
    await expect(page).toHaveURL(/\/4sapien\/food$/);
    await expect(page.getByRole("button", { name: /READ PRODUCT/i })).toBeVisible();

    await page.goto("/4sapien");
    await expectNoHorizontalOverflow(page);
  });

  test("FOOD workspace exposes real lookup without a universal score", async ({ page }) => {
    await page.goto("/4sapien/food");
    await expect(page).toHaveURL(/\/4sapien\/food$/);

    await expect(page.getByRole("heading", { name: /Pick better/i })).toBeVisible();
    await expect(page.getByLabel("BARCODE / GTIN")).toBeVisible();
    await expect(page.getByRole("button", { name: /READ PRODUCT/i })).toBeVisible();
    await expect(page.getByText(/No universal score\. No paid ranking\. No fake precision\./i)).toBeVisible();
    await expect(page.getByText(/HEALTH, WALLET and PLANET separate/i)).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });

  test("4FINANCE remains analysis, not personalised trading advice", async ({ page }) => {
    await page.goto("/4sapien/finance");
    await expect(page).toHaveURL(/\/4sapien\/finance$/);

    await expect(page.getByRole("heading", { name: /Understand money/i })).toBeVisible();
    await expect(page.getByText(/MONEY MAP/i)).toBeVisible();
    await expect(page.getByText(/CHOICE COST/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "INVESTMENT INTELLIGENCE", exact: true })).toBeVisible();
    await expect(page.getByText(/not BUY \/ SELL instructions/i)).toBeVisible();

    await expectNoHorizontalOverflow(page);
  });
});
