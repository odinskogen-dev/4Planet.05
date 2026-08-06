import { test, expect } from "@playwright/test";

const route = "/labs/food-intelligence/user-test";

test("private FOOD user test stores one anonymous scan and exports evidence", async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole("heading", { name: "Test the decision—not the person." })).toBeVisible();
  await expect(page.getByText(/does not ask for a name, email, account or medical profile/i)).toBeVisible();

  await page.getByLabel(/I understand this is a private prototype test/).check();
  await page.getByRole("textbox", { name: "GTIN", exact: true }).fill("7038010055652");
  await page.getByLabel("Product name", { exact: true }).fill("Naturell Yoghourt");
  await page.getByLabel("Category", { exact: true }).fill("plain yoghurt");

  const packageChecks = page.locator(".food-user-test-grid--checks select");
  await expect(packageChecks).toHaveCount(4);
  for (let index = 0; index < 4; index += 1) {
    await packageChecks.nth(index).selectOption("match");
  }

  await page.getByLabel(/Comprehension time/).fill("24");
  await page.getByRole("button", { name: "Save anonymous scan record" }).click();

  await expect(page.getByText("Scans").locator("..").getByText("1")).toBeVisible();
  await expect(page.getByRole("button", { name: "Export JSON evidence" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Export CSV evidence" })).toBeEnabled();

  const stored = await page.evaluate(() => localStorage.getItem("p18:food:user-validation:v1"));
  expect(stored).toContain("7038010055652");
  expect(stored).not.toContain('"email"');
});

test("private FOOD user test keeps the observation form disabled without consent", async ({ page }) => {
  await page.goto(route);
  await expect(page.getByRole("textbox", { name: "GTIN", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save anonymous scan record" })).toBeDisabled();
});

test("private FOOD user test remains usable at a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await expect(page.getByRole("heading", { name: "Test the decision—not the person." })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});
