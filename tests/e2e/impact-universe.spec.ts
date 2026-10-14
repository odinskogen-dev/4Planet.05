import { expect, test } from "@playwright/test";
import { IMPACT_FIXTURE, serveImpactFixture } from "./impact-fixture";

/**
 * IMPACT UNIVERSE 01 — template system proof (fixture mode only).
 * PRIMARY SUCCESS TEST: a new source-grounded NATUREBRAIN project (the labelled AXE test
 * seed in tests/naturebrain/fixture-axe-new-project-seed.sql, projected by the real v02
 * SQL) appears as a complete page — home index, project, actor, issue, search — with no
 * code or design change.
 */
const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";
const OUTPUT = "artifacts/product-proof";

test.describe("IMPACT Universe templates", () => {
  test.skip(!IMPACT_FIXTURE, "fixture-only proof; set IMPACT_FIXTURE=1");

  test("a new NATUREBRAIN project appears everywhere without redesign", async ({ page }) => {
    await serveImpactFixture(page, "v02-with-axe-seed");
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${BASE}/impact`);
    const index = page.locator(".iu-section--index");
    await expect(index.locator(".iu-tile")).toHaveCount(5);
    await expect(index.getByRole("link", { name: "Test Fixture Wetland Recovery", exact: true })).toBeVisible();

    await index.getByRole("link", { name: "Test Fixture Wetland Recovery", exact: true }).click();
    await expect(page).toHaveURL(/\/impact\/project\/test-fixture-wetland-recovery$/);
    await expect(page.getByRole("heading", { level: 1, name: "Test Fixture Wetland Recovery" })).toBeVisible();
    await expect(page.getByText("Stated ambition — not delivery")).toBeVisible();
    await expect(page.getByText("120 ha", { exact: true })).toBeVisible();
    await expect(page.getByText("Delivery organisation · Research institution")).toBeVisible();
    const jsonLd = await page.locator('script[id="4planet-page-jsonld"]').textContent();
    expect(jsonLd).toContain("Test Fixture Wetland Recovery");
    await page.screenshot({ path: `${OUTPUT}/impact-universe-new-project-desktop.png`, fullPage: false });

    await page.getByRole("link", { name: "Test Fixture Wetland Trust", exact: true }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Test Fixture Wetland Trust" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Official website/ })).toHaveAttribute("href", "https://example.org/fixture-trust");

    await page.goto(`${BASE}/impact/issue/test-fixture-wetland-loss`);
    await expect(page.getByRole("heading", { level: 1, name: "Test Fixture — Wetland loss" })).toBeVisible();
    await expect(page.getByText("Fixture unknown: regional loss rates are not published in this record.")).toBeVisible();

    await page.goto(`${BASE}/impact?q=wetland`);
    await expect(page.getByRole("heading", { name: /results? for “wetland”/ })).toBeVisible();
    await expect(page.locator(".iu-section--index").getByRole("link", { name: "Test Fixture Wetland Recovery", exact: true })).toBeVisible();
  });

  test("v02 missing → v01 fallback keeps the four Gold objects", async ({ page }) => {
    await serveImpactFixture(page, "v01-only");
    await page.goto(`${BASE}/impact`);
    await expect(page.locator(".iu-section--index .iu-tile")).toHaveCount(4);
    await expect(page.getByText(/impact_lan_gold_v01\(\)/)).toBeVisible();
  });

  test("unavailable source is not shown as zero; unknown slug is not a redirect", async ({ page }) => {
    await serveImpactFixture(page, "unavailable");
    await page.goto(`${BASE}/impact`);
    await expect(page.getByRole("heading", { name: /temporarily unavailable/ })).toBeVisible();
    await expect(page.getByText(/Unavailable is not the same as zero/)).toBeVisible();

    await page.unrouteAll({ behavior: "ignoreErrors" });
    await serveImpactFixture(page, "v01-only");
    await page.goto(`${BASE}/impact/project/not-a-published-project`);
    await expect(page.getByRole("heading", { name: /not in the published IMPACT graph/ })).toBeVisible();
    await expect(page).toHaveURL(/not-a-published-project/);
  });

  test("search finds organisations, issues and places; no match is honest", async ({ page }) => {
    await serveImpactFixture(page, "v01-only");
    await page.goto(`${BASE}/impact`);
    await page.getByLabel(/Search projects, organisations/).fill("ocean cleanup");
    await expect(page).toHaveURL(/q=ocean/);
    await expect(page.locator(".iu-section--index").getByRole("link", { name: "Great Pacific Garbage Patch Cleanup", exact: true })).toBeVisible();
    await expect(page.locator(".iu-section--index").getByRole("link", { name: /The Ocean Cleanup/ })).toBeVisible();

    await page.goto(`${BASE}/impact?q=zzqx`);
    await expect(page.getByText(/No match is not evidence that no such work exists/)).toBeVisible();
  });

  for (const [width, height] of [[390, 844], [430, 932], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]] as const) {
    test(`responsive ${width}px: no horizontal overflow, one h1, readable grid`, async ({ page }) => {
      await serveImpactFixture(page, "v02-with-axe-seed");
      await page.setViewportSize({ width, height });
      for (const route of ["/impact", "/impact/project/florida-coral-restoration", "/impact/actors/the-ocean-cleanup", "/impact/issue/reef-degradation", "/impact/solution/forest-garden-agroforestry"]) {
        await page.goto(`${BASE}${route}`);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), `${route} overflow`).toBeLessThanOrEqual(0);
        if (route === "/impact") {
          const columns = await page.locator(".iu-section--index .iu-grid").evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length);
          expect(columns).toBe(width <= 700 ? 2 : width <= 1100 ? 3 : width >= 1680 ? 5 : 4);
          const titleSize = await page.locator(".iu-tile h3").first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
          expect(titleSize).toBeGreaterThanOrEqual(16);
        }
        const slug = route.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "impact";
        await page.screenshot({ path: `${OUTPUT}/impact-universe-${width}-${slug}.png`, fullPage: true });
      }
    });
  }

  test("keyboard: skip link, visible focus, reachable primary actions", async ({ page }) => {
    await serveImpactFixture(page, "v01-only");
    await page.goto(`${BASE}/impact/project/florida-coral-restoration`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "SKIP TO CONTENT" })).toBeFocused();
    const save = page.getByRole("button", { name: /Save/ }).first();
    await save.focus();
    await expect(save).toBeFocused();
    await save.press("Enter");
    await expect(save).toHaveAttribute("aria-pressed", "true");
    const outline = await save.evaluate((node) => getComputedStyle(node).outlineStyle);
    expect(outline).not.toBe("none");
  });
});
