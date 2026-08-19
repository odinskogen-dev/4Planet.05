import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(readFileSync(new URL('../public/xr/scenes/jaguar.json', import.meta.url), 'utf8'));
const html = readFileSync(new URL('../public/journey/jaguar/index.html', import.meta.url), 'utf8');
const renderer = readFileSync(new URL('../public/xr/engine/nature-jaguar-3d-v14.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../public/xr/jaguar/jaguar-3d-v14.css', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');

const sourceCommit = '728230086493b1f1cee6a410d0a8ea7c0991f6ff';

test('3D Jaguar study is rights-labelled, immutable-source pinned and explicitly not the final animated hero', () => {
  assert.match(renderer, new RegExp(sourceCommit));
  assert.match(renderer, /POLY BY GOOGLE · CC BY 3\.0 · VIA POLY PIZZA/);
  assert.match(renderer, /poly\.pizza\/m\/4fb-oMr2uUF/);
  assert.match(renderer, /stylised model, not a live animal/i);
  assert.equal(manifest.subject.modelGate.status, 'PENDING_CONTROLLED_ANIMATED_GLB');
  assert.doesNotMatch(html, /<iframe|sketchfab\.com/i);
});

test('3D runtime and model assets are true progressive enhancement with fail-closed 2D fallback', () => {
  assert.match(html, /jaguar-3d-v14\.css/);
  assert.match(html, /nature-jaguar-3d-v14\.js/);
  assert.match(renderer, /import\('three'\)/);
  assert.match(renderer, /import\('three\/addons\/loaders\/MTLLoader\.js'\)/);
  assert.match(renderer, /import\('three\/addons\/loaders\/OBJLoader\.js'\)/);
  assert.match(renderer, /fullTier/);
  assert.match(renderer, /data\.jaguar3d|dataset\.jaguar3d/);
  assert.match(renderer, /failed closed; preserving controlled 2D species media/i);
  assert.match(css, /data-performance-tier=lite/);
  assert.match(css, /data-jaguar3d-active=true/);
});

test('Three.js import map is pinned and Journey CSP is narrowly widened only for required 3D origins', () => {
  assert.match(html, /three@0\.185\.1\/build\/three\.module\.js/);
  assert.match(html, /three@0\.185\.1\/examples\/jsm\//);
  assert.match(headers, /\/journey\/jaguar\/\*/);
  assert.match(headers, /sha256-y\+f2zyJrNWs9cQUqI0Qe3A\+CgqQvow1b\+KyKYIaJh04=/);
  assert.match(headers, /script-src 'self'[^\n]*https:\/\/cdn\.jsdelivr\.net/);
  assert.match(headers, /connect-src 'self' https:\/\/raw\.githubusercontent\.com https:\/\/cdn\.jsdelivr\.net/);
  assert.match(headers, /img-src 'self' data: blob: https:\/\/upload\.wikimedia\.org https:\/\/raw\.githubusercontent\.com/);
});
