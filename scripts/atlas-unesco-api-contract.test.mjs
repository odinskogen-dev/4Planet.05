import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../functions/api/unesco-data.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

function loadHandler(upstream) {
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    URL,
    URLSearchParams,
    Request,
    Response,
    Date,
    console,
    fetch: upstream,
  });
  vm.runInContext(compiled, context, { filename: "functions/api/unesco-data.ts" });
  return module.exports.onRequestGet;
}

const record = (index) => ({ uuid: `record-${index}`, country_title_en: `Country ${index}` });
const request = (dataset = "cou001") => new Request(`https://example.test/api/unesco-data?dataset=${dataset}`);

function pages(fixtures) {
  let call = 0;
  const fetch = async (url) => {
    const offset = Number(new URL(url).searchParams.get("offset"));
    const fixture = fixtures[call++] ?? { status: 500, body: {} };
    assert.equal(offset, fixture.offset, `unexpected offset for call ${call}`);
    return new Response(JSON.stringify(fixture.body), {
      status: fixture.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  };
  fetch.calls = () => call;
  return fetch;
}

test("paginates a valid 250-record response with stable ordering", async () => {
  const fetch = pages([
    { offset: 0, body: { total_count: 250, results: Array.from({ length: 100 }, (_, i) => record(i)) } },
    { offset: 100, body: { total_count: 250, results: Array.from({ length: 100 }, (_, i) => record(i + 100)) } },
    { offset: 200, body: { total_count: 250, results: Array.from({ length: 50 }, (_, i) => record(i + 200)) } },
  ]);
  const response = await loadHandler(fetch)({ request: request() });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.totalCount, 250);
  assert.equal(body.records.length, 250);
  assert.equal(new Set(body.records.map((item) => item.uuid)).size, 250);
  assert.equal(body.truncated, false);
  assert.equal(fetch.calls(), 3);
});

test("null total_count remains unknown and does not stop after the first page", async () => {
  const fetch = pages([
    { offset: 0, body: { total_count: null, results: Array.from({ length: 100 }, (_, i) => record(i)) } },
    { offset: 100, body: { total_count: null, results: Array.from({ length: 100 }, (_, i) => record(i + 100)) } },
    { offset: 200, body: { total_count: null, results: Array.from({ length: 50 }, (_, i) => record(i + 200)) } },
  ]);
  const response = await loadHandler(fetch)({ request: request() });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.totalCount, null);
  assert.equal(body.records.length, 250);
  assert.equal(body.truncated, false);
  assert.equal(fetch.calls(), 3);
});

test("missing total_count remains unknown and paginates to a short final page", async () => {
  const fetch = pages([
    { offset: 0, body: { results: Array.from({ length: 100 }, (_, i) => record(i)) } },
    { offset: 100, body: { results: Array.from({ length: 20 }, (_, i) => record(i + 100)) } },
  ]);
  const response = await loadHandler(fetch)({ request: request() });
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.equal(body.totalCount, null);
  assert.equal(body.records.length, 120);
  assert.equal(body.truncated, false);
});

test("duplicate identities across pages fail closed", async () => {
  const first = Array.from({ length: 100 }, (_, i) => record(i));
  const fetch = pages([
    { offset: 0, body: { total_count: 250, results: first } },
    { offset: 100, body: { total_count: 250, results: first } },
  ]);
  const response = await loadHandler(fetch)({ request: request() });
  const body = await response.json();
  assert.equal(response.status, 502);
  assert.equal(body.ok, false);
  assert.equal(body.error, "DUPLICATE_RECORD_ID");
  assert.deepEqual(body.records, []);
});

test("inconsistent total count and short pages fail closed", async () => {
  const fetch = pages([
    { offset: 0, body: { total_count: 250, results: Array.from({ length: 50 }, (_, i) => record(i)) } },
  ]);
  const response = await loadHandler(fetch)({ request: request() });
  const body = await response.json();
  assert.equal(response.status, 502);
  assert.equal(body.error, "INCOMPLETE_RECORDSET");
});

test("malformed counts and records fail closed", async () => {
  for (const fixture of [
    { total_count: "250", results: [] },
    { total_count: -1, results: [] },
    { total_count: 1.5, results: [] },
    { total_count: 1, results: [{}] },
    { total_count: 0, results: null },
  ]) {
    const fetch = pages([{ offset: 0, body: fixture }]);
    const response = await loadHandler(fetch)({ request: request() });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).ok, false);
  }
});

test("upstream failure is unavailable, never an empty successful dataset", async () => {
  const fetch = pages([{ offset: 0, status: 502, body: { error: "bad gateway" } }]);
  const response = await loadHandler(fetch)({ request: request() });
  const body = await response.json();
  assert.equal(response.status, 502);
  assert.equal(body.ok, false);
  assert.equal(body.error, "UPSTREAM_502");
  assert.deepEqual(body.records, []);
});

test("a genuinely empty dataset remains a valid complete response", async () => {
  const fetch = pages([{ offset: 0, body: { total_count: 0, results: [] } }]);
  const response = await loadHandler(fetch)({ request: request() });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.totalCount, 0);
  assert.equal(body.truncated, false);
  assert.deepEqual(body.records, []);
});

test("unsupported datasets return 400 without contacting upstream", async () => {
  let calls = 0;
  const response = await loadHandler(async () => { calls += 1; })({ request: request("unknown") });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "UNSUPPORTED_DATASET");
  assert.equal(calls, 0);
});
