import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";

test("actor index filters three shared profiles without ranking", async ({ page }) => {
  await page.goto(`${BASE}/actors`);
  await expect(page.getByRole("heading", { name: /Find who is working/ })).toBeVisible();
  await expect(page.getByText("3 OF 3 PROFILES")).toBeVisible();
  await page.getByLabel("Actor type").selectOption("DATA_INFRASTRUCTURE");
  await expect(page.getByText("1 OF 3 PROFILES")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Global Biodiversity Information Facility" })).toBeVisible();
  await expect(page.getByText(/No universal ranking/)).toBeVisible();
});

test("World Land Trust profile exposes evidence boundaries and official actions", async ({ page }) => {
  await page.goto(`${BASE}/actors/world-land-trust`);
  await expect(page.getByRole("heading", { name: "World Land Trust" })).toBeVisible();
  await expect(page.getByText(/A donation is not automatically a transferable 4PLANET land unit/)).toBeVisible();
  await expect(page.getByRole("link", { name: /OFFICIAL WEBSITE/ })).toHaveAttribute("href", /worldlandtrust\.org/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://4planet.org/actors/world-land-trust");
});

test("claim form writes only to the private local review queue", async ({ page }) => {
  await page.goto(`${BASE}/actors/rainforest-foundation-norway`);
  await page.getByLabel("Name").fill("Private Beta Reviewer");
  await page.getByLabel("Role").fill("Authorised representative");
  await page.getByLabel("Official email").fill("reviewer@example.org");
  await page.getByLabel("Organisation domain").fill("example.org");
  await page.getByLabel("Authorisation context").fill("Private beta review request.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /SUBMIT TO INTERNAL REVIEW/ }).click();
  await expect(page.getByText(/Queued for internal review/)).toBeVisible();
  const queue = await page.evaluate(() => localStorage.getItem("4planet:p17:actor-review-queue"));
  expect(queue).toContain("RECEIVED_FOR_INTERNAL_REVIEW");
});

test("Actor Mode remains on the existing Atlas route with separate geography roles", async ({ page }) => {
  await page.goto(`${BASE}/atlas?mode=actors&entity=actor%3Ap17%3AP17-A003&c=12.57,55.68&z=5.2`);
  await expect(page.getByRole("complementary", { name: "Actor Mode private beta" })).toBeVisible();
  await expect(page.getByText("HEADQUARTERS REFERENCE")).toBeVisible();
  await expect(page.getByText("OPERATING GEOGRAPHY")).toBeVisible();
  await expect(page).toHaveURL(/\/atlas\?mode=actors/);
  await expect(page.getByRole("link", { name: /OPEN PROFILE/ })).toHaveAttribute("href", "/actors/global-biodiversity-information-facility");
});
