#!/usr/bin/env python3
"""Photo rights and wild-only hero curation for eleven existing Claude pages.

Binds file-level rights metadata from Wikimedia Commons, downloads a controlled
and checked asset into Claude's existing public media directory, and writes
page.hero ONLY. No visual template, source model or story copy changes.
Files are not claimed to have independent human GOLD review.
"""
from pathlib import Path
import json,urllib.request,urllib.parse,re,time,html
from concurrent.futures import ThreadPoolExecutor

choices={
 "humpback-whale": ("Humpback whale breaching off Cabo San Lucas.jpg", "Wild humpback whale breaching off Cabo San Lucas in open ocean","50% 45%"),
 "sperm-whale": ("Mother and baby sperm whale.jpg", "Sperm whales swimming together at sea","48% 48%"),
 "harbour-porpoise": ("Phocoena phocoena ssp. vomerina.jpg", "Wild Pacific harbour porpoise photographed off the Oregon coast","50% 45%"),
 "bottlenose-dolphin": ("Tursiops truncatus 01.jpg", "Wild bottlenose dolphin surfing a research boat wake in Florida's Banana River","50% 42%"),
 "atlantic-cod": ("Atlantic cod under a shipwreck.jpg", "Wild Atlantic cod under a shipwreck in Stellwagen Bank National Marine Sanctuary","50% 53%"),
 "blue-mussel": ("Mytilus edulis (2451743880).jpg", "Blue mussels growing naturally underwater on limestone","50% 52%"),
 "whale-shark": ("Whale Shark AdF.jpg", "Wild whale shark filter-feeding in Maldives open waters","50% 47%"),
 "leopard": ("Leopard Tree AdF.jpg", "Wild female leopard climbing down from a tree in Sabi Sand, South Africa","50% 49%"),
 "eastern-gorilla": ("Mountain gorilla in Rwanda.jpg", "Wild eastern mountain gorilla in its Rwandan forest habitat","50% 45%"),
 "acropora-palmata": ("Elkhorn coral 1 Molasses Reef 20080309.jpg", "Living elkhorn coral on a natural reef in the Florida Keys","50% 55%"),
 "hyacinth-macaw": ("Anodorhynchus hyacinthinus -Brazilian Pantanal-8.jpg", "Wild hyacinth macaws travelling with a juvenile in Brazil's Pantanal","50% 42%"),
}
assert len(choices)==11
base=Path("public/species-data/v1")
dest=Path("public/species-media/gold-candidates")
dest.mkdir(parents=True,exist_ok=True)
headers={"User-Agent":"4PLANET-Wildlife-Photo-Rights-Check/1.0 (+https://4species.com/)"}
def clean(t):return re.sub(r"<[^>]+>"," ",html.unescape(t or "")).strip()
audit=[]
for slug,(file,alt,focus) in choices.items():
    f=base/(slug+".json")
    p=json.loads(f.read_text())
    assert p["slug"]==slug and p["hero"]=="auto" and p["provenance"]["review"]=="DRAFT"
    q=urllib.parse.urlencode({"action":"query","prop":"imageinfo","titles":"File:"+file,
         "iiprop":"url|size|extmetadata","iiurlwidth":1600,"format":"json","formatversion":"2"})
    u="https://commons.wikimedia.org/w/api.php?"+q
    req=urllib.request.Request(u,headers=headers)
    with urllib.request.urlopen(req,timeout=30) as r:obj=json.load(r)
    pages=obj.get("query",{}).get("pages",[])
    assert len(pages)==1 and "missing" not in pages[0],file
    img=pages[0]["imageinfo"][0]
    attrs=img.get("extmetadata") or {}
    field=lambda name:clean(attrs.get(name,{}).get("value",""))
    lic=field("LicenseShortName") or field("License")
    artist=field("Artist")
    assert img["width"]>=600 and img["height"]>=450,(slug,"insufficient resolution",img["width"],img["height"])
    assert any(t in lic.lower() for t in ["cc by","cc-by","cc0","public domain","pd-us","pd-self"]),(slug,lic)
    assert len(artist)>2, (slug,"author required")
    rawurl=img.get("thumburl") or img["url"]
    r=urllib.request.Request(rawurl,headers=headers)
    with urllib.request.urlopen(r,timeout=40) as response:
        mime=response.headers.get("Content-Type","")
        assert mime.lower().startswith("image/"),(slug,mime)
        data=response.read(14000000)
    assert len(data)>50000,(slug,len(data))
    out=dest/(slug+".jpg")
    # Source selected only from known JPEG originals.
    assert data.startswith(b"\xff\xd8\xff"),(slug,"not JPEG")
    out.write_bytes(data)
    photographer=artist
    if "<" in photographer or ">" in photographer:photographer=clean(photographer)
    # preserve original string as attribution in a file-level ledger
    p["hero"]={
      "url":"https://4species.com/species-media/gold-candidates/"+slug+".jpg",
      "sourcePage":img.get("descriptionurl","https://commons.wikimedia.org/wiki/File:"+urllib.parse.quote(file.replace(" ","_"))),
      "credit":photographer[:170],
      "licence":lic,
      "alt":alt,
      "focus":focus
    }
    f.write_text(json.dumps(p,ensure_ascii=False,indent=2)+"\n")
    audit.append({"slug":slug,"filename":file,"sourcePage":p["hero"]["sourcePage"],
       "photographer":photographer,"licence":lic,"licenseUrl":field("LicenseUrl"),
       "originalWidth":img["width"],"originalHeight":img["height"],
       "saved":str(out),"savedBytes":len(data),"editCrop":"responsive CSS original image unchanged",
       "wildEvidence":alt,"status":"CURATED_WILD_LICENSE_CHECKED_PENDING_INDEPENDENT_VISUAL_GOLD"})
    print("SPECIES_CURATED_HERO",slug,file,lic,photographer[:65],len(data))
Path("public/species-media/gold-candidates/rights-record-11.json").write_text(json.dumps(audit,ensure_ascii=False,indent=2)+"\n")
print("SPECIES_11_WILD_HERO_FILE_RIGHTS_QA_PASS",len(audit))
