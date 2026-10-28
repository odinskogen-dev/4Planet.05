/**
 * ACTUAL LIVE Chromium + WebKit proof, independent of JS virtual interception.
 * Original 57 HTML and SEO checked separately. This tests 16 UX journeys with
 * real Cloudflare routing after scoped legacy module recovery.
 */
import {chromium,webkit} from '@playwright/test';
const originals=[
 ['orca','Orca'],['lion','Lion'],['tiger','Tiger'],['hyacinth-macaw','Hyacinth macaw'],
 ['koala','Koala'],['quokka','Quokka'],['giant-sequoia','Giant sequoia'],['venus-flytrap','Venus flytrap']
];
const failures=[];
for(const [engine,driver] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await driver.launch({headless:true});
 try{
  for(const [slug,expected] of originals){
   const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
   const errs=[];
   page.on('pageerror',e=>errs.push(String(e).slice(0,200)));
   page.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
   try{
    const url='https://4species.com/'+slug;
    const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('h1.spx-name').waitFor({state:'visible',timeout:16000});
    await page.waitForTimeout(2000);
    const dom=await page.evaluate(()=>({
      h1:document.querySelector('h1.spx-name')?.textContent?.trim(),
      hero:!!document.querySelector('[data-spx-section="hero"]'),
      ssr:!!document.querySelector('.spx-prerender'),
      canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href'),
      body:document.body.innerText.slice(0,120)
    }));
    const exact=dom.h1?.toLowerCase()===expected.toLowerCase();
    const passed=r?.status()===200&&dom.hero&&!dom.ssr&&dom.canonical===url&&exact&&errs.length===0;
    console.log('OLD57_ACTUAL_LIVE_INTERACTIVE_BROWSER',JSON.stringify({engine,slug,passed,dom,errors:errs.slice(0,4)}));
    if(!passed)failures.push(engine+':'+slug+':'+JSON.stringify({dom,errs}).slice(0,500));
   }catch(e){failures.push(engine+':'+slug+':'+String(e).slice(0,300))}
   await page.close();
  }
 }finally{await browser.close()}
}
if(failures.length)throw Error('LIVE_PROTECTED_57_INTERACTIVE_P0 '+failures.join(' | ').slice(0,3300));
console.log('CHROMIUM_WEBKIT_SIXTEEN_ACTUAL_OLD57_INTERACTIVE_JOURNEYS_GOLD_PASS');
