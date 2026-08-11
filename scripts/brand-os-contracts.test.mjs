import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path) => readFileSync(resolve(path), "utf8");
const pilots = JSON.parse(read("src/brand-os/pilots.json"));
const regressionCases = JSON.parse(read("src/brand-os/qa-regression-cases.json"));
const runtime = read("src/brand-os/runtime.ts");
const productionSystem = read("src/brand-os/production-system.ts");
const releaseManifests = read("src/brand-os/release-manifests.ts");
const channelEngine = read("src/brand-os/channel-engine.ts");
const publishingAdapters = read("src/brand-os/publishing-adapters.ts");
const learningEngine = read("src/brand-os/learning-engine.ts");
const migration = read("supabase/migrations/20260809201500_brand_os_activation.sql");
const hardeningMigration = read("supabase/migrations/20260810135500_brand_os_security_performance_hardening.sql");
const truthSpineMigration = read("supabase/migrations/20260722163000_truth_spine.sql");
const seed = read("supabase/seed.sql");
const router = read("src/routes/router.tsx");
const places = read("src/planet/places.ts");
const pilotObjects = read("src/brand-os/PilotSourceObjects.tsx");
const beeObject = read("src/brand-os/BeeRelationshipReveal.tsx");

const gatePasses = (gate) => gate === "PASS" || gate === "NOT_APPLICABLE";

test("Brand OS has exactly the three authorised P0 vertical slices", () => {
  assert.deepEqual(pilots.map((story) => story.storyId).sort(), ["STORY-BOS-BEE-001", "STORY-BOS-ORCA-001", "STORY-BOS-OSLO-001"]);
});

test("all P0 non-founder gates are closed and every pilot stops at founder review", () => {
  for (const story of pilots) {
    assert.equal(story.state, "FOUNDER_REVIEW");
    assert.equal(gatePasses(story.gates.source), true);
    assert.equal(gatePasses(story.gates.rights), true);
    assert.equal(gatePasses(story.gates.qa), true);
    assert.equal(gatePasses(story.gates.product), true);
    assert.equal(story.gates.founder, "OPEN");
    assert.equal(story.publicReleaseEligible, true);
    assert.ok(story.canonicalRefs.length >= 5);
    assert.ok(story.blockers.some((item) => /Founder must/i.test(item)));
  }
});

test("founder gate, founder decision and external kill switch are independent hard controls", () => {
  assert.match(runtime, /story\.gates\.founder/);
  assert.match(runtime, /Founder gate is \$\{story\.gates\.founder\}/);
  assert.match(runtime, /release\.founderDecision !== "APPROVED"/);
  assert.match(runtime, /EXTERNAL_PUBLISHING_ENABLED = false as const/);
});

test("frozen P0 manifests bind persistent release IDs to exact rights routes", () => {
  for (const value of [
    "MAN-BOS-ORCA-001", "REL-BOS-ORCA-IG-001", "AST-0025 / RD-0019",
    "MAN-BOS-BEE-001", "REL-BOS-BEE-IG-001", "AST-0020 / RD-0014",
    "MAN-BOS-OSLO-001", "REL-BOS-OSLO-IG-001", "AST-0022 / RD-0016",
  ]) assert.ok(releaseManifests.includes(value), `missing ${value}`);
  for (const field of ["altText:", "provenanceLabel:", "sourceFooter:", "rightsRoute:", "limitation:", "ownedDestination:", "channelJob:"]) assert.ok(releaseManifests.includes(field), `missing manifest field ${field}`);
  assert.ok((releaseManifests.match(/frozenForFounderReview: true/g) ?? []).length >= 3);
  assert.ok((releaseManifests.match(/sourceGate: "PASS"/g) ?? []).length >= 3);
  assert.ok((releaseManifests.match(/rightsGate: "PASS"/g) ?? []).length >= 3);
});

test("Orca source-first route preserves exact record and Observation ≠ Signal", () => {
  const orca = pilots.find((story) => story.storyId === "STORY-BOS-ORCA-001");
  assert.ok(orca.canonicalRefs.includes("SOURCE:SRC-025"));
  assert.ok(orca.canonicalRefs.includes("ASSET:AST-0025"));
  assert.ok(orca.canonicalRefs.includes("RIGHTS:RD-0019"));
  assert.match(JSON.stringify(orca), /5939349319/);
  assert.match(orca.truthCore, /does not by itself establish range, abundance, trend or ecosystem condition/i);
  assert.match(pilotObjects, /OBSERVATION ≠ SIGNAL/);
});

test("Bee source/data/design route preserves source versus context boundaries", () => {
  const bee = pilots.find((story) => story.storyId === "STORY-BOS-BEE-001");
  assert.ok(bee.canonicalRefs.includes("RIGHTS:RD-0014"));
  assert.match(bee.truthCore, /not all food production depends on bees/i);
  assert.match(beeObject, /4PLANET CONTEXT/);
  assert.match(beeObject, /Bees are not all pollinators/);
});

test("Oslofjorden route preserves three distinct evidence classes and canonical Place", () => {
  const oslo = pilots.find((story) => story.storyId === "STORY-BOS-OSLO-001");
  assert.ok(oslo.canonicalRefs.includes("RIGHTS:RD-0016"));
  assert.ok(oslo.canonicalRefs.includes("PLACE:place:4p:oslofjord"));
  assert.match(oslo.truthCore, /coverage, time, uncertainty and causal limits/i);
  assert.match(pilotObjects, /MODELLED PRESSURE/);
  assert.match(pilotObjects, /MAPPED MARINE NATURE/);
  assert.match(pilotObjects, /MONITORING COVERAGE/);
  assert.match(pilotObjects, /Co-location is not causality/);
  assert.match(places, /placeId\("oslofjord"\)/);
});

test("regression corpus retains failure and golden-boundary cases", () => {
  const ids = new Set();
  for (const item of regressionCases) {
    assert.equal(ids.has(item.caseId), false, `duplicate regression case ${item.caseId}`);
    ids.add(item.caseId);
  }
  for (const storyId of ["STORY-BOS-BEE-001", "STORY-BOS-ORCA-001", "STORY-BOS-OSLO-001"]) assert.ok(regressionCases.some((item) => item.storyId === storyId && item.classification === "FAILURE"));
  assert.ok(regressionCases.some((item) => item.storyId === "STORY-BOS-BEE-001" && item.classification === "GOLDEN_BOUNDARY"));
  assert.ok(regressionCases.some((item) => item.caseId === "QA-SYNTH-001"));
  assert.ok(regressionCases.some((item) => item.caseId === "QA-PROVENANCE-001"));
});

test("production system retains truth classes, templates and accessibility/limitation gates", () => {
  for (const id of ["TPL-DOC-01", "TPL-REL-01", "TPL-PLACE-01", "TPL-SIGNAL-01", "TPL-PROOF-01", "TPL-MOTION-01"]) assert.match(productionSystem, new RegExp(id));
  assert.match(productionSystem, /Accessible alt text is required/);
  assert.match(productionSystem, /coverage or limitation statement is required/);
  assert.match(productionSystem, /Synthetic media cannot serve as verified-outcome evidence/);
  assert.match(productionSystem, /PROVISIONAL_UNTIL_RECOGNITION_TEST/);
});

test("publishing is idempotent, bounded-retry and fail-closed", () => {
  assert.match(runtime, /DUPLICATE_SUPPRESSED/);
  assert.match(runtime, /maxAttempts < 1 \|\| maxAttempts > 10/);
  assert.match(runtime, /"DEAD_LETTER" : "RETRY_WAIT"/);
  for (const surface of ["instagram", "youtube", "linkedin", "tiktok", "newsletter"]) assert.match(publishingAdapters, new RegExp(`${surface}:`));
  assert.match(publishingAdapters, /mode: "DRY_RUN_ONLY"/);
  assert.match(publishingAdapters, /productionEnabled: false/);
  assert.match(publishingAdapters, /authState: "AUTH_REQUIRED"/);
  assert.equal(publishingAdapters.includes("fetch("), false);
});

test("channel and learning engines cannot mutate truth or scale autonomy from weak evidence", () => {
  assert.match(channelEngine, /truthCore: story\.truthCore/);
  assert.match(channelEngine, /maximum > 50/);
  assert.match(learningEngine, /minimumObservations/);
  assert.match(learningEngine, /INSUFFICIENT_EVIDENCE/);
  assert.match(learningEngine, /canonEffect: "NONE"/);
  assert.match(learningEngine, /controlledPublicReleases < 1/);
  assert.match(learningEngine, /No controlled real public release evidence exists yet/);
});

test("founder burden uses observed seconds and controlled persistence", () => {
  assert.match(runtime, /recordFounderIntervention/);
  assert.match(runtime, /summarizeFounderBurden/);
  assert.match(runtime, /totalMinutes: totalSeconds \/ 60/);
  assert.match(migration, /create table if not exists public\.brand_founder_interventions/);
});

test("database layer enforces all release gates and service-only access", () => {
  assert.match(migration, /create trigger brand_releases_guard/);
  assert.match(migration, /source, rights, QA, product, founder and public eligibility gates must pass/);
  assert.match(migration, /idempotency_key text not null unique/);
  assert.match(migration, /create trigger publication_receipts_guard/);
  assert.match(migration, /revoke all on public\.brand_releases from anon, authenticated/);
  assert.doesNotMatch(migration, /create policy .*brand_releases/i);
});

test("staging hardening and truth-spine portability remain committed", () => {
  assert.match(hardeningMigration, /set search_path = public, pg_temp/);
  assert.match(hardeningMigration, /publication_receipts_release_idx/);
  assert.match(truthSpineMigration, /set search_path = public, gis/);
  assert.match(seed, /set search_path = public, gis/);
  assert.match(seed, /5939349319/);
});

test("internal founder board exists without a public navigation publication path", () => {
  assert.match(router, /path="\/internal\/brand-os"/);
  assert.equal(runtime.includes("fetch("), false);
});
