import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const helperSource = read("src/components/seoJsonLd.ts");
const compiled = ts.transpileModule(helperSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const sandbox = { exports: {}, module: { exports: {} } };
sandbox.exports = sandbox.module.exports;
vm.runInNewContext(compiled, sandbox);
const { OWNED_JSON_LD_SELECTOR, removeOwnedJsonLd } = sandbox.module.exports;

test("every 4PLANET prerenderer marks its crawlable JSON-LD as owned", () => {
  for (const path of [
    "scripts/prerender-discovery-seo.mjs",
    "scripts/prerender-atlas-seo.mjs",
    "scripts/prerender-magazine-seo.mjs",
  ]) {
    const source = read(path);
    assert.match(source, /type="application\/ld\+json" data-4planet-prerender="true"/);
  }
});

test("client lifecycle removes current, prerender and legacy Atlas-owned graphs only", () => {
  const owned = ["current", "prerender", "legacy-atlas"].map((name) => ({
    name,
    removed: false,
    remove() { this.removed = true; },
  }));
  const thirdParty = { name: "third-party", removed: false };
  const documentRoot = {
    querySelectorAll(selector) {
      assert.equal(selector, OWNED_JSON_LD_SELECTOR);
      return owned.filter((node) => !node.removed);
    },
  };

  removeOwnedJsonLd(documentRoot);
  assert.ok(owned.every((node) => node.removed));
  assert.equal(thirdParty.removed, false);

  assert.doesNotThrow(() => removeOwnedJsonLd(documentRoot), "StrictMode cleanup must be idempotent");
  assert.match(OWNED_JSON_LD_SELECTOR, /#4planet-page-jsonld/);
  assert.match(OWNED_JSON_LD_SELECTOR, /data-4planet-prerender/);
  assert.match(OWNED_JSON_LD_SELECTOR, /data-4planet-atlas-prerender/);
  assert.doesNotMatch(OWNED_JSON_LD_SELECTOR, /^script\[type=/, "selector must never target every JSON-LD script");
});

test("Seo uses the shared owned-graph cleanup before install and on route cleanup", () => {
  const seo = read("src/components/Seo.tsx");
  assert.match(seo, /import \{ removeOwnedJsonLd \} from "\.\/seoJsonLd"/);
  assert.ok((seo.match(/removeOwnedJsonLd\(\)/g) || []).length >= 2);
  assert.match(seo, /script\.id = "4planet-page-jsonld"/);
});
