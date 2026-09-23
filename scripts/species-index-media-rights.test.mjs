import fs from 'node:fs';
import assert from 'node:assert/strict';

const species = fs.readFileSync('src/pages/integrated/Species.tsx', 'utf8');
const media = fs.readFileSync('src/data/speciesMedia.ts', 'utf8');

const heroMatch = species.match(/<img\s+src="([^"]*_index-hero\.jpg)"/);
assert.ok(heroMatch, 'SPECIES index hero asset reference must remain discoverable by the rights gate');

const heroPath = heroMatch[1];
const registered = media.includes(heroPath) || media.includes(heroPath.replace('/assets/species/', ''));
const nearby = species.slice(Math.max(0, heroMatch.index - 800), heroMatch.index + 1800);
const hasVisibleRightsEvidence = /attribution|licen[cs]e|rights/i.test(nearby);

assert.ok(
  registered || hasVisibleRightsEvidence,
  `SPECIES index hero ${heroPath} has no explicit media registry entry or visible attribution/licence evidence. Do not ship an unverified wildlife image; register provenance/rights or use the existing no-cleared-image state.`
);

console.log('PASS: SPECIES index hero has explicit rights/provenance evidence');
