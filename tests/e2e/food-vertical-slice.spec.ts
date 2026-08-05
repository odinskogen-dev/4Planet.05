import { expect, test } from "@playwright/test";

test.describe("P18 FOOD vertical slice fixtures", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/labs/food-intelligence");
  });

  test("well-covered fixture passes product and comparison gates", async ({ page }) => {
    await page.getByRole("button", { name: "Well-covered Norwegian test product" }).click();
    await expect(page.getByRole("heading", { name: "TEST RECORD — Norsk yoghurt naturell" })).toBeVisible();
    await expect(page.getByText("APPEND-ONLY COPY SAVED")).toBeVisible();
    await expect(page.locator(".food-gates").getByText("PASS")).toHaveCount(2);
    await expect(page.locator(".food-alternative")).toHaveCount(5);
  });

  test("incomplete fixture exposes missing fields", async ({ page }) => {
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

  test("conflicting record remains visible but fails the product-card gate", async ({ page }) => {
    await page.getByRole("button", { name: "Malformed or conflicting record" }).click();
    await expect(page.getByText(/source_gtin_mismatch/)).toBeVisible();
    await expect(page.locator(".food-gates").getByText("AMEND")).toBeVisible();
  });
});
