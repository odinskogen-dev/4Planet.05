import { test, expect, type Page } from "@playwright/test";

const stories = [
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

const signals = [
  "cities-climate-biodiversity-health-blind-spots",
  "urban-forests-measure-biodiversity",
  "bluenature-ocean-space-cumulative-pressure",
  "automated-edna-erna-water-monitoring",
  "urban-rewilding-design-method",
  "nature-water-design-cities",
  "oecd-nature-positive-cities",
  "agriculture-needs-system-not-gadgets",
  "food-waste-biopolymers-loop",
  "fooddiverse-diversity-at-every-level",
  "seaweed-preservation-bluegreenfood",
  "carbon-farming-biodiversity-context",
] as const;

const topics = ["nature", "ocean", "innovation", "technology", "design", "science", "field", "people", "solutions", "climate", "cities", "food", "culture"] as const;
const series = ["from-the-field", "the-living-world", "planet-explained", "what-works", "choice", "visual-signal"] as const;
const utility = ["about", "sources", "corrections", "privacy", "archive", "search", "saved", "atlas"] as const;

async function expectNoOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(metrics.scrollWidth, `horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`).toBeLessThanOrEqual(metrics.clientWidth + 2);
}

async function expectRealImages(page: Page) {
  const failures = await page.locator("img").evaluateAll((images) => images
    .filter((image) => !image.closest('[aria-hidden="true"]'))
    .filter((image) => !image.complete || image.naturalWidth < 1 || image.naturalHeight < 1)
    .map((image) => image.getAttribute("src") || "missing-src"));
  expect(failures, `broken images: ${failures.join(", ")}`).toEqual([]);
}

async function expectAccessibleImageText(page: Page) {
  const failures = await page.locator("img").evaluateAll((images) => images
    .filter((image) => !image.closest('[aria-hidden="true"]'))
    .filter((image) => !(image.getAttribute("alt") || "").trim())
    .map((image) => image.getAttribute("src") || "missing-src"));
  expect(failures, `images without alt text: ${failures.join(", ")}`).toEqual([]);
}

test("every full story is readable, sourced, visual and structurally alive", async ({ page }) => {
  for (const slug of stories) {
    await page.goto(`/magazine/${slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator('.mag-article-world[data-longform="true"]')).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('.editorial[data-editorial-reveal="off"] p').first()).toBeVisible();
    await expect(page.locator(".mag-article-world-hero img")).toBeVisible();
    await expect(page.locator(".mag-article-inline-visual img")).toBeVisible();
    await expect(page.getByText("HOW WE KNOW", { exact: true })).toBeVisible();
    await expect(page.locator(".mag-source-desk")).toBeVisible();
    await expectNoOverflow(page);
    await expectRealImages(page);
    await expectAccessibleImageText(page);
  }
});

test("every Planet Signal is a real bounded reader object", async ({ page }) => {
  for (const slug of signals) {
    await page.goto(`/magazine/signals/${slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText("THE SIGNAL", { exact: true })).toBeVisible();
    await expect(page.getByText("WHY IT MATTERS", { exact: true })).toBeVisible();
    await expect(page.getByText("DO NOT OVER-READ THIS", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /OPEN SOURCE/ })).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator(".mag-signal-visual img")).toBeVisible();
    await expectRealImages(page);
    await expectNoOverflow(page);
  }
});

test("all topic destinations and editorial series have useful rendered destinations", async ({ page }) => {
  for (const topic of topics) {
    await page.goto(`/magazine/topics/${topic}`);
    await expect(page.locator(".mag-hub h1")).toBeVisible();
    await expect(page.locator(".mag-hub")).toContainText(/FULL STORIES|CONNECTED READING|PLANET SIGNAL/i);
    await expect(page.locator(".mag-hub-related-biome")).toBeVisible();
    await expectNoOverflow(page);
  }
  for (const item of series) {
    await page.goto(`/magazine/series/${item}`);
    await expect(page.locator(".mag-hub h1")).toBeVisible();
    await expect(page.locator(".mag-hub--series")).toBeVisible();
    await expectNoOverflow(page);
  }
});

test("trust, reader utility and Atlas routes are real destinations", async ({ page }) => {
  for (const item of utility) {
    await page.goto(`/magazine/${item}`);
    await expect(page.locator(".mag-world")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    await expectNoOverflow(page);
  }
  await page.goto("/magazine/atlas");
  await expect(page.locator(".mag-public-atlas-frame iframe")).toHaveAttribute("src", /embed=mag/);
  await expect(page.getByText(/ATLAS is 4PLANET’s interactive planetary interface/i)).toBeVisible();
});

test("the public Magazine never leaks TEST KING navigation", async ({ page }) => {
  await page.goto("/magazine");
  await page.waitForTimeout(100);
  const unsafe = await page.locator("a").evaluateAll((links) => links.map((a) => a.getAttribute("href") || "").filter((href) => /king-test|recovery-testking-magazine/i.test(href)));
  expect(unsafe).toEqual([]);
  await page.goto("/magazine/ocean-watch-1-8-million-kilometres");
  await page.waitForTimeout(100);
  const internalProductLinks = await page.locator(".mag-world a").evaluateAll((links) => links.map((a) => a.getAttribute("href") || "").filter((href) => href.startsWith("/") && !href.startsWith("/magazine") && href !== "/rss.xml" && !href.startsWith("/assets/")));
  expect(internalProductLinks).toEqual([]);
});

test("keyboard, focus, reduced semantics and touch-independent meaning survive launch", async ({ page }) => {
  await page.goto("/magazine");
  await page.keyboard.press("Tab");
  await expect(page.locator(".mag-skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#magazine-content")).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expectAccessibleImageText(page);
  await expectNoOverflow(page);
  const visibleStoryTitles = await page.locator(".mag-story-tile h3").count();
  expect(visibleStoryTitles).toBeGreaterThan(5);
});

test("homepage performance has stable layout and a bounded LCP on the local production build", async ({ page, browserName }) => {
  await page.addInitScript(() => {
    (window as unknown as { __magVitals: { cls: number; lcp: number } }).__magVitals = { cls: 0, lcp: 0 };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
          if (!entry.hadRecentInput) (window as unknown as { __magVitals: { cls: number; lcp: number } }).__magVitals.cls += entry.value || 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
    } catch { /* browser may not expose CLS observer */ }
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) (window as unknown as { __magVitals: { cls: number; lcp: number } }).__magVitals.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch { /* browser may not expose LCP observer */ }
  });
  await page.goto("/magazine", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const vitals = await page.evaluate(() => (window as unknown as { __magVitals: { cls: number; lcp: number } }).__magVitals);
  expect(vitals.cls, `CLS ${vitals.cls}`).toBeLessThanOrEqual(0.1);
  if (browserName === "chromium" && vitals.lcp > 0) expect(vitals.lcp, `LCP ${vitals.lcp}ms`).toBeLessThanOrEqual(3000);
});

test("launch evidence screenshots render on representative desktop and mobile projects", async ({ page }, testInfo) => {
  const allowed = new Set(["mag-desktop-1440", "mag-mobile-390", "mag-webkit-390", "mag-android-412"]);
  test.skip(!allowed.has(testInfo.project.name), "Representative evidence only");
  await page.goto("/magazine", { waitUntil: "networkidle" });
  await page.screenshot({ path: testInfo.outputPath(`magazine-home-${testInfo.project.name}.png`), fullPage: true });
  await page.goto("/magazine/ocean-watch-1-8-million-kilometres", { waitUntil: "networkidle" });
  await page.screenshot({ path: testInfo.outputPath(`magazine-article-${testInfo.project.name}.png`), fullPage: true });
});
