#!/usr/bin/env node
/**
 * npm run assets:verify
 * Reports missing, duplicate and unassigned public image references.
 * - MISSING     : a path referenced in src that has no file under public/
 * - DUPLICATE   : the same /assets path referenced by more than one registry key
 * - UNASSIGNED  : an image file under public/assets not referenced anywhere in src
 * Exit code 1 if any MISSING references are found.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const PUBLIC_ASSETS = join(ROOT, "public", "assets");

function walk(dir, test) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p, test));
    else if (!test || test(p)) out.push(p);
  }
  return out;
}

// 1) collect every /assets/....(jpg|png|webp) reference in src
const srcFiles = walk(SRC, (p) => /\.(ts|tsx)$/.test(p));
const referenced = new Map(); // path -> count
const add = (p) => referenced.set(p, (referenced.get(p) || 0) + 1);
// literal /assets/... paths
const litRe = /\/assets\/[A-Za-z0-9_\-/]+\.(?:jpg|jpeg|png|webp)/g;
// registry template paths: `${A}/...` (A = /assets) and `${A2}/...` (A2 = /assets/missions)
const aRe = /\$\{A\}(\/[A-Za-z0-9_\-/]+\.(?:jpg|jpeg|png|webp))/g;
const a2Re = /\$\{A2\}(\/[A-Za-z0-9_\-/]+\.(?:jpg|jpeg|png|webp))/g;
for (const f of srcFiles) {
  const txt = readFileSync(f, "utf8");
  for (const m of txt.matchAll(litRe)) add(m[0]);
  for (const m of txt.matchAll(aRe)) add("/assets" + m[1]);
  for (const m of txt.matchAll(a2Re)) add("/assets/missions" + m[1]);
}

// 2) collect actual files on disk
let diskFiles = [];
try { diskFiles = walk(PUBLIC_ASSETS, (p) => /\.(jpg|jpeg|png|webp)$/.test(p)); } catch { /* no assets */ }
const diskRel = new Set(diskFiles.map((p) => "/assets/" + relative(PUBLIC_ASSETS, p).split("\\").join("/")));

// 3) analyse
const missing = [];
const duplicate = [];
for (const [p, count] of referenced) {
  if (!diskRel.has(p)) missing.push(p);
  // duplicates only flagged for hero/domain roles are hard to know here; report same-path multi-ref
  if (count > 1) duplicate.push(`${p}  (referenced ${count}×)`);
}
const referencedSet = new Set([...referenced.keys()].flatMap((p) => [p, p.replace(/(\.\w+)$/, "-mobile$1")]));
const unassigned = [...diskRel].filter((p) => !referencedSet.has(p) && !/-mobile\.\w+$/.test(p));

const line = (t) => console.log(t);
line("── 4PLANET assets:verify ──────────────────────────────");
line(`referenced paths : ${referenced.size}`);
line(`files on disk    : ${diskRel.size}`);
line("");
line(`MISSING (referenced, no file) : ${missing.length}`);
missing.forEach((p) => line("  ✗ " + p));
line("");
line(`DUPLICATE (same path, multi-ref) : ${duplicate.length}`);
duplicate.forEach((p) => line("  • " + p));
line("");
line(`UNASSIGNED (on disk, unreferenced) : ${unassigned.length}`);
unassigned.forEach((p) => line("  ? " + p));
line("───────────────────────────────────────────────────────");

if (missing.length) { line("RESULT: FAIL — missing asset references must be fixed."); process.exit(1); }
line("RESULT: PASS — no missing asset references.");
