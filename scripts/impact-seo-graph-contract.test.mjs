import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import {renderImpactRoutes,impactSitemapRoutes} from "./prerender-impact-seo.mjs";
const data=JSON.parse(fs.readFileSync("src/data/impactDiscovery.json","utf8"));
const pages=new Map();
const origin="https://4planet.org";
const esc=(v="")=>String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const indexable=(data.solutions||[]).filter(x=>x.indexable===true);
renderImpactRoutes({impactDiscovery:data,origin,esc,
 pageHtml:p=>'<html><head><link rel="canonical" href="'+origin+p.pathName+'"><script type="application/ld+json">'+JSON.stringify(p.jsonLd)+'</script></head><body>'+p.body+'</body></html>',
 writeRoute:(p,h)=>pages.set(p.endsWith("/")?p:p+"/",h)});
test("all source-grounded public IMPACT entities are crawlable and internally linked",()=>{
 const expected=1+data.projects.length+data.actors.length+data.issues.length+indexable.length;
 assert.equal(pages.size,expected);
 const sitemap=impactSitemapRoutes(data);
 assert.equal(new Set(sitemap).size,expected-1);
 for(const [path,html] of pages){
   assert.match(html,/<h1>/,"missing H1 "+path);
   assert.ok(html.includes('href="'+origin+path+'"'),"wrong canonical "+path);
   assert.match(html,/aria-label="Breadcrumb"/,"no breadcrumbs "+path);
   const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(x=>JSON.parse(x[1]));
   assert.equal(schemas.length,2,"JSONLD graph count "+path);
   assert.equal(schemas[1]["@type"],"BreadcrumbList");
   assert.equal(schemas[1].itemListElement.at(-1).item,origin+path);
   if(path!=="/impact/") assert.ok(sitemap.includes(path));
 }
 const home=pages.get("/impact/");
 for(const s of indexable)assert.ok(home.includes('href="/impact/solution/'+s.slug+'/"'),"orphan solution "+s.slug);
 for(const p of data.projects){
   const html=pages.get("/impact/project/"+p.slug+"/");
   assert.ok(html.includes("No 4PLANET partnership"));
   assert.ok(html.includes("What the sources establish"));
   for(const actor of p.actors||[])assert.ok(html.includes("/impact/actors/"+actor.slug+"/"),"missing actor "+p.slug);
   for(const issue of p.issues||[])assert.ok(html.includes("/impact/issue/"+issue.slug+"/"),"missing problem "+p.slug);
   for(const method of p.solutions||[])if(indexable.some(s=>s.slug===method.slug))assert.ok(html.includes('href="/impact/solution/'+method.slug+'/"'),"missing method "+p.slug);
 }
 for(const a of data.actors)for(const slug of a.projects||[])if(data.projects.some(p=>p.slug===slug))assert.ok(pages.get("/impact/actors/"+a.slug+"/").includes("/impact/project/"+slug+"/"));
});
