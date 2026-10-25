#!/usr/bin/env python3
"""Add crawler-friendly all57 directory + Explore internal links, leave 57 original pages untouched."""
from pathlib import Path
import sys
source=Path(sys.argv[1]);out=Path(sys.argv[2])
s=source.read_text()
assert 'const SPECIES_V53_ORIGIN = "https://e17e1392.4planet-05.pages.dev";' in s
assert 'const SPECIES_V1_ORIGIN = "https://de9e3e0e.4planet-05.pages.dev";' in s
assert 'const SPECIES_V1_RELEASED = new Set(' in s
assert 'async function reviewedSpeciesSitemap(request)' in s
assert 'async function mergedSpeciesIndex(request)' in s
assert 'return proxySpeciesV53(request);' in s
importline='import { directoryHtml, directoryJson, exploreDiscoveryFooter } from "./species57-search-directory.js";\n'
assert importline not in s
s=importline+s
anchor='  const body = '+chr(96)+'<?xml version="1.0" encoding="UTF-8"?>'
assert s.count(anchor)==1
addition='''  // One additional crawlable hub; do not change original 39 sitemap blocks.
  const directoryCanonical="https://4species.com/species-directory";
  if(kept.some(block=>block.includes("<loc>"+directoryCanonical+"</loc>")))
    throw Error("Directory canonical already exists");
  kept.push("<url><loc>"+directoryCanonical+"</loc></url>");
'''
s=s.replace(anchor,addition+anchor,1)
anchor='async function proxySpeciesV53(request) {'
assert s.count(anchor)==1
helper='''async function publicSpeciesDirectoryCatalog() {
  const response=await mergedSpeciesIndex(new Request("https://4species.com/species-data/v1/index.json"));
  if(!response.ok)throw Error("Public SPECIES57 index temporarily unavailable");
  return response.json();
}
async function publicSpeciesDirectory(request,json=false) {
  if(request.method!=="GET"&&request.method!=="HEAD")
    return new Response("Method not allowed",{status:405});
  try {
    const catalog=await publicSpeciesDirectoryCatalog();
    const text=json?directoryJson(catalog):directoryHtml(catalog);
    return new Response(request.method==="HEAD"?null:text,{
      status:200,headers:{
        "content-type":json?"application/json; charset=utf-8":"text/html; charset=utf-8",
        "cache-control":"public, max-age=300, must-revalidate",
        "x-robots-tag":"index, follow, max-image-preview:large",
        "x-4species-search":"catalog-57-source-grounded"
      }
    });
  }catch(error){
    return new Response("Directory temporarily unavailable",{status:503,
      headers:{"cache-control":"no-store","content-type":"text/plain"}});
  }
}
async function exploreWithAll57Links(request) {
  const catalog=await publicSpeciesDirectoryCatalog();
  const markup=exploreDiscoveryFooter(catalog);
  const response=await proxySpeciesV53(request);
  if(response.status!==200||(response.headers.get("content-type")||"").indexOf("text/html")<0)
    throw Error("Unexpected Explore response");
  const headers=new Headers(response.headers);
  for(const key of ["content-length","content-encoding","etag"])headers.delete(key);
  headers.set("cache-control","no-store, max-age=0");
  return new HTMLRewriter().on("body",{
    element(element){element.append(markup,{html:true});}
  }).transform(new Response(response.body,{status:response.status,headers}));
}
'''
s=s.replace(anchor,helper+anchor,1)
# Restrict to the early, active router path (there is unreachable legacy code below).
anchor='    return proxySpeciesV53(request);\n\n    if (path === "/"'
assert s.count(anchor)==1
routes='''    if (path === "/species-directory") return publicSpeciesDirectory(request,false);
    if (path === "/species-directory.json") return publicSpeciesDirectory(request,true);
    if (path === "/explore" && request.method === "GET") return exploreWithAll57Links(request);
    // Each of the old39 and existing18 individual articles remains byte-identical.
    return proxySpeciesV53(request);

    if (path === "/"'''
s=s.replace(anchor,routes,1)
assert s.count("publicSpeciesDirectoryCatalog()")==3
assert s.count("const SPECIES_V53_ORIGIN")==1
assert s.count("const SPECIES_V1_ORIGIN")==1
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(s)
print("SPECIES57_DISCOVERY_PATCH_ONLY",{"file":str(out),"addedRoutes":["/species-directory","/species-directory.json"],"patchedSitePage":"/explore","unchangedExistingArticleRoutes":57})
