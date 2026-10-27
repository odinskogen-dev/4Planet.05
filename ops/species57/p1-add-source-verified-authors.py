#!/usr/bin/env python3
"""Apply the independently corroborated taxonomy authorship to only 15 newer pages.

Use after p1-remove-unverified-taxonomic-authority.py, tested locally.
Do not modify original 39 site HTML/JSON/assets. Three disputed names stay blank,
with explicit uncertainty and transparent sources in JSON.
"""
import json,sys
from pathlib import Path
if len(sys.argv)!=4:raise SystemExit("use input.js evidence.json output.js")
source,evidence,out=map(Path,sys.argv[1:])
s=source.read_text()
e=json.loads(evidence.read_text())
verified=e["authors"];held=e["unresolved"]
assert len(verified)==15 and len(held)==3
assert not (set(verified)&set(held))
assert len(set(verified)|set(held))==18
assert e["sourceRun"].startswith("https://github.com/")
anchor='const PROFILE_DATA_PREFIX = "/species-data/v1/";'
assert s.count(anchor)==1
constants="const SPECIES_VERIFIED_AUTHORSHIP = Object.freeze("+json.dumps(verified,ensure_ascii=False)+");\n"
constants+="const SPECIES_TAXON_AUTHORITY_HELD = new Set("+json.dumps(list(held))+");\n"
s=s.replace(anchor,constants+anchor,1)
expected='''    record.identity.authorship="";'''
assert s.count(expected)==1
new='''    const verifiedAuthor=SPECIES_VERIFIED_AUTHORSHIP[record.slug] || "";
    if (!verifiedAuthor && !SPECIES_TAXON_AUTHORITY_HELD.has(record.slug))
      return new Response("Taxonomic authority data missing",{status:502,
        headers:{"cache-control":"no-store","x-robots-tag":"noindex"}});
    record.identity.authorship=verifiedAuthor;
    record.provenance = {...record.provenance, taxonAuthorityEvidence:{
      status:verifiedAuthor ? "ACCEPTED_TWO_AUTHORITIES" : "NOT_YET_RECONCILED",
      verifiedAt:"2026-10-26",
      gbif:"https://api.gbif.org/v2/species/match?scientificName="+encodeURIComponent(record.identity.scientificName),
      catalogueOfLife:"https://api.gbif.org/v2/species/match?scientificName="+encodeURIComponent(record.identity.scientificName)+"&checklistKey=7ddf754f-d193-4cc9-b351-99906754a03b"
    }};'''
s=s.replace(expected,new,1)
line='''          node.replace(node.text.replace("Pending authority citation",""),{html:false});'''
assert s.count(line)==1
s=s.replace(line,'''          const author=SPECIES_VERIFIED_AUTHORSHIP[incoming.pathname.slice(1)] || "";
          node.replace(node.text.replace("Pending authority citation",author),{html:false});''',1)
# Real content change on 18 new public pages: true meaningful lastmod.
old='''            await profileReviewState("/"+loc)!=="UNREVIEWED") kept.push(block);'''
assert s.count(old)==1
new='''            await profileReviewState("/"+loc)!=="UNREVIEWED") {
          if(block.includes("<lastmod>")) throw Error("Unexpected earlier new18 lastmod");
          kept.push(block.replace("</url>","<lastmod>2026-10-27</lastmod></url>"));
        }'''
s=s.replace(old,new,1)
assert s.count("SPECIES_VERIFIED_AUTHORSHIP")>=3
assert s.count("SPECIES_TAXON_AUTHORITY_HELD")>=2
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
print("SPECIES_P1_SOURCE_GROUNDED_AUTHORSHIP_PATCH",json.dumps({"verified":len(verified),"held":list(held),"onlyNew18":True,"lastmod":"2026-10-27"}))
