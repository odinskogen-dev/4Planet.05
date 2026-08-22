import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Ear 3D uses the verified official source bridge; degraded proxy runtime is not allowed as Gold', () => {
  const html = read('public/journey/jaguar/index.html');
  const bridge = read('public/xr/engine/nature-jaguar-sketchfab-v23.js');
  const css = read('public/xr/jaguar/jaguar-ear-live-v23.css');
  const config = JSON.parse(read('public/journey/jaguar/creature-v19.json'));

  assert.equal(config.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.equal(config.actor.preferred.binaryState, 'FOUNDER_SUPPLIED_VERIFIED_PENDING_REPO_BINARY_INGEST');
  assert.match(html, /nature-jaguar-sketchfab-v23\.js/);
  assert.match(html, /jaguar-ear-live-v23\.css/);
  assert.doesNotMatch(html, /nature-jaguar-local-v26\.js|jaguar-ear-proxy-v25\.js/);

  assert.match(bridge, /91c61c329d2a4668816f81f08dfcd492/);
  assert.match(bridge, /sketchfab\.com\/models/);
  assert.match(bridge, /ear-rodriguez-jaguar/);
  assert.match(bridge, /window\.innerWidth <= 760/);
  assert.match(bridge, /identityScene/);
  assert.match(css, /nature-ear-live-v23/);
  assert.match(css, /@media\(max-width:760px\)/);
});
