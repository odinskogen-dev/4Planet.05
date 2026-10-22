import fs from "node:fs";
import path from "node:path";
import { sciencePacks as stage1 } from "./science-claims-stage1.mjs";
import { scienceStage2 as stage2 } from "./science-claims-stage2.mjs";
import { scienceStage3 as stage3 } from "./science-claims-stage3.mjs";
import { scienceStage4 as stage4 } from "./science-claims-stage4.mjs";
import { scienceStage5 as stage5 } from "./science-claims-stage5.mjs";
import { scienceStage6 as stage6 } from "./science-claims-stage6.mjs";
import { scienceStage7 as stage7 } from "./science-claims-stage7.mjs";
import { scienceStage8 as stage8 } from "./science-claims-stage8.mjs";
import { scienceStage9 as stage9 } from "./science-claims-stage9.mjs";
import { scienceStage10 as stage10 } from "./science-claims-stage10.mjs";
const sciencePacks = { ...stage1, ...stage2, ...stage3, ...stage4, ...stage5, ...stage6, ...stage7, ...stage8, ...stage9, ...stage10 };

const dataDir=process.env.SPECIES_DATA_DIR||path.join(process.cwd(),"public/species-data/v1");
const reportDir=process.env.SPECIES_REPORT_DIR||path.join(process.cwd(),"reports/species-next61");
const statuses=[];
for(const [slug,pack] of Object.entries(sciencePacks)){
 const active=path.join(dataDir,slug+".json");
 const quarantined=path.join(reportDir,"quarantined",slug+".json");
 const input=fs.existsSync(active)?active:quarantined;
 if(!fs.existsSync(input))throw Error("Missing reviewed or quarantined science draft "+slug);
 const p=JSON.parse(fs.readFileSync(input,"utf8"));
 const facts=Object.values(p.facts).flat();
 const sources=pack.claims.map(c=>c.source.url);
 const issu=[];
 if(p.slug!==slug||p.provenance.review!=="DRAFT")issu.push("CANDIDATE_STATUS_OR_SLUG");
 if(pack.claims.length<8||new Set(pack.claims.map(c=>c.text)).size!==pack.claims.length)issu.push("THIN_OR_DUPLICATE_SCIENCE");
 if(new Set(sources).size<2)issu.push("FEWER_THAN_TWO_SOURCE_DOCUMENTS_PREMIUM_V1");
 if(new Set(pack.claims.map(c=>c.source.publisher)).size<2)issu.push("INSTITUTIONAL_DIVERSITY_MISSING");
 for(const c of pack.claims){
   if(!/^https:\/\//.test(c.source.url))issu.push("NON_CANONICAL_SOURCE_URL_"+c.id);
   const matches=facts.filter(f=>f.text===c.text&&f.source?.url===c.source.url);
   if(matches.length!==1)issu.push("SOURCE_CLAIM_NOT_LINKED_EXACTLY_ONCE_"+c.id);
   if(c.text.length<55)issu.push("THIN_UNDER_55_CHAR_"+c.id);
 }
 if(p.provenance.sourceReview==="DONE"||p.provenance.review==="GOLD")issu.push("SELF_ATTESTED_GOLD");
 statuses.push({slug,factCount:pack.claims.length,sourceDocuments:new Set(sources).size,
  publishers:new Set(pack.claims.map(c=>c.source.publisher)).size,
  distinctClaims:new Set(pack.claims.map(c=>c.text)).size,
  release:"SCIENTIFIC_REVIEW_PENDING",errors:issu});
 console.log("SPECIES61_SCIENCE_PACK "+JSON.stringify(statuses.at(-1)));
}
const summary={checked:statuses.length,scientificCandidateClaims:statuses.reduce((x,r)=>x+r.factCount,0),
 sourceLinks:statuses.reduce((x,r)=>x+r.sourceDocuments,0),
 scientificallyGold:0,
 allCandidatePacksValid:statuses.every(r=>!r.errors.length)};
fs.mkdirSync(reportDir,{recursive:true});
fs.writeFileSync(path.join(reportDir,"science-all-packs-qa.json"),JSON.stringify({summary,statuses},null,2));
console.log("SPECIES61_SCIENCE_ALL_PACKS_SUMMARY "+JSON.stringify(summary));
if(!summary.allCandidatePacksValid)process.exitCode=1;
