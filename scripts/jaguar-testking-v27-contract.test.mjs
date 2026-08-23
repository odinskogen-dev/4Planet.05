import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
const url=(p)=>new URL(`../${p}`,import.meta.url);const read=(p)=>readFileSync(url(p),'utf8');

test('TEST KING Jaguar 33 uses an actual Ear-derived triangle surface, physical jungle room, LUME room and all eight chapters',()=>{
  const html=read('public/journey/jaguar/index.html');
  const runtime=read('public/journey/jaguar/jaguar-gold-v33.js');
  const bridge=read('public/journey/jaguar/jaguar-ear-bridge-v34.js');
  const css=read('public/journey/jaguar/jaguar-gold-v33.css');
  const data=read('public/journey/jaguar/jaguar-surface-v33.js');
  assert.match(html,/jaguar-surface-v33\.js/);assert.match(html,/jaguar-gold-v33\.js/);assert.match(html,/jaguar-gold-v33\.css/);assert.match(html,/jaguar-ear-bridge-v34\.js/);
  assert.doesNotMatch(html,/jaguar-data-(meta|pos|nrm|col)-v29\.js/);assert.doesNotMatch(html,/jaguar-gold-v32\.js/);assert.doesNotMatch(html,/<iframe/i);
  assert.match(data,/"verts":2432/);assert.match(data,/"faces":4829/);assert.match(data,/"edgePairs":7213/);
  assert.match(runtime,/gl\.drawElements\(gl\.TRIANGLES/);assert.match(runtime,/gl\.drawElements\(gl\.LINES/);assert.doesNotMatch(runtime,/gl\.drawArrays\(gl\.POINTS/);
  assert.match(runtime,/ear-rodriguez-v33-surface/);assert.match(runtime,/pointermove/);assert.match(runtime,/interaction='look'/);assert.match(runtime,/interaction='move'/);
  for(const label of ['01 / 08 · MEET LIFE','02 / 08 · LIVING WEB','03 / 08 · ECOSYSTEM + ATLAS','04 / 08 · PRESSURE','05 / 08 · UNDERSTANDING','06 / 08 · SOLUTIONS','07 / 08 · ACTORS + ACTION','08 / 08 · PROOF']) assert.ok(runtime.includes(label),`missing ${label}`);
  assert.match(css,/lume-grid--floor/);assert.match(css,/lume-grid--back/);assert.match(css,/lume-intel--species/);assert.match(css,/room--canopy/);assert.match(css,/ground-contact/);assert.match(css,/@media\(max-width:760px\)/);
  assert.match(html,/PANTHERA ONCA/);assert.match(html,/EAR\.RODRIGUEZ · CC BY 4\.0 · PRESENTATION 3D · NOT LIVE ANIMAL DATA/);
  assert.match(bridge,/91c61c329d2a4668816f81f08dfcd492/);assert.match(bridge,/viewerready/);assert.match(bridge,/getSceneGraph/);assert.match(bridge,/jaguar3dBridge='verified'/);assert.match(bridge,/CONTROLLED SPECIES MEDIA/);assert.match(bridge,/viewer-ready-timeout/);assert.match(bridge,/source-baked/);
  assert.doesNotMatch(html,/ORIGINAL ANIMATED MASTER SECURED/);
});

test('invalid historical GLB derivative remains quarantined and is not in active Jaguar 33 path',()=>{
  const cfg=JSON.parse(read('public/journey/jaguar/creature-v27.json'));const runtime=read('public/journey/jaguar/jaguar-gold-v33.js');const runtimePath=`public/${cfg.actor.preferred.runtimePath.replace(/^\//,'')}`;const compressed=readFileSync(url(runtimePath));
  assert.equal(cfg.actor.preferred.runtimeState,'BLOCKED_INVALID_BINARY');assert.doesNotMatch(runtime,/\.glb\.gz/);assert.throws(()=>gunzipSync(compressed),/unexpected end of file|unexpected end|Z_BUF_ERROR/i);
});
