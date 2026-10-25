import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { normalise, validate } from "./impact-graph-snapshot.mjs";

const read = (file) => fs.readFileSync(file, "utf8");
const page = read("src/pages/integrated/ImpactLivingActionNetwork.tsx");
const client = read("src/impact/livingActionNetworkClient.ts");
const graph = read("src/impact/livingActionNetworkGraph.ts");
const ui = ["primitives", "HomeTemplate", "ProjectTemplate", "ActorTemplate", "IssueTemplate", "SolutionTemplate"].map((name) => read(`src/impact/ui/${name}.tsx`)).join("\n");
const router = read("src/routes/router.tsx");
const manifest = JSON.parse(read("src/data/impactDiscovery.json"));
const v02sql = read("supabase/migrations/20261014200000_impact_living_action_network_v02_projection.sql");
const v01sql = read("supabase/migrations/20261013205121_impact_living_action_network_gold_v01.sql");
const GOLD = [
  "project:4p:impact:northern-mozambique-channel",
  "project:4p:impact:african-forest-gardens",
  "project:4p:impact:florida-coral-restoration",
  "project:4p:impact:great-pacific-garbage-patch",
];

test("Impact runtime reads NATUREBRAIN projections only (v02 preferred, v01 guaranteed)", () => {
  assert.match(client, /impact_lan_v02/);
  assert.match(client, /impact_lan_gold_v01/);
  assert.match(client, /identityConstants/);
  for (const source of [client, graph, ui, page]) {
    assert.doesNotMatch(source, /const\s+projects\s*=\s*\[\s*\{/i, "no static project truth in the frontend");
  }
  assert.match(ui, /nothing is shown from a stale or parallel copy/);
  assert.match(ui, /Unavailable is not the same as zero/);
});

test("Impact canonical routes resolve before the legacy /impact/:slug catch-all", () => {
  const legacy = router.indexOf('path="/impact/:slug"');
  assert.ok(legacy >= 0);
  for (const route of ['path="/impact/project/:slug"', 'path="/impact/actors/:slug"', 'path="/impact/issue/:slug"', 'path="/impact/solution/:slug"']) {
    const at = router.indexOf(route);
    assert.ok(at >= 0 && at < legacy, route + " must precede the catch-all");
  }
});

test("Impact SEO projection is explicit, source-aware and keeps the four Gold objects", () => {
  assert.match(manifest.sourceOfTruth, /NATUREBRAIN/);
  assert.deepEqual(validate(manifest), []);
  const ids = manifest.projects.map((project) => project.id);
  for (const id of GOLD) assert.ok(ids.includes(id), id + " must remain published");
  for (const project of manifest.projects) {
    assert.ok(project.citations.length >= 1, project.slug + " needs a citation");
    for (const url of project.citations) assert.match(url, /^https:\/\//);
    assert.ok(project.actor && project.actor.slug, project.slug + " keeps a lead actor for existing consumers");
  }
});

test("v01 and v02 projections give identical public URLs (no canonical churn)", () => {
  const v01 = normalise(JSON.parse(read("tests/fixtures/impact/impact-lan-gold-v01.json")));
  const v02 = normalise(JSON.parse(read("tests/fixtures/impact/impact-lan-v02.json")));
  const slugs = (m) => ["projects", "actors", "issues"].map((k) => m[k].map((x) => x.slug).sort());
  assert.deepEqual(slugs(v01), slugs(v02));
});

test("A new AXE-published NATUREBRAIN object enters the SEO projection with no code change", () => {
  const seeded = normalise(JSON.parse(read("tests/fixtures/impact/impact-lan-v02-with-seeds.json")));
  assert.deepEqual(validate(seeded), []);
  assert.ok(seeded.projects.some((p) => p.slug === "test-fixture-wetland-recovery"));
  assert.ok(seeded.actors.some((a) => a.slug === "test-fixture-wetland-trust"));
  assert.ok(seeded.issues.some((i) => i.slug === "test-fixture-wetland-loss"));
  const delivery = seeded.projects.find((p) => p.slug === "test-fixture-wetland-recovery").actors.map((a) => a.slug);
  assert.deepEqual(delivery.sort(), ["fixture-field-lab", "test-fixture-wetland-trust"]);
});

test("v02 projection is additive, read-only and publication-gated", () => {
  assert.match(v02sql, /create or replace function public\.impact_lan_v02\(\)/);
  assert.match(v02sql, /security definer/);
  assert.match(v02sql, /set search_path = ''/);
  assert.match(v02sql, /impact_publication' = 'public'/);
  assert.match(v02sql, /grant execute on function public\.impact_lan_v02\(\) to anon/);
  assert.doesNotMatch(v02sql, /\b(insert|update|delete|drop|alter|truncate)\b\s+(into|table|from|function)?/i);
  assert.doesNotMatch(v02sql, /function\s+public\.impact_lan_gold_v01/, "v01 must not be redefined by v02");
  assert.match(v01sql, /create or replace function public\.impact_lan_gold_v01\(\)/);
  assert.ok(fs.existsSync("supabase/rollback/20261014200000_impact_living_action_network_v02_projection.down.sql"));
});

test("Impact keeps partnership, media and evidence boundaries explicit", () => {
  assert.match(ui, /does not mean 4PLANET partnership/);
  assert.match(ui, /not a 4PLANET partner/);
  assert.match(ui, /not project photography/);
  assert.match(ui, /Stated ambition — not delivery/);
  assert.match(ui, /What this record does not establish/);
  assert.match(ui, /does not process, receive or claim credit/);
  const review = read("src/impact/reviewModel.ts");
  assert.match(review, /"4PLANET REVIEWED"[^}]*reserved:/);
  assert.match(review, /"PARTNER"[^}]*reserved:/);
  assert.doesNotMatch(ui, /\bverified\b(?! outcome| impact|["’”])/i, "no generic 'verified' badge language");
});
