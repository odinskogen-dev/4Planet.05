// S4PIENS live domain adapter — bounded proxy to one immutable 4planet-05 Pages artifact.
// The release workflow replaces __IMMUTABLE_ORIGIN__ and __SOURCE_SHA__ in a temporary copy before deploy.
const IMMUTABLE_ORIGIN = "__IMMUTABLE_ORIGIN__";
const SOURCE_SHA = "__SOURCE_SHA__";
const ALLOWED = new Set(["s4piens.com","www.s4piens.com"]);

function productPath(pathname) {
  if (pathname === "/") return "/human-systems";
  if (pathname === "/human-systems" || pathname.startsWith("/human-systems/")) return pathname;
  if (pathname === "/system" || pathname.startsWith("/system/") || pathname === "/object" || pathname.startsWith("/object/")) return "/human-systems" + pathname;
  return pathname;
}
function canonicalPath(pathname) {
  if (pathname === "/human-systems") return "/";
  if (pathname.startsWith("/human-systems/")) return pathname.slice("/human-systems".length) || "/";
  return pathname;
}
function meta(pathname) {
  const p = canonicalPath(pathname).replace(/\/+$/,"") || "/";
  if (p.startsWith("/system/food")) return {title:"FOOD — S4PIENS",desc:"Follow the human food system from need through production, processing, movement, use and end of life — connected to places, living systems, problems and solutions."};
  if (p.startsWith("/system/energy-and-industry")) return {title:"Energy & Industry — S4PIENS",desc:"Follow energy and industrial systems from human need through extraction, conversion, production, use and end of life — with sources and uncertainty visible."};
  if (p.startsWith("/object/")) {
    const n=p.split("/")[2]?.replace(/-/g," ")||"Everyday object";
    return {title:n.replace(/\b\w/g,c=>c.toUpperCase())+" — S4PIENS",desc:"Follow one everyday object through the human systems, places and living systems behind it."};
  }
  return {title:"S4PIENS — How human systems work",desc:"Start with a human need and follow the real systems behind it — food, energy and industry — to the places, living systems, problems and solutions they connect to."};
}
export default {
 async fetch(request) {
  const incoming=new URL(request.url);
  if(!ALLOWED.has(incoming.hostname)) return new Response("Not found",{status:404});
  if(incoming.hostname==="www.s4piens.com"){incoming.hostname="s4piens.com";return Response.redirect(incoming.toString(),308);}
  if(!["GET","HEAD"].includes(request.method)) return new Response("Method not allowed",{status:405});
  if(incoming.pathname==="/robots.txt") return new Response("User-agent: *\nAllow: /\nDisallow: /auth/\n\nSitemap: https://s4piens.com/sitemap.xml\n",{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=300","x-s4piens-sha":SOURCE_SHA}});
  if(incoming.pathname==="/sitemap.xml"){
   const paths=["/","/system/food","/system/energy-and-industry","/object/bread","/object/coffee","/object/steel-beam","/object/smartphone"];
   return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+paths.map(p=>'  <url><loc>https://s4piens.com'+p+'</loc></url>').join("\n")+"\n</urlset>\n",{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=300","x-s4piens-sha":SOURCE_SHA}});
  }
  const upstreamUrl=new URL(IMMUTABLE_ORIGIN);
  upstreamUrl.pathname=productPath(incoming.pathname);
  upstreamUrl.search=incoming.search;
  const safe=new Headers(request.headers);
  for(const k of ["host","cookie","authorization","cf-connecting-ip","x-forwarded-for","x-forwarded-host"]) safe.delete(k);
  const upstream=await fetch(new Request(upstreamUrl.toString(),{method:request.method,headers:safe,redirect:"manual"}));
  const headers=new Headers(upstream.headers);
  for(const k of ["x-robots-tag","content-length","content-encoding","set-cookie"]) headers.delete(k);
  headers.set("x-s4piens-sha",SOURCE_SHA);
  headers.set("x-content-type-options","nosniff");
  const loc=headers.get("location");
  if(loc){const u=new URL(loc,upstreamUrl);if(u.origin===IMMUTABLE_ORIGIN){u.protocol="https:";u.host="s4piens.com";u.pathname=canonicalPath(u.pathname);headers.set("location",u.toString());}}
  if((headers.get("content-type")||"").includes("text/html")&&request.method==="GET"){
   let body=await upstream.text();
   body=body.replace(/<meta\s+name=["']robots["'][^>]*>/gi,"").replace(/<link\s+rel=["']canonical["'][^>]*>/gi,"");
   const m=meta(incoming.pathname); const cp=canonicalPath(incoming.pathname); const canonical="https://s4piens.com"+(cp==="/"?"/":cp);
   const esc=v=>String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
   body=body.replace(/<title>[^<]*<\/title>/i,"<title>"+esc(m.title)+"</title>");
   body=body.replace(/<meta\s+name=["']description["'][^>]*>/i,"");
   body=body.replace("</head>",'<meta name="description" content="'+esc(m.desc)+'" /><meta name="robots" content="index,follow,max-image-preview:large" /><link rel="canonical" href="'+canonical+'" /></head>');
   headers.set("cache-control","public, max-age=90, must-revalidate");
   return new Response(body,{status:upstream.status,headers});
  }
  return new Response(upstream.body,{status:upstream.status,headers});
 }
};