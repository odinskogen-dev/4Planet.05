import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Jaguar v21 protects smooth runtime and Ear-only 3D fidelity path', () => {
  const index = read('public/journey/jaguar/index.html');
  const config = JSON.parse(read('public/journey/jaguar/creature-v19.json'));
  const budget = read('public/xr/engine/nature-runtime-budget-v21.js');
  const renderer = read('public/xr/engine/nature-jaguar-3d-v19.js');
  const css = read('public/xr/jaguar/jaguar-performance-v21.css');

  assert.match(index, /jaguar-performance-v21\.css/, 'performance CSS must be loaded');
  assert.match(index, /nature-runtime-budget-v21\.js/, 'runtime budget controller must be loaded');

  assert.equal(config.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.equal(config.actor.preferred.binaryState, 'NOT_YET_LOCAL');
  assert.equal(config.actor.fallback.status, 'PHOTO_ONLY_NO_WEBGL');
  assert.doesNotMatch(renderer, /MTLLoader|OBJLoader|FALLBACK_BASE/, 'retired Poly OBJ fallback must not load in Gold runtime');
  assert.match(renderer, /binaryState !== 'CONTROLLED_LOCAL'/, '3D must fail closed until the Ear binary is controlled');
  assert.match(renderer, /1000 \/ 48/, 'full runtime must cap creature rendering below unbounded display refresh');
  assert.match(renderer, /1000 \/ 30/, 'balanced runtime must expose a 30fps creature budget');
  assert.match(renderer, /Math\.min\(dpr, 1\.25\)/, 'full Retina DPR must be capped');
  assert.match(renderer, /Math\.min\(dpr, 1\)/, 'balanced DPR must be capped to 1');
  assert.doesNotMatch(renderer, /wire\.traverse\([\s\S]*requestAnimationFrame\(tick\)/, 'wireframe material traversal must not live in the frame loop');

  assert.match(budget, /data\.runtimeBudget|dataset\.runtimeBudget/, 'runtime budget must be observable');
  assert.match(budget, /measured-jank/, 'runtime must be able to downgrade from measured jank');
  assert.match(budget, /visibilitychange/, 'background tabs must stop decorative runtime work');

  assert.match(css, /display:none!important;/, 'non-encounter depth layers must leave compositing, not merely become transparent');
  assert.match(css, /backdrop-filter:none!important;/, 'always-on backdrop blur must be removed');
  assert.match(css, /contain:strict/, 'WebGL viewport must be paint-contained');
  assert.match(css, /jaguarPhotoBreathV21/, 'photo safety fallback should preserve subtle living presence without WebGL');
});
