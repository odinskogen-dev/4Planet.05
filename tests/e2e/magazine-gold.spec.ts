import { test, expect } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth, `horizontal overflow: ${overflow.scrollWidth}px > ${overflow.width}px`).toBeLessThanOrEqual(overflow.width + 1);
}

async function expectLoadedImages(page: import("@playwright/test").Page) {
  const broken = await page.locator("img").evaluateAll((images) => images
    .filter((image) => image.complete && image.naturalWidth === 0)
    .map((image) => ({ src: image.getAttribute("src"), alt: image.getAttribute("alt") })));
  expect(broken).toEqual([]);
}

test.describe("4PLANET MAGAZINE Gold surface", () => {
  test("homepage is a premium editorial front door", async ({ page }, testInfo) => {
    await page.goto("/magazine", { waitUntil: "networkidle" });

    await expect(page).toHaveTitle(/4PLANET MAGAZINE/i);
    await expect(page.getByRole("heading", { level: 1, name: "WHAT HOLDS" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /The story is the front door/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Start with one thing worth knowing/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /The conclusion is not for sale/i })).toBeAttached();
    const sections = page.getByRole("navigation", { name: "Magazine sections" });
    await expect(sections).toBeVisible();
    for (const section of ["LIFE", "PLANET", "HUMAN", "SOLUTIONS", "PEOPLE", "CULTURE"]) {
      await expect(sections.getByRole("link", { name: section, exact: true })).toBeVisible();
    }

    expect(await page.locator("h1").count()).toBe(1);
    await expectNoHorizontalOverflow(page);
    await expectLoadedImages(page);

    await page.screenshot({
      path: `artifacts/product-proof/magazine-home-${testInfo.project.name}.png`,
      fullPage: false,
    });
  });

  test("article works as a complete first-touch side door", async ({ page }, testInfo) => {
    await page.goto("/magazine/wh4les-migratory-intelligence", { waitUntil: "networkidle" });

    await expect(page).toHaveTitle(/WH4LES: the intelligence that travels through whole oceans \| 4PLANET MAGAZINE/i);
    await expect(page.getByRole("heading", { level: 1, name: /WH4LES: the intelligence that travels through whole oceans/i })).toBeVisible();
    await expect(page.getByText("ORGANISATIONAL CONTENT — NOT INDEPENDENT EDITORIAL")).toBeVisible();
    await expect(page.getByRole("button", { name: "SHARE ↗", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "SHARE THIS STORY ↗", exact: true })).toBeAttached();
    await expect(page.getByRole("heading", { name: /Trust belongs inside the story/i })).toBeAttached();
    await expect(page.getByRole("heading", { name: /Go deeper without starting over/i })).toBeAttached();
    await expect(page.getByRole("link", { name: /Enter WH4LES/i })).toBeAttached();
    await expect(page.getByRole("heading", { name: /Related by subject, not popularity/i })).toBeAttached();

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/magazine/wh4les-migratory-intelligence");
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((value) => value.includes('"@type":"Article"') && value.includes("4PLANET MAGAZINE"))).toBeTruthy();

    await expectNoHorizontalOverflow(page);
    await expectLoadedImages(page);
    await page.getByRole("heading", { name: /Trust belongs inside the story/i }).scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `artifacts/product-proof/magazine-article-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });

  test("pre-publication records stay visibly unindexed and non-Article", async ({ page }) => {
    await page.goto("/magazine/stories/a23a-bloom", { waitUntil: "networkidle" });

    await expect(page.getByText(/PRE-PUBLICATION STORY RECORD/i).first()).toBeVisible();
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toMatch(/noindex/i);
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.some((value) => /"@type"\s*:\s*"Article"/.test(value))).toBeFalsy();
    await expectNoHorizontalOverflow(page);
  });

  test("reduced-motion mode preserves the reading experience", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/magazine", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "WHAT HOLDS" })).toBeVisible();

    const heroTransition = await page.locator(".mag-hero-media").evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(heroTransition.split(",").every((value) => value.trim() === "0s")).toBeTruthy();
    await expectNoHorizontalOverflow(page);
  });
});
