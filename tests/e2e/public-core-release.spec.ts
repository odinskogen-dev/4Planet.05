import { expect, test } from "@playwright/test";

const publicCoreRoutes = [
  "/",
  "/domains",
  "/missions",
  "/atlas",
  "/species",
  "/living-systems",
  "/impact",
  "/magazine",
  "/about",
  "/about/founder",
  "/join",
  "/people",
  "/brands",
  "/partners",
  "/funders",
  "/privacy",
];

test("PUBLIC CORE critical routes render as one usable product family with no obvious dead end or horizontal overflow", async ({ page }) => {
  for (const route of publicCoreRoutes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${route} returned an HTTP error`).toBeLessThan(400);
    await expect(page.locator("#main-content"), `${route} missing the shared main landmark`).toBeVisible();
    await expect(page.locator(".public-brand"), `${route} missing the shared 4PLANET identity`).toBeVisible();
    await expect(page.locator("footer"), `${route} missing the shared return/orientation layer`).toHaveCount(1);
    await expect(page).toHaveTitle(/4PLANET/i);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${route} has page-level horizontal overflow`).toBeLessThanOrEqual(1);

    const visibleText = (await page.locator("#main-content").innerText()).replace(/\s+/g, " ").trim();
    expect(visibleText.length, `${route} rendered an effectively empty public surface`).toBeGreaterThan(24);
  }
});

test("PUBLIC CORE first read explains the proposition and exposes the four human lenses", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Everything you love is connected");
  await expect(page.getByText(/Explore one living planet/i)).toBeVisible();
  for (const label of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }
});

test("PUBLIC CORE shared shell retains basic keyboard, landmark and image accessibility contracts", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const skip = page.locator("a.skip-link");
  await skip.focus();
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "4PLANET home" })).toHaveCount(1);

  const unlabeledImages = await page.locator("img:not([alt])").count();
  expect(unlabeledImages, "homepage contains image elements without an alt attribute").toBe(0);

  const unnamedButtons = await page.locator("button").evaluateAll((buttons) => buttons.filter((button) => {
    const aria = button.getAttribute("aria-label")?.trim();
    const text = button.textContent?.trim();
    return !aria && !text;
  }).length);
  expect(unnamedButtons, "homepage contains buttons without an accessible name").toBe(0);
});

test("PUBLIC CORE homepage stays within a bounded local navigation-time budget", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return navigation ? navigation.loadEventEnd - navigation.startTime : Number.POSITIVE_INFINITY;
  });
  expect(timing, `homepage local load timing exceeded release sanity budget: ${timing}ms`).toBeLessThan(5_000);
});
