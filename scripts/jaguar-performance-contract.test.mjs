import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Jaguar master protects bounded real-source 3D, mobile fallback and the authored encounter environment', () => {
  const index = read('public/journey/jaguar/index.html');
  const config = JSON.parse(read('public/journey/jaguar/creature-v19.json'));
  const budget = read('public/xr/engine/nature-runtime-budget-v21.js');
  const bridge = read('public/xr/engine/nature-jaguar-sketchfab-v23.js');
  const bridgeCss = read('public/xr/jaguar/jaguar-ear-live-v23.css');
  const css = read('public/xr/jaguar/jaguar-performance-v21.css');
  const room = read('public/xr/jaguar/jaguar-room-v22.css');

  assert.match(index, /jaguar-performance-v21\.css/);
  assert.match(index, /jaguar-room-v22\.css/);
  assert.match(index, /nature-runtime-budget-v21\.js/);
  assert.match(index, /nature-jaguar-sketchfab-v23\.js/);
  assert.doesNotMatch(index, /nature-jaguar-local-v26\.js|jaguar-ear-proxy-v25\.js/);

  assert.equal(config.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.equal(config.actor.preferred.uploadedCandidate.profile, '1K_RUNTIME');
  assert.equal(config.actor.preferred.binaryState, 'FOUNDER_SUPPLIED_VERIFIED_PENDING_REPO_BINARY_INGEST');

  assert.match(bridge, /window\.innerWidth > 760/);
  assert.match(bridge, /const viewerAllowed = \(\) => desktopViewport\(\)/);
  assert.match(bridge, /requestAnimationFrame|setTimeout/);
  assert.match(bridge, /identityScene/);
  assert.match(bridgeCss, /@media\(max-width:760px\)/);

  assert.match(budget, /dataset\.runtimeBudget/);
  assert.match(budget, /measured-jank/);
  assert.match(budget, /visibilitychange/);

  assert.match(css, /backdrop-filter:none!important/);
  assert.match(room, /perspective:1100px/);
  assert.match(room, /Ground contact|Ground contact:/);
});
