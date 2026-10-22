import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function auditManifest(manifestFile, projectRoot = root) {
  const manifest = JSON.parse(fs.readFileSync(manifestFile,'utf8'));
  const problems=[], warnings=[], details=[];
  const ids=new Set(), names=new Set();
  const supported=new Set(['CC0-1.0','PROJECT_ORIGINAL','MIT','CC-BY-4.0','CC-BY-3.0']);
  for (const a of manifest.assets ?? []) {
    if(!a?.id || ids.has(a.id))problems.push(`duplicate/missing id: ${a?.id}`);
    ids.add(a?.id);
    if(typeof a?.path!=='string' || !a.path || path.isAbsolute(a.path) || a.path.split(/[\\/]/).includes('..')){
      problems.push(`unsafe path: ${a?.path}`);continue;
    }
    if(names.has(a.path))problems.push(`duplicate path: ${a.path}`);
    names.add(a.path);
    const absolute=path.resolve(projectRoot,a.path);
    if(!absolute.startsWith(path.resolve(projectRoot)+path.sep)){problems.push(`escaping directory ${a.path}`);continue;}
    if(!supported.has(a.license))problems.push(`license not whitelisted: ${a.id} ${a.license}`);
    if(!a.source_url || !a.rights_status || !a.provider)problems.push(`insufficient provenance: ${a.id}`);
    if(a.license?.startsWith('CC-BY') && !a.attributionText)problems.push(`attribution missing: ${a.id}`);
    if(!fs.existsSync(absolute)){problems.push(`file missing: ${a.path}`);continue;}
    const real=fs.realpathSync(absolute);
    if(!real.startsWith(path.resolve(projectRoot)+path.sep)){problems.push(`symlink escaping root: ${a.path}`);continue;}
    const buf=fs.readFileSync(absolute);
    const digest=crypto.createHash('sha256').update(buf).digest('hex');
    if(digest!==a.sha256)problems.push(`hash mismatch: ${a.path}`);
    if(buf.length!==a.bytes)problems.push(`size mismatch: ${a.path}`);
    if(a.file_type==='glb'){
      if(buf.length<12||buf.toString('ascii',0,4)!=='glTF'||buf.readUInt32LE(4)!==2||buf.readUInt32LE(8)!==buf.length)problems.push(`invalid GLB binary header: ${a.path}`);
    }
    if(a.rights_status!=='PRODUCTION_LICENSE_AND_ART_APPROVED')warnings.push(`not production approved: ${a.id} (${a.rights_status})`);
    details.push({id:a.id,bytes:buf.length,sha256:digest});
  }
  return {valid:problems.length===0,checked:details.length,problems,warnings,details};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const target=path.resolve(root,process.argv[2] ?? 'assetbank/manifest.json');
  const status=auditManifest(target);
  console.log(JSON.stringify({valid:status.valid,checked:status.checked,problems:status.problems,nonProductionAssetCount:status.warnings.length},null,2));
  if(!status.valid)process.exitCode=1;
}