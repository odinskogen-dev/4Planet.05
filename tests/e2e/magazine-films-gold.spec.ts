import { test, expect } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(metrics.scrollWidth, `horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`).toBeLessThanOrEqual(metrics.clientWidth + 2);
}

async function expectTwoUpMobile(page: import("@playwright/test").Page) {
  const cards = page.locator(".mag-film-card");
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  const viewport = page.viewportSize();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (!first || !second || !viewport) return;
  expect(Math.abs(first.y - second.y), "first two films should share one mobile row").toBeLessThanOrEqual(2);
  expect(first.width, "mobile card must remain a usable touch/discovery target").toBeGreaterThanOrEqual(130);
  expect(second.x + second.width, "second card must fit within viewport").toBeLessThanOrEqual(viewport.width + 1);
}

test.describe("4PLANET FILMS — premium product closure", () => {
  test("index is dense, legible, image-safe and navigable", async ({ page }, testInfo) => {
    await page.goto("/films");
    await expect(page.getByRole("heading", { name: "Films worth your attention." })).toBeVisible();
    await expect(page.locator(".mag-world-masthead-word").nth(1)).toHaveText("FILMS");
    await expect(page.getByRole("link", { name: "FILMS", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".mag-film-card")).toHaveCount(20);
    await expect(page.locator(".mag-film-filter a")).toHaveCount(8);
    await expectNoHorizontalOverflow(page);

    const viewport = page.viewportSize();
    if (viewport && viewport.width <= 640) await expectTwoUpMobile(page);

    if (testInfo.project.name === "mag-mobile-390") {
      const cards = page.locator(".mag-film-card");
      for (let i = 0; i < 20; i += 1) {
        const card = cards.nth(i);
        await card.scrollIntoViewIfNeeded();
        const image = card.locator(".mag-film-card-media img");
        if (await image.count()) {
          await expect.poll(async () => image.evaluate((node) => {
            const img = node as HTMLImageElement;
            return img.complete && img.naturalWidth > 0;
          })).toBe(true);
        } else {
          await expect(card.locator(".mag-film-image-fallback")).toBeVisible();
        }
      }
    }

    await page.getByRole("link", { name: "FOOD", exact: true }).click();
    await expect(page).toHaveURL(/\/films\?topic=FOOD$/);
    await expect(page.locator(".mag-film-card").first()).toBeVisible();
    await expect(page.locator(".mag-film-card")).not.toHaveCount(0);
    await expectNoHorizontalOverflow(page);

    await page.screenshot({ path: testInfo.outputPath("films-index.png"), fullPage: true });
  });

  test("detail pages make watch, source and next discovery unambiguous", async ({ page }, testInfo) => {
    await page.goto("/films/yanuni");
    await expect(page.getByRole("heading", { name: "YANUNI", exact: true })).toBeVisible();
    await expect(page.getByText("AVAILABILITY", { exact: true })).toBeVisible();
    await expect(page.locator(".mag-film-watch")).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator(".mag-film-source")).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator(".mag-film-related-card")).toHaveCount(3);
    await expect(page.getByRole("link", { name: "EXPLORE THE FULL SELECTION" })).toBeVisible();
    await expect(page.locator("iframe")).toHaveAttribute("title", /YANUNI official trailer/);
    await expectNoHorizontalOverflow(page);

    await page.goto("/films/the-biggest-little-farm");
    await expect(page.getByRole("heading", { name: "The Biggest Little Farm", exact: true })).toBeVisible();
    await expect(page.locator(".mag-film-watch")).toHaveAttribute("href", "https://www.neonrated.com/film/the-biggest-little-farm");
    await expect(page.locator(".mag-film-related-card")).toHaveCount(3);
    await expectNoHorizontalOverflow(page);

    if (testInfo.project.name === "mag-mobile-390" || testInfo.project.name === "mag-desktop-1440") {
      await page.screenshot({ path: testInfo.outputPath("films-detail-biggest-little-farm.png"), fullPage: true });
    }
  });

  test("Magazine exposes Films as a calm swipeable editorial rail", async ({ page }, testInfo) => {
    await page.goto("/magazine");
    const rail = page.locator(".mag-film-home-stream");
    await expect(rail).toBeVisible();
    await expect(rail.getByRole("heading", { name: "4PLANET FILMS" })).toBeVisible();
    await expect(rail.getByRole("link", { name: "EXPLORE ALL FILMS" })).toHaveAttribute("href", "/films");
    await expect(rail.locator(".mag-story-stream-card").first()).toBeVisible();
    await expect(rail.locator(".mag-story-stream-card").nth(1)).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const viewport = page.viewportSize();
    if (viewport && viewport.width <= 640) {
      const first = await rail.locator(".mag-story-stream-card").nth(0).boundingBox();
      const second = await rail.locator(".mag-story-stream-card").nth(1).boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      if (first && second) expect(second.x).toBeLessThan(viewport.width);
    }

    if (testInfo.project.name === "mag-mobile-390" || testInfo.project.name === "mag-desktop-1440") {
      await rail.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath("magazine-films-rail.png"), fullPage: false });
    }
  });
});

test.describe("4PLANET FILMS — reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("automatic Films rail becomes static without losing discovery", async ({ page }) => {
    await page.goto("/magazine");
    const track = page.locator(".mag-film-home-stream .mag-story-stream-track");
    await expect(track).toBeVisible();
    const animationName = await track.evaluate((node) => getComputedStyle(node).animationName);
    expect(animationName).toBe("none");
    await expect(page.getByRole("link", { name: "EXPLORE ALL FILMS" })).toBeVisible();
  });
});
