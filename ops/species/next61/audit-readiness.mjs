/**
 * SOURCE-EVIDENCE inventory only for the original additional 61 Claude V53
 * species. Does not declare Gold, alter published content or serve URLs.
 * Run: node ops/species/next61/audit-readiness.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
const dir=new URL('.',import.meta.url);
const files=['mammals.mjs','birds.mjs','reptiles.mjs','fishes.mjs','invertebrates-plants.mjs'];
const candidates=[];
for(const f of files){
  const obj=await import(new URL(f,dir));
  const list=Object.values(obj).find(v=>Array.isArray(v));
  if(!list)throw Error('No species data in '+f);
  candidates.push(...list);
}
const seen=new Set();
for(const row of candidates){
  const slug=row[0],sci=row[2];
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||seen.has(slug)||!sci)throw Error('Duplicate/invalid species '+slug);
  seen.add(slug);
}
if(candidates.length!==61||seen.size!==61)throw Error('Exactly 61 original Claude expansion candidates required');
const published39=new Set('orca african-savanna-elephant asian-elephant bald-eagle black-rhinoceros blue-whale bornean-orangutan cheetah chimpanzee emperor-penguin giant-panda giraffe gray-wolf great-white-shark green-sea-turtle hippopotamus jaguar lion monarch-butterfly polar-bear tiger english-oak western-honey-bee fly-agaric common-octopus atlantic-puffin sei-whale eurasian-lynx humpback-whale sperm-whale harbour-porpoise bottlenose-dolphin atlantic-cod blue-mussel whale-shark leopard eastern-gorilla acropora-palmata hyacinth-macaw'.split(' '));
if(published39.size!==39||candidates.some(s=>published39.has(s[0])))throw Error('Original live 39 overlap detected');
const live61=new Set('koala quokka capybara red-fox giant-anteater giant-otter walrus common-kingfisher secretary-bird scarlet-macaw peregrine-falcon ocean-sunfish giant-manta-ray greater-blue-ringed-octopus peacock-mantis-shrimp venus-flytrap titan-arum giant-sequoia'.split(' '));
if(live61.size!==18||[...live61].some(s=>!seen.has(s)))throw Error('Previous 18 live cohort mismatch');
const claimPacks=new Map();
for(let n=1;n<=10;n++){
  const name='science-claims-stage'+n+'.mjs';
  const exports=await import(new URL(name,dir));
  const obj=Object.values(exports).find(v=>v&&!Array.isArray(v)&&typeof v==='object'&&Object.values(v).some(x=>x?.claims));
  if(!obj)throw Error('Empty source-claims stage '+n);
  for(const [slug,pack] of Object.entries(obj)){
    if(claimPacks.has(slug))throw Error('Duplicate source-claims pack '+slug);
    if(!seen.has(slug))throw Error('Unlisted species source-claims pack '+slug);
    claimPacks.set(slug,{stage:n,pack});
  }
}
const imageManifest=JSON.parse(fs.readFileSync(new URL('v1-visual-approved-20261022.json',dir),'utf8'));
const shortlisted=imageManifest.approved||{};
const remaining=candidates.filter(s=>!live61.has(s[0])).map(s=>{
  const slug=s[0],p=claimPacks.get(slug),facts=p?.pack?.claims??[];
  const uniqueDocs=new Set(facts.map(x=>x.source?.url).filter(x=>x?.startsWith('https://')));
  const publishers=new Set(facts.map(x=>x.source?.publisher).filter(Boolean));
  const sourcePackValid=facts.length>=8 && uniqueDocs.size>=3 && publishers.size>=2 &&
    facts.every(x=>typeof x.text==='string'&&x.text.length>=55&&x.source?.verifiedOn&&x.source?.publisher&&x.source?.url?.startsWith('https://'));
  const photo=shortlisted[slug];
  return {slug,commonName:s[1],scientificName:s[2],
    sourceStage:p?.stage||null,claimCount:facts.length,distinctSourceUrls:uniqueDocs.size,publisherCount:publishers.size,
    sourcePackValid,photoShortlisted:!!photo,photoShaRecorded:typeof photo?.sha256==='string'&&/^[a-f0-9]{64}$/.test(photo.sha256),
    independentlyGold:false,
    gate:!sourcePackValid?'NEEDS_CLAIM_SOURCE_PACK':!photo?'NEEDS_VISUAL_RIGHTS_PHOTO':'SOURCE_AND_PHOTO_SHORTLIST_NOT_GOLD'};
});
const result={
  schema:'4SPECIES_ADDITIONAL61_SOURCE_READY_01',auditedAt:'2026-10-28',
  intended:61,oldLive39:39,alreadyLiveFromExpansion:18,stillUnpublished:43,
  sourcePackCandidates:claimPacks.size,
  unpublishedWithValidSciencePacks:remaining.filter(x=>x.sourcePackValid).length,
  unpublishedWithoutSciencePacks:remaining.filter(x=>!x.sourcePackValid).length,
  unpublishedWithPhotoShortlist:remaining.filter(x=>x.photoShortlisted).length,
  independentlyGold:0,unpublished:remaining,
  warnings:[
   'A science pack is a research candidate, NOT independent review or proven factual accuracy.',
   'A contact-sheet photo shortlist is NOT independent rights/identification approval or permission to publish.',
   'All 57 existing public profiles MUST be preserved and LIVE release must be separately approved and proved.',
   'Never claim Google indexed a page from successful sitemap/IndexNow submission.'
  ]
};
if(result.stillUnpublished!==remaining.length||
   result.unpublishedWithValidSciencePacks!==26||
   result.unpublishedWithoutSciencePacks!==17||
   result.unpublishedWithPhotoShortlist!==6)throw Error('Source cohort drift; independent human reclassification required');
console.log('SPECIES_61_SOURCE_MATRIX_PASS '+JSON.stringify({intended:61,published:18,remaining:43,sciencePackAvailable:26,sciencePackMissing:17,photoShortlisted:6,independentlyGold:0}));
console.log('SPECIES_61_MISSING_SCIENCE '+remaining.filter(x=>!x.sourcePackValid).map(x=>x.slug).join(', '));
if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
