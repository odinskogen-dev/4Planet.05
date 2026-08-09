import { expect, test, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const ARTIFACTS = "artifacts/p17-organisations";
const ACTOR_ATLAS_URL = `${BASE}/atlas?mode=actors&entity=actor%3Ap17%3AP17-A003&actorGeo=geo%3Agbif%3Asecretariat&c=12.57,55.68&z=5.2`;

async function settleVisualLayout(page: Page) {
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(450);
}

async function screenshot(page: Page, selector: string, name: string) {
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeVisible();
  await settleVisualLayout(page);
  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>('header, a[href="#main-content"]').forEach((element) => {
      const fixedHeader = element.tagName === "HEADER" && getComputedStyle(element).position === "fixed";
      const skipLink = element.matches('a[href="#main-content"]');
      if (!fixedHeader && !skipLink) return;
      element.dataset["p17PreviousVisibility"] = element.style.visibility;
      element.style.visibility = "hidden";
    });
  });
  await target.screenshot({ path: `${ARTIFACTS}/${name}.png` });
  await page.evaluate(() => {
    document.querySelectorAll<HTMLElement>('[data-p17-previous-visibility]').forEach((element) => {
      element.style.visibility = element.dataset["p17PreviousVisibility"] ?? "";
      delete element.dataset["p17PreviousVisibility"];
    });
  });
}

test.beforeAll(async () => { await mkdir(ARTIFACTS, { recursive: true }); });

test("capture homepage and desktop discovery evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/`);
  const homeHeading = page.getByRole("heading", { name: /Meet the organisations turning knowledge/ });
  await homeHeading.scrollIntoViewIfNeeded();
  await expect(homeHeading).toBeVisible();
  await screenshot(page, "section[aria-labelledby='home-organisations-title']", "desktop-home-organisations");

  await page.goto(`${BASE}/actors`);
  await expect(page.getByRole("heading", { name: /Working for a living planet/ })).toBeVisible();
  await screenshot(page, ".actors-hero", "desktop-organisations-hero");
  await screenshot(page, ".knowledge-collection", "desktop-knowledge-curated");
  await screenshot(page, ".actors-controls", "desktop-organisations-filters");
});

test("capture knowledge profile v2.1 and source-aware relationship view", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/actors/ocean-biodiversity-information-system`);
  await expect(page.locator("h1").filter({ hasText: /^Ocean Biodiversity Information System$/ })).toBeVisible();
  await screenshot(page, ".knowledge-profile-hero", "desktop-obis-knowledge-hero");
  await screenshot(page, ".knowledge-flow", "desktop-obis-source-graph");
  await screenshot(page, ".knowledge-boundary", "desktop-obis-limitations");
  await screenshot(page, ".knowledge-review-form", "desktop-obis-review-gate");
});

test("capture premium field profile meaning, visualisation and evidence regression", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/actors/world-land-trust`);
  await expect(page.locator("h1").filter({ hasText: /^World Land Trust$/ })).toBeVisible();
  await screenshot(page, ".actor-profile-hero", "desktop-world-land-trust-hero");
  await screenshot(page, ".actor-signature", "desktop-world-land-trust-signature");
  await screenshot(page, ".actor-claim-list", "desktop-world-land-trust-evidence");
  await screenshot(page, ".actor-action-grid", "desktop-world-land-trust-actions");
  await screenshot(page, ".actor-share-card", "desktop-world-land-trust-share-card");
});

test("capture Global Fishing Watch data-only scale proof regression", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/actors/global-fishing-watch`);
  await expect(page.locator("h1").filter({ hasText: /^Global Fishing Watch$/ })).toBeVisible();
  await screenshot(page, ".actor-profile-hero", "desktop-global-fishing-watch-hero");
  await screenshot(page, ".actor-signature", "desktop-global-fishing-watch-data-system");
});

test("capture mobile discovery, knowledge profile and secure review gate", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/actors`);
  await expect(page.getByRole("heading", { name: /Working for a living planet/ })).toBeVisible();
  await screenshot(page, ".actors-hero", "mobile-organisations-hero");
  await screenshot(page, ".actors-controls", "mobile-organisations-filters");

  await page.goto(`${BASE}/actors/artsdatabanken`);
  await expect(page.locator("h1").filter({ hasText: /^Artsdatabanken$/ })).toBeVisible();
  await screenshot(page, ".knowledge-profile-hero", "mobile-artsdatabanken-knowledge-hero");
  await screenshot(page, ".knowledge-review-form", "mobile-artsdatabanken-review-gate");
});

test("capture native Actor Mode on the existing Atlas route", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(ACTOR_ATLAS_URL);
  const desktopOverlay = page.getByRole("complementary", { name: "Actor Mode private beta" });
  await expect(desktopOverlay).toBeVisible();
  await expect(desktopOverlay).toHaveAttribute("data-p17-native-actor-layer", /ready|unavailable/, { timeout: 15_000 });
  await settleVisualLayout(page);
  await page.screenshot({ path: `${ARTIFACTS}/desktop-atlas-native-actor-mode.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(ACTOR_ATLAS_URL);
  const mobileOverlay = page.getByRole("complementary", { name: "Actor Mode private beta" });
  await expect(mobileOverlay).toBeVisible();
  await expect(mobileOverlay).toHaveAttribute("data-p17-native-actor-layer", /ready|unavailable/, { timeout: 15_000 });
  await settleVisualLayout(page);
  await page.screenshot({ path: `${ARTIFACTS}/mobile-atlas-native-actor-mode.png` });
});
