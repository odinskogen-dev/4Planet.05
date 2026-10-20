import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { mammals } from "./mammals.mjs";
import { birds } from "./birds.mjs";
import { reptiles } from "./reptiles.mjs";
import { fishes } from "./fishes.mjs";
import { invertebratesPlants } from "./invertebrates-plants.mjs";

// Strictly non-live, non-Gold Claude V53 source-data donor. Never alter the 39.
const seeds=[...mammals,...birds,...reptiles,...fishes,...invertebratesPlants];
const live=new Set("orca african-savanna-elephant asian-elephant bald-eagle black-rhinoceros blue-whale bornean-orangutan cheetah chimpanzee emperor-penguin giant-panda giraffe gray-wolf great-white-shark green-sea-turtle hippopotamus jaguar lion monarch-butterfly polar-bear tiger english-oak western-honey-bee fly-agaric common-octopus atlantic-puffin sei-whale eurasian-lynx humpback-whale sperm-whale harbour-porpoise bottlenose-dolphin atlantic-cod blue-mussel whale-shark leopard eastern-gorilla acropora-palmata hyacinth-macaw".split(" "));
if(seeds.length!==61)throw Error("Must have exactly 61 curated seeds");
if(new Set(seeds.map(s=>s[0])).size!==61||seeds.some(s=>live.has(s[0])))throw Error("Duplicate or overlap with LIVE 39");
if(new Set(seeds.map(s=>s[2].toLowerCase())).size!==61)throw Error("Duplicate scientific identity");
const build=process.argv.includes("--build");
const root=process.env.SPECIES_OUTPUT_ROOT||process.cwd();
const reportRoot=process.env.SPECIES_REPORT_DIR||path.join(process.cwd(),"reports","species-next61");
const jsonDir=path.join(root,"public","species-data","v1");
const mediaDir=path.join(root,"public","assets","species","next61");
fs.mkdirSync(reportRoot,{recursive:true});
if(build){fs.mkdirSync(jsonDir,{recursive:true});fs.mkdirSync(mediaDir,{recursive:true});}
const report={generatedAt:new Date().toISOString(),source:"Claude original V53-compatible candidate data",count:61,existingLive:39,ranking:"EDITORIAL PRIORITY ONLY — NOT MEASURED WORLDWIDE SEARCH VOLUME",records:[]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const userAgent="4PLANET-SPECIES/1.0 (scientific and media provenance research; hello@4planet.org)";
async function load(url,binary=false){
 let last;
 for(let i=0;i<3;i++){
  try{
   const r=await fetch(url,{headers:{"User-Agent":userAgent},signal:AbortSignal.timeout(22000)});
   if(!r.ok)throw Error("HTTP "+r.status);
   return binary?Buffer.from(await r.arrayBuffer()):await r.json();
  }catch(e){last=e;await sleep(850*(i+1));}
 }
 throw last;
}
const clean=s=>String(s||"").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ").trim().slice(0,200);
const normal=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]/g,"");
async function biographicalSource(scientific){
 // Academic museum educational account; check HTTP and taxon-specific text.
 // Existence is NOT a claim-level scientific audit.
 const article="https://animaldiversity.org/accounts/"+scientific.replaceAll(" ","_")+"/";
 try{
  const r=await fetch(article,{headers:{"User-Agent":userAgent},signal:AbortSignal.timeout(14000)});
  if(!r.ok)throw Error("ADW HTTP "+r.status);
  const html=await r.text();
  if(!html.toLowerCase().includes(scientific.toLowerCase()))throw Error("ADW target taxon not confirmed");
  return {label:"University of Michigan Museum of Zoology — Animal Diversity Web, "+scientific,
    url:article,status:"URL_AND_TAXON_VERIFIED_NOT_CLAIM_AUDITED",category:"MuseumEducationalAccount"};
 }catch(e){
  return {label:"Wikipedia species-account reference, not independently claim-verified — "+scientific,
    url:"https://en.wikipedia.org/wiki/"+encodeURIComponent(scientific.replaceAll(" ","_")),
    status:"SECONDARY_DISCOVERY_ONLY",category:"EncyclopaediaReference",error:String(e).slice(0,125)};
 }
}

async function taxon(sci){
 const j=await load("https://api.gbif.org/v1/species/match?strict=true&name="+encodeURIComponent(sci));
 const good=normal(j.canonicalName||j.scientificName)===normal(sci)&&j.rank==="SPECIES"&&(j.confidence||0)>=90;
 return {good,rank:j.rank,confidence:j.confidence,matched:j.canonicalName,usageKey:j.usageKey,
  source:j.usageKey?"https://www.gbif.org/species/"+j.usageKey:null};
}
async function wikiLeadPhoto(scientific){
 // Wikipedia's lead file belongs to a taxon-specific article, rather than
 // to an unverified Commons keyword-search result. Independent visual QA still applies.
 const p=new URLSearchParams({action:"query",format:"json",formatversion:"2",
   prop:"pageimages",piprop:"name",pilicense:"free",redirects:"1",
   titles:scientific});
 const j=await load("https://en.wikipedia.org/w/api.php?"+p.toString());
 const article=j.query?.pages?.find(x=>x.pageimage&&!x.missing);
 if(!article||!article.pageimage)return null;
 const file=article.pageimage.replace(/^File:/,"");
 if(/map|range|diagram|illustration|sketch|drawing|symbol|logo|specimen|skeleton|skull/i.test(file))return null;
 const details=new URLSearchParams({action:"query",format:"json",formatversion:"2",
   titles:"File:"+file,prop:"imageinfo",iiprop:"url|size|mime|sha1|extmetadata",iiurlwidth:"1400"});
 const meta=await load("https://commons.wikimedia.org/w/api.php?"+details.toString());
 const page=meta.query?.pages?.find(x=>!x.missing&&x.imageinfo?.length);
 const info=page?.imageinfo?.[0];const m=info?.extmetadata||{};
 const license=clean(m.LicenseShortName?.value);
 const valid=/^CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)$/i.test(license)||
   /^(CC0|Public domain|PD-)/i.test(license);
 const artist=clean(m.Artist?.value||"");
 const licenceUrl=clean(m.LicenseUrl?.value);
 if(!info||!valid||!artist||!licenceUrl||!info.descriptionurl||
    !["image/jpeg","image/png","image/webp"].includes(info.mime)||
    info.width<1000||info.height<600)return null;
 return {name:"WIKIPEDIA_LEAD_FILE: "+file,sourcePage:info.descriptionurl,
   original:info.url,thumbnail:info.thumburl||info.url,artist,license,
   licenceUrl,width:info.width,height:info.height,sha1:info.sha1,
   photoLeadArticle:article.title,
   photoLeadPage:"https://en.wikipedia.org/wiki/"+encodeURIComponent(article.title.replaceAll(" ","_")),
   provenance:"Encyclopaedia taxon-article free-licence lead photograph; photo-specific Commons source and metadata; HUMAN VISUAL REVIEW OPEN"};
}

async function inatImages(scientific){
 const params=new URLSearchParams({
   taxon_name:scientific,quality_grade:"research",captive:"false",photos:"true",
   photo_license:"cc0,cc-by,cc-by-sa",per_page:"100",order:"desc",order_by:"votes"
 });
 const response=await load("https://api.inaturalist.org/v1/observations?"+params.toString());
 const accepted=[];
 const licenceUrls={"cc0":"https://creativecommons.org/publicdomain/zero/1.0/",
  "cc-by":"https://creativecommons.org/licenses/by/4.0/",
  "cc-by-sa":"https://creativecommons.org/licenses/by-sa/4.0/"};
 const seen=new Set();
 for(const observation of response.results||[]){
  const name=observation.taxon?.name;
  // NEVER use images of genus-only or a different species or even a parent species aggregate.
  if(normal(name)!==normal(scientific)||
     observation.quality_grade!=="research"||
     observation.captive===true||
     observation.taxon?.rank!=="species")continue;
  for(const photo of observation.photos||[]){
   const license=String(photo.license_code||"").toLowerCase();
   if(!licenceUrls[license]||!photo.id||!photo.url||seen.has(photo.id))continue;
   seen.add(photo.id);
   const credit=clean(photo.attribution || observation.user?.name || observation.user?.login);
   if(!credit)continue;
   const sourcePage="https://www.inaturalist.org/photos/"+photo.id;
   const observationPage="https://www.inaturalist.org/observations/"+observation.id;
   const photoUrl=photo.url.replace(/\/(?:square|thumb|small|medium|large|original)\./,
     "/original.");
   if(!/^https:\/\//.test(photoUrl))continue;
   // These are correctly identified research-grade wild observation photos,
   // but automated QA does NOT confirm visual composition, fidelity or current copyright ownership.
   accepted.push({name:"Research-grade wild observation: "+scientific+" (#"+observation.id+")",
    sourcePage,observationPage,original:photoUrl,thumbnail:photoUrl,artist:credit,
    license:license==="cc0"?"CC0 1.0":license==="cc-by"?"CC BY 4.0":"CC BY-SA 4.0",
    licenceUrl:licenceUrls[license],photoId:photo.id,observationId:observation.id,
    observedTaxon:scientific,observationQuality:"RESEARCH_GRADE",captive:false,
    provenance:"iNaturalist specimen-identified research-grade observation and separately licensed photo"});
   if(accepted.length>=8)return accepted;
  }
 }
 return accepted;
}

async function images(scientific,common){
 const p=new URLSearchParams({action:"query",format:"json",formatversion:"2",generator:"search",
  gsrsearch:'"'+scientific+'" filetype:bitmap',gsrnamespace:"6",gsrlimit:"28",prop:"imageinfo",
  iiprop:"url|size|mime|sha1|extmetadata",iiurlwidth:"1400"});
 const r=await load("https://commons.wikimedia.org/w/api.php?"+p.toString());
 const out=[];
 for(const v of r.query?.pages||[]){
  const i=v.imageinfo?.[0];const m=i?.extmetadata||{};
  const license=clean(m.LicenseShortName?.value);
  const cc=/^CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)$/i.test(license);
  const publicDomain=/^(CC0|Public domain|PD-)/i.test(license);
  const artist=clean(m.Artist?.value);
  const licenceUrl=clean(m.LicenseUrl?.value);
  const title=v.title||"";
  if(!i||i.width<1200||i.height<650||!["image/jpeg","image/png","image/webp"].includes(i.mime))continue;
  if((!cc&&!publicDomain)||!artist||!licenceUrl||!i.descriptionurl)continue;
  if(!normal(title).includes(normal(scientific))&&!normal(title).includes(normal(common)))continue;
  if(/zoo|captive|museum|drawing|illustrat|painting|stuffed|specimen|logo|toy|statue/i.test(title))continue;
  out.push({name:title,sourcePage:i.descriptionurl,original:i.url,thumbnail:i.thumburl||i.url,
   artist,license,licenceUrl,width:i.width,height:i.height,sha1:i.sha1});
 }
 return out.sort((a,b)=>(b.width*b.height)-(a.width*a.height)).slice(0,2); // RETAINED ONLY FOR RESEARCH, not accepted as wild media
}
async function storePhoto(photo,slug,slot){
 const b=await load(photo.thumbnail,true);
 const jpg=b[0]===255&&b[1]===216;
 const png=b[0]===137&&b[1]===80;
 const webp=b.toString("ascii",8,12)==="WEBP";
 if(!jpg&&!png&&!webp)throw Error("Downloaded media was not JPEG/PNG/WEBP");
 if(b.length<12000||b.length>20000000)throw Error("Media size invalid");
 const ext=jpg?"jpg":png?"png":"webp";
 const file=slug+"-"+slot+"."+ext;
 fs.writeFileSync(path.join(mediaDir,file),b);
 return {...photo,local:"/assets/species/next61/"+file,sha256:crypto.createHash("sha256").update(b).digest("hex"),bytes:b.length};
}
function profile(seed,id,pics,contentSource){
 const [slug,name,sci,group,hook,life,web,habitat,threat,action,searchAngle]=seed;
 const source={label:contentSource.label,url:contentSource.url};
 const taxonSource={label:"GBIF — "+sci+" accepted taxon",url:id.source};
 const claim=(text,src=source,state="INTERPRETED")=>({text,state,source:src});
 const info=(label,text,src=source)=>({label,text,state:"INTERPRETED",source:src});
 const media=pics.map(p=>({url:(process.env.SPECIES_MEDIA_BASE_URL||"https://4species.com")+p.local,credit:p.artist,licence:p.license,sourcePage:p.sourcePage,
  licenseUrl:p.licenceUrl,alt:name+" ("+sci+"); photo identity and composition pending human visual QA",focus:"50% 50%"}));
 return {schema:"4PLANET_SPECIES_PAGE_01",slug,domain:"E4RTH",
  identity:{commonName:name,scientificName:sci,authorship:"Pending authority citation",group},
  hook:claim(hook),intro:[claim(life),claim(web),claim(habitat)],
  highlights:[
    {value:"Adaptation",text:life,state:"INTERPRETED",source},
    {value:"Ecological role",text:web,state:"INTERPRETED",source},
    {value:"Home",text:habitat,state:"INTERPRETED",source}],
  hero:media[0]||{url:"",credit:"",licence:"UNRESOLVED",sourcePage:"",alt:"Image pending review",focus:"50% 50%"},
  glance:[{label:"Scientific name",value:sci,state:id.good?"KNOWN":"INTERPRETED",source:taxonSource},
    {label:"Life group",value:group,state:"INTERPRETED",source},
    {label:"Where it lives",value:(habitat.length<=60?habitat:habitat.slice(0,57).replace(/\s+\S*$/,"")+"…"),state:"INTERPRETED",source}],
  story:[
    {kind:"life",eyebrow:"A remarkable life",title:"How it survives",claims:[claim(life),claim(hook)]},
    {kind:"need",eyebrow:"The living web",title:"Why relationships matter",claims:[claim(web)]},
    {kind:"place",eyebrow:"A place to belong",title:"Where it lives",claims:[claim(habitat)]},
    {kind:"pressure",eyebrow:"What is changing",title:"Pressures and responses",claims:[claim(threat),claim(action)]}],
  gallery:media.slice(1),
  facts:{appearance:[info("Life adaptations",life)],physical:[],ecology:[info("Living system",web),info("Habitat",habitat)],
    conservation:[info("Possible pressures",threat),info("Possible responses",action)]},
  limits:["All species-specific ecological claims are working interpretations until individual primary-source review.",
    "A Wikipedia account is a discovery reference, not claim-level independent scientific verification.",
    "No species-level IUCN conservation code, population estimate or live location is asserted.",
    "Commons licence metadata and image identification require human visual and legal final review.",
    "GBIF accepted taxonomy does not prove range, abundance or ecological condition."],
  atlas:{layers:["bluemarble","biodiv"]},
  provenance:{review:"DRAFT",writtenBy:"4PLANET SPECIES / original editorial candidate",
    checkedAt:new Date().toISOString().slice(0,10),sourceReview:"PENDING",photoVisualReview:"PENDING",
    photographyReview:"PENDING",searchIntent:searchAngle,published:false,canonical:"https://4species.com/"+slug}
 };
}
for(let i=0;i<seeds.length;i++){
 const s=seeds[i],slug=s[0];
 const row={slug,scientific:s[2],editorialOrder:i+1,taxon:null,editorialSource:null,pictures:[],errors:[],ready:false,jsonCreated:false,
  quality:{taxon:false,photosLocal:false,licenceMetadata:false,scientificGold:false,mediaVisualGold:false}};
 try{row.taxon=await taxon(s[2]);row.quality.taxon=row.taxon.good;if(!row.taxon.good)row.errors.push("GBIF_MATCH_REVIEW");}
 catch(e){row.errors.push("GBIF "+e.message);}
 row.editorialSource=await biographicalSource(s[2]);
 if(row.editorialSource.status!=="URL_AND_TAXON_VERIFIED_NOT_CLAIM_AUDITED")row.errors.push("INDEPENDENT_SPECIES_BIOGRAPHY_SOURCE_NOT_FOUND");
 let img=[];
 try{
  let wiki=null;
  try{wiki=await wikiLeadPhoto(s[2]);}catch(e){row.errors.push("WIKIPEDIA_LEAD "+e.message);}
  img=await inatImages(s[2]);
  // Prefer taxon-article lead for species identity and composition. Keep
  // field observation candidates separate and legally source-traced.
  if(wiki)img=[wiki,...img.filter(p=>p.original!==wiki.original)];
  if(img.length<2)row.errors.push("LESS_THAN_TWO_VERIFIABLE_IMAGE_CANDIDATES");
  if(!img.length)row.errors.push("NO_PHOTOS_MATCHING_SOURCE_AND_RIGHTS_GATES");
 }
 catch(e){row.errors.push("COMMONS "+e.message);}
 if(build){
  for(const p of img){
   try{row.pictures.push(await storePhoto(p,slug,row.pictures.length?"gallery":"hero"));if(row.pictures.length>=2)break;}
   catch(e){row.errors.push("IMAGE "+e.message);}
  }
  row.quality.photosLocal=row.pictures.length>0;
  row.quality.licenceMetadata=row.pictures.length>0&&row.pictures.every(p=>p.artist&&p.license&&p.sourcePage&&p.sha256);
  if(row.taxon?.source){
   fs.writeFileSync(path.join(jsonDir,slug+".json"),JSON.stringify(profile(s,row.taxon,row.pictures,row.editorialSource),null,2));
   row.jsonCreated=true;
  }
 }else{row.pictures=img;row.quality.licenceMetadata=img.length>0;}
 row.photoOrigin = "iNaturalist exact-species research-grade wild observation with photo-specific commercial-safe license";
 report.records.push(row);
 console.log("SPECIES61 "+JSON.stringify({slug,taxon:row.quality.taxon,photos:row.pictures.length,created:row.jsonCreated,issues:row.errors}));
 if(i%5===0)await sleep(300);
}
report.summary={count:report.records.length,unique:61,overlapsWithLive:0,
 validatedTaxa:report.records.filter(x=>x.quality.taxon).length,
 licenceCandidates:report.records.filter(x=>x.quality.licenceMetadata).length,
 downloadedPhotos:report.records.reduce((sum,x)=>sum+x.pictures.filter(p=>p.sha256).length,0),
 draftProfilesCreated:report.records.filter(x=>x.jsonCreated).length,
 scienceGold:0,visualGold:0,READY_TO_PUBLISH:0};
fs.writeFileSync(path.join(reportRoot,"research-report.json"),JSON.stringify(report,null,2));
fs.writeFileSync(path.join(reportRoot,"media-rights-61.json"),JSON.stringify(report.records.map(x=>({slug:x.slug,files:x.pictures})),null,2));
console.log("SPECIES61_SUMMARY "+JSON.stringify(report.summary));
