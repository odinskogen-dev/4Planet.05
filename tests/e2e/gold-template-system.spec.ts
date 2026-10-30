import { test, expect } from "@playwright/test";

const surfaces = [
  { path: "/sandbox/gold/species/blue-whale", heading: "Blue whale", marker: "SPECIES GOLD" },
  { path: "/sandbox/gold/place/oslofjord", heading: "Oslofjord", marker: "PLACE GOLD" },
  { path: "/sandbox/gold/living-system/oslofjord-living-system", heading: "Oslofjord coastal living system", marker: "LIVING SYSTEM GOLD" },
  { path: "/sandbox/gold/actor/orca", heading: "ORCA", marker: "ACTOR GOLD" },
  { path: "/sandbox/gold/solution/eelgrass-restoration", heading: "Eelgrass restoration", marker: "SOLUTION GOLD" },
  { path: "/sandbox/gold/signal/oslofjord-plan-2026", heading: "Oslofjord plan 2026–2030 enters consultation", marker: "SIGNAL GOLD" },
  { path: "/sandbox/gold/proof/eelgrass-proof-record", heading: "Eelgrass restoration — proof record", marker: "PROOF GOLD" },
  { path: "/sandbox/gold/magazine/news-august-2026", heading: "August just became the hottest August ever recorded", marker: "NEWS" },
  { path: "/sandbox/gold/magazine/explainer-1-5c", heading: "The planet crossed 1.5°C again", marker: "EXPLAINER" },
  { path: "/sandbox/gold/magazine/feature-blue-whale", heading: "The largest animal ever known is built on a world of krill", marker: "FEATURE" },
  { path: "/sandbox/gold/magazine/visual-blue-whale", heading: "A blue whale, in six numbers", marker: "VISUAL STORY" },
] as const;

test("@identity-preflight exact controlled sandbox is the expected HEIR before the full matrix", async ({ page }) => {
  const exactSha = process.env.EXACT_SHA;
  expect(exactSha, "workflow must pin the exact candidate SHA").toMatch(/^[0-9a-f]{40}$/);

  const response = await page.goto("/sandbox/gold", { waitUntil: "domcontentloaded" });
  expect(response?.status(), "sandbox identity preflight requires HTTP 200").toBe(200);

  const headers = response?.headers() ?? {};
  expect(headers["x-4planet-control-plane"]).toBe("four-state-v1");
  expect(headers["x-4planet-review-source"]).toBe(`heir-${exactSha!.slice(0, 12)}`);

  const controlled = page.locator("p.gold2-kicker").filter({ hasText: "CONTROLLED TEST" }).first();
  await expect(controlled).toHaveText("TEST.4PLANET.ORG / CONTROLLED TEST / NO LIVE RELEASE / SANDBOX");
  await expect(page.getByRole("note").filter({ hasText: "FOUNDER REVIEW" }).first()).toContainText("NO LIVE RELEASE");

  const controlledNode = await controlled.elementHandle();
  expect(controlledNode, "controlled sentinel must resolve to a stable node").not.toBeNull();
  const originalText = await controlledNode!.textContent();
  try {
    await controlledNode!.evaluate((node) => {
      node.textContent = "TEST.4PLANET.ORG / WRONG SURFACE / NO LIVE RELEASE / SANDBOX";
    });
    await expect(page.locator("p.gold2-kicker").filter({ hasText: "CONTROLLED TEST" })).toHaveCount(0);
    await expect(page.locator("p.gold2-kicker").filter({ hasText: "WRONG SURFACE" }).first())
      .toHaveText("TEST.4PLANET.ORG / WRONG SURFACE / NO LIVE RELEASE / SANDBOX");
  } finally {
    await controlledNode!.evaluate((node, text) => {
      node.textContent = text;
    }, originalText);
  }
  await expect(page.locator("p.gold2-kicker").filter({ hasText: "CONTROLLED TEST" }).first())
    .toHaveText("TEST.4PLANET.ORG / CONTROLLED TEST / NO LIVE RELEASE / SANDBOX");
});

for (const surface of surfaces) {
  test(`${surface.marker} renders as controlled sandbox Gold surface`, async ({ page }, testInfo) => {
    const fatal: string[] = [];
    page.on("pageerror", (error) => fatal.push(`pageerror:${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("Failed to load resource")) fatal.push(`console:${message.text()}`);
    });

    const response = await page.goto(surface.path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), `${surface.path} must return HTTP 200`).toBe(200);
    await expect.poll(() => new URL(page.url()).pathname, {
      message: `${surface.path} must retain its controlled sandbox identity`,
    }).toBe(surface.path);

    const reviewNote = page.getByRole("note").first();
    await expect(reviewNote).toContainText("TEST");
    await expect(reviewNote).toContainText(surface.marker);
    await expect(reviewNote).toContainText("NO LIVE RELEASE");
    await expect(page.locator("h1").first()).toContainText(surface.heading);
    await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("undefined");
    expect(bodyText).not.toContain("null null");
    expect(bodyText).not.toMatch(/\bNaN\b/);

    const safeName = surface.path.split("/").filter(Boolean).slice(-1)[0];
    const screenshotPrefix = `artifacts/product-proof/gold-${safeName}-${testInfo.project.name}`;
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const maxFullPageScreenshotHeight = 32_000;
    if (pageHeight <= maxFullPageScreenshotHeight) {
      await page.screenshot({ path: `${screenshotPrefix}.png`, fullPage: true });
    } else {
      await page.screenshot({ path: `${screenshotPrefix}-top.png` });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.screenshot({ path: `${screenshotPrefix}-bottom.png` });
    }
    expect(fatal, fatal.join("\n")).toEqual([]);
  });
}

test("DEVELOPMENT Actor Gold stays absent from public route and metadata", async ({ page }) => {
  await page.goto("/actors/orca", { waitUntil: "domcontentloaded" });
  await expect.poll(() => new URL(page.url()).pathname).toBe("/actors");
  await expect(page.getByRole("heading", { name: "ORCA", exact: true })).toHaveCount(0);
  const structuredData = await page.locator("script[type='application/ld+json']").allTextContents();
  expect(structuredData.join("\n")).not.toContain("P17-A036");
  expect(structuredData.join("\n")).not.toContain('"name":"ORCA"');
});

test("Founder Review index exposes every object and Magazine review path", async ({ page }) => {
  const response = await page.goto("/sandbox/gold", { waitUntil: "domcontentloaded" });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("note").filter({ hasText: "FOUNDER REVIEW" }).first()).toContainText("NO LIVE RELEASE");
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
  for (const surface of surfaces) await expect(page.locator(`a[href='${surface.path}']`)).toHaveCount(1);
});
