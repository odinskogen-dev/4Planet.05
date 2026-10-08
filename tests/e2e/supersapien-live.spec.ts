import { test, expect } from '@playwright/test';

test('SUPERSAPIEN live search is relevant, one-step and human-first', async ({ page }) => {
  await page.goto('https://supersapien.org/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Analyse', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Find a company', exact: true })).toBeVisible();
  await expect(page.getByText('Nordic Demo Co.')).toHaveCount(0);

  const norway = page.getByLabel('Company or organisation number');
  await norway.fill('DNB');
  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await expect(page.getByText(/DNB BANK ASA/i).first()).toBeVisible({ timeout: 45_000 });
  const primaryCard = page.locator('.best-match').first();
  if (await primaryCard.count()) {
    await expect(primaryCard).toContainText(/DNB BANK ASA/i);
    await expect(primaryCard).not.toContainText(/LARVIK INTERESSEKLUBB/i);
  }

  await page.getByRole('button', { name: 'US', exact: true }).click();
  const us = page.getByLabel('Company or ticker');
  await us.fill('NVIDIA');
  await page.getByRole('button', { name: 'Search', exact: true }).click();

  await expect(page.getByText(/NVIDIA CORP/i).first()).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText(/SEC filing/i).first()).toBeVisible();
  await expect(page.getByText(/Revenue/i).first()).toBeVisible();
  await expect(page.getByText('5-year financial history')).toBeVisible();
  await expect(page.getByRole('button', { name: /Load filing history/i })).toHaveCount(0);
  await expect(page.getByText('COMPANY OVERVIEW')).toBeVisible();
});
