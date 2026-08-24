import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('TEST KING Jaguar loads verified Ear full-source 3D, preserves fallback, exposes LUME room, and completes 8 scenes', async ({ page }, testInfo) => {
  await page.goto('/journey/jaguar/');
  const root=page.locator('#jaguar-experience');
  await expect(root).toBeVisible();
  await expect(root).toHaveAttribute('data-jaguar-ear-full','loading',{timeout:5000});

  // The controlled local indexed model is allowed to render while the full source viewer boots.
  const localCanvas=page.locator('#three-stage canvas');
  await expect(localCanvas).toBeVisible({timeout:15000});
  await expect(root).toHaveAttribute('data-jaguar3d','ready',{timeout:15000});

  await page.getByRole('button',{name:'ENTER THE LIVING SYSTEM'}).click();
  await expect(root).toHaveAttribute('data-entered','true');

  // Founder P0: the primary visible encounter must become the verified full Ear.Rodriguez source model.
  await expect(root).toHaveAttribute('data-jaguar-ear-full','ready',{timeout:20000});
  await expect(root).toHaveAttribute('data-jaguar3d-source','ear-rodriguez-full-source-viewer');
  const viewer=page.locator('.jaguar-ear-full-v43__viewer');
  await expect(viewer).toBeVisible();
  const viewerBox=await viewer.boundingBox();
  expect(viewerBox?.width||0).toBeGreaterThan(250);
  expect(viewerBox?.height||0).toBeGreaterThan(250);
  const viewerSrc=await viewer.getAttribute('src');
  expect(viewerSrc||'').toMatch(/sketchfab\.com/i);
  await expect(page.locator('.jaguar-ear-full-v43__credit')).toContainText(/EAR\.RODRIGUEZ · CC BY 4\.0/i);
  await expect(localCanvas).toHaveCSS('opacity','0');

  await mkdir('artifacts/jaguar-full', { recursive: true });
  await page.screenshot({path:`artifacts/jaguar-full/${testInfo.project.name}-encounter.png`,fullPage:true});

  // Existing interactions remain operable; source animation is used when available by the viewer runtime.
  await page.getByRole('button',{name:'LOOK AT ME'}).click();
  await page.getByRole('button',{name:'MOVE'}).click();
  await page.getByRole('button',{name:'LUME'}).click();
  await expect(root).toHaveAttribute('data-lume','true');
  await expect(page.locator('.lume-room')).toBeVisible();
  await expect(page.locator('.lume-grid--floor')).toBeVisible();
  await expect(page.locator('.lume-intel--species')).toBeVisible();
  await page.screenshot({path:`artifacts/jaguar-full/${testInfo.project.name}-lume.png`,fullPage:true});

  const expected=[/One life depends on many/i,/The animal is not the whole story/i,/The landscape changes/i,/See the system before acting/i,/Response starts with the system/i,/Action needs accountable actors/i,/Proof closes the loop/i];
  for(let i=0;i<expected.length;i+=1){
    await page.getByRole('button',{name:/FOLLOW THE SYSTEM/}).click();
    await expect(root).toHaveAttribute('data-scene',String(i+1));
    await expect(page.locator('#chapter-title')).toContainText(expected[i]);
    await expect(page.locator('.scene-intel')).toBeVisible();
  }
  await page.getByRole('button',{name:'RETURN TO JAGUAR'}).click();
  await expect(root).toHaveAttribute('data-scene','0');
  await expect(viewer).toBeVisible();
  await expect(root).toHaveAttribute('data-jaguar3d-active','true');

  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.client+2);
});