import { test, expect } from "@playwright/test";

const slugs = [
  "ocean-watch-1-8-million-kilometres",
  "five-am-bay-of-biscay",
  "air-filter-biodiversity-time-machine",
  "mine-that-became-wetland",
  "ai-coral-photomosaics",
  "roads-that-warn-cars-about-moose",
  "sea-pen-instead-of-tank",
  "why-4planet-exists",
  "the-four-domains",
  "wh4les-migratory-intelligence",
  "credible-tree-pathway",
  "amazonia-more-than-a-forest",
  "making-impact-easy",
] as const;

test("lead story copy is visible without an intersection reveal", async ({ page }) => {
  await page.goto("/magazine/ocean-watch-1-8-million-kilometres");
  await expect(page.getByText(/most important thing on a whale survey can be the hour/i)).toBeVisible();
  await expect(page.locator('.editorial[data-editorial-reveal="off"]').first()).toBeVisible();
  await expect(page.locator(".mag-article-inline-visual")).toBeVisible();
});

test("all launch stories expose longform copy and a second visual beat", async ({ page }) => {
  for (const slug of slugs) {
    await page.goto(`/magazine/${slug}`);
    await expect(page.locator('.mag-article-world[data-longform="true"]')).toBeVisible();
    await expect(page.locator('.editorial[data-editorial-reveal="off"] p').first()).toBeVisible();
    await expect(page.locator(".mag-article-inline-visual")).toBeVisible();
    await expect(page.getByText("HOW WE KNOW", { exact: true })).toBeVisible();
  }
});

test("Planet Signals have a distinct visual context frame", async ({ page }) => {
  await page.goto("/magazine/signals/automated-edna-erna-water-monitoring");
  await expect(page.locator(".mag-signal-visual")).toBeVisible();
  await expect(page.getByText("VISUAL CONTEXT", { exact: true })).toBeVisible();
  await expect(page.getByText("DO NOT OVER-READ THIS", { exact: true })).toBeVisible();
});
