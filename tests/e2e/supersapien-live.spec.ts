import { test, expect } from '@playwright/test';

test('SUPERSAPIEN custom domain uses live source adapters through the real browser transport', async ({ page }) => {
  const seen: string[] = [];
  page.on('request', request => {
    const url = request.url();
    if (request.method() !== 'GET' || url.includes('/api/')) seen.push(request.method() + ' ' + url);
  });
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/')) seen.push('RESPONSE ' + response.status() + ' ' + url);
  });
  page.on('requestfailed', request => seen.push('FAILED ' + request.method() + ' ' + request.url() + ' ' + (request.failure()?.errorText ?? '')));

  await page.goto('https://supersapien.org/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Analyse' })).toBeVisible();
  await page.getByRole('button', { name: 'Analyse' }).click();

  await expect(page.getByText('LIVE PRIMARY SOURCES')).toBeVisible();

  const companyInput = page.getByLabel('Company / organisation number');
  await companyInput.fill('Equinor');
  await page.getByRole('button', { name: 'Search official source' }).click();
  await expect(page.getByText('BRREG · LIVE').first()).toBeVisible({ timeout: 45_000 });
  await expect(page.getByText(/EQUINOR/i).first()).toBeVisible();

  await page.getByRole('button', { name: 'US · SEC EDGAR' }).click();
  const secInput = page.getByLabel('Ticker / company');
  await secInput.fill('MSFT');
  await page.getByRole('button', { name: 'Search official source' }).click();
  await expect(page.getByText('SEC EDGAR · LIVE')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByText('5-YEAR FILING HISTORY')).toBeVisible({ timeout: 30_000 });

  console.log('SUPERSAPIEN_NETWORK_TRACE=' + JSON.stringify(seen));
});
