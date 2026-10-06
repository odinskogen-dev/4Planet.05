import { test, expect } from "@playwright/test";

/**
 * GOLD / WORLD CLASS — objective Human Craft regression layer.
 * Founder-selected LOST GOLD baseline: build/market-sale-01-poster hero,
 * premium navigation/menu grammar and full-bleed Domain entries.
 *
 * Browser assertions prove structure, responsiveness and already-decided hierarchy;
 * they do not replace Founder judgement on visual taste.
 */

async function assertNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return Math.max(root.scrollWidth, document.body?.scrollWidth || 0) - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

async function assertPremiumNavigation(page) {
  const width = page.viewportSize()?.width ?? 1440;

  if (width <= 920) {
    const menu = page.getByRole("button", { name: "Open menu" });
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "4PLANET navigation" })).toBeVisible();
    await expect(page.getByText("EXPLORE_", { exact: true })).toBeVisible();
    for (const label of ["ATLAS", "SPECIES", "LIVING SYSTEMS", "IMPACT"]) {
      await expect(page.getByRole("link", { name: new RegExp(`^${label}`) }).first()).toBeVisible();
    }
    await expect(page.getByText("DOMAINS + MISSIONS_", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /OCE4N/i }).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  } else {
    for (const label of ["EXPLORE", "DOMAINS", "MISSIONS", "CULTURE", "ABOUT"]) {
      await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
    }
    await page.getByRole("button", { name: "EXPLORE", exact: true }).hover();
    await expect(page.getByRole("region", { name: "EXPLORE navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: /ATLAS/i }).first()).toBeVisible();
  }

  await expect(page.getByText(/4NTARCTICA/i)).toHaveCount(0);
  await expect(page.getByText(/4TELIER/i)).toHaveCount(0);
}

for (const project of ["desktop-1440", "mobile-390", "mobile-430"] as const) {
  test.describe(`${project} GOLD human-craft`, () => {
    test.use({});

    test("founder-selected hero, premium navigation, full-bleed domains and no overflow", async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== project, `belongs to ${project}`);
      await page.goto("/", { waitUntil: "load" });

      const h1 = page.getByRole("heading", { level: 1 });
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveText(/Everything you love is connected\./i);
      await expect(page.getByRole("link", { name: /WHY 4PLANET/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /OPEN ATLAS/i })).toBeVisible();

      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: /SKIP TO (MAIN )?CONTENT/i });
      await expect(skip).toBeFocused();
      await skip.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();

      await assertPremiumNavigation(page);

      await expect(page.getByRole("heading", { name: "Human life depends on a living planet." })).toBeVisible();

      const atlasFrameElement = page.getByTitle("Interactive 4PLANET ATLAS");
      await expect(atlasFrameElement).toBeVisible();
      await atlasFrameElement.scrollIntoViewIfNeeded();
      const atlasFrame = page.frameLocator('iframe[title="Interactive 4PLANET ATLAS"]');
      await expect(atlasFrame.locator(".world.light")).toBeVisible({ timeout: 20_000 });
      await expect(atlasFrame.locator("canvas.maplibregl-canvas")).toBeVisible({ timeout: 20_000 });
      await expect(atlasFrame.getByRole("button", { name: /LAYERS/i })).toBeVisible();

      await expect(page.getByRole("heading", { name: "See the same living planet from different angles." })).toBeVisible();
      await expect(page.locator(".home-lens")).toHaveCount(4);
      await expect(page.getByRole("heading", { name: "Meet the Orca." })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Four connected worlds." })).toBeVisible();

      const worlds = page.locator(".home-world");
      await expect(worlds).toHaveCount(4);

      await expect(page.getByRole("heading", { name: "Understand it. Help it. Follow what happens." })).toBeVisible();
      const impactCards = page.locator(".home-impact-card");
      await expect(impactCards).toHaveCount(4);

      const width = page.viewportSize()?.width ?? 1440;
      if (width <= 680) {
        const firstWorld = await worlds.first().boundingBox();
        expect(firstWorld).not.toBeNull();
        expect(firstWorld!.width).toBeGreaterThanOrEqual(width - 2);

        const cardBoxes = await impactCards.evaluateAll((cards) =>
          cards.map((card) => {
            const rect = card.getBoundingClientRect();
            return { width: rect.width, height: rect.height };
          }),
        );
        expect(cardBoxes).toHaveLength(4);
        const heights = cardBoxes.map((box) => box.height);
        expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(2);
      }

      await assertNoHorizontalOverflow(page);
    });
  });
}
