import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const discovery=fs.readFileSync("scripts/prerender-discovery-seo.mjs","utf8");
const impact=fs.readFileSync("scripts/prerender-impact-seo.mjs","utf8");

test("public prerender emits preferred-image and social discovery metadata",()=>{
  for(const token of [
    '"property:og:image"',
    '"property:og:image:alt"',
    '"property:og:locale"',
    '"name:twitter:card"',
    '"name:twitter:image"',
    'summary_large_image'
  ]) assert.ok(discovery.includes(token),token);
  assert.match(discovery,/startsWith\("https:\/\/"\)/);
  assert.match(discovery,/origin\+"\/og\.png"/);
});

test("IMPACT SEO separates webpages from entities and identifies the publisher",()=>{
  assert.match(impact,/const publisher/);
  assert.match(impact,/"@type": "WebPage"/);
  assert.match(impact,/"@type": "Project"/);
  assert.match(impact,/"@type": "Organization"/);
  assert.match(impact,/"@graph"/);
  assert.match(impact,/mainEntity/);
  assert.match(impact,/inLanguage: "en-GB"/);
  assert.match(impact,/Published by 4PLANET/);
  assert.match(impact,/const metaDescription/);
});

test("authoritative source citations are ordinary crawlable editorial links",()=>{
  assert.doesNotMatch(impact,/nofollow/);
  assert.match(impact,/Source-aware public record/);
});


test("profile title templates stay concise and avoid repetitive type branding",()=>{
  assert.match(impact,/\$\{p\.name\} \| 4PLANET Impact/);
  assert.match(impact,/\$\{a\.name\} \| 4PLANET Impact/);
  assert.match(impact,/projects & evidence \| 4PLANET/);
  assert.match(impact,/method & evidence \| 4PLANET/);
  assert.doesNotMatch(impact,/projects and organisations \| 4PLANET Impact/);
  assert.doesNotMatch(impact,/Organisation \| 4PLANET Impact/);
});
