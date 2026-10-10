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
  test("4PLANET entry hands off to the canonical independent Magazine front door", async ({ page }) => {
    await page.route("https://4planetmagazine.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!doctype html><html><head><title>4PLANET MAGAZINE</title></head><body><main><h1>4PLANET MAGAZINE</h1></main></body></html>",
      });
    });

    await page.goto("/magazine", { waitUntil: "networkidle" });
    await expect(page).toHaveURL("https://4planetmagazine.com/");
    await expect(page).toHaveTitle(/4PLANET MAGAZINE/i);
    await expect(page.getByRole("heading", { level: 1, name: "4PLANET MAGAZINE" })).toBeVisible();
  });

  test("For a Living Planet is a premium mission front door", async ({ page }, testInfo) => {
    await page.goto("/magazine/why-4planet-exists", { waitUntil: "networkidle" });

    await expect(page).toHaveTitle(/For a Living Planet \| 4PLANET MAGAZINE/i);
    await expect(page.getByRole("heading", { level: 1, name: "For a Living Planet" })).toBeVisible();
    await expect(page.getByText("ORGANISATIONAL CONTENT — NOT INDEPENDENT EDITORIAL")).toBeVisible();
    await expect(page.getByText(/Holding the hand of someone we love/i)).toBeAttached();
    await expect(page.getByText(/caring has never been connected to capability well enough/i)).toBeAttached();
    await expect(page.getByRole("heading", { name: /From awe to understanding\. From understanding to action\./i })).toBeAttached();
    await expect(page.getByText(/There is a place for everyone who wants to help\. Including you\./i)).toBeAttached();

    const hero = page.getByRole("img", { name: /Earthrise/i }).first();
    await expect(hero).toBeVisible();
    const visualSequence = page.locator(".mag-story-visual-sequence");
    await expect(visualSequence).toBeAttached();
    await expect(visualSequence.locator("img")).toHaveCount(3);

    const join = page.getByRole("link", { name: /Find your part/i });
    await expect(join).toHaveAttribute("href", "/join");

    await expectNoHorizontalOverflow(page);
    await expectLoadedImages(page);
    await page.screenshot({
      path: `artifacts/product-proof/magazine-for-a-living-planet-${testInfo.project.name}.png`,
      fullPage: true,
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

  test("reduced-motion mode preserves the internal article reading experience", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/magazine/wh4les-migratory-intelligence", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { level: 1, name: /WH4LES: the intelligence that travels through whole oceans/i })).toBeVisible();
    await expect(page.getByText("ORGANISATIONAL CONTENT — NOT INDEPENDENT EDITORIAL")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectLoadedImages(page);
  });
});
