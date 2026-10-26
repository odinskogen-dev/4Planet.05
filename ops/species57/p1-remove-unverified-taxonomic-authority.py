#!/usr/bin/env python3
"""Remove literal unverified taxon-author placeholder from only 18 newer profiles.

Original 39 HTML/JSON remain byte-identical. Never invent a taxon author.
Apply to the current bounded P0+SEO Worker; no second science database.
"""
from pathlib import Path
import sys
if len(sys.argv)!=3:raise SystemExit("usage input.js output.js")
inp,out=map(Path,sys.argv[1:])
s=inp.read_text()
assert "const SPECIES_V1_RELEASED = new Set(" in s
assert "isHashedModule" in s and "publicSpeciesDirectoryCatalog" in s
anchor='''  const response = new Response(request.method==="HEAD"?null:upstream.body, {status:upstream.status,statusText:upstream.statusText,headers:out});'''
assert s.count(anchor)==1,"Worker response anchor unexpectedly changed"
fix='''  // Source-grounded P1 editorial fix. An unresolved taxonomic authority must
  // not be presented as an actual author. Do not substitute invented names.
  // Profile is still honestly marked DRAFT/SCIENCE_PENDING until source review.
  const v1DataRoute=incoming.pathname.match(/^\\/species-data\\/v1\\/([a-z0-9]+(?:-[a-z0-9]+)*)\\.json$/);
  if(request.method==="GET" && v1DataRoute && SPECIES_V1_RELEASED.has(v1DataRoute[1]) && upstream.ok) {
    const record=await upstream.json();
    if(record?.slug!==v1DataRoute[1] || record?.identity?.authorship!=="Pending authority citation") {
      return new Response("Unexpected V1 data authority state",{status:502,
        headers:{"cache-control":"no-store","x-robots-tag":"noindex"}});
    }
    record.identity.authorship="";
    const h=new Headers(out);
    for(const key of ["content-length","content-encoding","etag","last-modified"])h.delete(key);
    h.set("content-type","application/json; charset=utf-8");
    h.set("cache-control","no-store, max-age=0");
    h.set("x-4species-authority","omitted-unverified-18-only");
    return new Response(JSON.stringify(record),{status:200,headers:h});
  }
'''
s=s.replace(anchor,fix+anchor,1)
end='''  return response;
}

const SPECIES_V51_PREVIEW_ORIGIN'''
assert s.count(end)==1
html='''  // The same phrase is also embedded in the pinned V1 pre-rendered HTML.
  // Correct only these 18 static HTML responses. Original 39 untouched.
  if(request.method==="GET" && SPECIES_V1_RELEASED.has(incoming.pathname.slice(1)) &&
     /^\\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(incoming.pathname) &&
     (out.get("content-type")||"").includes("text/html")) {
    return new HTMLRewriter().on("p",{
      text(node) {
        if(node.text.includes("Pending authority citation")) {
          node.replace(node.text.replace("Pending authority citation",""),{html:false});
        }
      }
    }).transform(response);
  }
  return response;
}

const SPECIES_V51_PREVIEW_ORIGIN'''
s=s.replace(end,html,1)
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
print("SPECIES_P1_NEW18_TAXON_AUTHORITY_PLACEHOLDER_OMIT_PATCH_GENERATED",out)
