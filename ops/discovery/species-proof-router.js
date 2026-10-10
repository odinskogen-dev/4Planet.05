
import puffinPage from '../../public/species-data/v1/atlantic-puffin.json' with { type: 'json' };
import beePage from '../../public/species-data/v1/western-honey-bee.json' with { type: 'json' };
import fungusPage from '../../public/species-data/v1/fly-agaric.json' with { type: 'json' };
import octopusPage from '../../public/species-data/v1/common-octopus.json' with { type: 'json' };

const PROOFS = {
  'atlantic-puffin': puffinPage,
  'western-honey-bee': beePage,
  'fly-agaric': fungusPage,
  'common-octopus': octopusPage
};
const PREFIX = '/__species_proof/';

// Keep the public, licensed source URL and author credit in the canonical JSON.
// Deliver pixels through SPECIES-owned edge caching; prevent Wikimedia rate limits
// from blanking the main image, especially between mobile and desktop visits.
function pageMedia(page, slug) {
  const items=[page.hero,...(page.gallery||[])].filter(i=>i && i.url);
  const out={...page};
  const publicUrl=(i)=>'https://4species.com'+PREFIX+slug+'/media/'+i;
  out.hero={...page.hero,url:publicUrl(0)};
  out.gallery=(page.gallery||[]).map((photo,index)=>({...photo,url:publicUrl(index+1)}));
  return out;
}
async function mediaResponse(request,slug,resource) {
  const page=PROOFS[slug];
  const index=Number(resource.slice('media/'.length));
  const images=[page.hero,...(page.gallery||[])].filter(i=>i && i.url);
  if(!Number.isInteger(index)||index<0||index>=images.length)return new Response('Not found',{status:404});
  const originalUrl=images[index].url;
  // Pinned, optimised, licensed production image derivative (manifest in GitHub).
  // Never depend on the Commons hotlink being accessible on every page view.
  const staticUrl='https://raw.githubusercontent.com/odinskogen-dev/4Planet.05/3da3eacbe677667b9a20ef1b16604f8b748bb2fa/public/species-media/'+slug+'/'+index+'.jpg';
  const cache=caches.default;
  const key=new Request(request.url,{method:'GET'});
  const cacheHeaders={'cache-control':'public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800','x-content-type-options':'nosniff'};
  try {
    const hit=await cache.match(key);
    if(hit)return new Response(request.method==='HEAD'?null:hit.body,{status:hit.status,headers:hit.headers});
  } catch {}
  for(let attempt=0;attempt<3;attempt++){
    try {
      const upstream=await fetch(attempt<2?staticUrl:originalUrl,{method:'GET',redirect:'follow',cf:{cacheEverything:true,cacheTtl:604800}});
      const kind=upstream.headers.get('content-type')||'';
      if(!upstream.ok||!kind.toLowerCase().startsWith('image/'))continue;
      const headers=new Headers(cacheHeaders);
      headers.set('content-type',kind);
      headers.set('cross-origin-resource-policy','same-origin');
      const response=new Response(upstream.body,{status:200,headers});
      if(request.method==='GET') {
        try {await cache.put(key,response.clone());}catch{}
        return response;
      }
      return new Response(null,{status:200,headers});
    } catch {}
  }
  return new Response('Image temporarily unavailable',{status:503,headers:{'cache-control':'no-store'}});
}



export function proofBootScript(slug, name) {
  // Canonical public URLs carry the species slug in pathname. The temporary
  // shared preview app expects a hash route, but must NEVER be permitted to
  // fall back to Orca on Safari's app-to-browser handoff / BFCache restore.
  const route = '#/labs/species/' + slug;
  const title = name + ' — SPECIES';
  return '(function(){'
    + 'const canonicalSlug='+JSON.stringify(slug)+';'
    + 'const canonicalHash='+JSON.stringify(route)+';'
    + 'const correctTitle='+JSON.stringify(title)+';'
    + 'function ownRoute(){'
    + 'const realPath=location.pathname.split("/").filter(Boolean)[0];'
    + 'if(realPath!==canonicalSlug)return;'
    + 'if(location.hash!==canonicalHash){history.replaceState(history.state,"",location.pathname+location.search+canonicalHash);}'
    + '}'
    + 'ownRoute();'
    + 'function destination(h){if(h==="/labs/species")return "/species/";'
    + 'if(h.startsWith("/labs/species/"))return "/"+h.slice("/labs/species/".length).split("/")[0];'
    + 'return null;}'
    + 'document.addEventListener("click",function(ev){'
    + 'const a=ev.target&&ev.target.closest&&ev.target.closest("a[href]");'
    + 'if(!a)return;const u=new URL(a.href,location.href);'
    + 'if(u.origin!==location.origin)return;'
    + 'const target=destination(u.hash.replace(/^#/,""));'
    + 'if(!target)return;'
    + 'ev.preventDefault();ev.stopImmediatePropagation();'
    + 'if(target!=="/"+canonicalSlug)location.assign(target);else ownRoute();'
    + '},true);'
    // Suppress stale SPA fallback and Safari session restoration. Navigate to
    // related species only from an explicit tapped link, caught above.
    + 'addEventListener("hashchange",ownRoute);'
    + 'addEventListener("pageshow",ownRoute);'
    + 'const el=document.querySelector("title");if(el){'
    + 'function sync(){if(document.title!==correctTitle)document.title=correctTitle;}'
    + 'new MutationObserver(sync).observe(el,{childList:true,characterData:true,subtree:true});sync();}'
    + '})();';
}

function security(headers) {
  const h=new Headers(headers);
  for (const key of ['set-cookie','content-length','content-encoding','etag','content-security-policy']) h.delete(key);
  h.set('x-robots-tag','noindex, nofollow');
  h.set('cache-control','no-store');
  h.set('referrer-policy','strict-origin-when-cross-origin');
  h.set('content-security-policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data: blob:; connect-src 'self' https://api.gbif.org https://api.obis.org https://api.inaturalist.org https://ghvdzetmplqkdtfqiror.supabase.co; font-src 'self' https: data:; frame-src 'self' https://4planetatlas.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  return h;
}

async function pageResponse(request,slug,origin) {
  const page=PROOFS[slug], upstream=await fetch(origin+'/',{method:request.method,headers:{Accept:'text/html'},redirect:'follow'});
  if(!upstream.ok)return new Response('SPECIES temporarily unavailable',{status:503,headers:{'cache-control':'no-store'}});
  const headers=security(upstream.headers);
  if(request.method==='HEAD')return new Response(null,{status:200,headers});
  const prefix=PREFIX+slug+'/';
  const rewrite=(element,attribute)=>{
    const value=element.getAttribute(attribute);if(!value)return;
    const url=new URL(value,origin+'/');
    if(url.origin===origin && url.pathname.startsWith('/assets/'))element.setAttribute(attribute,prefix+url.pathname.slice(1));
  };
  return new HTMLRewriter()
    .on('head',{element(element){element.prepend('<script src="'+prefix+'boot.js"></script>',{html:true});}})
    .on('title',{element(element){element.setInnerContent(page.identity.commonName+' — SPECIES');}})
    .on('script[src]',{element(element){rewrite(element,'src');}})
    .on('link[href]',{element(element){rewrite(element,'href');}})
    .transform(new Response(upstream.body,{status:upstream.status,headers}));
}

async function assetResponse(request,pathname,origin) {
  const rest=pathname.slice(PREFIX.length);
  const i=rest.indexOf('/');if(i<0)return new Response('Not found',{status:404});
  const slug=rest.slice(0,i),resource=rest.slice(i+1),page=PROOFS[slug];
  if(!page||resource.includes('..'))return new Response('Not found',{status:404});
  if(resource==='boot.js')return new Response(request.method==='HEAD'?null:proofBootScript(slug,page.identity.commonName),{headers:{'content-type':'application/javascript; charset=utf-8','cache-control':'no-store'}});
  if(/^media\/[0-9]+$/.test(resource))return mediaResponse(request,slug,resource);
  if(!resource.startsWith('assets/'))return new Response('Not found',{status:404});
  const upstream=await fetch(new URL(resource,origin+'/'),{method:request.method,redirect:'follow'});
  const headers=new Headers(upstream.headers);headers.delete('set-cookie');headers.delete('content-security-policy');
  if(!upstream.ok||request.method==='HEAD'||!resource.endsWith('.js'))return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,headers});
  const photos=[page.hero,...(page.gallery||[])].filter(v=>v&&v.url);
  const a=photos[0], b=photos[1]||a;
  const aUrl='https://4species.com'+PREFIX+slug+'/media/0';
  const bUrl='https://4species.com'+PREFIX+slug+'/media/'+(photos.length>1?1:0);
  const replacements=[
    ['https://upload.wikimedia.org/wikipedia/commons/1/17/Orcinus_orca_282690764.jpg',aUrl],
    ['https://upload.wikimedia.org/wikipedia/commons/3/37/Killerwhales_jumping.jpg',bUrl],
    ['https://commons.wikimedia.org/wiki/File:Orcinus_orca_282690764.jpg',a.sourcePage],
    ['https://commons.wikimedia.org/wiki/File:Killerwhales_jumping.jpg',b.sourcePage],
    ['steve b',a.credit],['Robert Pittman / NOAA',b.credit],
    ['CC0 1.0',a.licence],['Public domain (US federal government)',b.licence],
    ['Wild orca',page.identity.commonName],
    ['Orcas live in every ocean, with distinct social cultures and hunting strategies. This preview uses the referenced NOAA source document for its published facts.',page.hook.text],
    ['https://www.fisheries.noaa.gov/species/killer-whale',page.hook.source.url],
    ['commonName:"Orca"','commonName:'+JSON.stringify(page.identity.commonName)],
    ['title:"Orca"','title:'+JSON.stringify(page.identity.commonName)]
  ];
  let content=await upstream.text();
  for(const [from,to] of replacements) content=content.replaceAll(from,to);
  for(const key of ['content-length','content-encoding','etag'])headers.delete(key);
  headers.set('content-type','application/javascript; charset=utf-8');
  headers.set('cache-control','no-store');
  return new Response(content,{status:200,headers});
}

export async function handleSpeciesProof(request, pathname, origin) {
  if (!['GET','HEAD'].includes(request.method)) return null;
  const first=pathname.split('/').filter(Boolean)[0];
  if(PROOFS[first] && (pathname==='/'+first || pathname==='/'+first+'/'))return pageResponse(request,first,origin);
  if(pathname.startsWith(PREFIX))return assetResponse(request,pathname,origin);
  if(pathname.startsWith('/species-data/v1/') && pathname.endsWith('.json')){
    const slug=pathname.slice('/species-data/v1/'.length,-5);
    if(PROOFS[slug])return new Response(request.method==='HEAD'?null:JSON.stringify(pageMedia(PROOFS[slug],slug)),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex, nofollow'}});
  }
  if(pathname.startsWith('/species/')){
    const slug=pathname.slice('/species/'.length).replace(/\/$/,'');
    if(PROOFS[slug])return Response.redirect('https://4species.com/'+slug,302);
  }
  return null;
}
