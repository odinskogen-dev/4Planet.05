import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (relative) => readFileSync(new URL(`../${relative}`, import.meta.url), 'utf8');
const json = (relative) => JSON.parse(read(relative));

const contract = json('docs/control/SYSTEM_CONVERGENCE_CONTRACT.json');
const candidate = json('docs/control/PROJECT_CANDIDATE_AUTHORITY.json');
const liveManifest = json('docs/control/LIVE_PROMOTION_MANIFEST.json');
const lineage = read('docs/control/CODE_LINEAGE_REGISTER.md');
const regressions = read('docs/control/AXE_CONTEXT_REGRESSION_TESTS.md');
const agents = read('AGENTS.md');
const workflow = read('.github/workflows/convergence-gate.yml');

const EXPECTED_ALGORITHM = [
  'QUESTION REQUIREMENTS',
  'DELETE',
  'SIMPLIFY / OPTIMISE',
  'ACCELERATE CYCLE TIME',
  'AUTOMATE',
  'PROVE',
  'LEARN',
];

const EXPECTED_BRAIN_VERBS = [
  'RECALL',
  'ENTITY',
  'CONTEXT PACK',
  'DELTA',
  'SYNTHESIZE',
  'REMEMBER / WRITEBACK',
  'SUPERSEDE / FORGET',
];

test('convergence contract is derived control, never a competing authority', () => {
  assert.equal(contract.status, 'DERIVED_WORKING_CONTROL_NOT_AUTHORITY');
  assert.equal(contract.authority.createsNewAuthority, false);
  assert.equal(contract.authority.brainAuthorityUntilCutover, 'Drive BRAIN / Knowledge OS');
  assert.equal(contract.authority.testHeir, 'king/test');
  assert.equal(contract.authority.livePromotion, 'FOUNDER_GATED');
  assert.deepEqual(contract.operatingArchitecture, [
    'ONE PLANET', 'ONE BRAIN', 'ONE TRUTH SPINE', 'ONE FACTORY', 'ONE TEST KING', 'MANY WORLDS',
  ]);
});

test('delete and simplify precede acceleration and automation', () => {
  assert.deepEqual(contract.executionAlgorithm, EXPECTED_ALGORITHM);
  assert.ok(contract.executionAlgorithm.indexOf('DELETE') < contract.executionAlgorithm.indexOf('AUTOMATE'));
  assert.ok(contract.executionAlgorithm.indexOf('SIMPLIFY / OPTIMISE') < contract.executionAlgorithm.indexOf('AUTOMATE'));
});

test('candidate world has exactly one HEIR and no newest-wins/third-king path', () => {
  assert.equal(candidate.authority_model.test_heir.branch, 'king/test');
  assert.equal(candidate.authority_model.test_heir.role, 'SOLE_HEIR');
  assert.equal(candidate.authority_model.max_registered_heirs_per_product, 1);
  assert.equal(candidate.authority_model.max_registered_sandboxes_per_product, 1);
  assert.equal(candidate.authority_model.newest_wins, false);
  assert.equal(candidate.authority_model.branch_name_is_authority, false);
  assert.equal(candidate.authority_model.new_candidate_classes_allowed, false);
  assert.equal(contract.candidateModel.heir, 'king/test');
  assert.equal(contract.candidateModel.heirCount, 1);
  assert.equal(contract.candidateModel.newestWins, false);
  assert.equal(contract.candidateModel.thirdKingAllowed, false);
  assert.equal(contract.candidateModel.branchDeletionBeforeZeroLossDisposition, false);

  for (const [product, authority] of Object.entries(candidate.products)) {
    assert.equal(authority.heir, 'king/test', `${product} must inherit king/test as HEIR`);
  }

  assert.match(lineage, /king\/test/);
  assert.match(lineage, /sole moving|single.*moving|permanent TEST KING/i);
});

// A historical, specifically authorised CSP hotfix must not make later releases
// automatically authorised. This assertion only recognises the exact 8–9 Oct
// Founder-approved release-control record; it grants no promotion authority.
function assertFounderGatedLiveManifest(manifest) {
  assert.equal(manifest.sourceBranch, 'king/test');
  if (manifest.status === 'NOT_AUTHORISED') {
    assert.equal(manifest.founderDecisionRef, null);
    return;
  }
  assert.equal(manifest.status, 'FOUNDER_ACCEPTED');
  assert.equal(manifest.schemaVersion, 4);
  assert.equal(manifest.boundedRelease, true);
  assert.equal(manifest.releaseKind, 'P0_ID_CLOUDFLARE_CSP_AUTH');
  assert.equal(manifest.hotfixBranch, 'release/p0-id-cloudflare-csp-20261009');
  assert.deepEqual(manifest.hotfixPaths, ['public/_headers']);
  assert.match(manifest.testKingSha, /^[a-f0-9]{40}$/);
  assert.match(manifest.priorLiveSha, /^[a-f0-9]{40}$/);
  assert.equal(manifest.rollbackRef, `main@${manifest.priorLiveSha}`);
  assert.equal(manifest.evidenceRef, 'https://github.com/odinskogen-dev/4Planet.05/pull/427');
  assert.match(manifest.founderDecisionRef, /Founder 2026-10-08/);
  assert.match(manifest.founderDecisionRef, /Founder 2026-10-09/);
  assert.equal(manifest.releaseControlCommit, true);
  // The historical control document did not record a releaseCommitSha. This
  // is NOT a runtime deployment receipt or authorisation for any new PR.
  assert.equal(manifest.releaseCommitSha, null);
}

test('LIVE is fail-closed; only the exact historical bounded Founder CSP approval is recognised', () => {
  assertFounderGatedLiveManifest(liveManifest);
  assert.equal(candidate.safety.no_live_or_main_development_by_this_register, true);
  assert.match(candidate.promotion_contract.live_promotion, /FOUNDER_AUTHORITY_REQUIRED/);
});

test('LIVE manifest rejects forged, widened or retrospectively approved release state', () => {
  const safeNotAuthorised = { ...liveManifest, status: 'NOT_AUTHORISED', founderDecisionRef: null };
  assert.doesNotThrow(() => assertFounderGatedLiveManifest(safeNotAuthorised));
  const changes = [
    { status: 'LIVE' },
    { boundedRelease: false },
    { hotfixPaths: ['public/_headers', 'src/App.tsx'] },
    { hotfixPaths: ['src/App.tsx'] },
    { founderDecisionRef: 'Founder consent assumed unless objection' },
    { founderDecisionRef: null },
    { evidenceRef: 'https://github.com/odinskogen-dev/4Planet.05/pull/512' },
    { releaseKind: 'GENERAL_DEPLOYMENT' },
    { releaseControlCommit: false },
    { rollbackRef: 'main@unknown' },
    { priorLiveSha: 'unknown' },
    { testKingSha: 'unknown' },
    { hotfixBranch: 'main' },
    { releaseCommitSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
  ];
  for (const change of changes) {
    assert.throws(
      () => assertFounderGatedLiveManifest({ ...liveManifest, ...change }),
      undefined,
      `unsafe manifest must fail: ${JSON.stringify(change)}`,
    );
  }
});

test('minimal semantic BRAIN contract is stable and cutover is evidence-gated', () => {
  assert.deepEqual(contract.brainSemanticInterface, EXPECTED_BRAIN_VERBS);
  assert.equal(contract.brainBench.sourceIsolationMaxViolations, 0);
  assert.equal(contract.brainBench.status, 'SPECIFIED_RUNTIME_BENCHMARK_REQUIRED');
  const required = new Set(contract.brainBench.cutoverRequires);
  for (const gate of ['MEASURABLE_SUPERIORITY', 'SECURITY_PROOF', 'PROVENANCE_PROOF', 'RECOVERY_PROOF', 'FOUNDER_APPROVED_CUTOVER']) {
    assert.ok(required.has(gate), `missing cutover gate ${gate}`);
  }
  assert.equal(candidate.safety.superbrain_remains_shadow_until_explicit_founder_cutover, true);
});

test('BrainBench covers the real failure modes and source isolation gates at zero', () => {
  const names = new Set(contract.brainBench.cases.map((item) => item.name));
  for (const name of [
    'KNOW_TO_ASK',
    'RETRIEVAL_PRECISION_RECALL',
    'AUTHORITY_CORRECTNESS',
    'CURRENT_VS_STALE',
    'CRITICAL_MEMORY_OMISSION',
    'ENTITY_RESOLUTION',
    'CONTRADICTION_GAP_UNKNOWN',
    'PROVENANCE_WRITEBACK',
    'CROSS_SESSION_AGENT_CONTINUITY',
    'SOURCE_ISOLATION',
    'CONTEXT_COST_LATENCY',
    'RECOVERY_REPLAY',
  ]) assert.ok(names.has(name), `BrainBench missing ${name}`);
  assert.equal(contract.brainBench.sourceIsolationMaxViolations, 0);
});

test('Factory cannot automate an unsimplified process', () => {
  assert.equal(contract.factoryPreflight.rejectCode, 'AUTOMATION_REJECTED — PROCESS NOT SIMPLIFIED');
  assert.deepEqual(contract.factoryPreflight.gates, [
    'REQUIREMENT_OWNER_REASON_VERIFIED',
    'DELETION_ATTEMPTED',
    'SIMPLIFICATION_ATTEMPTED',
    'EXISTING_PRIMITIVE_REUSE_ASSESSED',
    'CYCLE_TIME_BASELINE_MEASURED',
    'MINIMAL_FEEDBACK_LOOP_IDENTIFIED',
    'AUTOMATION_JUSTIFIED',
    'PROOF_METRIC_DEFINED',
    'ROLLBACK_DEFINED',
    'LEARNING_WRITEBACK_DEFINED',
  ]);
});

test('error-to-immunity and recurrence escalation remain present', () => {
  for (const marker of ['CR-16', 'CR-17', 'CR-18', 'CR-19', 'CR-20', 'CR-21']) {
    assert.match(regressions, new RegExp(marker));
  }
  assert.match(regressions, /INCIDENT → ROOT CAUSE → FAILURE CLASS → CONTAINMENT → HARDEN → REGRESSION → PROPAGATE → WRITEBACK \+ READBACK → IMMUNITY STATE/);
  for (const failureClass of [
    'ADD_BEFORE_DELETE', 'AUTOMATE_BEFORE_SIMPLIFY', 'COMPETING_BRAIN', 'DUPLICATE_FACTORY',
    'UNCONTROLLED_BRANCH_LEADER', 'THIRD_KING', 'STALE_STATE_SELECTION', 'CRITICAL_MEMORY_OMISSION',
    'UNSUPPORTED_WRITEBACK', 'SOURCE_ISOLATION_BREACH', 'MEMORY_ONLY_STRATEGIC_RECOVERY', 'ACTIVITY_AS_PROGRESS',
  ]) assert.ok(contract.errorToImmunity.recurrenceClasses.includes(failureClass));
});

test('existing agent operating contract already requires reduce-before-generate and one HEIR', () => {
  assert.match(agents, /REDUCE BEFORE GENERATE/i);
  assert.match(agents, /DELETE/);
  assert.match(agents, /king\/test/);
  assert.match(agents, /king\/test` is the only moving integrated 4PLANET HEIR line/i);
  assert.match(agents, /ONE HEIR PER PRODUCT/i);
});

test('control-of-control: convergence workflow executes this test', () => {
  assert.match(workflow, /system-convergence-control\.test\.mjs/);
  const required = new Set(contract.controlOfControl.required);
  for (const check of [
    'EXACT_STATE_READBACK',
    'CURRENT_STATE_REV_MATCH',
    'CANDIDATE_AUTHORITY_FAIL_CLOSED',
    'LIVE_MANIFEST_FAIL_CLOSED',
    'ERROR_TO_IMMUNITY_REGRESSIONS_PRESENT',
    'CONVERGENCE_GATE_EXECUTES_THIS_CONTRACT_TEST',
    'SOURCE_ISOLATION_GATE_ZERO',
    'NO_GBRAIN_CUTOVER_BY_ARCHITECTURE_CLAIM',
  ]) assert.ok(required.has(check), `control-of-control missing ${check}`);
});

test('activity volume is explicitly not accepted as progress', () => {
  assert.deepEqual(contract.measurement.activityNotAcceptedAsProgress, [
    'COMMITS', 'DOCUMENTS', 'AGENTS', 'BRANCHES', 'RAW_TASK_COMPLETIONS',
  ]);
});
