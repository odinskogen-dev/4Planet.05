/**
 * Honest editorial fact-source coverage, NOT expert GOLD sign-off.
 * Prevents low-value and unsourced mass production, verifies distinct
 * original links and independent publishers for every candidate pack.
 */
import fs from "node:fs";
import path from "node:path";
import { sciencePacks as stage1 } from "./science-claims-stage1.mjs";
import { scienceStage2 as stage2 } from "./science-claims-stage2.mjs";
import { scienceStage3 as stage3 } from "./science-claims-stage3.mjs";
import { scienceStage4 as stage4 } from "./science-claims-stage4.mjs";
import { scienceStage5 as stage5 } from "./science-claims-stage5.mjs";
import { scienceStage6 as stage6 } from "./science-claims-stage6.mjs";
import { scienceStage7 as stage7 } from "./science-claims-stage7.mjs";
import { mammals } from "./mammals.mjs";
import { birds } from "./birds.mjs";
import { reptiles } from "./reptiles.mjs";
import { fishes } from "./fishes.mjs";
import { invertebratesPlants } from "./invertebrates-plants.mjs";
const sources=[stage1,stage2,stage3,stage4,stage5,stage6,stage7];
const candidates=[...mammals,...birds,...reptiles,...fishes,...invertebratesPlants];
const target=new Map(candidates.map(s=>[s[0],s[2]]));
const profiles={};
const issues=[];
const norm=s=>String(s||"").trim().toLowerCase();
for(let stage=0;stage<sources.length;stage++){
 for(const [slug,pack] of Object.entries(sources[stage])){
  if(!target.has(slug))issues.push(slug+": not in 61 named candidate species");
  if(profiles[slug])issues.push(slug+": double-registered in source packs");
  const claims=pack.claims||[];
  const urls=new Set(),publishers=new Set(),texts=new Set(),ids=new Set();
  if(claims.length<8)issues.push(slug+": fewer than 8 factual claims");
  for(const c of claims){
   if(!["appearance","ecology","conservation","physical"].includes(c.category))issues.push(slug+": unknown category "+c.category);
   if(!c.label||c.label.length<8||!c.text||c.text.length<55)issues.push(slug+": thin editorial claim "+c.id);
   if(ids.has(c.id))issues.push(slug+": duplicate claim ID "+c.id);
   ids.add(c.id);
   if(texts.has(norm(c.text)))issues.push(slug+": duplicate claim "+c.id);
   texts.add(norm(c.text));
   if(!c.source||!/^https:\/\//.test(c.source.url)||!c.source.publisher||!c.source.label||!c.source.verifiedOn)
    issues.push(slug+": missing claim-level source or verified date "+c.id);
   else {urls.add(c.source.url);publishers.add(c.source.publisher);}
   if(c.status==="GOLD"||c.status==="PUBLISHED")issues.push(slug+": unsupported editorial Gold label "+c.id);
  }
  if(urls.size<3)issues.push(slug+": <3 distinct scientific/institutional source documents");
  if(publishers.size<2)issues.push(slug+": <2 independently named publisher organisations");
  profiles[slug]={stage:stage+1,claims:claims.length,sourceDocuments:urls.size,sourceOrganisations:publishers.size,review:"NOT_INDEPENDENTLY_GOLD"};
 }
}
const total=Object.values(profiles).reduce((sum,p)=>sum+p.claims,0);
const result={
 date:"2026-10-21",
 totalProposedSpecies:61,
 sourcedCandidateProfiles:Object.keys(profiles).length,
 sourcedClaimRecords:total,
 candidateProfilesWithoutPack:candidates.filter(s=>!profiles[s[0]]).map(s=>s[0]),
 reviewedPhotoGold:0,
 independentScientificGold:0,
 publicationReady:0,
 issues,
 bySpecies:profiles,
 policy:"Citation count and page existence are NOT claim-by-claim peer review, image QA, publication or Google indexing."
};
const dir=process.env.SPECIES_REPORT_DIR||"reports/species-next61";
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,"science-source-coverage.json"),JSON.stringify(result,null,2));
console.log("SPECIES61_FACT_SOURCE_COVERAGE "+JSON.stringify({
 profiles:result.sourcedCandidateProfiles,records:total,notYetPackaged:result.candidateProfilesWithoutPack.length,
 errors:issues.length,scienceGold:0,ready:0
}));
if(issues.length) {console.error("SPECIES61_FACT_SOURCE_ISSUES",JSON.stringify(issues));process.exitCode=1;}
