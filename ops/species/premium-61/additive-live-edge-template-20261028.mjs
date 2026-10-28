/**
 * Bounded 4SPECIES append-only production route overlay.
 * It NEVER overwrites 4species-router's existing custom-domain deployment.
 * Original 57 profiles and all non-target URLs are owned by original Worker.
 * Exact immutable noindex Pages staging origin is injected AFTER full QA.
 */
const ORIGIN = "__IMMUTABLE_PAGES_PREVIEW__";
const ADDITIONS = ["atlas-moth","peacock-spider","emperor-scorpion","dragon-blood-tree"];
const ADD = new Set(ADDITIONS);
const PUBLIC = "https://4species.com";
function clean(input,output={}) {
 const h=new Headers(input);
 h.delete("x-robots-tag");
 h.delete("set-cookie");
 h.delete("content-security-policy-report-only");
 h.set("cache-control","public, max-age=180, must-revalidate");
 h.set("x-4species-additive-release","four-premium-20261028");
 for(const [k,v] of Object.entries(output))h.set(k,v);
 return h;
}
async function upstream(path){
 return fetch(ORIGIN+path,{redirect:"follow"});
}
export default {
 async fetch(request){
  const u=new URL(request.url),path=u.pathname;
  if(u.hostname!=="4species.com" || (request.method!=="GET"&&request.method!=="HEAD"))return new Response("Not Found",{status:404});
  const head=request.method==="HEAD", slug=path.slice(1);
  if(ADD.has(slug)&&path==="/"+slug){
   const res=await upstream(path);
   if(res.status!==200 || !(res.headers.get("content-type")||"").includes("text/html"))return new Response("Immutable page unavailable",{status:503,headers:{"cache-control":"no-store","x-robots-tag":"noindex"}});
   const html=await res.text();
   if(!html.includes("https://4species.com"+path)||!html.includes("<h1")||/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html))return new Response("Candidate HTML not public ready",{status:503,headers:{"cache-control":"no-store","x-robots-tag":"noindex"}});
   return new Response(head?null:html,{status:200,headers:clean(res.headers,{"content-type":"text/html; charset=utf-8","x-robots-tag":"index,follow,max-image-preview:large"})});
  }
  const data=path.match(/^\/species-data\/v1\/([a-z0-9-]+)\.json$/);
  if(data&&ADD.has(data[1])){
   const res=await upstream(path);
   if(res.status!==200)return new Response("Candidate data unavailable",{status:503,headers:{"cache-control":"no-store"}});
   const raw=await res.text();let p;
   try{p=JSON.parse(raw)}catch{return new Response("Invalid JSON",{status:503})}
   if(p.slug!==data[1]||p.schema!=="4PLANET_SPECIES_PAGE_01"||!p.identity?.scientificName||p.provenance?.founderRelease!=="PREMIUM_V1_2026-10-22"||(p.gallery||[]).length||!p.hero?.credit||!p.hero?.licence||!p.hero?.sourcePage)return new Response("Candidate source verification failed",{status:503});
   return new Response(head?null:raw,{status:200,headers:clean(res.headers,{"content-type":"application/json; charset=utf-8"})});
  }
  if(path.startsWith("/assets/")){
   // The new bundle/approved first-party hero are fetched from the immutable
   // candidate Pages origin; anything absent delegates to CURRENT LIVE Worker.
   const res=await upstream(path+u.search);
   if(res.status===200)return new Response(head?null:res.body,{status:200,headers:clean(res.headers)});
   return fetch(request);
  }
  if(path==="/sitemap.xml"){
   // Current production sitemap is read from unmodified original Worker.
   const old=await fetch(request);
   if(!old.ok)return old;
   const xml=await old.text();
   const existing=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
   if(existing.length!==62||new Set(existing).size!==62||!xml.includes("</urlset>")||ADDITIONS.some(s=>existing.includes(PUBLIC+"/"+s)))return new Response("Sitemap drift, fail closed",{status:503,headers:{"cache-control":"no-store"}});
   const add=ADDITIONS.map(s=>"<url><loc>"+PUBLIC+"/"+s+"</loc></url>").join("\n");
   return new Response(head?null:xml.replace("</urlset>",add+"\n</urlset>"),{status:200,headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public,max-age=180,must-revalidate","x-4species-additive-release":"four-premium-20261028"}});
  }
  return fetch(request);
 }
};
