#!/usr/bin/env python3
"""Append subtle, crawlable, source-group links to 18 newer V1 articles ONLY.

Build-time materialisation of the single existing 57-item public catalogue,
NOT a parallel species database. Does NOT modify any of the 39 original pages.
HTML is outside the SPA root, so survives hydration; no ecological claims.
"""
from pathlib import Path
import json,sys,html,re
if len(sys.argv)!=5:raise SystemExit("usage: existing-P1-worker.js public-57-index.json out-worker.js out-link-evidence.json")
src,indexfile,out,evidence=map(Path,sys.argv[1:])
s=src.read_text()
cat=json.loads(indexfile.read_text())
pages=cat.get("pages")
assert isinstance(pages,list) and len(pages)==57 and len({x["slug"] for x in pages})==57
target="koala quokka capybara red-fox giant-anteater giant-otter walrus common-kingfisher secretary-bird scarlet-macaw peregrine-falcon ocean-sunfish giant-manta-ray greater-blue-ringed-octopus peacock-mantis-shrimp venus-flytrap titan-arum giant-sequoia".split()
assert len(target)==18 and all(any(p["slug"]==s for p in pages) for s in target)
def kind(group):
    t=str(group).lower()
    if t.startswith(("mammal","marine mammal")):return "mammals"
    if t.startswith("bird"):return "birds"
    if t.startswith("fish"):return "fishes"
    if t.startswith("plant"):return "plants"
    if t.startswith(("marine invertebrates","mollusc","cnidarian")):return "marine invertebrates"
    if t.startswith("insect"):return "insects"
    return None
candidates={}
report={}
for slug in target:
    this=next(p for p in pages if p["slug"]==slug)
    g=kind(this["group"]);assert g
    siblings=sorted((p for p in pages if p["slug"]!=slug and kind(p["group"])==g),key=lambda p:p["commonName"].lower())
    assert len(siblings)>=3,(slug,g,len(siblings))
    picked=siblings[:4]
    assert len({p["slug"] for p in picked})==len(picked)
    labels={'mammals':'Other mammals','birds':'Other birds','fishes':'Other fishes','plants':'Other plants','marine invertebrates':'Marine invertebrates','insects':'Other insects'}
    cards=''.join('<a href="/'+html.escape(p['slug'])+'" style="color:#285643;text-underline-offset:3px;font-size:14px;white-space:normal">'+html.escape(p['commonName'])+'</a>' for p in picked)
    nav='<nav id="species-57-inline-discovery" aria-label="Explore more species" style="background:#fff;color:#153b2a;font-family:DM Sans,Instrument Sans,system-ui,sans-serif;max-width:1100px;margin:28px auto 0;padding:22px clamp(18px,4vw,40px);border-top:1px solid #e7ece9"><p style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#64756b;margin:0 0 8px">Discover more</p><p style="font-size:17px;font-weight:600;margin:0 0 12px">'+labels[g]+'</p><div style="display:flex;gap:14px 22px;flex-wrap:wrap">'+cards+'</div><p style="margin:13px 0 0;font-size:14px"><a style="color:#285643" href="/species-directory">Browse all 57 species</a></p></nav>'
    candidates[slug]=nav
    report[slug]={"sourceGroup":this["group"],"broadGroup":g,"links":[p["slug"] for p in picked],"scope":"Browse-only classification, no ecological relationship claim"}
assert len(candidates)==18
anchor='const PROFILE_DATA_PREFIX = "/species-data/v1/";'
assert s.count(anchor)==1
s=s.replace(anchor,"const SPECIES_V1_BROWSE_LINKS=Object.freeze("+json.dumps(candidates,ensure_ascii=False,separators=(',',':'))+");\n"+anchor,1)
needle='''    return new HTMLRewriter().on("p",{
      text(node) {
        if(node.text.includes("Pending authority citation")) {'''
assert s.count(needle)==1,"Taxon P1 correction must be retained; fail closed"
s=s.replace(needle,'''    const nav=SPECIES_V1_BROWSE_LINKS[incoming.pathname.slice(1)];
    if(!nav)return new Response("Missing curated group navigation",{status:502});
    return new HTMLRewriter().on("body",{
      element(element){element.append(nav,{html:true});}
    }).on("p",{
      text(node) {
        if(node.text.includes("Pending authority citation")) {''',1)
assert "SPECIES_VERIFIED_AUTHORSHIP" in s
assert "badAsset" in s
assert "publicSpeciesDirectoryCatalog" in s
out.parent.mkdir(parents=True,exist_ok=True);out.write_text(s)
evidence.parent.mkdir(parents=True,exist_ok=True);evidence.write_text(json.dumps({"sourceCatalog":"4species.com/species-data/v1/index.json","released":57,"onlyNew18Edited":18,"original39Immutable":True,"navigation":report},indent=2))
print("SPECIES57_PUBLIC_NAV_FROM_EXISTING_CATALOG_PASS",json.dumps({"linksCreated":sum(len(x['links']) for x in report.values()),"newProfilePages":18,"originalProfilesModified":0}))
