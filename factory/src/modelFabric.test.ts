import test from "node:test";
import assert from "node:assert/strict";
import {
  combineQualityDecision,
  parseJudgeResult,
  selectModel,
  type ModelCandidate,
} from "./modelFabric";

const candidates: ModelCandidate[] = [
  {
    adapterId: "workers-ai-code",
    provider: "CLOUDFLARE_WORKERS_AI",
    exactModelId: "@cf/example/code",
    roles: ["CODING_WORKER", "PRODUCT_WORKER"],
    enabled: true,
    billingClass: "ZERO_CASH_QUOTA",
    programVersion: "code-v1",
    toolContractVersion: "factory-v1",
  },
  {
    adapterId: "gemini-judge",
    provider: "GOOGLE",
    exactModelId: "gemini-example",
    roles: ["INDEPENDENT_JUDGE"],
    enabled: true,
    billingClass: "PAID_API",
    programVersion: "judge-v1",
    toolContractVersion: "judge-schema-v1",
  },
  {
    adapterId: "workers-ai-judge",
    provider: "CLOUDFLARE_WORKERS_AI",
    exactModelId: "@cf/example/judge",
    roles: ["INDEPENDENT_JUDGE"],
    enabled: true,
    billingClass: "ZERO_CASH_QUOTA",
    programVersion: "judge-v1",
    toolContractVersion: "judge-schema-v1",
  },
];

test("zero-cash routing refuses an otherwise preferred paid adapter and uses only an approved fallback", () => {
  const selected = selectModel({
    role: "INDEPENDENT_JUDGE",
    zeroCashOnly: true,
    preferredAdapterIds: ["gemini-judge"],
    approvedFallbackAdapterIds: ["workers-ai-judge"],
  }, candidates);
  assert.equal(selected.status, "SELECTED");
  if (selected.status === "SELECTED") {
    assert.equal(selected.candidate.adapterId, "workers-ai-judge");
    assert.equal(selected.fallback, true);
  }
});

test("an independent judge cannot use the maker adapter/model", () => {
  const selected = selectModel({
    role: "INDEPENDENT_JUDGE",
    zeroCashOnly: true,
    preferredAdapterIds: ["workers-ai-judge"],
    approvedFallbackAdapterIds: [],
    maker: {
      adapterId: "workers-ai-judge",
      provider: "CLOUDFLARE_WORKERS_AI",
      exactModelId: "@cf/example/judge",
    },
  }, candidates);
  assert.equal(selected.status, "PARK");
  if (selected.status === "PARK") assert.ok(selected.reasons.includes("MAKER_CANNOT_JUDGE"));
});

test("open provider circuit cannot be bypassed by an unapproved model", () => {
  const selected = selectModel({
    role: "CODING_WORKER",
    zeroCashOnly: true,
    preferredAdapterIds: ["workers-ai-code"],
    approvedFallbackAdapterIds: [],
  }, candidates, [{ adapterId: "workers-ai-code", open: true, reason: "QUOTA" }]);
  assert.equal(selected.status, "PARK");
});

test("typed judge parser fails closed on malformed, incomplete or overconfident output", () => {
  assert.throws(() => parseJudgeResult({ decision: "ACCEPT" }), /JUDGE_OUTPUT_INVALID:confidence/);
  assert.throws(() => parseJudgeResult({ decision: "YES", confidence: 1, reasons: ["x"], evidenceRefs: [], limitations: [] }), /decision/);
  assert.throws(() => parseJudgeResult({ decision: "ACCEPT", confidence: 2, reasons: ["x"], evidenceRefs: [], limitations: [] }), /confidence/);
  assert.throws(() => parseJudgeResult({ decision: "ACCEPT", confidence: 1, reasons: [], evidenceRefs: [], limitations: [] }), /reasons_empty/);
});

test("deterministic failure cannot be reasoned around by an ACCEPT judge", () => {
  const judge = parseJudgeResult({
    decision: "ACCEPT",
    confidence: 0.99,
    reasons: ["Looks good"],
    evidenceRefs: ["judge-note"],
    limitations: [],
  });
  const result = combineQualityDecision([
    { gate: "typecheck", passed: true },
    { gate: "security", passed: false },
  ], judge);
  assert.deepEqual(result, { status: "DETERMINISTIC_BLOCK", failedGates: ["security"] });
});
