/**
 * Google Images discoverability, approved species ONLY.
 * This is not called for public release until all individual science/rights
 * Gold gates are signed off. No submission or indexing guarantee.
 */
import fs from "node:fs";
import path from "node:path";
const file=process.env.SPECIES_APPROVED_MANIFEST||"ops/species/next61/approved-release.json";
const output=process.env.SPECIES_IMAGE_SITEMAP_PATH||"dist/species-61-images.xml";
const dir=process.env.SPECIES_DATA_DIR||"public/species-data/v1";
const manifest=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,"utf8")):{approved:[]};
if(!Array.isArray(manifest.approved))throw Error("approved list is not an array");
const seen=new Set();
const esc=s=>s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const urls=[];
for(const slug of manifest.approved){
 if(seen.has(slug))throw Error("Duplicate approved slug "+slug);
 seen.add(slug);
 const p=JSON.parse(fs.readFileSync(path.join(dir,slug+".json"),"utf8"));
 if(p.slug!==slug||p.provenance?.review!=="GOLD"||
    p.provenance?.photoVisualReview!=="DONE"||
    p.provenance?.aliveWildPhotoReview!=="DONE"||
    p.provenance?.photographyReview!=="DONE"||
    p.provenance?.sourceReview!=="DONE")throw Error("Species fails signed source/photo GOLD gate "+slug);
 const pics=[p.hero,...(p.gallery||[])];
 const media=[];
 for(const image of pics){
   if(!image?.url||!image?.sourcePage||!image?.credit||!image?.licence)
     throw Error("Incomplete image rights "+slug);
   const fromPreview=image.url.match(/^https:\/\/(?:species-61-review\.4planet-05\.pages\.dev|4species\.com)(\/assets\/species\/next61\/[^/?#]+)$/);
   if(!fromPreview)throw Error("Not first-party safe local asset "+slug);
   const local=fromPreview[1];
   if(!fs.existsSync(path.join("dist",local.slice(1))))throw Error("Image missing in deployable artifact "+slug+" "+local);
   media.push("    <image:image><image:loc>"+esc("https://4species.com"+local)+"</image:loc></image:image>");
 }
 urls.push("  <url><loc>"+esc("https://4species.com/"+slug)+"</loc>\n"+media.join("\n")+"\n  </url>");
}
if(urls.length){
 const xml='<?xml version="1.0" encoding="UTF-8"?>\n'+
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'+
  urls.join("\n")+'\n</urlset>\n';
 fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,xml);
}
console.log("SPECIES61_APPROVED_IMAGE_SITEMAP "+JSON.stringify({approved:seen.size,generated:urls.length>0,output:urls.length?output:null,submittedToGoogle:false}));
