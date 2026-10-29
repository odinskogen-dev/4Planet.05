import assert from 'node:assert/strict';
import worker from './additive-next5-edge-20261029.mjs';
const root='https://4species.com',old4=['atlas-moth','peacock-spider','emperor-scorpion','dragon-blood-tree'],new5=['clouded-leopard','sea-otter','snowy-owl','indian-peafowl','coconut-crab'];
const originalXml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+[...Array(62)].map((_,i)=>'<url><loc>'+root+'/base-'+i+'</loc></url>').join('\n')+'\n</urlset>';
const oldFetch=globalThis.fetch,calls=[];
globalThis.fetch=async(value)=>{
 const url=typeof value==='string'?value:value.url;calls.push(url);
 if(url===root+'/sitemap.xml')return new Response(originalXml,{headers:{'content-type':'application/xml'}});
 if(url===root+'/assets/previous.js')return new Response('originalExactBytes',{headers:{'content-type':'application/javascript'}});
 if(url===root+'/assets/index-MISSING.js')return new Response('<html>broken</html>',{headers:{'content-type':'text/html'}});
 if(url==='https://b0951128.4planet-05.pages.dev/assets/index-MISSING.js')return new Response('<html>previous shell</html>',{headers:{'content-type':'text/html'}});
 if(url==='https://a8010871.4planet-05.pages.dev/assets/index-MISSING.js')return new Response('export const recovered=1;',{headers:{'content-type':'application/javascript','x-robots-tag':'noindex'}});
 const five=new5.find(x=>url==='https://a8010871.4planet-05.pages.dev/'+x);
 if(five)return new Response('<html><head><link rel="canonical" href="'+root+'/'+five+'"></head><body><h1>'+five+'</h1></body></html>',{headers:{'content-type':'text/html','x-robots-tag':'noindex'}});
 const species=new5.find(x=>url==='https://a8010871.4planet-05.pages.dev/species-data/v1/'+x+'.json');
 if(species)return new Response(JSON.stringify({slug:species,schema:'4PLANET_SPECIES_PAGE_01',identity:{scientificName:'Evidence '+species},hero:{url:root+'/assets/species/next61/'+species+'-hero.jpg',credit:'Creator',licence:'CC BY 4.0',sourcePage:'https://example.org/source'},gallery:[],provenance:{founderRelease:'PREMIUM_V1_2026-10-28_CANDIDATE_ONLY'}}),{headers:{'content-type':'application/json','x-robots-tag':'noindex'}});
 return new Response('Not Found',{status:404});
};
try{
 for(const slug of new5){
  const r=await worker.fetch(new Request(root+'/'+slug));assert.equal(r.status,200);assert.equal(r.headers.get('x-robots-tag'),'index,follow,max-image-preview:large');assert.ok((await r.text()).includes('<h1>'+slug+'</h1>'));
  const d=await worker.fetch(new Request(root+'/species-data/v1/'+slug+'.json'));assert.equal(d.status,200);assert.equal((await d.json()).slug,slug);assert.ok(!d.headers.has('x-robots-tag'));
 }
 const s=await worker.fetch(new Request(root+'/sitemap.xml'));assert.equal(s.status,200);const xml=await s.text();const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);assert.equal(urls.length,71);assert.deepEqual(urls.slice(62),[...old4,...new5].map(s=>root+'/'+s));assert.equal(new Set(urls).size,71);
 const old=await worker.fetch(new Request(root+'/assets/previous.js'));assert.equal(await old.text(),'originalExactBytes');assert.ok(!old.headers.has('x-4species-additive-release'),'Original headers must remain unchanged');
 const recovered=await worker.fetch(new Request(root+'/assets/index-MISSING.js'));assert.equal(await recovered.text(),'export const recovered=1;');assert.equal(recovered.headers.get('content-type'),'application/javascript');assert.equal(recovered.headers.get('x-4species-additive-release'),'nine-premium-20261029');assert.ok(!recovered.headers.has('x-robots-tag'));
 const bad=await worker.fetch(new Request(root+'/unapproved-species'));assert.equal(bad.status,404);
 const post=await worker.fetch(new Request(root+'/clouded-leopard',{method:'POST'}));assert.equal(post.status,405);
 const foreign=await worker.fetch(new Request('https://somewhere.example/clouded-leopard'));assert.equal(foreign.status,404);
 assert.ok(calls.includes('https://a8010871.4planet-05.pages.dev/clouded-leopard'));
 console.log('FIVE_APPEND_ONLY_WORKER_UNIT_GOLD_PASS 61 previous +5, 71 sitemap URL list, no public origin or existing product modifications');
}finally{globalThis.fetch=oldFetch}
