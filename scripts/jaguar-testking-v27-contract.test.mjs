import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const url=(p)=>new URL(`../${p}`,import.meta.url);
const read=(p)=>readFileSync(url(p),'utf8');

test('TEST KING Jaguar quarantines the invalid v27 runtime and fails closed to controlled species media',()=>{
  const html=read('public/journey/jaguar/index.html');
  const cfg=JSON.parse(read('public/journey/jaguar/creature-v27.json'));
  const quarantineCss=read('public/journey/jaguar/jaguar-runtime-quarantine-v30.css');

  assert.equal(cfg.assetId,'4P-JAG-3D-EARROD-01');
  assert.equal(cfg.actor.preferred.runtimeState,'BLOCKED_INVALID_BINARY');
  assert.equal(cfg.actor.preferred.runtimeMotion,'NOT_ACTIVE');
  assert.equal(cfg.actor.fallback.status,'ACTIVE_FAIL_CLOSED_UNTIL_VALID_3D');
  assert.match(cfg.actor.preferred.runtimePath,/jaguar-ear-rodriguez-runtime\.glb\.gz$/);
  assert.match(html,/data-jaguar3d="failed"/);
  assert.match(html,/jaguar-runtime-quarantine-v30\.css/);
  assert.doesNotMatch(html,/jaguar-testking-v27\.js/);
  assert.doesNotMatch(html,/jaguar-runtime-recovery-v29\.js/);
  assert.doesNotMatch(html,/jaguar-ear-proxy-v25\.js/);
  assert.match(html,/CONTROLLED SPECIES MEDIA/);
  assert.match(html,/3D RUNTIME DEFERRED UNTIL VERIFIED/);
  assert.match(quarantineCss,/\.photo-fallback\{opacity:\.96!important\}/);
  assert.match(quarantineCss,/\.controls\{display:none!important\}/);
  assert.doesNotMatch(html,/<iframe/i);
});

test('quarantined TEST KING Jaguar GLB remains detectably invalid until a complete replacement is supplied',()=>{
  const cfg=JSON.parse(read('public/journey/jaguar/creature-v27.json'));
  const runtimePath=`public/${cfg.actor.preferred.runtimePath.replace(/^\//,'')}`;
  const compressed=readFileSync(url(runtimePath));

  assert.throws(
    ()=>gunzipSync(compressed),
    /unexpected end of file|unexpected end|Z_BUF_ERROR/i,
    'The currently quarantined donor is expected to remain structurally invalid; replacing it requires restoring the strict valid-GLB contract before runtime activation.',
  );
});
