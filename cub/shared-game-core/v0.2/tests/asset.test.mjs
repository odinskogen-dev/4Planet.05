import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditManifest} from '../tools/asset-audit.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('all bundled GLBs have verified binary header, SHA, license and provenance',()=>{
  const r=auditManifest(path.join(root,'assetbank/manifest.json'));
  assert.equal(r.valid,true,r.problems.join('; '));
  assert.equal(r.checked,29);
  assert.equal(r.warnings.length,29); // all assets remain gated; no false production-clear promise.
});