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
let expectedArgs = ['layout', false];
class ResizeObserverEntry { constructor(target) { this.target = target; } }
const map = {
  jumpTo() {}, on() {}, getCanvas: () => canvas, getContainer: () => container,
  isMoving: () => false, getZoom: () => 7.35,
  resize(...args) {
    assert.equal(this, map);
    calls++;
    if (args[0] === 'fail') throw failure;
    assert.deepEqual(args, expectedArgs);
    canvas.width = 860; container.clientWidth = 430;
    return this;
  },
};
const frames = [];
const window = { __4planet_map: map, addEventListener: (type, fn) => { listeners[type] = fn; },
  requestAnimationFrame(callback) { assert.equal(this, window); frames.push(callback); return frames.length; } };
await vm.runInNewContext(`(async () => { ${js} })()`, {
  window, page: { evaluate: fn => fn() }, performance: { now: () => 100 }, Error, ResizeObserverEntry,
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
for (const [args, kind, count, matches] of [
  [[], 'NO_ARGUMENTS', null, null],
  [[undefined], 'OTHER', null, null],
  [[[new ResizeObserverEntry(container)]], 'RESIZE_OBSERVER_ENTRIES', 1, true],
  [[[new ResizeObserverEntry({})]], 'RESIZE_OBSERVER_ENTRIES', 1, false],
  [[[]], 'OTHER', null, null],
  [[[{ target: container, secret: 'DO_NOT_RECORD' }]], 'OTHER', null, null],
]) {
  expectedArgs = args;
  assert.equal(map.resize(...args), map);
  const event = events.at(-2);
  assert.equal(event.eventDataKind, kind);
  assert.equal(event.argumentCount, args.length);
  assert.equal(event.observerEntryCount, count);
  assert.equal(event.observesMapContainer, matches);
}
assert.equal(JSON.stringify(events).includes('DO_NOT_RECORD'), false);
expectedArgs = [];
assert.equal(window.requestAnimationFrame(() => map.resize()), 1);
assert.equal(events.at(-2).animationFrame, null);
frames[0].call(window, 456);
assert.equal(events.at(-2).animationFrame.directResizeExpression, '() => map.resize()');
let callbackThis, callbackTime;
window.requestAnimationFrame(function (time) { callbackThis = this; callbackTime = time; map.resize(); });
frames[1].call(window, 789);
assert.equal(callbackThis, window); assert.equal(callbackTime, 789);
assert.equal(events.at(-2).animationFrame.directResizeExpression, null);
window.requestAnimationFrame(() => { throw failure; });
assert.throws(() => frames[2].call(window, 900), error => error === failure);
map.resize();
assert.equal(events.at(-2).animationFrame, null);
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
console.log('PASS: six resize event-data identities; raw arguments/DOM/private data not recorded');
console.log('PASS: rAF deferred scheduling/id/receiver/time/error preserved; direct expression and unclassified frame distinguished; context cleared');
