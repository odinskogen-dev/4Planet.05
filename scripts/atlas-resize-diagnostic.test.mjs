import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the committed browser callback, not a duplicate implementation.
const source = fs.readFileSync('tests/e2e/atlas-core-parent-release.spec.ts', 'utf8');
const start = source.indexOf('  // Observe the reset writer');
const block = source.slice(start, source.indexOf('  if (browserName === "webkit")', start));
assert(start >= 0 && block.includes('kind: "resize-call"'));
const js = ts.transpileModule(block, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const listeners = {};
const canvas = { width: 780, height: 1688, clientWidth: 390, clientHeight: 844 };
const container = { clientWidth: 390, clientHeight: 844 };
const failure = new Error('original resize failure');
let calls = 0;
const map = {
  jumpTo() {}, on() {}, getCanvas: () => canvas, getContainer: () => container,
  isMoving: () => false, getZoom: () => 7.35,
  resize(...args) {
    assert.equal(this, map);
    calls++;
    if (args[0] === 'fail') throw failure;
    assert.deepEqual(args, ['layout', false]);
    canvas.width = 860; container.clientWidth = 430;
    return this;
  },
};
const window = { __4planet_map: map, addEventListener: (type, fn) => { listeners[type] = fn; } };
await vm.runInNewContext(`(async () => { ${js} })()`, {
  window, page: { evaluate: fn => fn() }, performance: { now: () => 100 }, Error,
});
assert.equal(map.resize('layout', false), map);
const events = window.__atlasCameraResetEvidence;
assert.equal(events[0].kind, 'resize-call');
assert.match(events[0].stack, /resize caller/);
assert.equal(events[0].dimensions.canvasWidth, 780);
assert.equal(events[1].kind, 'resize-return');
assert.equal(events[1].dimensions.canvasWidth, 860);
assert.equal(events[1].dimensions.containerWidth, 430);
assert.throws(() => map.resize('fail'), error => error === failure);
assert.equal(calls, 2);
assert.equal(events[3].kind, 'resize-return');
for (const type of ['touchend', 'touchcancel']) {
  listeners[type]({ type, timeStamp: 123, touches: [], isTrusted: true,
    target: { tagName: 'CANVAS' }, composedPath: () => [canvas] });
  const event = events.at(-1);
  assert.equal(event.kind, type);
  assert.equal(event.eventTime, 123);
  assert.equal(event.touches, 0);
  assert.equal(event.canvasInPath, true);
}
for (let i = 0; i < 110; i++) listeners.pointerdown({ type: 'pointerdown',
  timeStamp: i, isTrusted: true, target: { tagName: 'CANVAS' }, composedPath: () => [canvas] });
assert.equal(events.length, 100);
assert.equal(events.at(-1).touches, null);
console.log('PASS: resize arguments/receiver/result, before-after sizes/stack, original exception, touchend/cancel timing, bounded evidence');
