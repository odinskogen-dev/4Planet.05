import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
const url=(p)=>new URL(`../${p}`,import.meta.url);const read=(p)=>readFileSync(url(p),'utf8');

test('TEST KING Jaguar wires local Ear.Rodriguez V48 source-derived runtime with controlled fallback, Jungle/LUME room and all eight chapters',()=>{
  const html=read('public/journey/jaguar/index.html');
  const runtime=read('public/journey/jaguar/jaguar-gold-v33.js');
  const local=read('public/journey/jaguar/jaguar-ear-full-v43.js');
  const localData=read('public/journey/jaguar/jaguar-local-v48-data.js');
  const recovery=read('public/journey/jaguar/jaguar-surface-recovery-v37.js');
  const calibration=read('public/journey/jaguar/jaguar-runtime-calibration-v38.js');
  const donor=read('public/assets/species/jaguar/ear-runtime-v25/jaguar-ear-proxy-v25.js');
  const css=read('public/journey/jaguar/jaguar-gold-v33.css');

  // P0 wiring: the high-fidelity local data must exist before the runtime boots.
  assert.match(html,/jaguar-local-v48-data\.js/);assert.match(html,/jaguar-ear-full-v43\.js/);
  assert.ok(html.indexOf('jaguar-local-v48-data.js')<html.indexOf('jaguar-ear-full-v43.js'),'V48 data must load before V48 runtime');
  assert.match(localData,/window\.__JAGUAR_LOCAL_V48/);assert.match(localData,/Ear\.Rodriguez Jaguar CC BY 4\.0/);assert.match(localData,/8225124ef8370f7798c437b8ade8651d420e1ec0155ecbbb529058c586b89f13/);assert.match(localData,/SOURCE_DERIVED_SPATIAL_CLUSTER_RES26_BIND_POSE/);assert.match(localData,/vertexCount:\s*1626/);assert.match(localData,/indexCount:\s*9771/);

  // V48 must be local WebGL, not the rejected external white-panel iframe path.
  assert.match(local,/window\.__JAGUAR_LOCAL_V48/);assert.match(local,/local-source-derivative-v48/);assert.match(local,/ear-rodriguez-local-v48-source-derived/);assert.match(local,/procedural-presentation-motion-not-source-animation/);assert.match(local,/jaguar-local-v48/);assert.match(local,/DecompressionStream/);assert.match(local,/gl\.drawElements\(gl\.TRIANGLES/);assert.match(local,/pointerdown/);assert.match(local,/pointermove/);assert.match(local,/visibilitychange/);assert.match(local,/pagehide/);assert.match(local,/source-bind-pose-quadruped/);assert.match(local,/procedural-rosette-presentation-not-source-texture/);assert.match(local,/CC BY 4\.0/);
  assert.doesNotMatch(local,/sketchfab\.com\/models/);assert.doesNotMatch(local,/<iframe/);assert.doesNotMatch(local,/direct-official-embed/);assert.doesNotMatch(local,/animation_autoplay/);
  assert.match(html,/LOCAL SOURCE-DERIVED RUNTIME/);assert.match(html,/local high-fidelity derivative/i);assert.match(html,/external viewer was rejected/i);assert.match(html,/CC BY 4\.0/);

  // Existing controlled reduced donor remains fallback/recovery evidence only.
  assert.match(html,/jaguar-ear-proxy-v25\.js/);assert.match(html,/jaguar-surface-recovery-v37\.js/);assert.match(html,/jaguar-runtime-calibration-v38\.js/);assert.match(html,/jaguar-gold-v33\.js/);assert.match(html,/jaguar-gold-v33\.css/);
  assert.ok(html.indexOf('jaguar-surface-recovery-v37.js')<html.indexOf('jaguar-runtime-calibration-v38.js'),'calibration must run after indexed topology recovery');
  assert.ok(html.indexOf('jaguar-runtime-calibration-v38.js')<html.indexOf('jaguar-gold-v33.js'),'calibration must run before fallback runtime');
  assert.ok(html.indexOf('jaguar-gold-v33.js')<html.indexOf('jaguar-local-v48-data.js'),'local V48 path overlays controlled fallback only after fallback is available');
  assert.doesNotMatch(html,/jaguar-surface-v33\.js/);assert.doesNotMatch(html,/jaguar-surface-repair-v35\.js/);assert.doesNotMatch(html,/jaguar-surface-recovery-v36\.js/);
  assert.match(donor,/Ear\.Rodriguez Jaguar 1K GLB/);assert.match(donor,/CC BY 4\.0/);assert.match(donor,/vertices:457/);assert.match(donor,/faces:919/);assert.match(donor,/4PLANET-QPOS16-RGB8-IDX16-v1/);assert.match(donor,/sourceSha256:/);assert.match(donor,/proxyPayloadSha256:/);
  assert.match(recovery,/donor\.faces/);assert.match(recovery,/donor\.vertices/);assert.match(recovery,/donor index out of range/);assert.match(recovery,/SOURCE_DERIVED_INDEXED_PROXY/);assert.match(recovery,/CONTROLLED_DONOR_INDEX_BUFFER/);assert.match(recovery,/headPositiveX:true/);assert.doesNotMatch(recovery,/nearest\s*=/);assert.doesNotMatch(recovery,/faceTarget/);
  assert.match(calibration,/CONTROLLED_DONOR_INDEX_BUFFER/);assert.match(calibration,/DYNAMIC_BOUNDS_CANONICAL_QUADRUPED/);assert.match(calibration,/sourceOrientation:'HEAD_POSITIVE_X_Y_UP'/);assert.match(calibration,/presentationPoseRadians:0/);assert.doesNotMatch(calibration,/__JAGS33_I\s*=/);assert.doesNotMatch(calibration,/__JAGS33_P\s*=/);
  assert.match(runtime,/gl\.drawElements\(gl\.TRIANGLES/);assert.doesNotMatch(runtime,/gl\.drawArrays\(gl\.POINTS/);

  for(const label of ['01 / 08 · MEET LIFE','02 / 08 · LIVING WEB','03 / 08 · ECOSYSTEM + ATLAS','04 / 08 · PRESSURE','05 / 08 · UNDERSTANDING','06 / 08 · SOLUTIONS','07 / 08 · ACTORS + ACTION','08 / 08 · PROOF']) assert.ok(runtime.includes(label),`missing ${label}`);
  assert.match(css,/lume-grid--floor/);assert.match(css,/lume-grid--back/);assert.match(css,/lume-intel--species/);assert.match(css,/room--canopy/);assert.match(css,/ground-contact/);assert.match(css,/@media\(max-width:760px\)/);
  assert.match(html,/PANTHERA ONCA/);assert.match(html,/controlled species media remains visible/i);assert.doesNotMatch(html,/official Sketchfab viewer/i);
  assert.doesNotMatch(html,/ORIGINAL ANIMATED MASTER SECURED/);
});

test('invalid historical GLB derivative remains quarantined and is not the active V48 path',()=>{
  const cfg=JSON.parse(read('public/journey/jaguar/creature-v27.json'));const runtime=read('public/journey/jaguar/jaguar-gold-v33.js');const runtimePath=`public/${cfg.actor.preferred.runtimePath.replace(/^\//,'')}`;const compressed=readFileSync(url(runtimePath));
  assert.equal(cfg.actor.preferred.runtimeState,'BLOCKED_INVALID_BINARY');assert.doesNotMatch(runtime,/\.glb\.gz/);assert.throws(()=>gunzipSync(compressed),/unexpected end of file|unexpected end|Z_BUF_ERROR/i);
});
