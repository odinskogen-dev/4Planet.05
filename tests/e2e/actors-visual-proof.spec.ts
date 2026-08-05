import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const ARTIFACTS = "artifacts/p17-organisations";
const ACTOR_ATLAS_URL = `${BASE}/atlas?mode=actors&entity=actor%3Ap17%3AP17-A003&actorGeo=geo%3Agbif%3Asecretariat&c=12.57,55.68&z=5.2`;

async function settleVisualLayout(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(300);
}

async function screenshot(page: Page, selector: string, name: string) {
  await settleVisualLayout(page);
  await page.locator(selector).first().screenshot({ path: `${ARTIFACTS}/${name}.png` });
}

test.beforeAll(async () => {
  await mkdir(ARTIFACTS, { recursive: true });
});

test("capture homepage and desktop discovery evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/`);
  await expect(page.getByRole("heading", { name: /Meet the organisations turning knowledge/ })).toBeVisible();
  await screenshot(page, "section[aria-labelledby='home-organisations-title']", "desktop-home-organisations");

  await page.goto(`${BASE}/actors`);
  await expect(page.getByRole("heading", { name: /Working for a living planet/ })).toBeVisible();
  await screenshot(page, ".actors-hero", "desktop-organisations-hero");
  await screenshot(page, ".actor-collection", "desktop-organisations-curated");
  await screenshot(page, ".actors-controls", "desktop-organisations-filters");
});

test("capture premium profile meaning, visualisation and evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/actors/world-land-trust`);
  await expect(page.locator("h1").filter({ hasText: /^World Land Trust$/ })).toBeVisible();
  await screenshot(page, ".actor-profile-hero", "desktop-world-land-trust-hero");
  await screenshot(page, ".actor-signature", "desktop-world-land-trust-signature");
  await screenshot(page, ".actor-claim-list", "desktop-world-land-trust-evidence");
  await screenshot(page, ".actor-action-grid", "desktop-world-land-trust-actions");
  await screenshot(page, ".actor-share-card", "desktop-world-land-trust-share-card");
});

test("capture Global Fishing Watch data-only scale proof", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/actors/global-fishing-watch`);
  await expect(page.locator("h1").filter({ hasText: /^Global Fishing Watch$/ })).toBeVisible();
  await screenshot(page, ".actor-profile-hero", "desktop-global-fishing-watch-hero");
  await screenshot(page, ".actor-signature", "desktop-global-fishing-watch-data-system");
});

test("capture mobile discovery, profile and secure review gate", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/actors`);
  await expect(page.getByRole("heading", { name: /Working for a living planet/ })).toBeVisible();
  await screenshot(page, ".actors-hero", "mobile-organisations-hero");
  await screenshot(page, ".actors-controls", "mobile-organisations-filters");

  await page.goto(`${BASE}/actors/rainforest-foundation-norway`);
  await expect(page.locator("h1").filter({ hasText: /^Rainforest Foundation Norway$/ })).toBeVisible();
  await screenshot(page, ".actor-profile-hero", "mobile-rainforest-foundation-norway-hero");
  await screenshot(page, ".actor-form-panel", "mobile-rainforest-foundation-norway-review-gate");
});

test("capture native Actor Mode on the existing Atlas route", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(ACTOR_ATLAS_URL);
  await expect(page.getByRole("complementary", { name: "Actor Mode private beta" })).toBeVisible();
  await settleVisualLayout(page);
  await page.screenshot({ path: `${ARTIFACTS}/desktop-atlas-native-actor-mode.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ACTOR_ATLAS_URL);
  await expect(page.getByRole("complementary", { name: "Actor Mode private beta" })).toBeVisible();
  await settleVisualLayout(page);
  await page.screenshot({ path: `${ARTIFACTS}/mobile-atlas-native-actor-mode.png` });
});
