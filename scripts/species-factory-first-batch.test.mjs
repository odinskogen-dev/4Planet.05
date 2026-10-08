import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const speciesFile = await readFile(new URL("../src/data/species.ts", import.meta.url), "utf8");
const envelopeFile = await readFile(new URL("../src/data/speciesSourceEnvelope.ts", import.meta.url), "utf8");
const discovery = JSON.parse(await readFile(new URL("../src/data/discoveryInventory.json", import.meta.url), "utf8"));
const parentFile = await readFile(new URL("../src/pages/integrated/Species.tsx", import.meta.url), "utf8");

export const FIRST_FACTORY_BATCH = [
  "african-savanna-elephant",
  "cheetah",
  "blue-whale",
  "tiger",
  "polar-bear",
  "whale-shark",
  "green-sea-turtle",
  "emperor-penguin",
  "giant-panda",
  "acropora-palmata",
];

function recordFor(slug) {
  const spaced = `slug: "${slug}"`;
  const compact = `slug:"${slug}"`;
  const index = speciesFile.includes(spaced) ? speciesFile.indexOf(spaced) : speciesFile.indexOf(compact);
  assert.notEqual(index, -1, `missing species object: ${slug}`);
  const start = speciesFile.lastIndexOf("\n  {", index);
  let end = speciesFile.indexOf("\n  },\n  {", index);
  if (end < 0) end = speciesFile.indexOf("\n  },\n];", index);
  assert.ok(start >= 0 && end > start, `unable to isolate species object: ${slug}`);
  return speciesFile.slice(start, end + 5);
}

test("SPECIES Factory batch 01 has ten reusable source-grounded product objects", () => {
  assert.equal(FIRST_FACTORY_BATCH.length, 10);
  for (const slug of FIRST_FACTORY_BATCH) {
    const record = recordFor(slug);
    for (const required of ["id:", "commonName:", "scientificName:", "gbifKey:", "taxonSourceUrl:", "intro:", "habitat:", "descriptorSource:", "publicClaims:"]) {
      assert.ok(record.includes(required), `${slug} missing ${required}`);
    }
    assert.ok(record.includes("sourceUrl:"), `${slug} has no material source URL`);
    assert.ok(record.includes("limitation:"), `${slug} has no claim limitation`);

    const item = discovery.species.find((entry) => entry.slug === slug);
    assert.ok(item, `${slug} missing discovery inventory object`);
    assert.equal(item.indexable, true, `${slug} is not indexable`);
    assert.equal(item.state, "CURATED", `${slug} is not CURATED`);
  }
});

test("Factory batch 01 is bound to the existing source-envelope/provenance system", () => {
  const requiredMappings = [
    '"african-savanna-elephant": AFRICAN_SAVANNA_ELEPHANT_SOURCE_ENVELOPE',
    'cheetah: CHEETAH_SOURCE_ENVELOPE',
    '"blue-whale": BLUE_WHALE_SOURCE_ENVELOPE',
    'tiger: TIGER_SOURCE_ENVELOPE',
    '"polar-bear": POLAR_BEAR_SOURCE_ENVELOPE',
    '"whale-shark": WHALE_SHARK_SOURCE_ENVELOPE',
    '"green-sea-turtle": GREEN_TURTLE_SOURCE_ENVELOPE',
    '"emperor-penguin": EMPEROR_PENGUIN_SOURCE_ENVELOPE',
    '"giant-panda": GIANT_PANDA_SOURCE_ENVELOPE',
    '"acropora-palmata": ELKHORN_CORAL_SOURCE_ENVELOPE',
  ];
  for (const mapping of requiredMappings) assert.ok(envelopeFile.includes(mapping), `missing envelope mapping: ${mapping}`);
  for (const required of ["provenance:", "rightsOrTerms:", "uncertainty:", "updateSemantics:", "forbiddenInferences:"]) {
    assert.ok(envelopeFile.includes(required), `source envelope missing ${required}`);
  }
});

test("Pappas Planke owns missing-media truth instead of child-specific hacks", () => {
  assert.ok(parentFile.includes("RIGHTS-CLEARED PHOTOGRAPH NOT AVAILABLE · FACTUAL PROFILE REMAINS AVAILABLE"));
  assert.ok(!parentFile.includes('profile.slug === "acropora-palmata"'));
  assert.ok(!parentFile.includes('profile.slug === "tiger"'));
});

function stringField(record, field, slug) {
  const match = record.match(new RegExp(`\\b${field}:\\s*"([^"]+)"`));
  assert.ok(match, `${slug} missing parseable ${field}`);
  return match[1];
}

function integerField(record, field, slug) {
  const match = record.match(new RegExp(`\\b${field}:\\s*(\\d+)`));
  assert.ok(match, `${slug} missing parseable ${field}`);
  return match[1];
}

test("Factory batch 01 preserves one canonical identity across profile and discovery", () => {
  const ids = new Set();
  const gbifKeys = new Set();

  for (const slug of FIRST_FACTORY_BATCH) {
    const record = recordFor(slug);
    const id = stringField(record, "id", slug);
    const commonName = stringField(record, "commonName", slug);
    const scientificName = stringField(record, "scientificName", slug);
    const gbifKey = integerField(record, "gbifKey", slug);
    const taxonSourceUrl = stringField(record, "taxonSourceUrl", slug);

    assert.equal(id, `taxon:gbif:${gbifKey}`, `${slug} canonical ID does not match its GBIF key`);
    assert.equal(taxonSourceUrl, `https://www.gbif.org/species/${gbifKey}`, `${slug} GBIF source URL drifted from its key`);
    assert.equal(ids.has(id), false, `duplicate canonical ID in batch: ${id}`);
    assert.equal(gbifKeys.has(gbifKey), false, `duplicate GBIF key in batch: ${gbifKey}`);
    ids.add(id);
    gbifKeys.add(gbifKey);

    const discoveryMatches = discovery.species.filter((entry) => entry.slug === slug);
    assert.equal(discoveryMatches.length, 1, `${slug} must have exactly one discovery object`);
    assert.equal(discoveryMatches[0].commonName, commonName, `${slug} common name drifted between profile and discovery`);
    assert.equal(discoveryMatches[0].scientificName, scientificName, `${slug} scientific name drifted between profile and discovery`);
  }
});
