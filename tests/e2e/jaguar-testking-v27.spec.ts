import { expect, test } from '@playwright/test';

test('TEST KING Jaguar renders local 3D, stays interactive, and completes the 8-scene journey', async ({ page }) => {
  await page.goto('/journey/jaguar/');
  const root = page.locator('#jaguar-experience');
  await expect(root).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(root).toHaveAttribute('data-jaguar3d', 'idle');

  await page.getByRole('button', { name: 'ENTER THE LIVING SYSTEM' }).click();
  await expect(root).toHaveAttribute('data-entered', 'true');
  await expect(root).toHaveAttribute('data-jaguar3d', 'ready', { timeout: 15_000 });

  const canvas = page.locator('#three-stage canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  expect(box?.width || 0).toBeGreaterThan(250);
  expect(box?.height || 0).toBeGreaterThan(250);

  await page.getByRole('button', { name: 'LOOK AT ME' }).click();
  await expect(page.locator('#creature-state')).toContainText(/shifts its attention/i);
  await page.getByRole('button', { name: 'MOVE' }).click();
  await expect(page.locator('#creature-state')).toContainText(/moves through the clearing/i);
  await page.getByRole('button', { name: 'LUME' }).click();
  await expect(root).toHaveAttribute('data-lume', 'true');

  if (box) {
    await page.mouse.move(box.x + box.width * 0.44, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.60, box.y + box.height * 0.5, { steps: 4 });
    await page.mouse.up();
  }

  const expected = [
    /One life depends on many/i,
    /The animal is not the whole story/i,
    /The landscape changes/i,
    /See the system before acting/i,
    /Response starts with the system/i,
    /Action needs accountable actors/i,
    /Proof closes the loop/i,
  ];

  for (let i = 0; i < expected.length; i += 1) {
    await page.getByRole('button', { name: /FOLLOW THE SYSTEM/ }).click();
    await expect(root).toHaveAttribute('data-scene', String(i + 1));
    await expect(page.locator('#chapter-title')).toContainText(expected[i]);
  }

  await expect(page.getByRole('button', { name: 'RETURN TO JAGUAR' })).toBeVisible();
  await page.getByRole('button', { name: 'RETURN TO JAGUAR' }).click();
  await expect(root).toHaveAttribute('data-scene', '0');
  await expect(canvas).toBeVisible();

  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 2);
});
