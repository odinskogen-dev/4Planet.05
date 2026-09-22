import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../ops/brain/4brain-public-worker.js';
test('public 4BRAIN homepage is safe and accurately labelled',async()=>{const r=await worker.fetch(new Request('https://4brain.app/'));const h=await r.text();assert.equal(r.status,200);for(const s of ['Your','Yours to keep','INTERACTIVE FICTIONAL DEMO','No account, AI model or remote storage is connected','4sapien.com','4brands.org'])assert.ok(h.includes(s),s);assert.ok(!h.includes('ODIN BRAIN —'));assert.match(r.headers.get('content-security-policy'),/connect-src 'none'/);assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);});
test('site script is functional with no network transmission',async()=>{const r=await worker.fetch(new Request('https://4brain.app/experience.js'));const js=await r.text();assert.equal(r.status,200);for(const s of ['approve','return','remove','export','URL.createObjectURL','fictional:true'])assert.ok(js.includes(s),s);assert.doesNotMatch(js,/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/);for(const s of ['localStorage.setItem','localStorage.removeItem','4brain.public.local-context.v1','navigator.clipboard.writeText','consent===true'])assert.ok(js.includes(s),s);});
test('assets, safe host routing, no mutations, and status',async()=>{for(const p of ['/site.css','/experience.js','/robots.txt'])assert.equal((await worker.fetch(new Request('https://4brain.app'+p))).status,200);assert.equal((await worker.fetch(new Request('https://4brain.app/private'))).status,404);assert.equal((await worker.fetch(new Request('https://other.example/'))).status,404);assert.equal((await worker.fetch(new Request('https://4brain.app/',{method:'POST'}))).status,405);const r=await worker.fetch(new Request('https://www.4brain.app/?utm=1'));assert.equal(r.status,308);assert.equal(r.headers.get('location'),'https://4brain.app/?utm=1');});

test('consent-first personal tool truth labels and isolated storage scope',async()=>{
 const h=await (await worker.fetch(new Request('https://4brain.app/'))).text();
 for(const phrase of ['LOCAL-ONLY PROTOTYPE','Make your first Context Pack','studio-content','Nothing you type is sent to 4BRAIN','not encrypted account storage','Authenticated account memory'])assert.ok(h.toLowerCase().includes(phrase.toLowerCase()),phrase);
 const js=await (await worker.fetch(new Request('https://4brain.app/experience.js'))).text();
 for(const phrase of ['Approved and save','consent','localStorage.setItem','localStorage.removeItem','this browser','URL.createObjectURL','4brain-my-local-context.json','Ask what changed'])assert.ok(js.toLowerCase().includes(phrase.toLowerCase()),phrase);
 assert.ok(!js.includes('api.openai.com'));
 assert.ok(!js.includes('supabase.co'));
 assert.match((await worker.fetch(new Request('https://4brain.app/'))).headers.get('content-security-policy'),/connect-src 'none'/);
});
