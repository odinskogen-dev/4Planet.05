import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyMapOutcome } from './earth-now-human-proof.mjs';

const WIDTHS = [390, 430, 1440];
const ENGINES = ['chromium', 'webkit'];

function fixture(mode) {
  const state = { canvasClicks: 0, mapWaits: 0, fallbackWaits: 0 };
  const canvas = {
    isVisible: async () => mode === 'map',
    click: async () => { state.canvasClicks += 1; },
  };
  const fallback = {
    filter: () => fallback,
    waitFor: async () => { state.fallbackWaits += 1; },
  };
  const fullMap = {
    waitFor: async () => {},
    getAttribute: async (name) => name === 'href' ? 'https://4planetatlas.com/atlas/?view=ocean' : '_top',
  };
  const embedded = {
    locator(selector) {
      if (selector === '.maplibregl-canvas') return canvas;
      if (selector === 'main h2') return fallback;
      if (selector === '.atlas-panel') return { isVisible: async () => false };
      return { first: () => ({ waitFor: async () => {} }) };
    },
    getByRole: () => fullMap,
  };
  const page = {
    frameLocator: () => embedded,
    getByText: () => ({ isVisible: async () => true }),
    screenshot: async () => {},
  };
  const frame = {
    waitForFunction: async () => { state.mapWaits += 1; },
    evaluate: async (fn) => {
      const source = String(fn);
      if (source.includes('getCenter')) return { c: { lng: 5, lat: 18 }, z: 1.65 };
      return {};
    },
  };
  return { page, frame, state };
}

for (const engine of ENGINES) {
  for (const width of WIDTHS) {
    test(`${engine} ${width}px accepts the governed fallback without waiting for canvas`, async () => {
      const context = fixture('fallback');
      const result = await verifyMapOutcome({ ...context, width });
      assert.equal(result.capability, 'fallback');
      assert.equal(context.state.mapWaits, 0);
      assert.equal(context.state.canvasClicks, 0);
      assert.equal(context.state.fallbackWaits, 1);
    });

    test(`${engine} ${width}px keeps source, camera and interaction proof for a capable map`, async () => {
      const context = fixture('map');
      const result = await verifyMapOutcome({ ...context, width });
      assert.equal(result.capability, 'map');
      assert.equal(context.state.mapWaits, 3);
      assert.equal(context.state.canvasClicks, 1);
      assert.equal(context.state.fallbackWaits, 0);
    });
  }
}
