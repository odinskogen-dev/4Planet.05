// Read-only P2 independent quality audit. Never scrape private routes or mutate production.
// Checks source HTML signals, not independently verified media licences or field CWV.
import fs from 'node:fs';
import {chromium,devices} from '@playwright/test';
const at='2026-10-22';
const origins=[
 {product:'4PLANET',domain:'https://4planet.org',sitemap:'/sitemap.xml'},
 {product:'ATLAS',domain:'https://4planetatlas.com',sitemap:'/sitemap.xml'},
 {product:'SPECIES',domain:'https://4species.com',sitemap:'/sitemap.xml'},
 {product:'MAGAZINE',domain:'https://4planetmagazine.com',sitemap:'/magazine-sitemap.xml'}
];
const timeout=20000;
async function get(url){try{const r=await fetch(url,{signal:AbortSignal.timeout(timeout),redirect:'follow',headers:{'User-Agent':'4PLANET-readonly-quality-audit/1.0'}});return {code:r.status,url:r.url,headers:r.headers,text:await r.text()}}catch(e){return {code:0,url,error:String(e),text:''}}}
function attr(s,reg){return (s.match(reg)||[])[1]||''}
const report={date:at,source:'LIVE_READONLY',products:{},checks:[],limits:['Raw HTML is not proof of full client-side content','Image licence evidence requires original asset rights registry review','LCP/CLS synthetic runs are not the 75th-percentile Chrome UX Report; INP cannot be inferred from one load']};
for(const o of origins){
 const sm=await get(o.domain+o.sitemap);
 const urls=[...sm.text.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)].map(x=>x[1]).filter(x=>x.startsWith(o.domain+'/'));
 const selected=o.product==='ATLAS'?urls.filter(u=>/\/place\//.test(u)).slice(0,24):o.product==='SPECIES'?urls.filter(u=>/\/species\//.test(u)).slice(0,55):o.product==='MAGAZINE'?urls.filter(u=>/\/magazine\//.test(u)).slice(0,70):urls.filter(u=>/\/now|\/biodiversity|\/oslofjord|\/about/.test(u)).slice(0,12);
 const result={sitemap:o.sitemap,sitemapHTTP:sm.code,urlCount:urls.length,inspected:0,statusErrors:[],missingCanonical:[],missingDescription:[],missingH1:[],rawSourceLinks:[],possibleUnattributedImages:[],perPage:[]};
 for(const batchStart of Array.from({length:Math.ceil(selected.length/8)},(_,i)=>i*8)){
 const list=selected.slice(batchStart,batchStart+8);
 const pages=await Promise.all(list.map(u=>get(u)));
 for(let i=0;i<pages.length;i++){
  const p=pages[i],url=list[i];result.inspected++;
  if(p.code!==200){result.statusErrors.push([url,p.code]);continue}
  let h=p.text,canon=attr(h,/<link[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["']/i),desc=attr(h,/<meta[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']+)["']/i),h1=/<h1\b[^>]*>/i.test(h);
  let images=[...h.matchAll(/<img\b([^>]+)>/gi)].map(x=>x[1]),missingAlt=images.filter(x=>!/(?:^|\s)alt\s*=/.test(x)).length;
  let citations=[...h.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["']/gi)].map(x=>x[1]).filter(x=>!x.includes(new URL(o.domain).hostname));
  if(!canon)result.missingCanonical.push(url);
  if(!desc)result.missingDescription.push(url);
  if(!h1)result.missingH1.push(url);
  if(missingAlt)result.possibleUnattributedImages.push({url,count:missingAlt});
  result.perPage.push({url,http:p.code,canonical:canon||null,description:desc?.slice(0,120)||null,h1,images:images.length,imagesMissingAlt:missingAlt,externalSourceLinks:citations.length});
 }
 }
 report.products[o.product]=result;
 console.log('AUDIT_PRODUCT',JSON.stringify({product:o.product,sitemapHTTP:result.sitemapHTTP,urls:result.urlCount,inspected:result.inspected,errors:result.statusErrors.length,missingCanonical:result.missingCanonical.length,missingDescription:result.missingDescription.length,missingH1:result.missingH1.length,missingAlt:result.possibleUnattributedImages.length}));
}
const browser=await chromium.launch({headless:true});
for(const o of origins){
 for(const device of ['mobile','desktop']){
  const ctx=await browser.newContext(device==='mobile'?{...devices['iPhone 13'],locale:'en-GB'}:{viewport:{width:1440,height:900},locale:'en-GB'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e).slice(0,160)));
  await page.addInitScript(()=>{
    window.__qaLcp=0;window.__qaCls=0;window.__qaLongTasks=0;
    try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__qaLcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true})}catch{}
    try{new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__qaCls+=e.value}).observe({type:'layout-shift',buffered:true})}catch{}
    try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__qaLongTasks+=Math.max(0,e.duration-50)}).observe({type:'longtask',buffered:true})}catch{}
  });
  const start=Date.now(),url=o.domain+'/';
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForTimeout(2800);
   const perf=await page.evaluate(()=>({lcpMs:Math.round(window.__qaLcp||0),cls:Math.round((window.__qaCls||0)*1000)/1000,longTaskBlockingMs:Math.round(window.__qaLongTasks||0),scrollWidth:document.documentElement.scrollWidth,viewport:window.innerWidth,title:document.title,domImages:document.images.length,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length,resourceTransferBytes:Math.round(performance.getEntriesByType('resource').reduce((a,x)=>a+(x.transferSize||0),0)),h1:document.querySelector('h1')?.textContent?.slice(0,100)||''}));
   report.checks.push({product:o.product,device,http:response?.status(),elapsedMs:Date.now()-start,...perf,pageErrors:errors});
   console.log('AUDIT_BROWSER',JSON.stringify({product:o.product,device,http:response?.status(),...perf,pageErrors:errors.length}));
  }catch(e){report.checks.push({product:o.product,device,error:String(e),pageErrors:errors});console.log('AUDIT_BROWSER_FAILED',o.product,device,String(e))}
  await ctx.close();
 }
}
await browser.close();
fs.mkdirSync('artifacts/discovery',{recursive:true});
fs.writeFileSync('artifacts/discovery/search-p2-live-quality-20261022.json',JSON.stringify(report,null,2)+'\n');
console.log('SEARCH_P2_AUDIT_COMPLETE_SYNTHETIC_NOT_FIELD_METRICS');
