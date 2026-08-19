import { expect, test } from "@playwright/test";

const noHorizontalOverflow = async (page: Parameters<typeof test>[0] extends never ? never : any) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
};

test("homepage exposes the connected public system and premium navigation", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Everything you love is connected/i })).toBeVisible();
  await expect(page.getByText("BEST OF 4PLANET", { exact: true })).toBeAttached();
  await expect(page.getByRole("link", { name: /Jaguar/i }).first()).toBeAttached();
  await expect(page.getByRole("link", { name: /Orca/i }).first()).toBeAttached();
  await expect(page.getByText("Homo sapiens", { exact: true })).toBeAttached();

  const menu = page.getByRole("button", { name: "Open menu" });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(page.getByText("4PLANET_ / NAVIGATION", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "M4GAZINE" }).first()).toBeAttached();
  await expect(page.getByRole("link", { name: "THE FOUNDER" }).first()).toBeAttached();
  await noHorizontalOverflow(page);
});

test("M4GAZINE is an editorial front with readable article routes", async ({ page }) => {
  await page.goto("/magazine", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "M4GAZINE_" })).toBeVisible();
  await expect(page.getByText("COVER STORY", { exact: true })).toBeVisible();
  await expect(page.getByText("LATEST", { exact: true })).toBeAttached();
  const story = page.locator('a[href="/magazine/why-4planet-exists"]').first();
  await expect(story).toBeAttached();
  await story.click();
  await expect(page.getByRole("heading", { name: /Why 4Planet exists/i })).toBeVisible();
  await expect(page.getByText("CONTINUE THROUGH THE SYSTEM", { exact: true })).toBeAttached();
  await noHorizontalOverflow(page);
});

test("Founder page has a dedicated narrative and controlled portrait", async ({ page }) => {
  await page.goto("/about/founder", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Everything I love is alive." })).toBeVisible();
  await expect(page.getByRole("img", { name: /Odin Oddekalv/i })).toBeVisible();
  await expect(page.getByText("ALT JEG ELSKER LEVER", { exact: true })).toBeAttached();
  await noHorizontalOverflow(page);
});

test("AM4ZONIA exposes Jaguar, Amazon ecosystem and Atlas as one journey", async ({ page }) => {
  await page.goto("/missions/am4zonia", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /AM4ZONIA/i }).first()).toBeVisible();
  await expect(page.getByText("JAGUAR GOLD STANDARD", { exact: true })).toBeAttached();
  await expect(page.getByText("AMAZON RAINFOREST", { exact: true }).first()).toBeAttached();
  await expect(page.getByText("AMAZONIA IN ATLAS", { exact: true })).toBeAttached();
  await expect(page.getByText("PROVENANCE", { exact: true })).toBeAttached();
  await noHorizontalOverflow(page);
});
