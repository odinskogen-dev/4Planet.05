import fs from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';
const origin='https://4planet.org', d=JSON.parse(fs.readFileSync('src/data/impactDiscovery.json','utf8'));
const groups={project:d.projects||[],actors:d.actors||[],issue:d.issues||[],solution:(d.solutions||[]).filter(x=>x.indexable)};
const rows=[{kind:'home',name:'Find people bringing life back.',path:'/impact'}];
for(const [kind,group] of Object.entries(groups))for(const x of group)rows.push({kind,name:x.name,path:'/impact/'+kind+'/'+x.slug,item:x});
const errors=[],results=[];function fail(code,p,detail){errors.push({code,path:p,detail:String(detail).slice(0,400)})}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function norm(s){return String(s||'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[\u2018\u2019]/g,"'").replace(/\s+/g,' ').trim()}
async function get(url){let r;for(let n=0;n<3;n++){try{const x=await fetch(url,{redirect:'follow',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)});r={code:x.status,body:await x.text(),url:x.url,type:x.headers.get('content-type')||'',robots:x.headers.get('x-robots-tag')||''};if(![429,500,502,503,504].includes(x.status))return r}catch(e){r={code:0,body:'',error:String(e)}}await sleep(500*(n+1))}return r}
async function parallel(items,limit,fn){let i=0;await Promise.all(Array.from({length:limit},async()=>{while(i<items.length)await fn(items[i++])}))}
const [sitemap,marker]=await Promise.all([get(origin+'/sitemap.xml'),get(origin+'/impact-build.json')]);
let live={};try{live=JSON.parse(marker.body)}catch(e){fail('build_marker_json','/impact-build.json',e)}
const sha=process.env.AUDIT_EXPECTED_SHA||'';
if(marker.code!==200)fail('build_marker_http','/impact-build.json',marker.code);
if(sitemap.code!==200)fail('sitemap_http','/sitemap.xml',sitemap.code);
if(sha&&live.sha!==sha)fail('production_sha_mismatch','/impact-build.json','expected '+sha+' actual '+live.sha);
if(groups.project.length<65||groups.actors.length<62)fail('baseline_regression','/impact','projects or actors below baseline');
if(new Set(rows.map(x=>x.path)).size!==rows.length)fail('duplicate_profile_url','/impact','slug collision');
await parallel(rows,12,async t=>{
 const r=await get(origin+t.path),h=r.body||'',bad=[];function check(k,pass){if(!pass){bad.push(k);fail(k,t.path,'status='+r.code+' expected='+t.name+' actual='+r.url)}}
 check('http_200',r.code===200);check('correct_url',r.url===origin+t.path);
 check('html',/text\/html/i.test(r.type));check('not_fallback_404',!/4PLANET\s*\/\s*404|Page not found\./i.test(h));
 check('correct_h1',h.includes('<h1>'+esc(t.name)+'</h1>'));check('canonical',h.includes('<link rel="canonical" href="'+origin+t.path+'"'));
 check('json_ld',h.includes('type="application/ld+json"'));check('indexable',!/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(h)&&!/noindex/i.test(r.robots));
 check('sitemap',sitemap.body.includes('<loc>'+origin+t.path+'</loc>'));
 check('description',/<meta name="description" content=".{30,}/.test(h));
 if(t.kind==='project'){check('project_actor',!!t.item.actor&&h.includes('/impact/actors/'+t.item.actor.slug));check('project_sources',(t.item.citations||[]).length>0&&h.includes('<h2>Sources</h2>'));check('truth_boundary',h.includes('No 4PLANET partnership'))}
 if(t.kind==='actors')check('actor_not_partner',h.includes('not a 4PLANET partner'));
 results.push({kind:t.kind,path:t.path,status:r.code,ok:bad.length===0,errors:bad})
});
const bogus=await get(origin+'/impact/project/impossible-nonexistent-987654321');
if(bogus.code!==404)fail('invented_slug_should_404','/impact/project/impossible-nonexistent-987654321',bogus.code);
const q={projects_no_image:groups.project.filter(x=>!x.image).map(x=>x.slug),projects_no_claims:groups.project.filter(x=>!x.citations?.length).map(x=>x.slug),actors_no_website:groups.actors.filter(x=>!x.website).map(x=>x.slug),actors_no_source:groups.actors.filter(x=>!x.citations?.length).map(x=>x.slug)};
const report={time:new Date().toISOString(),sha,live_sha:live.sha,counts:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,v.length])),routes:rows.length,successful:results.filter(x=>x.ok).length,failed:results.filter(x=>!x.ok).length,quality:q,errors,results};
if(process.argv.includes('--browser')){
 const {chromium}=await import('@playwright/test'),b=await chromium.launch({headless:true});
 const profiles=rows.filter(x=>x.kind==='project'||x.kind==='actors');
 let ok=0,bad=0;try{await parallel(profiles,5,async t=>{const page=await b.newPage({viewport:{width:390,height:844}});try{const resp=await page.goto(origin+t.path,{waitUntil:'domcontentloaded',timeout:40000});if(resp?.status()!==200)throw Error('HTTP '+resp?.status());await page.locator('article.iu-profile h1').first().waitFor({state:'visible',timeout:25000});const x=await page.evaluate(()=>({h:document.querySelector('article.iu-profile h1')?.textContent||'',overflow:document.documentElement.scrollWidth-innerWidth,text:document.querySelector('article.iu-profile')?.textContent||''}));if(norm(x.h)!==norm(t.name))throw Error('wrong hydrated H1 '+x.h);if(x.overflow>16)throw Error('mobile overflow '+x.overflow);if(x.text.length<200||/source unavailable/i.test(x.text))throw Error('hydration/source failure');ok++}catch(e){bad++;fail('browser_mobile',t.path,e)}finally{await page.close()}})}finally{await b.close()}report.browser={tested:profiles.length,passed:ok,failed:bad}
}
report.errors=errors;fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/impact-full-live-audit.json',JSON.stringify(report,null,2));
console.log('IMPACT_ALL_URLS',JSON.stringify({sha:report.live_sha,counts:report.counts,total:report.routes,http_passed:report.successful,http_failed:report.failed,browser:report.browser,quality_counts:Object.fromEntries(Object.entries(q).map(([k,v])=>[k,v.length])),errors:errors.slice(0,30)},null,2));
if(errors.length)process.exitCode=1;
