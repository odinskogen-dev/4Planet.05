import { expect, test } from "@playwright/test";

const CASES = [
  { path: "/now", h1: "What is happening on Earth right now?", source: "LATEST AVAILABLE" },
  { path: "/wildfires", h1: "Wildfires", source: "NASA FIRMS" },
  { path: "/earthquakes", h1: "Earthquakes", source: "USGS" },
] as const;

for (const item of CASES) {
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
    expect(src).toContain("https://4planetatlas.com/");
    expect(src).toContain("embed=");

    const fullAtlas = page.getByRole("link", { name: /OPEN FULL ATLAS/ }).first();
    await expect(fullAtlas).toBeVisible();
    const fullHref = await fullAtlas.getAttribute("href");
    expect(fullHref).toContain("/atlas?");
    const embeddedUrl = new URL(src!);
    const fullUrl = new URL(fullHref!, page.url());
    for (const parameter of ["m", "l", "z", "c"]) {
      expect(embeddedUrl.searchParams.get(parameter)).toBe(fullUrl.searchParams.get(parameter));
    }

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
  await page.route("https://4planetatlas.com/**", async (route) => {
    blockedEmbedRequests += 1;
    await route.abort("blockedbyclient");
  });

  const response = await page.goto("/now", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBeTruthy();
  await expect.poll(() => blockedEmbedRequests).toBeGreaterThan(0);

  const fallback = page.getByRole("note", { name: "ATLAS embed fallback" });
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText("If the embedded map is unavailable");

  const fallbackLink = fallback.getByRole("link", { name: /OPEN THE SAME VIEW IN FULL ATLAS/ });
  await expect(fallbackLink).toBeVisible();
  const fallbackHref = await fallbackLink.getAttribute("href");
  expect(fallbackHref).toContain("/atlas?");

  const iframeSrc = await page.locator('iframe[title^="4PLANET ATLAS"]').first().getAttribute("src");
  const embeddedUrl = new URL(iframeSrc!);
  const fallbackUrl = new URL(fallbackHref!, page.url());
  for (const parameter of ["m", "l", "z", "c"]) {
    expect(embeddedUrl.searchParams.get(parameter)).toBe(fallbackUrl.searchParams.get(parameter));
  }
});
