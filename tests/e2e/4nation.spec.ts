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
  await page.getByRole('navigation',{name:'Explore decision layers'}).getByRole('button',{name:/Outcomes/i}).click();
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
  // On failure expose the actual box/visibility; do not relax the acceptance assertion.
  console.log('ATLAS_EMBED_LAYOUT', await embed.evaluate((node) => {
    const css = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    const parent = node.parentElement ? getComputedStyle(node.parentElement) : null;
    return { display: css.display, visibility: css.visibility, contain: css.contain,
      height: rect.height, width: rect.width, parentDisplay: parent?.display,
      parentVisibility: parent?.visibility };
  }));
  await expect(embed).toBeVisible();
  await expect(embed).toContainText('Navigation extent only.');
  const iframe = embed.locator('iframe');
  await expect(iframe).toHaveAttribute('src', /\/atlas\?.*embed=nation/);
  // This is intentionally lazy below the first viewport. A real person scrolls
  // to the map; programmatic DOM assertions alone do not trigger iframe loading.
  await iframe.scrollIntoViewIfNeeded();
  const map = page.frameLocator('iframe[title^="Interactive ATLAS:"]');
  await expect(map.locator('.maplibregl-canvas, #atlas-fallback-title').first())
    .toBeVisible({ timeout: 30_000 });
  await expect(map.locator('.nt-shell')).toHaveCount(0);
  const full = embed.getByRole('link', { name: /Open Oslofjord.*full ATLAS/i });
  await expect(full).toHaveAttribute('href', /\/atlas\?/);
  const intendedHref = new URL((await full.getAttribute('href'))!, page.url());
  const expected = intendedHref.searchParams;
  const wasProductionNation = new URL(page.url()).hostname === '4nation.org';
  await full.click();
  if (wasProductionNation) {
    await expect(page).toHaveURL(url => url.origin === 'https://4planetatlas.com', { timeout: 20_000 });
  } else {
    await expect(page).toHaveURL(url => url.pathname === '/atlas', { timeout: 20_000 });
  }
  await expect(page.locator('.maplibregl-canvas').first()).toBeVisible({ timeout: 30_000 });
  // We must prove the real map has finished loading, not a fallback or momentary query.
  await page.waitForFunction(() => Boolean((window as any).__4planet_map?.isStyleLoaded?.()), undefined, { timeout: 25_000 });
  const settled = await page.evaluate(async () => {
    const map = (window as any).__4planet_map;
    await new Promise<void>((resolve) => {
      if (!map.isMoving()) { resolve(); return; }
      map.once('moveend', () => resolve());
    });
    // Observe after the delayed place/entity focus too, not at the transient first URL.
    await new Promise<void>(resolve => setTimeout(resolve, 2100));
    return { zoom: map.getZoom(), lng: map.getCenter().lng, lat: map.getCenter().lat };
  });
  const coords = (expected.get('c') || '').split(',').map(Number);
  const zoom = Number(expected.get('z'));
  expect(Number.isFinite(zoom) && coords.length === 2 && coords.every(Number.isFinite)).toBe(true);
  expect(Math.abs(settled.zoom - zoom)).toBeLessThan(0.01);
  expect(Math.abs(settled.lng - coords[0])).toBeLessThan(0.0001);
  expect(Math.abs(settled.lat - coords[1])).toBeLessThan(0.0001);
  const finalQuery = new URL(page.url()).searchParams;
  expect(finalQuery.get('entity')).toBe(expected.get('entity'));
  expect(finalQuery.get('l')).toBe(expected.get('l'));
  expect(Math.abs(Number(finalQuery.get('z')) - zoom)).toBeLessThan(0.01);
  const finalCoords = (finalQuery.get('c') || '').split(',').map(Number);
  expect(finalCoords.length).toBe(2);
  expect(Math.abs(finalCoords[0] - coords[0])).toBeLessThan(0.0001);
  expect(Math.abs(finalCoords[1] - coords[1])).toBeLessThan(0.0001);
});

test('SPECIES Orca shows the shared contextual ATLAS without inventing live positions', async ({ page }) => {
  test.skip(new URL(process.env.BASE_URL || 'http://127.0.0.1:4173').hostname === '4nation.org',
    '4NATION standalone host does not own the SPECIES route; use the first-party shared preview');
  await page.goto('/species/orca');
  const embed = page.getByTestId('atlas-embed');
  await expect(embed).toBeVisible();
  await expect(embed).toContainText('Historical occurrence records are not live animal positions');
  const iframe = embed.locator('iframe');
  await expect(iframe).toHaveAttribute('src', /\/atlas\?.*embed=species/);
  const inside = new URL((await iframe.getAttribute('src'))!, page.url());
  const full = embed.getByRole('link', { name: /full ATLAS/i });
  const fullTarget = new URL((await full.getAttribute('href'))!, page.url());
  expect(inside.searchParams.get('entity')).toBe(fullTarget.searchParams.get('entity'));
  expect(inside.searchParams.get('l')).toBe(fullTarget.searchParams.get('l'));
  await iframe.scrollIntoViewIfNeeded();
  const map = page.frameLocator('iframe[title^="Interactive ATLAS:"]');
  await expect(map.locator('.maplibregl-canvas').first()).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => map.locator('body').evaluate(
    () => Boolean((window as any).__4planet_map?.isStyleLoaded?.())),
    {timeout: 25_000}).toBe(true);
  await full.click();
  await expect(page).toHaveURL(url => url.pathname === '/atlas' &&
    url.searchParams.get('entity') === fullTarget.searchParams.get('entity'),
    { timeout: 20_000 });
});
