const ORIGIN = "https://4planet-05.pages.dev";

const RESERVED = new Set([
  "labs","os","story","domains","missions","atlas","species","lens","food","s4piens","4sapien",
  "impact","checkout","join","people","brands","partners","actors","get-involved","funders",
  "living-systems","reports","about","magazine","stories","privacy","culture","m","marketplace",
  "store","cart","members","ambassadors","portal","sponsors","oce4n","e4rth","4culture","system","404"
]);
const ASSET_PREFIXES = ["/assets/","/api/","/fonts/","/images/","/icons/","/static/","/data/","/media/","/.well-known/"];

function isAssetPath(path) {
  if (ASSET_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  if (["/favicon.ico","/robots.txt","/sitemap.xml","/manifest.webmanifest"].includes(path)) return true;
  const last = path.split("/").pop() || "";
  return last.includes(".");
}
function firstSegment(path) { return path.split("/").filter(Boolean)[0] || ""; }
function redirectTo(url, status = 308) { return Response.redirect(url, status); }
function atlasClean(path) {
  if (path === "/atlas" || path === "/atlas/") return "/";
  if (path.startsWith("/atlas/")) return path.slice(6) || "/";
  return path;
}
function speciesClean(path) {
  if (path === "/species" || path === "/species/") return "/";
  if (path.startsWith("/species/")) return path.slice(8) || "/";
  return path;
}
function withTrailingSlash(path) {
  return path.endsWith("/") ? path : `${path}/`;
}

function edgeShim(product) {
  return `(() => {
    const PRODUCT=${JSON.stringify(product)};
    const np=history.pushState.bind(history), nr=history.replaceState.bind(history);
    const RESERVED=new Set(${JSON.stringify([...RESERVED])});
    const first=p=>p.split('/').filter(Boolean)[0]||'';
    const toInternal=p=>PRODUCT==='species'
      ? (p==='/'?'/species':(p==='/species'||p.startsWith('/species/')?p:'/species'+p))
      : (p==='/'?'/atlas':(p==='/atlas'||p.startsWith('/atlas/')?p:p));
    const toClean=p=>{
      if(PRODUCT==='species'){
        if(p==='/species'||p==='/species/') return '/';
        if(p.startsWith('/species/')) return p.slice(8)||'/';
      }else{
        if(p==='/atlas'||p==='/atlas/') return '/';
        if(p.startsWith('/atlas/')) return p.slice(6)||'/';
      }
      return p;
    };
    const external=u=>{
      const p=u.pathname;
      if(PRODUCT==='species'){
        if(p==='/atlas'||p.startsWith('/atlas/')) return 'https://4planetatlas.com'+(p==='/atlas'?'/':(p.slice(6)||'/'))+u.search+u.hash;
        if(!(p==='/species'||p.startsWith('/species/'))&&RESERVED.has(first(p))) return 'https://4planet.org'+p+u.search+u.hash;
      }else{
        if(p==='/species'||p.startsWith('/species/')) return 'https://4species.com'+(p==='/species'?'/':(p.slice(8)||'/'))+u.search+u.hash;
        if(!(p==='/atlas'||p.startsWith('/atlas/'))&&RESERVED.has(first(p))) return 'https://4planet.org'+p+u.search+u.hash;
      }
      return null;
    };
    const clean=()=>{const p=toClean(location.pathname);if(p!==location.pathname)nr(history.state,'',p+location.search+location.hash)};
    const initial=toInternal(location.pathname);
    if(initial!==location.pathname)nr(history.state,'',initial+location.search+location.hash);
    history.pushState=function(s,t,u){
      if(u!=null){const x=new URL(u,location.href),e=external(x);if(e){location.assign(e);return;}}
      const r=np(s,t,u);queueMicrotask(clean);return r;
    };
    history.replaceState=function(s,t,u){
      if(u!=null){const x=new URL(u,location.href),e=external(x);if(e){location.replace(e);return;}}
      const r=nr(s,t,u);queueMicrotask(clean);return r;
    };
    addEventListener('popstate',()=>{
      const p=toInternal(location.pathname);
      if(p!==location.pathname)nr(history.state,'',p+location.search+location.hash);
      queueMicrotask(clean);
    },true);
    addEventListener('DOMContentLoaded',clean,{once:true});
  })();`;
}

async function proxy(request, targetPath, product) {
  const incoming = new URL(request.url);
  const target = new URL(ORIGIN);
  target.pathname = withTrailingSlash(targetPath);
  target.search = incoming.search;
  const response = await fetch(new Request(target.toString(), request), { redirect: "manual" });
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  return new HTMLRewriter()
    .on("head", { element(el) { el.prepend(`<script>${edgeShim(product)}</script>`, { html: true }); } })
    .transform(response);
}
async function proxyAsset(request) {
  const incoming = new URL(request.url);
  const target = new URL(ORIGIN);
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  return fetch(new Request(target.toString(), request));
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;

    if (host === "4planet.org") {
      if (path === "/atlas" || path.startsWith("/atlas/")) return redirectTo(`https://4planetatlas.com${atlasClean(path)}${url.search}`);
      if (path === "/species" || path.startsWith("/species/")) return redirectTo(`https://4species.com${speciesClean(path)}${url.search}`);
      return fetch(request);
    }
    if (host === "www.4planetatlas.com") return redirectTo(`https://4planetatlas.com${path}${url.search}`);
    if (host === "www.4species.com") return redirectTo(`https://4species.com${path}${url.search}`);

    if (host === "4planetatlas.com") {
      if (path === "/atlas" || path.startsWith("/atlas/")) return redirectTo(`https://4planetatlas.com${atlasClean(path)}${url.search}`);
      if (path === "/species" || path.startsWith("/species/")) return redirectTo(`https://4species.com${speciesClean(path)}${url.search}`);
      if (isAssetPath(path)) return proxyAsset(request);
      if (path !== "/") return redirectTo(`https://4planet.org${path}${url.search}`);
      return proxy(request, "/atlas", "atlas");
    }

    if (host === "4species.com") {
      if (path === "/species" || path.startsWith("/species/")) return redirectTo(`https://4species.com${speciesClean(path)}${url.search}`);
      if (path === "/atlas" || path.startsWith("/atlas/")) return redirectTo(`https://4planetatlas.com${atlasClean(path)}${url.search}`);
      if (isAssetPath(path)) return proxyAsset(request);
      if (RESERVED.has(firstSegment(path))) return redirectTo(`https://4planet.org${path}${url.search}`);
      const internalPath = path === "/" ? "/species" : `/species${path}`;
      return proxy(request, internalPath, "species");
    }

    return fetch(request);
  }
};
