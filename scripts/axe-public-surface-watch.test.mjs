import {test} from 'node:test';
import assert from 'node:assert/strict';
import {probe,check} from './axe-public-surface-watch.mjs';
const fake=(html,status=200,headers={})=>async url=>new Response(html,{status,headers});
test('healthy production HTML accepted',async()=>{
 const x=await probe(fake('<html><head><link rel="canonical" href="https://4planet.org/"></head></html>'),'https://4planet.org/','page');
 assert.equal(x.state,'PASS');
});
test('explicit public noindex FAILs closed',async()=>{
 const x=await probe(fake('<html><meta name="robots" content="noindex"></html>'),'https://4planet.org/','page');
 assert.equal(x.state,'FAIL');assert(x.issues.includes('NOINDEX_PUBLIC_PAGE'));
});
test('site down FAILs, sitemap 404 warns',async()=>{
 assert.equal((await probe(fake('down',503),'https://4planet.org/','page')).state,'FAIL');
 assert.equal((await probe(fake('down',404),'https://4planet.org/sitemap.xml','sitemap')).state,'WARN');
});
test('no network: fetch failure handled safely',async()=>{
 const x=await probe(async()=>{throw new Error('offline')},'https://4planet.org/','page');assert.equal(x.state,'FAIL');
});
test('global check is deterministic with mocked fetcher',async()=>{
 const fetcher=async (url)=>new Response(url.includes('sitemap')?'<urlset></urlset>':`<html><link rel="canonical" href="${url}"></html>`,{status:200});
 const res=await check(fetcher);
 assert.equal(res.state,'PASS');assert.equal(res.results.length,7);
});
