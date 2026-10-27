import { expect, test } from "@playwright/test";

const TOPIC_CASES = [
  { path: "/wildfires", h1: "Wildfires", source: "NASA FIRMS" },
  { path: "/earthquakes", h1: "Earthquakes", source: "USGS" },
] as const;

function expectAtlasParameterParity(embeddedHref: string, fullHref: string, pageUrl: string) {
  const embeddedUrl = new URL(embeddedHref, pageUrl);
  const fullUrl = new URL(fullHref, pageUrl);
  for (const parameter of ["m", "l", "z", "c"]) {
    const embedded = embeddedUrl.searchParams.get(parameter);
    const full = fullUrl.searchParams.get(parameter);
    expect(embedded, `embed missing ${parameter}`).not.toBeNull();
    expect(embedded?.trim(), `embed empty ${parameter}`).not.toBe("");
    expect(full, `full map missing ${parameter}`).not.toBeNull();
    expect(full?.trim(), `full map empty ${parameter}`).not.toBe("");
    expect(embedded).toBe(full);
  }
}

test("Discovery Engine 01 rejects missing, empty, or mismatched ATLAS view context", () => {
  const pageUrl = "https://example.test/now/";
  const completeEmbed = "/embed/atlas?m=events&l=ocean&z=4&c=1%2C2";
  const completeFull = "/atlas?m=events&l=ocean&z=4&c=1%2C2";

  expect(() => expectAtlasParameterParity(completeEmbed, completeFull, pageUrl)).not.toThrow();

  const invalidPairs = [
    {
      name: "one-sided missing l",
      embedded: "/embed/atlas?m=events&z=4&c=1%2C2",
      full: completeFull,
    },
    {
      name: "mismatched c",
      embedded: completeEmbed,
      full: "/atlas?m=events&l=ocean&z=4&c=3%2C4",
    },
    {
      name: "both missing l",
      embedded: "/embed/atlas?m=events&z=4&c=1%2C2",
      full: "/atlas?m=events&z=4&c=1%2C2",
    },
    {
      name: "both missing z",
      embedded: "/embed/atlas?m=events&l=ocean&c=1%2C2",
      full: "/atlas?m=events&l=ocean&c=1%2C2",
    },
    { name: "both missing all", embedded: "/embed/atlas", full: "/atlas" },
    {
      name: "both empty l",
      embedded: "/embed/atlas?m=events&l=&z=4&c=1%2C2",
      full: "/atlas?m=events&l=&z=4&c=1%2C2",
    },
  ];

  for (const fixture of invalidPairs) {
    expect(
      () => expectAtlasParameterParity(fixture.embedded, fixture.full, pageUrl),
      fixture.name,
    ).toThrow();
  }
});

test("Discovery Engine 01 reaches the slash-canonical Earth Now page without a redirect cycle", async ({ page }) => {
  const response = await page.goto("/now", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);

  let redirects = 0;
  for (let request = response!.request(); request.redirectedFrom(); request = request.redirectedFrom()!) {
    redirects += 1;
  }
  // The immutable built-preview server resolves the prerendered /now document
  // directly. Production routing has its own separately verified edge policy.
  expect(redirects).toBe(0);
  expect(new URL(page.url()).pathname).toBe("/now");

  await expect(page.getByRole("heading", { level: 1, name: /A living planet\.\s*A clearer view\./ })).toBeVisible();
  const caption = page.locator("p.earth-now-caption");
  await expect(caption).toHaveCount(1);
  await expect(caption).toContainText("Latest available from each source");
  await expect(caption).toBeVisible();

  // Keep the separate explanatory paragraph in the proof. A broad text
  // locator matches both legitimate elements and creates a strict-mode false
  // negative instead of testing the caption's semantic owner.
  await page.getByText("About the data", { exact: true }).click();
  await expect(
    page.getByText("Earth Now means latest available from each source", { exact: false }),
  ).toBeVisible();
  await expect(caption).toHaveCount(1);

  const iframe = page.locator('iframe[title^="Interactive Earth map:"]').first();
  await expect(iframe).toBeVisible();
  const src = await iframe.getAttribute("src");
  const embeddedUrl = new URL(src!, page.url());
  expect(embeddedUrl.origin).toBe(new URL(page.url()).origin);
  expect(embeddedUrl.pathname).toBe("/embed/atlas");
  expect(embeddedUrl.searchParams.get("embed")).toBe("news");
  expect(embeddedUrl.searchParams.get("surface")).toBe("discovery");

  const fullAtlas = page.getByRole("link", { name: /Open full map/ }).first();
  await expect(fullAtlas).toBeVisible();
  const fullHref = await fullAtlas.getAttribute("href");
  expect(new URL(fullHref!, page.url()).pathname).toBe("/atlas");
  expectAtlasParameterParity(src!, fullHref!, page.url());

  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toBe(`${new URL(page.url()).origin}/now/`);

  const brand = page.getByRole("link", { name: "4PLANET home" });
  await expect(brand).toHaveText("4PLANET_");
  await expect(page.locator("body")).not.toContainText("n/n/n");
});

for (const item of TOPIC_CASES) {
  test(`Discovery Engine 01 renders ${item.path} with canonical ATLAS embed`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    const response = await page.goto(item.path, { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBeTruthy();

    await expect(page.getByRole("heading", { level: 1, name: item.h1 })).toBeVisible();
    await expect(page.getByText(item.source, { exact: false }).first()).toBeVisible();

    const iframe = page.locator('iframe[title^="4PLANET ATLAS"]').first();
    await expect(iframe).toBeVisible();
    const src = await iframe.getAttribute("src");
    const embeddedUrl = new URL(src!, page.url());
    expect(embeddedUrl.origin).toBe(new URL(page.url()).origin);
    expect(embeddedUrl.pathname).toBe("/embed/atlas");
    expect(embeddedUrl.searchParams.get("embed")).toBe("news");
    expect(embeddedUrl.searchParams.get("surface")).toBe("discovery");

    const fullAtlas = page.getByRole("link", { name: /OPEN FULL ATLAS/ }).first();
    await expect(fullAtlas).toBeVisible();
    const fullHref = await fullAtlas.getAttribute("href");
    expect(fullHref).toContain("/atlas?");
    expectAtlasParameterParity(src!, fullHref!, page.url());

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    const runtimeOrigin = new URL(page.url()).origin;
    expect(canonical).toBe(`${runtimeOrigin}${item.path}`);

    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("index");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("Discovery Engine 01 keeps the governed ATLAS fallback usable when the embed is blocked", async ({ page }) => {
  let blockedEmbedRequests = 0;
  await page.route("**/embed/atlas?**", async (route) => {
    blockedEmbedRequests += 1;
    await route.abort("blockedbyclient");
  });

  const response = await page.goto("/wildfires", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();

  // WebKit does not fetch a below-the-fold lazy iframe until it approaches the
  // viewport. Exercise that real user path before asserting the blocked request.
  const iframe = page.locator('iframe[title^="4PLANET ATLAS"]').first();
  await iframe.scrollIntoViewIfNeeded();
  await expect.poll(() => blockedEmbedRequests).toBeGreaterThan(0);

  const fallback = page.getByRole("note", { name: "ATLAS embed fallback" });
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText("If the embedded map is unavailable");

  const fallbackLink = fallback.getByRole("link", { name: /OPEN THE SAME VIEW IN FULL ATLAS/ });
  await expect(fallbackLink).toBeVisible();
  const fallbackHref = await fallbackLink.getAttribute("href");
  expect(fallbackHref).toContain("/atlas?");

  const iframeSrc = await iframe.getAttribute("src");
  expectAtlasParameterParity(iframeSrc!, fallbackHref!, page.url());
});
