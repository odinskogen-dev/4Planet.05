import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const page = fs.readFileSync("src/pages/integrated/ImpactLivingActionNetwork.tsx", "utf8");
const client = fs.readFileSync("src/impact/livingActionNetworkClient.ts", "utf8");
const router = fs.readFileSync("src/routes/router.tsx", "utf8");
const manifest = JSON.parse(fs.readFileSync("src/data/impactDiscovery.json", "utf8"));

test("Impact runtime reads the existing NATUREBRAIN projection", () => {
  assert.match(client, /impact_lan_gold_v01/);
  assert.match(client, /getIdentityClient/);
  assert.doesNotMatch(client, /const\s+projects\s*=\s*\[/i);
  assert.match(page, /No project claims are shown from a stale parallel copy/);
});

test("Impact exposes project and actor profiles before the legacy catch-all route", () => {
  const project = router.indexOf('path="/impact/project/:slug"');
  const actor = router.indexOf('path="/impact/actors/:slug"');
  const legacy = router.indexOf('path="/impact/:slug"');
  assert.ok(project >= 0 && actor >= 0 && legacy >= 0);
  assert.ok(project < legacy && actor < legacy);
});

test("Impact Gold SEO projection is explicit and source-aware", () => {
  assert.equal(manifest.sourceOfTruth, "NATUREBRAIN public.impact_lan_gold_v01()");
  assert.equal(manifest.projects.length, 4);
  for (const project of manifest.projects) {
    assert.match(project.id, /^project:4p:impact:/);
    assert.ok(project.citations.length >= 1);
    for (const url of project.citations) assert.match(url, /^https:\/\//);
  }
});

test("Impact keeps partnership and evidence boundaries explicit", () => {
  assert.match(page, /does not mean 4PLANET partnership/);
  assert.match(page, /Contribution, delivery, outcome and verification remain separate truth states|Different claims need different proof/);
  assert.match(page, /ISSUE-FAMILY VISUAL · NOT PROJECT EVIDENCE/);
});
