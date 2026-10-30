import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const snapshot=fs.readFileSync("scripts/impact-graph-snapshot.mjs","utf8");
const sitemap=fs.readFileSync("scripts/generate-sitemap.mjs","utf8");
const prerender=fs.readFileSync("scripts/prerender-impact-seo.mjs","utf8");

test("IMPACT sitemap freshness uses record review/update timestamps",()=>{
  assert.match(snapshot,/updatedAt: text\(row\.updated_at\)/);
  assert.match(snapshot,/updatedAt: p\.updatedAt/);
  assert.match(snapshot,/lastReviewed: a\.lastReviewed/);
  assert.match(sitemap,/impactLastmodByRoute/);
  assert.match(sitemap,/item\?\.lastReviewed \|\| item\?\.updatedAt/);
  assert.match(sitemap,/<lastmod>/);
  assert.doesNotMatch(sitemap,/impactLastmodByRoute.*Date\.now/);
});

test("crawlable IMPACT graph exposes publisher context and all public Methods",()=>{
  assert.match(prerender,/Published by <a href="\/about">4PLANET<\/a>/);
  assert.match(prerender,/<h2>Methods<\/h2>/);
  assert.match(prerender,/solutions\.filter\(\(s\) => s\.indexable === true\)/);
  assert.match(prerender,/solutionHref/);
});
