import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Exercise the actual browser callback and attachment, without provider traffic.
// Optional source path supports an unchanged-test negative control on old code.
const source = readFileSync(process.argv[2] || "tests/e2e/atlas-omega-gold.spec.ts", "utf8");
const start = source.indexOf("  const source = await page.evaluate(async (");
const end = source.indexOf("  expect(source.ok).toBe(true);", start);
assert(start >= 0 && end > start, "source callback and original assertion must exist");
const block = source.slice(start, end);
const api = readFileSync("functions/api/inaturalist.ts", "utf8");
const reasons = ["RATE_LIMITED", "PROVIDER_UNAVAILABLE", "TAXON_RESOLUTION_FAILURE", "NETWORK_FAILURE", "PROVIDER_CONTRACT_MISMATCH"];
for (const reason of reasons) assert(api.includes(`"${reason}"`), `API must define ${reason}`);

for (const reason of [...reasons, "PRIVATE_UNKNOWN_TEXT"]) {
  let attachment;
  const context = {
    page: { evaluate: (fn, arg) => fn(arg) },
    fetch: () => { throw new Error("Diagnostic must not issue a redundant request"); },
    captured: {
      ok: () => false, status: () => 503,
      json: async () => ({
        availability: "unavailable", reason, upstreamStatus: null,
        semantics: "SOURCE_UNAVAILABLE_NOT_ZERO",
        records: [{ private: "PRIVATE_RECORD_TEXT" }],
      }),
    },
    state: "live",
    expect: actual => ({ toBe: expected => assert.equal(actual, expected) }),
    testInfo: { attach: async (name, item) => {
      assert.equal(name, "observation-source-http-contract");
      attachment = JSON.parse(item.body);
    } },
  };
  const result = await vm.runInNewContext(`(async () => { ${block} return source; })()`, context);
  assert.equal(result.ok, false, "unavailable must not become successful observation proof");
  assert.equal(attachment.status, 503);
  assert.equal(attachment.reason, reasons.includes(reason) ? reason : null);
  assert.equal(attachment.upstreamStatus, null);
  assert.equal(attachment.semantics, "SOURCE_UNAVAILABLE_NOT_ZERO");
  assert(!JSON.stringify(attachment).includes("PRIVATE_"), "private/unknown text must not be attached");
}
console.log("PASS: five existing API reasons survive; unknown/private text excluded; failure preserved (6 cases)");

const captureStart = source.indexOf("  const uiResponse = page.waitForResponse(response => {");
const captureEnd = source.indexOf("  const [captured] = await Promise.all", captureStart);
assert(captureStart >= 0 && captureEnd > captureStart, "UI response listener must be registered before selection");
let matches;
vm.runInNewContext(source.slice(captureStart, captureEnd), {
  page: { waitForResponse: predicate => { matches = predicate; return Promise.resolve(); } },
  URL, ATLAS: "https://preview.example/atlas",
});
const path = "/api/inaturalist?q=Orcinus%20orca&perPage=80&quality=research";
for (const [url, expected] of [
  [`https://preview.example${path}`, true],
  [`https://other.example${path}`, false],
  [`https://preview.example${path.replace("80", "20")}`, false],
  [`https://preview.example${path.replace("Orcinus%20orca", "Panthera%20onca")}`, false],
]) assert.equal(matches({ url: () => url }), expected);
console.log("PASS: UI-response predicate accepts exact request and rejects three unrelated responses");

// Execute the actual setup and unavailable early-return path, not only its mapper.
const testStart = source.indexOf('test("OMEGA — deployed observation evidence');
const setupStart = source.indexOf("  await page.goto(ATLAS);", testStart);
const setupEnd = source.indexOf("  expect(source.ok).toBe(true);", setupStart);
assert(testStart >= 0 && setupStart > testStart && setupEnd > setupStart);
for (const [reason, upstreamStatus] of [["RATE_LIMITED", 429], ["NETWORK_FAILURE", null], ["PRIVATE_UNKNOWN_TEXT", null]]) {
  const attachments = [];
  let reads = 0, selections = 0, screenshots = 0, visibleChecks = 0;
  const captured = {
    ok: () => false, status: () => 503,
    json: async () => {
      reads++;
      return { availability: "unavailable", reason, upstreamStatus, semantics: "SOURCE_UNAVAILABLE_NOT_ZERO", records: [{ private: "PRIVATE_RECORD_TEXT" }] };
    },
  };
  const page = {
    goto: async () => {}, waitForResponse: () => Promise.resolve(captured),
    evaluate: (fn, arg) => fn(arg), getByText: () => "unavailable-banner",
  };
  const result = await vm.runInNewContext(`(async () => { ${source.slice(setupStart, setupEnd)} return "OBSERVATION_ASSERTIONS_REACHED"; })()`, {
    page, ATLAS: "https://preview.example/atlas", URL,
    waitForAtlas: async () => {}, selectOrca: async () => { selections++; },
    waitForSourceState: async () => "unavailable",
    evidence: async () => { screenshots++; },
    fetch: () => { throw new Error("No redundant fetch permitted"); },
    expect: actual => ({
      toBe: expected => assert.equal(actual, expected),
      toBeVisible: async () => { assert.equal(actual, "unavailable-banner"); visibleChecks++; },
    }),
    testInfo: { attach: async (name, item) => attachments.push({ name, data: JSON.parse(item.body) }) },
  });
  assert.equal(result, undefined, "unavailable must return before successful-observation assertions");
  assert.equal(reads, 1); assert.equal(selections, 1); assert.equal(screenshots, 1); assert.equal(visibleChecks, 1);
  const state = attachments.find(x => x.name === "observation-ui-response-state");
  const diagnostic = attachments.find(x => x.name === "observation-source-http-contract");
  assert.equal(state?.data.observationProof, "NOT_YET_ESTABLISHED");
  assert.equal(diagnostic?.data.reason, reasons.includes(reason) ? reason : null);
  assert.equal(diagnostic?.data.upstreamStatus, upstreamStatus);
  assert.equal(diagnostic?.data.semantics, "SOURCE_UNAVAILABLE_NOT_ZERO");
  assert(!JSON.stringify(attachments).includes("PRIVATE_"));
}
console.log("PASS: actual unavailable branch preserves rate-limit/network distinction and privacy (3 cases)");
