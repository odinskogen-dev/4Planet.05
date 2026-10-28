/**
 * PREVIEW ONLY until independent Gold plus explicit live cutover.
 * Add exactly five Claude V53 source-claim page candidates after original
 * approved V1 assembler. Keeps original 39+22 untouched.
 * Usage: --snapshot before assembler; --restore after assembler, before
 * species-page-validate --write-index.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const slugs=['clouded-leopard','sea-otter','snowy-owl','indian-peafowl','coconut-crab'];
const root=process.env.SPECIES_V53_TREE_ROOT;
assert.ok(root&&path.isAbsolute(root)&&root.includes('species-v53-build'),'Only isolated exact v53 source worktree accepted');
const mediaManifest=JSON.parse(fs.readFileSync(new URL('../next61/visual-selected-next8-20261028.json',import.meta.url),'utf8')).approved;
const dir=path.join(root,'public/species-data/v1');
const mediaDir=path.join(root,'public/assets/species/next61');
const snapshot=path.join(root,'reports/species-next61/next-five-signed-snapshot');
const mode=process.argv[2];
assert.ok(mode==='--snapshot'||mode==='--restore');
fs.mkdirSync(snapshot,{recursive:true});
const externalRecords=[];
const source=(slug)=>path.join(dir,slug+'.json');
const archived=(slug)=>path.join(snapshot,slug+'.json');
function sourceUrls(p){
 const urls=new Set();
 const walk=v=>{
   if(!v||typeof v!=='object')return;
   if(typeof v.source?.url==='string'&&v.source.url.startsWith('https://'))urls.add(v.source.url);
   for(const child of Object.values(v))if(typeof child==='object')walk(child);
 };
 walk(p);return urls;
}
for(const slug of slugs){
 const approved=mediaManifest[slug];
 assert.ok(approved&&Number.isInteger(approved.photoId)&&approved.visuallyCheckedOnContactSheet===true);
 assert.ok(/^[a-f0-9]{64}$/.test(approved.sha256));
 if(mode==='--snapshot'){
  const file=source(slug);
  assert.ok(fs.existsSync(file),'Missing original candidate data '+slug);
  const p=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(p.slug,slug);
  assert.equal(p.schema,'4PLANET_SPECIES_PAGE_01');
  assert.ok(p.identity?.scientificName&&p.identity?.commonName);
  assert.ok(sourceUrls(p).size>=3,'Source document shortfall '+slug);
  assert.ok(Object.values(p.facts||{}).flat().length>=8,'Source facts shortfall '+slug);
  assert.equal(p.provenance.review,'DRAFT');
  fs.copyFileSync(file,archived(slug));
  externalRecords.push({slug,sourceDocuments:sourceUrls(p).size,scientificName:p.identity.scientificName,photoApprovedSHA:approved.sha256});
  continue;
 }
 assert.ok(!fs.existsSync(source(slug)),'Assembler unexpectedly admitted candidate '+slug);
 assert.ok(fs.existsSync(archived(slug)),'Original science snapshot missing '+slug);
 const p=JSON.parse(fs.readFileSync(archived(slug),'utf8'));
 const url='https://inaturalist-open-data.s3.amazonaws.com/photos/'+approved.photoId+'/original.jpg';
 const res=await fetch(url,{headers:{'User-Agent':'4PLANET-SPECIES-licensed-image-byte-recovery/1.0'},signal:AbortSignal.timeout(28000)});
 assert.equal(res.status,200,'Photo source unavailable '+slug);
 assert.ok((res.headers.get('content-type')||'').startsWith('image/'),'Photo content not image '+slug);
 const bytes=Buffer.from(await res.arrayBuffer());
 assert.ok(bytes.length>20000&&bytes.length<16000000,'Photo file unexpected '+slug);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),approved.sha256,'Signed photo changed '+slug);
 fs.mkdirSync(mediaDir,{recursive:true});
 const local='/assets/species/next61/'+slug+'-hero.jpg';
 fs.writeFileSync(path.join(root,'public'+local),bytes);
 assert.ok(approved.sourcePage.startsWith('https://www.inaturalist.org/photos/'));
 assert.ok(['CC BY 4.0','CC0 1.0'].includes(approved.licence));
 const licenseUrl=approved.licence==='CC0 1.0'?'https://creativecommons.org/publicdomain/zero/1.0/':'https://creativecommons.org/licenses/by/4.0/';
 p.hero={
   url:'https://4species.com'+local,
   sourcePage:approved.sourcePage,credit:approved.artist,
   licence:approved.licence,licenseUrl,
   alt:p.identity.commonName+' ('+p.identity.scientificName+') in a verified source photograph',
   focus:'50% 50%',
 };
 p.gallery=[];
 p.provenance={...p.provenance,
   review:'DRAFT',
   founderRelease:'PREMIUM_V1_2026-10-28_CANDIDATE_ONLY',
   publisherSafety:'CLAUDE_V53_SOURCE_AND_HUMAN_CONTACT_SHEET_PREVIEW_NOT_INDEPENDENT_GOLD',
   photoId:approved.photoId,photoSha256:approved.sha256,photoRightsSource:approved.sourcePage};
 fs.writeFileSync(source(slug),JSON.stringify(p,null,2)+'\n');
 externalRecords.push({slug,sourceDocuments:sourceUrls(p).size,scientificName:p.identity.scientificName,sha:approved.sha256,photoBytes:bytes.length,licence:approved.licence,creator:approved.artist,sourcePage:approved.sourcePage});
}
if(externalRecords.length!==5)throw Error('Must process exactly five');
console.log('CLAUDE_V53_ADDITIVE_NEXT5_'+mode.slice(2).toUpperCase()+' '+JSON.stringify(externalRecords));
