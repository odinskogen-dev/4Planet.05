var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ops/discovery/live-workers/cre4tors-prototype.js
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var ORIGIN = "https://b8a8f6c1.4planet-05.pages.dev";
var PRODUCT_MARKER = "cre4tors-v0.3-78cdebc";
var ANALYTICS_PATH = "/_4p-analytics.js";
var ANALYTICS_MARKER = "4PLANET_ANALYTICS_PROXY_V1";
var ANALYTICS_JS = String.raw`(function(){
var KEY="4planet.analytics.consent.v1";
var ID="G-Q79Y9HJRL8";
var DOMAINS=["4planet.org","4planetmagazine.com","s4piens.com","cre4tors.com","4planetmarket.com"];
var HOST=window.location.hostname.toLowerCase().replace(/^www\./,"");
if(DOMAINS.indexOf(HOST)===-1)return;
window.dataLayer=window.dataLayer||[];
window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
var gtag=window.gtag;
gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",wait_for_update:500});
var installed=false,lastPage="";
function pageView(){if(!installed)return;var here=location.pathname+location.search;if(here===lastPage)return;lastPage=here;gtag("event","page_view",{page_title:document.title,page_location:location.href,page_path:here,content_group:HOST==="cre4tors.com"?"cre4tors":HOST==="4planetmarket.com"?"market":HOST==="4planetmagazine.com"?"magazine":HOST==="s4piens.com"?"s4piens":"4planet",site_host:HOST});}
function hookRoutes(){if(window.__4pAnalyticsHistoryHook)return;window.__4pAnalyticsHistoryHook=true;["pushState","replaceState"].forEach(function(name){var original=history[name];history[name]=function(){var result=original.apply(this,arguments);setTimeout(pageView,0);return result;};});addEventListener("popstate",function(){setTimeout(pageView,0);});}
function install(){if(installed)return;installed=true;gtag("set","linker",{domains:DOMAINS,decorate_forms:true});gtag("js",new Date());gtag("config",ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});if(!document.getElementById("4planet-ga4")){var s=document.createElement("script");s.id="4planet-ga4";s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id="+encodeURIComponent(ID);document.head.appendChild(s);}hookRoutes();pageView();}
function update(value){gtag("consent","update",{analytics_storage:value,ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});}
var state=null;try{state=localStorage.getItem(KEY);}catch(e){}
if(state==="granted"){update("granted");install();return;}if(state==="denied"){update("denied");return;}
function choose(value){try{localStorage.setItem(KEY,value);}catch(e){}update(value);var b=document.getElementById("4planet-analytics-consent");if(b)b.remove();if(value==="granted")install();}
function banner(){if(document.getElementById("4planet-analytics-consent"))return;var box=document.createElement("aside");box.id="4planet-analytics-consent";box.setAttribute("role","region");box.setAttribute("aria-label","Analytics preferences");box.style.cssText="position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483647;max-width:760px;margin:0 auto;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;background:#080808;color:#fff;border:1px solid rgba(255,255,255,.2);font:13px/1.45 Arial,sans-serif;box-sizing:border-box";var copy=document.createElement("div");copy.style.maxWidth="500px";copy.textContent="Allow optional usage analytics to help improve 4PLANET. Advertising signals are disabled.";var actions=document.createElement("div");actions.style.cssText="display:flex;gap:8px";var no=document.createElement("button");no.type="button";no.textContent="DECLINE";no.style.cssText="border:1px solid rgba(255,255,255,.45);background:transparent;color:#fff;padding:8px 12px;cursor:pointer";no.onclick=function(){choose("denied");};var yes=document.createElement("button");yes.type="button";yes.textContent="ALLOW";yes.style.cssText="border:1px solid #fff;background:#fff;color:#080808;padding:8px 12px;cursor:pointer";yes.onclick=function(){choose("granted");};actions.appendChild(no);actions.appendChild(yes);box.appendChild(copy);box.appendChild(actions);document.body.appendChild(box);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",banner,{once:true});else banner();
})();`;
function addCspSources(csp, directive, sources) {
  if (!csp) return csp;
  const parts = csp.split(";").map((part) => part.trim()).filter(Boolean);
  let found = false;
  const next = parts.map((part) => {
    const tokens = part.split(/\s+/);
    if (tokens[0] !== directive) return part;
    found = true;
    for (const source of sources) if (!tokens.includes(source)) tokens.push(source);
    return tokens.join(" ");
  });
  if (!found) next.push([directive, ...sources].join(" "));
  return next.join("; ");
}
__name(addCspSources, "addCspSources");
__name2(addCspSources, "addCspSources");
function productHeaders(source, isPublic = false) {
  const headers = new Headers(source);
  if (isPublic) headers.delete("x-robots-tag");
  else headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  headers.set("x-4planet-prototype", PRODUCT_MARKER);
  headers.set("x-4planet-analytics", ANALYTICS_MARKER);
  return headers;
}
__name(productHeaders, "productHeaders");
__name2(productHeaders, "productHeaders");
async function proxy(request) {
  const incoming = new URL(request.url);
  const INDEXNOW_KEY = "8f4c2d91a7b64e3fa1c9d0b6e5274a83";
  if (incoming.pathname === `/${INDEXNOW_KEY}.txt`) return new Response(INDEXNOW_KEY, { status: 200, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" } });
  if (incoming.pathname === "/robots.txt") return new Response("User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /account\nDisallow: /admin\n\nSitemap: https://cre4tors.com/sitemap.xml\n", { status: 200, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=300" } });
  if (incoming.pathname === "/sitemap.xml") return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://cre4tors.com/</loc></url>\n</urlset>\n', { status: 200, headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" } });
  if (incoming.pathname === ANALYTICS_PATH) {
    return new Response(ANALYTICS_JS, { status: 200, headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "no-store", "X-4PLANET-Analytics": ANALYTICS_MARKER } });
  }
  const upstreamUrl = new URL(incoming.pathname + incoming.search, ORIGIN);
  const upstreamRequest = new Request(upstreamUrl.toString(), request);
  upstreamRequest.headers.delete("host");
  const upstream = await fetch(upstreamRequest);
  const isPublicRoot = incoming.pathname === "/" || incoming.pathname === "/index.html";
  const headers = productHeaders(upstream.headers, isPublicRoot);
  if (request.method === "HEAD") return new Response(null, { status: upstream.status, statusText: upstream.statusText, headers });
  const type = upstream.headers.get("content-type") || "";
  if (!type.toLowerCase().includes("text/html")) return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
  let csp = headers.get("content-security-policy") || "";
  if (csp) {
    csp = addCspSources(csp, "script-src", ["https://www.googletagmanager.com"]);
    csp = addCspSources(csp, "connect-src", ["https://www.google-analytics.com", "https://region1.google-analytics.com"]);
    headers.set("content-security-policy", csp);
  }
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");
  let html = await upstream.text();
  if (isPublicRoot) {
    html = html.replace(/<script[^>]+src=["']\/host-indexing-policy\.js["'][^>]*><\/script>/gi, "");
    html = html.replace(/<title>[^<]*<\/title>/i, "<title>CRE4TORS \u2014 Creative Work for a Living Planet</title>");
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="CRE4TORS is an early 4PLANET public prototype exploring creators, culture and work that can create value for people and a living planet.">');
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large">');
    html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, '<meta property="og:title" content="CRE4TORS — Creative Work for a Living Planet">');
    html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, '<meta property="og:description" content="An early 4PLANET public prototype exploring creators, culture and work that can create value for people and a living planet.">');
    html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, '<meta property="og:url" content="https://cre4tors.com/">');
    html = html.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, '<meta name="twitter:title" content="CRE4TORS — Creative Work for a Living Planet">');
    html = html.replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, '<meta name="twitter:description" content="An early 4PLANET public prototype exploring creators, culture and work that can create value for people and a living planet.">');
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");
    html = html.replace(/<\/head>/i, '<link rel="canonical" href="https://cre4tors.com/"><script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"CRE4TORS","url":"https://cre4tors.com/","description":"An early 4PLANET public prototype exploring creators, culture and work that can create value for people and a living planet.","isPartOf":{"@type":"WebSite","name":"4PLANET","url":"https://4planet.org/"}}</script></head>');
    const discoveryFallback = "<main data-public-discovery-fallback=\"1\"><h1>CRE4TORS — Creative Work for a Living Planet</h1><p>CRE4TORS is an early public 4PLANET prototype exploring the role of creators, culture and creative work in a living-planet ecosystem. It is intended to give creative people a clearer place in the wider system rather than treating culture as separate from science, technology, nature and action.</p><p>The product direction includes discovery, creative work, stories and routes into other 4PLANET surfaces. It can connect to MARKET where a real product exists, and to MAGAZINE, missions or Impact where creative work helps people understand and participate.</p><p>This public prototype does not imply that every creator shown is a partner or that every concept is commercially available. Current state, authorship, rights and availability should remain explicit as the product develops.</p><nav aria-label=\"Related public products\"><a href=\"https://4planet.org/\">4PLANET</a> · <a href=\"https://4planetmarket.com/\">MARKET</a> · <a href=\"https://4planetmagazine.com/magazine/\">MAGAZINE</a></nav></main>";
    html = html.replace('<div id="root"></div>', '<div id="root">' + discoveryFallback + '</div>');
  }
  const tag = '<script src="' + ANALYTICS_PATH + '" defer><\/script>';
  if (!html.includes(ANALYTICS_PATH)) html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, tag + "</body>") : html + tag;
  return new Response(html, { status: upstream.status, statusText: upstream.statusText, headers });
}
__name(proxy, "proxy");
__name2(proxy, "proxy");
var cre4tors_default = { async fetch(request) {
  return proxy(request);
} };
export {
  cre4tors_default as default
};
//# sourceMappingURL=cre4tors-prototype.js.map
