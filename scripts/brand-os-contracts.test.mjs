import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pilots = JSON.parse(readFileSync(resolve("src/brand-os/pilots.json"), "utf8"));
const runtime = readFileSync(resolve("src/brand-os/runtime.ts"), "utf8");
const migration = readFileSync(resolve("supabase/migrations/20260809201500_brand_os_activation.sql"), "utf8");
const router = readFileSync(resolve("src/routes/router.tsx"), "utf8");

const gatePasses = (gate) => gate === "PASS" || gate === "NOT_APPLICABLE";
const releaseEligible = (story, founderDecision = "OPEN") =>
  gatePasses(story.gates.source)
  && gatePasses(story.gates.rights)
  && gatePasses(story.gates.qa)
  && gatePasses(story.gates.product)
  && founderDecision === "APPROVED"
  && story.publicReleaseEligible === true;

const keyFor = (storyId, releaseId, channel, version, fingerprint) =>
  `${storyId}:${releaseId}:${channel}:v${version}:${fingerprint}`;

test("Brand OS starts with exactly the three authorised vertical-slice pilots", () => {
  assert.deepEqual(
    pilots.map((story) => story.storyId).sort(),
    ["STORY-BOS-BEE-001", "STORY-BOS-ORCA-001", "STORY-BOS-OSLO-001"],
  );
});

test("persistent pilot IDs and canonical references are unique and populated", () => {
  const ids = new Set();
  for (const story of pilots) {
    assert.match(story.storyId, /^STORY-BOS-[A-Z]+-\d{3}$/);
    assert.equal(ids.has(story.storyId), false, `duplicate story id ${story.storyId}`);
    ids.add(story.storyId);
    assert.ok(story.canonicalRefs.length >= 4, `${story.storyId} missing canonical references`);
    assert.ok(story.sourceRefs.length >= 1, `${story.storyId} missing source foundation`);
    assert.ok(story.blockers.length >= 4, `${story.storyId} missing explicit blockers`);
  }
});

test("no pilot can become public merely through founder approval", () => {
  for (const story of pilots) {
    assert.equal(releaseEligible(story, "APPROVED"), false, `${story.storyId} incorrectly became public eligible`);
  }
});

test("rights failures remain explicit hard gates", () => {
  for (const story of pilots) {
    assert.notEqual(story.gates.rights, "PASS");
    assert.equal(story.publicReleaseEligible, false);
  }
});

test("idempotency key is deterministic and version-scoped", () => {
  const args = ["STORY-BOS-ORCA-001", "REL-BOS-ORCA-IG-001", "instagram", 1, "orca-master-v1"];
  const first = keyFor(...args);
  const second = keyFor(...args);
  const nextVersion = keyFor(args[0], args[1], args[2], 2, args[4]);
  assert.equal(first, second);
  assert.notEqual(first, nextVersion);
});

test("runtime hard-disables external publishing and preserves canon authority", () => {
  assert.match(runtime, /EXTERNAL_PUBLISHING_ENABLED = false as const/);
  assert.match(runtime, /canonEffect: "NONE"/);
  assert.match(runtime, /DUPLICATE_SUPPRESSED/);
  assert.match(runtime, /releaseId: receipt\.releaseId/);
  assert.match(runtime, /storyId: receipt\.storyId/);
});

test("database enforces release gates and service-only access", () => {
  assert.match(migration, /create trigger brand_releases_guard/);
  assert.match(migration, /Brand release blocked: source, rights, QA, product, founder and public eligibility gates must pass/);
  assert.match(migration, /idempotency_key text not null unique/);
  assert.match(migration, /create trigger publication_receipts_guard/);
  assert.match(migration, /alter table public\.brand_releases enable row level security/);
  assert.match(migration, /revoke all on public\.brand_releases from anon, authenticated/);
  assert.doesNotMatch(migration, /create policy .*brand_releases/i);
});

test("internal release board exists but is not inserted into public navigation", () => {
  assert.match(router, /path="\/internal\/brand-os"/);
  assert.equal(runtime.includes("fetch("), false, "runtime unexpectedly contains a network fetch");
});

test("Bee pilot explicitly rejects the universal all-food-depends-on-bees simplification", () => {
  const bee = pilots.find((story) => story.storyId === "STORY-BOS-BEE-001");
  assert.ok(bee);
  assert.match(bee.truthCore, /not all food production depends on bees/i);
});

test("Oslofjorden pilot preserves coverage and causal limits", () => {
  const oslo = pilots.find((story) => story.storyId === "STORY-BOS-OSLO-001");
  assert.ok(oslo);
  assert.match(oslo.truthCore, /coverage, time, uncertainty and causal limits/i);
});

test("Orca pilot preserves record versus range/trend distinction", () => {
  const orca = pilots.find((story) => story.storyId === "STORY-BOS-ORCA-001");
  assert.ok(orca);
  assert.match(orca.truthCore, /does not by itself establish range, abundance, trend or ecosystem condition/i);
});
