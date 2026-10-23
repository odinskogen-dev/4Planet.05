#!/usr/bin/env python3
"""Read-only distribution asset acquisition for ROMA Claude handoff.
Sources: upstream CC0 KayKit GitHub, NOAA ETOPO 2022 60'', NASA BMNG 500m January.
Artifacts created on GitHub Actions runner, not pushed to repository.
"""
import os,io,hashlib,json,zipfile,struct,time,re,sys
from pathlib import Path
import requests
ROOT=Path('roma_source_exports'); ROOT.mkdir(exist_ok=True)
S=requests.Session(); S.headers['User-Agent']='ROMA-Historical-Asset-Research/1.0 (noncommercial data science example)'
LOG=[]
def grab(url,dest,timeout=420):
 dest.parent.mkdir(parents=True,exist_ok=True)
 r=S.get(url,timeout=timeout,stream=True)
 print('FETCH',r.status_code,'length',r.headers.get('Content-Length'),'url',url,flush=True)
 r.raise_for_status()
 with dest.open('wb') as f:
  for chunk in r.iter_content(1024*1024):
   if chunk:f.write(chunk)
 return dest

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def glbinfo(p):
 raw=Path(p).read_bytes();
 if raw[:4]!=b'glTF':return {'error':'bad GLB header'}
 jsize,typ=struct.unpack_from('<I4s',raw,12)
 dat=json.loads(raw[20:20+jsize]);faces=0
 for m in dat.get('meshes',[]):
  for prim in m.get('primitives',[]):
   idx=prim.get('indices')
   if idx is not None:
    n=dat['accessors'][idx]['count'];faces+=n//3
 return {'skins':len(dat.get('skins',[])),'triangles':faces,'animations':[a.get('name','') for a in dat.get('animations',[])],'meshCount':len(dat.get('meshes',[])),'bytes':len(raw)}

# Source A. Official upstream GitHub repository, pinned to commit for provenance.
try:
 api=S.get('https://api.github.com/repos/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/commits/main',timeout=30).json()
 commit=api.get('sha','main')
 url=f'https://codeload.github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/zip/{commit}'
 arc=grab(url,ROOT/'soldiers/KayKit_Adventurers_upstream_original.zip',120)
 z=zipfile.ZipFile(arc); kept=[]
 for file in z.namelist():
  if file.endswith('/') or '__MACOSX' in file:continue
  orig=file.split('/',1)[-1]
  if orig in ['LICENSE.txt','README.md'] or orig.startswith('addons/kaykit_character_pack_adventures/Characters/gltf/') and orig.endswith('.glb') or orig.startswith('addons/kaykit_character_pack_adventures/Assets/gltf/') and (orig.endswith('.gltf') or orig.endswith('.bin')):
   out=ROOT/'soldiers/KayKit_Adventurers_selected'/orig
   out.parent.mkdir(parents=True,exist_ok=True)
   out.write_bytes(z.read(file));kept.append(orig)
 infos=[]
 for p in (ROOT/'soldiers/KayKit_Adventurers_selected').rglob('*.glb'):
  infos.append(dict(path=str(p.relative_to(ROOT)),**glbinfo(p)))
 (ROOT/'soldiers'/'kaykit_animation_geometry_audit.json').write_text(json.dumps({'commit':commit,'original_url':url,'models':infos,'files':kept},indent=2)+'\n')
 print('KAYKIT_MODELS',json.dumps(infos),flush=True)
 LOG.append({'id':'KayKit','status':'downloaded','count':len(infos),'sha256_zip':sha(arc),'commit':commit})
except Exception as e:
 print('SOURCE_ERROR KAYKIT',repr(e),flush=True);LOG.append({'id':'KayKit','status':'ERROR','reason':repr(e)})

# Source B. NOAA ERDDAP ETOPO 2022 global terrain, subset 60 arc-sec (NOT synthetic).
try:
 import numpy as np
 from scipy.io import netcdf_file
 import rasterio
 from rasterio.transform import from_bounds
 from PIL import Image
 chunks=[]
 for lat0,lat1 in ((22.008333333,43.991666667),(44.008333333,65.991666667)):
  sections=[]
  for lon0,lon1 in ((345.008333333,359.991666667),(.008333333,74.991666667)):
   query=f'z[({lat0}):1:({lat1})][({lon0}):1:({lon1})]'
   url='https://oceanwatch.pifsc.noaa.gov/erddap/griddap/ETOPO_2022_v1_60s.nc?'+query
   tag=f'{round(lat0)}_{round(lat1)}_{round(lon0)}_{round(lon1)}'
   raw=grab(url,ROOT/f'geodata/NOAA_ET0PO_2022_raw_segments/{tag}.nc',350)
   with netcdf_file(raw,'r',mmap=False) as nc:
    a=nc.variables['z'][:].copy();lats=nc.variables['latitude'][:].copy();lons=nc.variables['longitude'][:].copy()
   print('NOAA_TILE',tag,a.shape,'LATS',lats[[0,-1]],'LONS',lons[[0,-1]],'RANGE',float(np.min(a)),float(np.max(a)),flush=True)
   if a.ndim!=2 or not 800<=a.shape[1]<=4501:raise ValueError('unexpected NOAA shape')
   sections.append(a)
  # each latitude block: west(-15..0) then east(0..75)
  band=np.concatenate(sections,axis=1)
  if band.shape[1]!=5400:raise ValueError('unexpected merged horizontal size '+str(band.shape))
  chunks.append(band)
 # lat ascending 22..66; reverse to north at top
 data=np.flipud(np.concatenate(chunks,axis=0))
 if data.shape!=(2640,5400):raise ValueError('Bad geodata shape '+str(data.shape))
 tif=ROOT/'geodata/ETOPO_2022_60arcsec_lon-15_75_lat22_66_EGM2008_int16.tif'
 profile=dict(driver='GTiff',height=2640,width=5400,count=1,dtype='int16',crs='EPSG:4326',transform=from_bounds(-15,22,75,66,5400,2640),compress='deflate',tiled=True,predictor=2)
 with rasterio.open(tif,'w',**profile) as dst:dst.write(np.rint(data).astype('int16'),1)
 # Height16 stores metre signed via offset -12000 m (0 --> -12000 m), avoids losing sea floor
 raw_u=np.clip(np.rint(data+12000),0,65535).astype('uint16')
 png=ROOT/'geodata/ETOPO_2022_60arcsec_lon-15_75_lat22_66_offset-12000m_16bit.png'
 Image.fromarray(raw_u).save(png)
 (ROOT/'geodata/ETOPO_README.json').write_text(json.dumps({'source':'NOAA NCEI ETOPO 2022 via oceanwatch.pifsc.noaa.gov ERDDAP','bbox_lonlat':[-15,22,75,66],'grid_shape_north_up':[2640,5400], 'resolution_arcseconds':60,'elevation_reference':'EGM2008','unit':'metre', 'png_decoder':'height_m=uint16-12000','tiff_dtype':'int16, signed metres','min_m':float(data.min()),'max_m':float(data.max()),'crs':'EPSG:4326','provenance':'Current planetary geography, not 216 BC terrain'},indent=2)+'\n')
 print('NOAA_SUBSET_SUCCESS',data.shape,'tif',tif.stat().st_size,'png',png.stat().st_size,'sha256',sha(tif),flush=True)
 LOG.append({'id':'NOAA_ETOPO2022','status':'downloaded','shape':[2640,5400],'sha256':sha(tif)})
except Exception as e:
 print('SOURCE_ERROR ETOPO',repr(e),flush=True);LOG.append({'id':'NOAA_ETOPO2022','status':'ERROR','reason':repr(e)})

# Source C. Native-resolution NASA BMNG January 2004 visible surface at 500m native tiled res.
try:
 from PIL import Image,ImageFile
 Image.MAX_IMAGE_PIXELS=None
 ImageFile.LOAD_TRUNCATED_IMAGES=False
 outdir=ROOT/'satellite/Blue_Marble_Next_Generation_Jan2004_500m';outdir.mkdir(parents=True,exist_ok=True)
 metadata=[];thumb=[]
 for tile,lons,xrange in [('B1',[-15,0],[18000,21600]),('C1',[0,75],[0,18000])]:
  url=f'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/january/world.200401.3x21600x21600.{tile}.jpg'
  orig=grab(url,ROOT/f'satellite/original_BMNG_Jan2004_{tile}_whole.jpg',400)
  with Image.open(orig) as img:
   img.load(); print('NASA_TILE',tile,img.size,flush=True)
   assert img.size==(21600,21600),f'unexpected NASA dimensions {img.size}'
   crop=img.crop((xrange[0],5760,xrange[1],16320))
   cropname=f'BMNG_500m_Jan2004_{tile}_lon{lons[0]}to{lons[1]}_lat22to66.jpg'
   crop.save(outdir/cropname,quality=86,optimize=True,subsampling=0)
   th=crop.resize((int((lons[1]-lons[0])/90*4096),2002),Image.Resampling.BILINEAR)
   thumb.append(th)
   wf=outdir/cropname.replace('.jpg','.jgw')
   dx=1/240;dy=-1/240
   wf.write_text(f'{dx}\n0.0\n0.0\n{dy}\n{lons[0]+dx/2}\n{66+dy/2}\n')
   metadata.append({'source_url':url,'name':cropname,'original_sha256':sha(orig),'crop_sha256':sha(outdir/cropname),'bbox':[lons[0],22,lons[1],66],'dimensions_px':crop.size,'pixels_per_degree':240,'native_source':'BMNG 500m (nominal equatorial)', 'planetary_surface':'modern January 2004, not ancient land cover'})
  orig.unlink()  # avoid including 130MB source tiles when the exact full-resolution crop is present
 combined=Image.new('RGB',(sum(i.width for i in thumb),2002));x=0
 for i in thumb:combined.paste(i,(x,0));x+=i.width
 combined.save(ROOT/'satellite/BMNG_ETOPO_region_preview_4096.jpg',quality=85,optimize=True)
 (outdir/'BMNG_500M_TILE_GEOREFERENCE.json').write_text(json.dumps(metadata,indent=2)+'\n')
 print('NASA_BMNG_FULL_NATIVE_SUBSET_PASS',metadata,flush=True)
 LOG.append({'id':'NASA_BMNG_500m','status':'downloaded','tiles':len(metadata),'sizes':[x['dimensions_px'] for x in metadata]})
except Exception as e:
 print('SOURCE_ERROR BMNG',repr(e),flush=True);LOG.append({'id':'NASA_BMNG_500m','status':'ERROR','reason':repr(e)})

(ROOT/'DATA_ACQUISITION_STATUS.json').write_text(json.dumps(LOG,indent=2)+'\n')
# Compress all exported directory to one (if >~150MB upload to separate artifacts per directory in workflow)
print('ASSET_ACQUISITION_FINISHED',json.dumps(LOG),flush=True)
