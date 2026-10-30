import fs from 'node:fs';
import {setTimeout as sleep} from 'node:timers/promises';
const origin='https://4planet.org', d=JSON.parse(fs.readFileSync('src/data/impactDiscovery.json','utf8'));
const groups={project:d.projects||[],actors:d.actors||[],issue:d.issues||[],solution:(d.solutions||[]).filter(x=>x.indexable)};
const rows=[{kind:'home',name:'Find people bringing life back.',path:'/impact/'}];
for(const [kind,group] of Object.entries(groups))for(const x of group)rows.push({kind,name:x.name,path:'/impact/'+kind+'/'+x.slug+'/',item:x});
const errors=[],results=[];function fail(code,p,detail){errors.push({code,path:p,detail:String(detail).slice(0,400)})}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function norm(s){return String(s||'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/[\u2018\u2019]/g,"'").replace(/\s+/g,' ').trim()}
async function get(url){let r;for(let n=0;n<3;n++){try{const x=await fetch(url,{redirect:'follow',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(25000)});r={code:x.status,body:await x.text(),url:x.url,type:x.headers.get('content-type')||'',robots:x.headers.get('x-robots-tag')||''};if(![429,500,502,503,504].includes(x.status))return r}catch(e){r={code:0,body:'',error:String(e)}}await sleep(500*(n+1))}return r}
async function parallel(items,limit,fn){let i=0;await Promise.all(Array.from({length:limit},async()=>{while(i<items.length)await fn(items[i++])}))}
const [sitemap,impactSitemap,robots,marker]=await Promise.all([get(origin+'/sitemap.xml'),get(origin+'/impact-sitemap.xml'),get(origin+'/robots.txt'),get(origin+'/impact-build.json')]);
let live={};try{live=JSON.parse(marker.body)}catch(e){fail('build_marker_json','/impact-build.json',e)}
const sha=process.env.AUDIT_EXPECTED_SHA||'';
if(marker.code!==200)fail('build_marker_http','/impact-build.json',marker.code);
if(sitemap.code!==200)fail('sitemap_http','/sitemap.xml',sitemap.code);
if(impactSitemap.code!==200)fail('impact_sitemap_http','/impact-sitemap.xml',impactSitemap.code);
if(robots.code!==200)fail('robots_http','/robots.txt',robots.code);
if(!robots.body.includes('Sitemap: '+origin+'/impact-sitemap.xml'))fail('robots_impact_sitemap','/robots.txt','dedicated sitemap undiscoverable');
const expectedUrls=rows.map(x=>origin+x.path),dedicatedLocs=[...impactSitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
if(dedicatedLocs.length!==rows.length)fail('impact_sitemap_count','/impact-sitemap.xml','expected '+rows.length+' got '+dedicatedLocs.length);
if(new Set(dedicatedLocs).size!==dedicatedLocs.length)fail('impact_sitemap_duplicate','/impact-sitemap.xml','duplicate <loc> values');
for(const expected of expectedUrls)if(!dedicatedLocs.includes(expected))fail('impact_sitemap_missing','/impact-sitemap.xml',expected);
for(const actual of dedicatedLocs)if(!expectedUrls.includes(actual))fail('impact_sitemap_extra','/impact-sitemap.xml',actual);
if(sha&&live.sha!==sha)fail('production_sha_mismatch','/impact-build.json','expected '+sha+' actual '+live.sha);
if(groups.project.length<65||groups.actors.length<62)fail('baseline_regression','/impact','projects or actors below baseline');
if(new Set(rows.map(x=>x.path)).size!==rows.length)fail('duplicate_profile_url','/impact','slug collision');
await parallel(rows,12,async t=>{
 const r=await get(origin+t.path),h=r.body||'',bad=[];if(t.kind==='home')console.log('IMPACT_HOME_HTML_DIAGNOSTIC',JSON.stringify({body_length:h.length,heading_fragment:h.slice(Math.max(0,h.indexOf('<h1')),h.indexOf('</h1>')+5),canonical_fragment:h.slice(Math.max(0,h.indexOf('rel="canonical"')-7),h.indexOf('rel="canonical"')+180),first_700:h.slice(0,700)}));function check(k,pass){if(!pass){bad.push(k);fail(k,t.path,'status='+r.code+' expected='+t.name+' actual='+r.url)}}
 check('http_200',r.code===200);check('correct_url',r.url===origin+t.path);
 check('html',/text\/html/i.test(r.type));check('not_fallback_404',!/4PLANET\s*\/\s*404|Page not found\./i.test(h));
 check('correct_h1',h.includes('<h1>'+esc(t.name)+'</h1>'));check('canonical',h.includes('<link rel="canonical" href="'+origin+t.path+'"'));
 check('json_ld',h.includes('type="application/ld+json"'));check('indexable',!/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(h)&&!/noindex/i.test(r.robots));
 check('sitemap',sitemap.body.includes('<loc>'+origin+t.path+'</loc>'));
 check('dedicated_sitemap',impactSitemap.body.includes('<loc>'+origin+t.path+'</loc>'));
 check('one_canonical',(h.match(/rel=["']canonical["']/g)||[]).length===1);
 check('one_h1',(h.match(/<h1(?:\s|>)/gi)||[]).length===1);
 check('breadcrumbs',h.includes('aria-label="Breadcrumb"'));
 const schemas=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
 check('schema_parseable',schemas.length===2 && schemas.every(m=>{try{JSON.parse(m[1]);return true}catch{return false}}));
 if(schemas.length===2){
  let crumb=null;try{crumb=JSON.parse(schemas[1][1])}catch{}
  check('breadcrumb_jsonld',crumb?.['@type']==='BreadcrumbList' && crumb?.itemListElement?.at(-1)?.item===origin+t.path);
 }
 check('description',/<meta name="description" content=".{30,}/.test(h));
 // Exact production HTML must have page-specific, coherent OG/Twitter metadata.
 const encodedTitle=h.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'';
 const encodedDescription=h.match(/<meta name="description" content="([^"]*)"/i)?.[1]||'';
 const field=(attr,key)=>[...h.matchAll(/<meta\s+[^>]*>/gi)]
   .map(m=>m[0]).filter(t=>t.includes(attr+'="'+key+'"'));
 const content=tag=>tag?.match(/content="([^"]*)"/i)?.[1]||'';
 const ogTitle=field('property','og:title'),twTitle=field('name','twitter:title');
 const ogDesc=field('property','og:description'),twDesc=field('name','twitter:description');
 const ogUrl=field('property','og:url'),ogImage=field('property','og:image');
 const twImage=field('name','twitter:image');
 check('og_title',ogTitle.length===1&&content(ogTitle[0])===encodedTitle);
 check('twitter_title',twTitle.length===1&&content(twTitle[0])===encodedTitle);
 check('og_description',ogDesc.length===1&&content(ogDesc[0])===encodedDescription);
 check('twitter_description',twDesc.length===1&&content(twDesc[0])===encodedDescription);
 check('og_canonical',ogUrl.length===1&&content(ogUrl[0])===origin+t.path);
 check('og_image_absolute',ogImage.length===1&&content(ogImage[0]).startsWith('https://'));
 check('twitter_image_absolute',twImage.length===1&&content(twImage[0]).startsWith('https://'));
 check('no_broken_og_attribute',!h.includes('<meta property="og" '));
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
 const profiles=rows.filter(x=>x.kind!=='home');
 let ok=0,bad=0;try{await parallel(profiles,5,async t=>{const page=await b.newPage({viewport:{width:390,height:844}});try{const resp=await page.goto(origin+t.path,{waitUntil:'domcontentloaded',timeout:40000});if(resp?.status()!==200)throw Error('HTTP '+resp?.status());await page.locator('article.iu-profile h1').first().waitFor({state:'visible',timeout:25000});const x=await page.evaluate(()=>({h:document.querySelector('article.iu-profile h1')?.textContent||'',overflow:document.documentElement.scrollWidth-innerWidth,text:document.querySelector('article.iu-profile')?.textContent||''}));if(norm(x.h)!==norm(t.name))throw Error('wrong hydrated H1 '+x.h);if(x.overflow>16)throw Error('mobile overflow '+x.overflow);if(x.text.length<200||/source unavailable/i.test(x.text))throw Error('hydration/source failure');
        const required=t.kind==='project'?['why','what','evidence','who','sources']:
          t.kind==='actors'?['actor-projects','actor-evidence','actor-record']:
          t.kind==='issue'?['issue-why','issue-projects','issue-actors','issue-sources']:
          ['sol-how','sol-where','sol-evidence'];
        const missing=await page.evaluate(ids=>ids.filter(id=>!document.getElementById(id)),required);
        if(missing.length)throw Error('Claude template structure missing '+missing.join(','));ok++}catch(e){bad++;fail('browser_mobile',t.path,e)}finally{await page.close()}})}finally{await b.close()}report.browser={tested:profiles.length,passed:ok,failed:bad}
}
report.errors=errors;fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/impact-full-live-audit.json',JSON.stringify(report,null,2));
console.log('IMPACT_ALL_URLS',JSON.stringify({sha:report.live_sha,counts:report.counts,total:report.routes,http_passed:report.successful,http_failed:report.failed,browser:report.browser,quality_counts:Object.fromEntries(Object.entries(q).map(([k,v])=>[k,v.length])),errors:errors.slice(0,30)},null,2));
if(errors.length)process.exitCode=1;
