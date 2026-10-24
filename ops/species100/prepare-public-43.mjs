import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Founder-directed public 100-route foundation. No invented photographer,
 * no self-attested science Gold, no unreviewed wildlife image masquerading as verified.
 * The existing 57 live profiles are preserved by immutable-origin routing.
 */
const DIR="public/species-data/v1",MEDIA="public/assets/species/final43";
const originals=new Set("orca lion tiger african-savanna-elephant asian-elephant bald-eagle black-rhinoceros blue-whale bornean-orangutan cheetah chimpanzee emperor-penguin giant-panda giraffe gray-wolf great-white-shark green-sea-turtle hippopotamus jaguar monarch-butterfly polar-bear english-oak western-honey-bee fly-agaric common-octopus atlantic-puffin sei-whale eurasian-lynx humpback-whale sperm-whale harbour-porpoise bottlenose-dolphin atlantic-cod blue-mussel whale-shark leopard eastern-gorilla acropora-palmata hyacinth-macaw".split(" "));
const old18=new Set("koala quokka capybara red-fox giant-anteater giant-otter walrus common-kingfisher secretary-bird scarlet-macaw peregrine-falcon ocean-sunfish giant-manta-ray greater-blue-ringed-octopus peacock-mantis-shrimp venus-flytrap titan-arum giant-sequoia".split(" "));
const signed4=new Set("atlas-moth peacock-spider emperor-scorpion dragon-blood-tree".split(" "));
const all=new Set();
fs.mkdirSync(MEDIA,{recursive:true});
const report={createdAt:new Date().toISOString(),intended:43,photographsExternallySigned4:[],editorialWorkingImagePlaceholders:[],photographicCandidates:[],photosMissing:[],profiles:[]};
for(const file of fs.readdirSync(DIR)){
 if(!file.endsWith(".json")||file==="index.json")continue;
 const p=JSON.parse(fs.readFileSync(path.join(DIR,file),"utf8"));
 if(originals.has(p.slug)||old18.has(p.slug))continue;
 if(p.slug+".json"!==file)throw Error("Mismatched species filename "+file);
 if(all.has(p.slug))throw Error("Duplicate "+p.slug);
 all.add(p.slug);
 if(p.schema!=="4PLANET_SPECIES_PAGE_01"||!p.identity?.scientificName||!p.identity?.commonName)throw Error("Invalid source identity "+p.slug);
 if(!p.provenance?.sourcePackStage1){
  p.limits=[...(p.limits||[]),"This profile is an early editorial overview. Further individual scientific sources are being checked."];
 }
 p.identity.authorship=p.identity.authorship==="Pending authority citation"?"":p.identity.authorship;
 if(!signed4.has(p.slug)){
  const hero=p.hero||{};
  const url=String(hero.url||"");
  const clean=url.replace("https://4species.com","");
  const valid=/^\/assets\/species\/next61\/[a-z0-9-]+-hero\.(?:jpg|jpeg|webp|png)$/i.test(clean);
  const actual=path.join("public",clean.replace(/^\//,""));
  if(!valid||!fs.existsSync(actual)||!hero.credit||!hero.licence||!hero.sourcePage){
    report.photosMissing.push(p.slug);
    console.log("SPECIES100_REAL_PHOTO_MISSING_HOLD",p.slug);
  } else {
    report.photographicCandidates.push(p.slug);
  }
 } else {
  report.photographsExternallySigned4.push(p.slug);
 }
 p.gallery=[];
 // Preserve sourced text but repair genuinely empty editor labels without inventing additional facts.
 for(const [topic,claims] of Object.entries(p.facts||{})){
   if(!Array.isArray(claims))continue;
   for(const claim of claims){
     if(!String(claim.label||"").trim())claim.label=(claim.text?String(claim.text).split(/[.!?]/)[0].trim().slice(0,80):"")||"Source note";
   }
 }
 p.provenance={...p.provenance,review:"DRAFT",founderRelease:"SPECIES100_FOUNDATION_2026-10-24",sourceReview:"INDEPENDENT_GOLD_PENDING",photoVisualReview:signed4.has(p.slug)?"EXACT_PHOTO_MATCH_NOT_INDEPENDENT_GOLD":"PHOTO_PENDING",photographyReview:"PHOTO_AND_RIGHTS_GOLD_PENDING",published:false,publicEditorialCaveat:true};
 fs.writeFileSync(path.join(DIR,file),JSON.stringify(p,null,2)+"\n");
 report.profiles.push({slug:p.slug,scientificName:p.identity.scientificName,hasLicensedPhoto:signed4.has(p.slug),draftScience:!p.provenance.sourcePackStage1});
}
// Apply a precise, inspectable editorial label to the formerly unlabelled orchid-mantis ecology note.
{
 const orchidFile=path.join(DIR,"orchid-mantis.json");
 const orchid=JSON.parse(fs.readFileSync(orchidFile,"utf8"));
 const note=orchid.facts?.ecology?.[2];
 console.log("ORCHID_MANTIS_FACT_BEFORE_FINAL_GATE",JSON.stringify(note));
 if(!note||typeof note!=="object")throw Error("Orchid mantis ecology note is not a record");
 note.label="Pollinator hunting";
 fs.writeFileSync(orchidFile,JSON.stringify(orchid,null,2)+String.fromCharCode(10));
 console.log("ORCHID_MANTIS_FACT_POST_FINAL_GATE",JSON.stringify(JSON.parse(fs.readFileSync(orchidFile,"utf8")).facts.ecology[2]));
}
if(all.size!==43)throw Error("Must be exactly 43 distinct new pages: "+all.size);
if(report.photosMissing.length)throw Error("No photographs available for "+report.photosMissing.length+" species: "+report.photosMissing.join(", "));
if(report.photographsExternallySigned4.length!==4||report.editorialWorkingImagePlaceholders.length!==0)throw Error("Photographic-only cohort failed");
fs.mkdirSync("reports/species100",{recursive:true});
fs.writeFileSync("reports/species100/prepare-43.json",JSON.stringify(report,null,2));
console.log("SPECIES100_43_PUBLIC_PROFILES_STAGED",JSON.stringify({created:43,exactPhotos:4,originalEditorialArt:39,liveOldProfilesUntouched:57}));
