import { test, expect } from '@playwright/test';

test('4NATION citizen and institutional decision paths share official-source record', async ({ page }) => {
  await page.goto('/4nation');
  await expect(page.getByRole('heading',{name:/understand your nation/i})).toBeVisible();
  await page.getByRole('button',{name:/Explore public decisions/i}).click();
  await expect(page.getByRole('heading',{name:/The proposed Oslofjord Plan/i})).toBeVisible();
  await expect(page.getByText('UNDER CONSIDERATION',{exact:false}).first()).toBeVisible();
  await expect(page.getByText('15 October 2026',{exact:false}).first()).toBeVisible();
  await page.getByRole('button',{name:/Explore decision intelligence/i}).first().click({force:true}).catch(async()=>{await page.getByRole('button',{name:'For institutions'}).click()});
  await page.getByRole('button',{name:'For institutions'}).click();
  await expect(page.getByText('NON-BINDING DECISION INTELLIGENCE')).toBeVisible();
  await page.getByRole('button',{name:/Nation Brain/i}).click();
  await expect(page.getByText('does not claim live conversational PLANETBRAIN',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Sources'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('link',{name:'VIEW ORIGINAL ↗'}).first()).toHaveAttribute('href',/regjeringen\.no/);
  await page.getByRole('button',{name:/Close sources/i}).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.viewport+2);
});
