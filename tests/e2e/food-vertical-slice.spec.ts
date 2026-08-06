import { expect, test } from "@playwright/test";

test.describe("P18 FOOD controlled decision surface", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/labs/food-intelligence");
  });

  test("well-covered fixture separates direct, adjacent and unsuitable candidates", async ({ page }) => {
    await page.getByRole("button", { name: "Well-covered Norwegian test product" }).click();
    await expect(page.getByRole("heading", { name: "TEST RECORD — Norsk yoghurt naturell" })).toBeVisible();
    await expect(page.getByText("APPEND-ONLY COPY SAVED")).toBeVisible();
    await expect(page.locator(".food-gates").getByText("PASS")).toHaveCount(2);
    await expect(page.locator(".food-alternative")).toHaveCount(5);
    await expect(page.getByText(/Adjacent products — inspect, do not rank as substitutes/)).toBeVisible();
    await expect(page.getByText(/Unsuitable or unresolved candidates/)).toBeVisible();
    await expect(page.getByText("Direct substitute").first()).toBeVisible();
  });

  test("incomplete fixture exposes missing fields and does not hide uncertainty", async ({ page }) => {
    await page.getByRole("button", { name: "Incomplete product" }).click();
    await expect(page.getByText(/ingredients, allergens/i)).toBeVisible();
    await expect(page.getByText("Ingredient statement not available.")).toBeVisible();
  });

  test("unknown barcode is distinct from source failure", async ({ page }) => {
    await page.getByRole("button", { name: "Unknown barcode" }).click();
    await expect(page.getByRole("heading", { name: "Barcode not found" })).toBeVisible();
    await page.getByRole("button", { name: "Source or network failure" }).click();
    await expect(page.getByRole("heading", { name: "Source unavailable" })).toBeVisible();
  });

  test("conflicting record remains visible and both dependent gates amend", async ({ page }) => {
    await page.getByRole("button", { name: "Malformed or conflicting record" }).click();
    await expect(page.getByText(/source_gtin_mismatch/)).toBeVisible();
    await expect(page.locator(".food-gates").getByText("AMEND")).toHaveCount(2);
  });

  test("manual lookup is keyboard reachable and correctly labelled", async ({ page }) => {
    const input = page.getByLabel("Barcode / GTIN");
    await expect(input).toBeVisible();
    await input.focus();
    await expect(input).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Read source" })).toBeFocused();
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("mobile viewport has no horizontal page overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.getByRole("button", { name: "Well-covered Norwegian test product" }).click();
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport + 1);
    await expect(page.getByRole("heading", { name: "Transparent comparison" })).toBeVisible();
  });
});
