import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Jaguar v23 protects smooth runtime, Ear-only 3D fidelity and physical encounter room', () => {
  const index = read('public/journey/jaguar/index.html');
  const config = JSON.parse(read('public/journey/jaguar/creature-v19.json'));
  const budget = read('public/xr/engine/nature-runtime-budget-v21.js');
  const renderer = read('public/xr/engine/nature-jaguar-3d-v19.js');
  const liveBridge = read('public/xr/engine/nature-jaguar-sketchfab-v23.js');
  const css = read('public/xr/jaguar/jaguar-performance-v21.css');
  const room = read('public/xr/jaguar/jaguar-room-v22.css');

  assert.match(index, /jaguar-performance-v21\.css/, 'performance CSS must be loaded');
  assert.match(index, /jaguar-room-v22\.css/, 'physical room CSS must be loaded');
  assert.match(index, /nature-runtime-budget-v21\.js/, 'runtime budget controller must be loaded');
  assert.match(index, /nature-jaguar-sketchfab-v23\.js/, 'live 3D bridge must be loaded');

  assert.equal(config.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.equal(config.actor.preferred.binaryState, 'FOUNDER_SUPPLIED_VERIFIED_PENDING_REPO_BINARY_INGEST');
  assert.equal(config.actor.preferred.uploadedCandidate.profile, '1K_RUNTIME');
  assert.equal(config.actor.fallback.status, 'PHOTO_ONLY_NO_WEBGL');
  assert.doesNotMatch(renderer, /MTLLoader|OBJLoader|FALLBACK_BASE/, 'retired Poly OBJ fallback must not load in Gold runtime');
  assert.match(renderer, /binaryState !== 'CONTROLLED_LOCAL'/, 'self-hosted Three.js path must fail closed until repository binary ingest');
  assert.match(renderer, /1000 \/ 48/, 'full runtime must cap creature rendering below unbounded display refresh');
  assert.match(renderer, /1000 \/ 30/, 'balanced runtime must expose a 30fps creature budget');
  assert.match(renderer, /Math\.min\(dpr, 1\.25\)/, 'full Retina DPR must be capped');
  assert.match(renderer, /Math\.min\(dpr, 1\)/, 'balanced DPR must be capped to 1');
  assert.doesNotMatch(renderer, /wire\.traverse\([\s\S]*requestAnimationFrame\(tick\)/, 'wireframe material traversal must not live in the frame loop');

  assert.match(budget, /data\.runtimeBudget|dataset\.runtimeBudget/, 'runtime budget must be observable');
  assert.match(budget, /measured-jank/, 'runtime must be able to downgrade from measured jank');
  assert.match(budget, /visibilitychange/, 'background tabs must stop decorative runtime work');

  assert.match(liveBridge, /budgetAllows/, 'live bridge must obey performance budget');
  assert.match(liveBridge, /api\?\.pause/, 'live bridge must pause when inactive');
  assert.match(liveBridge, /identityScene/, 'live bridge must remain encounter-only');

  assert.match(css, /display:none!important;/, 'non-encounter depth layers must leave compositing, not merely become transparent');
  assert.match(css, /backdrop-filter:none!important;/, 'always-on backdrop blur must be removed');
  assert.match(css, /contain:strict/, 'WebGL viewport must be paint-contained');
  assert.match(css, /jaguarPhotoBreathV21/, 'photo safety fallback should preserve subtle living presence if 3D fails');

  assert.match(room, /perspective:1100px/, 'encounter room must retain a bounded spatial perspective');
  assert.match(room, /Ground contact|Ground contact:/, 'room must include explicit creature grounding');
  assert.match(room, /data-jaguar3d="preferred-pending"/, 'photo fallback must share the physical room');
  assert.match(room, /data-jaguar3d-active="true"/, 'future self-hosted Ear GLB must share the same physical room');
  assert.match(room, /data-runtime-budget="balanced"/, 'room must preserve a balanced laptop path');
  assert.match(room, /data-cinematic-scene="dependency"[\s\S]*display:none!important;/, 'encounter room must not leak into later landscape chapters');
});
