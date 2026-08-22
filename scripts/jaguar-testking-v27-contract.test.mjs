import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const url=(p)=>new URL(`../${p}`,import.meta.url);
const read=(p)=>readFileSync(url(p),'utf8');

test('TEST KING Jaguar restores the full journey and activates the local source-derived 3D path without loading the invalid GLB',()=>{
  const html=read('public/journey/jaguar/index.html');
  const runtime=read('public/journey/jaguar/jaguar-gold-v31.js');
  const css=read('public/journey/jaguar/jaguar-gold-v31.css');
  const meta=read('public/journey/jaguar/jaguar-data-meta-v29.js');
  const pos=read('public/journey/jaguar/jaguar-data-pos-v29.js');
  const nrm=read('public/journey/jaguar/jaguar-data-nrm-v29.js');
  const col=read('public/journey/jaguar/jaguar-data-col-v29.js');

  assert.match(html,/data-jaguar3d="idle"/);
  assert.match(html,/jaguar-gold-v31\.css/);
  assert.match(html,/jaguar-data-meta-v29\.js/);
  assert.match(html,/jaguar-data-pos-v29\.js/);
  assert.match(html,/jaguar-data-nrm-v29\.js/);
  assert.match(html,/jaguar-data-col-v29\.js/);
  assert.match(html,/jaguar-gold-v31\.js/);
  assert.doesNotMatch(html,/jaguar-runtime-quarantine-v30\.css/);
  assert.doesNotMatch(html,/jaguar-entry-bootstrap-v28\.js/);
  assert.doesNotMatch(html,/jaguar-ear-rodriguez-runtime\.glb\.gz/);
  assert.doesNotMatch(html,/<iframe/i);

  for(const label of ['01 / 08 · MEET LIFE','02 / 08 · LIVING WEB','03 / 08 · ECOSYSTEM + ATLAS','04 / 08 · PRESSURE','05 / 08 · UNDERSTANDING','06 / 08 · SOLUTIONS','07 / 08 · ACTORS + ACTION','08 / 08 · PROOF']) assert.match(runtime,new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(runtime,/getContext\('webgl'/);
  assert.match(runtime,/gl\.drawArrays\(gl\.POINTS/);
  assert.match(runtime,/data-action/);
  assert.match(runtime,/pointermove/);
  assert.match(runtime,/LOOK|look/i);
  assert.match(runtime,/MOVE|move/i);
  assert.match(runtime,/sceneIndex===7\?0:sceneIndex\+1/);
  assert.match(runtime,/document\.hidden/);
  assert.match(runtime,/full journey remains available/i);
  assert.match(css,/perspective:1100px/);
  assert.match(css,/room--far/);
  assert.match(css,/room--mid/);
  assert.match(css,/room--canopy/);
  assert.match(css,/foreground--left/);
  assert.match(css,/--scene-image/);
  assert.match(meta,/"verts":984/);
  assert.match(pos,/window\.__JAG29\.p=/);
  assert.match(nrm,/window\.__JAG29\.n=/);
  assert.match(col,/window\.__JAG29\.c=/);
  assert.match(html,/SOURCE-DERIVED 3D PRESENTATION/);
});

test('the old Ear.Rodriguez GLB derivative remains quarantined evidence and is not silently reclassified as valid',()=>{
  const cfg=JSON.parse(read('public/journey/jaguar/creature-v27.json'));
  const runtimePath=`public/${cfg.actor.preferred.runtimePath.replace(/^\//,'')}`;
  const compressed=readFileSync(url(runtimePath));

  assert.equal(cfg.actor.preferred.runtimeState,'BLOCKED_INVALID_BINARY');
  assert.equal(cfg.actor.preferred.runtimeMotion,'NOT_ACTIVE');
  assert.throws(
    ()=>gunzipSync(compressed),
    /unexpected end of file|unexpected end|Z_BUF_ERROR/i,
    'The invalid GLB donor must remain quarantined until a complete replacement is supplied.',
  );
});
