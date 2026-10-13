import { expect, test } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:4173";
const OUTPUT = "artifacts/product-proof";

test.describe("IMPACT Living Action Network Gold", () => {
  test("desktop discovery → project → actor keeps evidence and truth boundaries", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${BASE}/impact`);

    await expect(page.getByRole("heading", { name: /Find people bringing life back/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Florida Keys Coral Restoration", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "African Farmers Transforming Food Systems", exact: true })).toBeVisible();

    await page.getByRole("button", { name: /CORAL_/ }).first().click();
    await expect(page).toHaveURL(/issue=coral/);
    await expect(page.locator(".ilan-project")).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Florida Keys Coral Restoration", exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Florida Keys Coral Restoration", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Florida Keys Coral Restoration", exact: true })).toBeVisible();
    await expect(page.getByText("WHAT THE SOURCES ESTABLISH_", { exact: true })).toBeVisible();
    await expect(page.getByText(/15,846 corals from 17 species/i)).toBeVisible();
    await expect(page.getByText(/ISSUE-FAMILY VISUAL · NOT PROJECT EVIDENCE/i)).toBeVisible();

    await page.getByRole("link", { name: /Coral Restoration Foundation/i }).first().click();
    await expect(page.getByRole("heading", { name: "Coral Restoration Foundation", exact: true })).toBeVisible();
    await expect(page.getByText(/does not mean 4PLANET partnership/i)).toBeVisible();

    await page.screenshot({ path: `${OUTPUT}/impact-lan-desktop.png`, fullPage: false });
  });

  test("mobile keeps a dense two-column project browse and opens a project", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/impact`);
    await expect(page.getByRole("heading", { name: /Find people bringing life back/i })).toBeVisible();

    const grid = page.locator(".ilan-project-grid");
    await expect(grid).toBeVisible();
    const columns = await grid.evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length);
    expect(columns).toBe(2);

    const cards = grid.locator(".ilan-project");
    await expect(cards).toHaveCount(4);
    await cards.nth(0).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUTPUT}/impact-lan-mobile-grid.png`, fullPage: false });

    await page.getByRole("link", { name: "African Farmers Transforming Food Systems", exact: true }).click();
    await expect(page.getByRole("heading", { name: "African Farmers Transforming Food Systems", exact: true })).toBeVisible();
    await expect(page.getByText(/External actions happen on the organisation’s own site/i)).toBeVisible();
  });
});
