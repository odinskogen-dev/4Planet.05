import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium, webkit } from '@playwright/test';
import { verifyMapOutcome } from './earth-now-human-proof.mjs';

const WIDTHS = [390, 430, 1440];
const ENGINES = ['chromium', 'webkit'];

function fixture(mode) {
  const state = { canvasClicks: 0, mapWaits: 0, fallbackWaits: 0, terminalWaits: 0, canvasVisible: mode === 'map' };
  const terminal = {
    first: () => terminal,
    waitFor: async () => {
      state.terminalWaits += 1;
      if (mode === 'delayed-map') state.canvasVisible = true;
    },
  };
  const canvas = {
    isVisible: async () => state.canvasVisible,
    click: async () => { state.canvasClicks += 1; },
    or: () => terminal,
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
      assert.equal(context.state.terminalWaits, 1);
    });

    test(`${engine} ${width}px keeps source, camera and interaction proof for a capable map`, async () => {
      const context = fixture('map');
      const result = await verifyMapOutcome({ ...context, width });
      assert.equal(result.capability, 'map');
      assert.equal(context.state.mapWaits, 3);
      assert.equal(context.state.canvasClicks, 1);
      assert.equal(context.state.fallbackWaits, 0);
      assert.equal(context.state.terminalWaits, 1);
    });

    test(`${engine} ${width}px waits through an existing main for a delayed capable map`, async () => {
      const context = fixture('delayed-map');
      const result = await verifyMapOutcome({ ...context, width });
      assert.equal(result.capability, 'map');
      assert.equal(context.state.mapWaits, 3);
      assert.equal(context.state.canvasClicks, 1);
      assert.equal(context.state.fallbackWaits, 0);
      assert.equal(context.state.terminalWaits, 1);
    });
  }
}

const REAL_DOM = process.env.EARTH_REAL_DOM === '1';

async function realDomFixture(browser, mode, width) {
  const page = await browser.newPage({ viewport: { width, height: width < 500 ? 844 : 900 } });
  await page.setContent('<div class="earth-now-map"><iframe title="Earth map"></iframe></div><p>Explore all guides</p>');
  const frame = await (await page.locator('.earth-now-map iframe').elementHandle()).contentFrame();
  const mapMarkup = `
    <main></main>
    <script>
      window.__4planet_map = {
        getLayer: () => ({}),
        isSourceLoaded: () => true,
        isMoving: () => false,
        getCenter: () => ({ lng: 5, lat: 18 }),
        getZoom: () => 1.65,
        once: (_event, callback) => { window.__4planet_click_callback = callback; }
      };
      const addCanvas = () => {
        const canvas = document.createElement('canvas');
        canvas.className = 'maplibregl-canvas';
        canvas.width = 300;
        canvas.height = 180;
        canvas.style.cssText = 'display:block;width:300px;height:180px';
        canvas.addEventListener('click', () => window.__4planet_click_callback?.());
        document.body.append(canvas);
      };
      ${mode === 'delayed-map' ? 'setTimeout(addCanvas, 250);' : 'addCanvas();'}
    <\/script>`;
  const fallbackMarkup = '<main><h2>The map is unavailable in this browser.</h2><a href="https://4planetatlas.com/atlas/?view=ocean" target="_top">Open full map</a></main>';
  await frame.setContent(mode === 'fallback' ? fallbackMarkup : mapMarkup);
  return { page, frame };
}

for (const [engine, browserType] of Object.entries({ chromium, webkit })) {
  for (const width of WIDTHS) {
    for (const mode of ['fallback', 'map', 'delayed-map']) {
      test(`${engine} real DOM ${width}px ${mode}`, { skip: !REAL_DOM }, async () => {
        const browser = await browserType.launch({ headless: true });
        try {
          const context = await realDomFixture(browser, mode, width);
          try {
            const result = await verifyMapOutcome({ ...context, width });
            assert.equal(result.capability, mode === 'fallback' ? 'fallback' : 'map');
          } finally {
            await context.page.close();
          }
        } finally {
          await browser.close();
        }
      });
    }
  }
}
