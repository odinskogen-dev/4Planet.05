import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 2);
}

test.describe("4BRAND Company Operating Twin", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem("4brand:company-twin:local-beta-02");
      window.localStorage.removeItem("4brands:company-twin:local-beta-01");
    });
  });

  test("canonical route exposes company intelligence and the complete Twin", async ({ page }) => {
    await page.goto("/4brand");
    await expect(page).toHaveURL(/\/4brand$/);

    await expect(page.getByRole("heading", { name: /Where better business.*living planet/i })).toBeVisible();
    await expect(page.getByLabel("Company").first()).toHaveValue("TOMRA");
    await expect(page.getByRole("button", { name: "Run company analysis" })).toBeVisible();
    await expect(page.getByText(/Facts stay facts\. Estimates stay estimates/i)).toBeVisible();

    const twin = page.locator("#company-twin");
    await twin.scrollIntoViewIfNeeded();
    await expect(twin.getByRole("heading", { name: "One company. One living model." })).toBeVisible();
    await expect(twin.getByRole("heading", { name: "Company Board" })).toBeVisible();

    for (const board of ["Economic spine", "Value drivers", "Economic pull", "Value delivery", "Market meaning", "Value at risk", "Real intersection", "Next value", "Human choice"]) {
      await expect(twin.getByRole("heading", { name: board, exact: true })).toBeVisible();
    }

    await expect(twin.getByRole("heading", { name: "Decision + Value Ledger" })).toBeVisible();
    for (const state of ["Estimated", "Approved", "Invested", "Measured", "Realised"]) {
      await expect(twin.getByText(state, { exact: true })).toBeVisible();
    }
    await expectNoHorizontalOverflow(page);
  });

  test("Build Your Twin keeps private working state local and projects it into the preview", async ({ page }) => {
    await page.goto("/4brand#company-twin");
    const twin = page.locator("#company-twin");

    await twin.getByLabel("Company").fill("QA COMPANY");
    await twin.getByLabel("Primary objective").fill("Improve operating margin");
    await twin.getByLabel("Annual revenue").fill("NOK 100m working baseline");
    await twin.getByLabel("Priority opportunity").fill("Reduce avoidable operating leakage");
    await twin.getByLabel("Estimated value").fill("Working estimate only");
    await twin.getByLabel("Measured value").fill("Not yet measured");
    await twin.getByLabel("Decision state").selectOption("CHOSEN");
    await twin.getByRole("button", { name: "SAVE TWIN STATE" }).click();
    await expect(twin.getByRole("button", { name: "SAVED LOCALLY" })).toBeVisible();

    await expect(twin.getByText("QA COMPANY", { exact: true })).toBeVisible();
    await expect(twin.getByText("Improve operating margin", { exact: true })).toBeVisible();
    await expect(twin.getByText("Working estimate only", { exact: true })).toBeVisible();
    await expect(twin.getByText("Not yet measured", { exact: true })).toBeVisible();

    await page.reload();
    const reloadedTwin = page.locator("#company-twin");
    await expect(reloadedTwin.getByLabel("Company")).toHaveValue("QA COMPANY");
    await expect(reloadedTwin.getByLabel("Decision state")).toHaveValue("CHOSEN");
    await expectNoHorizontalOverflow(page);
  });

  test("legacy plural route converges on singular 4BRAND", async ({ page }) => {
    await page.goto("/4brands");
    await expect(page).toHaveURL(/\/4brand$/);
    await expect(page.getByRole("heading", { name: /Where better business.*living planet/i })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
