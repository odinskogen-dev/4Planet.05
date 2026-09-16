import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "artifacts/4brands-proof";

async function shot(page: import("@playwright/test").Page, name: string, project: string) {
  mkdirSync(OUT, { recursive: true });
  await page.waitForTimeout(340);
  await page.screenshot({ path: `${OUT}/${project}-${name}.png`, fullPage: false });
}

async function nav(page: import("@playwright/test").Page, label: string) {
  const mobile = (page.viewportSize()?.width || 1000) <= 760;
  if (mobile && ["Home", "Finance", "Opportunities", "Evidence"].includes(label)) {
    await page.locator(".fbt-mobile-dock").getByRole("button", { name: label, exact: true }).click();
    return;
  }
  if (mobile) {
    await page.locator(".fbt-mobile-dock").getByRole("button", { name: "More", exact: true }).click();
    await page.locator(".fbt-sidebar").getByRole("button", { name: label, exact: true }).click();
    return;
  }
  await page.locator(".fbt-sidebar").getByRole("button", { name: label, exact: true }).click();
}

test("4BRANDS first touch → sparse Company Twin → controlled depth", async ({ page }, testInfo) => {
  await page.goto("/4brands", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "See your whole company." })).toBeVisible();
  await expect(page.getByLabel("Enter your company")).toBeVisible();
  await shot(page, "01-first-touch", testInfo.project.name);

  await page.getByRole("button", { name: /Try 4PLANET/i }).click();
  await expect(page.getByRole("heading", { name: "4PLANET" })).toBeVisible({ timeout: 8_000 });
  await expect(page.getByText("WHAT MATTERS NOW", { exact: true })).toBeVisible();
  await expect(page.getByText("COMPANY STATE", { exact: true })).toBeVisible();
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = page.viewportSize()?.height || 900;
  expect(documentHeight).toBeLessThanOrEqual(viewportHeight + 8);
  await shot(page, "02-company-home", testInfo.project.name);

  await nav(page, "Finance");
  await expect(page.getByRole("heading", { name: "Know the economic state." })).toBeVisible();
  await expect(page.getByText("ECONOMIC BASELINE", { exact: true })).toBeVisible();
  await shot(page, "03-finance", testInfo.project.name);

  await nav(page, "Opportunities");
  await expect(page.getByRole("heading", { name: "Where is the largest available value?" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Complete the economic baseline/i })).toBeVisible();
  await shot(page, "04-opportunities", testInfo.project.name);

  await page.getByRole("button", { name: "Complete Twin" }).click();
  await expect(page.getByRole("heading", { name: "Add company truth." })).toBeVisible();
  await expect(page.getByText("LOCAL PROTOTYPE · NO SERVER WRITE · NOT ASSURANCE", { exact: true })).toBeVisible();
  await shot(page, "05-complete-twin", testInfo.project.name);
});
