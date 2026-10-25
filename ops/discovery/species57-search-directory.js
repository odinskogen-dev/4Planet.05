/* Source-derived species SEO directory, isolated from 57 existing profile HTML/JSON. */
const BASE="https://4species.com";
const VALID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
export function directoryEntries(catalog){
  if(!Array.isArray(catalog?.pages)||catalog.pages.length!==57)throw Error("SPECIES57_EXACT_CATALOG_REQUIRED");
  const items=catalog.pages.map(p=>{
    if(!p||!VALID.test(p.slug)||!p.commonName||!p.scientificName)throw Error("BAD_SPECIES_SOURCE");
    return {slug:p.slug,commonName:String(p.commonName),scientificName:String(p.scientificName),group:String(p.group||"Species")};
  });
  if(new Set(items.map(x=>x.slug)).size!==57)throw Error("DUPLICATE_PUBLIC_SPECIES");
  return items.sort((a,b)=>a.commonName.localeCompare(b.commonName,"en-GB"));
}
const css="*{box-sizing:border-box}body{margin:0;background:#fff;color:#172c21;font-family:DM Sans,Instrument Sans,system-ui,-apple-system,sans-serif;line-height:1.6}a{color:#275943;text-underline-offset:3px}a:focus-visible{outline:3px solid #3d8c6f;outline-offset:3px}.shell{max-width:1060px;margin:auto;padding:48px clamp(20px,4vw,50px)}.brand{font-size:13px;letter-spacing:.12em;text-decoration:none;font-weight:700}.eyebrow{text-transform:uppercase;font-size:12px;letter-spacing:.1em;color:#697a70;margin:60px 0 14px}h1{font-size:clamp(36px,5vw,60px);line-height:1.1;letter-spacing:-.05em;font-weight:600;max-width:750px;margin:0}.intro{color:#456153;font-size:17px;max-width:670px;margin:22px 0}.jump{display:flex;gap:18px;flex-wrap:wrap;padding:22px 0;border-block:1px solid #e2eae2;margin:44px 0}section{padding-top:32px}h2{font-size:24px;letter-spacing:-.03em}.cards{display:grid;grid-template-columns:1fr 1fr;gap:0 30px}.card{display:block;text-decoration:none;padding:17px 0;border-bottom:1px solid #e8eee9}.card strong{display:block;font-size:16px;color:#17382a}.card em{display:block;font-size:14px;color:#537061}.card small{display:block;color:#6b7e72;font-size:12px}footer{border-top:1px solid #e5ebe5;padding-top:25px;margin-top:80px;font-size:13px;color:#5a7263}@media(max-width:650px){.cards{grid-template-columns:1fr}.eyebrow{margin-top:30px}}";
const ranges=[["A–F",/^[a-f]/i,"a-f"],["G–M",/^[g-m]/i,"g-m"],["N–R",/^[n-r]/i,"n-r"],["S–Z",/^[s-z]/i,"s-z"]];
export function directoryHtml(catalog){
  const items=directoryEntries(catalog);
  const cards=ranges.map(([label,re,id])=>{
    const x=items.filter(p=>re.test(p.commonName));
    return '<section id="'+id+'" aria-labelledby="'+id+'-heading"><h2 id="'+id+'-heading">'+label+'</h2><div class="cards">'+x.map(p=>'<a class="card" href="/'+p.slug+'"><strong>'+esc(p.commonName)+'</strong><em>'+esc(p.scientificName)+'</em><small>'+esc(p.group)+'</small></a>').join("")+'</div></section>';
  }).join("");
  const ld=JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"CollectionPage","@id":BASE+"/species-directory#page","name":"Species directory | 4SPECIES","url":BASE+"/species-directory","description":"Browse 57 species profiles by common and scientific name.","mainEntity":{"@id":BASE+"/species-directory#items"}},{"@type":"ItemList","@id":BASE+"/species-directory#items","numberOfItems":57,"itemListElement":items.map((p,i)=>({"@type":"ListItem","position":i+1,"url":BASE+"/"+p.slug,"name":p.commonName+" ("+p.scientificName+")"}))}]}).replace(/</g,"\\u003c");
  return '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Species Directory: 57 Wildlife, Plants &amp; Fungi | 4SPECIES</title><meta name="description" content="Explore 57 source-linked species profiles with scientific names. Discover mammals, marine life, birds, plants and fungi."><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="'+BASE+'/species-directory"><link rel="alternate" type="application/json" href="'+BASE+'/species-directory.json"><style>'+css+'</style><script type="application/ld+json">'+ld+'</script></head><body><main class="shell"><a class="brand" href="/">4SPECIES</a><p class="eyebrow">The living world · Species library</p><h1>Discover the life we share Earth with.</h1><p class="intro">Browse 57 distinct, source-linked species profiles. Find individual pages by common name and scientific identity.</p><nav class="jump" aria-label="Jump to species names"><a href="#a-f">A–F</a><a href="#g-m">G–M</a><a href="#n-r">N–R</a><a href="#s-z">S–Z</a><a href="/explore">Explore life groups</a></nav>'+cards+'<footer><a href="/">4SPECIES Home</a> · <a href="/explore">Explore</a> · <a href="/species-directory.json">Species data (JSON)</a><p>4PLANET · For a Living Planet</p></footer></main></body></html>';
}
export function directoryJson(catalog){
  const items=directoryEntries(catalog);
  return JSON.stringify({schema:"4SPECIES_PUBLIC_DIRECTORY_V1",canonical:BASE+"/species-directory",total:items.length,profiles:items.map(p=>({...p,url:BASE+"/"+p.slug,sourceData:BASE+"/species-data/v1/"+p.slug+".json"}))});
}
export function exploreDiscoveryFooter(catalog){
  const list=directoryEntries(catalog);
  const recent=new Set("koala quokka capybara red-fox giant-anteater giant-otter walrus common-kingfisher secretary-bird scarlet-macaw peregrine-falcon ocean-sunfish giant-manta-ray greater-blue-ringed-octopus peacock-mantis-shrimp venus-flytrap titan-arum giant-sequoia".split(" "));
  const items=list.filter(x=>recent.has(x.slug));
  if(items.length!==18)throw Error("LIVE_NEW_18_MISSING");
  const links=items.map(x=>'<a style="color:#28563f;font-size:14px;text-underline-offset:3px" href="/'+x.slug+'">'+esc(x.commonName)+'</a>').join("");
  return '<aside aria-label="Discover all species" id="species57-search-discovery" style="background:#fff;color:#173b2b;font-family:DM Sans,Instrument Sans,system-ui,sans-serif;border-top:1px solid #e6ece6;max-width:1060px;margin:28px auto;padding:26px clamp(20px,4vw,50px)"><div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between"><strong style="font-size:18px">Explore all 57 species</strong><a href="/species-directory" style="color:#275943;font-size:14px;text-underline-offset:3px">Browse the complete species directory</a></div><details style="margin-top:14px"><summary style="cursor:pointer;color:#355b45;font-size:14px">18 recently added species</summary><nav aria-label="Recently added species" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;padding:18px 0">'+links+'</nav></details></aside>';
}
