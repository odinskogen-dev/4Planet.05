import fs from 'node:fs';
import path from 'node:path';
const d=JSON.parse(fs.readFileSync('src/data/impactDiscovery.json','utf8'));
const origin='https://4planet.org';
const groups=[['home',[{slug:'',name:'Impact'}]],['project',d.projects],['actors',d.actors],['issue',d.issues],['solution',d.solutions.filter(x=>x.indexable)]];
const routes=groups.flatMap(([kind,items])=>items.map(item=>({kind,item,path:kind==='home'?'/impact/':'/impact/'+kind+'/'+item.slug+'/'})));
const decode=s=>String(s||'').replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const meta=(html,field,key)=>[...html.matchAll(/<meta\s+[^>]+>/gi)].map(x=>x[0]).find(t=>t.includes(field+'="'+key+'"'))?.match(/content="([^"]*)"/i)?.[1]||'';
const visible=s=>decode(s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
const report={date:new Date().toISOString(),technical:[],opportunities:[],records:[]};
const error=(p,k,v)=>report.technical.push({path:p,category:k,value:v});
const opportunity=(p,k,v)=>report.opportunities.push({path:p,category:k,value:v});
const titles=new Map(),descs=new Map();
for(const {kind,item,path:route} of routes){
 const file=path.join('dist',route.slice(1),'index.html');
 if(!fs.existsSync(file)){error(route,'missing_html','');continue}
 const html=fs.readFileSync(file,'utf8');
 const title=decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'');
 const desc=decode(meta(html,'name','description'));
 const h1=[...html.matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/gi)].map(x=>visible(x[1]));
 const canon=[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/gi)].map(x=>x[0]);
 const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 let dataOk=true;try{for(const x of scripts)JSON.parse(x)}catch{dataOk=false}
 const content=html.includes('<main')?html.slice(html.indexOf('<main'),html.lastIndexOf('</main>')+7):'';
 const words=visible(content).split(/\s+/).filter(Boolean).length;
 const links=[...html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>/gi)].map(x=>x[1]);
 const sourceCount=(item.citations||[]).length;
 const image=meta(html,'property','og:image');const twimage=meta(html,'name','twitter:image');
 const record={kind,route,title,titleChars:title.length,description:desc,descriptionChars:desc.length,
  h1:h1[0],h1Count:h1.length,words,sourceCount,
  internalLinks:links.filter(x=>x.startsWith('/impact/')).length,
  projectImage:!!item.image,actorWebsite:!!item.website,
  ogImage:image};
 report.records.push(record);
 if(!title)error(route,'missing_title','');
 if(!desc)error(route,'missing_description','');
 if(h1.length!==1)error(route,'h1_count',h1.length);
 if(canon.length!==1||!canon[0].includes('href="'+origin+route+'"'))error(route,'canonical',canon.length);
 if(!dataOk||scripts.length!==2)error(route,'json_ld',scripts.length);
 if(!html.includes('lang="en"'))error(route,'language','');
 if(!html.includes('index,follow'))error(route,'indexability','');
 if(links.some(x=>x.startsWith('/impact/')&&!x.endsWith('/')&&!x.includes('#')&&!x.includes('?')))error(route,'redirecting_internal_link','');
 if(title.length>75)opportunity(route,'long_title',title.length);
 if(desc.length>180)opportunity(route,'long_description',desc.length);
 if(desc.length<70)opportunity(route,'short_description',desc.length);
 if(words<150&&kind!=='home')opportunity(route,'short_source_text',words);
 if(image&&!image.startsWith('https://'))opportunity(route,'relative_og_image',image);
 if(twimage&&!twimage.startsWith('https://'))opportunity(route,'relative_twitter_image',twimage);
 if(kind==='project'&&!item.image)opportunity(route,'unlicensed_or_missing_project_image','');
 if(kind==='actors'&&!item.website)opportunity(route,'actor_official_url_missing','');
 if(kind==='issue'&&!(item.claims||[]).length)opportunity(route,'issue_primary_evidence_missing','');
 if(kind==='solution'&&!(item.claims||[]).length)opportunity(route,'solution_primary_evidence_missing','');
 if(!titles.has(title))titles.set(title,[]);titles.get(title).push(route);
 if(!descs.has(desc))descs.set(desc,[]);descs.get(desc).push(route);
}
for(const [s,list] of titles)if(list.length>1)for(const p of list)error(p,'duplicate_title',list);
for(const [s,list] of descs)if(list.length>1)for(const p of list)opportunity(p,'duplicate_description',list);
const counts={};for(const a of report.opportunities)counts[a.category]=(counts[a.category]||0)+1;
report.summary={expected:routes.length,tested:report.records.length,technicalErrors:report.technical.length,
 editorialOpportunities:report.opportunities.length,byCategory:counts,
 longestDescriptions:report.records.toSorted((a,b)=>b.descriptionChars-a.descriptionChars).slice(0,6).map(x=>({url:x.route,chars:x.descriptionChars})),
 shortestContent:report.records.toSorted((a,b)=>a.words-b.words).slice(0,12).map(x=>({url:x.route,words:x.words}))};
fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/impact-deep-seo-audit.json',JSON.stringify(report,null,2));
const cols=['kind','route','title','titleChars','descriptionChars','words','sourceCount','internalLinks','projectImage','actorWebsite'];
fs.writeFileSync('artifacts/impact-deep-seo-audit.csv',[cols.join(','),...report.records.map(r=>cols.map(k=>'"'+String(r[k]??'').replaceAll('"','""')+'"').join(','))].join('\n'));
console.log('IMPACT_DEEP_SEO_AUDIT '+JSON.stringify({summary:report.summary,errors:report.technical.slice(0,14)},null,2));
if(report.technical.length)process.exitCode=1;