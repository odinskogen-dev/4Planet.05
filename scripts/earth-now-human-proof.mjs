import { chromium, webkit } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.EARTH_BASE_URL || 'http://127.0.0.1:5173';
const out=process.env.EARTH_PROOF_DIR || 'artifacts/earth-now';
fs.mkdirSync(out,{recursive:true});
const browser=process.env.EARTH_ENGINE==='webkit' ? await webkit.launch() : await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];
try {
 for(const width of [390,430,1440]) {
  const page=await browser.newPage({viewport:{width,height:width<500?844:900},isMobile:width<500,hasTouch:width<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/now/',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{level:1,name:/A living planet/}).waitFor();
  const decline=page.getByRole('button',{name:'DECLINE',exact:true});if(await decline.isVisible())await decline.click();
  const canvas = page.frameLocator('.earth-now-map iframe').locator('.maplibregl-canvas');
  if(process.env.EARTH_ENGINE!=='webkit') await canvas.waitFor({timeout:45000});
  else await page.frameLocator('.earth-now-map iframe').locator('main, .maplibregl-canvas').first().waitFor({timeout:45000});
  assert.equal(await page.frameLocator('.earth-now-map iframe').locator('.atlas-panel').isVisible(),false);
  const frame = await (await page.locator('.earth-now-map iframe').elementHandle()).contentFrame();
  console.log('MAP_FRAME_URL',frame.url());
  if(process.env.EARTH_ENGINE!=='webkit') try { await frame.waitForFunction(()=>window.__4planet_map?.getLayer('bluemarble') && window.__4planet_map?.isSourceLoaded('bluemarble'), null, {timeout:45000}); } catch(e) {
    console.log('MAP_DEBUG',await frame.evaluate(()=>({url:location.href,body:document.body.innerText.slice(0,800),map:!!window.__4planet_map,sources:Object.keys(window.__4planet_map?.getStyle()?.sources||{})})));
    await page.screenshot({path:`${out}/map-failure-${width}.png`,fullPage:true});throw e;
  }
  console.log('MAP_READY',width,await frame.evaluate(()=>({url:location.href,loaded:window.__4planet_map?.loaded(),style:window.__4planet_map?.getStyle()?.name,sources:Object.keys(window.__4planet_map?.getStyle()?.sources||{})})));
  await page.screenshot({path:`${out}/now-${width}.png`,fullPage:true});
  const metrics=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,font:getComputedStyle(document.querySelector('.discovery-page')).fontFamily,background:getComputedStyle(document.querySelector('.discovery-page')).backgroundColor,h1:parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),stray:[...document.body.childNodes].filter(n=>n.nodeType===3&&/\\n/.test(n.textContent)).map(n=>n.textContent)}));
  assert.ok(metrics.scroll<=metrics.width,`overflow ${JSON.stringify(metrics)}`);assert.match(metrics.font,/DM Sans/);assert.equal(metrics.background,'rgb(255, 255, 255)');assert.ok(metrics.h1<=48);assert.equal(metrics.stray.length,0);
  for(const [label,id,title] of [['Ocean','ocean','Ocean conditions'],['Land','land','Forests and land'],['Air','air','Our atmosphere'],['Life','life','Life on Earth'],['Events','events','Natural events']]){
   await page.getByRole('button',{name:label,exact:true}).click();
   await page.getByRole('heading',{name:title,exact:true}).waitFor();
   assert.equal(await page.getByRole('button',{name:label,exact:true}).getAttribute('aria-pressed'),'true');
   const frame=page.locator('.earth-now-map iframe');const src=await frame.getAttribute('src');assert.ok(src.startsWith('/atlas?'));assert.equal(new URL(src,base).searchParams.get('embed'),'news');
   assert.equal(new URL(page.url()).searchParams.get('view'),id==='events'?null:id);
  }
  await page.getByRole('button',{name:'Ocean',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Ocean',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Ocean',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByText('About the data',{exact:true}).click();assert.ok(await page.getByText(/Earth Now means latest available/).isVisible());
  await page.getByText('Explore all guides',{exact:true}).click();assert.equal(await page.getByRole('navigation',{name:'Earth and nature guides'}).locator('a').count(),20);
  assert.equal(errors.length,0,JSON.stringify(errors));
  results.push({width,metrics,categorySwitching:'PASS',reload:'PASS',disclosures:'PASS',errors});
  await page.close();
 }
 const audit=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 for(const path of ['/','/wildfires','/earthquakes','/biodiversity','/coral-bleaching','/air-quality','/deforestation','/climate-change','/about','/impact']) {
   await audit.goto(base+path,{waitUntil:'domcontentloaded'});await audit.locator('h1').first().waitFor();
   const check=await audit.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.innerText,stray:[...document.body.childNodes].some(n=>n.nodeType===3&&/\\n/.test(n.textContent))}));
   assert.ok(check.scroll<=check.width,'audit overflow '+path+' '+JSON.stringify(check));assert.equal(check.stray,false,'stray newline '+path);results.push({path,audit:check});
 }
 await audit.close();
}finally{await browser.close();}
fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
