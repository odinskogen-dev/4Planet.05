import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const OUT = "artifacts/public-experience";
mkdirSync(OUT, { recursive: true });

test("public homepage preserves brand-first hierarchy, shared Atlas truth and mobile width", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const hero = page.locator(".planet-hero");
  await expect(hero.getByRole("heading", { name: "Everything you love is connected.", level: 1 })).toBeVisible();
  await expect(hero.getByText("4PLANET_ · FOR A LIVING PLANET", { exact: true })).toBeVisible();
  await expect(hero.getByRole("link", { name: /WHY 4PLANET/i })).toBeVisible();
  await expect(hero.getByRole("link", { name: /OPEN ATLAS/i })).toBeVisible();
  await hero.screenshot({ path: `${OUT}/${testInfo.project.name}-home-hero.png` });

  const premise = page.locator("#why-4planet");
  await premise.scrollIntoViewIfNeeded();
  await expect(premise.getByRole("heading", { name: "A healthy living planet is infrastructure for human life." })).toBeVisible();
  await expect(premise.getByRole("link", { name: /THE STORY/i })).toBeVisible();
  await premise.screenshot({ path: `${OUT}/${testInfo.project.name}-home-premise.png` });

  const atlas = page.locator(".home-atlas-showcase");
  const hierarchy = await page.evaluate(() => {
    const p = document.querySelector("#why-4planet");
    const a = document.querySelector(".home-atlas-showcase");
    const w = document.querySelector("#worlds");
    const livingHeading = Array.from(document.querySelectorAll("h2")).find((el) => el.textContent?.includes("Meet life. Then follow the connections."));
    return {
      premiseBeforeAtlas: Boolean(p && a && (p.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING)),
      atlasBeforeWorlds: Boolean(a && w && (a.compareDocumentPosition(w) & Node.DOCUMENT_POSITION_FOLLOWING)),
      worldsBeforeLivingEntries: Boolean(w && livingHeading && (w.compareDocumentPosition(livingHeading) & Node.DOCUMENT_POSITION_FOLLOWING)),
    };
  });
  expect(hierarchy.premiseBeforeAtlas).toBe(true);
  expect(hierarchy.atlasBeforeWorlds).toBe(true);
  expect(hierarchy.worldsBeforeLivingEntries).toBe(true);

  await atlas.scrollIntoViewIfNeeded();
  await expect(atlas.getByRole("heading", { name: /The planet changes\. The evidence stays visible\./i })).toBeVisible();
  await expect(atlas.getByRole("tab", { name: "JAGUAR · AMAZON", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(atlas.getByRole("tab", { name: "ORCA · OCEAN", exact: true })).toBeVisible();
  await expect(atlas.getByRole("tab", { name: "BEE · FOOD", exact: true })).toBeVisible();
  await expect(atlas.getByText(/REPORTED OCCURRENCE ≠ RANGE · POPULATION · LIVE TRACKING/i)).toBeVisible();
  await expect(atlas.getByRole("link", { name: /OPEN FULL ATLAS/i })).toHaveAttribute("href", /entity=taxon%3Agbif%3A/);

  const livingEntry = page.getByRole("heading", { name: "Meet life. Then follow the connections." });
  await livingEntry.scrollIntoViewIfNeeded();
  await expect(livingEntry).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jaguar", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Homo sapiens", exact: true })).toBeVisible();
  await expect(page.locator('.home-journey')).toHaveCount(3);
  await expect(page.locator('.home-journey--primary')).toHaveCount(0);
  await expect(page.locator('img[src*="missions/wh4les/hero-real.jpg"]')).toHaveCount(0);

  await expect(page.locator(".product-switcher__trigger")).toHaveCount(0);

  const footer = page.locator(".public-footer");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.locator('img[src*="footer-planet.jpg"]')).toBeVisible();
  await expect(footer.getByText("NASA / ARTEMIS II · PUBLIC DOMAIN", { exact: true })).toBeVisible();
  await footer.screenshot({ path: `${OUT}/${testInfo.project.name}-footer.png` });

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
