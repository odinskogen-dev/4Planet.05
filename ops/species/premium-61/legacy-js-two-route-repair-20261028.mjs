/**
 * P0 restoration of JUST TWO exact historical v53 entrypoint JS URLs.
 * No existing Cloudflare Worker is overwritten; two exact path Routes
 * supersede /assets/* and can be deleted for immediate rollback.
 * Original Koala V1 JS bytes come from immutable Claude Pages snapshot;
 * original39 missing JS path is mapped to independently browser-tested
 * rebuilt original Claude v53 compatible entrypoint bytes.
 */
const JS = new Map([
 ["/assets/index-DLiHR8tZ.js","https://72494005.4planet-05.pages.dev/assets/index-DLiHR8tZ.js"],
 ["/assets/index-DJRRK0k4.js","https://b0951128.4planet-05.pages.dev/assets/index-B-Sfe1QA.js"],
]);
export default {
 async fetch(request) {
   const url = new URL(request.url);
   if (url.hostname!=="4species.com" || !JS.has(url.pathname))
     return new Response("Not Found", {status:404,headers:{"cache-control":"no-store"}});
   if (request.method!=="GET" && request.method!=="HEAD")
     return new Response("Method Not Allowed",{status:405,headers:{allow:"GET, HEAD"}});
   const source=JS.get(url.pathname);
   const upstream=await fetch(source,{redirect:"follow",headers:{accept:"application/javascript"}});
   if (!upstream.ok || !(upstream.headers.get("content-type")||"").toLowerCase().includes("javascript"))
     return new Response("Verified original entrypoint unavailable",{status:503,headers:{"cache-control":"no-store","x-robots-tag":"noindex"}});
   const buf=await upstream.arrayBuffer();
   if(buf.byteLength<10000 || buf.byteLength>5000000)
     return new Response("Unexpected original entrypoint size",{status:503,headers:{"cache-control":"no-store"}});
   return new Response(request.method==="HEAD"?null:buf,{
     status:200,
     headers:{
       "content-type":"application/javascript; charset=utf-8",
       "cache-control":"public, max-age=3600, must-revalidate",
       "x-4species-legacy-js-repair":"exact-two-bundles-20261028",
       "x-content-type-options":"nosniff",
       "access-control-allow-origin":"https://4species.com"
     }
   });
 }
};
