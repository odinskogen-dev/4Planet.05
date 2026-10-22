/**
 * Fail-closed founder-authorised PREMIUM V1 release selection.
 * Must run only on the exact reconstructed Claude v53 + 39 provenance worktree.
 * Assets are identified by BOTH original photo ID (where applicable) AND
 * locally downloaded byte SHA256 already visually inspected.
 * Does NOT rewrite any original Claude component or existing 39 profile.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { sciencePacks as s1 } from "./science-claims-stage1.mjs";
import { scienceStage2 as s2 } from "./science-claims-stage2.mjs";
import { scienceStage3 as s3 } from "./science-claims-stage3.mjs";
import { scienceStage4 as s4 } from "./science-claims-stage4.mjs";
import { scienceStage5 as s5 } from "./science-claims-stage5.mjs";
import { scienceStage6 as s6 } from "./science-claims-stage6.mjs";
import { scienceStage7 as s7 } from "./science-claims-stage7.mjs";
import { scienceStage8 as s8 } from "./science-claims-stage8.mjs";
import { scienceStage9 as s9 } from "./science-claims-stage9.mjs";
const packs={...s1,...s2,...s3,...s4,...s5,...s6,...s7,...s8,...s9};
const dir=path.dirname(new URL(import.meta.url).pathname);
const approval=JSON.parse(fs.readFileSync(path.join(dir,"v1-visual-approved-20261022.json"),"utf8"));
const reportDir=process.env.SPECIES_REPORT_DIR||"reports/species-next61";
const originalReport=JSON.parse(fs.readFileSync(path.join(reportDir,"research-report.json"),"utf8"));
const publicDir=path.join("public","species-data","v1");
const mediaDir=path.join("public","assets","species","next61");
const existing39=new Set("orca lion tiger african-savanna-elephant asian-elephant bald-eagle black-rhinoceros blue-whale bornean-orangutan cheetah chimpanzee emperor-penguin giant-panda giraffe gray-wolf great-white-shark green-sea-turtle hippopotamus jaguar monarch-butterfly polar-bear english-oak western-honey-bee fly-agaric common-octopus atlantic-puffin sei-whale eurasian-lynx humpback-whale sperm-whale harbour-porpoise bottlenose-dolphin atlantic-cod blue-mussel whale-shark leopard eastern-gorilla acropora-palmata hyacinth-macaw".split(" "));
for(const s of existing39)if(!fs.existsSync(path.join(publicDir,s+".json")))throw Error("Original Claude 39 vanished "+s);
const passed=[],blocked=[],assets=new Set();
for(const rec of originalReport.records){
 const slug=rec.slug,photoApproval=approval.approved[slug];
 const dataFile=path.join(publicDir,slug+".json");
 if(!fs.existsSync(dataFile))throw Error("Candidate file unexpectedly absent "+slug);
 if(!photoApproval){blocked.push({slug,reason:"VISUAL_HERO_NOT_APPROVED"});fs.rmSync(dataFile);continue;}
 const pack=packs[slug];
 const publishers=new Set(pack?.claims?.map(c=>c.source.publisher)||[]);
 const sources=new Set(pack?.claims?.map(c=>c.source.url)||[]);
 if((pack?.claims?.length||0)<8||publishers.size<2||sources.size<2){
  blocked.push({slug,reason:"BIOLOGY_ORIGINAL_EVIDENCE_SHORTFALL"});fs.rmSync(dataFile);continue;
 }
 const pic=rec.pictures.find(p=>p.sha256===photoApproval.sha256&&p.photoId===photoApproval.photoId);
 if(!pic||pic.sourcePage!==undefined && !pic.sourcePage.startsWith("https://")){
  blocked.push({slug,reason:"APPROVED_PHOTO_ID_SHA_MISSING_OR_CHANGED"});fs.rmSync(dataFile);continue;
 }
 const mediaName=path.basename(pic.local||"");
 const photoOnDisk=path.join(mediaDir,mediaName);
 if(!fs.existsSync(photoOnDisk)||crypto.createHash("sha256").update(fs.readFileSync(photoOnDisk)).digest("hex")!==photoApproval.sha256){
  blocked.push({slug,reason:"PHOTO_BYTES_CHANGED"});fs.rmSync(dataFile);continue;
 }
 if(!pic.license||!pic.artist||!pic.sourcePage||!pic.licenceUrl){
  blocked.push({slug,reason:"PHOTO_CREDIT_OR_LICENCE_MISSING"});fs.rmSync(dataFile);continue;
 }
 if(photoApproval.photoId!==null &&
   (pic.captive!==false||pic.observationQuality!=="RESEARCH_GRADE"||pic.photoId!==photoApproval.photoId)){
  blocked.push({slug,reason:"ANIMAL_NOT_EXACT_RESEARCH_GRADE_WILD_OBSERVATION"});fs.rmSync(dataFile);continue;
 }
 const p=JSON.parse(fs.readFileSync(dataFile,"utf8"));
 if(p.slug!==slug||p.schema!=="4PLANET_SPECIES_PAGE_01"||!p.identity.scientificName||p.provenance?.review!=="DRAFT"){
  blocked.push({slug,reason:"SOURCE_PROFILE_NOT_AUTHENTICATED"});fs.rmSync(dataFile);continue;
 }
 // Only the EXACT single human-reviewed photo may reach production. No
 // unreviewed gallery. The licence and original attribution remain visible.
 p.hero={
   url:"https://4species.com"+pic.local,
   alt:p.identity.commonName+" ("+p.identity.scientificName+") in its natural environment",
   credit:pic.artist,
   licence:pic.license,
   licenseUrl:pic.licenceUrl,
   sourcePage:pic.sourcePage,
   focus:"50% 50%"
 };
 p.gallery=[];
 p.provenance={
  ...p.provenance,
  review:"DRAFT", // honest scientific status retained, exactly like the 39 original pages
  founderRelease:"PREMIUM_V1_2026-10-22",
  publisherSafety:"VISUAL_SINGLE_HERO_V1_APPROVED; SPECIES_SOURCE_PACK_PRESENT; FURTHER_GOLD_RESEARCH_PLANNED",
  sourceOrganisations:publishers.size,
  photoId:pic.photoId||null,
  photoSha256:photoApproval.sha256,
  photoRightsSource:pic.sourcePage,
 };
 // Neither incomplete population estimates nor links to raw licensed Red
 // List data are represented as verified Gold. Preserve transparent caveats.
 p.limits=[
  "Species descriptions are grounded in the cited references; details vary across regions and populations.",
  "An ecological possibility is not an established 4PLANET intervention or outcome.",
  "Scientific understanding and conservation status can change as new evidence becomes available."
 ];
 fs.writeFileSync(dataFile,JSON.stringify(p,null,2)+"\n");
 assets.add(mediaName);
 passed.push({slug,scientificName:p.identity.scientificName,photoId:pic.photoId,sha256:photoApproval.sha256,source:pic.sourcePage,licence:pic.license,publishers:publishers.size,sourceDocuments:sources.size});
}
if(passed.length<3)throw Error("Too few accurately matched human-approved image candidates to safely release");
if(passed.some(p=>existing39.has(p.slug)))throw Error("Collision with original 39");
for(const file of fs.readdirSync(mediaDir))if(!assets.has(file))fs.rmSync(path.join(mediaDir,file));
fs.mkdirSync(reportDir,{recursive:true});
const ready={date:"2026-10-22",selected:passed,excluded:blocked,existing39Preserved:39,founderStandard:"PREMIUM_V1_NOT_GOLD",templatesChanged:false};
fs.writeFileSync(path.join(reportDir,"v1-release-selection.json"),JSON.stringify(ready,null,2));
console.log("SPECIES_V1_SAFE_SELECTION "+JSON.stringify({approved:passed.length,originalsPreserved:39,blocked:blocked.length,slugs:passed.map(x=>x.slug)}));
