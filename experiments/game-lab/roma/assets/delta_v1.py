import requests, io, gzip, numpy as np, rasterio, json, hashlib, math, os, csv
from pathlib import Path
from rasterio.transform import from_bounds
from PIL import Image
root=Path('ROMA_ASSET_DELTA');root.mkdir(exist_ok=True)
for d in ['equipment','terrain','LICENSES']: (root/d).mkdir(exist_ok=True)
rows=[];issues=[]
sess=requests.Session(); sess.headers.update({'User-Agent':'ROMA GAME LAB asset rights audit'})
sources=[
('roman_architecture_starter','equipment/roman_architecture_starter.glb','https://cdn.3dassets.dev/assets/37911/v1/model.glb','https://3dassets.dev/packs/roman-bathhouse-and-palaestra'),
('roman_wall','equipment/roman_wall.glb','https://cdn.3dassets.dev/assets/37853/v1/model.glb','https://3dassets.dev/assets/roman-bathhouse-and-palaestra-bathhouse-wall-module-0e40db23'),
('corinthian_column','equipment/corinthian_column.glb','https://cdn.3dassets.dev/assets/37861/v1/model.glb','https://3dassets.dev/assets/roman-bathhouse-and-palaestra-column-corinthian-6e5a51d3'),
('horse_static','equipment/horse_standing_STATIC.glb','https://cdn.3dassets.dev/assets/129/v1/model.glb','https://3dassets.dev/assets/frontier-saddle-horse'),
('sword_medieval','equipment/sword_medieval_not_gladius.glb','https://cdn.3dassets.dev/assets/38880/v1/model.glb','https://3dassets.dev/assets/swords-shields-and-melee-arms-arming-sword-38b19f2b'),
('shield_round','equipment/shield_round.glb','https://cdn.3dassets.dev/assets/38912/v1/model.glb','https://3dassets.dev/assets/swords-shields-and-melee-arms-round-shield-6c2a8164'),
]
def save(path,data,url,author,license,notes):
 p=root/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
 rows.append(dict(file=path,source_url=url,author=author,licence=license,download_date='2026-10-17',notes=notes,bytes=len(data),sha256=hashlib.sha256(data).hexdigest()))
for id,rel,url,page in sources:
 try:
  r=sess.get(url,timeout=20);r.raise_for_status();b=r.content
  if len(b)<20 or b[:4]!=b'glTF':raise RuntimeError(f'Not GLB {r.status_code} {len(b)}')
  save(rel,b,url,'3DAssets.dev','CC0-1.0',f'Official CC0 source page: {page}; unchanged bytes; verify period appropriateness and mobile performance')
  print('DOWNLOAD_OK',id,len(b),flush=True)
 except Exception as e:issues.append(f'{id}: {e}');print('DOWNLOAD_BLOCKED',id,str(e)[:100],flush=True)
try:
 src='https://elevation-tiles-prod.s3.amazonaws.com/skadi/N41/N41E016.hgt.gz'
 r=sess.get(src,timeout=35);r.raise_for_status();raw=gzip.decompress(r.content)
 side=math.isqrt(len(raw)//2);assert side in (1201,3601)
 height=np.frombuffer(raw,dtype='>i2').reshape(side,side)
 lat,lon=41.295,16.138
 dlat=2/111.32;dlon=2/(111.32*math.cos(math.radians(lat)))
 west,east=lon-dlon,lon+dlon;south,north=lat-dlat,lat+dlat
 c0=max(0,int((west-16)*(side-1)));c1=min(side,int(math.ceil((east-16)*(side-1)))+1)
 y0=max(0,int((42-north)*(side-1)));y1=min(side,int(math.ceil((42-south)*(side-1)))+1)
 tile=height[y0:y1,c0:c1].copy();tile[tile< -1000]=0
 mem=rasterio.MemoryFile()
 with mem.open(driver='GTiff',height=tile.shape[0],width=tile.shape[1],count=1,dtype='int16',crs='EPSG:4326',transform=from_bounds(west,south,east,north,tile.shape[1],tile.shape[0])) as ds:ds.write(tile.astype('int16'),1)
 save('terrain/cannae_dem.tif',mem.read(),src,'NASA SRTM distributed by Tilezen/Mapzen','Public domain USGS SRTM; attribution-requested','Derived 4x4km clip. USGS credit requested; see LICENSES/MAPZEN_SRTM.txt')
 out=io.BytesIO();Image.fromarray(tile.astype('uint16')).save(out,format='PNG')
 save('terrain/cannae_height16.png',out.getvalue(),src,'NASA SRTM distributed by Tilezen/Mapzen','Public domain USGS SRTM; attribution-requested','Derived 16-bit positive elevation in metres, north-up; USGS credit requested.')
 (root/'terrain/cannae_bbox.txt').write_text(f'west={west:.8f}\nsouth={south:.8f}\neast={east:.8f}\nnorth={north:.8f}\nEPSG:4326\nwidth={tile.shape[1]}\nheight={tile.shape[0]}\n')
 (root/'LICENSES/MAPZEN_SRTM.txt').write_text('SRTM elevation courtesy of the U.S. Geological Survey. Dataset from https://registry.opendata.aws/terrain-tiles/ . Source rights: https://github.com/tilezen/joerd/blob/master/docs/attribution.md ; credit is requested; not CC0 by blanket assertion. Region may use SRTM public-domain input. Validate source tile provenance before public release.\n')
 print('DEM_OK',tile.shape,flush=True)
except Exception as e:issues.append('SRTM '+str(e));print('DEM_BLOCKED',str(e),flush=True)
with (root/'ASSET_MANIFEST_DELTA.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=['file','source_url','author','licence','download_date','notes','bytes','sha256']);w.writeheader();w.writerows(rows)
(root/'INTAKE_REPORT_DELTA.json').write_text(json.dumps(dict(success=len(rows),issues=issues),indent=2))
if not rows:raise SystemExit('No delta assets available')
