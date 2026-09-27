import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the installed upstream implementation, not a reimplementation.
// The live attribute-list model is synthetic; this is not a browser XSS test.
const sourcePath = process.env.MAPLIBRE_DOM_SOURCE || 'node_modules/maplibre-gl/src/util/dom.ts';
const source = readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = { exports: {}, require: () => ({}) };
vm.runInNewContext(compiled, context);
const DOM = context.exports.DOM;
assert.equal(typeof DOM.removeAttributes, 'function');
for (const attributes of [
  [{ name: 'onclick', value: 'bad()' }, { name: 'onerror', value: 'bad()' }],
  [{ name: 'href', value: 'javascript:bad()' }, { name: 'onfocus', value: 'bad()' }],
  [{ name: 'onerror', value: 'bad()' }, { name: 'href', value: 'https://example.org/source' }, { name: 'title', value: 'Source attribution' }],
]) {
  const safe = attributes.filter(({ name, value }) => !name.startsWith('on') && !value.startsWith('javascript:'));
  const element = { attributes: [...attributes], removeAttribute(name) {
    this.attributes.splice(this.attributes.findIndex(a => a.name === name), 1);
  } };
  DOM.removeAttributes(element);
  assert.deepEqual(element.attributes, safe, 'adjacent unsafe attributes removed; provenance links retained');
}

for (const path of ['src/earth/World.tsx', 'src/pages/v5/Atlas.tsx', 'src/pages/v5/PlanetProof.tsx']) {
  const text = readFileSync(path, 'utf8');
  assert.match(text, /import \* as maplibregl from ["'](?:\.\/maplibre|@\/earth\/maplibre)["']/);
  assert.match(text, /zoomLevelsToOverscale: undefined/);
}
const entry = readFileSync('src/earth/maplibre.ts', 'utf8');
assert.match(entry, /maplibre-gl-worker\.mjs\?worker&url/);
assert.match(entry, /setWorkerUrl\(workerUrl\)/);
const workers = readdirSync('dist/assets').filter(n => /^maplibre-gl-worker-.*\.(?:js|mjs)$/.test(n));
assert.equal(workers.length, 1, 'one bundled worker artifact');
const worker = readFileSync(`dist/assets/${workers[0]}`, 'utf8');
const ast = ts.createSourceFile(workers[0], worker, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
assert.equal(ast.parseDiagnostics.length, 0, 'worker parses');
let imports = 0;
let runtimeImports = 0;
function visit(node) {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) && node.moduleSpecifier) imports++;
  if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
    if (ts.isStringLiteral(node.arguments[0])) imports++;
    else runtimeImports++;
  }
  ts.forEachChild(node, visit);
}
visit(ast);
assert.equal(imports, 0, 'worker is bundled, not a raw asset with missing sibling modules');
// Upstream has two runtime-configured plugin imports; their URLs are not build
// dependencies and still require CSP/runtime review. Do not call these verified.
assert.equal(runtimeImports, 2, 'upstream runtime plugin import inventory changed');
console.log('PASS: 3 upstream sanitizer model cases, 3 consumer contracts, bundled worker closure. Browser/render proof remains required.');
