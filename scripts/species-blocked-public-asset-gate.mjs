#!/usr/bin/env node

import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const blocked = [
  "assets/species/orca/hero.jpg",
  "assets/species/orca/hero-mobile.jpg",
];

const escaped = blocked.flatMap((relativePath) => [
  join(root, "public", relativePath),
  join(root, "dist", relativePath),
]).filter(existsSync);

if (escaped.length) {
  console.error("SPECIES_BLOCKED_PUBLIC_ASSET_GATE=FAIL");
  for (const path of escaped) console.error(`BLOCKED_PUBLIC_ASSET=${path}`);
  process.exit(1);
}

for (const required of [
  join(root, "public/assets/species/orca/illustration.jpg"),
  join(root, "dist/assets/species/orca/illustration.jpg"),
]) {
  if (!existsSync(required)) {
    console.error("SPECIES_BLOCKED_PUBLIC_ASSET_GATE=FAIL");
    console.error(`RIGHTS_SAFE_FALLBACK_MISSING=${required}`);
    process.exit(1);
  }
}

console.log("SPECIES_BLOCKED_PUBLIC_ASSET_GATE=PASS");
console.log("CUR_ORCA_01_PUBLIC_BYTES=ABSENT");
console.log("ORCA_OWNED_ILLUSTRATION=AVAILABLE");
