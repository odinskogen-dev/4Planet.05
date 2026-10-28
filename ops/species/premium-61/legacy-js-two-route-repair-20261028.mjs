/**
 * Exact two-route repair. Original 57 SSR HTML untouched, original custom
 * domain Worker and first-four additive Worker untouched. Two route IDs
 * are rollback boundary. Only after independent Chromium/WebKit virtual Gold.
 */
const ALLOWED=new Set(["/assets/index-DLiHR8tZ.js","/assets/index-DJRRK0k4.js"]);
const WRAPPER='document.querySelector("#root")?.replaceChildren(); import("/assets/index-B-Sfe1QA.js");';
export default {
  async fetch(request) {
    const u=new URL(request.url);
    if(u.hostname!=="4species.com" || !ALLOWED.has(u.pathname))
      return new Response("Not Found",{status:404,headers:{"cache-control":"no-store"}});
    if(request.method!=="GET"&&request.method!=="HEAD")
      return new Response("Method Not Allowed",{status:405,headers:{allow:"GET, HEAD"}});
    return new Response(request.method==="HEAD"?null:WRAPPER,{
      status:200,
      headers:{"content-type":"application/javascript; charset=utf-8",
               "cache-control":"public, max-age=120, must-revalidate",
               "x-4species-legacy-js-repair":"two-exact-paths-20261028",
               "x-content-type-options":"nosniff"}
    });
  }
};
