import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Jaguar v25 protects smooth runtime, local 3D presence and the physical encounter room', () => {
  const index = read('public/journey/jaguar/index.html');
  const config = JSON.parse(read('public/journey/jaguar/creature-v19.json'));
  const budget = read('public/xr/engine/nature-runtime-budget-v21.js');
  const renderer = read('public/xr/engine/nature-jaguar-local-v25.js');
  const localCss = read('public/xr/jaguar/jaguar-ear-local-v25.css');
  const css = read('public/xr/jaguar/jaguar-performance-v21.css');
  const room = read('public/xr/jaguar/jaguar-room-v22.css');

  assert.match(index, /jaguar-performance-v21\.css/);
  assert.match(index, /jaguar-room-v22\.css/);
  assert.match(index, /nature-runtime-budget-v21\.js/);
  assert.match(index, /nature-jaguar-local-v25\.js/);
  assert.doesNotMatch(index, /nature-jaguar-sketchfab-v23\.js|<iframe/i);

  assert.equal(config.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.equal(config.actor.preferred.uploadedCandidate.profile, '1K_RUNTIME');

  assert.match(renderer, /1000 \/ 40/);
  assert.match(renderer, /1000 \/ 30/);
  assert.match(renderer, /1000 \/ 24/);
  assert.match(renderer, /Math\.min\(dpr, 1\.15\)/);
  assert.match(renderer, /Math\.min\(dpr, 1\)/);
  assert.match(renderer, /Math\.min\(dpr, \.85\)/);
  assert.match(renderer, /document\.hidden/);
  assert.match(renderer, /pagehide/);

  assert.match(budget, /dataset\.runtimeBudget/);
  assert.match(budget, /measured-jank/);
  assert.match(budget, /visibilitychange/);

  assert.match(localCss, /data-runtime-budget="lite"[\s\S]*nature-3d-subject--v25\{display:block!important/);
  assert.match(localCss, /@media\(max-width:760px\)[\s\S]*nature-3d-subject--v25[\s\S]*display:block!important/);
  assert.match(css, /backdrop-filter:none!important/);
  assert.match(room, /perspective:1100px/);
  assert.match(room, /Ground contact|Ground contact:/);
  assert.match(room, /data-cinematic-scene="dependency"[\s\S]*display:none!important/);
});
