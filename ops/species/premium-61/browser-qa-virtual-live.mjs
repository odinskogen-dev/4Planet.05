/**
 * Read-only virtual-host browser QA for a reconstructed Claude V53 premium site.
 * Reads only the local dist directory, no public DNS/Worker/Pages mutations.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium, webkit } from '@playwright/test';

const dist=path.resolve('dist');
const shotDir=process.env.SPECIES_SCREENSHOT_DIR;
assert.ok(shotDir&&path.isAbsolute(shotDir),'Absolute screenshot path required');
fs.mkdirSync(shotDir,{recursive:true});
const fresh=[
  ['atlas-moth','Attacus atlas'],
  ['peacock-spider','Maratus volans'],
  ['emperor-scorpion','Pandinus imperator'],
  ['dragon-blood-tree','Dracaena cinnabari'],
];
const existing=[['orca','Orcinus orca'],['koala','Phascolarctos cinereus']];
const ctype={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
const requested={};

async function serveLocal(route) {
  const url=new URL(route.request().url());
  if(url.hostname!=='4species.com'){await route.continue();return}
  let pathname;
  try{pathname=decodeURIComponent(url.pathname)}
  catch{await route.fulfill({status:400,body:'Invalid path'});return}
  if(pathname.includes('..')||pathname.includes('\0')){await route.fulfill({status:400,body:'Invalid path'});return}
  let file=path.resolve(dist,'.'+pathname);
  if(!file.startsWith(dist+path.sep)){await route.fulfill({status:403,body:'Forbidden'});return}
  if(pathname.endsWith('/')||!path.extname(file))file=path.join(file,'index.html');
  requested[pathname]=(requested[pathname]||0)+1;
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){await route.fulfill({status:404,body:'Not Found'});return}
  await route.fulfill({status:200,body:fs.readFileSync(file),contentType:ctype[path.extname(file)]||'application/octet-stream'});
}
const failures=[];
for(const [browserName,browserType] of [['chromium',chromium],['webkit',webkit]]){
  const browser=await browserType.launch({headless:true});
  try{
    for(const screen of ['desktop','mobile']){
      const context=await browser.newContext(screen==='mobile'?
        {viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:browserName==='webkit',hasTouch:true}:
        {viewport:{width:1440,height:900},deviceScaleFactor:1});
      await context.route('https://4species.com/**',serveLocal);
      for(const [slug,scientific] of [...fresh,...existing]){
        const address='https://4species.com/'+slug;
        const page=await context.newPage();
        try{
          const response=await page.goto(address,{waitUntil:'domcontentloaded',timeout:30000});
          assert.equal(response?.status(),200,slug+' HTTP');
          await page.locator('h1.spx-name').waitFor({state:'visible',timeout:18000});
          await page.waitForTimeout(2300);
          const p=await page.evaluate(()=>{
            const q=x=>document.querySelector(x);
            const hero=q('.spx-hero-slide img');
            return {
              h1:q('h1.spx-name')?.textContent?.trim(),
              body:document.body.innerText,
              canonical:q('link[rel="canonical"]')?.getAttribute('href'),
              image:hero?.getAttribute('src'),
              loaded:!!hero?.complete&&!!hero?.naturalWidth,
              slides:document.querySelectorAll('.spx-hero-slide img').length,
              credit:q('[data-spx-credit]')?.textContent?.trim(),
              width:document.documentElement.scrollWidth,
              viewport:window.innerWidth,
              schema:document.querySelectorAll('script[type="application/ld+json"]').length,
            };
          });
          assert.ok(p.h1?.length>2,slug+' no name');
          assert.ok(p.body.includes(scientific),slug+' wrong scientific identity');
          assert.equal(p.canonical,address,slug+' wrong canonical');
          assert.ok(!p.body.includes('Pending authority citation'),slug+' placeholder authority');
          assert.ok(p.loaded,slug+' hero missing');
          assert.ok(p.width<=p.viewport+4,slug+' horizontal overflow');
          if(fresh.some(a=>a[0]===slug)){
            assert.equal(p.slides,1,slug+' unreviewed galleries');
            assert.ok(p.image?.startsWith('https://4species.com/assets/species/next61/'),slug+' not first-party photo');
            assert.ok(p.credit?.length>12,slug+' credit absent');
          }
          await page.screenshot({path:path.join(shotDir,browserName+'-'+screen+'-'+slug+'.png'),fullPage:false,animations:'disabled'});
          console.log('CLAUDE_BROWSER_PASS',browserName,screen,slug,'slides='+p.slides,'image='+p.loaded,'schema='+p.schema);
        }catch(e){
          failures.push(browserName+'/'+screen+'/'+slug+': '+e.message);
          console.log('CLAUDE_BROWSER_FAIL',browserName,screen,slug,e.message);
        }finally{await page.close()}
      }
      await context.close();
    }
  }finally{await browser.close()}
}
if(failures.length)throw Error('Browser QA safety gate: '+failures.join(' | ').slice(0,3000));
assert.ok(fresh.every(a=>(requested['/'+a[0]]||0)>0),'Some candidate source not loaded');
console.log('CLAUDE_PREMIUM_4_NEW_2_EXISTING_CHROMIUM_WEBKIT_MOBILE_DESKTOP_PASS');
