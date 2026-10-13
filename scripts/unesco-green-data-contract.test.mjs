import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(path, "utf8");

test("UNESCO shared contract is dataset-scoped and ShareAlike-aware", () => {
  const data = read("src/data/unescoOpenData.ts");
  for (const id of ["mab001", "whc001", "eg0001", "ioc001", "cou001"]) {
    assert.match(data, new RegExp(`\\b${id}\\b`));
  }
  assert.match(data, /CC BY-SA 4\.0/);
  assert.match(data, /YES_WITH_ATTRIBUTION_AND_SHAREALIKE/);
  assert.match(data, /shareAlike:\s*true/);
  assert.match(data, /missing|sovereignty|abundance|boundary/i);
});

test("UNESCO API adapter is bounded and allowlisted", () => {
  const api = read("functions/api/unesco-data.ts");
  for (const id of ["mab001", "whc001", "eg0001", "ioc001", "cou001"]) {
    assert.match(api, new RegExp(`\\b${id}\\b`));
  }
  assert.match(api, /UNSUPPORTED_DATASET/);
  assert.match(api, /PAGE_SIZE = 100/);
  assert.match(api, /maxRecords/);
  assert.doesNotMatch(api, /url\.searchParams\.get\(["']url["']\)/);
});

test("ATLAS exposes the four curated P0 layer families without replacing Protected Planet", () => {
  const layers = read("src/earth/layers.ts");
  for (const id of [
    "unesco-biospheres",
    "unesco-world-heritage",
    "unesco-geoparks",
    "unesco-ocean-biodiversity",
  ]) {
    assert.match(layers, new RegExp(`id: "${id}"`));
  }
  assert.match(layers, /id: "protected"[\s\S]*kind: "planned"/);
  assert.match(layers, /not reserve boundaries|not the full site boundary|not geopark boundaries/i);
  assert.match(layers, /not abundance[\s\S]*not live positions/i);
});

test("ATLAS point lifecycle is data-driven and source depth is controlled", () => {
  const atlas = read("src/pages/v5/Atlas.tsx");
  assert.match(atlas, /l\.kind === "point" \|\| l\.kind === "live"/);
  assert.match(atlas, /RIGHTS \{DOT\} \{l\.rights\}/);
  assert.match(atlas, /TIME \{DOT\} \{l\.period\}/);
});

test("ATLAS source control keeps endpoint and map evidence separate from rights", () => {
  const control = read("src/earth/atlasSourceControl.ts");
  for (const id of [
    "unesco-mab",
    "unesco-world-heritage",
    "unesco-geoparks",
    "unesco-obis-ocean-areas",
    "unesco-member-states",
  ]) {
    assert.match(control, new RegExp(`"${id}"`));
  }
  assert.match(control, /endpoint: "PASS"/);
  assert.match(control, /map: "PENDING"/);
  assert.match(control, /rights: "PASS"/);
});
