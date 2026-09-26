import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Exercise the actual browser callback and attachment, without provider traffic.
// Optional source path supports an unchanged-test negative control on old code.
const source = readFileSync(process.argv[2] || "tests/e2e/atlas-omega-gold.spec.ts", "utf8");
const start = source.indexOf("  const source = await page.evaluate(async () => {");
const end = source.indexOf("  expect(source.ok).toBe(true);", start);
assert(start >= 0 && end > start, "source callback and original assertion must exist");
const block = source.slice(start, end);
const api = readFileSync("functions/api/inaturalist.ts", "utf8");
const reasons = ["RATE_LIMITED", "PROVIDER_UNAVAILABLE", "TAXON_RESOLUTION_FAILURE", "NETWORK_FAILURE", "PROVIDER_CONTRACT_MISMATCH"];
for (const reason of reasons) assert(api.includes(`"${reason}"`), `API must define ${reason}`);

for (const reason of [...reasons, "PRIVATE_UNKNOWN_TEXT"]) {
  let attachment;
  const context = {
    page: { evaluate: fn => fn() },
    fetch: async () => ({
      ok: false, status: 503,
      json: async () => ({
        availability: "unavailable", reason, upstreamStatus: null,
        semantics: "SOURCE_UNAVAILABLE_NOT_ZERO",
        records: [{ private: "PRIVATE_RECORD_TEXT" }],
      }),
    }),
    state: "live",
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
