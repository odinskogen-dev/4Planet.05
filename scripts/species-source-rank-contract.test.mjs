import test from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

let engine;
let scratch;

async function compile(sourcePath, outputName, replacements = []) {
  let source = await readFile(sourcePath, "utf8");
  for (const [from, to] of replacements) source = source.replaceAll(from, to);
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  await writeFile(join(scratch, outputName), compiled.outputText, "utf8");
}

test.before(async () => {
  scratch = await mkdtemp(join(tmpdir(), "species-source-rank-"));
  await compile("src/species/registry.ts", "registry.mjs");
  await compile("src/species/matchGate.ts", "matchGate.mjs");
  await compile("src/species/engine.ts", "engine.mjs", [
    ['from "./registry"', 'from "./registry.mjs"'],
    ['from "./matchGate"', 'from "./matchGate.mjs"'],
  ]);
  engine = await import(`${pathToFileURL(join(scratch, "engine.mjs")).href}?v=${Date.now()}`);
});

test.after(async () => {
  delete globalThis.fetch;
  delete globalThis.window;
  if (scratch) await rm(scratch, { recursive: true, force: true });
});

const missingRankMatch = {
  usage: {
    key: "6T8S",
    name: "Picea abies (L.) H.Karst.",
    canonicalName: "Picea abies",
    status: "ACCEPTED",
  },
  classification: [{ key: "PLANTAE", name: "Plantae", rank: "KINGDOM" }],
  diagnostics: { matchType: "EXACT", confidence: 99 },
};

function installFetch() {
  globalThis.fetch = async (url) => {
    const value = String(url);
    if (value.startsWith("https://api.gbif.org/v2/species/match?")) {
      return new Response(JSON.stringify(missingRankMatch), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    if (value.startsWith("https://api.gbif.org/v1/occurrence/search?")) {
      return new Response(JSON.stringify({ count: 0, results: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    throw new Error(`Unexpected URL: ${value}`);
  };
}

test("direct materialisation keeps missing source rank unknown and does not persist requested rank", async () => {
  const storage = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  };
  installFetch();

  const result = await engine.materializeUniversalTaxonProfile("Picea abies", {
    rank: "species",
    norway: false,
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.rank, "UNRANKED");
  assert.equal(result.data.taxonomyMatch.requestedRank, "SPECIES");
  assert.equal(result.data.taxonomyMatch.returnedRank, undefined);
  assert.equal(result.data.taxonomyMatch.state, "REVIEW_REQUIRED");
  assert.equal(result.data.identityState, "PROVISIONAL_EXTERNAL_ANCHORED");
  assert.equal(result.data.registry, undefined);
  assert.equal(storage.size, 0);
});

test("legacy crosswalk keeps missing source rank unknown while preserving the expected rank separately", async () => {
  installFetch();
  const result = await engine.legacyGbifToColXr(5284884, {
    scientificName: "Picea abies",
    rank: "species",
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.rank, "UNRANKED");
  assert.equal(result.data.taxonomyMatch.requestedRank, "SPECIES");
  assert.equal(result.data.taxonomyMatch.returnedRank, undefined);
  assert.equal(result.data.taxonomyMatch.state, "REVIEW_REQUIRED");
  assert.equal(result.data.taxonomyMatch.identifierBased, true);
});
