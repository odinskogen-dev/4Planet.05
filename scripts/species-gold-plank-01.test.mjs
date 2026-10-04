import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../src/pages/integrated/Species.tsx", import.meta.url), "utf8");
const species = await readFile(new URL("../src/data/species.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../src/pages/integrated/SpeciesRoute.tsx", import.meta.url), "utf8");
const envelope = await readFile(new URL("../src/data/speciesSourceEnvelope.ts", import.meta.url), "utf8");
const manifest = await readFile(new URL("../src/content/mediaManifest.ts", import.meta.url), "utf8");

function profileBlock(source, slug) {
  const marker = `slug: "${slug}"`;
  const slugAt = source.indexOf(marker);
  assert.ok(slugAt >= 0, `missing profile ${slug}`);
  const objectStart = source.lastIndexOf("\n  {", slugAt);
  const nextObject = source.indexOf("\n  {", slugAt);
  let block = source.slice(objectStart, nextObject === -1 ? source.length : nextObject);
  const chapterRef = block.match(/narrativeChapters:\s*([A-Z0-9_]+)/);
  if (chapterRef) {
    const name = chapterRef[1];
    const constStart = source.indexOf(`const ${name}`);
    const constEnd = source.indexOf("\n];", constStart);
    if (constStart >= 0 && constEnd > constStart) block += `\n${source.slice(constStart, constEnd)}`;
  }
  return block;
}

const orca = profileBlock(species, "orca");
const jaguar = profileBlock(species, "jaguar");

const SHARED_SECTION_ORDER = [
  "habitat",
  "public-claims",
  "atlas",
  "taxon-occurrence",
  "truth-boundary",
  "evidence-chapters",
  "field-media",
  "pressure-response",
  "product-note",
];

test("SPECIES-GP-01 premium layout is parent-owned for ORCA and JAGUAR", () => {
  assert.equal(page.includes("isOrca"), false);
  assert.equal(/slug === ["']orca["']/.test(page), false);
  assert.equal(/slug === ["']jaguar["']/.test(page), false);
  assert.match(page, /profile\.narrativeChapters/);
  assert.match(page, /profile\.truthBoundary/);
  assert.match(page, /profile\.atlasJourney/);
  assert.match(page, /profile\.continuation/);
  const sections = [...page.matchAll(/data-species-section="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(sections, SHARED_SECTION_ORDER);
  for (const block of [orca, jaguar]) {
    assert.match(block, /narrativeChapters:/);
    assert.match(block, /truthBoundary:/);
    assert.match(block, /state: "UNKNOWN"/);
  }
});

test("SPECIES-GP-01 Jaguar drops the unsupported forest-health inference", () => {
  for (const forbidden of [
    "signals connected, functioning forest",
    "functioning forest",
    "presence signals connected",
    "173,000",
    "173000",
    "57,000",
    "57000",
    "64,000",
    "64000",
    "89%",
  ]) {
    assert.equal(jaguar.includes(forbidden), false, `Jaguar profile still publishes: ${forbidden}`);
    assert.equal(page.includes(forbidden), false, `Species page still publishes: ${forbidden}`);
  }
  assert.match(jaguar, /a sighting alone does not prove local population health or ecosystem condition/);
  assert.match(jaguar, /not a complete range map or a live animal position/);
  assert.match(jaguar, /A single global population number remains UNKNOWN/);
  assert.match(jaguar, /Current local abundance, population trend, corridor use, ecosystem health and live location remain UNKNOWN/);
});

test("SPECIES-GP-01 Jaguar stays inside the existing source envelope and rights record", () => {
  for (const required of [
    "JAGUAR_SOURCE_ENVELOPE",
    "taxon:gbif:5219426",
    "https://www.fws.gov/species/jaguar-panthera-onca",
    "https://www.catsg.org/living-species-jaguar",
    "local ecological health from species presence alone",
    "range from observation points alone",
    "abundance or trend from occurrence count",
    "corridor use from map proximity",
    "live location from historical occurrence data",
    "individual behaviour from species description",
    'rightsOrTerms: "US government/public information page',
  ]) assert.ok(envelope.includes(required), `missing envelope contract: ${required}`);
  assert.match(jaguar, /https:\/\/www\.fws\.gov\/species\/jaguar-panthera-onca/);
  assert.match(jaguar, /https:\/\/www\.catsg\.org\/living-species-jaguar/);
  assert.match(jaguar, /https:\/\/www\.gbif\.org\/species\/5219426/);
  const sp005 = manifest.slice(manifest.indexOf('"SP-005"'), manifest.indexOf('"SP-006"'));
  assert.match(sp005, /Patty Ho/);
  assert.match(sp005, /CC BY 2\.0/);
  assert.match(sp005, /Pantanal/);
  assert.match(sp005, /Not an Amazonia image/);
  assert.match(sp005, /Not an Amazonia image, an ATLAS occurrence/);
});

test("SPECIES-GP-01 preserves canonical discovery, ATLAS and occurrence semantics", () => {
  assert.match(orca, /taxon:gbif:2440483/);
  assert.match(jaguar, /taxon:gbif:5219426/);
  assert.match(orca, /missionSlug: "wh4les"/);
  assert.match(jaguar, /missionSlug: "am4zonia"/);
  assert.match(orca, /atlasJourney: "orca-gbif"/);
  assert.match(orca, /href: "\/living-systems"/);
  assert.match(page, /AtlasEmbed/);
  assert.match(page, /data-testid="species-to-atlas"/);
  assert.match(page, /data-testid="species-to-mission"/);
  assert.match(page, /They do not establish range, abundance, population trend or live tracking/);
  assert.match(page, /Historical occurrence records are not live animal positions/);
  assert.match(page, /className=\{returnHref \? "closer-look"/);
  assert.match(route, /"@type": "WebPage"/);
  assert.match(route, /"@type": "Taxon"/);
  assert.match(route, /sameAs: sourceUrls\.length > 0 \? sourceUrls : \[curated\.taxonSourceUrl\]/);
  assert.match(route, /disambiguatingDescription: limitations/);
  assert.match(route, /SpeciesEvidenceSeam/);
});
