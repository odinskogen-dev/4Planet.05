#!/usr/bin/env python3
"""ROMA original CC0 shields, swords and helmets; legal provenance and low-poly GLB when possible."""
import pathlib,requests,zipfile,io,hashlib,json,csv,os,shutil,re,html,subprocess
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import trimesh
ROOT=pathlib.Path('ROMA_GEAR_CC0');(ROOT/'equipment').mkdir(parents=True,exist_ok=True);(ROOT/'LICENSES').mkdir(exist_ok=True);(ROOT/'ORIGINAL_ARCHIVES').mkdir(exist_ok=True)
session=requests.Session();session.headers.update({'User-Agent':'Mozilla/5.0 (ROMA GAME LAB CC0 asset verification)'})
sources=[
('short_swords','https://opengameart.org/content/3d-swords-lowpol-cc0','CC0 Game Assets','https://opengameart.org/sites/default/files/swords.zip'),
('ancient_greek_weapon_set','https://opengameart.org/content/3d-greek-weapons-set','gamekorp','https://opengameart.org/sites/default/files/WeaponSetcc0.zip'),
('bucket_helmet_MEDIEVAL','https://opengameart.org/content/bucket-helmet','Lucian Pavel','https://opengameart.org/sites/default/files/Bucket%20Helmet.zip'),
]
items=[];failures=[];archives=[]
def rec(path,data,url,page,author,notes):
 dest=ROOT/path;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
 row=dict(file=path,source_url=url,author=author,licence="CC0-1.0",licence_page=page,downloaded="2026-10-17",sha256=hashlib.sha256(data).hexdigest(),bytes=len(data),notes=notes)
 items.append(row);print('ASSET',path,len(data),flush=True)
 return dest
def request(url,timeout=30):
 r=session.get(url,timeout=timeout);r.raise_for_status();return r
for name,page,author,url in sources:
 try:
  htmlbytes=request(page,timeout=18).content
  src=BeautifulSoup(htmlbytes,'html.parser').get_text(' ',strip=True)
  if 'CC0' not in src:raise ValueError('CC0 no longer on source page')
  (ROOT/'LICENSES'/f'{name}_rights_page.html').write_bytes(htmlbytes)
  binary=request(url,timeout=45).content
  if not zipfile.is_zipfile(io.BytesIO(binary)):raise ValueError('Not a ZIP; untrusted download')
  archives.append((name,binary,page,author,url))
  rec(f'ORIGINAL_ARCHIVES/{name}.zip',binary,url,page,author,"Official original archive, unchanged; source licence page archived.")
 except Exception as e:failures.append(f"{name}: {e}");print('BLOCKED',name,str(e)[:180],flush=True)
for name,raw,page,author,url in archives:
 with zipfile.ZipFile(io.BytesIO(raw)) as z:
  names=z.namelist()
  (ROOT/'LICENSES'/f'{name}_contents.txt').write_text("\n".join(names))
  tmp=ROOT/'_extract'/name
  for info in z.infolist():
   if info.is_dir() or info.file_size>15000000 or info.filename.startswith('/') or '..' in pathlib.PurePosixPath(info.filename).parts:continue
   dest=tmp/info.filename;dest.parent.mkdir(parents=True,exist_ok=True)
   dest.write_bytes(z.read(info))
  if name=='short_swords':
   glbs=list(tmp.rglob('*.glb'))
   glbs=sorted(glbs,key=lambda p:p.stat().st_size)
   print('SWORD_GLB_COUNT',len(glbs),flush=True)
   for k,p in enumerate(glbs[:8]):
    blob=p.read_bytes()
    if blob[:4]!=b'glTF':continue
    try:
     import struct
     l=struct.unpack_from('<I',blob,12)[0]
     j=json.loads(blob[20:20+l])
     triangles=sum(j['accessors'][x['indices']]['count']//3 for m in j.get('meshes',[]) for x in m['primitives'] if 'indices' in x)
    except Exception as e:triangles=-1
    rec(f'equipment/sword_cc0_{k+1:02}.glb',blob,url,page,author,f"Low-poly original sword GLB, {triangles} triangles; medieval/fantasy candidate, adapt into republican gladius; not claimed historically accurate.")
  elif name=='ancient_greek_weapon_set':
   candidates=[p for p in tmp.rglob('*') if p.suffix.lower()=='.obj' and any(q in p.stem.lower() for q in ['sword','shield','spear'])]
   print('GREEK_OBJ',[(str(p.relative_to(tmp)),p.stat().st_size) for p in candidates[:40]],flush=True)
   count={}
   for p in candidates[:12]:
    n=p.stem.lower();typ='shield' if 'shield' in n else ('spear' if 'spear' in n else 'sword')
    if count.get(typ,0)>=3:continue
    try:
     mesh=trimesh.load(p,force='scene',process=False)
     faces=sum(len(g.faces) for g in mesh.geometry.values() if hasattr(g,'faces'))
     out=mesh.export(file_type='glb')
     count[typ]=count.get(typ,0)+1
     rec(f'equipment/greek_{typ}_{count[typ]}.glb',out,url,page,author,f"{faces} triangles; modern Greek-inspired historical candidate, NOT exact 216 BCE Roman military style; derived GLB conversion from included OBJ.")
    except Exception as e:failures.append(f'OBJ convert {p.name}: {e}')
  elif name=='bucket_helmet_MEDIEVAL':
   objs=list(tmp.rglob('*.obj'))
   print('HELMET_OBJ',[(str(p.relative_to(tmp)),p.stat().st_size) for p in objs[:15]],flush=True)
   for k,p in enumerate(objs[:1]):
    try:
     obj=trimesh.load(p,force='scene',process=False);tri=sum(len(g.faces) for g in obj.geometry.values() if hasattr(g,'faces'))
     rec('equipment/helmet_MEDIEVAL_DO_NOT_USE_ROMA.glb',obj.export(file_type='glb'),url,page,author,f"{tri} triangles. Explicitly medieval bucket helmet NOT suitable for 216 BCE Rome; only technical reference, NOT shipped automatically.")
    except Exception as e:failures.append(f'Helmet conversion: {e}')
shutil.rmtree(ROOT/'_extract',ignore_errors=True)
cols=['file','source_url','author','licence','licence_page','downloaded','sha256','bytes','notes']
with (ROOT/'ASSET_MANIFEST.csv').open('w',newline='') as f:writer=csv.DictWriter(f,cols);writer.writeheader();writer.writerows(items)
(ROOT/'STATUS.json').write_text(json.dumps({'downloaded_files':len(items),'failure':failures,'candidate_licence':'per-source CC0, see evidence','note':'Original source packs kept unchanged. Converted OBJ->GLB byte changes labelled. Medieval helmets NOT 216 BCE accurate.'},indent=2))
(ROOT/'README.md').write_text('# ROMA equipment candidates\n\nThe horse is supplied separately as an original Quaternius horse converted without changing geometry or animation data. This optional equipment addon includes only verified CC0 original source archives and converted low-poly candidates.\n\n**Do not use the medieval bucket helmet** in 216 BCE gameplay. Make Montefortino-style republican helmets and scuta in code if historic-ready models cannot be found. Sword models here are illustrative and may require gladius reshaping. Greek shields are not Roman scuta.\n\nPer-file source URLs, authors, rights and SHA-256 checksums are in ASSET_MANIFEST.csv. CC0 pages in LICENSES are source evidence.\n\n')
print('FINAL_EQUIPMENT',len(items),'download_failures',len(failures),flush=True)
