import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const SURFACES = [
  { key: "home", route: "/", heading: /One connected living planet/i },
  { key: "jaguar", route: "/species/jaguar", heading: /^JAGUAR$/i },
  { key: "s4piens", route: "/s4piens", heading: /What does a human need/i },
  { key: "biscay", route: "/ecosystems/bay-of-biscay", heading: /BAY OF BISCAY/i },
  { key: "amazonia", route: "/ecosystems/amazon-rainforest", heading: /AMAZON RAINFOREST/i },
  { key: "about-story", route: "/about/story", heading: /living planet is not an abstract issue/i },
  { key: "about-system", route: "/about/system", heading: /One planet\. One shared truth architecture/i },
  { key: "about-founder", route: "/about/founder", heading: /Everything I love is alive/i },
  { key: "magazine", route: "/magazine", heading: /M4GAZINE/i },
] as const;

async function evidenceDir(projectName: string) {
  const dir = path.join("artifacts", "one-interface-09-gold", projectName);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

test.describe("ONE INTERFACE 09 Gold public convergence", () => {
  for (const surface of SURFACES) {
    test(`${surface.key} renders without horizontal overflow`, async ({ page }, testInfo) => {
      await page.goto(surface.route, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: surface.heading }).first()).toBeVisible();
      const viewportWidth = page.viewportSize()?.width ?? 0;
      const width = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
      expect(width).toBeLessThanOrEqual(viewportWidth + 2);
      const dir = await evidenceDir(testInfo.project.name);
      await page.screenshot({ path: path.join(dir, `${surface.key}.png`), fullPage: false });
    });
  }

  test("homepage restores WHY + shared Atlas + flagship story architecture", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const why = page.locator("#why-4planet");
    await why.scrollIntoViewIfNeeded();
    await expect(why.getByText("WHY 4PLANET_", { exact: true })).toBeVisible();
    await expect(why.getByRole("heading", { name: /healthy living planet is infrastructure for human life/i })).toBeVisible();
    await expect(page.getByText("ONE PLANET · FOUR PUBLIC LENSES", { exact: true })).toBeAttached();
    await expect(page.getByText("ATLAS_ · WHY THIS MATTERS", { exact: true })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Jaguar", exact: true })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Orca", exact: true })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Homo sapiens", exact: true })).toBeAttached();
    const dir = await evidenceDir(testInfo.project.name);
    await why.screenshot({ path: path.join(dir, "home-why.png") });
  });

  test("Jaguar keeps occurrence semantics separate from curated ecosystem context", async ({ page }) => {
    await page.goto("/species/jaguar", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Points are observations — not range, population, abundance or live tracking/i)).toBeAttached();
    await expect(page.getByRole("link", { name: /ENTER AMAZONIA/i }).first()).toHaveAttribute("href", "/ecosystems/amazon-rainforest");
    await expect(page.getByText(/3D creature runtime/i)).toHaveCount(0);
  });

  test("S4PIENS FOOD is interactive and does not claim interface biomimicry as evidence", async ({ page }) => {
    await page.goto("/s4piens", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/BIOLOGICAL INTERACTION = INTERFACE GRAMMAR/i)).toBeVisible();
    const food = page.getByRole("button", { name: /FOOD_/i });
    await expect(food).toHaveAttribute("aria-pressed", "false");
    await food.click();
    await expect(food).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: /Food is not one industry/i })).toBeVisible();
  });
});
