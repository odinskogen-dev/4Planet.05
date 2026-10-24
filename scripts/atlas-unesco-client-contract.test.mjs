import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const dataSource = fs.readFileSync(new URL("../src/data/unescoOpenData.ts", import.meta.url), "utf8");
const layersSource = fs.readFileSync(new URL("../src/earth/layers.ts", import.meta.url), "utf8");

const compile = (source, filename) => ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: filename,
}).outputText;

function loadDataModule(body) {
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    URL,
    console,
    fetch: async () => new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  });
  vm.runInContext(compile(dataSource, "src/data/unescoOpenData.ts"), context, {
    filename: "src/data/unescoOpenData.ts",
  });
  return module.exports;
}

function loadLayersModule(dataModule) {
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    console,
    Date,
    require(specifier) {
      if (specifier === "../data/unescoOpenData") return dataModule;
      throw new Error(`unexpected require: ${specifier}`);
    },
  });
  vm.runInContext(compile(layersSource, "src/earth/layers.ts"), context, {
    filename: "src/earth/layers.ts",
  });
  return module.exports;
}

test("client preserves an unknown total count as null", async () => {
  const data = loadDataModule({
    ok: true,
    dataset: "mab001",
    retrievedAt: "2026-10-24T07:00:00Z",
    totalCount: null,
    truncated: false,
    records: [{ id: 1 }, { id: 2 }],
  });

  const response = await data.fetchUnescoDataset("mab001");
  assert.equal(response.totalCount, null);
  assert.equal(response.records.length, 2);
});

test("client rejects a response for a different dataset", async () => {
  const data = loadDataModule({
    ok: true,
    dataset: "whc001",
    retrievedAt: "2026-10-24T07:00:00Z",
    totalCount: 1,
    truncated: false,
    records: [{ id: 1 }],
  });

  await assert.rejects(
    () => data.fetchUnescoDataset("mab001"),
    /UNESCO_DATASET_IDENTITY_MISMATCH/,
  );
});

test("map layer fails closed when the API marks a dataset partial", async () => {
  const data = loadDataModule({
    ok: true,
    dataset: "mab001",
    retrievedAt: "2026-10-24T07:00:00Z",
    totalCount: 500,
    truncated: true,
    records: [{ id: "mab1" }],
  });
  const layers = loadLayersModule(data);
  const layer = layers.LAYERS.find((candidate) => candidate.id === "unesco-biospheres");

  await assert.rejects(
    () => layer.load(),
    /UNESCO_mab001_PARTIAL_UNAVAILABLE/,
  );
});
