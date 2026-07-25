import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const OUTPUT = "artifacts/product-proof";

mkdirSync(OUTPUT, { recursive: true });

async function verifySharedNavigation(page: import("@playwright/test").Page) {
  const navigation = page.getByRole("navigation", { name: "4PLANET product navigation" });
  await expect(navigation).toBeVisible();
  for (const name of ["4PLANET", "ATLAS", "SPECIES", "IMPACT"]) {
    await expect(navigation.getByRole("link", { name: new RegExp(`^${name}`) })).toBeVisible();
  }
  await expect(navigation.getByText("PUBLIC PREVIEW")).toBeVisible();
}

test("desktop proof captures the public entry, source-aware Orca profile and retained ATLAS context", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });

  await page.goto(`${BASE}/`);
  await verifySharedNavigation(page);
  await expect(page.locator("main")).toBeVisible();
  await page.screenshot({ path: `${OUTPUT}/01-4planet-desktop.png`, fullPage: true });

  await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif`);
  await verifySharedNavigation(page);
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  await expect(page.getByText("GBIF TAXON · ACCEPTED")).toBeVisible();
  await expect(page.getByText("SOURCE RECORD", { exact: true })).toBeVisible();
  await expect(page.getByText("5939349319", { exact: true })).toBeVisible();
  await expect(page.getByText("NONE CREATED", { exact: true })).toBeVisible();
  await expect(page.getByText("BUNDLED FIXTURE", { exact: true })).toBeVisible();
  await expect(page.getByText(/does not establish range, abundance, population trend/i)).toBeVisible();
  await page.screenshot({ path: `${OUTPUT}/02-orca-source-proof-desktop.png`, fullPage: true });

  const watchButton = page.getByRole("button", { name: "ADD TO LOCAL WATCH" });
  await expect(watchButton).toBeVisible();
  await watchButton.click();
  await expect(page.getByRole("button", { name: "WATCHING LOCALLY" })).toBeVisible();

  await page.getByRole("link", { name: /OPEN SAME ENTITY IN ATLAS/ }).click();
  await expect(page).toHaveURL(/\/atlas\?/);
  await expect(page).toHaveURL(/entity=taxon%3Agbif%3A2440483/);
  await expect(page).toHaveURL(/journey=orca-gbif/);
  await expect(page.getByText("CONTEXT PRESERVED")).toBeVisible();
  await page.screenshot({ path: `${OUTPUT}/03-atlas-context-desktop.png`, fullPage: true });
});

test("mobile proof preserves the public navigation, source limits and local Watch state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto(`${BASE}/`);
  await verifySharedNavigation(page);
  await expect(page.locator("main")).toBeVisible();
  await page.screenshot({ path: `${OUTPUT}/04-4planet-mobile.png`, fullPage: true });

  await page.goto(`${BASE}/species/orca?entity=taxon%3Agbif%3A2440483&journey=orca-gbif`);
  await verifySharedNavigation(page);
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  await expect(page.getByText("ECOLOGICAL SOURCE REVIEW PENDING")).toBeVisible();
  await expect(page.getByText(/do not establish range, abundance, population trend or live tracking/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /ADD TO LOCAL WATCH|WATCHING LOCALLY/ })).toBeVisible();
  await page.screenshot({ path: `${OUTPUT}/05-orca-source-proof-mobile.png`, fullPage: true });
});

test("IMPACT direct routes remain explicit local tests with no physical delivery", async ({ page }) => {
  for (const unit of ["tree", "plastic"]) {
    await page.goto(`${BASE}/impact/test/${unit}`);
    await verifySharedNavigation(page);
    await expect(page.getByText("TEST RECORD — NO PHYSICAL DELIVERY", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("NOT DELIVERED", { exact: false }).first()).toBeVisible();
    await page.screenshot({ path: `${OUTPUT}/06-${unit}-test-journey.png`, fullPage: true });
  }
});
