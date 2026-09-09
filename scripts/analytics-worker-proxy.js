const ORIGIN = "__4P_ORIGIN__";
const PRODUCT_MARKER = "__4P_MARKER__";
const ANALYTICS_PATH = "/_4p-analytics.js";
const ANALYTICS_MARKER = "4PLANET_ANALYTICS_PROXY_V1";

const ANALYTICS_JS = String.raw`(function(){
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

function productHeaders(source) {
  const headers = new Headers(source);
  headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  headers.set("x-4planet-prototype", PRODUCT_MARKER);
  headers.set("x-4planet-analytics", ANALYTICS_MARKER);
  return headers;
}

async function proxy(request) {
  const incoming = new URL(request.url);
  if (incoming.pathname === ANALYTICS_PATH) {
    return new Response(ANALYTICS_JS, {status:200,headers:{"Content-Type":"application/javascript; charset=utf-8","Cache-Control":"no-store","X-4PLANET-Analytics":ANALYTICS_MARKER}});
  }
  const upstreamUrl = new URL(incoming.pathname + incoming.search, ORIGIN);
  const upstreamRequest = new Request(upstreamUrl.toString(), request);
  upstreamRequest.headers.delete("host");
  const upstream = await fetch(upstreamRequest);
  const headers = productHeaders(upstream.headers);
  if (request.method === "HEAD") return new Response(null,{status:upstream.status,statusText:upstream.statusText,headers});
  const type = upstream.headers.get("content-type") || "";
  if (!type.toLowerCase().includes("text/html")) return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
  let csp = headers.get("content-security-policy") || "";
  if (csp) {
    csp = addCspSources(csp,"script-src",["https://www.googletagmanager.com"]);
    csp = addCspSources(csp,"connect-src",["https://www.google-analytics.com","https://region1.google-analytics.com"]);
    headers.set("content-security-policy",csp);
  }
  headers.delete("content-length");headers.delete("content-encoding");headers.delete("etag");
  let html = await upstream.text();
  const tag = '<script src="' + ANALYTICS_PATH + '" defer></script>';
  if (!html.includes(ANALYTICS_PATH)) html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, tag + "</body>") : html + tag;
  return new Response(html,{status:upstream.status,statusText:upstream.statusText,headers});
}

export default { async fetch(request) { return proxy(request); } };
