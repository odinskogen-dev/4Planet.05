import { test, expect } from '@playwright/test';

test('4NATION citizen and institutional decision paths share official-source record', async ({ page }) => {
  await page.goto('/4nation');
  await expect(page.getByRole('heading',{name:/understand your nation/i})).toBeVisible();
  await page.getByRole('button',{name:/Explore public decisions/i}).click();
  await expect(page.getByRole('heading',{name:/The proposed Oslofjord Plan/i})).toBeVisible();
  await expect(page.getByText('UNDER CONSIDERATION',{exact:false}).first()).toBeVisible();
  await expect(page.getByText('15 October 2026',{exact:false}).first()).toBeVisible();
  await page.getByRole('button',{name:'For institutions'}).click();
  await expect(page.getByText('NON-BINDING DECISION INTELLIGENCE')).toBeVisible();
  await page.getByRole('button',{name:/Nation Brain/i}).click();
  await expect(page.getByText('does not claim live conversational PLANETBRAIN',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Sources',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('link',{name:'VIEW ORIGINAL ↗'}).first()).toHaveAttribute('href',/regjeringen\.no/);
  await page.getByRole('button',{name:/Close sources/i}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport+2);
});

test('4NATION deep link retains institution and economy lens across refresh', async ({ page }) => {
  await page.goto('/4nation?view=institutions&lens=economy');
  await expect(page.getByRole('button',{name:'For institutions'})).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('heading',{name:/Public money. Clear boundaries./i})).toBeVisible();
  await page.getByRole('button',{name:/Outcomes/i}).click();
  await expect(page).toHaveURL(/lens=outcomes/);
  await page.reload();
  await expect(page.getByRole('heading',{name:/Decided is not delivered./i})).toBeVisible();
  await page.getByRole('button',{name:'Sources',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const dims = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
  expect(dims.doc).toBeLessThanOrEqual(dims.win + 2);
});


test('4NATION contextual ATLAS Embed opens the existing first-party map', async ({ page }) => {
  await page.goto('/4nation?view=people&lens=atlas');
  const embed = page.getByTestId('atlas-embed');
  await expect(embed).toBeVisible();
  await expect(embed).toContainText('Navigation extent only.');
  const iframe = embed.locator('iframe');
  await expect(iframe).toHaveAttribute('src', /\/atlas\?.*embed=nation/);
  const map = page.frameLocator('iframe[title^="Interactive ATLAS:"]');
  await expect(map.locator('.maplibregl-canvas, #atlas-fallback-title').first())
    .toBeVisible({ timeout: 30_000 });
  await expect(map.locator('.nt-shell')).toHaveCount(0);
  const full = embed.getByRole('link', { name: /Open Oslofjord.*full ATLAS/i });
  await expect(full).toHaveAttribute('href', /\/atlas\?/);
  await full.click();
  await expect(page).toHaveURL(/\/atlas\?/);
});
