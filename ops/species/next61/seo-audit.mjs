import fs from "node:fs";
import path from "node:path";
import { mammals } from "./mammals.mjs";
import { birds } from "./birds.mjs";
import { reptiles } from "./reptiles.mjs";
import { fishes } from "./fishes.mjs";
import { invertebratesPlants } from "./invertebrates-plants.mjs";
const data=[...mammals,...birds,...reptiles,...fishes,...invertebratesPlants];
const dist=process.env.SPECIES_DIST||"dist";
const found=[];
const textTag=(html,regex)=>(html.match(regex)||[])[1]||"";
for(const s of data){
 const [slug,name,sci]=s;
 const p=path.join(dist,slug,"index.html");
 if(!fs.existsSync(p)){found.push({slug,error:"HTML_MISSING"});continue;}
 const html=fs.readFileSync(p,"utf8");
 const title=textTag(html,/<title[^>]*>([^<]+)<\/title>/i);
 const canonical=textTag(html,/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)
   ||textTag(html,/<link[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
 const metaDescription=textTag(html,/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i);
 const ogImage=textTag(html,/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i);
 const robots=textTag(html,/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i);
 const scientificPresent=html.includes(sci);
 const titleUniqueEnough=title.toLowerCase().includes(name.toLowerCase())||title.toLowerCase().includes(sci.toLowerCase());
 const canonicalCorrect=canonical==="https://4species.com/"+slug;
 const error=[!scientificPresent?"SCI_NAME_MISSING":null,!titleUniqueEnough?"TITLE_WRONG":null,!canonicalCorrect?"CANONICAL_WRONG":null,!metaDescription?"DESCRIPTION_MISSING":null].filter(Boolean);
 found.push({slug,title,canonical,descriptionLength:metaDescription.length,descriptionPreview:metaDescription.slice(0,150),ogImage,robots,scientificPresent,problems:error});
}
const titles=found.map(x=>x.title).filter(Boolean);
const uniqueTitles=new Set(titles).size;
const descriptions=found.map(x=>x.descriptionPreview).filter(Boolean);
const uniqueDescriptions=new Set(descriptions).size;
const summary={checked:found.length,canonicalCorrect:found.filter(x=>x.canonical==="https://4species.com/"+x.slug).length,
 titlesUnique:uniqueTitles,descriptionsUnique:uniqueDescriptions,missingStructuredOG:found.filter(x=>!x.ogImage||x.ogImage.endsWith("/og.png")).map(x=>x.slug),
 titleErrors:found.filter(x=>(x.problems||[]).length).map(x=>({slug:x.slug,problems:x.problems}))};
console.log("SPECIES61_SEO_AUDIT_SUMMARY "+JSON.stringify(summary));
console.log("SPECIES61_SEO_EXAMPLES "+JSON.stringify([found[0],found[12],found[31],found[44],found[60]]));
const out=process.env.SPECIES_REPORT_DIR||path.join(process.cwd(),"reports/species-next61");
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,"seo-audit.json"),JSON.stringify({summary,pages:found},null,2));
if(summary.checked!==61||summary.canonicalCorrect!==61||uniqueTitles!==61||summary.titleErrors.length)process.exitCode=1;
