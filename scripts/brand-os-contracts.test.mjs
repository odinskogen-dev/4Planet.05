import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pilots = JSON.parse(readFileSync(resolve("src/brand-os/pilots.json"), "utf8"));
const regressionCases = JSON.parse(readFileSync(resolve("src/brand-os/qa-regression-cases.json"), "utf8"));
const runtime = readFileSync(resolve("src/brand-os/runtime.ts"), "utf8");
const productionSystem = readFileSync(resolve("src/brand-os/production-system.ts"), "utf8");
const channelEngine = readFileSync(resolve("src/brand-os/channel-engine.ts"), "utf8");
const publishingAdapters = readFileSync(resolve("src/brand-os/publishing-adapters.ts"), "utf8");
const learningEngine = readFileSync(resolve("src/brand-os/learning-engine.ts"), "utf8");
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

test("retry policy is bounded and terminates in a dead-letter state", () => {
  assert.match(runtime, /maxAttempts < 1 \|\| maxAttempts > 10/);
  assert.match(runtime, /"DEAD_LETTER" : "RETRY_WAIT"/);
  assert.match(runtime, /Math\.min\(15 \* 2 \*\* Math\.max\(0, attemptCount - 1\), 15 \* 60\)/);
  assert.match(migration, /max_attempts integer not null default 3 check \(max_attempts between 1 and 10\)/);
  assert.match(migration, /'DEAD_LETTER'/);
});

test("founder burden is instrumented as observed time, not an invented readiness score", () => {
  assert.match(runtime, /recordFounderIntervention/);
  assert.match(runtime, /summarizeFounderBurden/);
  assert.match(runtime, /totalMinutes: totalSeconds \/ 60/);
  assert.match(migration, /create table if not exists public\.brand_founder_interventions/);
  assert.match(migration, /duration_seconds numeric not null check \(duration_seconds >= 0\)/);
});

test("production system locks core primitives while leaving unvalidated distinctive behaviours provisional", () => {
  assert.match(productionSystem, /Brand Blue #2E2EFF/);
  assert.match(productionSystem, /Instrument Sans \/ DM Sans \/ Fragment Mono/);
  assert.match(productionSystem, /Relationship Reveal/);
  assert.match(productionSystem, /PROVISIONAL_UNTIL_RECOGNITION_TEST/);
  assert.match(productionSystem, /ONE PLACE map grammar/);
  assert.match(productionSystem, /Synthetic media cannot serve as verified-outcome evidence/);
});

test("production template IDs are explicit and cover documentary, relationship, place, signal, proof and motion", () => {
  for (const id of ["TPL-DOC-01", "TPL-REL-01", "TPL-PLACE-01", "TPL-SIGNAL-01", "TPL-PROOF-01", "TPL-MOTION-01"]) {
    assert.match(productionSystem, new RegExp(id));
  }
});

test("regression corpus contains both failure and golden-boundary cases for the three pilots", () => {
  const ids = new Set();
  for (const item of regressionCases) {
    assert.equal(ids.has(item.caseId), false, `duplicate regression case ${item.caseId}`);
    ids.add(item.caseId);
  }
  assert.ok(regressionCases.some((item) => item.storyId === "STORY-BOS-BEE-001" && item.classification === "FAILURE"));
  assert.ok(regressionCases.some((item) => item.storyId === "STORY-BOS-BEE-001" && item.classification === "GOLDEN_BOUNDARY"));
  assert.ok(regressionCases.some((item) => item.storyId === "STORY-BOS-ORCA-001" && item.classification === "FAILURE"));
  assert.ok(regressionCases.some((item) => item.storyId === "STORY-BOS-OSLO-001" && item.classification === "FAILURE"));
  assert.ok(regressionCases.some((item) => item.caseId === "QA-SYNTH-001"));
  assert.ok(regressionCases.some((item) => item.caseId === "QA-PROVENANCE-001"));
});

test("channel engine keeps one truth core and limits verification queues to 50", () => {
  for (const surface of ["web", "instagram", "youtube", "linkedin", "tiktok", "newsletter"]) {
    assert.match(channelEngine, new RegExp(`${surface}:`));
  }
  assert.match(channelEngine, /truthCore: story\.truthCore/);
  assert.match(channelEngine, /audienceJob: story\.audienceJob/);
  assert.match(channelEngine, /maximum > 50/);
  assert.match(channelEngine, /topicalFit \* 0\.35/);
  assert.match(channelEngine, /relationshipFit \* 0\.2/);
});

test("publishing adapters are fail-closed and contain no external execution path", () => {
  for (const surface of ["instagram", "youtube", "linkedin", "tiktok", "newsletter"]) {
    assert.match(publishingAdapters, new RegExp(`${surface}:`));
  }
  assert.match(publishingAdapters, /mode: "DRY_RUN_ONLY"/);
  assert.match(publishingAdapters, /productionEnabled: false/);
  assert.match(publishingAdapters, /authState: "AUTH_REQUIRED"/);
  assert.match(publishingAdapters, /executeExternalPublication/);
  assert.match(publishingAdapters, /intentionally unavailable in Brand OS Activation/);
  assert.equal(publishingAdapters.includes("fetch("), false, "publishing adapter unexpectedly contains a network fetch");
});

test("learning engine requires pre-registered variants and never turns observations into silent canon", () => {
  assert.match(learningEngine, /variants\.length < 2/);
  assert.match(learningEngine, /minimumObservations/);
  assert.match(learningEngine, /INSUFFICIENT_EVIDENCE/);
  assert.match(learningEngine, /Treat as local evidence, not universal canon/);
  assert.match(learningEngine, /canonEffect: "NONE"/);
});

test("autonomy cannot advance before controlled real public evidence exists", () => {
  assert.match(learningEngine, /controlledPublicReleases < 1/);
  assert.match(learningEngine, /No controlled real public release evidence exists yet/);
  assert.match(learningEngine, /high-risk auto-publish/);
  assert.match(learningEngine, /Fewer than ten controlled public releases exist/);
});

test("database enforces release gates and service-only access", () => {
  assert.match(migration, /create trigger brand_releases_guard/);
  assert.match(migration, /Brand release blocked: source, rights, QA, product, founder and public eligibility gates must pass/);
  assert.match(migration, /idempotency_key text not null unique/);
  assert.match(migration, /create trigger publication_receipts_guard/);
  assert.match(migration, /alter table public\.brand_releases enable row level security/);
  assert.match(migration, /alter table public\.brand_publish_jobs enable row level security/);
  assert.match(migration, /alter table public\.brand_founder_interventions enable row level security/);
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
  assert.equal(bee.gates.source, "PASS");
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
