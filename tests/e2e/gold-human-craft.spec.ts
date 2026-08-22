import { test, expect } from "@playwright/test";

/**
 * GOLD / WORLD CLASS — objective Human Craft regression layer.
 *
 * These assertions intentionally cover only what a browser can prove. They do
 * not self-approve visual taste or replace Founder/user judgement. The goal is
 * to make already-learned hierarchy/navigation failures hard to reintroduce.
 */

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(root.scrollWidth, document.body?.scrollWidth || 0) - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

async function assertCurrentMenu(page) {
  const menu = page.getByRole("button", { name: "Open menu" });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();

  for (const label of ["PRODUCTS", "DOMAINS", "MISSIONS", "4CULTURE", "4PLANET"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }

  await expect(page.getByText(/4NTARCTICA/i)).toHaveCount(0);
  await expect(page.getByText(/4TELIER/i)).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
}

for (const project of ["desktop-1440", "mobile-390", "mobile-430"] as const) {
  test.describe(`${project} GOLD human-craft`, () => {
    test.use({});

    test("one dominant homepage premise, reachable main content, current menu and no overflow", async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== project, `belongs to ${project}`);
      await page.goto("/", { waitUntil: "load" });

      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveText(/One connected living planet\./i);

      const primary = page.getByRole("link", { name: /ENTER ATLAS/i }).first();
      await expect(primary).toBeVisible();

      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: /SKIP TO MAIN CONTENT/i });
      await expect(skip).toBeFocused();
      await skip.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();

      await assertCurrentMenu(page);
      await assertNoHorizontalOverflow(page);
    });
  });
}
