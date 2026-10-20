import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {probe,check,ALERT_HEADER,buildAlertText} from './axe-public-surface-watch.mjs';
const FORBIDDEN_MARKERS=[/AXE-JOB-01/,/\[AXE \/ ChatGPT\]/];
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
test('alert text uses the machine-signal header',()=>{
 const text=buildAlertText('odinskogen-dev/4Planet.05','99');
 assert.equal(ALERT_HEADER,'[GITHUB / PUBLIC-SURFACE-WATCH]\nSIGNAL ONLY — not an AXE work order');
 assert.ok(text.startsWith(ALERT_HEADER+'\n'));
 assert.match(text,/kind: PUBLIC_SURFACE_MONITOR_FAIL/);
 assert.match(text,/event_id: github:odinskogen-dev\/4Planet\.05:seo-watch:99/);
 for(const marker of FORBIDDEN_MARKERS)assert.doesNotMatch(text,marker);
});
test('workflow alert step does not carry an AXE job marker',()=>{
 const workflow=readFileSync(new URL('../.github/workflows/axe-public-surface-watch.yml',import.meta.url),'utf8');
 assert.match(workflow,/github\.event_name != 'pull_request'/);
 assert.match(workflow,/node scripts\/axe-public-surface-watch\.mjs --alert-text/);
 for(const marker of FORBIDDEN_MARKERS)assert.doesNotMatch(workflow,marker);
 assert.match(readFileSync(new URL('./axe-public-surface-watch.mjs',import.meta.url),'utf8'),/\[GITHUB \/ PUBLIC-SURFACE-WATCH\]/);
});
