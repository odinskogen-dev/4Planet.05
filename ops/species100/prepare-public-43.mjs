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
const report={createdAt:new Date().toISOString(),intended:43,photographsExternallySigned4:[],editorialWorkingImagePlaceholders:[],profiles:[]};
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
  const common=p.identity.commonName;
  const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 960"><rect width="1600" height="960" fill="#f0f5f0"/><circle cx="1230" cy="230" r="410" fill="#e1eae0"/><path d="M0 850Q300 530 720 800T1600 710V960H0" fill="#d9e6d8"/><circle cx="260" cy="270" r="95" fill="none" stroke="#bacbb9" stroke-width="2"/><path d="M205 300Q258 145 320 260" fill="none" stroke="#a8bea6" stroke-width="3"/><text x="110" y="540" fill="#173d30" font-family="Arial,Helvetica,sans-serif" font-size="76" font-weight="600">'+esc(common)+'</text><text x="112" y="614" fill="#456957" font-family="Arial,Helvetica,sans-serif" font-size="31" font-style="italic">'+esc(p.identity.scientificName)+'</text><text x="112" y="760" fill="#597468" font-family="Arial,Helvetica,sans-serif" font-size="24">4SPECIES · ORIGINAL EDITORIAL CARD · PHOTOGRAPH UNDER REVIEW</text></svg>';
  const filename=p.slug+"-editorial-card.svg";
  fs.writeFileSync(path.join(MEDIA,filename),svg);
  p.hero={url:"https://4species.com/assets/species/final43/"+filename,alt:"4SPECIES editorial card for "+common+"; not a wildlife photograph",credit:"4PLANET original editorial artwork",licence:"CC BY 4.0",sourcePage:"https://4species.com/"+p.slug,focus:"50% 50%"};
  report.editorialWorkingImagePlaceholders.push(p.slug);
 } else {
  report.photographsExternallySigned4.push(p.slug);
 }
 p.gallery=[];
 // Preserve sourced text but repair genuinely empty editor labels without inventing additional facts.
 for(const [topic,claims] of Object.entries(p.facts||{})){
   if(!Array.isArray(claims))continue;
   for(const claim of claims){
     if(!claim.label&&claim.text)claim.label=String(claim.text).split(/[.!?]/)[0].trim().slice(0,80);
   }
 }
 p.provenance={...p.provenance,review:"DRAFT",founderRelease:"SPECIES100_FOUNDATION_2026-10-24",sourceReview:"INDEPENDENT_GOLD_PENDING",photoVisualReview:signed4.has(p.slug)?"EXACT_PHOTO_MATCH_NOT_INDEPENDENT_GOLD":"PHOTO_PENDING",photographyReview:signed4.has(p.slug)?"RIGHTS_METADATA_PRESENT_UNDER_REVIEW":"ORIGINAL_EDITORIAL_ART_ONLY",published:true,publicEditorialCaveat:true};
 fs.writeFileSync(path.join(DIR,file),JSON.stringify(p,null,2)+"\n");
 report.profiles.push({slug:p.slug,scientificName:p.identity.scientificName,hasLicensedPhoto:signed4.has(p.slug),draftScience:!p.provenance.sourcePackStage1});
}
if(all.size!==43)throw Error("Must be exactly 43 distinct new pages: "+all.size);
if(report.photographsExternallySigned4.length!==4||report.editorialWorkingImagePlaceholders.length!==39)throw Error("Media cohort failed");
fs.mkdirSync("reports/species100",{recursive:true});
fs.writeFileSync("reports/species100/prepare-43.json",JSON.stringify(report,null,2));
console.log("SPECIES100_43_PUBLIC_PROFILES_STAGED",JSON.stringify({created:43,exactPhotos:4,originalEditorialArt:39,liveOldProfilesUntouched:57}));
