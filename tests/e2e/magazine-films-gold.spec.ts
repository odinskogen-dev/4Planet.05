import { test, expect } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(metrics.scrollWidth, `horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`).toBeLessThanOrEqual(metrics.clientWidth + 2);
}

async function expectFilmImagesAreReal(page: import("@playwright/test").Page) {
  const cards = page.locator(".mag-film-card");
  await expect(cards).toHaveCount(40);
  const seenSources = new Set<string>();
  for (let i = 0; i < 40; i += 1) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    const image = card.locator(".mag-film-card-media img");
    await expect(image, `film ${i + 1} should use film-specific image material`).toHaveCount(1);
    await expect.poll(async () => image.evaluate((node) => {
      const img = node as HTMLImageElement;
      return { loaded: img.complete && img.naturalWidth > 0, src: img.currentSrc || img.src };
    }), { timeout: 15_000 }).toMatchObject({ loaded: true });
    const dimensions = await image.evaluate((node) => ({ width: (node as HTMLImageElement).naturalWidth, height: (node as HTMLImageElement).naturalHeight, src: (node as HTMLImageElement).currentSrc || (node as HTMLImageElement).src }));
    expect(dimensions.width, `film ${i + 1} image should be at least 480px wide`).toBeGreaterThanOrEqual(480);
    expect(dimensions.height, `film ${i + 1} image should be at least 270px high`).toBeGreaterThanOrEqual(270);
    expect(dimensions.src).not.toMatch(/\/assets\/(brand|domains|missions)\//);
    expect(seenSources.has(dimensions.src), `film ${i + 1} should not duplicate another film image`).toBe(false);
    seenSources.add(dimensions.src);
  }
}

async function expectMaze(page: import("@playwright/test").Page) {
  const cards = page.locator(".mag-film-card");
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) return;
  const boxes = [] as Array<{ width: number; height: number }>;
  for (let i = 0; i < Math.min(12, await cards.count()); i += 1) {
    const box = await cards.nth(i).boundingBox();
    if (box) boxes.push({ width: Math.round(box.width), height: Math.round(box.height) });
  }
  const widths = new Set(boxes.map((box) => box.width));
  if (viewport.width > 640) {
    expect(widths.size, "desktop Films should have multiple card widths").toBeGreaterThanOrEqual(3);
  } else {
    expect(widths.size, "mobile Films should mix half and full-width moments").toBeGreaterThanOrEqual(2);
    expect(Math.max(...boxes.map((box) => box.width))).toBeGreaterThan(viewport.width * 0.85);
    expect(Math.min(...boxes.map((box) => box.width))).toBeLessThan(viewport.width * 0.6);
  }
}

test.describe("4PLANET FILMS — premium release closure 05", () => {
  test("index is a 40-film image-led editorial product with useful discovery lanes", async ({ page }, testInfo) => {
    await page.goto("/films");
    await expect(page.locator("#films-title")).toHaveText("Films worth your attention.");
    await expect(page.locator(".mag-world-masthead-word").nth(1)).toHaveText("FILMS");
    await expect(page.locator(".mag-world-primary-nav").getByRole("link", { name: "FILMS", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".mag-film-card")).toHaveCount(40);
    await expect(page.locator(".mag-film-filter a")).toHaveCount(8);
    await expect(page.locator(".mag-film-featured-card")).toHaveCount(6);
    await expect(page.getByRole("heading", { name: "Start here." })).toBeVisible();
    await expect(page.locator(".mag-film-watch-now")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Watch now." })).toBeVisible();
    await expect(page.locator(".mag-film-lane")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "Thirty minutes or less." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recently added." })).toBeVisible();
    await expect(page.getByText(/qualified records/i)).toHaveCount(0);
    await expect(page.getByText(/editorial pipeline/i)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    await expectMaze(page);

    if (["mag-mobile-390", "mag-webkit-390"].includes(testInfo.project.name)) await expectFilmImagesAreReal(page);

    await page.getByRole("link", { name: "FOOD", exact: true }).click();
    await expect(page).toHaveURL(/\/films\?topic=FOOD$/);
    await expect(page.locator(".mag-film-card").first()).toBeVisible();
    expect(await page.locator(".mag-film-card").count()).toBeGreaterThan(0);
    await expect(page.locator(".mag-film-lane")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);

    if (["mag-mobile-390", "mag-desktop-1440"].includes(testInfo.project.name)) {
      await page.goto("/films");
      await page.screenshot({ path: testInfo.outputPath("films-index-closure-05.png"), fullPage: true });
    }
  });

  test("Watch Now rail moves on its own and pauses for interaction", async ({ page }) => {
    await page.goto("/films");
    const track = page.locator(".mag-film-watch-track");
    await expect(track).toBeVisible();
    const animationName = await track.evaluate((node) => getComputedStyle(node).animationName);
    expect(animationName).toContain("film-watch-now-loop");
    const viewport = page.locator(".mag-film-watch-viewport");
    await viewport.focus();
    await expect.poll(async () => track.evaluate((node) => getComputedStyle(node).animationPlayState)).toBe("paused");
    await viewport.press("ArrowRight");
  });

  test("search, filters and local saved list work without an account", async ({ page }) => {
    await page.goto("/films");
    const search = page.getByRole("searchbox", { name: "FIND A FILM" });
    await search.fill("octopus");
    await page.getByRole("button", { name: "SEARCH" }).click();
    await expect(page).toHaveURL(/q=octopus/);
    await expect(page.locator(".mag-film-card")).toHaveCount(1);
    await expect(page.getByRole("heading", { name: "My Octopus Teacher" })).toBeVisible();

    await page.goto("/films");
    const firstSave = page.locator(".mag-film-card-save").first();
    await firstSave.click();
    await expect(firstSave).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: /SAVED 1/ }).click();
    await expect(page).toHaveURL(/saved=1/);
    await expect(page.locator(".mag-film-card")).toHaveCount(1);
    await page.reload();
    await expect(page.locator(".mag-film-card")).toHaveCount(1);
  });

  test("desktop hover keeps each film accent instead of snapping back to brand blue", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) <= 640, "hover proof is desktop-only");
    await page.goto("/films");
    const card = page.locator(".mag-film-card").nth(1);
    await expect(card).toHaveAttribute("data-accent", "orange");
    await card.hover();
    await page.waitForTimeout(350);
    const first = await card.evaluate((node) => getComputedStyle(node).backgroundColor);
    await page.waitForTimeout(500);
    const second = await card.evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(first).toBe(second);
    expect(second).not.toBe("rgb(46, 46, 255)");
    expect(second).not.toBe("rgb(49, 93, 255)");
  });

  test("detail page makes art, watch, trailer, context, source and next discovery obvious", async ({ page }, testInfo) => {
    await page.goto("/films/yanuni");
    await expect(page.getByRole("heading", { name: "YANUNI", exact: true })).toBeVisible();
    await expect(page.locator(".mag-film-key-art img")).toBeVisible();
    await expect(page.locator(".mag-film-watch")).toHaveAttribute("href", "https://www.youtube.com/watch?v=RhDdAONYZeQ");
    await expect(page.locator(".mag-film-source")).toHaveAttribute("href", /^https:\/\//);
    await expect(page.locator(".mag-film-related-card")).toHaveCount(4);
    await expect(page.getByRole("button", { name: "SAVE FILM +" })).toBeVisible();
    await expect(page.getByRole("button", { name: "SHARE" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Watch the trailer." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Continue into place, species and living systems." })).toBeVisible();
    await expect(page.getByRole("link", { name: "OPEN 4PLANET ATLAS" })).toHaveAttribute("href", "/magazine/atlas");
    await expect(page.getByRole("link", { name: "EXPLORE THE FULL SELECTION" })).toBeVisible();
    await expect(page.locator("iframe")).toHaveAttribute("title", /YANUNI official film or trailer/);
    await expect(page.locator(".mag-film-dek")).not.toBeEmpty();
    await expectNoHorizontalOverflow(page);

    await page.goto("/films/reinventing-power");
    await expect(page.getByRole("heading", { name: "Reinventing Power: America’s Renewable Energy Boom", exact: true })).toBeVisible();
    await expect(page.locator(".mag-film-watch")).toHaveAttribute("href", "https://vimeo.com/268692241");
    await expect(page.locator(".mag-film-related-card")).toHaveCount(4);
    await expectNoHorizontalOverflow(page);

    if (["mag-mobile-390", "mag-desktop-1440"].includes(testInfo.project.name)) {
      await page.screenshot({ path: testInfo.outputPath("films-detail-closure-05.png"), fullPage: true });
    }
  });

  test("all 40 film detail routes have film art, watch/source pathways and no internal overflow", async ({ page }, testInfo) => {
    test.skip(!["mag-mobile-390", "mag-desktop-1440"].includes(testInfo.project.name), "all-40 route proof runs on one mobile and one desktop authority viewport");
    await page.goto("/films");
    const cards = page.locator(".mag-film-card");
    const links = page.locator(".mag-film-card > .mag-film-card-media");
    await expect(cards).toHaveCount(40);
    await expect(links).toHaveCount(40);
    const hrefs = await links.evaluateAll((nodes) => [...new Set(nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href")).filter(Boolean))] as string[]);
    expect(hrefs).toHaveLength(40);

    await page.route("https://www.youtube-nocookie.com/**", (route) => route.abort());
    for (const href of hrefs) {
      await page.goto(href);
      await expect(page.locator(".mag-film-detail")).toHaveAttribute("data-film-slug", href.split("/").pop() || "");
      const art = page.locator(".mag-film-key-art img");
      await expect(art, `${href} must show official film art`).toHaveCount(1);
      await expect.poll(async () => art.evaluate((node) => {
        const img = node as HTMLImageElement;
        return img.complete && img.naturalWidth > 0;
      }), { timeout: 15_000 }).toBe(true);
      const artSrc = await art.getAttribute("src");
      expect(artSrc || "").not.toMatch(/\/assets\/(brand|domains|missions)\//);
      await expect(page.locator(".mag-film-watch")).toHaveAttribute("href", /^https:\/\//);
      await expect(page.locator(".mag-film-source")).toHaveAttribute("href", /^https:\/\//);
      await expect(page.locator(".mag-film-context")).toBeVisible();
      await expect(page.locator(".mag-film-related-card").first()).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("Magazine exposes Films as a swipeable editorial rail using film material", async ({ page }, testInfo) => {
    await page.goto("/magazine");
    const rail = page.locator(".mag-film-home-stream");
    await expect(rail).toBeVisible();
    await expect(rail.getByRole("heading", { name: "4PLANET FILMS" })).toBeVisible();
    await expect(rail.getByRole("link", { name: "EXPLORE ALL FILMS" })).toHaveAttribute("href", "/films");
    await expect(rail.locator(".mag-story-stream-card").first()).toBeVisible();
    const firstImage = rail.locator(".mag-story-stream-card img").first();
    const src = await firstImage.getAttribute("src");
    expect(src || "").not.toMatch(/\/assets\/(brand|domains|missions)\//);
    await expectNoHorizontalOverflow(page);

    const viewport = page.viewportSize();
    if (viewport && viewport.width <= 640) {
      const first = await rail.locator(".mag-story-stream-card").nth(0).boundingBox();
      const second = await rail.locator(".mag-story-stream-card").nth(1).boundingBox();
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      if (first && second) expect(second.x).toBeLessThan(viewport.width);
    }

    if (["mag-mobile-390", "mag-desktop-1440"].includes(testInfo.project.name)) {
      await rail.scrollIntoViewIfNeeded();
      await page.screenshot({ path: testInfo.outputPath("magazine-films-rail-closure-05.png"), fullPage: false });
    }
  });

  test("theme toggle produces a real dark Magazine and returns to black light masthead", async ({ page }) => {
    await page.goto("/films");
    const root = page.locator(".mag-world");
    const toggle = page.locator(".mag-theme-toggle");
    await expect(root).toHaveAttribute("data-mag-theme", "light");
    const lightMasthead = await page.locator(".mag-world-masthead").evaluate((node) => getComputedStyle(node).color);
    expect(lightMasthead).toBe("rgb(8, 8, 8)");

    await toggle.click();
    await expect(root).toHaveAttribute("data-mag-theme", "dark");
    const filmsBg = await page.locator(".mag-films").evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(filmsBg).not.toBe("rgb(255, 255, 255)");
    const darkMasthead = await page.locator(".mag-world-masthead").evaluate((node) => getComputedStyle(node).color);
    expect(darkMasthead).not.toBe("rgb(8, 8, 8)");

    await page.goto("/magazine");
    await expect(page.locator(".mag-world")).toHaveAttribute("data-mag-theme", "dark");
    const homeBg = await page.locator(".mag-home").evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(homeBg).not.toBe("rgb(255, 255, 255)");
    await page.locator(".mag-theme-toggle").click();
    await expect(page.locator(".mag-world")).toHaveAttribute("data-mag-theme", "light");
    const magazineMasthead = await page.locator(".mag-world-masthead").evaluate((node) => getComputedStyle(node).color);
    expect(magazineMasthead).toBe("rgb(8, 8, 8)");
  });
});

test.describe("4PLANET FILMS — reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("automatic Films rail becomes static without losing discovery", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/magazine");
    await expect.poll(() => page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
    const track = page.locator(".mag-film-home-stream .mag-story-stream-track");
    await expect(track).toBeVisible();
    const animationName = await track.evaluate((node) => getComputedStyle(node).animationName);
    expect(animationName).toBe("none");
    await expect(page.getByRole("link", { name: "EXPLORE ALL FILMS" })).toBeVisible();
  });
});
