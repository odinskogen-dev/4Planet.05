import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Ear-derived local 3D is first-party, interactive and explicitly enabled on desktop and mobile', () => {
  const html = read('public/journey/jaguar/index.html');
  const js = read('public/xr/engine/nature-jaguar-local-v25.js');
  const css = read('public/xr/jaguar/jaguar-ear-local-v25.css');
  const proxy = read('public/assets/species/jaguar/ear-runtime-v25/jaguar-ear-proxy-v25.js');
  const config = JSON.parse(read('public/journey/jaguar/creature-v19.json'));

  assert.equal(config.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.match(html, /nature-jaguar-local-v25\.js/);
  assert.match(html, /jaguar-ear-local-v25\.css/);
  assert.match(html, /jaguar-ear-proxy-v25\.js/);
  assert.doesNotMatch(html, /nature-jaguar-sketchfab-v23\.js|jaguar-ear-live-v23\.css|<iframe/i);

  assert.match(proxy, /JaguarEarProxyV25/);
  assert.match(js, /new THREE\.WebGLRenderer/);
  assert.match(js, /data-jaguar-action="observe"/);
  assert.match(js, /data-jaguar-action="move"/);
  assert.match(js, /pointerdown/);
  assert.match(js, /pointermove/);
  assert.match(js, /targetUserYaw/);
  assert.match(js, /root\.dataset\.jaguarLocalRuntime = 'v25'/);
  assert.match(js, /root\.dataset\.jaguar3d = 'local-proxy-ready'/);

  assert.match(css, /@media\(max-width:760px\)[\s\S]*nature-3d-subject--v25[\s\S]*display:block!important/);
  assert.match(css, /data-runtime-budget="lite"[\s\S]*nature-3d-subject--v25\{display:block!important/);
  assert.match(css, /data-jaguar3d="local-proxy-ready"[\s\S]*nature-subject[\s\S]*visibility:hidden!important/);
  assert.doesNotMatch(css, /@media\(max-width:760px\)[\s\S]*nature-3d-subject--v25\{[^}]*display:none!important/);
});
