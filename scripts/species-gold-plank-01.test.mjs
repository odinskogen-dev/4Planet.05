import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(new URL("../src/pages/integrated/Species.tsx", import.meta.url), "utf8");
const species = await readFile(new URL("../src/data/species.ts", import.meta.url), "utf8");
const route = await readFile(new URL("../src/pages/integrated/SpeciesRoute.tsx", import.meta.url), "utf8");
const envelope = await readFile(new URL("../src/data/speciesSourceEnvelope.ts", import.meta.url), "utf8");
const manifest = await readFile(new URL("../src/content/mediaManifest.ts", import.meta.url), "utf8");

function profileBlock(source, slug) {
  const marker = \`slug: "\${slug}"\`;
  const slugAt = source.indexOf(marker);
  assert.ok(slugAt >= 0, \`missing profile \${slug}\`);
  const objectStart = source.lastIndexOf("\n  {", slugAt);
  const nextObject = source.indexOf("\n  {", slugAt);
  let block = source.slice(objectStart, nextObject === -1 ? source.length : nextObject);
  const chapterRef = block.match(/narrativeChapters:\s*([A-Z0-9_]+)/);
  if (chapterRef) {
    const name = chapterRef[1];
    const constStart = source.indexOf(\`const \${name}\`);
    const constEnd = source.indexOf("\n];", constStart);
    if (constStart >= 0 && constEnd > constStart) block += "\n" + source.slice(constStart, constEnd + 3);
  }
  return block;
}

const orca = profileBlock(species, "orca");
const jaguar = profileBlock(species, "jaguar");

test("SPECIES-GP-01 uses one Human-First parent instead of species-name layout forks", () => {
  assert.match(page, /function SpeciesEditorialProfile/);
  assert.match(page, /<SpeciesEditorialProfile/);
  assert.equal(page.includes("function OrcaEditorialProfile"), false);
  assert.equal(page.includes("function OrcaEditorialPage"), false);
  assert.equal(page.includes("const isOrca ="), false);
  assert.equal(/if\s*\(\s*profile\.slug\s*===\s*["']orca["']/.test(page), false);
  assert.match(page, /speciesMedia\(profile\.slug\)/);
  assert.match(page, /profile\.commonName/);
  assert.match(page, /profile\.habitat/);
  assert.match(page, /profile\.narrativeChapters/);
  assert.match(page, /profile\.publicClaims/);
  assert.match(page, /profile\.truthBoundary/);
  assert.match(page, /profile\.atlasJourney/);
  assert.match(page, /profile\.continuation/);
});

test("SPECIES-GP-01 Jaguar is source-bounded and does not publish forest-health or population shortcuts", () => {
  for (const forbidden of [
    "signals connected, functioning forest",
    "presence signals connected",
    "173,000",
    "173000",
    "57,000",
    "57000",
    "64,000",
    "64000",
    "89%",
  ]) assert.equal(jaguar.includes(forbidden), false, \`Jaguar publishes forbidden shortcut: \${forbidden}\`);
  assert.match(jaguar, /a sighting alone does not prove local population health or ecosystem condition/i);
  assert.match(jaguar, /not a complete range map or a live animal position/i);
  assert.match(jaguar, /remain UNKNOWN/i);
  assert.match(jaguar, /narrativeChapters:\s*JAGUAR_CHAPTERS/);
  assert.match(jaguar, /truthBoundary:/);
});

test("SPECIES-GP-01 Orca and Jaguar both populate the shared evidence/data grammar", () => {
  for (const block of [orca, jaguar]) {
    assert.match(block, /narrativeChapters:/);
    assert.match(block, /truthBoundary:/);
  }
  assert.match(orca, /atlasJourney:\s*"orca-gbif"/);
  assert.match(orca, /href:\s*"\/living-systems"/);
  assert.match(page, /Public occurrence records are historical source records/);
  assert.match(page, /not live positions, complete range maps, population counts, abundance estimates or migration routes/);
});

test("SPECIES-GP-01 Jaguar keeps source envelope and media rights/context intact", () => {
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
  ]) assert.ok(envelope.includes(required), \`missing Jaguar envelope contract: \${required}\`);
  const sp005 = manifest.slice(manifest.indexOf('"SP-005"'), manifest.indexOf('"SP-006"'));
  assert.match(sp005, /Patty Ho/);
  assert.match(sp005, /CC BY 2\.0/);
  assert.match(sp005, /Pantanal/);
  assert.match(sp005, /Not an Amazonia image/);
});

test("SPECIES-GP-01 preserves canonical discovery and ATLAS identity", () => {
  assert.match(orca, /taxon:gbif:2440483/);
  assert.match(jaguar, /taxon:gbif:5219426/);
  assert.match(page, /data-testid="species-to-atlas"/);
  assert.match(page, /entity:\s*profile\.id/);
  assert.match(route, /"@type":\s*"WebPage"/);
  assert.match(route, /"@type":\s*"Taxon"/);
});
