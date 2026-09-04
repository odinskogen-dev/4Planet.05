import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const requireMarker = (text, marker, file) => {
  if (!text.includes(marker)) throw new Error(`${file}: missing required marker: ${marker}`);
};

const policyPath = 'docs/control/ELITE_OPERATING_DOCTRINE.json';
const policy = JSON.parse(read(policyPath));

if (policy.schema !== '4planet.elite-operating-doctrine.v1') {
  throw new Error(`${policyPath}: unexpected schema ${policy.schema}`);
}
if (policy.active !== true) throw new Error(`${policyPath}: doctrine must be active`);
if (policy.createsParallelAuthority !== false) {
  throw new Error(`${policyPath}: doctrine may not create parallel authority`);
}

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

if (JSON.stringify(policy.mandatorySequence) !== JSON.stringify(requiredSequence)) {
  throw new Error(`${policyPath}: mandatory sequence drift detected`);
}

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
for (const key of mustBeTrue) {
  if (invariants[key] !== true) throw new Error(`${policyPath}: invariant ${key} must remain true`);
}
if (invariants.sourceIsolationBreachTolerance !== 0) {
  throw new Error(`${policyPath}: source isolation breach tolerance must remain zero`);
}
if (invariants.evaluatorLoopMayPromoteCanon !== false || invariants.evaluatorLoopMayPromoteTruthWithoutAuthority !== false) {
  throw new Error(`${policyPath}: evaluator loops may not promote Canon/truth autonomously`);
}

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

console.log('ELITE OPERATING DOCTRINE GATE: PASS');
console.log(`Founder decision: ${policy.founderDecisionDate}`);
console.log(`Mandatory sequence steps: ${policy.mandatorySequence.length}`);
console.log(`Andon conditions: ${policy.andonConditions.length}`);
console.log(`Required material return fields: ${policy.requiredMaterialReturnFields.length}`);
