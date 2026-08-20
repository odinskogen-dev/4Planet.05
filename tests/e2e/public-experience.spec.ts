import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/public-experience";
mkdirSync(OUT, { recursive: true });

test("public homepage preserves premium hierarchy, shared Atlas truth and mobile width", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const hero = page.locator(".planet-hero");
  await expect(hero.getByRole("heading", { name: "Everything you love is connected.", level: 1 })).toBeVisible();
  await expect(hero.getByText("4PLANET_ · FOR A LIVING PLANET", { exact: true })).toBeVisible();
  await expect(hero.getByRole("link", { name: /EXPLORE THE PLANET/i })).toBeVisible();
  await expect(hero.getByRole("link", { name: /WHY 4PLANET/i })).toBeVisible();
  await hero.screenshot({ path: `${OUT}/${testInfo.project.name}-home-hero.png` });

  const atlas = page.locator(".home-atlas-showcase");
  await atlas.scrollIntoViewIfNeeded();
  await expect(atlas.getByRole("heading", { name: /The planet changes\. The evidence stays visible\./i })).toBeVisible();
  await expect(atlas.getByRole("tab", { name: "JAGUAR · AMAZON", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(atlas.getByRole("tab", { name: "ORCA · OCEAN", exact: true })).toBeVisible();
  await expect(atlas.getByRole("tab", { name: "BEE · FOOD", exact: true })).toBeVisible();
  await expect(atlas.getByText(/REPORTED OCCURRENCE ≠ RANGE · POPULATION · LIVE TRACKING/i)).toBeVisible();
  await expect(atlas.getByRole("link", { name: /OPEN FULL ATLAS/i })).toHaveAttribute("href", /entity=taxon%3Agbif%3A/);

  const livingEntry = page.getByRole("heading", { name: "Start with something alive." });
  await livingEntry.scrollIntoViewIfNeeded();
  await expect(livingEntry).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jaguar", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Homo sapiens", exact: true })).toBeVisible();
  await expect(page.locator('img[src*="missions/wh4les/hero-real.jpg"]')).toHaveCount(0);

  const width = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(width.doc).toBeLessThanOrEqual(width.viewport);
  expect(width.body).toBeLessThanOrEqual(width.viewport);
});

test("SPECIES index and Orca profile fail closed on unverified photographs", async ({ page }, testInfo) => {
  await page.goto("/species", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Meet life on Earth.", level: 1 })).toBeVisible();
  await expect(page.getByText("4PLANET ILLUSTRATION · NOT A PHOTOGRAPH", { exact: true })).toBeVisible();
  await expect(page.locator('img[src="/assets/species/_index-hero.jpg"]')).toHaveCount(0);
  await expect(page.getByAltText("Orca — 4PLANET illustration, not a photograph")).toBeVisible();
  await page.locator("section").first().screenshot({ path: `${OUT}/${testInfo.project.name}-species-index.png` });

  await page.goto("/species/orca", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Orca", level: 1 })).toBeVisible();
  await expect(page.getByText(/PHOTOGRAPH · PENDING RIGHTS/i)).toBeVisible();
  await expect(page.getByText(/Photographs stay hidden until the exact licence is verified\./i)).toBeVisible();
  await expect(page.getByText(/Founder-supplied provenance does not establish copyright ownership or public-web rights\./i)).toBeVisible();
  await expect(page.locator('img[src*="/assets/species/orca/detail-"]')).toHaveCount(0);
});