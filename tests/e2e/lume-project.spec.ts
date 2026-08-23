import { test, expect } from "@playwright/test";

test.setTimeout(60_000);

test("LUME PROJECT physical renderer preserves projection controls and truth boundaries", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  await page.goto("/lume/project/?scene=0&mode=presenter", { waitUntil: "domcontentloaded" });

  const root = page.locator("#lume-project");
  const stage = page.locator(".lume-stage");
  const controller = page.locator(".lume-controller");
  const next = page.locator('[data-action="next"]');
  const calibration = page.locator(".lume-calibration");

  await expect(root).toHaveAttribute("data-mode", "presenter");
  await expect(root).toHaveAttribute("data-scene", "0");
  await expect(stage).toBeVisible();
  await expect(controller).toBeVisible();
  await expect(page.locator("#stage-counter")).toHaveText("01 / 06");
  await expect(page.locator(".scene-title")).toContainText(/Meet one life/i);
  await expect(page.locator("#truth-boundary")).toContainText(/NOT LIVE TRACKING/i);

  await next.click();
  await expect(root).toHaveAttribute("data-scene", "1");
  await expect(page.locator("#stage-counter")).toHaveText("02 / 06");
  await expect(page.locator(".scene-title")).toContainText(/Follow what it depends on/i);

  await next.click();
  await expect(root).toHaveAttribute("data-scene", "2");
  await expect(page.locator(".scene-title")).toContainText(/Project the place/i);
  await expect(page.locator("#truth-boundary")).toContainText(/PILOT CORRIDOR ≠ ORCA MIGRATION TRACK/i);

  await page.locator('[data-action="calibrate"]').click();
  await expect(root).toHaveAttribute("data-calibrating", "true");
  await expect(calibration).toBeVisible();
  await expect(page.locator(".calibration-copy")).toContainText(/PROJECTION CALIBRATION/i);
  await page.keyboard.press("c");
  await expect(root).toHaveAttribute("data-calibrating", "false");

  await page.locator('[data-action="mode"]').click();
  await expect(root).toHaveAttribute("data-mode", "wall");
  await expect(controller).toBeHidden();
  await expect(page).toHaveURL(/mode=wall/);

  await page.keyboard.press("p");
  await expect(root).toHaveAttribute("data-mode", "presenter");
  await expect(controller).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(root).toHaveAttribute("data-scene", "3");
  await expect(page.locator(".scene-title")).toContainText(/Pull back to the planet/i);

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(2);
  expect(errors, `page errors: ${errors.join(" | ")}`).toEqual([]);
});
