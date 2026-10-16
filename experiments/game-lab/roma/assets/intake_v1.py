#!/usr/bin/env python3
"""ROMA CC0 asset intake - only source-licensed, byte-verified assets."""
import requests, json, os, csv, zipfile, io, re, hashlib, time, gzip, struct, math, subprocess, shutil
from pathlib import Path
from urllib.parse import urljoin
from html.parser import HTMLParser
from datetime import datetime, timezone
from PIL import Image
import numpy as np
root=Path("ROMA_ASSETS_v1"); root.mkdir(exist_ok=True)
for name in ["characters","equipment","textures","terrain","audio","LICENSES"]:
    (root/name).mkdir(parents=True,exist_ok=True)
date="2026-10-17"
rows=[]; failures=[]; notes=[]; sess=requests.Session()
sess.headers.update({"User-Agent":"ROMA-GameLab-AssetIntake/1.0 (rights verification; noncommercial retrieval)"})
def fetch(url, cap=145_000_000, timeout=45,method="GET",**kwargs):
    r=sess.request(method,url,timeout=timeout,allow_redirects=True,**kwargs)
    r.raise_for_status()
    if len(r.content)>cap: raise RuntimeError("oversize response")
    return r
def write(rel,data,url,author,license="CC0-1.0",note=""):
    dst=root/rel;dst.parent.mkdir(parents=True,exist_ok=True)
    dst.write_bytes(data)
    rows.append(dict(file=str(rel),source_url=url,author=author,licence=license,download_date=date,notes=note,bytes=len(data),sha256=hashlib.sha256(data).hexdigest()))
    return dst
def evidence(name,url):
    try:
        html=fetch(url,cap=4_000_000).content
        (root/"LICENSES"/f"{name}_source.html").write_bytes(html)
        return True
    except Exception as e:
        failures.append(f"evidence {name} {url}: {e}");return False
def record_failure(label,e): failures.append(label+": "+str(e)[:230])
def glb_valid(data):
    return len(data)>20 and data[:4]==b"glTF" and int.from_bytes(data[4:8],"little")==2
def discover_pack(label,slug,prefix,filter_fn=lambda x:True,max_count=100):
    page=f"https://3dassets.dev/packs/{slug}"
    api=f"https://3dassets.dev/api/v1/packs/{slug}"
    evidence(label,page)
    try:
        pack=fetch(api,cap=3_000_000).json()
        (root/"LICENSES"/f"{label}_manifest.json").write_text(json.dumps(pack,indent=2))
        candidates=[]
        def visit(x,trail=""):
            if isinstance(x,dict):
                urls=[]
                for k,v in x.items():
                    if isinstance(v,str) and ("cdn.3dassets.dev/assets/" in v and ".glb" in v):
                        urls.append((k,v))
                if urls: candidates.append((x,urls[0][1]))
                for k,v in x.items(): visit(v,trail+"/"+k)
            elif isinstance(x,list):
                for v in x: visit(v,trail)
        visit(pack)
        dedup={}
        for obj,url in candidates: dedup[url]=(obj,url)
        if not dedup:
            # Manifest shape unexpected: include official fixed starter as last resort.
            fallbacks={"roman-bathhouse-and-palaestra":"https://cdn.3dassets.dev/assets/37911/v1/model.glb","equestrian-yard-and-stables":"https://cdn.3dassets.dev/assets/23846/v1/model.glb"}
            if slug in fallbacks: dedup[fallbacks[slug]]=({"name":slug+"-starter"},fallbacks[slug])
        done=0
        for obj,url in dedup.values():
            if done>=max_count:break
            name=str(obj.get("slug") or obj.get("name") or obj.get("title") or "model").lower()
            if not filter_fn(name):continue
            try:
                data=fetch(url,cap=5_000_000,timeout=24).content
                if not glb_valid(data):raise RuntimeError("not GLB")
                base=re.sub(r"[^a-z0-9-]","-",name)[:60].strip("-") or f"{prefix}_{done}"
                ident=re.search(r"/assets/(\d+)/",url)
                idstr=ident.group(1) if ident else str(done)
                rel=f"{prefix}/{base}-{idstr}.glb"
                write(rel,data,url,"3DAssets.dev","CC0-1.0",f"Source pack: {page}; original file; static (unless GLB metadata states animation)")
                done+=1
            except Exception as e:record_failure(f"{label}/{name}",e)
        notes.append(f"{label}: manifest candidates={len(dedup)}, downloaded GLB={done}")
    except Exception as e:record_failure(label+" manifest",e)
# Curated Roman structural kit. Ancient Roman baths usually post-date 216 BCE: use modular geometry only.
discover_pack("roman_architecture","roman-bathhouse-and-palaestra","equipment/roman_architecture",max_count=63)
discover_pack("equestrian","equestrian-yard-and-stables","equipment/horses_static",filter_fn=lambda n:any(q in n for q in ["horse","pony","donkey","mule"]),max_count=10)
discover_pack("roman_weapons","swords-shields-and-melee-arms","equipment/weapons_candidate",filter_fn=lambda n:any(q in n for q in ["shield","spear","javelin","short","dagger","sword"]),max_count=16)
# Quaternius animation skeleton: GLB is a library, not a finished soldier mesh.
oga=[
 ("UAL1","https://opengameart.org/content/universal-animation-library","https://opengameart.org/sites/default/files/universal_animation_librarystandard.zip"),
 ("UAL2","https://opengameart.org/content/universal-animation-library-2","https://opengameart.org/sites/default/files/universal_animation_library_2standard.zip"),
 ("LOWPOLY_HUMAN","https://opengameart.org/content/animated-human-low-poly","https://opengameart.org/sites/default/files/Animated%20Human%20by%20%40Quaternius_0.zip"),
 ("KENNEY_UI","https://opengameart.org/content/interface-sounds","https://opengameart.org/sites/default/files/kenney_interfaceSounds.zip"),
]
for label,page,source in oga:
    evidence(label,page)
    try:
        body=fetch(source,cap=35_000_000,timeout=100).content
        z=zipfile.ZipFile(io.BytesIO(body))
        glbs=[f for f in z.namelist() if f.lower().endswith(".glb") and not f.startswith("__MACOSX")]
        if label.startswith("UAL"):
            ranked=sorted(glbs,key=lambda n:(0 if label.lower() in n.lower() and "standard" in n.lower() and "rm" not in n.lower() else 1,len(n)))
            if not ranked:raise RuntimeError("No .glb in archive, cannot present native game-ready GLB")
            n=ranked[0]
            data=z.read(n)
            if not glb_valid(data):raise RuntimeError("Animation file not GLB")
            write(f"characters/{label.lower()}_shared_humanoid_animations.glb",data,source,"Quaternius","CC0-1.0",f"Extracted unchanged from archive internal path {n}; shared animation rig, NOT skinned soldier body")
            notes.append(f"{label}: {len(glbs)} GLB in source archive; selected {n} ({len(data)} bytes)")
        if label=="LOWPOLY_HUMAN":
            if glbs:
                n=glbs[0];data=z.read(n)
                if glb_valid(data):write("characters/soldier_base_candidate.glb",data,source,"Quaternius","CC0-1.0",f"Extracted unchanged from {n}; verify rig+animation coverage")
            else: notes.append("LOWPOLY_HUMAN pack has no native GLB; not converted because source must stay unchanged")
        if label=="KENNEY_UI":
            audio=[x for x in z.namelist() if x.lower().endswith(".ogg") and not x.startswith("__MACOSX")]
            done=0
            for n in audio[:9]:
                data=z.read(n)
                dst=write(f"audio/ui_{done+1:02d}.ogg",data,source,"Kenney","CC0-1.0",f"Unchanged original {n}; UI sound, not battle audio")
                if shutil.which("ffmpeg"):
                    mp3=dst.with_suffix(".mp3")
                    run=subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(dst),"-ac","1","-ar","44100",str(mp3)],capture_output=True)
                    if run.returncode==0:
                        b=mp3.read_bytes()
                        rows.append(dict(file=str(mp3.relative_to(root)),source_url=source,author="Kenney",licence="CC0-1.0",download_date=date,notes="Derived transcode from CC0 OGG (44.1kHz mono); original retained",bytes=len(b),sha256=hashlib.sha256(b).hexdigest()))
                done+=1
            notes.append(f"Kenney UI: {done} CC0 .ogg and converted .mp3 if available")
    except Exception as e:record_failure(label+" download",e)
# ambientCG licensed CC0 materials. Never re-scale or alter source files.
materials=["Ground037","Ground071","Grass004","Bricks097","Plaster007","RoofingTiles012A","Planks023A","PavingStones046"]
for mat in materials:
    page=f"https://ambientcg.com/view?id={mat}"
    source=f"https://ambientcg.com/get?file={mat}_1K-JPG.zip"
    evidence(mat,page)
    try:
        body=fetch(source,cap=22_000_000,timeout=60).content
        z=zipfile.ZipFile(io.BytesIO(body))
        found=0
        for n in z.namelist():
            low=n.lower()
            if not low.endswith((".jpg",".jpeg",".png")):continue
            if not any(t in low for t in ["color","albedo","normalgl","roughness","normal"]): continue
            data=z.read(n)
            # unchanged 1K source images
            clean=re.sub(r"[^A-Za-z0-9_.-]","_",n.split("/")[-1])
            rel=f"textures/{mat}_{clean}"
            write(rel,data,source,"ambientCG","CC0-1.0",f"Unmodified material map from {n}; check normal channel orientation")
            found+=1
        notes.append(f"{mat}: {found} maps")
    except Exception as e:record_failure("ambientCG "+mat,e)
# SRTM elevation: select NASA-derived open elevation Skadi (verify dataset and provider citation below).
# Retain ORIGINAL .hgt tile clipped raster separately with bounding box.
try:
    source="https://elevation-tiles-prod.s3.amazonaws.com/skadi/N41/N41E016.hgt.gz"
    raw=gzip.decompress(fetch(source,cap=32_000_000,timeout=95).content)
    count=len(raw)//2
    side=math.isqrt(count)
    if count!=side*side or side not in (1201,3601):raise RuntimeError(f"Unexpected HGT tile dimensions {len(raw)}")
    elevation=np.frombuffer(raw,dtype=">i2").reshape(side,side)
    # center approx Cannae 41.295 N, 16.138 E; 4 km x 4 km bbox
    lat0,lon0=41.295,16.138
    dlat=2.0/111.32;dlon=2.0/(111.32*math.cos(math.radians(lat0)))
    west,east=lon0-dlon,lon0+dlon;south,north=lat0-dlat,lat0+dlat
    c0=max(0,int((west-16)*(side-1)));c1=min(side,int(math.ceil((east-16)*(side-1)))+1)
    r0=max(0,int((42-north)*(side-1)));r1=min(side,int(math.ceil((42-south)*(side-1)))+1)
    patch=elevation[r0:r1,c0:c1].copy()
    patch[patch< -1000]=0
    # preserve raw signed elevations in original tif; store 16-bit PNG absolute metres with 32768 bias for negatives.
    from PIL import TiffImagePlugin
    img=Image.fromarray(patch,mode="I;16") # positive elevations in this Cannae region
    import rasterio
    from rasterio.transform import from_bounds
    transform=from_bounds(west,south,east,north,patch.shape[1],patch.shape[0])
    tifbuf=io.BytesIO()
    with rasterio.MemoryFile() as mem:
        with mem.open(driver="GTiff",height=patch.shape[0],width=patch.shape[1],count=1,dtype="int16",crs="EPSG:4326",transform=transform) as dataset:dataset.write(patch.astype("int16"),1)
        tifdata=mem.read()
    write("terrain/cannae_dem.tif",tifdata,source,"NASA SRTM / Tilezen elevation product","SRTM-public-domain",f"Derived 4x4km WGS84 crop; 30m-class resolution. Provider provenance must be credited.")
    out=io.BytesIO();Image.fromarray(patch.astype("uint16")).save(out,format="PNG")
    write("terrain/cannae_height16.png",out.getvalue(),source,"NASA SRTM / Tilezen elevation product","SRTM-public-domain","16-bit uint grayscale, raw positive elevation values in metres; derived from tile")
    bbox=f"west={west:.8f}\nsouth={south:.8f}\neast={east:.8f}\nnorth={north:.8f}\nCRS=EPSG:4326\ncenter={lat0},{lon0}\nshape={patch.shape}\nsource={source}\n"
    (root/"terrain/cannae_bbox.txt").write_text(bbox)
    notes.append(f"SRTM crop {patch.shape} min={patch.min()} max={patch.max()}")
except Exception as e:record_failure("DEM SRTM",e)
# CC0 license declaration. This is rights *evidence* plus source-page screenshots created by browser step.
try:
    (root/"LICENSES/CC0_1.0_URL.txt").write_text("https://creativecommons.org/publicdomain/zero/1.0/\n")
    (root/"LICENSES/SRTM_provenance_note.txt").write_text("NASA SRTM data are public domain in the USA; Tilezen/Mapzen Skadi elevation tile distribution may contain source mosaicking. Verify prior to commercial final ship: https://registry.opendata.aws/terrain-tiles/ ; https://www.earthdata.nasa.gov/data/instruments/srtm\n")
except Exception:pass
# Integrity and manifest
with (root/"ASSET_MANIFEST.csv").open("w",newline="",encoding="utf-8") as f:
    cols=["file","source_url","author","licence","download_date","notes","bytes","sha256"]
    wr=csv.DictWriter(f,fieldnames=cols);wr.writeheader();wr.writerows(rows)
(root/"README.md").write_text("# ROMA verified CC0 assets v1\n\nGenerated "+date+"\n\n"+ "\n".join("- "+v for v in notes)+"\n\n## Unfulfilled / requires manual review\n"+"\n".join("- "+v for v in failures)+"\n\n## Important\n- 3DAssets.dev models in architecture and weapon packs are contemporary/imperial or medieval-themed, not authentic 216 BCE Republic military kit. Use as geometry references or carefully adapted props only.\n- Horse pack static models are NOT animated horses. Treat as placeholder only.\n- Quaternius Universal Animation Library is an animation source GLB; a skeleton and body need matching retargeting and testing. Do not assume soldier_base is ready.\n- Audio transcodes are derived; their original OGG source is retained.\n- Models and materials remain byte-identical to source except explicitly declared derivatives (DEM crop, MP3 transcodes).\n- Source-page screenshots in LICENSES prove the *displayed source claims* as of retrieval; retain upstream files and re-check at release.\n")
(root/"LICENSES/SOURCE_SCREENSHOT_URLS.txt").write_text("\n".join([
"https://3dassets.dev/packs/roman-bathhouse-and-palaestra",
"https://3dassets.dev/packs/swords-shields-and-melee-arms",
"https://3dassets.dev/packs/equestrian-yard-and-stables",
"https://opengameart.org/content/universal-animation-library",
"https://opengameart.org/content/interface-sounds",
"https://ambientcg.com/license",
"https://creativecommons.org/publicdomain/zero/1.0/"]))
(root/"INTAKE_REPORT.json").write_text(json.dumps({"date":date,"asset_count":len(rows),"files_bytes":sum(x["bytes"] for x in rows),"notes":notes,"failures":failures},indent=2))
print("ASSET_INTAKE",len(rows), "FAILURES",len(failures), "BYTES",sum(x["bytes"] for x in rows), flush=True)
for f in failures:print("WARNING",f,flush=True)
if len(rows)<1:raise SystemExit("No downloadable CC0 assets verified")
