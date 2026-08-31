import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

async function importTs(relativePath) {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const source = await fs.readFile(absolutePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
    },
    fileName: absolutePath,
  }).outputText;
  const encoded = Buffer.from(transpiled).toString("base64");
  return import(`data:text/javascript;base64,${encoded}`);
}

const refreshModule = await importTs("src/data/sourceRefresh.ts");
let adapterSource = await fs.readFile(path.resolve(process.cwd(), "src/data/providers/obisTaxonAdapter.ts"), "utf8");
adapterSource = adapterSource.replace('import type { SourceRefreshSnapshot } from "../sourceRefresh";\n\n', "");
const adapterJs = ts.transpileModule(adapterSource, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const adapter = await import(`data:text/javascript;base64,${Buffer.from(adapterJs).toString("base64")}`);

const checkedAt = new Date().toISOString();
const live = await adapter.fetchObisTaxonSnapshot(288227, checkedAt, {
  expectedScientificName: "Acropora palmata",
});

assert.equal(live.providerId, "OBIS:worms:288227");
assert.equal(live.snapshot.available, true, live.error);
assert.equal(live.snapshot.verification, "VERIFIED");
assert.equal(live.normalized?.aphiaId, 288227);
assert.equal(live.normalized?.scientificName, "Acropora palmata");
assert.match(live.snapshot.fingerprint, /^OBIS:taxon-semantic-v1:/);

const record = {
  id: "OBIS_WORMS_288227",
  checkedAt,
  sourceFingerprint: live.snapshot.fingerprint,
  sourceFingerprintMethod: live.snapshot.fingerprintMethod,
  sourceVersion: live.snapshot.sourceVersion,
  providerId: live.providerId,
  refreshHistory: [],
};

const result = refreshModule.evaluateSourceRefresh(record, live.snapshot, {
  provider: live.provider,
  providerId: live.providerId,
  canonicalLocator: live.canonicalLocator,
  canonicalObjectIds: ["SPECIES:ACROPORA_PALMATA"],
  affectedClaimIds: ["SPECIES:ACROPORA_PALMATA:TAXONOMY"],
});

assert.equal(result.audit.status, "UNCHANGED");
assert.equal(result.audit.verification, "VERIFIED");
assert.equal(result.audit.truthEffect, "NONE");
assert.equal(result.publicUpdateAllowed, false);
assert.equal(result.audit.syntheticFixture, false);

console.log(JSON.stringify({
  proof: "OBIS provider #2 uses shared Living Learning Loop",
  source: live.canonicalLocator,
  providerId: live.providerId,
  scientificName: live.normalized.scientificName,
  aphiaId: live.normalized.aphiaId,
  fingerprint: live.snapshot.fingerprint,
  refreshStatus: result.audit.status,
  verification: result.audit.verification,
  truthEffect: result.audit.truthEffect,
  publicUpdateAllowed: result.publicUpdateAllowed,
}, null, 2));
