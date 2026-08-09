/**
 * Product Switcher A/B full-page comparison evidence (desktop + mobile).
 * Captures the switcher closed and open in both variants so the delivery package
 * carries the A/B comparison the audit asks for. Assertions are real: the open
 * dialog must expose the four product destinations.
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
  for (const name of ["4PLANET", "ATLAS", "SPECIES", "IMPACT"]) {
    await expect(dialog.getByRole("link", { name: new RegExp(name) })).toBeVisible();
  }
  return dialog;
}

for (const variant of ["A", "B"] as const) {
  test(`Product Switcher variant ${variant} — closed and open`, async ({ page }, testInfo) => {
    const tag = `${testInfo.project.name}-${variant}`;
    await page.goto(`/species?sw=${variant}`, { waitUntil: "load" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${tag}-closed.png`, fullPage: true });
    await openSwitcher(page);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${tag}-open.png`, fullPage: true });
  });
}
