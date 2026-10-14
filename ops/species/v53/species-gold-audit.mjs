import fs from "node:fs";
import assert from "node:assert/strict";

/**
 * SPECIES Gold Audit — read-only against the existing public v53 Claude pages.
 * This is QA, NOT a new source registry, species DB, or approval workflow.
 * Exit 0 if audit executes. REVIEWED publication requires independent scientific,
 * rights and visual review; an automated fetch cannot confer GOLD.
 */
const ORIGIN="https://4species.com";
const slugs=["orca","african-savanna-elephant","asian-elephant","bald-eagle","black-rhinoceros",
"blue-whale","bornean-orangutan","cheetah","chimpanzee","emperor-penguin","giant-panda",
"giraffe","gray-wolf","great-white-shark","green-sea-turtle","hippopotamus","jaguar",
"lion","monarch-butterfly","polar-bear","tiger"];
const out={checkedAt:new Date().toISOString(),site:ORIGIN,
 note:"Diagnostics only; NO scientific/photo-rights Gold conclusion is implied.",
 species:[],externalSources:[],searchBots:[],sitemap:null,summary:{}};

const timeout=(ms=12000)=>AbortSignal.timeout(ms);
const request=async (url,init={})=>{
  try{
    const response=await fetch(url,{redirect:"follow",signal:timeout(16000),...init});
    const text=await response.text();return {status:response.status,url:response.url,type:response.headers.get("content-type"),text};
  }catch(e){return {status:null,error:String(e).slice(0,150),url,text:""}}
};
const objwalk=(node,fn)=>{
  if(Array.isArray(node)){node.forEach(x=>objwalk(x,fn));return;}
  if(node&&typeof node==="object"){
    if(node.source&&typeof node.source==="object"&&node.source.url)fn(node.source);
    Object.values(node).forEach(x=>objwalk(x,fn));
  }
};

const srcs=new Map();
for(const slug of slugs){
 const [p,h]=await Promise.all([
  request(ORIGIN+"/species-data/v1/"+slug+".json"),
  request(ORIGIN+"/"+slug)
 ]);
 const record={slug,dataHttp:p.status,htmlHttp:h.status};
 if(p.status!==200||h.status!==200){record.blocker="DATA_OR_HTML_NOT_200";out.species.push(record);continue;}
 try{
  const page=JSON.parse(p.text);
  const sources=[];objwalk(page,s=>sources.push(s));
  const unique=[...new Set(sources.map(s=>s.url))];
  for(const url of unique)srcs.set(url,{url,example:slug,count:(srcs.get(url)?.count||0)+1});
  const robot=(h.text.match(/<meta\s+name="robots"[^>]*content="([^"]*)"/i)||h.text.match(/<meta[^>]*content="([^"]*)"[^>]*name="robots"/i)||[])[1]||null;
  const canon=(h.text.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)||[])[1]||null;
  const og=(h.text.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)||[])[1]||null;
  const alt=(h.text.match(/<meta\s+property="og:image:alt"\s+content="([^"]+)"/i)||[])[1]||null;
  const jsonld=[...h.text.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>{try{return JSON.parse(m[1])["@type"]||"UNKNOWN"}catch{return "INVALID"}});
  Object.assign(record,{
   sci:page.identity?.scientificName,common:page.identity?.commonName,
   review:page.provenance?.review, hero:typeof page.hero==="string"?page.hero:"FILE_LEVEL_MEDIA_CANDIDATE",
   claimsWithSource:sources.length, uniqueExternalSourceUrls:unique.length,sourceUrls:unique,
   robot,canonical:canon,ogImage:og,ogAlt:alt,jsonldTypes:jsonld,
   knownMissingRights:page.hero==="auto",lackIndependentSourceReview:unique.length<2,
   canonMismatch:canon!==ORIGIN+"/"+slug,
   genericOG:!og||og.endsWith("/og.png"),
   serverNoindex:robot?.includes("noindex")||false,
   sourceReviewBlocked:page.provenance?.review!=="REVIEWED"
  });
 }catch(e){record.blocker="MALFORMED_SPECIES_PAGE_"+String(e).slice(0,120)}
 out.species.push(record);
 console.log("SPECIES_GOLD_ROW",slug,"http",record.htmlHttp,"claims",record.claimsWithSource??0,"unique_sources",record.uniqueExternalSourceUrls??0,"hero",record.hero,"review",record.review,"generic_og",record.genericOG,"canonical_ok",record.canonMismatch===false);
}

const sources=[...srcs.values()];
for(let i=0;i<sources.length;i+=5){
 const segment=sources.slice(i,i+5);
 const result=await Promise.all(segment.map(async x=>{
   const r=await request(x.url,{method:"HEAD",headers:{"User-Agent":"4PLANET-SPECIES-QA/1.0 (+https://4species.com/)" }});
   return {...x,http:r.status,finalUrl:r.url,error:r.error??null,classification:r.status==null?"UNKNOWN_NETWORK":r.status===403||r.status===429?"BOT_BLOCK_NOT_BROKEN":r.status>=400?"REVIEW_BROKEN_OR_MOVED":"REACHABLE"};
 }));
 out.externalSources.push(...result);
}
for(const bot of ["Googlebot","bingbot","OAI-SearchBot","PerplexityBot","Claude-SearchBot"]){
 const r=await request(ORIGIN+"/orca",{headers:{"User-Agent":bot}});
 const robot=await request(ORIGIN+"/robots.txt",{headers:{"User-Agent":bot}});
 out.searchBots.push({agent:bot,pageHttp:r.status,robotsHttp:robot.status,htmlHasOrca:r.text.includes("Orcinus orca"),hasSitemap:/sitemap\.xml/.test(robot.text)});
 console.log("SPECIES_BOT_ACCESS",bot,"status",r.status,"body",r.text.includes("Orcinus orca"),"robots",robot.status);
}
const map=await request(ORIGIN+"/sitemap.xml");
const sitemapUrls=[...map.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
out.sitemap={http:map.status,total:sitemapUrls.length,speciesMissing:slugs.filter(x=>!sitemapUrls.includes(ORIGIN+"/"+x)),duplicates:sitemapUrls.length-new Set(sitemapUrls).size};
const unknown=await request(ORIGIN+"/a-made-up-species-name-20261014");
out.unknownSpecies={http:unknown.status,containsDefaultPage:unknown.text.includes("4PLANET SPECIES"),soft404Risk:unknown.status===200};
out.summary={
  checkedKnownSpecies:out.species.length,
  non200:out.species.filter(s=>s.blocker).length,
  insufficientIndependentSourcePages:out.species.filter(s=>s.lackIndependentSourceReview).length,
  draftOrUnreviewed:out.species.filter(s=>s.sourceReviewBlocked).length,
  automaticImageSelection:out.species.filter(s=>s.knownMissingRights).length,
  defaultOrMissingOGImage:out.species.filter(s=>s.genericOG).length,
  badCanonical:out.species.filter(s=>s.canonMismatch).length,
  uniqueSourceDocuments:sources.length,
  sourceHeadIssues:out.externalSources.filter(s=>s.classification==="REVIEW_BROKEN_OR_MOVED").length,
  sourceBot403Or429:out.externalSources.filter(s=>s.classification==="BOT_BLOCK_NOT_BROKEN").length,
  unknownStatus:unknown.status
};
fs.mkdirSync("qa-output",{recursive:true});
fs.writeFileSync("qa-output/species-gold-20261014.json",JSON.stringify(out,null,2));
console.log("SPECIES_GOLD_AUDIT_SUMMARY",JSON.stringify(out.summary));
console.log("SPECIES_GOLD_GATES",JSON.stringify({sourceGold:out.summary.draftOrUnreviewed===0&&out.summary.insufficientIndependentSourcePages===0,photoGold:out.summary.automaticImageSelection===0,seoGold:out.summary.non200===0&&out.summary.badCanonical===0&&out.sitemap.speciesMissing.length===0,overallGold:false}));
