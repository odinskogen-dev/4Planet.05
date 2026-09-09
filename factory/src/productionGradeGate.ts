export interface ProductionGradeEvidence {
  activeInternalTestProductionProven: boolean;
  transactionInvariantsProven: boolean;
  runLedgerRecoveryProven: boolean;
  idempotencyProven: boolean;
  leaseFencingProven: boolean;
  concurrencySafetyProven: boolean;
  sandboxIsolationProven: boolean;
  sandboxEgressPolicyProven: boolean;
  supplyChainDefenceProven: boolean;
  modelFailureHandlingProven: boolean;
  makerJudgeSeparationProven: boolean;
  promptInjectionDefenceProven: boolean;
  watchdogRecoveryProven: boolean;
  staleEvidenceRejected: boolean;
  resourceBudgetsProven: boolean;
  chaosSuiteProven: boolean;
  multiProjectProductionProven: boolean;
  multiWorkerProductionProven: boolean;
  learningDatasetOperational: boolean;
  noLiveAuthority: boolean;
  noCanonAuthority: boolean;
  noExternalSendAuthority: boolean;
  noPaymentAuthority: boolean;
  exactFactorySha?: string;
  exactTestKingSha?: string;
  evidencedAt?: string;
}

const REQUIRED: Array<[keyof ProductionGradeEvidence, string]> = [
  ["activeInternalTestProductionProven", "LEVEL2_ACTIVE_INTERNAL_PROOF"],
  ["transactionInvariantsProven", "TRANSACTION_INVARIANTS"],
  ["runLedgerRecoveryProven", "RUN_LEDGER_RECOVERY"],
  ["idempotencyProven", "IDEMPOTENCY"],
  ["leaseFencingProven", "LEASE_FENCING"],
  ["concurrencySafetyProven", "CONCURRENCY_SAFETY"],
  ["sandboxIsolationProven", "SANDBOX_ISOLATION"],
  ["sandboxEgressPolicyProven", "SANDBOX_EGRESS"],
  ["supplyChainDefenceProven", "SUPPLY_CHAIN_DEFENCE"],
  ["modelFailureHandlingProven", "MODEL_FAILURE_HANDLING"],
  ["makerJudgeSeparationProven", "MAKER_JUDGE_SEPARATION"],
  ["promptInjectionDefenceProven", "PROMPT_INJECTION_DEFENCE"],
  ["watchdogRecoveryProven", "WATCHDOG_RECOVERY"],
  ["staleEvidenceRejected", "STALE_EVIDENCE_REJECTION"],
  ["resourceBudgetsProven", "RESOURCE_BUDGETS"],
  ["chaosSuiteProven", "CHAOS_SUITE"],
  ["multiProjectProductionProven", "MULTI_PROJECT_PRODUCTION"],
  ["multiWorkerProductionProven", "MULTI_WORKER_PRODUCTION"],
  ["learningDatasetOperational", "LEARNING_DATASET"],
  ["noLiveAuthority", "NO_LIVE_AUTHORITY"],
  ["noCanonAuthority", "NO_CANON_AUTHORITY"],
  ["noExternalSendAuthority", "NO_EXTERNAL_SEND_AUTHORITY"],
  ["noPaymentAuthority", "NO_PAYMENT_AUTHORITY"],
];

const SHA40 = /^[0-9a-f]{40}$/i;
const MAX_EVIDENCE_AGE_MS = 2 * 60 * 60 * 1000;

export function evaluateProductionGrade(evidence: ProductionGradeEvidence, nowMs = Date.now()) {
  const missing = REQUIRED.filter(([key]) => evidence[key] !== true).map(([, name]) => name);
  if (!evidence.exactFactorySha || !SHA40.test(evidence.exactFactorySha)) missing.push("EXACT_FACTORY_SHA");
  if (!evidence.exactTestKingSha || !SHA40.test(evidence.exactTestKingSha)) missing.push("EXACT_TEST_KING_SHA");
  if (!evidence.evidencedAt) {
    missing.push("EVIDENCE_TIMESTAMP");
  } else {
    const timestamp = Date.parse(evidence.evidencedAt);
    if (!Number.isFinite(timestamp)) missing.push("INVALID_EVIDENCE_TIMESTAMP");
    else if (timestamp > nowMs + 5 * 60 * 1000 || nowMs - timestamp > MAX_EVIDENCE_AGE_MS) missing.push("STALE_OR_FUTURE_EVIDENCE");
  }
  return Object.freeze({
    level: missing.length === 0 ? "24_7_PRODUCTION_GRADE_INTERNAL" as const : "NOT_PRODUCTION_GRADE" as const,
    ready: missing.length === 0,
    missing,
  });
}
