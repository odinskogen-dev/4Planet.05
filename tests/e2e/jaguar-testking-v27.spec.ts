import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('TEST KING Jaguar renders local Ear source-derived V48, exposes LUME room, and completes 8 scenes', async ({ page }, testInfo) => {
  await page.goto('/journey/jaguar/');
  const root=page.locator('#jaguar-experience');
  await expect(root).toBeVisible();

  // First frame remains controlled species media; V48 may initialise while entry is still visible.
  await expect(page.locator('#photo-fallback')).toBeAttached();
  await expect(root).toHaveAttribute('data-jaguar-ear-delivery','local-source-derivative-v48',{timeout:10000});
  await expect(root).toHaveAttribute('data-jaguar3d-source','ear-rodriguez-local-v48-source-derived',{timeout:10000});
  await expect(root).toHaveAttribute('data-jaguar-motion-truth','procedural-presentation-motion-not-source-animation',{timeout:10000});

  await page.getByRole('button',{name:'ENTER THE LIVING SYSTEM'}).click();
  await expect(root).toHaveAttribute('data-entered','true');

  // Founder P0: local source-derived V48 must become the visible creature. No external iframe/white-panel path may exist.
  await expect(root).toHaveAttribute('data-jaguar-ear-full','ready',{timeout:20000});
  await expect(root).toHaveAttribute('data-jaguar3d','ready',{timeout:20000});
  await expect(root).toHaveAttribute('data-jaguar3d-active','true',{timeout:20000});
  await expect(root).toHaveAttribute('data-jaguar-pose','source-bind-pose-quadruped');
  await expect(root).toHaveAttribute('data-jaguar-material','procedural-rosette-presentation-not-source-texture');
  await expect(root).toHaveAttribute('data-jaguar-master-sha256','8225124ef8370f7798c437b8ade8651d420e1ec0155ecbbb529058c586b89f13');
  await expect(root).not.toHaveAttribute('data-jaguar-ear-full-failure',/.+/);
  await expect(page.locator('#three-stage iframe')).toHaveCount(0);

  const localCanvas=page.locator('#three-stage>canvas.jaguar-local-v48');
  await expect(localCanvas).toBeVisible({timeout:20000});
  const canvasBox=await localCanvas.boundingBox();
  expect(canvasBox?.width||0).toBeGreaterThan(250);
  expect(canvasBox?.height||0).toBeGreaterThan(250);
  await expect(localCanvas).toHaveCSS('opacity','1');
  await expect(page.locator('.jaguar-local-v48-credit')).toBeVisible();
  await expect(page.locator('.jaguar-local-v48-credit')).toContainText(/EAR\.RODRIGUEZ · CC BY 4\.0/i);

  // Require actual non-empty framebuffer pixels from the local WebGL creature surface.
  const pixelProof=await localCanvas.evaluate((canvas: HTMLCanvasElement)=>{
    const gl=canvas.getContext('webgl',{preserveDrawingBuffer:true});
    if(!gl||!gl.drawingBufferWidth||!gl.drawingBufferHeight)return {lit:0,total:0};
    const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
    const pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    let lit=0;for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]>24&&(pixels[i]+pixels[i+1]+pixels[i+2])>45)lit++;}
    return {lit,total:w*h};
  });
  expect(pixelProof.total).toBeGreaterThan(0);
  expect(pixelProof.lit/pixelProof.total).toBeGreaterThan(0.002);

  // Proxy/photo stay fallback-only after V48 is ready.
  const fallback=page.locator('#photo-fallback');
  await expect(fallback).toBeHidden();
  const oldCanvases=page.locator('#three-stage>canvas:not(.jaguar-local-v48)');
  const oldCount=await oldCanvases.count();
  for(let i=0;i<oldCount;i+=1)await expect(oldCanvases.nth(i)).toHaveCSS('opacity','0');
  await expect(page.locator('#controls span')).toContainText(/DRAG \/ SWIPE TO TURN · PRESENTATION MOTION/i);

  // Direct interaction remains local and cannot turn the runtime into fallback.
  if(canvasBox){
    await page.mouse.move(canvasBox.x+canvasBox.width*.55,canvasBox.y+canvasBox.height*.5);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x+canvasBox.width*.38,canvasBox.y+canvasBox.height*.5,{steps:5});
    await page.mouse.up();
  }
  await expect(root).toHaveAttribute('data-jaguar-ear-full','ready');
  await page.getByRole('button',{name:'LUME'}).click();
  await expect(root).toHaveAttribute('data-lume','true');
  await expect(page.locator('.lume-room')).toBeVisible();
  await expect(page.locator('.lume-grid--floor')).toBeVisible();
  await expect(page.locator('.lume-intel--species')).toBeVisible();

  await mkdir('artifacts/jaguar-v48', { recursive: true });
  await page.screenshot({path:`artifacts/jaguar-v48/${testInfo.project.name}-encounter-lume.png`,fullPage:true});

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
  await expect(localCanvas).toBeVisible();
  await expect(root).toHaveAttribute('data-jaguar3d-active','true');

  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.client+2);
});
