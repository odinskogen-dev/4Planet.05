/**
 * Pinned, append-only NEXT FIVE premium source worker.
 * This is a NEW script, not a replacement for the original 4species-router.
 * The four already released candidate exact-path Worker routes remain on
 * 4species-premium-61-additive-20261028 with the original b095 Pages.
 * 
 * It assumes:
 * - exact new HTML/JSON routes are attached to this Worker only;
 * - existing /assets/* and /sitemap.xml routes are atomically reassigned
 *   to this Worker after independent release preflight, with rollback.
 */
const ORIGINAL_CLAUDE_ORIGIN="https://b0951128.4planet-05.pages.dev";
const NEW_SIGNED_ORIGIN="https://a8010871.4planet-05.pages.dev";
const PUBLIC="https://4species.com";
const OLD_ADDED=["atlas-moth","peacock-spider","emperor-scorpion","dragon-blood-tree"];
const NEW_ADDED=["clouded-leopard","sea-otter","snowy-owl","indian-peafowl","coconut-crab"];
const NEW_SET=new Set(NEW_ADDED);
const ALL_ADDED=[...OLD_ADDED,...NEW_ADDED];
function cleaned(headers,extra={}){
 const out=new Headers(headers);
 out.delete("x-robots-tag");
 out.delete("set-cookie");
 out.delete("content-security-policy-report-only");
 out.set("cache-control","public, max-age=180, must-revalidate");
 out.set("x-4species-additive-release","nine-premium-20261029");
 for(const [k,v] of Object.entries(extra))out.set(k,v);
 return out;
}
async function from(origin,path){return fetch(origin+path,{redirect:"follow"})}
function assetTypeAccept(path,response){
 if(!response.ok)return false;
 const e=path.split(".").at(-1).toLowerCase(),t=(response.headers.get("content-type")||"").toLowerCase();
 if(["js","mjs"].includes(e))return t.includes("javascript");
 if(e==="css")return t.includes("text/css");
 if(["jpg","jpeg","webp","png","avif","svg","gif"].includes(e))return t.includes("image/");
 if(["woff","woff2","ttf","otf"].includes(e))return t.includes("font/")||t.includes("octet-stream");
 return false;
}
export default {
 async fetch(request){
  const u=new URL(request.url),p=u.pathname,head=request.method==="HEAD";
  if(u.hostname!=="4species.com")return new Response("Not found",{status:404});
  if(!["GET","HEAD"].includes(request.method))
   return new Response("Method not allowed",{status:405,headers:{allow:"GET, HEAD"}});
  const slug=p.startsWith("/")?p.slice(1):"";
  if(NEW_SET.has(slug)&&p==="/"+slug){
   const r=await from(NEW_SIGNED_ORIGIN,p);
   if(r.status!==200||!(r.headers.get("content-type")||"").includes("text/html"))
    return new Response("Not yet ready",{status:503,headers:{"x-robots-tag":"noindex","cache-control":"no-store"}});
   const body=await r.text();
   if(!body.includes('https://4species.com/'+slug)||!body.includes("<h1")||
      /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(body))
    return new Response("Unsafe draft page",{status:503,headers:{"x-robots-tag":"noindex","cache-control":"no-store"}});
   return new Response(head?null:body,{status:200,headers:cleaned(r.headers,{"content-type":"text/html; charset=utf-8","x-robots-tag":"index,follow,max-image-preview:large"})});
  }
  const m=p.match(/^\/species-data\/v1\/([a-z0-9-]+)\.json$/);
  if(m&&NEW_SET.has(m[1])){
   const r=await from(NEW_SIGNED_ORIGIN,p);
   if(r.status!==200)return new Response("Missing source",{status:503,headers:{"cache-control":"no-store"}});
   const text=await r.text();let page;
   try{page=JSON.parse(text)}catch{return new Response("Invalid JSON",{status:503})}
   if(page.schema!=="4PLANET_SPECIES_PAGE_01"||page.slug!==m[1]||!page.identity?.scientificName||
      page.provenance?.founderRelease!=="PREMIUM_V1_2026-10-28_CANDIDATE_ONLY"||
      !page.hero?.url?.startsWith(PUBLIC+"/assets/species/next61/")||
      !page.hero?.credit||!page.hero?.licence||!page.hero?.sourcePage||
      (page.gallery||[]).length)
    return new Response("Species evidence gate failed",{status:503,headers:{"cache-control":"no-store"}});
   return new Response(head?null:text,{status:200,headers:cleaned(r.headers,{"content-type":"application/json; charset=utf-8"})});
  }
  if(p.startsWith("/assets/")){
   // Preserve old first-party bytes and MIME exactly when available.
   const original=await fetch(request);
   if(assetTypeAccept(p,original))return original;
   // Existing four immutable photo and compiled asset identities take
   // precedence; the new preview may add assets, never replace old ones.
   for(const origin of [ORIGINAL_CLAUDE_ORIGIN,NEW_SIGNED_ORIGIN]){
    const r=await from(origin,p+u.search);
    if(assetTypeAccept(p,r))
      return new Response(head?null:r.body,{status:200,headers:cleaned(r.headers)});
   }
   return new Response("Asset not found",{status:404,headers:{"x-robots-tag":"noindex","cache-control":"no-store"}});
  }
  if(p==="/sitemap.xml"){
   const original=await fetch(request);
   if(original.status!==200)return new Response("Base sitemap unavailable",{status:503,headers:{"cache-control":"no-store"}});
   const xml=await original.text();
   const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
   if(urls.length!==62||new Set(urls).size!==62||!xml.includes("</urlset>")||
      ALL_ADDED.some(s=>urls.includes(PUBLIC+"/"+s)))
    return new Response("Sitemap baseline drift",{status:503,headers:{"cache-control":"no-store"}});
   const entries=ALL_ADDED.map(s=>"<url><loc>"+PUBLIC+"/"+s+"</loc></url>").join("\n");
   const body=xml.replace("</urlset>",entries+"\n</urlset>");
   return new Response(head?null:body,{status:200,headers:{
    "content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=180, must-revalidate",
    "x-4species-additive-release":"nine-premium-20261029"
   }});
  }
  return new Response("Not found",{status:404,headers:{"cache-control":"no-store"}});
 }
};
