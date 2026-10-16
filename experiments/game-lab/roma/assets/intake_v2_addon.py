#!/usr/bin/env python3
"""ROMA: licensed-additional source download; separate v2 delta, no mutation of v1."""
from pathlib import Path
import requests, json, csv, hashlib, zipfile, io, re, time, html, subprocess, shutil, os
from urllib.parse import urljoin
from bs4 import BeautifulSoup
ROOT=Path("ROMA_ASSETS_v2_ADDON"); ROOT.mkdir(parents=True,exist_ok=True)
for s in ["characters","equipment","landscape","audio","LICENSES","SOURCE_ARCHIVES"]: (ROOT/s).mkdir(exist_ok=True)
session=requests.Session();session.headers.update({"User-Agent":"Mozilla/5.0 ROMA Game Lab rights QA + candidate archive research"})
done=[];statuses=[];dated="2026-10-17"
def get(url,cap=35_000_000,timeout=18):
 r=session.get(url,timeout=timeout,allow_redirects=True)
 r.raise_for_status()
 if len(r.content)>cap:raise ValueError("exceeds download byte cap: "+str(len(r.content)))
 return r
def record(rel,data,url,creator,sourcepage,typ,notes,licence="CC0-1.0",ready="source-only"):
 assert data and not (data[:50].lstrip().startswith(b'<!') and rel.endswith((".zip",".glb",".ogg",".mp3")))
 fp=ROOT/rel;fp.parent.mkdir(parents=True,exist_ok=True);fp.write_bytes(data)
 done.append({"file":rel,"source_url":url,"creator":creator,"license":licence,"license_url":"https://creativecommons.org/publicdomain/zero/1.0/","license_evidence":sourcepage,"download_date":dated,"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest(),"classification":typ,"readiness":ready,"notes":notes})
 print("DOWNLOADED",rel,len(data),flush=True)
 return fp
def status(item,success,reason,source,details=""):
 statuses.append({"item":item,"downloaded":success,"status":reason,"source_page":source,"details":details})
 print("STATUS",item,"YES" if success else "NO",reason[:130],flush=True)
def licence_html(slug,url):
 try:
  r=get(url,cap=2_000_000,timeout=16);(ROOT/"LICENSES"/(slug+".html")).write_bytes(r.content)
  return r.text
 except Exception as e:
  status(slug+"_license_evidence",False,str(e),url)
  return None
def archive_download(slug,source_page,file_url,credit,limit=32_000_000):
 try:
  data=get(file_url,cap=limit,timeout=50).content
  if not zipfile.is_zipfile(io.BytesIO(data)):raise RuntimeError("Not ZIP")
  return record("SOURCE_ARCHIVES/"+slug+".zip",data,file_url,credit,source_page,"unmodified-provider-archive","Source ZIP retained exactly; review member model formats before integration")
 except Exception as e:status(slug,False,str(e),source_page,file_url);return None
# 3DAssets CC0 source: probe DNS/manifest/CDN separately. Only accept GLB magic.
root3d="https://3dassets.dev/packs/roman-bathhouse-and-palaestra"
licence_html("3dassets_roman",root3d)
api="https://3dassets.dev/api/v1/packs/roman-bathhouse-and-palaestra"
try:
 manifest=get(api,cap=4_000_000,timeout=22).json()
 (ROOT/"LICENSES"/"3dassets_roman_pack_manifest.json").write_text(json.dumps(manifest,indent=2))
 urls={}
 def rec(obj):
  if isinstance(obj,dict):
   for k,v in obj.items():
    if isinstance(v,str) and "cdn.3dassets.dev/assets/" in v and ".glb" in v:
     ident=re.search("/assets/(\\d+)/",v)
     urls[v]=ident.group(1) if ident else "model"
    rec(v)
  elif isinstance(obj,list):
   for v in obj:rec(v)
 rec(manifest)
 status("3dassets_api",True,f"manifest parsed, GLB links={len(urls)}",api)
 for n,(url,ident) in enumerate(list(urls.items())[:62]):
  try:
   data=get(url,cap=5_000_000,timeout=17).content
   if len(data)<20 or data[:4]!=b"glTF":raise ValueError("Not GLB")
   record(f"equipment/roman_modular_{ident}.glb",data,url,"3DAssets.dev",root3d,"static-roman-kit","Modular architecture, do not assume 216 BCE historical accuracy; period-vetted placement needed",ready="candidate")
  except Exception as e:status("3dassets_model_"+ident,False,str(e),url)
except Exception as e:status("3dassets_pack_api",False,str(e),api)
# Fallback 3dassets known canonical GLBs, verified magic only.
for slug,number in [("roman_bath_starter",37911),("roman_wall",37853),("roman_column",37861)]:
 if any("roman_modular_"+str(number) in x["file"] for x in done):continue
 url=f"https://cdn.3dassets.dev/assets/{number}/v1/model.glb"
 try:
  data=get(url,cap=5_000_000,timeout=13).content
  if data[:4]!=b"glTF":raise RuntimeError("not a GLB")
  record(f"equipment/{slug}.glb",data,url,"3DAssets.dev",root3d,"roman-prop","CC0 source kit; architectural historical review needed",ready="candidate")
 except Exception as e:status(slug,False,str(e),url)
# Quaternius horse pack; parse its actual first-party link (no guessing download URL).
horse_page="https://quaternius.com/packs/ultimateanimatedanimals.html"
horse_html=licence_html("quaternius_ultimate_animated_animals",horse_page)
if horse_html:
 soup=BeautifulSoup(horse_html,"html.parser")
 links=[]
 for a in soup.select("a[href]"):
  u=urljoin(horse_page,a["href"]);hint=(a.get_text(" ",strip=True)+" "+str(a.get("href"))).lower()
  if any(t in hint for t in ["download","itch.io","drive.google","animals","mediafire"]): links.append(u)
 links=list(dict.fromkeys(links))
 (ROOT/"LICENSES"/"quaternius_horse_candidate_download_links.txt").write_text("\n".join(links))
 for u in links[:9]:
  try:
   r=get(u,cap=37_000_000,timeout=38)
   if zipfile.is_zipfile(io.BytesIO(r.content)):
    fp=record("SOURCE_ARCHIVES/quaternius_animated_animals.zip",r.content,r.url,"Quaternius",horse_page,"horse_animated_source","CC0 page; archive NOT automatically a GLB; extract usable animated horse; verify bones, clips, triangle budget")
    status("Quaternius_animals",True,"Downloaded official original archive",horse_page)
    break
   status("Quaternius_url_"+u[:60],False,"Not a ZIP, HTML/store redirect",u,str(r.status_code))
  except Exception as e:status("Quaternius_link",False,str(e),u)
 else:status("Quaternius_animals",False,"No directly downloadable archive found in public links",horse_page)
# OGA original CC0 sound and animated model downloads. Keep all ZIPs unchanged + small PCM transcoded SFX.
sources=[
 ("sword_swishes","https://opengameart.org/content/swishes-sound-pack","https://opengameart.org/sites/default/files/swishes.zip","artisticdude","audio"),
 ("battle_attacks","https://opengameart.org/content/battle-sound-effects","https://opengameart.org/sites/default/files/battle_sound_effects_0.zip","artisticdude","audio"),
 ("armor_footsteps","https://opengameart.org/content/footsteps-leather-cloth-armor","https://opengameart.org/sites/default/files/footsteps.zip","HaelDB","audio"),
 ("lowpoly_animated_knight","https://opengameart.org/content/lowpoly-animated-knight","https://opengameart.org/sites/default/files/Knight%20Character%20by%20%40Quaternius.zip","Quaternius","character"),
]
for slug,page,url,author,category in sources:
 lic=licence_html(slug,page)
 if lic is None or "CC0" not in lic:status(slug,False,"CC0 evidence page unavailable or missing",page);continue
 z=archive_download(slug,page,url,author,limit=15_000_000)
 if z is None:continue
 data=z.read_bytes()
 files=zipfile.ZipFile(io.BytesIO(data))
 names=files.namelist()
 (ROOT/"LICENSES"/(slug+"_archive_members.txt")).write_text("\n".join(names[:500]))
 glb=[x for x in names if x.lower().endswith(".glb")]
 if category=="character":
  if glb:
   for m in glb[:2]:
    blob=files.read(m)
    if blob[:4]==b"glTF":record(f"characters/knight_candidate_{len(done)}.glb",blob,url,author,page,"rigged-character","Mediaeval silhouette must be replaced with 216 BCE outfit; check clips+rig and triangles",ready="candidate")
  else:status(slug+"_glb",False,"Original archive no GLB; source archive available for Blender conversion",page)
 else:
  audio=[m for m in names if m.lower().endswith((".wav",".ogg",".mp3")) and not m.startswith("__MACOSX/")]
  for n,m in enumerate(audio[:14]):
   try:
    b=files.read(m)
    if not b:continue
    src=ROOT/"SOURCE_ARCHIVES"/(slug+"_"+str(n)+Path(m).suffix.lower())
    src.write_bytes(b)
    # Derived compression is explicit; source ZIP preserved.
    if shutil.which("ffmpeg"):
     for ext,codec in [("ogg","libvorbis"),("mp3","libmp3lame")]:
      out=ROOT/"audio"/f"{slug}_{n+1:02}.{ext}"
      p=subprocess.run(["ffmpeg","-nostdin","-loglevel","error","-y","-i",str(src),"-ac","1","-ar","44100","-c:a",codec,"-q:a","4",str(out)],capture_output=True,timeout=20)
      if p.returncode==0 and out.is_file():
       by=out.read_bytes();out.unlink()
       record(f"audio/{slug}_{n+1:02}.{ext}",by,url,author,page,"CC0-SFX-transcode",f"Derived 44.1kHz mono from archive member {m}; original archived",ready="game-audio-ready")
   except Exception as e:status(slug+"_convert",False,str(e),page)
# Low bandwidth CC0 war horns: radio track, not authentic Roman cornu
wh="https://opengameart.org/content/war-horns";lic=licence_html("war_horns",wh)
if lic and "CC0" in lic:
 try:
  url="https://opengameart.org/sites/default/files/war_horns.mp3"
  data=get(url,cap=5_000_000,timeout=25).content
  if data[:3]!=b"ID3" and data[:2]!=b"\xff\xfb":raise RuntimeError("not MP3 file")
  record("audio/war_horns_source.mp3",data,url,"Eldritch Grim",wh,"CC0-music","Suspense musical horn track; not verified historically authentic Roman instrument",ready="soundtrack-candidate")
 except Exception as e:status("war_horns",False,str(e),wh)
# Source-only Kenney nature pack: prefer direct official download found in HTML.
kn="https://kenney.nl/assets/nature-kit"
kt=licence_html("kenney_nature_kit",kn)
if kt:
 soup=BeautifulSoup(kt,"html.parser")
 urls=[urljoin(kn,a.get("href")) for a in soup.select('a[href]') if 'download' in (a.get_text(" ",strip=True)+" "+str(a.get("href"))).lower() and a.get("href")]
 for url in list(dict.fromkeys(urls))[:5]:
  if not url.startswith("https://kenney.nl/"):continue
  try:
   r=get(url,cap=20_000_000,timeout=25)
   if zipfile.is_zipfile(io.BytesIO(r.content)):
    record("SOURCE_ARCHIVES/kenney_nature_kit.zip",r.content,r.url,"Kenney",kn,"CC0-nature-original","330 models; original source archive; trees are stylized, choose period-like olives/pines when possible");break
  except Exception as e:status("Kenney_nature_download",False,str(e),url)
else:status("Kenney_nature",False,"Source unavailable",kn)
# Canonical delta manifest, plus candidate backlog (no unverified file as asset).
manifest=ROOT/"ASSET_MANIFEST_ADDON.csv"
with manifest.open("w",newline="",encoding="utf8") as f:
 fields=list(done[0]) if done else ["file","source_url","creator","license","license_url","license_evidence","download_date","bytes","sha256","classification","readiness","notes"]
 wr=csv.DictWriter(f,fieldnames=fields);wr.writeheader();wr.writerows(done)
(ROOT/"DOWNLOAD_RESULTS.json").write_text(json.dumps(statuses,ensure_ascii=False,indent=2))
(ROOT/"ASSETBANK_ADDON.json").write_text(json.dumps({"schema":"GAME_LAB_ASSET_INTAKE_ADDON_V2","project_id":"PRJ-ODIN-003","date":dated,"source_branch":"roma-asset-intake-20261017","downloaded_file_count":len(done),"rights":"file-scoped; see ASSET_MANIFEST_ADDON.csv","assets":done,"unavailable":[s for s in statuses if not s["downloaded"]]},ensure_ascii=False,indent=2))
(ROOT/"README_FOR_CLAUDE.md").write_text("# ROMA verified additional assets v2\n\nThis is an ADDON to existing ROMA_ASSETS_v1, not a replacement.\n\nEach downloaded asset SHA and rights recorded in ASSET_MANIFEST_ADDON.csv; LICENSES includes source pages.\n\nSource archives are ORIGINAL byte-identical vendor files. Transcoded OGG/MP3 are derived CC0 files and original ZIP retained. A .blend/.fbx archive is NOT a game-ready .glb. Do not claim it is.\n\nFor soldiers do not deploy medieval knight model unchanged as Republic of Rome 216 BCE. For sound effects distinguish atmospheric music from authentic cornu/horn.\n\n3DAssets.dev may return 503 or CDN unavailable; download status is factual and never inferred from index listings. Check DOWNLOAD_RESULTS.json.\n\nNo public licence claims beyond direct source evidence.\n")
print("INTAKE_COMPLETE",len(done),"files",sum(d["bytes"] for d in done),"bytes",len(statuses),"status_records")
