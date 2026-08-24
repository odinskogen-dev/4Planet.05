import { test, expect } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const metrics = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(metrics.scrollWidth, `horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`).toBeLessThanOrEqual(metrics.clientWidth + 2);
}

test.describe("4PLANET MAGAZINE — world-class reader surface", () => {
  test("home is a dedicated edited publication with live depth", async ({ page }) => {
    await page.goto("/magazine");
    await expect(page.getByRole("link", { name: "4PLANET Magazine home" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The world is alive. So is the story." })).toBeVisible();
    await expect(page.getByText("PLANET SIGNAL / FAST, SOURCE-BOUNDED")).toBeVisible();
    await expect(page.getByText("RECURRING EDITORIAL")).toBeVisible();
    await expect(page.getByRole("link", { name: "SEARCH" })).toBeVisible();
    await expect(page.getByRole("link", { name: "SAVED" })).toBeVisible();
    await expect(page.locator(".mag-world-masthead-word")).toHaveCount(2);
    await expect(page.locator(".mag-world-footer")).toBeVisible();
    await expect(page.locator(".public-shell")).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("light/dark mode is persistent and accessible", async ({ page }) => {
    await page.goto("/magazine");
    const toggle = page.locator(".mag-theme-toggle");
    await expect(toggle).toBeVisible();
    const before = await page.locator(".mag-world").getAttribute("data-mag-theme");
    await toggle.click();
    const after = await page.locator(".mag-world").getAttribute("data-mag-theme");
    expect(after).not.toBe(before);
    await page.reload();
    await expect(page.locator(".mag-world")).toHaveAttribute("data-mag-theme", after || "dark");
  });

  test("topic, lane and canonical hub routes behave as useful feeds", async ({ page }) => {
    await page.goto("/magazine?topic=INNOVATION");
    await expect(page.getByRole("heading", { name: "Innovation" })).toBeVisible();
    await expect(page.locator(".mag-story-tile").first()).toBeVisible();
    await page.goto("/magazine?lane=PEOPLE");
    await expect(page.getByRole("heading", { name: "PEOPLE" })).toBeVisible();
    await expect(page.locator(".mag-story-tile").first()).toBeVisible();
    await page.goto("/magazine/topics/innovation");
    await expect(page.getByRole("heading", { name: "Innovation" })).toBeVisible();
    await page.goto("/magazine/series/from-the-field");
    await expect(page.getByRole("heading", { name: "FROM THE FIELD" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("search finds a real story and archive carries Planet Signals", async ({ page }) => {
    await page.goto("/magazine/search?q=orca");
    await expect(page.getByRole("heading", { name: "Find the thread." })).toBeVisible();
    await expect(page.getByText(/story.*matching/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /ocean watch/i }).first()).toBeVisible();
    await page.goto("/magazine/archive");
    await expect(page.getByRole("heading", { name: "Everything worth keeping." })).toBeVisible();
    await expect(page.getByText(/bounded signals/i)).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("save and resume stay local without account friction", async ({ page }) => {
    await page.goto("/magazine/air-filter-biodiversity-time-machine");
    const save = page.getByRole("button", { name: "SAVE +" }).first();
    await expect(save).toBeVisible();
    await save.click();
    await expect(page.getByRole("button", { name: "SAVED ✓" }).first()).toBeVisible();
    await page.goto("/magazine/saved");
    await expect(page.getByRole("heading", { name: "Keep what mattered." })).toBeVisible();
    await expect(page.getByRole("link", { name: /air filter that became/i }).first()).toBeVisible();
  });

  test("four premium modes have distinct but coherent reader grammar", async ({ page }) => {
    const proofs = [
      ["/magazine/why-4planet-exists", "mag-experience--article"],
      ["/magazine/amazonia-more-than-a-forest", "mag-experience--visual-essay"],
      ["/magazine/air-filter-biodiversity-time-machine", "mag-experience--intelligence-story"],
      ["/magazine/five-am-bay-of-biscay", "mag-experience--journey-feature"],
    ] as const;
    for (const [route, cls] of proofs) {
      await page.goto(route);
      await expect(page.locator(`.${cls}`)).toBeVisible();
      await expect(page.locator(".mag-story-facts")).toBeVisible();
      await expect(page.getByText("HOW WE KNOW")).toBeVisible();
      await expect(page.locator(".mag-world-footer")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("Planet Signal exposes source, why and anti-overclaim boundary", async ({ page }) => {
    await page.goto("/magazine/signals/automated-edna-erna-water-monitoring");
    await expect(page.getByText("PLANET SIGNAL").first()).toBeVisible();
    await expect(page.getByText("WHY IT MATTERS")).toBeVisible();
    await expect(page.getByText("DO NOT OVER-READ THIS")).toBeVisible();
    const source = page.getByRole("link", { name: /OPEN SOURCE/ });
    await expect(source).toHaveAttribute("href", /^https:\/\//);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("4PLANET MAGAZINE — reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("journey mode keeps information when motion is reduced", async ({ page }) => {
    await page.goto("/magazine/five-am-bay-of-biscay");
    await expect(page.locator(".mag-journey-gateway")).toBeVisible();
    await expect(page.getByText("HOW WE KNOW")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
