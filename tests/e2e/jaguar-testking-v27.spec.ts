import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

test('TEST KING Jaguar renders active Ear source-derived V52, exposes LUME room, and completes 8 scenes', async ({ page }, testInfo) => {
  await page.goto('/journey/jaguar/');
  const root=page.locator('#jaguar-experience');
  await expect(root).toBeVisible();

  await expect(page.locator('#photo-fallback')).toBeAttached();
  await expect(root).toHaveAttribute('data-jaguar-motion-truth','procedural-presentation-motion-not-source-animation',{timeout:10000});

  await page.getByRole('button',{name:'ENTER THE LIVING SYSTEM'}).click();
  await expect(root).toHaveAttribute('data-entered','true');

  // Founder P0: V52 itself must own the visible creature. Hidden V48/proxy pixels cannot satisfy this gate.
  await expect(root).toHaveAttribute('data-jaguar-quality','volumetric-v52',{timeout:20000});
  await expect(root).toHaveAttribute('data-jaguar-ear-full','ready',{timeout:20000});
  await expect(root).toHaveAttribute('data-jaguar3d','ready',{timeout:20000});
  await expect(root).toHaveAttribute('data-jaguar3d-source','ear-rodriguez-local-v52-source-derived',{timeout:20000});
  await expect(root).toHaveAttribute('data-jaguar-pose','source-bind-pose-perspective');
  await expect(root).toHaveAttribute('data-jaguar-material','procedural-natural-rosette-v52-not-source-texture');
  await expect(root).toHaveAttribute('data-jaguar-master-sha256','8225124ef8370f7798c437b8ade8651d420e1ec0155ecbbb529058c586b89f13');
  await expect(root).not.toHaveAttribute('data-jaguar-quality-failure',/.+/);
  await expect(page.locator('#three-stage iframe')).toHaveCount(0);

  const activeCanvas=page.locator('#three-stage>canvas.jaguar-local-v52');
  await expect(activeCanvas).toBeVisible({timeout:20000});
  const canvasBox=await activeCanvas.boundingBox();
  expect(canvasBox?.width||0).toBeGreaterThan(250);
  expect(canvasBox?.height||0).toBeGreaterThan(200);
  await expect(activeCanvas).toHaveCSS('opacity','1');
  await expect(activeCanvas).toHaveCSS('visibility','visible');

  // Require actual non-empty framebuffer pixels from V52, not a fallback surface.
  await page.waitForTimeout(300);
  const pixelProof=await activeCanvas.evaluate((canvas: HTMLCanvasElement)=>{
    const gl=canvas.getContext('webgl',{preserveDrawingBuffer:true});
    if(!gl||!gl.drawingBufferWidth||!gl.drawingBufferHeight)return {lit:0,total:0};
    const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
    const pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    let lit=0;for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]>24&&(pixels[i]+pixels[i+1]+pixels[i+2])>45)lit++;}
    return {lit,total:w*h};
  });
  expect(pixelProof.total).toBeGreaterThan(0);
  expect(pixelProof.lit/pixelProof.total).toBeGreaterThan(0.002);

  // Previous V48 and photo remain fallback-only after V52 is ready.
  await expect(page.locator('#photo-fallback')).toBeHidden();
  const v48Canvas=page.locator('#three-stage>canvas.jaguar-local-v48');
  await expect(v48Canvas).toBeHidden();
  const legacyCanvases=page.locator('#three-stage>canvas:not(.jaguar-local-v48):not(.jaguar-local-v52)');
  const legacyCount=await legacyCanvases.count();
  for(let i=0;i<legacyCount;i+=1)await expect(legacyCanvases.nth(i)).toHaveCSS('opacity','0');
  await expect(page.locator('.jaguar-local-v48-credit')).toBeVisible();
  await expect(page.locator('.jaguar-local-v48-credit')).toContainText(/EAR\.RODRIGUEZ · CC BY 4\.0/i);

  // Direct interaction is performed on the active V52 surface.
  if(canvasBox){
    await page.mouse.move(canvasBox.x+canvasBox.width*.55,canvasBox.y+canvasBox.height*.5);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x+canvasBox.width*.38,canvasBox.y+canvasBox.height*.5,{steps:5});
    await page.mouse.up();
  }
  await expect(root).toHaveAttribute('data-jaguar-quality','volumetric-v52');
  await page.getByRole('button',{name:'LOOK AT ME'}).click();
  await page.getByRole('button',{name:'MOVE'}).click();
  await expect(root).toHaveAttribute('data-jaguar-quality','volumetric-v52');

  await page.getByRole('button',{name:'LUME'}).click();
  await expect(root).toHaveAttribute('data-lume','true');
  await expect(page.locator('.lume-room')).toBeVisible();
  await expect(page.locator('.lume-grid--floor')).toBeVisible();
  await expect(page.locator('.lume-intel--species')).toBeVisible();

  await mkdir('artifacts/jaguar-v52', { recursive: true });
  await page.screenshot({path:`artifacts/jaguar-v52/${testInfo.project.name}-encounter-lume.png`,fullPage:true});

  const expected=[/One life depends on many/i,/The animal is not the whole story/i,/The landscape changes/i,/See the system before acting/i,/Response starts with the system/i,/Action needs accountable actors/i,/Proof closes the loop/i];
  for(let i=0;i<expected.length;i+=1){
    await page.getByRole('button',{name:/FOLLOW THE SYSTEM/}).click();
    await expect(root).toHaveAttribute('data-scene',String(i+1));
    await expect(page.locator('#chapter-title')).toContainText(expected[i]);
    await expect(page.locator('.scene-intel')).toBeVisible();
  }
  await page.getByRole('button',{name:'RETURN TO JAGUAR'}).click();
  await expect(root).toHaveAttribute('data-scene','0');
  await expect(root).toHaveAttribute('data-jaguar-quality','volumetric-v52',{timeout:20000});
  await expect(activeCanvas).toBeVisible();

  const width=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(width.scroll).toBeLessThanOrEqual(width.client+2);
});
