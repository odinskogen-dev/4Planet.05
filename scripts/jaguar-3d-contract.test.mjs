import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(readFileSync(new URL('../public/xr/scenes/jaguar.json', import.meta.url), 'utf8'));
const html = readFileSync(new URL('../public/journey/jaguar/index.html', import.meta.url), 'utf8');
const renderer = readFileSync(new URL('../public/xr/engine/nature-jaguar-3d-v17.js', import.meta.url), 'utf8');
const legacyCss = readFileSync(new URL('../public/xr/jaguar/jaguar-3d-v14.css', import.meta.url), 'utf8');
const cinematicCss = readFileSync(new URL('../public/xr/jaguar/jaguar-cinematic-v17.css', import.meta.url), 'utf8');
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

test('3D runtime remains progressive enhancement with fail-closed controlled species-media fallback', () => {
  assert.match(html, /jaguar-3d-v14\.css/);
  assert.match(html, /jaguar-cinematic-v17\.css/);
  assert.match(html, /nature-jaguar-3d-v17\.js/);
  assert.doesNotMatch(html, /nature-jaguar-3d-v14\.js/);
  assert.match(renderer, /import\('three'\)/);
  assert.match(renderer, /import\('three\/addons\/loaders\/MTLLoader\.js'\)/);
  assert.match(renderer, /import\('three\/addons\/loaders\/OBJLoader\.js'\)/);
  assert.match(renderer, /fullTier/);
  assert.match(renderer, /dataset\.jaguar3d/);
  assert.match(renderer, /failed closed; controlled 2D species media remains/i);
  assert.match(legacyCss, /data-performance-tier=lite/);
  assert.match(cinematicCss, /@media\(max-width:760px\).*nature-3d-subject--v17\{display:none!important\}/s);
});

test('3D encounter automatically loads and becomes visible after the explicit browser-entry gesture', () => {
  assert.match(renderer, /4planet:nature-browser-enter/);
  assert.match(renderer, /active=true/);
  assert.match(renderer, /await loadModel\(\)/);
  assert.match(renderer, /show\(\{restartReveal:true\}\)/);
  assert.match(renderer, /data-three-replaced/);
  assert.match(renderer, /host\.style\.setProperty\('display','block','important'\)/);
  assert.match(renderer, /host\.style\.setProperty\('visibility','visible','important'\)/);
  assert.match(renderer, /host\.style\.setProperty\('opacity','1','important'\)/);
  assert.match(renderer, /host\.style\.setProperty\('pointer-events','auto','important'\)/);
});

test('3D encounter adds browser-native approach motion, drag interaction and reduced-motion fallback without claiming live behaviour', () => {
  assert.match(renderer, /data\.motion|dataset\.motion/);
  assert.match(renderer, /DRAG TO EXPLORE/);
  assert.match(renderer, /targetYaw\+=delta\*\.0065/);
  assert.match(renderer, /easeOut\(\(time-revealStart\)\/2100\)/);
  assert.match(renderer, /prefers-reduced-motion: reduce/);
  assert.match(cinematicCss, /STYLISED|nature-3d-subject--v17/);
  assert.match(cinematicCss, /@media\(prefers-reduced-motion:reduce\)/);
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
