
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

export function proofBootScript(slug, name) {
  const route = '#/labs/species/' + slug;
  const title = name + ' — SPECIES';
  return '(function(){'
    + 'const slug='+JSON.stringify(slug)+';'
    + 'const correct='+JSON.stringify(route)+';'
    + 'const correctTitle='+JSON.stringify(title)+';'
    + 'if(!location.hash.startsWith(correct))location.replace(location.pathname+location.search+correct);'
    + 'function destination(h){if(h==="/labs/species")return "/species/";'
    + 'if(h.startsWith("/labs/species/"))return "/"+h.slice("/labs/species/".length).split("/")[0];'
    + 'return null;}'
    + 'document.addEventListener("click",function(ev){'
    + 'const a=ev.target&&ev.target.closest&&ev.target.closest("a[href]");'
    + 'if(!a)return;const u=new URL(a.href,location.href);'
    + 'if(u.origin!==location.origin)return;'
    + 'const d=destination(u.hash.replace(/^#/,""));if(!d)return;'
    + 'ev.preventDefault();ev.stopImmediatePropagation();location.assign(d);'
    + '},true);'
    + 'addEventListener("hashchange",function(){const h=location.hash.replace(/^#/,"");'
    + 'if(h==="/labs/species"||(h.startsWith("/labs/species/")&&h!==correct.slice(1))){'
    + 'const d=destination(h);if(d)location.assign(d);}});'
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
    .on('head',{element(element){element.append('<script src="'+prefix+'boot.js"></script>',{html:true});}})
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
  if(!resource.startsWith('assets/'))return new Response('Not found',{status:404});
  const upstream=await fetch(new URL(resource,origin+'/'),{method:request.method,redirect:'follow'});
  const headers=new Headers(upstream.headers);headers.delete('set-cookie');headers.delete('content-security-policy');
  if(!upstream.ok||request.method==='HEAD'||!resource.endsWith('.js'))return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,headers});
  const photos=[page.hero,...(page.gallery||[])].filter(v=>v&&v.url);
  const a=photos[0], b=photos[1]||a;
  const replacements=[
    ['https://upload.wikimedia.org/wikipedia/commons/1/17/Orcinus_orca_282690764.jpg',a.url],
    ['https://upload.wikimedia.org/wikipedia/commons/3/37/Killerwhales_jumping.jpg',b.url],
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
    if(PROOFS[slug])return new Response(request.method==='HEAD'?null:JSON.stringify(PROOFS[slug]),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-robots-tag':'noindex, nofollow'}});
  }
  if(pathname.startsWith('/species/')){
    const slug=pathname.slice('/species/'.length).replace(/\/$/,'');
    if(PROOFS[slug])return Response.redirect('https://4species.com/'+slug,302);
  }
  return null;
}
