import { expect, test } from '@playwright/test';

test('TEST KING Jaguar loads local 3D, stays visible on mobile, and responds', async ({ page }) => {
  await page.goto('/journey/jaguar/');
  const root = page.locator('#jaguar-experience');
  await expect(root).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);

  await page.getByRole('button', { name: 'ENTER THE LIVING SYSTEM' }).click();
  await expect(root).toHaveAttribute('data-entered', 'true');
  await expect(root).toHaveAttribute('data-jaguar3d', 'ready', { timeout: 30_000 });

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
    await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.58, box.y + box.height * 0.5, { steps: 4 });
    await page.mouse.up();
  }

  await page.getByRole('button', { name: /FOLLOW THE SYSTEM/ }).click();
  await expect(root).toHaveAttribute('data-scene', '1');
  await expect(page.locator('#chapter-title')).toContainText(/One life depends on many/i);
});
