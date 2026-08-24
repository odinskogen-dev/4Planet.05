import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('TEST KING Jaguar loads verified Ear full-source 3D, preserves fallback, exposes LUME room, and completes 8 scenes', async ({ page }, testInfo) => {
  await page.goto('/journey/jaguar/');
  const root=page.locator('#jaguar-experience');
  await expect(root).toBeVisible();
  await expect(root).toHaveAttribute('data-jaguar-ear-full',/loading|ready/,{timeout:5000});
  await expect(root).toHaveAttribute('data-jaguar-ear-delivery','direct-official-embed-v46');

  // Entry is intentionally first-frame-first. The local WebGL fallback is created only after ENTER.
  await expect(page.locator('#photo-fallback')).toBeAttached();
  await page.getByRole('button',{name:'ENTER THE LIVING SYSTEM'}).click();
  await expect(root).toHaveAttribute('data-entered','true');

  // Controlled local indexed media remains a fail-safe under the full source viewer after the encounter starts.
  const localCanvas=page.locator('#three-stage>canvas');
  await expect(localCanvas).toBeAttached({timeout:15000});
  await expect(root).toHaveAttribute('data-jaguar3d','ready',{timeout:20000});

  // Founder P0: primary encounter becomes the verified full Ear.Rodriguez source model, not the reduced proxy.
  await expect(root).toHaveAttribute('data-jaguar-ear-full','ready',{timeout:20000});
  await expect(root).toHaveAttribute('data-jaguar3d-source','ear-rodriguez-full-source-viewer');
  await expect(root).not.toHaveAttribute('data-jaguar-ear-full-failure',/.+/);
  const shell=page.locator('#three-stage>.jaguar-ear-full-v43');
  await expect(shell).toBeVisible();
  const viewer=page.locator('.jaguar-ear-full-v43__viewer');
  await expect(viewer).toBeVisible();
  const viewerBox=await viewer.boundingBox();
  expect(viewerBox?.width||0).toBeGreaterThan(250);
  expect(viewerBox?.height||0).toBeGreaterThan(250);
  const viewerSrc=await viewer.getAttribute('src');
  expect(viewerSrc||'').toMatch(/sketchfab\.com\/models\/91c61c329d2a4668816f81f08dfcd492\/embed/i);
  const sourceFrame=page.frames().find(frame=>/sketchfab\.com\/models\/91c61c329d2a4668816f81f08dfcd492\/embed/i.test(frame.url()));
  expect(sourceFrame,'verified Ear source iframe must navigate to the exact model').toBeTruthy();
  if(sourceFrame){
    await expect(sourceFrame.locator('canvas').first()).toBeVisible({timeout:20000});
  }
  await expect(page.locator('.jaguar-ear-full-v43__credit')).toContainText(/EAR\.RODRIGUEZ · CC BY 4\.0/i);
  await expect(localCanvas).toHaveCSS('opacity','0');
  await expect(page.locator('#controls span')).toContainText(/DRAG TO TURN · SOURCE ANIMATION/i);

  // Pointer input lands on the full source viewer. LUME remains a reversible room-state control around it.
  if(viewerBox){
    await page.mouse.move(viewerBox.x+viewerBox.width*.55,viewerBox.y+viewerBox.height*.5);
    await page.mouse.down();
    await page.mouse.move(viewerBox.x+viewerBox.width*.38,viewerBox.y+viewerBox.height*.5,{steps:5});
    await page.mouse.up();
  }
  await page.getByRole('button',{name:'LUME'}).click();
  await expect(root).toHaveAttribute('data-lume','true');
  await expect(page.locator('.lume-room')).toBeVisible();
  await expect(page.locator('.lume-grid--floor')).toBeVisible();
  await expect(page.locator('.lume-intel--species')).toBeVisible();

  await mkdir('artifacts/jaguar-full', { recursive: true });
  await page.screenshot({path:`artifacts/jaguar-full/${testInfo.project.name}-encounter-lume.png`,fullPage:true});

  const expected=[/One life depends on many/i,/The animal is not the whole story/i,/The landscape changes/i,/See the system before acting/i,/Response starts with the system/i,/Action needs accountable actors/i,/Proof closes the loop/i];
  for(let i=0;i<expected.length;i+=1){
    await page.getByRole('button',{name:/FOLLOW THE SYSTEM/}).click();
    await expect(root).toHaveAttribute('data-scene',String(i+1));
    await expect(page.locator('#chapter-title')).toContainText(expected[i]);
    await expect(page.locator('.scene-intel')).toBeVisible();
  }
  await page.getByRole('button',{name:'RETURN TO JAGUAR'}).click();
  await expect(root).toHaveAttribute('data-scene','0');
  await expect(root).toHaveAttribute('data-jaguar-ear-full','ready',{timeout:20000});
  await expect(viewer).toBeVisible();
  await expect(root).toHaveAttribute('data-jaguar3d-active','true');

  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.client+2);
});
