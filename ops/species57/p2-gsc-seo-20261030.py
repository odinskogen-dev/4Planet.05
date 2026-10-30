#!/usr/bin/env python3
"""GSC/SEO P2 on top of the exact P1-nav router (one template-level step).
1 sitemap image:loc: 3 Special:FilePath (302) -> direct upload.wikimedia.org (200, sha1 = Commons sha1)
2 trailing-slash duplicates: 308 /<path>/ -> /<path> (query kept), GET/HEAD only
3 soft 404: UNREVIEWED HTML whose body is the SPA fallback shell (canonical = home) AND whose path is NOT a known page
  (live sitemap 66 = base 62 + sidecar 4 four-premium-20261028) -> 404, noindex body kept. Known pages are never 404 here.
3b /index.html -> 308 / (query kept), GET/HEAD only
4 SPECIES->ATLAS: append crawlable link only for relations already in SPECIES_PLACE_RELATIONS (Kenya: 3) ; never /orca
5 /api/atlas-species: Wikimedia thumb URLs requested at >=3840px (400 on smaller originals) -> original file URL
Fails closed on any anchor drift."""
import sys,json
from pathlib import Path
src,out=map(Path,sys.argv[1:3]); s=src.read_text()
def rep(a,b):
    global s
    assert s.count(a)==1,("ANCHOR",a[:60]); s=s.replace(a,b,1)
IMG={"https://commons.wikimedia.org/wiki/Special:FilePath/Torsk._Cod.jpg":"https://upload.wikimedia.org/wikipedia/commons/8/89/Torsk._Cod.jpg",
 "https://commons.wikimedia.org/wiki/Special:FilePath/Tursiops_truncatus_01.jpg":"https://upload.wikimedia.org/wikipedia/commons/1/10/Tursiops_truncatus_01.jpg",
 "https://commons.wikimedia.org/wiki/Special:FilePath/Phocoena_phocoena_ssp._vomerina.jpg":"https://upload.wikimedia.org/wikipedia/commons/3/30/Phocoena_phocoena_ssp._vomerina.jpg"}
KNOWN=['/', '/explore', '/quiz', '/about', '/african-savanna-elephant', '/asian-elephant', '/atlantic-cod', '/atlantic-puffin', '/bald-eagle', '/black-rhinoceros', '/blue-mussel', '/blue-whale', '/bornean-orangutan', '/cheetah', '/chimpanzee', '/bottlenose-dolphin', '/common-octopus', '/eastern-gorilla', '/acropora-palmata', '/emperor-penguin', '/english-oak', '/eurasian-lynx', '/fly-agaric', '/giant-panda', '/giraffe', '/gray-wolf', '/great-white-shark', '/green-sea-turtle', '/harbour-porpoise', '/hippopotamus', '/humpback-whale', '/hyacinth-macaw', '/jaguar', '/leopard', '/lion', '/monarch-butterfly', '/orca', '/polar-bear', '/sei-whale', '/sperm-whale', '/tiger', '/western-honey-bee', '/whale-shark', '/koala', '/quokka', '/capybara', '/red-fox', '/giant-anteater', '/giant-otter', '/walrus', '/common-kingfisher', '/secretary-bird', '/scarlet-macaw', '/peregrine-falcon', '/ocean-sunfish', '/giant-manta-ray', '/greater-blue-ringed-octopus', '/peacock-mantis-shrimp', '/venus-flytrap', '/titan-arum', '/giant-sequoia', '/species-directory', '/atlas-moth', '/peacock-spider', '/emperor-scorpion', '/dragon-blood-tree']
assert len(KNOWN)==66 and len(set(KNOWN))==66 and all(k in KNOWN for k in ["/atlas-moth","/peacock-spider","/emperor-scorpion","/dragon-blood-tree"])
rep('const PROFILE_DATA_PREFIX = "/species-data/v1/";',
 'const GSC_SITEMAP_IMAGE_DIRECT=Object.freeze('+json.dumps(IMG)+');\n'
 'const GSC_KNOWN_PAGES=new Set('+json.dumps(KNOWN)+');\n'
 'const GSC_ATLAS_LINK=(slug)=>{const r=SPECIES_PLACE_RELATIONS[slug];return (!r||slug==="orca")?"":\'<nav id="species-atlas-place" aria-label="Where it lives" style="max-width:1100px;margin:18px auto 0;padding:0 clamp(18px,4vw,40px);font-family:DM Sans,system-ui,sans-serif;font-size:14px"><a style="color:#285643" href="\'+r.url+\'">See \'+r.label+\' in ATLAS</a></nav>\';};\n'
 'const PROFILE_DATA_PREFIX = "/species-data/v1/";')
# 1 sitemap
rep('  const body = `<?xml version="1.0" encoding="UTF-8"?>\\n<urlset',
    '  for(const [from,to] of Object.entries(GSC_SITEMAP_IMAGE_DIRECT))for(let i=0;i<kept.length;i++)kept[i]=kept[i].split("<image:loc>"+from+"</image:loc>").join("<image:loc>"+to+"</image:loc>");\n  const body = `<?xml version="1.0" encoding="UTF-8"?>\\n<urlset')
# 2 slash
rep('    // Each of the old39 and existing18 individual articles remains byte-identical.\n    return proxySpeciesV53(request);',
    '    if(path==="/index.html" && (request.method==="GET"||request.method==="HEAD"))\n      return redirect("https://4species.com/"+url.search,308);\n'
    '    if(path.length>1 && path.endsWith("/") && (request.method==="GET"||request.method==="HEAD"))\n      return redirect("https://4species.com"+(path.replace(/\\/+$/,"")||"/")+url.search,308);\n    // Each of the old39 and existing18 individual articles remains byte-identical.\n    return proxySpeciesV53(request);')
# 3 soft 404 + 4 atlas link
rep('''  const response = new Response(request.method==="HEAD"?null:upstream.body, {status:upstream.status,statusText:upstream.statusText,headers:out});''',
'''  if(reviewState==="UNREVIEWED" && upstream.status===200 && !GSC_KNOWN_PAGES.has(pathname) && !pathname.startsWith("/assets/") && !pathname.startsWith("/api/") &&
     (out.get("content-type")||"").includes("text/html")) {
    let shell=request.method==="HEAD"?await (await fetch(target.toString(),{method:"GET",headers,redirect:"follow"})).text():await upstream.text();
    const fallback=/<link[^>]+rel="canonical"[^>]+href="https:\\/\\/4species\\.com\\/"/.test(shell);
    upstream=new Response(request.method==="HEAD"?null:shell,{status:fallback?404:200,statusText:fallback?"Not Found":"OK",headers:upstream.headers});
  }
  if(request.method==="GET" && pathname.startsWith("/api/atlas-species") && upstream.ok && (out.get("content-type")||"").includes("json")) {
    const txt=(await upstream.text()).replace(/https:\\/\\/(?:thumb|upload)\\.wikimedia\\.org\\/wikipedia\\/commons\\/thumb\\/([0-9a-f]\\/[0-9a-f]{2}\\/[^\\/"?]+)\\/(\\d+)px-[^"?]+(\\?[^"]*)?/g,
      (m,file,w)=>Number(w)>=3840?"https://upload.wikimedia.org/wikipedia/commons/"+file:m);
    return new Response(txt,{status:upstream.status,headers:out});
  }
  const response = new Response(request.method==="HEAD"?null:upstream.body, {status:upstream.status,statusText:upstream.statusText,headers:out});''')
# 4 atlas link inside the original39 path: the default-return; only slugs with relation, not orca
rep('''  return response;
}

const SPECIES_V51_PREVIEW_ORIGIN''','''  const atlasNav=GSC_ATLAS_LINK(incoming.pathname.slice(1));
  if(request.method==="GET" && atlasNav && response.status===200 && (out.get("content-type")||"").includes("text/html"))
    return new HTMLRewriter().on("body",{element(el){el.append(atlasNav,{html:true});}}).transform(response);
  return response;
}

const SPECIES_V51_PREVIEW_ORIGIN''')
assert "SPECIES_PLACE_RELATIONS" in s and "badAsset" in s
out.write_text(s); print("SPECIES_P2_GSC_SEO_PATCH_PASS")
