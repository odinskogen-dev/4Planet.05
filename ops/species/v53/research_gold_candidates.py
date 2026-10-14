#!/usr/bin/env python3
"""Research leads on the existing Claude Species editorial queue, NO PUBLICATION."""
import csv,io,json,re,urllib.request,urllib.parse,concurrent.futures
from pathlib import Path
queue=Path("docs/species/SPECIES_100_EDITORIAL_QUEUE_20261014.md").read_text()
raw=queue.split(chr(96)*3+"csv",1)[1].split(chr(96)*3,1)[0].strip()
rows=list(csv.DictReader(io.StringIO(raw)))
assert len(rows)==100 and len({r["slug"] for r in rows})==100
candidates=[r for r in rows if r["current_status"]!="LIVE_DRAFT"]
assert len(candidates)==79
headers={"User-Agent":"4PLANET-SPECIES-EditorialResearch/1.0 (+https://4species.com/; no auto-publication)","Accept":"application/json"}
def get_json(url,params):
    try:
        req=urllib.request.Request(url+"?"+urllib.parse.urlencode(params),headers=headers)
        with urllib.request.urlopen(req,timeout=18) as response:
            if response.status!=200:return {"error":"HTTP_"+str(response.status)}
            return json.load(response)
    except Exception as ex:return {"error":type(ex).__name__}
def match_taxon(row):
    data=get_json("https://api.gbif.org/v1/species/match",{"name":row["scientific_name"],"strict":"true"})
    ok=(not data.get("error") and data.get("rank")=="SPECIES" and data.get("matchType")=="EXACT")
    return {"slug":row["slug"],"inputName":row["scientific_name"],
        "matchedScientificName":data.get("scientificName"),"usageKey":data.get("usageKey"),
        "rank":data.get("rank"),"taxonomicStatus":data.get("status"),
        "matchType":data.get("matchType"),"confidence":data.get("confidence"),
        "issue":data.get("error"),
        "classification":"POTENTIAL_MATCH_NOT_GOLD" if ok else "REQUIRES_TAXON_REVIEW"}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: matched=list(pool.map(match_taxon,candidates))
print("SPECIES_79_TAXONOMY_SUMMARY",json.dumps({"checked":len(matched),
 "exact":sum(x["classification"]=="POTENTIAL_MATCH_NOT_GOLD" for x in matched),
 "needsReview":[x["slug"] for x in matched if x["classification"]!="POTENTIAL_MATCH_NOT_GOLD"]}))
P0=[r for r in candidates if r["batch"]=="BUILD_01_CATALOGUE_P0"]
assert len(P0)==11
ALLOWED=("cc-by","cc by","cc0","public domain","pd-us","pd-author","cc-by-sa","cc by-sa")
CAPTIVE=(" zoo","captiv","aquarium","cage","enclos","rehabilitation","animal park","oceanarium")
def strip_html(x):return re.sub(r"<[^>]*>"," ",x or "").replace("&nbsp;"," ").strip()
def commons(row):
    data=get_json("https://commons.wikimedia.org/w/api.php",{
        "action":"query","generator":"search","gsrsearch":'"'+row["scientific_name"]+'"',
        "gsrnamespace":6,"gsrlimit":8,"prop":"imageinfo",
        "iiprop":"url|size|extmetadata","iiurlwidth":1600,"format":"json","formatversion":"2"})
    results=[]
    for page in data.get("query",{}).get("pages",[]):
        if not isinstance(page,dict):continue
        info=(page.get("imageinfo")or[{}])[0];m=info.get("extmetadata")or{}
        get=lambda k:strip_html(m.get(k,{}).get("value","") if isinstance(m.get(k),dict) else "")
        licence=get("LicenseShortName") or get("License")
        caption=get("ImageDescription")[:500];title=page.get("title","")
        if not title.lower().endswith((".jpg",".jpeg",".png",".webp")):continue
        if info.get("width",0)<1200 or info.get("height",0)<750:continue
        if not any(x in licence.lower() for x in ALLOWED):continue
        if any(c in (" "+title+" "+caption).lower() for c in CAPTIVE):continue
        results.append({"title":title,"filePage":info.get("descriptionurl"),
         "previewUrl":info.get("thumburl"),"width":info.get("width"),"height":info.get("height"),
         "licence":licence,"licenceUrl":get("LicenseUrl"),"artist":get("Artist")[:190],
         "description":caption[:260],"status":"UNVERIFIED_WILD_SPECIES_RIGHTS_CROP_CANDIDATE"})
    return {"slug":row["slug"],"count":len(results),"candidates":results[:4],"error":data.get("error")}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:media=list(pool.map(commons,P0))
for x in media:print("SPECIES_P0_MEDIA_CANDIDATES",x["slug"],x["count"],x["error"] or "")
leads={
 "mammal":["Mammal Diversity Database","IUCN","specialist conservation authority"],
 "marine-mammal":["NOAA Fisheries","WoRMS","relevant peer-reviewed field study"],
 "fish":["WoRMS","IUCN","NOAA Fisheries when regionally applicable"],
 "mollusc":["WoRMS","relevant marine ecology authority"],
 "bird":["BirdLife","IOC World Bird List","peer-reviewed study"],
 "reptile":["The Reptile Database","IUCN","peer-reviewed study"],
 "amphibian":["AmphibiaWeb","IUCN","peer-reviewed study"],
 "insect":["GBIF","peer-reviewed specialist taxonomy and ecology"],
 "arthropod":["GBIF","peer-reviewed specialist ecology"],
 "plant":["Kew POWO","relevant ecological specialist"],
 "fungus":["Index Fungorum/MycoBank","peer-reviewed mycology"],
 "other":["WoRMS","IUCN if applicable","relevant species authority"]}
for r in candidates:r["specialistSourceLeads_NotYetIndividuallyChecked"]=leads.get(r["group"],["GBIF"])
result={"basis":"existing Claude SPECIES 100 editorial queue; no new truth store or publishing",
 "candidates":candidates,"taxonomy":matched,"firstGoldCohortMediaCandidates":media,
 "disclaimer":"Candidate matches/photos are NOT taxon validation, not rights clearance and not Gold."}
out=Path("qa-output");out.mkdir(exist_ok=True)
(out/"species-100-candidate-authority-media-research.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
print("SPECIES_RESEARCH_PREPARED",len(candidates),"P0",len(media),"GOLD_RELEASES",0)
