import { test, expect } from '@playwright/test';

test('SUPERSAPIEN live company workspace is relevant, source-first and human-first', async ({ page }) => {
  await page.goto('https://supersapien.org/', { waitUntil: 'domcontentloaded' });

  const primaryResearchTab = page.viewportSize()?.width && page.viewportSize()!.width < 900 ? 'Explore' : 'Analyse';
  await expect(page.getByRole('button', { name: primaryResearchTab, exact: true })).toBeVisible();
  await page.getByRole('button', { name: primaryResearchTab, exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Start with the company.', exact: true })).toBeVisible();
  await expect(page.getByText('Nordic Demo Co.')).toHaveCount(0);

  const norway = page.getByLabel('Company or organisation number');
  await norway.fill('DNB');
  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await expect(page.getByRole('heading', { name: /DNB BANK ASA/i }).first()).toBeVisible({ timeout: 45_000 });
  await page.getByRole('button', { name: 'Valuation', exact: true }).click();
  await expect(page.getByText('BANK VALUATION')).toBeVisible();
  await expect(page.getByText(/Do not force an industrial DCF onto a bank/i)).toBeVisible();

  await page.getByRole('button', { name: /Find another company/i }).click();
  await page.getByRole('button', { name: 'US', exact: true }).click();

  const us = page.getByLabel('Company or ticker');
  await us.fill('NVIDIA');
  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await expect(page.getByRole('heading', { name: /NVIDIA CORP/i }).first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('button', { name: 'Overview', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Financials', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Valuation', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Thesis', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sources', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Financials', exact: true }).click();
  await expect(page.getByText('Revenue', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'Sources', exact: true }).click();
  await expect(page.getByText(/Fact.*evidence.*source/i).first()).toBeVisible();

  await page.getByRole('button', { name: 'My Capital', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Know what you own.', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Review', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Know what needs attention.', exact: true })).toBeVisible();
});
