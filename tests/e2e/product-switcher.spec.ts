/**
 * Four Lenses navigation A/B full-page comparison evidence (desktop + mobile).
 * Captures the navigation closed and open in both variants. Assertions follow the
 * current public architecture: 4PLANET is the surrounding universe; the dialog
 * switches between the four lenses ATLAS / SPECIES / LIVING SYSTEMS / IMPACT.
 */
import { mkdirSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const OUT = "artifacts/switcher";
mkdirSync(OUT, { recursive: true });

async function openSwitcher(page: Page) {
  const trigger = page.getByRole("button", { name: /Open 4PLANET navigation, currently in/i }).first();
  await expect(trigger).toBeVisible();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Switch lens" });
  await expect(dialog).toBeVisible();
  for (const name of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
    await expect(dialog.getByRole("link", { name: new RegExp(name, "i") })).toBeVisible();
  }
  // 4PLANET frames the lenses; it is intentionally not rendered as a fifth lens.
  await expect(dialog.getByRole("link", { name: /^4PLANET$/i })).toHaveCount(0);
  return dialog;
}

for (const variant of ["A", "B"] as const) {
  test(`Four Lenses navigation variant ${variant} — closed and open`, async ({ page }, testInfo) => {
    const tag = `${testInfo.project.name}-${variant}`;
    await page.goto(`/species?sw=${variant}`, { waitUntil: "load" });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${tag}-closed.png`, fullPage: true });
    await openSwitcher(page);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${tag}-open.png`, fullPage: true });
  });
}
