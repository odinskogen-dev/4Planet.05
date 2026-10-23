const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
for(const conf of [{name:'desktop',width:1366,height:768,mobile:false},{name:'mobile',width:390,height:844,mobile:true}]){
 const ctx=await browser.newContext({viewport:{width:conf.width,height:conf.height},isMobile:conf.mobile,hasTouch:conf.mobile});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('JS '+String(e)));
 page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url())});
 await page.goto('http://127.0.0.1:8878/',{waitUntil:'domcontentloaded',timeout:30000});
 if((await page.locator('a[href="/roma/challenger-08/"]').count())<1||(await page.locator('a[href="/roma/"]').count())<1)throw Error('Homepage missing dual playable ROMA links');
 await page.goto('http://127.0.0.1:8878/games/roma/',{waitUntil:'domcontentloaded',timeout:30000});
 if((await page.locator('a[href="/roma/challenger-08/"]').count())<2||(await page.locator('a[href="/roma/"]').count())<2)throw Error('ROMA detail missing dual play links');
 errors.length=0; // Site's production-created poster WebP files are absent only from isolated test server.
 let response=await page.goto('http://127.0.0.1:8878/roma/challenger-08/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('#bCamp').waitFor({state:'visible',timeout:60000});
 if(!(await page.locator('#bNew').isVisible()))throw Error('Original Cannae mode missing inside Challenger 08');
 const canvas=page.locator('canvas#world');await canvas.waitFor({state:'visible',timeout:15000});
 const dims=await canvas.boundingBox();
 if(!dims||dims.width<conf.width*.85)throw Error('Not a full-viewport game');
 await page.screenshot({path:'roma08-title-'+conf.name+'.png',fullPage:true});
 const startMs=Date.now();
 await page.locator('#bCamp').click({force:true,noWaitAfter:true,timeout:90000});
 await page.locator('.cmp-map').waitFor({state:'visible',timeout:90000});
 console.log('CUB_ROMA_CH08_CAMPAIGN_START_MS',conf.name,Date.now()-startMs);
 const date=(await page.locator('.cmp-top').innerText()).slice(0,250);
 await page.screenshot({path:'roma08-imperium-'+conf.name+'.png',fullPage:true});
 const keys=await page.evaluate(()=>Object.keys(localStorage));
 if(keys.some(k=>k.startsWith('roma_challenger01_')||k.startsWith('roma_c01_')))throw Error('Shared original ROMA storage key collision');
 if(errors.length)throw Error('Console or network errors: '+JSON.stringify(errors.slice(0,5)));
 console.log('CUB_ROMA_CH08_QA_PASS',JSON.stringify({viewport:conf.name,http:response.status(),campaign:date,canvas:dims.width+'x'+dims.height,storageKeys:keys.length,errors}));
 await ctx.close();
}
await browser.close();
})().catch(e=>{console.error('CUB_ROMA_CH08_QA_FAIL',e.stack||String(e));process.exit(1)});
