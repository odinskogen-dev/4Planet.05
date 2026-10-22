import fs from "node:fs";
import path from "node:path";
/* Only edit search metadata on HUMAN-APPROVED source-image articles. */
const report=JSON.parse(fs.readFileSync("reports/species-next61/v1-release-selection.json","utf8"));
const selected=report.selected;const dist="dist",data="public/species-data/v1";
const origin="https://4species.com";
if(selected.length<3||new Set(selected.map(p=>p.slug)).size!==selected.length)throw Error("No V1 cohort");
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const jsonSafe=v=>JSON.stringify(v).replace(/</g,"\\u003c");
const index=JSON.parse(fs.readFileSync(path.join(data,"index.json"),"utf8"));
const pages=new Set(index.pages.map(p=>p.slug));
if(pages.size!==39+selected.length)throw Error("Original 39 + V1 count mismatch: "+pages.size);
const entries=[];
for(const s of selected){
 if(!pages.has(s.slug))throw Error("Not in Claude catalogue: "+s.slug);
 const p=JSON.parse(fs.readFileSync(path.join(data,s.slug+".json"),"utf8"));
 const htmlFile=path.join(dist,s.slug,"index.html");
 if(!fs.existsSync(htmlFile))throw Error("Missing public page "+s.slug);
 const img=p.hero,uri=origin+"/"+s.slug;
 if(p.provenance?.founderRelease!=="PREMIUM_V1_2026-10-22"||p.provenance?.photoSha256!==s.sha256||p.gallery.length)
  throw Error("Unsigned metadata/gallery "+s.slug);
 const local=img.url.replace(origin,"");
 if(!local.startsWith("/assets/species/next61/")||!fs.existsSync(path.join(dist,local.slice(1))))
  throw Error("Missing first party image "+s.slug);
 let html=fs.readFileSync(htmlFile,"utf8");
 if(!html.includes(uri)||!html.includes(p.identity.scientificName)||/noindex/i.test(html))throw Error("Unindexable/uncanonical HTML "+s.slug);
 const graph={"@context":"https://schema.org","@graph":[
 {"@type":"Taxon","@id":uri+"#taxon",name:p.identity.scientificName,alternateName:p.identity.commonName},
 {"@type":"WebPage","@id":uri+"#page",url:uri,name:p.identity.commonName+" ("+p.identity.scientificName+")",
 description:p.hook.text,about:{"@id":uri+"#taxon"},primaryImageOfPage:{"@id":uri+"#hero"}},
 {"@type":"ImageObject","@id":uri+"#hero",contentUrl:img.url,caption:img.alt,creditText:img.credit,
 license:img.licenseUrl,acquireLicensePage:img.sourcePage},
 {"@type":"BreadcrumbList","@id":uri+"#breadcrumb",itemListElement:[
 {"@type":"ListItem",position:1,name:"SPECIES",item:origin+"/explore"},
 {"@type":"ListItem",position:2,name:p.identity.commonName,item:uri}]}
 ]};
 if(!html.includes("</head>"))throw Error("No Claude HTML head");
 html=html.replace("</head>",'<script type="application/ld+json" data-4species-v1="true">'+jsonSafe(graph)+'</script></head>');
 fs.writeFileSync(htmlFile,html);
 entries.push("<url><loc>"+esc(uri)+"</loc><image:image><image:loc>"+esc(img.url)+"</image:loc></image:image></url>");
}
const imageMap='<?xml version="1.0" encoding="UTF-8"?>\n'+
 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'+entries.join("\n")+'\n</urlset>\n';
fs.writeFileSync(path.join(dist,"species-v1-images.xml"),imageMap);
const publicLines=index.pages.map(x=>"- ["+x.commonName+" ("+x.scientificName+") ]("+origin+"/"+x.slug+")");
const llms=["# 4PLANET SPECIES","","> An evidence-linked collection of life on Earth. For a Living Planet.","",
"## Browse and cite","",
"- Species directory: "+origin+"/explore",
"- Canonical sitemap: "+origin+"/sitemap.xml",
"- Image sitemap: "+origin+"/species-v1-images.xml","",
"## Species pages","",...publicLines,"",
"## Editorial provenance","",
"Species pages retain individually linked scientific references and photographer credits.",
"The original HTML article URL is authoritative. This optional file does not replace search-engine indexing or scientific verification.",""].join("\n");
fs.writeFileSync(path.join(dist,"llms.txt"),llms);
const xml=fs.readFileSync(path.join(dist,"species-sitemap.xml"),"utf8");
for(const s of selected)if(!xml.includes("<loc>"+origin+"/"+s.slug+"</loc>"))throw Error("Absent sitemap "+s.slug);
console.log("SPECIES_V1_SEARCH_READY "+JSON.stringify({count:selected.length,existing39:39,llms:true,imageSitemap:true,canonicalLinks:selected.map(x=>origin+"/"+x.slug)}));
