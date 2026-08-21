import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Ear-derived local 3D remains first-party and interactive inside the v26 authored jungle room on desktop and mobile', () => {
  const html = read('public/journey/jaguar/index.html');
  const js = read('public/xr/engine/nature-jaguar-local-v26.js');
  const css = read('public/xr/jaguar/jaguar-master-v26.css');
  const proxy = read('public/assets/species/jaguar/ear-runtime-v25/jaguar-ear-proxy-v25.js');
  const config = JSON.parse(read('public/journey/jaguar/creature-v19.json'));

  assert.equal(config.actor.preferred.id, 'ear-rodriguez-jaguar');
  assert.match(html, /nature-jaguar-local-v26\.js/);
  assert.match(html, /jaguar-master-v26\.css/);
  assert.match(html, /jaguar-ear-proxy-v25\.js/);
  assert.doesNotMatch(html, /nature-jaguar-sketchfab-v23\.js|jaguar-ear-live-v23\.css|<iframe/i);

  assert.match(proxy, /JaguarEarProxyV25/);
  assert.match(js, /new THREE\.WebGLRenderer/);
  assert.match(js, /jaguar-authored-jungle-room-v26/);
  assert.match(js, /new THREE\.InstancedMesh/);
  assert.match(js, /new THREE\.FogExp2/);
  assert.match(js, /data-jaguar-action="observe"/);
  assert.match(js, /data-jaguar-action="move"/);
  assert.match(js, /pointerdown/);
  assert.match(js, /pointermove/);
  assert.match(js, /targetUserYaw/);
  assert.match(js, /root\.dataset\.jaguarLocalRuntime = 'v26'/);
  assert.match(js, /root\.dataset\.jaguar3d = 'local-room-ready'/);
  assert.match(js, /root\.dataset\.jaguarMaster = 'pr79-agent-jaguar-journey-v11'/);

  assert.match(css, /@media\(max-width:760px\)[\s\S]*nature-3d-subject--room-v26/);
  assert.match(css, /data-runtime-budget="lite"[\s\S]*nature-3d-subject--room-v26\{display:block!important/);
  assert.match(css, /data-jaguar3d="local-room-ready"[\s\S]*nature-subject[\s\S]*visibility:hidden!important/);
  assert.doesNotMatch(css, /@media\(max-width:760px\)[\s\S]*nature-3d-subject--room-v26\{[^}]*display:none!important/);
});
