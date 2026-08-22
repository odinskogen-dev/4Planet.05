/**
 * Product-family switcher evidence for the current TEST KING default.
 *
 * Do not claim an A/B comparison here: the production component does not expose a
 * query-string variant switch. This test proves the actual default that users see,
 * including all five family destinations and the open/closed interaction state.
 */
import { mkdirSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const OUT = "artifacts/switcher";
mkdirSync(OUT, { recursive: true });

async function openSwitcher(page: Page) {
  const trigger = page.getByRole("button", { name: /Switch product, current product/ }).first();
  await expect(trigger).toBeVisible();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Switch product" });
  await expect(dialog).toBeVisible();

  for (const name of ["4PLANET", "ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
    await expect(dialog.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  }

  return dialog;
}

test("Product Switcher — current GOLD default closed and open", async ({ page }, testInfo) => {
  const tag = `${testInfo.project.name}-gold-default`;
  await page.goto("/species", { waitUntil: "load" });
  await page.waitForTimeout(600);

  const trigger = page.getByRole("button", { name: /Switch product, current product SPECIES/ }).first();
  await expect(trigger).toBeVisible();
  await page.screenshot({ path: `${OUT}/${tag}-closed.png`, fullPage: true });

  await openSwitcher(page);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${tag}-open.png`, fullPage: true });
});
