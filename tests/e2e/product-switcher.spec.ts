/**
 * Product-family navigation evidence for the current TEST KING default.
 *
 * The former standalone ProductSwitcher control was superseded by the current
 * PublicShell navigation grammar. This test proves the actual user-facing default
 * on a product page: 4PLANET home plus ATLAS, SPECIES, LIVING SYSTEMS and IMPACT
 * remain discoverable through the responsive EXPLORE navigation, with closed/open
 * evidence on every accepted viewport.
 */
import { mkdirSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const OUT = "artifacts/switcher";
mkdirSync(OUT, { recursive: true });

async function openProductNavigation(page: Page) {
  const width = page.viewportSize()?.width ?? 1440;

  await expect(page.getByRole("link", { name: "4PLANET home" })).toBeVisible();

  if (width <= 920) {
    const trigger = page.getByRole("button", { name: "Open menu" });
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "4PLANET navigation" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("EXPLORE_", { exact: true })).toBeVisible();
    for (const name of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
      await expect(dialog.getByRole("link", { name: new RegExp(`^${name}`) }).first()).toBeVisible();
    }
    return dialog;
  }

  const trigger = page.getByRole("button", { name: "EXPLORE", exact: true });
  await expect(trigger).toBeVisible();
  await trigger.hover();

  const region = page.getByRole("region", { name: "EXPLORE navigation" });
  await expect(region).toBeVisible();
  for (const name of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
    await expect(region.getByRole("link", { name: new RegExp(`^${name}`) }).first()).toBeVisible();
  }
  return region;
}

test("Product family navigation — current GOLD default closed and open", async ({ page }, testInfo) => {
  const tag = `${testInfo.project.name}-gold-default`;
  await page.goto("/species", { waitUntil: "load" });
  await page.waitForTimeout(600);

  await expect(page.getByRole("heading", { level: 1, name: /MEET LIFE ON EARTH/i })).toBeVisible();
  await page.screenshot({ path: `${OUT}/${tag}-closed.png`, fullPage: true });

  await openProductNavigation(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${tag}-open.png`, fullPage: true });
});
