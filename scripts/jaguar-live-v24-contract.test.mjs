import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Ear 3D is visible-first on desktop and cannot silently disappear behind lite mode', () => {
  const js = read('public/xr/engine/nature-jaguar-sketchfab-v23.js');
  const css = read('public/xr/jaguar/jaguar-ear-live-v23.css');
  const config = JSON.parse(read('public/journey/jaguar/creature-v19.json'));

  assert.equal(config.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.match(js, /const EMBED_URL = `https:\/\/sketchfab\.com\/models\/\$\{MODEL_UID\}\/embed/);
  assert.match(js, /iframe\.src = EMBED_URL/);
  assert.match(js, /ear-direct-embed/);
  assert.match(js, /const viewerAllowed = \(\) => desktopViewport\(\)/);
  assert.doesNotMatch(js, /runtimeBudget !== 'lite'/);
  assert.match(css, /data-runtime-budget="lite"[\s\S]*nature-ear-live-v23[\s\S]*display:block!important/);
  assert.match(css, /data-jaguar3d="ear-direct-embed"/);
  assert.doesNotMatch(css, /data-runtime-budget="lite"[^}]*nature-ear-live-v23[^}]*display:none!important/);
});
