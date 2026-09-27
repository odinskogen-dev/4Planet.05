import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(process.argv[2] || 'public/atlas-return-camera-lock-v68.js', 'utf8');
function setup() {
  const handlers = new Map(), inputs = new Map();
  let zoom = 8.1, writes = 0;
  const canvas = {
    addEventListener: (name, fn) => inputs.set(name, fn),
    removeEventListener: (name) => inputs.delete(name),
  };
  const window = { location: { pathname: '/atlas', search: '?z=7.35&c=-6.25,46.4' } };
  vm.runInNewContext(source, { window, document: { documentElement: { dataset: {} } }, URLSearchParams, queueMicrotask: (fn) => fn() });
  window.__4planet_map = {
    getCanvas: () => canvas, getZoom: () => zoom,
    getCenter: () => ({ lng: -6.25, lat: 46.4 }),
    jumpTo: (options) => { zoom = options.zoom; writes++; },
    on: (name, fn) => handlers.set(name, fn),
  };
  return { window, inputs, handlers, get zoom() { return zoom; }, get writes() { return writes; }, move: () => { zoom = 8.1; } };
}
for (const type of ['wheel', 'pointerdown', 'touchstart']) {
  const s = setup();
  assert.equal(s.zoom, 7.35, 'URL reconstruction precedes user input');
  assert.equal(s.writes, 1);
  s.inputs.get(type)?.({ type, isTrusted: false });
  s.move(); s.handlers.get('movestart')({}); s.handlers.get('idle')();
  assert.equal(s.zoom, 7.35, 'untrusted/programmatic input must not release');
  s.inputs.get(type)?.({ type, isTrusted: true });
  s.move(); s.handlers.get('movestart')({});
  const before = s.writes;
  for (const name of ['idle', 'resize', 'style.load', 'load', 'idle']) s.handlers.get(name)();
  assert.equal(s.zoom, 8.1, `${type} retains permanent user ownership`);
  assert.equal(s.writes, before);
  assert.equal(s.window.__4planetAtlasReturnCameraLock.status().authorityActive, false);
  s.window.__4planet_map = undefined;
  assert.equal(s.inputs.size, 0, 'old canvas listeners removed on map replacement');
  console.log(`PASS ${type}: reconstruction, negative control, release, settling, cleanup`);
}
