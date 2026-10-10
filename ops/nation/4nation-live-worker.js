// 4NATION: host-only public origin for the exact tested Pages artifact.
const IMMUTABLE_ORIGIN = "https://9c7fe142.4planet-05.pages.dev";
const SOURCE_SHA = "ba354a82b443f9e0cd2124af6ead75a995ed0e8c";
const INDEXNOW_KEY = "8f4c2d91a7b64e3fa1c9d0b6e5274a83";
const ALLOWED = new Set(["4nation.org", "www.4nation.org"]);
export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    if (!ALLOWED.has(incoming.hostname)) return new Response("Not found", {status:404});
    if (incoming.protocol !== "https:" || incoming.hostname === "www.4nation.org") {
      incoming.protocol = "https:";
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
    if (incoming.pathname === "/sitemap.xml") return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://4nation.org/</loc></url>\n</urlset>\n',{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=300","x-4nation-sha":SOURCE_SHA}});
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
      body=body.replace(/<title>[^<]*<\/title>/i,"<title>4NATION — Better Nation | Public Decision Intelligence</title>");
      body=body.replace(/<meta\s+name=["']description["'][^>]*>/i,'<meta name="description" content="4NATION is 4PLANET’s nonpartisan public decision intelligence product for understanding choices, sources, trade-offs and public value." />');
      body=body.replace(/<link\s+rel=["']canonical["'][^>]*>/gi,"");
      body=body.replace("</head>",'<meta name="robots" content="index,follow,max-image-preview:large" /><link rel="canonical" href="https://4nation.org/" /><script type="application/ld+json">{"@context":"https://schema.org","@type":"WebApplication","name":"4NATION","url":"https://4nation.org/","description":"Nonpartisan public decision intelligence for understanding choices, sources, trade-offs and public value.","isPartOf":{"@type":"WebSite","name":"4PLANET","url":"https://4planet.org/"}}</script></head>');
      const discoveryFallback='<main data-public-discovery-fallback="1"><h1>4NATION — Better Nation</h1><p>4NATION is an early public decision-intelligence product from 4PLANET. It is being built to help people understand important public choices through original sources, dates, jurisdiction, alternatives, constraints, trade-offs and implementation context.</p><p>The product is nonpartisan. Its purpose is not to tell citizens or officials what political position to hold. It aims to make decisions easier to inspect, compare and understand, while keeping facts, analysis and uncertainty distinguishable from advocacy.</p><p>For public officials, the direction is source-grounded decision support around public value, resources, welfare, nature and implementation. For citizens, the direction is transparent visibility into choices being proposed, considered, decided and implemented.</p><nav aria-label="Related public products"><a href="https://4planet.org/">4PLANET</a> · <a href="https://4planetatlas.com/">ATLAS</a> · <a href="https://4planet.org/impact">Impact</a></nav></main>';
      body=body.replace('<div id="root"></div>','<div id="root">'+discoveryFallback+'</div>');
      const idHref="https://id.4planet.org/login?return_to="+encodeURIComponent(incoming.toString());
      const idEntry='<a data-fourplanet-id-entry="1" href="'+idHref+'" aria-label="Log in with 4PLANET ID" style="position:fixed;top:14px;right:16px;z-index:2147483000;padding:9px 12px;border:1px solid rgba(8,8,8,.18);border-radius:999px;background:rgba(255,255,255,.94);color:#080808;text-decoration:none;font:650 10px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;box-shadow:0 4px 18px rgba(0,0,0,.08)">LOG IN · 4PLANET ID</a>';
      body=body.replace(/<body([^>]*)>/i,'<body$1>'+idEntry);
      headers.set("cache-control","public, max-age=90, must-revalidate");
      return new Response(body,{status:upstream.status,headers});
    }
    return new Response(upstream.body,{status:upstream.status,headers});
  }
};
