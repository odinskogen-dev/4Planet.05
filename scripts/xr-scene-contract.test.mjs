import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync(new URL("../public/xr/scenes/jaguar.json", import.meta.url), "utf8"));
const renderer = readFileSync(new URL("../public/xr/engine/nature-renderer.js", import.meta.url), "utf8");
const speciesSource = readFileSync(new URL("../src/data/species.ts", import.meta.url), "utf8");
const allowedRelationClasses = new Set(["DEPENDENCY", "PRESSURE", "RESPONSE"]);

test("Nature XR manifest stays attached to canonical Jaguar identity", () => {
  assert.equal(manifest.entity.id, "taxon:gbif:5219426");
  assert.equal(manifest.entity.gbifKey, 5219426);
  assert.match(speciesSource, /taxon:gbif:5219426/);
  assert.match(speciesSource, /gbifKey:\s*5219426/);
  assert.match(manifest.truthBoundary, /NOT A LIVE HABITAT/);
  assert.match(manifest.truthBoundary, /NOT A PRECISE ECOLOGICAL SIMULATION/);
});

test("Every XR truth node carries source, boundary and controlled relation class", () => {
  assert.ok(manifest.nodes.length >= 5);
  for (const node of manifest.nodes) {
    assert.ok(node.id);
    assert.ok(node.kind);
    assert.ok(node.source?.label);
    assert.ok(node.source?.url);
    assert.ok(node.boundary);
    assert.ok(node.truthState);
    if (node.relationClass !== null) assert.ok(allowedRelationClasses.has(node.relationClass));
  }
});

test("Nature renderer is species-agnostic rather than a second Jaguar page", () => {
  assert.doesNotMatch(renderer, /Panthera onca/i);
  assert.doesNotMatch(renderer, /5219426/);
  assert.match(renderer, /manifest\.nodes\.forEach/);
  assert.match(renderer, /manifest\.entity\.id/);
});

test("Jaguar XR reaches a RESPONSE handoff rather than ending at awareness", () => {
  const response = manifest.nodes.find((node) => node.relationClass === "RESPONSE");
  assert.ok(response);
  assert.match(response.title, /HOW DO WE SOLVE THIS/i);
  assert.ok(response.href);
});
