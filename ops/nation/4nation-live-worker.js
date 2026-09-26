// 4NATION: host-only public origin for the exact tested Pages artifact.
const IMMUTABLE_ORIGIN = "https://852b848d.4planet-05.pages.dev";
const SOURCE_SHA = "1c98ec1e8bb8a4895279c5365a90e01b5e7a0ecd";
const ALLOWED = new Set(["4nation.org", "www.4nation.org"]);
export default {
  async fetch(request) {
    const incoming = new URL(request.url);
    if (!ALLOWED.has(incoming.hostname)) return new Response("Not found", {status:404});
    if (incoming.hostname === "www.4nation.org") {
      incoming.hostname = "4nation.org";
      return Response.redirect(incoming.toString(), 308);
    }
    if (!["GET","HEAD"].includes(request.method)) return new Response("Method not allowed",{status:405});
    if (incoming.pathname === "/robots.txt") return new Response("User-agent: *\nAllow: /\n",{headers:{"content-type":"text/plain; charset=utf-8","x-4nation-sha":SOURCE_SHA}});
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
      body=body.replace("</head>",'<meta name="robots" content="index,follow,max-image-preview:large" /><link rel="canonical" href="https://4nation.org/" /></head>');
      headers.set("cache-control","public, max-age=90, must-revalidate");
      return new Response(body,{status:upstream.status,headers});
    }
    return new Response(upstream.body,{status:upstream.status,headers});
  }
};
