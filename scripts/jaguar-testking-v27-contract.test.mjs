import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
const url=(p)=>new URL(`../${p}`,import.meta.url);const read=(p)=>readFileSync(url(p),'utf8');

test('TEST KING Jaguar uses verified Ear.Rodriguez full-source viewer with controlled indexed fallback, canonical jungle/LUME room and all eight chapters',()=>{
  const html=read('public/journey/jaguar/index.html');
  const runtime=read('public/journey/jaguar/jaguar-gold-v33.js');
  const full=read('public/journey/jaguar/jaguar-ear-full-v43.js');
  const recovery=read('public/journey/jaguar/jaguar-surface-recovery-v37.js');
  const calibration=read('public/journey/jaguar/jaguar-runtime-calibration-v38.js');
  const donor=read('public/assets/species/jaguar/ear-runtime-v25/jaguar-ear-proxy-v25.js');
  const css=read('public/journey/jaguar/jaguar-gold-v33.css');

  // Full source viewer is the primary encounter creature; local indexed donor remains a fail-safe fallback.
  assert.match(html,/jaguar-ear-full-v43\.js/);assert.match(html,/EAR\.RODRIGUEZ FULL MODEL/);assert.match(html,/FULL SOURCE MODEL PRESENTATION/);assert.match(html,/CC BY 4\.0/);
  assert.match(full,/91c61c329d2a4668816f81f08dfcd492/);assert.match(full,/sketchfab\.com\/models\/\$\{MODEL_UID\}\/embed/);assert.match(full,/direct-official-embed-v45/);assert.match(full,/jaguarEarFull = 'loading'/);assert.match(full,/jaguarEarFull = 'ready'/);assert.match(full,/jaguarEarFull = 'fallback'/);assert.match(full,/direct-embed-timeout/);assert.match(full,/animation_autoplay=1/);assert.match(full,/visibilitychange/);assert.match(full,/about:blank/);assert.match(full,/CC BY 4\.0/);
  assert.doesNotMatch(full,/static\.sketchfab\.com\/api\/sketchfab-viewer/);assert.doesNotMatch(full,/client\.init\(/);assert.doesNotMatch(full,/getSceneGraph/);
  assert.match(full,/data-jaguar-ear-full|jaguarEarFull/);assert.match(full,/jaguar3dSource = 'ear-rodriguez-full-source-viewer'/);

  // Existing controlled local proxy remains intact and cannot become fabricated topology.
  assert.match(html,/jaguar-ear-proxy-v25\.js/);assert.match(html,/jaguar-surface-recovery-v37\.js/);assert.match(html,/jaguar-runtime-calibration-v38\.js/);assert.match(html,/jaguar-gold-v33\.js/);assert.match(html,/jaguar-gold-v33\.css/);
  assert.ok(html.indexOf('jaguar-surface-recovery-v37.js')<html.indexOf('jaguar-runtime-calibration-v38.js'),'calibration must run after indexed topology recovery');
  assert.ok(html.indexOf('jaguar-runtime-calibration-v38.js')<html.indexOf('jaguar-gold-v33.js'),'calibration must run before local WebGL fallback runtime');
  assert.ok(html.indexOf('jaguar-gold-v33.js')<html.indexOf('jaguar-ear-full-v43.js'),'full source viewer must mount after fallback runtime is available');
  assert.doesNotMatch(html,/jaguar-surface-v33\.js/);assert.doesNotMatch(html,/jaguar-surface-repair-v35\.js/);assert.doesNotMatch(html,/jaguar-surface-recovery-v36\.js/);
  assert.match(donor,/Ear\.Rodriguez Jaguar 1K GLB/);assert.match(donor,/CC BY 4\.0/);assert.match(donor,/vertices:457/);assert.match(donor,/faces:919/);assert.match(donor,/4PLANET-QPOS16-RGB8-IDX16-v1/);assert.match(donor,/sourceSha256:/);assert.match(donor,/proxyPayloadSha256:/);
  assert.match(recovery,/donor\.faces/);assert.match(recovery,/donor\.vertices/);assert.match(recovery,/donor index out of range/);assert.match(recovery,/SOURCE_DERIVED_INDEXED_PROXY/);assert.match(recovery,/CONTROLLED_DONOR_INDEX_BUFFER/);assert.match(recovery,/headPositiveX:true/);assert.doesNotMatch(recovery,/nearest\s*=/);assert.doesNotMatch(recovery,/faceTarget/);
  assert.match(calibration,/CONTROLLED_DONOR_INDEX_BUFFER/);assert.match(calibration,/headPositiveX!==true/);assert.match(calibration,/DYNAMIC_BOUNDS_CANONICAL_QUADRUPED/);assert.match(calibration,/targetLongestSpan=3\.45/);assert.match(calibration,/targetCentre=\[0,1\.58,0\]/);assert.match(calibration,/targetLongestSpan\/sourceMaxSpan/);assert.match(calibration,/sourceOrientation:'HEAD_POSITIVE_X_Y_UP'/);assert.match(calibration,/presentationPoseRadians:0/);assert.match(calibration,/WITHOUT_MUTATING_SOURCE_TOPOLOGY_PAYLOAD_OR_CANONICAL_QUADRUPED_POSE/);assert.doesNotMatch(calibration,/magnification=18/);assert.doesNotMatch(calibration,/poseC=/);assert.doesNotMatch(calibration,/poseS=/);assert.doesNotMatch(calibration,/__JAGS33_I\s*=/);assert.doesNotMatch(calibration,/__JAGS33_P\s*=/);
  assert.match(calibration,/preserveDrawingBuffer:true/);assert.match(calibration,/data.*jaguarVisual|jaguarVisual/);assert.match(calibration,/canonical-quadruped/);
  assert.match(runtime,/gl\.drawElements\(gl\.TRIANGLES/);assert.match(runtime,/gl\.drawElements\(gl\.LINES/);assert.doesNotMatch(runtime,/gl\.drawArrays\(gl\.POINTS/);
  assert.match(runtime,/pointermove/);assert.match(runtime,/interaction='look'/);assert.match(runtime,/interaction='move'/);

  for(const label of ['01 / 08 · MEET LIFE','02 / 08 · LIVING WEB','03 / 08 · ECOSYSTEM + ATLAS','04 / 08 · PRESSURE','05 / 08 · UNDERSTANDING','06 / 08 · SOLUTIONS','07 / 08 · ACTORS + ACTION','08 / 08 · PROOF']) assert.ok(runtime.includes(label),`missing ${label}`);
  assert.match(css,/lume-grid--floor/);assert.match(css,/lume-grid--back/);assert.match(css,/lume-intel--species/);assert.match(css,/room--canopy/);assert.match(css,/ground-contact/);assert.match(css,/@media\(max-width:760px\)/);
  assert.match(html,/PANTHERA ONCA/);assert.match(html,/controlled local proxy and species media remain fallbacks/i);assert.match(html,/official Sketchfab viewer/i);assert.match(html,/controlled original 1K GLB is preserved separately/i);
  assert.doesNotMatch(html,/ORIGINAL ANIMATED MASTER SECURED/);
});

test('invalid historical GLB derivative remains quarantined and is not in active local fallback path',()=>{
  const cfg=JSON.parse(read('public/journey/jaguar/creature-v27.json'));const runtime=read('public/journey/jaguar/jaguar-gold-v33.js');const runtimePath=`public/${cfg.actor.preferred.runtimePath.replace(/^\//,'')}`;const compressed=readFileSync(url(runtimePath));
  assert.equal(cfg.actor.preferred.runtimeState,'BLOCKED_INVALID_BINARY');assert.doesNotMatch(runtime,/\.glb\.gz/);assert.throws(()=>gunzipSync(compressed),/unexpected end of file|unexpected end|Z_BUF_ERROR/i);
});
