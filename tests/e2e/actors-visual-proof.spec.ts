import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const ARTIFACTS = "artifacts/p17-actor-atlas";

test.beforeAll(async () => {
  await mkdir(ARTIFACTS, { recursive: true });
});

test("capture desktop actor index and profile evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/actors`);
  await expect(page.getByRole("heading", { name: /Find who is working/ })).toBeVisible();
  await page.screenshot({ path: `${ARTIFACTS}/desktop-actors-index.png`, fullPage: true });

  await page.goto(`${BASE}/actors/world-land-trust`);
  await expect(page.getByRole("heading", { name: "World Land Trust" })).toBeVisible();
  await page.screenshot({ path: `${ARTIFACTS}/desktop-world-land-trust.png`, fullPage: true });
});

test("capture mobile actor journey evidence", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/actors`);
  await expect(page.getByRole("heading", { name: /Find who is working/ })).toBeVisible();
  await page.screenshot({ path: `${ARTIFACTS}/mobile-actors-index.png`, fullPage: true });

  await page.goto(`${BASE}/actors/rainforest-foundation-norway`);
  await expect(page.getByRole("heading", { name: "Rainforest Foundation Norway" })).toBeVisible();
  await page.screenshot({ path: `${ARTIFACTS}/mobile-rainforest-foundation-norway.png`, fullPage: true });
});

test("capture Actor Mode on the existing Atlas route", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/atlas?mode=actors&entity=actor%3Ap17%3AP17-A003&c=12.57,55.68&z=5.2`);
  await expect(page.getByRole("complementary", { name: "Actor Mode private beta" })).toBeVisible();
  await page.screenshot({ path: `${ARTIFACTS}/desktop-atlas-actor-mode.png`, fullPage: true });
});
