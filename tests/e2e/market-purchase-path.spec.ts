import { expect, test } from "@playwright/test";

test("MARKET exposes a direct attributed path to the live first product", async ({ page }) => {
  await page.goto("/market");
  await expect(page.getByRole("heading", { name: "Made by people who care." })).toBeVisible();

  const buy = page.getByRole("link", { name: /BUY SUMMIT AT SUNSET/i });
  await expect(buy).toBeVisible();
  await expect(buy).toHaveAttribute("href", /odin-oddekalv-photography-shop\.fourthwall\.com\/products\/summit-at-sunset-fine-art-print/);
  await expect(buy).toHaveAttribute("href", /utm_source=4planetmarket/);
  await expect(buy).toHaveAttribute("href", /utm_content=hero_summit-at-sunset-fine-art-print/);
  await expect(buy).toHaveAttribute("rel", /noopener/);
  await expect(page.getByText(/SECURE CHECKOUT \+ FULFILMENT ON FOURTHWALL/i)).toBeVisible();

  const overflow = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 2);
});
