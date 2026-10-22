#!/usr/bin/env python3
"""CUB Asset Factory 02. Offline, conservative, provenance-preserving asset workflow.

No external downloads without a separate, explicit allowlist/user command.
3D collision proxy generation uses trimesh only when present; no visual LOD claims.
"""
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, shutil, struct, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/'assetbank/manifest.json'

def hashfile(path:Path)->str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    return h.hexdigest()

def glb_info(path:Path):
    with path.open('rb') as f:
        h=f.read(12)
        if len(h)!=12:raise ValueError('Short GLB')
        magic,version,total=struct.unpack('<4sII',h)
        if magic!=b'glTF' or version!=2 or total!=path.stat().st_size:raise ValueError('Invalid GLB header')
        n,t=struct.unpack('<I4s',f.read(8))
        if t!=b'JSON' or n>20_000_000:raise ValueError('Missing GLB JSON')
        data=json.loads(f.read(n).decode('utf8'))
    mesh_count=len(data.get('meshes',[]));nodes=len(data.get('nodes',[]));animated=len(data.get('animations',[]))
    triangle_estimate=0
    for mesh in data.get('meshes',[]):
        for primitive in mesh.get('primitives',[]):
            mode=primitive.get('mode',4)
            if mode!=4:continue
            accessor=primitive.get('indices',primitive.get('attributes',{}).get('POSITION'))
            if accessor is None:continue
            triangle_estimate+=int(data['accessors'][accessor]['count'])//3
    return {'meshes':mesh_count,'nodes':nodes,'animations':animated,'triangleEstimate':triangle_estimate,'byteSize':path.stat().st_size}

def audit(manifest_path=MANIFEST):
    j=json.loads(manifest_path.read_text());issues=[];rows=[]
    seen_hashes={};seen_paths=set()
    for a in j['assets']:
        rel=a['path'];p=ROOT/rel
        if Path(rel).is_absolute() or '..' in Path(rel).parts:issues.append(f'path traversal: {rel}');continue
        if rel in seen_paths:issues.append(f'duplicate path: {rel}')
        seen_paths.add(rel)
        if not p.is_file():issues.append(f'missing: {rel}');continue
        h=hashfile(p)
        if h!=a['sha256']:issues.append(f'hash mismatch: {rel}')
        if a['bytes']!=p.stat().st_size:issues.append(f'byte length changed: {rel}')
        if a.get('license') not in ('CC0-1.0','PROJECT_ORIGINAL'):issues.append(f'rights manual review: {rel}')
        try:info=glb_info(p)
        except Exception as e:issues.append(f'geometry: {rel}: {e}');continue
        if h in seen_hashes:issues.append(f'identical duplicate: {rel} = {seen_hashes[h]}')
        seen_hashes[h]=rel
        rows.append({'id':a['id'],'file':rel,'sha256':h,'status':a.get('rights_status'),'license':a.get('license'),**info})
    return {'schema':'cub.asset.audit.v2','total':len(j['assets']),'readable':len(rows),'pass':not issues,'issues':issues,'models':rows,'sumBytes':sum(r['byteSize'] for r in rows)}

def colliders(ids:list[str]|None=None,manifest_path=MANIFEST):
    import trimesh
    records=json.loads(manifest_path.read_text())['assets'];chosen=[a for a in records if ids is None or a['id'] in ids]
    out=ROOT/'assetbank/generated/collision-proxies';out.mkdir(parents=True,exist_ok=True)
    rows=[]
    for a in chosen:
        p=ROOT/a['path'];mesh=trimesh.load(p,force='scene');bounds=mesh.bounds
        if bounds is None:continue
        ext=[float(x) for x in (bounds[1]-bounds[0])];centre=(bounds[0]+bounds[1])/2
        if any(n<=0 for n in ext):continue
        proxy=trimesh.creation.box(extents=ext);proxy.apply_translation(centre)
        destination=out/(a['id']+'.collision.glb')
        destination.write_bytes(proxy.export(file_type='glb'))
        rows.append({'sourceId':a['id'],'derived':str(destination.relative_to(ROOT)),
            'sha256':hashfile(destination),'licenceInherited':a['license'],'bounds':[list(map(float,bounds[0])),list(map(float,bounds[1]))],
            'colliderKind':'STATIC_AXIS_ALIGNED_BOUNDING_BOX','status':'PROTOTYPE_COLLISION_ONLY_NOT_NAVMESH','triangles':len(proxy.faces)})
    (out/'manifest.json').write_text(json.dumps({'schema':'cub.collider.proxies.v1','items':rows},indent=2)+'\n')
    return rows

def intake(source, destination_name, licence, evidence, author, source_url, manifest_path=MANIFEST):
    """Staged intake only; explicit legal metadata required, never silent ready-to-ship."""
    if licence not in ('CC0-1.0','PROJECT_ORIGINAL'):raise ValueError('Unapproved license; stop for manual review')
    evidence=Path(evidence)
    if not evidence.is_file() or evidence.stat().st_size==0:raise ValueError('Licence evidence file missing')
    src=Path(source)
    if not src.is_file() or src.suffix.lower()!='.glb':raise ValueError('Not a GLB')
    if '/' in destination_name or '\\' in destination_name or not destination_name.endswith('.glb'):raise ValueError('Invalid filename')
    info=glb_info(src)
    dest=ROOT/'assetbank/intake-quarantine'/destination_name
    if dest.exists():raise FileExistsError('Overwrite prohibited')
    dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
    (dest.with_suffix('.evidence.txt')).write_bytes(evidence.read_bytes())
    j=json.loads(manifest_path.read_text())
    entry={'id':'intake-'+dest.stem,'path':str(dest.relative_to(ROOT)),'file_type':'glb','sha256':hashfile(dest),'bytes':dest.stat().st_size,
        'provider':author,'license':licence,'source_url':source_url,'rights_status':'QUARANTINED_MANUAL_REVIEW','runtime_status':'NOT_INTEGRATED',
        'historical_authenticity':'NOT_PERIOD_VERIFIED','notes':'Source evidence retained; not approved for shipping'}
    if any(a['id']==entry['id'] or a['sha256']==entry['sha256'] for a in j['assets']):
        dest.unlink();dest.with_suffix('.evidence.txt').unlink();raise ValueError('Duplicate asset id/content')
    j['assets'].append(entry);manifest_path.write_text(json.dumps(j,indent=2)+'\n')
    return entry,info

def main():
    parser=argparse.ArgumentParser();sub=parser.add_subparsers(dest='action',required=True)
    sub.add_parser('audit');c=sub.add_parser('colliders');c.add_argument('--ids',nargs='*',default=None)
    i=sub.add_parser('intake');i.add_argument('--source',required=True);i.add_argument('--file',required=True);i.add_argument('--license',required=True);i.add_argument('--evidence',required=True);i.add_argument('--author',required=True);i.add_argument('--source-url',required=True)
    opts=parser.parse_args()
    if opts.action=='audit':report=audit();(ROOT/'qa/asset-audit-02.json').write_text(json.dumps(report,indent=2)+'\n');print(f"AUDIT {report['readable']}/{report['total']} {'PASS' if report['pass'] else 'FAIL'}");[print(i,file=sys.stderr) for i in report['issues']];sys.exit(0 if report['pass'] else 2)
    if opts.action=='colliders':items=colliders(opts.ids);print(f'GENERATED {len(items)} collision-only GLB proxies')
    if opts.action=='intake':e,info=intake(opts.source,opts.file,opts.license,opts.evidence,opts.author,opts.source_url);print(json.dumps({'entry':e,'geometry':info},indent=2))
if __name__=='__main__':main()