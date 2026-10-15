import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const router = readFileSync(new URL("../ops/discovery/4species-router.js", import.meta.url), "utf8");

test("profile indexability is gated on explicit human review", () => {
  assert.match(router, /page\?\.provenance\?\.review/);
  assert.match(router, /reviewState !== "REVIEWED"/);
  assert.match(router, /x-robots-tag", "noindex, nofollow, noarchive"/);
  assert.match(router, /meta name="googlebot" content="noindex,nofollow,noarchive"/);
});

test("the public species sitemap excludes unreviewed profiles", () => {
  assert.match(router, /incoming\.pathname === "\/species-sitemap\.xml"/);
  assert.match(router, /review === null \|\| review === "REVIEWED"/);
  assert.match(router, /x-4species-index-gate": "human-review-v1"/);
});
