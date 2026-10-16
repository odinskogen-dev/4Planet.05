#!/usr/bin/env python3
"""Capture genuine CC0 Quaternius horse from first-party Google Drive download button."""
from pathlib import Path
import gdown, zipfile, os, csv, json, hashlib, shutil, subprocess
root=Path("ROMA_HORSE_CC0_v1");root.mkdir(exist_ok=True)
(root/"LICENSES").mkdir(exist_ok=True)
(root/"horse_source").mkdir(exist_ok=True)
url="https://drive.google.com/drive/folders/1uJ3N5HfB7jKTseJUNQr3N4YaN0UuEtHk?usp=sharing"
licensepage="https://quaternius.com/packs/ultimateanimatedanimals.html"
issues=[]
try:
 files=gdown.download_folder(url=url,output="ROMA_HORSE_DOWNLOAD",remaining_ok=True,quiet=False)
 print("GDOWN_FILES",str(files)[:12000],flush=True)
except Exception as e:
 files=[];issues.append("Google Drive first-party download failed: "+str(e));print("GDOWN_BLOCKED",e,flush=True)
raws=[p for p in Path("ROMA_HORSE_DOWNLOAD").rglob("*") if p.is_file()] if Path("ROMA_HORSE_DOWNLOAD").exists() else []
print("DOWNLOADED_FILES",[(p.name,p.stat().st_size) for p in raws][:100],flush=True)
for p in raws:
 if p.stat().st_size>100_000_000:continue
 if p.suffix.lower()==".zip":
  try:
   z=zipfile.ZipFile(p)
   names=z.namelist()
   horse=[x for x in names if ("horse" in x.lower() or "stallion" in x.lower()) and not x.endswith("/") and not "__MACOSX" in x]
   # If individual horse model .gltf + .bin + textures, keep everything in its horse directory.
   matched_dirs={str(Path(x).parent) for x in horse if Path(x).parent.as_posix()!="."}
   required=set(horse)
   for n in names:
    if any(n.startswith(folder+"/") for folder in matched_dirs):required.add(n)
   print("ARCHIVE_MEMBER_HORSE",p.name,len(names),len(required),list(sorted(required))[:80],flush=True)
   for name in sorted(required):
    if name.endswith("/") or name.startswith("/") or ".." in Path(name).parts:continue
    data=z.read(name)
    if len(data)>25_000_000: continue
    dest=root/"horse_source"/p.stem/name
    dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
  except Exception as e:issues.append(f"{p.name}: {e}")
 elif "horse" in p.as_posix().lower() and p.stat().st_size<25_000_000:
  dest=root/"horse_source"/p.name;shutil.copyfile(p,dest)
assets=[];found=[p for p in (root/"horse_source").rglob("*") if p.is_file()]
print("HORSE_SOURCE_FILES",len(found),[(p.name,p.stat().st_size) for p in found[:70]],flush=True)
for p in found:
 data=p.read_bytes()
 assets.append({"file":p.relative_to(root).as_posix(),"source_url":url,"author":"Quaternius","license":"CC0-1.0","license_evidence":licensepage,"date":"2026-10-17","sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data),"notes":"Original member of free first-party Quaternius Ultimate Animated Animal Pack. Animation/rig and triangles NOT tested."})
 (root/"LICENSES"/"Quaternius_CC0_licence_page.txt").write_text("Official source: "+licensepage+"\nCC0 from source page, July 2021 Ultimate Animated Animals, 12 animals, gallop/walk/death. Google Drive folder extracted from official DOWNLOAD button: "+url+"\n")
 (root/"LICENSES"/"GoogleDrive_unmodified_member_names.txt").write_text("\n".join(str(p) for p in found))
with (root/"ASSET_MANIFEST.csv").open("w",newline="") as f:
 cols=["file","source_url","author","license","license_evidence","date","sha256","bytes","notes"];w=csv.DictWriter(f,fieldnames=cols);w.writeheader();w.writerows(assets)
(root/"REPORT.json").write_text(json.dumps({"files_count":len(assets),"issues":issues,"source":url,"note":"No animated horse GLB can be claimed until GLB actually exists and animation channels validated."},indent=2))
print("HORSE_INTAKE_RESULT",len(assets),"ISSUES",issues,flush=True)
