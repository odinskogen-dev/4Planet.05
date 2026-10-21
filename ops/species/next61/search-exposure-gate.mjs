/**
 * Add nonvisual, source-traceable search metadata to rendered Claude v53 species
 * pages, on a candidate branch ONLY. Never publishes. Gold review gates remain.
 */
import fs from "node:fs";
import path from "node:path";
import { mammals } from "./mammals.mjs";
import { birds } from "./birds.mjs";
import { reptiles } from "./reptiles.mjs";
import { fishes } from "./fishes.mjs";
import { invertebratesPlants } from "./invertebrates-plants.mjs";
const slugs=[...mammals,...birds,...reptiles,...fishes,...invertebratesPlants].map(s=>s[0]);
const dist=process.env.SPECIES_DIST||"dist";
const dataDir=process.env.SPECIES_DATA_DIR||"public/species-data/v1";
const reportDir=process.env.SPECIES_REPORT_DIR||"reports/species-next61";
const approvedFile=process.env.SPECIES_APPROVED_MANIFEST||"ops/species/next61/approved-release.json";
const approved=fs.existsSync(approvedFile)?JSON.parse(fs.readFileSync(approvedFile,"utf8")).approved:[];
if(!Array.isArray(approved)||approved.some(s=>!slugs.includes(s)))throw Error("Invalid species release approval manifest");
const report={count:61,approved,missing:[],invalid:[],schemaInjected:0,readyForSearchRelease:0,policy:"Candidates only. No publishing, Google submission or readiness claim."};
const quote=s=>JSON.stringify(s).replace(/</g,"\\u003c");
function structured(p){
 const name=p.identity.commonName,sci=p.identity.scientificName;
 const uri="https://4species.com/"+p.slug;
 const taxon={"@type":"Taxon","@id":uri+"#taxon",name:sci,alternateName:name};
 const gbif=p.provenance?.taxonSource;
 if(typeof gbif==="string"&&gbif.startsWith("https://www.gbif.org/species/"))taxon.sameAs=gbif;
 const graph=[
  {"@type":"WebPage","@id":uri+"#webpage",url:uri,name:name+" ("+sci+") — 4PLANET SPECIES",description:p.hook.text,
   about:{"@id":uri+"#taxon"},breadcrumb:{"@id":uri+"#breadcrumb"},
   ...(p.hero.url?{primaryImageOfPage:{"@id":uri+"#hero"}}:{})},
  taxon,
  {"@type":"BreadcrumbList","@id":uri+"#breadcrumb",itemListElement:[
   {"@type":"ListItem",position:1,name:"SPECIES",item:"https://4species.com/explore"},
   {"@type":"ListItem",position:2,name,item:uri}
  ]},
 ];
 if(p.hero.url)graph.push({
  "@type":"ImageObject","@id":uri+"#hero",contentUrl:p.hero.url,
  caption:p.hero.alt,creditText:p.hero.credit,
  ...(p.hero.licenseUrl?{license:p.hero.licenseUrl}:{}),
  ...(p.hero.sourcePage?{acquireLicensePage:p.hero.sourcePage}:{})
 });
 return {"@context":"https://schema.org","@graph":graph};
}
for(const slug of slugs){
 const page=path.join(dist,slug,"index.html");
 const data=path.join(dataDir,slug+".json");
 if(!fs.existsSync(page)||!fs.existsSync(data)){report.missing.push(slug);continue;}
 const p=JSON.parse(fs.readFileSync(data,"utf8"));
 const html=fs.readFileSync(page,"utf8");
 const errors=[];
 if(p.slug!==slug||!["DRAFT","GOLD","PUBLISHED"].includes(p.provenance?.review))errors.push("REVIEW_STATE_OR_IDENTITY");
 if(approved.includes(slug)&&p.provenance?.review!=="GOLD")errors.push("GOLD_EDITORIAL_STATUS_REQUIRED");
 if(!html.includes("https://4species.com/"+slug))errors.push("CANONICAL");
 if(!html.includes(p.identity.scientificName))errors.push("TAXON_NOT_VISIBLE");
 if(!p.hero?.url||!p.hero?.sourcePage||!p.hero?.credit||!p.hero?.licence)errors.push("PHOTO_METADATA");
 if(p.provenance?.sourceReview!=="DONE")errors.push("CLAIMS_SOURCE_REVIEW_OPEN");
 if(p.provenance?.photoVisualReview!=="DONE"||p.provenance?.aliveWildPhotoReview!=="DONE")errors.push("WILD_AND_ALIVE_IMAGE_VISUAL_REVIEW_OPEN");
 if(p.provenance?.photographyReview!=="DONE")errors.push("PHOTO_RIGHTS_REVIEW_OPEN");
 if(errors.length)report.invalid.push({slug,errors});
 if(approved.includes(slug)&&errors.length)throw Error("Release lock failure: "+slug+" "+errors.join(","));
 if(approved.includes(slug))report.readyForSearchRelease++;
 if(!html.includes("</head>")||html.includes('data-4species="search-exposure"'))throw Error("Head or duplicate schema invalid: "+slug);
 const json=quote(structured(p));
 const tag='<script type="application/ld+json" data-4species="search-exposure">'+json+'</script>';
 fs.writeFileSync(page,html.replace("</head>",tag+"</head>"));
 report.schemaInjected++;
}
fs.mkdirSync(reportDir,{recursive:true});
fs.writeFileSync(path.join(reportDir,"search-exposure-qa.json"),JSON.stringify(report,null,2));
console.log("SPECIES61_SEARCH_EXPOSURE "+JSON.stringify({checked:61,jsonLdInjected:report.schemaInjected,ready:report.readyForSearchRelease,unresolved:report.invalid.length,missing:report.missing}));
if(report.schemaInjected!==61||report.missing.length)process.exitCode=1;
