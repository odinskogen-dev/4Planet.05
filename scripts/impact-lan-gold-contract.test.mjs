import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const page = fs.readFileSync("src/pages/integrated/ImpactLivingActionNetwork.tsx", "utf8");
const actionProof = fs.readFileSync("src/pages/integrated/ImpactActionProof.tsx", "utf8");
const client = fs.readFileSync("src/impact/livingActionNetworkClient.ts", "utf8");
const router = fs.readFileSync("src/routes/router.tsx", "utf8");
const manifest = JSON.parse(fs.readFileSync("src/data/impactDiscovery.json", "utf8"));
const prerender = fs.readFileSync("scripts/prerender-discovery-seo.mjs", "utf8");

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

const releasedForOrigin = (item, origin = "https://4planet.org") =>
  item?.publicationState === "READY_FOR_FOUNDER_RELEASE" && item?.canonicalOrigin === origin;

test("Impact object discovery fails closed without per-object publication authority", () => {
  assert.match(manifest.publicationLaw, /Source inclusion is curation only/);
  assert.match(manifest.publicationLaw, /Missing or conflicting authority fails closed/);
  for (const project of manifest.projects) {
    assert.equal(project.publicationState, "HEIR_CANDIDATE");
    assert.equal(project.canonicalOrigin, null);
    assert.equal(project.actor.publicationState, "HEIR_CANDIDATE");
    assert.equal(project.actor.canonicalOrigin, null);
    assert.equal(releasedForOrigin(project), false);
    assert.equal(releasedForOrigin(project.actor), false);
  }
  const project = manifest.projects[0];
  const actor = project.actor;
  assert.equal(releasedForOrigin({ ...project, publicationState: "READY_FOR_FOUNDER_RELEASE", canonicalOrigin: "https://4planet.org" }), true);
  assert.equal(releasedForOrigin({ ...project, publicationState: "READY_FOR_FOUNDER_RELEASE", canonicalOrigin: "https://example.org" }), false);
  assert.equal(releasedForOrigin({ ...project, canonicalOrigin: "https://4planet.org" }), false);
  assert.equal(releasedForOrigin({ ...actor, publicationState: "READY_FOR_FOUNDER_RELEASE", canonicalOrigin: "https://4planet.org" }), true);
});

test("Impact prerender gates projects and actors and does not assign third-party Organization ownership to 4PLANET profile URLs", () => {
  assert.match(prerender, /impactObjectIsReleasedForOrigin/);
  assert.match(prerender, /impactDiscovery\.projects \?\? \[\]\)\.filter\(impactObjectIsReleasedForOrigin\)/);
  assert.match(prerender, /values\(\)\)\.filter\(impactObjectIsReleasedForOrigin\)/);
  assert.match(prerender, /mainEntity: \{ "@type": "Thing", "@id": actor\.id, name: actor\.name \}/);
  assert.match(prerender, /about: \{ "@type": "Thing", "@id": actor\.id, name: actor\.name \}/);
  assert.doesNotMatch(prerender, /"@type": "Organization",\n\s+name: actor\.name/);
});


test("Impact actor discovery groups shared actors into one identity entry", () => {
  assert.match(page, /const actorEntries = useMemo/);
  assert.match(page, /new Map<string, \{/);
  assert.match(page, /byId\.get\(project\.actor\.id\)/);
  assert.match(page, /current\.projects\.push\(project\)/);
  assert.match(page, /key=\{actor\.id\}/);
  assert.match(page, /projectCount === 1 \? "project" : "projects"/);
  assert.doesNotMatch(page, /payload\.projects\.filter\(\(project\) => project\.actor\)\.map/);
});


test("Impact action exposes an Actor profile only through explicit public authority", () => {
  assert.match(actionProof, /actorForActionContract/);
  assert.match(actionProof, /actorIsPublic/);
  assert.match(actionProof, /const publicActorProfilePath = actorIsPublic\(canonicalActor\)/);
  assert.match(actionProof, /publicActorProfilePath \? <Link to=\{publicActorProfilePath\}/);
  assert.match(actionProof, /PUBLIC ACTOR PROFILE NOT AVAILABLE/);
  assert.doesNotMatch(actionProof, /<Link to=\{\`\/actors\/\$\{canonicalActor\.slug\}\`\}/);
});


test("Impact actions retain canonical identity when display labels collide", () => {
  assert.match(client, /const actionBase = entity\(row\.action\)/);
  assert.match(client, /action: actionBase \?/);
  assert.match(page, /data-action-id=\{project\.action\.id\}/);
  assert.match(page, /href=\{project\.action\.url\}/);
  assert.match(page, /action_id: project\.action\?\.id/);
  assert.match(page, /action_url: project\.action\?\.url/);
  assert.doesNotMatch(page, /new Map<[^>]*>\(.*action.*name/is);

  const sameLabel = [
    { id: "action:un:restore:001", name: "Learn more", url: "https://example.org/actions/001" },
    { id: "action:un:restore:002", name: "Learn more", url: "https://example.org/actions/002" },
  ];
  const projected = new Map(sameLabel.map((action) => [action.id, action.url]));
  assert.equal(projected.size, 2);
  assert.deepEqual([...projected.values()], sameLabel.map((action) => action.url));
});
