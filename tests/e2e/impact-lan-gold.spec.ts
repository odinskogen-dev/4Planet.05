import { expect, test } from "@playwright/test";
import { IMPACT_FIXTURE, serveImpactFixture } from "./impact-fixture";

/**
 * IMPACT Living Action Network — Gold continuity proof.
 * The four NATUREBRAIN Gold objects must keep rendering through the Universe templates,
 * against real NATUREBRAIN (BASE_URL, e.g. test.4planet.org) or fixtures (IMPACT_FIXTURE=1).
 */
const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";
const OUTPUT = "artifacts/product-proof";

test.describe("IMPACT Living Action Network Gold", () => {
  test.beforeEach(async ({ page }) => {
    if (IMPACT_FIXTURE) await serveImpactFixture(page, "v01-only");
  });

  test("desktop discovery → project → actor keeps evidence and truth boundaries", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${BASE}/impact`);

    await expect(page.getByRole("heading", { level: 1, name: /Find people bringing life back/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Florida Keys Coral Restoration", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "African Farmers Transforming Food Systems", exact: true }).first()).toBeVisible();

    await page.getByRole("button", { name: /Reef and coastal ecosystem degradation/ }).click();
    await expect(page).toHaveURL(/issue=reef-degradation/);
    await expect(page.locator(".iu-section--index .iu-tile")).toHaveCount(2);

    await page.locator(".iu-section--index").getByRole("link", { name: "Florida Keys Coral Restoration", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Florida Keys Coral Restoration", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What the sources establish" })).toBeVisible();
    await expect(page.getByText(/15,846 corals from 17 species/i)).toBeVisible();
    await expect(page.getByText(/not project photography/i).first()).toBeVisible();
    await expect(page.getByText(/What this record does not establish/i)).toBeVisible();

    await page.screenshot({ path: `${OUTPUT}/impact-lan-desktop.png`, fullPage: false });

    await page.getByRole("link", { name: "Coral Restoration Foundation", exact: true }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Coral Restoration Foundation", exact: true })).toBeVisible();
    await expect(page.getByText(/not a 4PLANET partner/i).first()).toBeVisible();
  });

  test("mobile keeps a dense two-column project browse and opens a project", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/impact`);
    await expect(page.getByRole("heading", { level: 1, name: /Find people bringing life back/i })).toBeVisible();

    const grid = page.locator(".iu-section--index .iu-grid");
    await expect(grid).toBeVisible();
    const columns = await grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length);
    expect(columns).toBe(2);
    await expect(grid.locator(".iu-tile")).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

    await grid.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUTPUT}/impact-lan-mobile-grid.png`, fullPage: false });

    await grid.getByRole("link", { name: "African Farmers Transforming Food Systems", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "African Farmers Transforming Food Systems", exact: true })).toBeVisible();
    await expect(page.getByText(/Actions open on the organisation’s own site/i)).toBeVisible();
  });
});
