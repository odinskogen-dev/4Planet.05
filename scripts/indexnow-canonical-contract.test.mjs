import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("./submit-indexnow.mjs", import.meta.url), "utf8");

test("IndexNow derives submissions from canonical sitemap and indexable topics", () => {
  assert.match(script, /public\/sitemap\.xml/);
  assert.match(script, /item\.indexable === true/);
  assert.match(script, /eligible\.has\(url\)/);
  assert.doesNotMatch(script, /inventory\.places|inventory\.species/);
  assert.doesNotMatch(script, /\$\{origin\}\/species|\$\{origin\}\/places/);
});

test("IndexNow retains founder approval and fails closed for empty inventory", () => {
  assert.match(script, /FOUNDER_INDEXNOW_RELEASE/);
  assert.match(script, /ENIG_INDEXNOW/);
  assert.match(script, /uniqueUrls\.length === 0/);
});
