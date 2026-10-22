#!/usr/bin/env python3
"""Generates technically rigged low-poly GLB animation demos, not production art.
Vertex skin weights are rigid: 100% to a named joint. No third-party binaries.
"""
import hashlib,json,math,struct
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assetbank/models/prototype-rigged';OUT.mkdir(parents=True,exist_ok=True)

# Joint hierarchy: (name,parent, local bind translation)
CONFIGS={
 'soldier':{
  'joints':[('pelvis',-1,(0,1,0)),('torso',0,(0,.43,0)),('arm_l',1,(-.37,.22,0)),('arm_r',1,(.37,.22,0)),('leg_l',0,(-.18,-.37,0)),('leg_r',0,(.18,-.37,0))],
  'parts':[('torso',(0,.04,0),(.72,.83,.38)),('pelvis',(0,-.15,0),(.55,.33,.4)),('arm_l',(0,-.32,0),(.23,.7,.26)),('arm_r',(0,-.32,0),(.23,.7,.26)),('leg_l',(0,-.43,0),(.22,.77,.28)),('leg_r',(0,-.43,0),(.22,.77,.28))],
  'colour':[.67,.29,.19,1], 'angles':{'arm_l':.45,'arm_r':-.45,'leg_l':-.6,'leg_r':.6}},
 'horse':{
  'joints':[('body',-1,(0,1.35,0)),('neck',0,(0,.05,.55)),('head',1,(0,.34,.18)),
            ('fore_l',0,(-.34,-.42,.38)),('fore_r',0,(.34,-.42,.38)),
            ('hind_l',0,(-.34,-.42,-.44)),('hind_r',0,(.34,-.42,-.44))],
  'parts':[('body',(0,0,0),(.86,.72,1.48)),('neck',(0,.22,.09),(.37,.66,.35)),('head',(0,.05,.18),(.38,.38,.6)),
           ('fore_l',(0,-.47,0),(.22,.92,.22)),('fore_r',(0,-.47,0),(.22,.92,.22)),
           ('hind_l',(0,-.47,0),(.25,.92,.25)),('hind_r',(0,-.47,0),(.25,.92,.25))],
   'colour':[.36,.24,.15,1], 'angles':{'fore_l':.37,'fore_r':-.37,'hind_l':-.42,'hind_r':.42}}
}

def box_geometry(center,size):
 cx,cy,cz=center;dx,dy,dz=[s/2 for s in size]
 vs=np.asarray([(x,y,z) for x in (-dx,dx) for y in (-dy,dy) for z in (-dz,dz)],dtype=np.float32)
 vs+=np.asarray(center,np.float32)
 faces=[(0,1,3),(0,3,2),(4,6,7),(4,7,5),(0,4,5),(0,5,1),(2,3,7),(2,7,6),(0,2,6),(0,6,4),(1,5,7),(1,7,3)]
 return vs,np.asarray(faces,dtype=np.uint16)

def qx(a):return [math.sin(a/2),0,0,math.cos(a/2)]

def export(kind,cfg):
 idx={joint[0]:i for i,joint in enumerate(cfg['joints'])}
 joints=cfg['joints'];world=[]
 for name,parent,loc in joints:
  parentloc=np.zeros(3) if parent<0 else world[parent]
  world.append(parentloc+np.asarray(loc,dtype=float))
 V=[];F=[];J=[];K=[]
 for jointname,offset,size in cfg['parts']:
  ji=idx[jointname];center=world[ji]+np.asarray(offset,dtype=float)
  verts,faces=box_geometry(center,size);base=len(V)
  V.extend(verts.tolist());F.extend((faces+base).tolist());J.extend([[ji,0,0,0]]*8);K.extend([[1,0,0,0]]*8)
 attrs={'POSITION':np.asarray(V,dtype=np.float32),'JOINTS_0':np.asarray(J,dtype=np.uint16),'WEIGHTS_0':np.asarray(K,dtype=np.float32)}
 indices=np.asarray(F,dtype=np.uint16).reshape(-1)
 ibm=[]
 for w in world:
  # Flatten matrix in column-major order, inverse translation is in fourth column.
  m=np.eye(4,dtype=np.float32);m[:3,3]=-w;ibm.extend(m.flatten(order='F'))
 attrs['IBM']=np.asarray(ibm,dtype=np.float32)
 times=np.asarray([0,.25,.5,.75,1],np.float32)
 attrs['TIME']=times
 for j in cfg['angles']:
  idxname=idx[j];angles=[0,cfg['angles'][j],0,-cfg['angles'][j],0]
  attrs['ROT_'+j]=np.asarray([qx(a) for a in angles],dtype=np.float32)
 buffer=bytearray();views=[];accessors=[]
 def add_blob(data,type_,component_type,count,accessor_type,minmax=False):
  b=data.tobytes(order='C')
  while len(buffer)%4:buffer.append(0)
  off=len(buffer);buffer.extend(b)
  view_index=len(views);views.append({'buffer':0,'byteOffset':off,'byteLength':len(b),'target':34962 if type_=='vertex' else 34963 if type_=='indices' else None})
  if views[-1]['target'] is None:del views[-1]['target']
  a={'bufferView':view_index,'componentType':component_type,'count':count,'type':accessor_type}
  if minmax:a['min']=[float(x) for x in np.min(data,axis=0)];a['max']=[float(x) for x in np.max(data,axis=0)]
  accessors.append(a);return len(accessors)-1
 pos=add_blob(attrs['POSITION'],'vertex',5126,len(V),'VEC3',True)
 joints4=add_blob(attrs['JOINTS_0'],'vertex',5123,len(V),'VEC4')
 weights4=add_blob(attrs['WEIGHTS_0'],'vertex',5126,len(V),'VEC4')
 ind=add_blob(indices,'indices',5123,len(indices),'SCALAR')
 inverse=add_blob(attrs['IBM'],'other',5126,len(joints),'MAT4')
 time=add_blob(times,'other',5126,len(times),'SCALAR');accessors[time]['min']=[0];accessors[time]['max']=[1]
 sampler=[];channels=[]
 for name in cfg['angles']:
  k=add_blob(attrs['ROT_'+name],'other',5126,5,'VEC4')
  sampler.append({'input':time,'output':k,'interpolation':'LINEAR'})
  channels.append({'sampler':len(sampler)-1,'target':{'node':idx[name],'path':'rotation'}})
 nodes=[{'name':name,'translation':list(loc),'children':[]} for name,parent,loc in joints]
 for i,(_,parent,_) in enumerate(joints):
  if parent>=0:nodes[parent]['children'].append(i)
 for n in nodes:
  if not n['children']:del n['children']
 meshNode=len(nodes);nodes.append({'name':kind+'-skinned-mesh','mesh':0,'skin':0})
 asset={'asset':{'version':'2.0','generator':'CUB Game Lab procedural skeletal GLB 02'},
  'scene':0,'scenes':[{'nodes':[0,meshNode]}],'nodes':nodes,
  'meshes':[{'name':kind,'primitives':[{'attributes':{'POSITION':pos,'JOINTS_0':joints4,'WEIGHTS_0':weights4},'indices':ind,'material':0,'mode':4}]}],
  'materials':[{'name':kind+'-mat','pbrMetallicRoughness':{'baseColorFactor':cfg['colour'],'metallicFactor':0,'roughnessFactor':.92},'doubleSided':True}],
  'skins':[{'name':kind+'-skeleton','inverseBindMatrices':inverse,'joints':list(range(len(joints))),'skeleton':0}],
  'animations':[{'name':kind+'-walk-cycle','samplers':sampler,'channels':channels}],
  'buffers':[{'byteLength':len(buffer)}],'bufferViews':views,'accessors':accessors}
 raw=json.dumps(asset,separators=(',',':')).encode();raw+=b' ' * ((-len(raw))%4)
 while len(buffer)%4:buffer.append(0)
 total=12+8+len(raw)+8+len(buffer)
 glb=struct.pack('<4sII',b'glTF',2,total)+struct.pack('<I4s',len(raw),b'JSON')+raw+struct.pack('<I4s',len(buffer),b'BIN\x00')+buffer
 path=OUT/(kind+'_rigged_animated_demo.glb');path.write_bytes(glb)
 return {'path':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(glb).hexdigest(),'bytes':len(glb),'joints':len(joints),'animations':1,'keyframes':5}

result=[]
for name,cfg in CONFIGS.items():result.append(export(name,cfg))
(OUT/'RIG_AND_ANIMATION_REPORT.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))