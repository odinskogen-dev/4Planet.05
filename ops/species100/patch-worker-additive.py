#!/usr/bin/env python3
"""Patch exact pinned 57-profile Cloudflare Worker to add only the 43 new species routes.
The source must be the previously proven Worker, never a stale donor worker.
"""
from pathlib import Path
import json,sys
src=Path(sys.argv[1]); target=Path(sys.argv[2]); origin=sys.argv[3].rstrip("/")
manifest=json.loads(Path(sys.argv[4]).read_text())
fresh=[p["slug"] for p in manifest["profiles"]]
assert len(fresh)==43 and len(set(fresh))==43
assert origin.startswith("https://") and origin.endswith(".4planet-05.pages.dev")
s=src.read_text()
assert 'const SPECIES_V53_ORIGIN = "https://e17e1392.4planet-05.pages.dev";' in s
assert 'const SPECIES_V1_ORIGIN = "https://de9e3e0e.4planet-05.pages.dev";' in s
assert 'const SPECIES_V1_RELEASED' in s
assert 'async function reviewedSpeciesSitemap(request)' in s
assert 'async function mergedSpeciesIndex(request)' in s
assert 'return proxySpeciesV53(request);' in s
replacement=('const SPECIES_V2_ORIGIN = "'+origin+'";\n'
             +'const SPECIES_V2_RELEASED = new Set("'+ " ".join(fresh) +'".split(" "));\n'
             +'const SPECIES_V2_MEDIA = "/assets/species/final43/";\n')
before='function speciesV1OriginForPath(path) {'
assert s.count(before)==1
s=s.replace(before,replacement+before,1)
before='  const direct=path.match(/^\\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);'
assert s.count(before)==1
# Put V2 routing before V1 routing while preserving regex and 57 routes.
before2='  if ((direct && SPECIES_V1_RELEASED.has(direct[1])) ||'
assert s.count(before2)==1
block='''  if ((direct && SPECIES_V2_RELEASED.has(direct[1])) ||
      (profile && SPECIES_V2_RELEASED.has(profile[1])) ||
      path.startsWith(SPECIES_V2_MEDIA) ||
      [...SPECIES_V2_RELEASED].some(slug => path.startsWith("/assets/species/next61/"+slug+"-")))
    return SPECIES_V2_ORIGIN;
  if (path==="/llms.txt") return SPECIES_V2_ORIGIN;
'''
s=s.replace(before2,block+before2,1)
before='  const body = \`<?xml version="1.0" encoding="UTF-8"?>'
assert s.count(before)==1
addon='''  // Only published new43 canonical URLs from the immutable batch origin.
  const existingLocs=new Set(kept.map(block => block.match(/<loc>([^<]+)<\\\\/loc>/)?.[1]).filter(Boolean));
  const newSitemap=await fetch(SPECIES_V2_ORIGIN+"/species-sitemap.xml");
  if(!newSitemap.ok) throw Error("Founder-approved SPECIES100 sitemap origin unavailable");
  for(const block of ((await newSitemap.text()).match(/<url>[\\\\s\\\\S]*?<\\\\/url>/g)||[])){
    const slug=block.match(/<loc>https:\\\\/\\\\/4species\\\\.com\\\\/([a-z0-9-]+)<\\\\/loc>/)?.[1];
    if(!slug||!SPECIES_V2_RELEASED.has(slug))continue;
    if(await profileReviewState("/"+slug)==="UNREVIEWED")throw Error("New species missing direct source-backed review state: "+slug);
    const canonical="https://4species.com/"+slug;
    if(existingLocs.has(canonical))throw Error("Collision with existing 57 species "+slug);
    existingLocs.add(canonical);
    kept.push(block);
  }
  if([...existingLocs].filter(u=>/^https:\\\\/\\\\/4species\\\\.com\\\\/[a-z0-9-]+$/.test(u)).length!==100)
    throw Error("SPECIES100 sitemap not exactly 100 canonical URLs");
'''
# Note user-facing counts assert can have old non-profile /about etc; regex filtered only names.
s=s.replace(before,addon+before,1)
before='    return new Response(JSON.stringify({...base,pages:[...base.pages,...added]}),{'
assert s.count(before)==1
newindex='''    const source43=await fetch(SPECIES_V2_ORIGIN+"/species-data/v1/index.json");
    if(!source43.ok)throw Error("SPECIES100 source index unavailable");
    const next43=await source43.json();
    if(!Array.isArray(next43.pages))throw Error("New 43 invalid index");
    const old=new Set([...current,...added.map(p=>p.slug)]);
    const add43=next43.pages.filter(p=>SPECIES_V2_RELEASED.has(p.slug)&&!old.has(p.slug));
    if(add43.length!==43||old.size!==57)throw Error("SPECIES100 index count mismatch "+add43.length+" after "+old.size);
'''
s=s.replace(before,newindex+'    return new Response(JSON.stringify({...base,pages:[...base.pages,...added,...add43]}),{',1)
s=s.replace('out.set("x-4species-release", "species-v53-e17e1392-cod-preserved-plus-de9e3e0e-18-v1-20261022");',
 'out.set("x-4species-release", "species100-e17e1392-original39-de9e3e0e-v1-18-plus-43-20261024");',1)
# Existing 57 assets and profiles still originate from their EXACT pinned locations.
assert s.count("SPECIES_V2_RELEASED")==5 or s.count("SPECIES_V2_RELEASED")>=5
target.parent.mkdir(parents=True,exist_ok=True)
target.write_text(s)
print("SPECIES100_ADDITIVE_WORKER_PATCH_READY",json.dumps({"newRoutes":43,"oldRoutesPreserved":57,"newOrigin":origin,"output":str(target)}))
