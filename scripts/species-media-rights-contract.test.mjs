import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const species = read("src/pages/integrated/Species.tsx");
const media = read("src/data/speciesMedia.ts");

const forbiddenPublicOrcaPhotos = [
  "/assets/species/_index-hero.jpg",
  "/assets/species/orca/detail-fjord.jpg",
  "/assets/species/orca/detail-pod.jpg",
  "/assets/species/orca/detail-spyhop.jpg",
  "/assets/species/orca/detail-ice.jpg",
];

test("source-unresolved Orca photographs are absent from the public Species runtime", () => {
  for (const path of forbiddenPublicOrcaPhotos) {
    assert.doesNotMatch(species, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(species, /speciesMedia\("orca"\)\?\.illustration/);
  assert.match(species, /4PLANET ILLUSTRATION · NOT A PHOTOGRAPH/);
  assert.match(species, /ORCA MEDIA · RIGHTS BOUNDARY/);
  assert.match(species, /Photographs stay hidden until the exact licence is verified\./);
});

test("Orca photo stays fail-closed in the media registry while the owned illustration remains explicit", () => {
  assert.match(media, /orca:\s*\{[\s\S]*?publicWebAllowed:\s*false[\s\S]*?rightsStatus:\s*"PENDING"/);
  assert.match(media, /"orca":\s*\{\s*localPath:\s*"\/assets\/species\/orca\/illustration\.jpg"/);
  assert.match(media, /licence:\s*"Owned work — all rights held by 4PLANET"/);
});
