/**
 * Executable timing contract for ProductRouteAnalytics.
 *
 * Visible foreground time must be settled once. Cleanup used to add the open
 * interval and then count it again inside qualification, so 10_000 ms visible
 * qualified as 20_000 ms.
 *
 * Harness uses Node's test runner plus the repo's React runtime. This repo has
 * no Vitest, Jest, or jsdom dependency; the DOM surface here is only what this
 * component and createRoot touch.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const DOCUMENT_NODE = 9;

const listeners = new Map();

function addEventListener(type, fn) {
  const set = listeners.get(type) ?? new Set();
  set.add(fn);
  listeners.set(type, set);
}

function removeEventListener(type, fn) {
  listeners.get(type)?.delete(fn);
}

class DomNode {
  constructor(nodeType, nodeName) {
    this.nodeType = nodeType;
    this.nodeName = nodeName;
    this.tagName = nodeName;
    this.childNodes = [];
    this.parentNode = null;
    this.ownerDocument = null;
    this.namespaceURI = "http://www.w3.org/1999/xhtml";
    this.attributes = Object.create(null);
    this.style = {};
    this.onclick = undefined;
    this.nodeValue = null;
    this.textContent = "";
  }

  get nextSibling() {
    if (!this.parentNode) return null;
    const index = this.parentNode.childNodes.indexOf(this);
    return this.parentNode.childNodes[index + 1] ?? null;
  }

  get firstChild() {
    return this.childNodes[0] ?? null;
  }

  appendChild(child) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }

  insertBefore(child, before) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    const index = before ? this.childNodes.indexOf(before) : -1;
    this.childNodes.splice(index < 0 ? this.childNodes.length : index, 0, child);
    return child;
  }

  removeChild(child) {
    const index = this.childNodes.indexOf(child);
    if (index >= 0) this.childNodes.splice(index, 1);
    child.parentNode = null;
    return child;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  addEventListener(type, fn) {
    addEventListener(type, fn);
  }

  removeEventListener(type, fn) {
    removeEventListener(type, fn);
  }

  contains(node) {
    let current = node;
    while (current) {
      if (current === this) return true;
      current = current.parentNode;
    }
    return false;
  }
}

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }

  get length() {
    return this.map.size;
  }

  key(index) {
    return [...this.map.keys()][index] ?? null;
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(String(key), String(value));
  }

  removeItem(key) {
    this.map.delete(String(key));
  }

  clear() {
    this.map.clear();
  }
}

const sessionStorage = new MemoryStorage();
const localStorage = new MemoryStorage();
let visibilityState = "visible";
let clock = 0;
let timerSeq = 1;
/** @type {{ id: number, at: number, fn: Function, cleared: boolean }[]} */
const timers = [];

const documentNode = new DomNode(DOCUMENT_NODE, "#document");
const documentElement = new DomNode(ELEMENT_NODE, "HTML");
const body = new DomNode(ELEMENT_NODE, "BODY");
const head = new DomNode(ELEMENT_NODE, "HEAD");
documentElement.ownerDocument = documentNode;
body.ownerDocument = documentNode;
head.ownerDocument = documentNode;
documentNode.appendChild(documentElement);
documentElement.appendChild(head);
documentElement.appendChild(body);

const document = Object.assign(documentNode, {
  documentElement,
  body,
  head,
  referrer: "",
  visibilityState: "visible",
  createElement(tag) {
    const element = new DomNode(ELEMENT_NODE, String(tag).toUpperCase());
    element.ownerDocument = document;
    return element;
  },
  createElementNS(_namespace, tag) {
    return this.createElement(tag);
  },
  createTextNode(text) {
    const node = new DomNode(TEXT_NODE, "#text");
    node.nodeValue = String(text);
    node.ownerDocument = document;
    return node;
  },
  addEventListener,
  removeEventListener,
});

Object.defineProperty(document, "visibilityState", {
  configurable: true,
  get() {
    return visibilityState;
  },
});

const window = {
  document,
  sessionStorage,
  localStorage,
  navigator: { userAgent: "node-product-route-analytics-test" },
  location: {
    hostname: "4planet.org",
    host: "4planet.org",
    protocol: "https:",
    href: "https://4planet.org/",
    pathname: "/",
  },
  performance,
  setTimeout(fn, delay = 0) {
    const id = timerSeq++;
    timers.push({ id, at: clock + Number(delay), fn, cleared: false });
    return id;
  },
  clearTimeout(id) {
    const timer = timers.find((entry) => entry.id === id);
    if (timer) timer.cleared = true;
  },
  addEventListener,
  removeEventListener,
};
window.top = window;
window.self = window;
window.performance = performance;
window.HTMLIFrameElement = class HTMLIFrameElement {};
window.HTMLElement = class HTMLElement {};
window.Element = class Element {};
window.Node = class Node {};
document.defaultView = window;
document.activeElement = body;

globalThis.window = window;
globalThis.document = document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

performance.now = () => clock;

function flushTimers() {
  const due = timers.filter((timer) => !timer.cleared && timer.at <= clock);
  for (const timer of due) timer.cleared = true;
  for (const timer of due) timer.fn();
}

function advance(ms) {
  clock += ms;
  flushTimers();
}

function setVisibility(next) {
  visibilityState = next;
  for (const listener of listeners.get("visibilitychange") ?? []) listener({ type: "visibilitychange" });
}

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const source = readFileSync(path.join(repoRoot, "src/analytics/ProductRouteAnalytics.tsx"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
  },
  fileName: "ProductRouteAnalytics.tsx",
}).outputText.replaceAll('from "@/analytics/Analytics"', 'from "./product-route-analytics-timing-mock.mjs"')
  .replaceAll('from "@/analytics/ProductAnalytics"', 'from "./product-route-analytics-timing-mock.mjs"');

const tempDir = path.join(repoRoot, "node_modules/.product-route-analytics-timing");
mkdirSync(tempDir, { recursive: true });
writeFileSync(path.join(tempDir, "product-route-analytics-timing-mock.mjs"), `
export const calls = [];
export function trackEvent(name, parameters = {}) {
  calls.push({ name, parameters });
}
export function trackProductEntry(product, entryPath, entryKind = "direct") {
  calls.push({ name: "product_entry", parameters: { product_area: product, entry_path: entryPath, entry_kind: entryKind } });
}
export function trackMeaningfulUse(product, kind, objectType) {
  calls.push({ name: "meaningful_use", parameters: { product_area: product, use_kind: kind, object_type: objectType } });
}
`);
writeFileSync(path.join(tempDir, "ProductRouteAnalytics.mjs"), compiled);

const { calls } = await import(pathToFileURL(path.join(tempDir, "product-route-analytics-timing-mock.mjs")).href);
const analyticsModule = await import(pathToFileURL(path.join(tempDir, "ProductRouteAnalytics.mjs")).href + `?rev=${Date.now()}`);
const { ProductRouteAnalytics } = analyticsModule;
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const { MemoryRouter, useNavigate } = await import("react-router-dom");

const bridge = {
  navigate() {
    throw new Error("route bridge is not mounted");
  },
};

function Harness() {
  const navigate = useNavigate();
  bridge.navigate = navigate;
  return React.createElement(ProductRouteAnalytics);
}

function meaningfulUses() {
  return calls.filter((call) => call.name === "meaningful_use");
}

let current = null;

async function mount(pathname) {
  if (current) await current.stop();
  const container = document.createElement("div");
  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(MemoryRouter, { initialEntries: [pathname] }, React.createElement(Harness)));
  });
  const handle = {
    async stop() {
      await act(async () => {
        root.unmount();
      });
    },
    async go(nextPath) {
      await act(async () => {
        bridge.navigate(nextPath);
      });
    },
  };
  current = handle;
  return handle;
}

test.beforeEach(() => {
  clock = 0;
  timerSeq = 1;
  timers.length = 0;
  calls.length = 0;
  sessionStorage.clear();
  localStorage.clear();
  visibilityState = "visible";
  listeners.clear();
});

test.afterEach(async () => {
  if (!current) return;
  const handle = current;
  current = null;
  await handle.stop();
});

for (const [visibleMs, shouldQualify] of [
  [9_999, false],
  [10_000, false],
  [19_999, false],
  [20_000, true],
]) {
  test(`cleanup settles ${visibleMs} ms of visible time ${shouldQualify ? "once" : "below the 20s threshold"}`, async () => {
    const handle = await mount("/atlas");
    advance(visibleMs);
    await handle.stop();
    current = null;
    const events = meaningfulUses();
    if (shouldQualify) {
      assert.equal(events.length, 1);
      assert.deepEqual(events[0].parameters, {
        product_area: "atlas",
        use_kind: "engaged_time",
        object_type: "route",
      });
    } else {
      assert.equal(events.length, 0);
    }
  });
}

test("hidden and visible segments accumulate foreground time once and ignore background time", async () => {
  const handle = await mount("/atlas");
  advance(10_000);
  setVisibility("hidden");
  advance(50_000);
  setVisibility("visible");
  advance(9_999);
  await handle.stop();
  current = null;
  assert.equal(meaningfulUses().length, 0);
});

test("split foreground segments qualify once at 20_000 ms and cleanup does not emit again", async () => {
  const handle = await mount("/species");
  advance(10_000);
  setVisibility("hidden");
  advance(80_000);
  setVisibility("visible");
  advance(10_000);
  assert.equal(meaningfulUses().length, 1);
  assert.equal(meaningfulUses()[0].parameters.product_area, "species");
  await handle.stop();
  current = null;
  assert.equal(meaningfulUses().length, 1);
});

test("the qualification timer and effect cleanup emit the route once", async () => {
  const handle = await mount("/impact");
  advance(20_000);
  assert.equal(meaningfulUses().length, 1);
  assert.equal(meaningfulUses()[0].parameters.product_area, "impact");
  await handle.stop();
  current = null;
  assert.equal(meaningfulUses().length, 1);
});

test("route changes settle the previous route without double-counting and start an independent clock", async () => {
  const handle = await mount("/atlas");
  advance(10_000);
  await handle.go("/species");
  assert.equal(meaningfulUses().length, 0, "10_000 ms on /atlas must not qualify");
  advance(19_999);
  assert.equal(meaningfulUses().length, 0, "19_999 ms on /species must not qualify");
  advance(1);
  assert.equal(meaningfulUses().length, 1);
  assert.deepEqual(meaningfulUses()[0].parameters, {
    product_area: "species",
    use_kind: "engaged_time",
    object_type: "route",
  });
  await handle.go("/missions");
  assert.equal(meaningfulUses().length, 1, "qualifying /species must not emit again on leave");
  advance(20_000);
  assert.equal(meaningfulUses().length, 2);
  assert.equal(meaningfulUses()[1].parameters.product_area, "missions");
  await handle.go("/atlas");
  advance(20_000);
  const atlasEvents = meaningfulUses().filter((event) => event.parameters.product_area === "atlas");
  assert.equal(atlasEvents.length, 1, "the earlier 10s atlas visit did not engage, so a later 20s visit qualifies once");
  assert.equal(meaningfulUses().length, 3);
});

test("an engaged route emits once per session even if the route is opened again", async () => {
  const handle = await mount("/magazine");
  advance(20_000);
  await handle.go("/atlas");
  await handle.go("/magazine");
  advance(20_000);
  const magazineEvents = meaningfulUses().filter((event) => event.parameters.product_area === "magazine");
  assert.equal(magazineEvents.length, 1);
});

test("a route that starts hidden does not count background time", async () => {
  visibilityState = "hidden";
  const handle = await mount("/living-systems");
  advance(30_000);
  assert.equal(meaningfulUses().length, 0);
  setVisibility("visible");
  advance(19_999);
  assert.equal(meaningfulUses().length, 0);
  advance(1);
  assert.equal(meaningfulUses().length, 1);
  assert.equal(meaningfulUses()[0].parameters.product_area, "living_systems");
  await handle.stop();
  current = null;
  assert.equal(meaningfulUses().length, 1);
});
