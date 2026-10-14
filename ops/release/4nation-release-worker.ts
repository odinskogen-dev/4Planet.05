import { dispatchReleaseApi } from "./api-dispatch";
// 4NATION: host-only public origin for the exact tested Pages artifact.
const IMMUTABLE_ORIGIN = "__STATIC_ORIGIN__";
const SOURCE_SHA = "__SOURCE_SHA__";
const INDEXNOW_KEY = "8f4c2d91a7b64e3fa1c9d0b6e5274a83";
const ALLOWED = new Set(["4nation.org", "www.4nation.org"]);

// Indexable Country Objects (reviewed launch set). Other countries render but stay noindex.
const FEATURED = { norway: "Norway", brazil: "Brazil", japan: "Japan", kenya: "Kenya" };
function pageMeta(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const url = "https://4nation.org" + (path === "/" ? "/" : path);
  const site = { "@type": "WebSite", name: "4PLANET", url: "https://4planet.org/" };
  const m = path.match(/^\/country\/([a-z0-9-]+)$/);
  if (m) {
    const name = FEATURED[m[1]] || m[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { url, index: Boolean(FEATURED[m[1]]), h1: name + " — country profile",
      title: name + " — country profile · 4NATION",
      description: "Understand " + name + ": people, land, economy, learning, nature and heritage. Every figure dated and linked to its source — World Bank via UNESCO, UNESCO, Natural Earth.",
      ld: { "@context": "https://schema.org", "@type": "WebPage", name: name + " — country profile", url, isPartOf: site, about: { "@type": "Country", name } } };
  }
  const cmp = path.match(/^\/compare\/([a-z0-9-]+)-vs-([a-z0-9-]+)$/);
  if (cmp) {
    const nm = (x) => FEATURED[x] || x.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const t = nm(cmp[1]) + " and " + nm(cmp[2]) + " compared · 4NATION";
    return { url, index: false, h1: t, title: t, description: "Two countries side by side at the same scale, from the same sources, with every year shown.",
      ld: { "@context": "https://schema.org", "@type": "WebPage", name: t, url, isPartOf: site } };
  }
  if (path === "/decisions" || path.startsWith("/decisions/")) {
    return { url: "https://4nation.org/decisions", index: true, h1: "Public decisions — 4NATION",
      title: "Public decisions · 4NATION",
      description: "Important public choices read from the original documents: what is proposed, decided and implemented, by whom, and what has changed.",
      ld: { "@context": "https://schema.org", "@type": "WebPage", name: "Public decisions", url: "https://4nation.org/decisions", isPartOf: site } };
  }
  return { url: "https://4nation.org/", index: path === "/", h1: "4NATION — Understand any country",
    title: "4NATION — Understand any country",
    description: "Source-backed country profiles: people, land, economy, nature and heritage, with every number dated and sourced. Nonpartisan. From 4PLANET.",
    ld: { "@context": "https://schema.org", "@type": "WebApplication", name: "4NATION", url: "https://4nation.org/", isPartOf: site,
      description: "Nonpartisan, source-grounded country intelligence and public decision context." } };
}
export default {
  async fetch(request, env, ctx) {\n    const api = await dispatchReleaseApi(request, env, ctx);\n    if (api) return api;
    const incoming = new URL(request.url);
    if (!ALLOWED.has(incoming.hostname) && !incoming.hostname.endsWith(".workers.dev")) return new Response("Not found", {status:404});
    if (incoming.hostname === "www.4nation.org") {
      incoming.hostname = "4nation.org";
      return Response.redirect(incoming.toString(), 308);
    }
    if (!["GET","HEAD"].includes(request.method)) return new Response("Method not allowed",{status:405});
    if (incoming.pathname === "/auth/4planet/callback") {
      const body = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"robots\" content=\"noindex,nofollow\"><title>4PLANET ID</title><script src=\"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.115.0/dist/umd/supabase.min.js\"></script><style>body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#fff;color:#080808;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Arial,sans-serif}.c{width:min(90vw,440px)}h1{font-size:34px;letter-spacing:-.04em;margin:0 0 12px}p{line-height:1.5;color:#555}.err{color:#b42318}</style></head><body><main class=\"c\"><h1>4PLANET ID</h1><p id=\"status\">Completing secure sign-in…</p></main><script>(async function(){var SB_URL='https://ghvdzetmplqkdtfqiror.supabase.co';var SB_KEY='sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE';var status=document.getElementById('status');function safe(v){try{var u=new URL(v||'/',location.origin);if(u.origin===location.origin)return u.pathname+u.search+u.hash}catch(e){}return '/'}try{var h=new URLSearchParams(location.hash.replace(/^#/,''));var token=h.get('token_hash');var next=safe(h.get('return_to'));history.replaceState({},'',location.pathname);if(!token)throw new Error('missing');var sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});var r=await sb.auth.verifyOtp({token_hash:token,type:'email'});if(r.error||!r.data||!r.data.session)throw r.error||new Error('expired');location.replace(next)}catch(e){status.textContent='This sign-in link is invalid or expired. Reopening 4PLANET ID…';status.className='err';setTimeout(function(){location.replace('https://id.4planet.org/login?return_to='+encodeURIComponent(location.origin+'/'))},900)}})();</script></body></html>";
      return new Response(request.method==="HEAD"?null:body,{status:200,headers:{
        "content-type":"text/html; charset=utf-8",
        "cache-control":"private, no-store",
        "x-robots-tag":"noindex, nofollow",
        "x-content-type-options":"nosniff",
        "referrer-policy":"no-referrer",
        "content-security-policy":"default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline'; connect-src https://ghvdzetmplqkdtfqiror.supabase.co; frame-ancestors 'none'; base-uri 'none'"
      }});
    }
    if (incoming.pathname === `/${INDEXNOW_KEY}.txt`) return new Response(INDEXNOW_KEY,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=86400","x-4nation-sha":SOURCE_SHA}});
    if (incoming.pathname === "/robots.txt") return new Response("User-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nUser-agent: Bingbot\nAllow: /\n\nUser-agent: *\nAllow: /\nDisallow: /auth/\n\nSitemap: https://4nation.org/sitemap.xml\n",{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=300","x-4nation-sha":SOURCE_SHA}});
    if (incoming.pathname === "/sitemap.xml") return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+["/","/decisions",...Object.keys(FEATURED).map((k)=>"/country/"+k)].map((p)=>"  <url><loc>https://4nation.org"+p+"</loc></url>").join("\n")+"\n</urlset>\n",{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=300","x-4nation-sha":SOURCE_SHA}});
    const upstreamUrl = new URL(IMMUTABLE_ORIGIN);
    upstreamUrl.pathname = incoming.pathname === "/" ? "/4nation" : incoming.pathname;
    upstreamUrl.search = incoming.search;
    const safeHeaders = new Headers(request.headers);
    for(const key of ["host","cookie","authorization","cf-connecting-ip","x-forwarded-for","x-forwarded-host"])safeHeaders.delete(key);
    const upstream = await fetch(new Request(upstreamUrl.toString(),{method:request.method,headers:safeHeaders,redirect:"manual"}));
    const headers = new Headers(upstream.headers);
    for(const key of ["x-robots-tag","content-length","content-encoding","set-cookie"])headers.delete(key);
    headers.set("x-4nation-sha",SOURCE_SHA);
    headers.set("x-content-type-options","nosniff");
    const location=headers.get("location");
    if(location){
      const link=new URL(location,upstreamUrl);
      if(link.origin===IMMUTABLE_ORIGIN){link.protocol="https:";link.host="4nation.org";headers.set("location",link.toString());}
    }
    if((headers.get("content-type")||"").includes("text/html")&&request.method==="GET"){
      let body=await upstream.text();
      body=body.replace(/<meta\s+name=["']robots["'][^>]*>/gi,"");
      const page=pageMeta(incoming.pathname);
      const esc=(v)=>String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
      body=body.replace(/<title>[^<]*<\/title>/i,"<title>"+esc(page.title)+"</title>");
      body=body.replace(/<meta\s+name=["']description["'][^>]*>/i,"");
      body=body.replace(/<link\s+rel=["']canonical["'][^>]*>/gi,"");
      body=body.replace(/<meta\s+property=["']og:(title|description|url)["'][^>]*>/gi,"");
      const ld=JSON.stringify(page.ld).replace(/</g,"\\u003c");
      body=body.replace("</head>",'<meta name="description" content="'+esc(page.description)+'" /><meta name="robots" content="'+(page.index?"index,follow,max-image-preview:large":"noindex,follow")+'" /><link rel="canonical" href="'+page.url+'" /><meta property="og:title" content="'+esc(page.title)+'" /><meta property="og:description" content="'+esc(page.description)+'" /><meta property="og:url" content="'+page.url+'" /><script type="application/ld+json">'+ld+'</script></head>');
      const discoveryFallback='<main data-public-discovery-fallback="1"><h1>'+esc(page.h1)+'</h1><p>'+esc(page.description)+'</p><nav aria-label="Related public products"><a href="https://4planet.org/">4PLANET</a> · <a href="https://4planetatlas.com/">ATLAS</a> · <a href="https://4nation.org/">4NATION</a></nav></main>';
      body=body.replace('<div id="root"></div>','<div id="root">'+discoveryFallback+'</div>');
      headers.set("cache-control","public, max-age=90, must-revalidate");
      return new Response(body,{status:upstream.status,headers});
    }
    return new Response(upstream.body,{status:upstream.status,headers});
  }
};
