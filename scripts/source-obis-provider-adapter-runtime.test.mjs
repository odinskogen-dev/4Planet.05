import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

let source = await fs.readFile(path.resolve(process.cwd(), "src/data/providers/obisTaxonAdapter.ts"), "utf8");
source = source.replace('import type { SourceRefreshSnapshot } from "../sourceRefresh";\n\n', "");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const adapter = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

const payload = {
  total: 1,
  results: [{
    AphiaID: 288227,
    scientificName: "Acropora palmata",
    scientificNameAuthorship: "(Lamarck, 1816)",
    taxonRank: "Species",
    kingdom: "Animalia",
    phylum: "Cnidaria",
    class: "Hexacorallia",
    order: "Scleractinia",
    family: "Acroporidae",
    genus: "Acropora",
    species: "Acropora palmata",
    records: 12345,
  }],
};

const okFetcher = async () => new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } });
const ok = await adapter.fetchObisTaxonSnapshot(288227, "2026-08-28T12:00:00.000Z", {
  fetcher: okFetcher,
  expectedScientificName: "Acropora palmata",
});
assert.equal(ok.snapshot.available, true);
assert.equal(ok.snapshot.verification, "VERIFIED");
assert.equal(ok.normalized.aphiaId, 288227);
assert.equal(ok.normalized.scientificName, "Acropora palmata");

const recordsChangedPayload = structuredClone(payload);
recordsChangedPayload.results[0].records = 99999;
const normalizedA = adapter.normalizeObisTaxon(payload, 288227);
const normalizedB = adapter.normalizeObisTaxon(recordsChangedPayload, 288227);
assert.equal(adapter.fingerprintObisTaxon(normalizedA), adapter.fingerprintObisTaxon(normalizedB), "Occurrence count noise must not masquerade as taxonomic truth change.");

const nameConflict = await adapter.fetchObisTaxonSnapshot(288227, "2026-08-28T12:00:00.000Z", {
  fetcher: okFetcher,
  expectedScientificName: "Wrong species",
});
assert.equal(nameConflict.snapshot.verification, "REVIEW_REQUIRED");
assert.match(nameConflict.snapshot.conflict, /Expected Wrong species/);

const missingIdFetcher = async () => new Response(JSON.stringify({ results: [{ AphiaID: 1, scientificName: "Other" }] }), { status: 200 });
const missingId = await adapter.fetchObisTaxonSnapshot(288227, "2026-08-28T12:00:00.000Z", { fetcher: missingIdFetcher });
assert.equal(missingId.snapshot.available, false);
assert.equal(missingId.snapshot.verification, "REVIEW_REQUIRED");

const malformedFetcher = async () => new Response(JSON.stringify({ results: "not-an-array" }), { status: 200 });
const malformed = await adapter.fetchObisTaxonSnapshot(288227, "2026-08-28T12:00:00.000Z", { fetcher: malformedFetcher });
assert.equal(malformed.snapshot.available, false);

const rateLimitedFetcher = async () => new Response("rate limited", { status: 429 });
const limited = await adapter.fetchObisTaxonSnapshot(288227, "2026-08-28T12:00:00.000Z", { fetcher: rateLimitedFetcher });
assert.equal(limited.snapshot.available, false);
assert.match(limited.error, /429/);

const throwingFetcher = async () => { throw new Error("timeout"); };
const unavailable = await adapter.fetchObisTaxonSnapshot(288227, "2026-08-28T12:00:00.000Z", { fetcher: throwingFetcher });
assert.equal(unavailable.snapshot.available, false);
assert.equal(unavailable.error, "timeout");

console.log("OBIS provider adapter runtime red team: PASS");
