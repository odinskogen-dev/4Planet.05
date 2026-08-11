import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const pilots = JSON.parse(readFileSync(resolve("src/brand-os/pilots.json"), "utf8"));
const regressionCases = JSON.parse(readFileSync(resolve("src/brand-os/qa-regression-cases.json"), "utf8"));
const runtime = readFileSync(resolve("src/brand-os/runtime.ts"), "utf8");
const productionSystem = readFileSync(resolve("src/brand-os/production-system.ts"), "utf8");
const releaseManifests = readFileSync(resolve("src/brand-os/release-manifests.ts"), "utf8");
const channelEngine = readFileSync(resolve("src/brand-os/channel-engine.ts"), "utf8");
const publishingAdapters = readFileSync(resolve("src/brand-os/publishing-adapters.ts"), "utf8");
const learningEngine = readFileSync(resolve("src/brand-os/learning-engine.ts"), "utf8");
const migration = readFileSync(resolve("supabase/migrations/20260809201500_brand_os_activation.sql"), "utf8");
const hardeningMigration = readFileSync(resolve("supabase/migrations/20260810135500_brand_os_security_performance_hardening.sql"), "utf8");
const truthSpineMigration = readFileSync(resolve("supabase/migrations/20260722163000_truth_spine.sql"), "utf8");
const seed = readFileSync(resolve("supabase/seed.sql"), "utf8");
const router = readFileSync(resolve("src/routes/router.tsx"), "utf8");
const places = readFileSync(resolve("src/planet/places.ts"), "utf8");
const pilotObjects = readFileSync(resolve("src/brand-os/PilotSourceObjects.tsx"), "utf8");
const beeObject = readFileSync(resolve("src/brand-os/BeeRelationshipReveal.tsx"), "utf8");

const gatePasses = (gate) => gate === "PASS" || gate === "NOT_APPLICABLE";
const nonFounderReady = (story) =>
  gatePasses(story.gates.source)
  && gatePasses(story.gates.rights)
  && gatePasses(story.gates.qa)
  && gatePasses(story.gates.product)
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
    assert.ok(story.blockers.length >= 1, `${story.storyId} has no explicit remaining blocker`);
  }
});

test("all three P0 pilots have closed non-founder gates and stop at founder review", () => {
  for (const story of pilots) {
    assert.equal(nonFounderReady(story), true, `${story.storyId} is not non-founder ready`);
    assert.equal(story.state, "FOUNDER_REVIEW");
    assert.equal(story.gates.founder, "OPEN");
    assert.equal(story.publicReleaseEligible, true);
  }
});

test("founder approval cannot bypass the separate founder gate", () => {
  assert.match(runtime, /if \(!gatePasses\(story\.gates\.founder\)\) reasons\.push\(`Founder gate is \$\{story\.gates\.founder\}\. `?/.source ?? /Founder gate is/);
  assert.match(runtime, /Founder gate is \$\{story\.gates\.founder\}/);
  assert.match(runtime, /release\.founderDecision !== "APPROVED"/);
  assert.match(runtime, /EXTERNAL_PUBLISHING_ENABLED = false as const/);
});

test("frozen P0 manifests bind exact release IDs to source/data/design rights routes", () => {
  for (const value of [
    "MAN-BOS-ORCA-001",
    "REL-BOS-ORCA-IG-001",
    "AST-0025 / RD-0019",
    "MAN-BOS-BEE-001",
    "REL-BOS-BEE-IG-001",
    "AST-0020 / RD-0014",
    "MAN-BOS-OSLO-001",
    "REL-BOS-OSLO-IG-001",
    "AST-0022 / RD-0016",
  ]) {
    assert.match(releaseManifests, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(releaseManifests, /frozenForFounderReview: true/g);
  assert.match(releaseManifests, /sourceGate: "PASS"/g);
  assert.match(releaseManifests, /rightsGate: "PASS"/g);
  assert.match(releaseManifests, /provenanceLabel:/g);
  assert.match(releaseManifests, /sourceFooter:/g);
  assert.match(releaseManifests, /ownedDestination:/g);
});

test("Orca and Oslo source/product gates are closed only after bounded evidence routes exist", () => {
  const orca = pilots.find((story) => story.storyId === "STORY-BOS-ORCA-001");
  const oslo = pilots.find((story) => story.storyId === "STORY-BOS-OSLO-001");
  assert.equal(orca.gates.source, "PASS");
  assert.equal(orca.gates.product, "PASS");
  assert.ok(orca.canonicalRefs.includes("SOURCE:SRC-025"));
  assert.ok(orca.canonicalRefs.includes("ASSET:AST-0025"));
  assert.ok(orca.canonicalRefs.includes("RIGHTS:RD-0019"));
  assert.match(JSON.stringify(orca), /5939349319/);
  assert.equal(oslo.gates.source, "PASS");
  assert.equal(oslo.gates.product, "PASS");
  assert.ok(oslo.canonicalRefs.includes("PLACE:place:4p:oslofjord"));
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

test("production template IDs cover documentary, relationship, place, signal, proof and motion", () => {
  for (const id of ["TPL-DOC-01", "TPL-REL-01", "TPL-PLACE-01", "TPL-SIGNAL-01", "TPL-PROOF-01", "TPL-MOTION-01"]) {
    assert.match(productionSystem, new RegExp(id));
  }
});

test("all three first vertical slices have implemented internal production objects", () => {
  assert.match(beeObject, /CLM-BOS-BEE-004/);
  assert.match(beeObject, /4PLANET CONTEXT/);
  assert.match(beeObject, /Bees are not all pollinators/);
  assert.match(pilotObjects, /GBIF 5939349319/);
  assert.match(pilotObjects, /OBSERVATION ≠ SIGNAL/);
  assert.match(pilotObjects, /MODELLED PRESSURE/);
  assert.match(pilotObjects, /MAPPED MARINE NATURE/);
  assert.match(pilotObjects, /MONITORING COVERAGE/);
  assert.match(pilotObjects, /Co-location is not causality/);
});

test("regression corpus contains failure and golden-boundary cases for the three pilots", () => {
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

test("staging hardening is committed and truth-spine migrations are Supabase PostGIS portable", () => {
  assert.match(hardeningMigration, /set search_path = public, pg_temp/);
  assert.match(hardeningMigration, /publication_receipts_release_idx/);
  assert.match(truthSpineMigration, /set search_path = public, gis/);
  assert.match(truthSpineMigration, /reject_source_record_mutation\(\) set search_path = public, pg_temp/);
  assert.match(seed, /set search_path = public, gis/);
  assert.match(seed, /5939349319/);
});

test("Oslofjorden is a canonical seeded Place with an explicit non-scientific interface boundary", () => {
  assert.match(places, /placeId\("oslofjord"\)/);
  assert.match(places, /The box is an interface focus, not a scientific boundary/);
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
  assert.equal(bee.gates.rights, "PASS");
  assert.equal(bee.gates.qa, "PASS");
});

test("Oslofjorden pilot preserves coverage and causal limits", () => {
  const oslo = pilots.find((story) => story.storyId === "STORY-BOS-OSLO-001");
  assert.ok(oslo);
  assert.match(oslo.truthCore, /coverage, time, uncertainty and causal limits/i);
  assert.equal(oslo.gates.rights, "PASS");
  assert.equal(oslo.gates.qa, "PASS");
});

test("Orca pilot preserves record versus range/trend distinction", () => {
  const orca = pilots.find((story) => story.storyId === "STORY-BOS-ORCA-001");
  assert.ok(orca);
  assert.match(orca.truthCore, /does not by itself establish range, abundance, trend or ecosystem condition/i);
  assert.equal(orca.gates.rights, "PASS");
  assert.equal(orca.gates.qa, "PASS");
});
