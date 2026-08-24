import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
const url=(p)=>new URL(`../${p}`,import.meta.url);const read=(p)=>readFileSync(url(p),'utf8');

test('TEST KING Jaguar uses controlled Ear.Rodriguez indexed donor topology, calibrated creature scale, physical jungle room, LUME room and all eight chapters',()=>{
  const html=read('public/journey/jaguar/index.html');
  const runtime=read('public/journey/jaguar/jaguar-gold-v33.js');
  const recovery=read('public/journey/jaguar/jaguar-surface-recovery-v37.js');
  const calibration=read('public/journey/jaguar/jaguar-runtime-calibration-v38.js');
  const donor=read('public/assets/species/jaguar/ear-runtime-v25/jaguar-ear-proxy-v25.js');
  const css=read('public/journey/jaguar/jaguar-gold-v33.css');
  assert.match(html,/jaguar-ear-proxy-v25\.js/);assert.match(html,/jaguar-surface-recovery-v37\.js/);assert.match(html,/jaguar-runtime-calibration-v38\.js/);assert.match(html,/jaguar-gold-v33\.js/);assert.match(html,/jaguar-gold-v33\.css/);
  assert.ok(html.indexOf('jaguar-surface-recovery-v37.js')<html.indexOf('jaguar-runtime-calibration-v38.js'),'calibration must run after indexed topology recovery');
  assert.ok(html.indexOf('jaguar-runtime-calibration-v38.js')<html.indexOf('jaguar-gold-v33.js'),'calibration must run before WebGL runtime');
  assert.doesNotMatch(html,/jaguar-surface-v33\.js/);assert.doesNotMatch(html,/jaguar-surface-repair-v35\.js/);assert.doesNotMatch(html,/jaguar-surface-recovery-v36\.js/);assert.doesNotMatch(html,/<iframe/i);
  assert.match(donor,/Ear\.Rodriguez Jaguar 1K GLB/);assert.match(donor,/CC BY 4\.0/);assert.match(donor,/vertices:457/);assert.match(donor,/faces:919/);assert.match(donor,/4PLANET-QPOS16-RGB8-IDX16-v1/);assert.match(donor,/sourceSha256:/);assert.match(donor,/proxyPayloadSha256:/);
  assert.match(recovery,/donor\.faces/);assert.match(recovery,/donor\.vertices/);assert.match(recovery,/donor index out of range/);assert.match(recovery,/SOURCE_DERIVED_INDEXED_PROXY/);assert.match(recovery,/CONTROLLED_DONOR_INDEX_BUFFER/);assert.doesNotMatch(recovery,/nearest\s*=/);assert.doesNotMatch(recovery,/faceTarget/);
  assert.match(calibration,/CONTROLLED_DONOR_INDEX_BUFFER/);assert.match(calibration,/magnification=18/);assert.match(calibration,/targetCentre=\[0,1\.65,0\]/);assert.match(calibration,/FIT_RECOGNISABLE_INDEXED_EAR_JAGUAR_TO_ENCOUNTER_CAMERA_WITHOUT_MUTATING_SOURCE_TOPOLOGY/);assert.doesNotMatch(calibration,/__JAGS33_I\s*=/);assert.doesNotMatch(calibration,/__JAGS33_P\s*=/);
  assert.match(runtime,/gl\.drawElements\(gl\.TRIANGLES/);assert.match(runtime,/gl\.drawElements\(gl\.LINES/);assert.doesNotMatch(runtime,/gl\.drawArrays\(gl\.POINTS/);
  assert.match(runtime,/pointermove/);assert.match(runtime,/interaction='look'/);assert.match(runtime,/interaction='move'/);
  for(const label of ['01 / 08 · MEET LIFE','02 / 08 · LIVING WEB','03 / 08 · ECOSYSTEM + ATLAS','04 / 08 · PRESSURE','05 / 08 · UNDERSTANDING','06 / 08 · SOLUTIONS','07 / 08 · ACTORS + ACTION','08 / 08 · PROOF']) assert.ok(runtime.includes(label),`missing ${label}`);
  assert.match(css,/lume-grid--floor/);assert.match(css,/lume-grid--back/);assert.match(css,/lume-intel--species/);assert.match(css,/room--canopy/);assert.match(css,/ground-contact/);assert.match(css,/@media\(max-width:760px\)/);
  assert.match(html,/PANTHERA ONCA/);assert.match(html,/SOURCE-DERIVED INDEXED PRESENTATION 3D/);assert.match(html,/SOURCE-DERIVED INDEXED PROXY · NOT LIVE TRACKING/);assert.match(html,/not the original textured or rigged source model/);
  assert.doesNotMatch(html,/EXTERNAL VERIFIED VIEWER/);assert.doesNotMatch(html,/SOURCE MODEL ACTIVE/);assert.doesNotMatch(html,/ORIGINAL ANIMATED MASTER SECURED/);
});

test('invalid historical GLB derivative remains quarantined and is not in active Jaguar path',()=>{
  const cfg=JSON.parse(read('public/journey/jaguar/creature-v27.json'));const runtime=read('public/journey/jaguar/jaguar-gold-v33.js');const runtimePath=`public/${cfg.actor.preferred.runtimePath.replace(/^\//,'')}`;const compressed=readFileSync(url(runtimePath));
  assert.equal(cfg.actor.preferred.runtimeState,'BLOCKED_INVALID_BINARY');assert.doesNotMatch(runtime,/\.glb\.gz/);assert.throws(()=>gunzipSync(compressed),/unexpected end of file|unexpected end|Z_BUF_ERROR/i);
});
