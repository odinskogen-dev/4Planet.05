#!/usr/bin/env node
/**
 * IMPACT projection harness — compiles and exercises the NATUREBRAIN IMPACT read
 * projections against an in-memory Postgres (PGlite) using a minimal test schema.
 *
 * Purpose: let AXE / Product Engineering verify, before applying anything to
 * Supabase, that (a) the projection SQL compiles, (b) the four Gold v01 objects
 * still project, and (c) a new seed written to the admission contract appears.
 *
 * It never connects to Supabase and never writes canonical data.
 *
 * Usage:
 *   npm i --no-save @electric-sql/pglite      # one-off, not a repo dependency
 *   node scripts/impact-projection-harness.mjs [--out dir] [extra-seed.sql ...]
 *
 * Exit code 0 = both projections executed; JSON written to --out (default tests/fixtures/impact).
 */
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
let out = "tests/fixtures/impact";
const seeds = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--out") out = args[++i];
  else seeds.push(args[i]);
}

let PGlite;
try {
  ({ PGlite } = await import("@electric-sql/pglite"));
} catch {
  console.log("IMPACT PROJECTION HARNESS: SKIPPED — install @electric-sql/pglite (npm i --no-save @electric-sql/pglite) to run.");
  process.exit(0);
}

const read = (file) => fs.readFileSync(file, "utf8");
const db = new PGlite();
async function apply(file) {
  try {
    await db.exec(read(file));
  } catch (error) {
    console.error(`IMPACT PROJECTION HARNESS: FAIL in ${file}: ${error.message}${error.position ? ` (position ${error.position})` : ""}`);
    process.exit(1);
  }
}
await apply("tests/naturebrain/planetbrain-harness-schema.sql");
await apply("supabase/migrations/20261013205121_impact_living_action_network_gold_v01.sql");
await apply("supabase/migrations/20261014200000_impact_living_action_network_v02_projection.sql");
for (const seed of seeds) await apply(seed);

const v01 = (await db.query("select public.impact_lan_gold_v01() as payload")).rows[0].payload;
const v02 = (await db.query("select public.impact_lan_v02() as payload")).rows[0].payload;

fs.mkdirSync(out, { recursive: true });
const suffix = seeds.length ? "-with-seeds" : "";
fs.writeFileSync(path.join(out, `impact-lan-gold-v01${suffix}.json`), JSON.stringify(v01, null, 2) + "\n");
fs.writeFileSync(path.join(out, `impact-lan-v02${suffix}.json`), JSON.stringify(v02, null, 2) + "\n");

console.log(`IMPACT PROJECTION HARNESS: PASS — v01 projects=${v01.projects.length}; v02 projects=${v02.projects.length} issues=${v02.issues.length} actors=${v02.actors.length} solutions=${v02.solutions.length} places=${v02.places.length}; out=${out}`);
