import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));
const requireMarker = (text, marker, file) => {
  if (!text.includes(marker)) throw new Error(`${file}: missing required marker: ${marker}`);
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const git = (args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
};

const policyPath = 'docs/control/ELITE_OPERATING_DOCTRINE.json';
const policy = readJson(policyPath);

assert(policy.schema === '4planet.elite-operating-doctrine.v1', `${policyPath}: unexpected schema ${policy.schema}`);
assert(policy.active === true, `${policyPath}: doctrine must be active`);
assert(policy.createsParallelAuthority === false, `${policyPath}: doctrine may not create parallel authority`);

const requiredSequence = [
  'HUMAN_VALUE_FOUNDER_INTENT',
  'PROGRAMME_ADMISSION_WHEN_APPLICABLE',
  'QUESTION_REQUIREMENTS',
  'DELETE',
  'SIMPLIFY_OPTIMISE',
  'SIMPLEST_CAPABLE_EXECUTION',
  'DESIRED_STATE_PROOF_ROLLBACK',
  'EXECUTE',
  'JIDOKA_ANDON',
  'INDEPENDENT_VERIFY_VALIDATE_WHEN_MATERIAL',
  'EVALUATOR_IMPROVEMENT_ONLY_WITH_TRUSTWORTHY_FITNESS',
  'RELIABILITY_VALUE_MEASUREMENT',
  'ERROR_TO_IMMUNITY',
  'WRITEBACK_READBACK',
  'DESIRED_OBSERVED_RECONCILIATION'
];
assert(JSON.stringify(policy.mandatorySequence) === JSON.stringify(requiredSequence), `${policyPath}: mandatory sequence drift detected`);

const invariants = policy.hardInvariants ?? {};
const mustBeTrue = [
  'memoryIsNotAuthority',
  'durableRetrievalAndEnforcementRequired',
  'makerMayNotBeSoleJudgeOnMaterialGate',
  'autonomyMustBeEarnedFromReliability',
  'newParallelBrainFactoryOrTaskSystemForbidden',
  'oneWayDoorRequiresExistingFounderOrProfessionalGate',
  'unresolvedMaterialAbnormalityStopsMutation'
];
for (const key of mustBeTrue) assert(invariants[key] === true, `${policyPath}: invariant ${key} must remain true`);
assert(invariants.sourceIsolationBreachTolerance === 0, `${policyPath}: source isolation breach tolerance must remain zero`);
assert(invariants.evaluatorLoopMayPromoteCanon === false, `${policyPath}: evaluator loops may not promote Canon autonomously`);
assert(invariants.evaluatorLoopMayPromoteTruthWithoutAuthority === false, `${policyPath}: evaluator loops may not promote truth autonomously`);

// Autonomy calibration: synthetic/control passes may never self-promote authority.
const calibration = policy.empiricalCalibration ?? {};
assert(calibration.status === 'ACTIVE_BASELINE_EPOCH_NO_AUTONOMY_EXPANSION', `${policyPath}: empirical baseline epoch must remain active until real evidence promotes it`);
assert(calibration.documentationIsNotProof === true, `${policyPath}: documentation must not count as empirical proof`);
assert(calibration.numericAutonomyThresholds === null, `${policyPath}: numeric autonomy thresholds must remain unset until representative baseline exists`);
assert(calibration.currentAuthorityCeiling === 'EXISTING_BOUNDED_REVERSIBLE_INTERNAL_AUTHORITY_ONLY', `${policyPath}: autonomy authority ceiling widened without evidence`);
assert(calibration.oneWayDoorAuthorityUnchanged === true, `${policyPath}: one-way-door authority may not change through calibration`);
const requiredMetrics = [
  'acceptedFirstPassRate',
  'safeFailClosedInterceptions',
  'materialRegressionRate',
  'regressionRecoveryTime',
  'authorityViolations',
  'sourceIsolationViolations',
  'writebackReadbackFidelity',
  'founderCorrections',
  'founderInterventionTime',
  'acceptedValueThroughput'
];
for (const key of requiredMetrics) assert(key in (calibration.baselineMetrics ?? {}), `${policyPath}: missing baseline metric ${key}`);

// Executable Andon adversarial proof: every known material class must map to STOP.
const andonSet = new Set(policy.andonConditions ?? []);
const adversarial = policy.adversarialAndonCases ?? [];
assert(adversarial.length >= 9, `${policyPath}: expected at least nine adversarial Andon cases`);
let andonPasses = 0;
for (const test of adversarial) {
  assert(test.expected === 'STOP', `${policyPath}: ${test.id} must expect STOP`);
  assert(andonSet.has(test.condition), `${policyPath}: ${test.id} references unknown Andon condition ${test.condition}`);
  const shouldStop = andonSet.has(test.condition) && invariants.unresolvedMaterialAbnormalityStopsMutation === true;
  assert(shouldStop, `${policyPath}: ${test.id} escaped STOP`);
  andonPasses += 1;
}

// Coverage state must expose paper-vs-proof explicitly rather than implying maturity.
const coverage = policy.coverageState ?? {};
for (const key of [
  'HUMAN_GOLD_BACKWARDS',
  'HEILMEIER_PROGRAMME_ADMISSION',
  'QUESTION_DELETE_SIMPLIFY',
  'SIMPLEST_CAPABLE_EXECUTION',
  'TWO_WAY_ONE_WAY_DOOR',
  'JIDOKA_ANDON',
  'AUTONOMY_BUDGET',
  'MAKER_NOT_SOLE_JUDGE',
  'DESIRED_STATE_RECONCILIATION',
  'EVALUATOR_FITNESS_DISCIPLINE',
  'ERROR_TO_IMMUNITY',
  'STANDARDS_FIRST',
  'BRAIN_SEMANTIC_TO_KINETIC',
  'SMALLEST_CAPABLE_TEAM',
  'FOUNDER_BURDEN_REDUCTION'
]) assert(typeof coverage[key] === 'string' && coverage[key].length > 0, `${policyPath}: missing coverage state ${key}`);

// Fitness boundaries: allow bounded optimisation, never autonomous truth/Canon/Impact promotion.
const fitness = policy.fitnessFunctionRegistry ?? {};
const allowedClasses = new Set([
  'SAFE_FOR_AUTOMATIC_EVOLUTION_WITHIN_EXISTING_BRANCH_AUTHORITY',
  'SAFE_FOR_AUTOMATIC_EVOLUTION_ONLY_WITH_NON_REGRESSION_GATES',
  'SAFE_FOR_HUMAN_GATED_COMPETITION',
  'HYPOTHESIS_ONLY',
  'NOT_SUITABLE_FOR_AUTONOMOUS_EVOLUTION'
]);
for (const [name, contract] of Object.entries(fitness)) {
  assert(allowedClasses.has(contract.classification), `${policyPath}: invalid fitness classification for ${name}`);
  assert(contract.fitness, `${policyPath}: missing fitness definition for ${name}`);
  assert(contract.promotionAuthority, `${policyPath}: missing promotion authority for ${name}`);
}
const unsafeEvolution = fitness.CANON_ECOLOGICAL_TRUTH_PARTNER_STATUS_IMPACT_OR_IRREVERSIBLE_STRATEGY;
assert(unsafeEvolution?.classification === 'NOT_SUITABLE_FOR_AUTONOMOUS_EVOLUTION', `${policyPath}: truth/Canon/Impact/irreversible strategy must remain outside autonomous evolution`);

// Standards are decision gates, not fashionable forced migrations.
assert(policy.standardsDecision?.forcedMigrationForbidden === true, `${policyPath}: forced standards migration must remain forbidden`);

// Desired-state authority contract: newest/branch-name/stored SHA cannot silently become authority.
const candidateAuthorityPath = 'docs/control/PROJECT_CANDIDATE_AUTHORITY.json';
const candidateAuthority = readJson(candidateAuthorityPath);
const moving = candidateAuthority.moving_pointer_contract ?? {};
assert(moving.newest_wins === false, `${candidateAuthorityPath}: newest-wins must remain false`);
assert(moving.branch_name_is_authority === false, `${candidateAuthorityPath}: branch name may not become authority`);
assert(moving.stored_branch_sha_is_observation_not_durable_authority === true, `${candidateAuthorityPath}: stored branch SHA must remain an observation`);
assert(moving.current_branch_heads_must_be_resolved_from_fresh_git === true, `${candidateAuthorityPath}: fresh Git resolution must remain mandatory`);
assert(String(moving.stored_observation_mismatch).includes('FAIL_CLOSED'), `${candidateAuthorityPath}: stored pointer mismatch must fail closed/reverify`);
assert(candidateAuthority.authority_model?.test_heir?.branch === 'king/test', `${candidateAuthorityPath}: king/test must remain desired HEIR`);

const doctrine = read('docs/control/ELITE_OPERATING_DOCTRINE.md');
[
  'HUMAN VALUE / FOUNDER INTENT',
  'JIDOKA / ANDON',
  'Autonomy Budget',
  'Maker is not sole judge',
  'Desired-state reconciliation',
  'Memoryless-agent invariant'
].forEach((marker) => requireMarker(doctrine, marker, 'docs/control/ELITE_OPERATING_DOCTRINE.md'));

const agents = read('AGENTS.md');
[
  'ELITE OPERATING DOCTRINE',
  'SIMPLEST CAPABLE EXECUTION',
  'TWO-WAY DOOR',
  'JIDOKA / ANDON',
  'INDEPENDENT VERIFICATION',
  'DESIRED STATE'
].forEach((marker) => requireMarker(agents, marker, 'AGENTS.md'));

const copilot = read('.github/copilot-instructions.md');
[
  'ELITE OPERATING DOCTRINE',
  'SIMPLEST CAPABLE EXECUTION',
  'JIDOKA / ANDON',
  'MAKER',
  'DESIRED STATE'
].forEach((marker) => requireMarker(copilot, marker, '.github/copilot-instructions.md'));

const pr = read('.github/pull_request_template.md');
[
  'HUMAN VALUE / FOUNDER INTENT',
  'EXECUTION CLASS',
  'DOOR CLASS',
  'DESIRED STATE',
  'ANDON / STOP CONDITIONS',
  'INDEPENDENT VERIFICATION',
  'WRITEBACK + READBACK',
  'DESIRED ↔ OBSERVED RECONCILIATION'
].forEach((marker) => requireMarker(pr, marker, '.github/pull_request_template.md'));

const contextRegressions = read('docs/control/AXE_CONTEXT_REGRESSION_TESTS.md');
[
  'CR-15 — New-chat AXE / AXE PL fail-safe',
  'CR-16 — CURRENT_STATE_REV atomic propagation',
  'CR-17 — Moving pointer invalidation',
  'CR-18 — Tool success is not write acceptance',
  'CR-19 — Candidate HEIR ancestry / stale-sandbox fail-close',
  'CR-22 — ELITE doctrine empirical Andon matrix',
  'CR-23 — Autonomy Budget cannot promote itself',
  'CR-24 — Fitness-function boundary',
  'CR-25 — Memoryless-agent conflict test'
].forEach((marker) => requireMarker(contextRegressions, marker, 'docs/control/AXE_CONTEXT_REGRESSION_TESTS.md'));

const headBranch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || git(['branch', '--show-current']) || 'UNKNOWN';
const headSha = git(['rev-parse', 'HEAD']) || 'UNKNOWN';
const heirAuthorityState = headBranch === 'king/test'
  ? 'IN_SYNC'
  : candidateAuthority.authority_model?.test_heir?.branch === 'king/test'
    ? 'DESIRED_HEIR_KNOWN_CURRENT_EXECUTION_NON_HEIR'
    : 'UNKNOWN';

console.log('ELITE OPERATING DOCTRINE GATE: PASS');
console.log(`Founder decision: ${policy.founderDecisionDate}`);
console.log(`Mandatory sequence steps: ${policy.mandatorySequence.length}`);
console.log(`EMPIRICAL ANDON PROOF: PASS ${andonPasses}/${adversarial.length}`);
console.log(`AUTONOMY STATE: ${calibration.status}`);
console.log('AUTONOMY THRESHOLDS: UNSET_PENDING_REAL_BASELINE');
console.log(`FITNESS REGISTRY: PASS ${Object.keys(fitness).length} bounded contracts`);
console.log(`DESIRED-STATE HEIR AUTHORITY: ${heirAuthorityState}`);
console.log(`OBSERVED EXECUTION: ${headBranch}@${headSha}`);
