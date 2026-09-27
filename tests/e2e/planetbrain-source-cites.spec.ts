import { expect, test } from "@playwright/test";

async function openDeepIntelligence(page: import("@playwright/test").Page) {
  const panel = page.getByTestId("ls-deep-intelligence");
  await expect(panel).toBeVisible();
  await panel.locator("summary").click();
  await expect(panel.getByText("SOURCE / TRUST RECOVERY BOUNDARY")).toBeVisible();
  return panel;
}

test("PLANETBRAIN pollination cites open the recorded IPBES source", async ({ page }) => {
  await page.goto("/living-systems/pollination");
  const panel = await openDeepIntelligence(page);
  const ipbes = panel.locator('[data-testid="ls-source-cite"][data-source-id="IPBES"][data-established="true"]').first();
  await expect(ipbes).toBeVisible();
  await expect(ipbes).toHaveAttribute("href", "https://www.ipbes.net");
  await expect(ipbes).toHaveAttribute("rel", /noopener/);
  const register = panel.locator('[data-testid="ls-source-register"][data-source-id="IPBES"]');
  await expect(register).toHaveAttribute("data-established", "true");
  await expect(register.getByRole("link")).toHaveAttribute("href", "https://www.ipbes.net");
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport + 2);
});

test("PLANETBRAIN amazonia sources stay unlinked when no original URL is recorded", async ({ page }) => {
  await page.goto("/living-systems/amazonia");
  const panel = await openDeepIntelligence(page);
  const unresolved = panel.locator('[data-testid="ls-source-cite"][data-established="false"]');
  await expect(unresolved.first()).toBeVisible();
  await expect(unresolved.first()).toContainText("ORIGINAL URL NOT ESTABLISHED");
  const count = await unresolved.count();
  for (let i = 0; i < count; i += 1) {
    await expect(unresolved.nth(i)).not.toHaveAttribute("href", /.+/);
  }
  const registers = panel.locator('[data-testid="ls-source-register"]');
  const registerCount = await registers.count();
  expect(registerCount).toBeGreaterThan(0);
  for (let i = 0; i < registerCount; i += 1) {
    await expect(registers.nth(i)).toHaveAttribute("data-established", "false");
    await expect(registers.nth(i)).toContainText("ORIGINAL URL NOT ESTABLISHED");
    await expect(registers.nth(i).locator("a")).toHaveCount(0);
  }
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport + 2);
});
