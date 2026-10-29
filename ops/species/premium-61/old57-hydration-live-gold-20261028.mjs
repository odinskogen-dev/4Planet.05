/**
 * Actual 4SPECIES LIVE old57 immutable HTML/JSON preservation checks are in
 * the Python transaction. This browser gate tests the interactive shell.
 *
 * Cloudflare route propagation can take several seconds across PoPs. Retry
 * transient shell-not-yet-hydrated cases, but fail closed if 57-core UI still
 * fails after three genuine Chromium/WebKit attempts.
 *
 * GBIF, Wikimedia, iNaturalist external 429 are REAL auxiliary data throttles,
 * logged separately; they must not be confused with 4species first-party JS
 * or hydrated species card faults. Original code treated ANY console 429 as
 * a catastrophic release regression, producing a false rollback even when
 * the H1, canonical, hero and native app all passed.
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
   let passed=false,latest={};
   for(let attempt=1;attempt<=3&&!passed;attempt++){
    const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});
    const runtimeErrors=[],coreAssetsFailed=[],external429=[];
    page.on('pageerror',e=>runtimeErrors.push(String(e).slice(0,240)));
    page.on('response',res=>{
      try{
        const u=new URL(res.url());
        if(res.status()>=400&&u.hostname==='4species.com'&&u.pathname.startsWith('/assets/')) coreAssetsFailed.push(u.pathname+' HTTP '+res.status());
        else if(res.status()===429&&u.hostname!=='4species.com')external429.push(u.hostname);
      }catch{}
    });
    try{
      const url='https://4species.com/'+slug;
      const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
      await page.locator('h1.spx-name').waitFor({state:'visible',timeout:18000});
      await page.waitForTimeout(1100);
      const dom=await page.evaluate(()=>({
        h1:document.querySelector('h1.spx-name')?.textContent?.trim(),
        hero:!!document.querySelector('[data-spx-section="hero"]'),
        ssr:!!document.querySelector('.spx-prerender'),
        canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href'),
        imageCount:document.querySelectorAll('.spx-hero-slide img').length,
      }));
      passed=response?.status()===200&&dom.hero&&!dom.ssr&&dom.canonical===url&&
        dom.h1?.toLowerCase()===expected.toLowerCase()&&runtimeErrors.length===0&&coreAssetsFailed.length===0;
      latest={attempt,status:response?.status(),dom,runtimeErrors:runtimeErrors.slice(0,4),
        coreAssetsFailed:coreAssetsFailed.slice(0,4),auxiliaryData429:external429.length,passed};
      console.log('OLD57_ACTUAL_LIVE_INTERACTIVE_BROWSER',JSON.stringify({engine,slug,...latest}));
    }catch(e){
      latest={attempt,passed:false,reason:String(e).slice(0,300),
        runtimeErrors:runtimeErrors.slice(0,4),coreAssetsFailed:coreAssetsFailed.slice(0,4),auxiliaryData429:external429.length};
      console.log('OLD57_ACTUAL_LIVE_RETRY',JSON.stringify({engine,slug,...latest}));
    }finally{await page.close()}
    if(!passed&&attempt<3)await new Promise(resolve=>setTimeout(resolve,2200));
   }
   if(!passed)failures.push(engine+':'+slug+':'+JSON.stringify(latest).slice(0,550));
  }
 }finally{await browser.close()}
}
if(failures.length)throw Error('LIVE_PROTECTED_57_INTERACTIVE_P0 '+failures.join(' | ').slice(0,4000));
console.log('CHROMIUM_WEBKIT_SIXTEEN_ACTUAL_OLD57_INTERACTIVE_JOURNEYS_GOLD_PASS; external 429 classified separately');
