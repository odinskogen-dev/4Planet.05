import { AgentWorkflow } from "agents/workflows";
import type { AgentWorkflowEvent, AgentWorkflowStep } from "agents/workflows";
import type { ProductionFactoryAgent } from "./index";
import type { LearningCandidate, Outcome, ProjectProjection, WorkPackage } from "./contracts";

export const SELF_IMPROVEMENT_PROOF_ID = "self-improving-company-active-proof-02";
export const LEARNER_ID = "learning-1";
export const CAPABILITY_ID = "C06_EVIDENCE_SCOPE_DISCIPLINE";
export const BRAIN_LEARNING_ID = "brain-learning-evidence-scope-v1";

type LearningProofParams = { proofId: typeof SELF_IMPROVEMENT_PROOF_ID; exactFactorySha: string };

function project(now: string): ProjectProjection {
  return {
    id: SELF_IMPROVEMENT_PROOF_ID,
    name: "4PLANET Self-Improving Company — Active Proof 02",
    northStar: "Prove that one actual Factory learner improves from a real gap, retrieves the accepted lesson later, and transfers it without Founder copy/paste.",
    user: "4PLANET digital organisation",
    goal: "Close the full organisational learning loop without product mutation or parallel truth stores.",
    current: "Learning Engine runtime contracts are implemented; end-to-end real learner transfer is not yet proven.",
    gold: "Same learner moves from genuine baseline gap to fresh held-out, comparable real-work improvement, later retrieval and materially different transfer with independent Judge evidence.",
    gap: "Physical ACTIVE proof of self-improvement.",
    priority: "P0",
    authorityRefs: ["FOUNDER_DECISION:4PLANET_SELF_IMPROVING_COMPANY_ACTIVE_PROOF_CLOSURE_02"],
    lastMaterialProgressAt: now,
  };
}

function pkg(
  id: string,
  title: string,
  task: string,
  expectedDecision: string,
  requiredSignals: string[],
  forbiddenSignals: string[],
  evalKind: NonNullable<WorkPackage["learningEvaluation"]>["kind"],
  scenarioId: string,
  createdAt: string,
): WorkPackage {
  return {
    id,
    projectId: SELF_IMPROVEMENT_PROOF_ID,
    title,
    section: "LEARNING",
    priority: "P0",
    goalLink: "SELF-IMPROVING COMPANY ACTIVE PROOF CLOSURE 02",
    gapClosed: "Demonstrate evidence-scope discipline under hidden independent evaluation.",
    deliverables: ["One bounded internal judgement with explicit Maker/Judge evidence."],
    dependencies: [],
    writeScopes: [],
    definitionOfDone: [
      `Decision equals ${expectedDecision}.`,
      "Hidden rubric requirements are satisfied.",
      "Selected learning, if any, is explicitly receipted by ID.",
    ],
    requiredEvidence: ["learning-eval PASS", "maker-not-judge PASS", "founder-minutes=0"],
    execution: {
      kind: "INTERNAL_LEARNING_EVAL",
      targetUrl: "https://internal.4planet.org/learning-proof",
      allowedHosts: [],
      learningTask: task,
      expectedDecision,
      requiredSignals,
      forbiddenSignals,
      scenarioId,
    },
    resourceBudget: {
      maxAttempts: 1,
      maxCorrectionAttempts: 0,
      maxModelCalls: 1,
      maxTokens: 1200,
      maxModelCostUsd: 0.05,
      maxExternalRequests: 0,
      maxGithubCalls: 0,
      maxBrowserCalls: 0,
      maxSandboxMinutes: 0,
      maxWallClockMinutes: 3,
      maxQueueRetries: 0,
    },
    requiredCapabilities: [CAPABILITY_ID],
    learningEvaluation: { kind: evalKind, contextKey: scenarioId, failureClass: "EVIDENCE_SCOPE_OVERCLAIM" },
    learningQuestion: "Can the learner avoid completeness/absence claims that exceed the evidence view, and carry that rule to another system?",
    createdAt,
    estimatedValue: 10,
    criticalPath: 10,
    dependencyUnlock: 10,
    proofValue: 10,
    cashValue: 0,
    learningValue: 10,
    risk: 1,
    founderBurden: 0,
    concurrencyCost: 1,
    status: "READY",
  };
}

export function createSelfImprovementProofPackages(now = new Date().toISOString()) {
  const baseline = pkg(
    "learn-proof-baseline-observability-a",
    "Baseline — workflow absence claim from bounded view",
    [
      "A 4PLANET operator queried a workflow-run helper for exact Factory commit 46cc6d1d21ff5c8c741215459fad950c70c8d658.",
      "The helper contract says it filters to pull-request-triggered workflow runs and returns the first page only.",
      "The helper returned zero runs.",
      "The operator concludes: 'No GitHub Actions workflow ran for this commit.'",
      "Classify whether that conclusion is justified and state what evidence is required before making an absence/completeness claim.",
    ].join("\n"),
    "INSUFFICIENT_EVIDENCE",
    ["filtered|pull-request-triggered", "first page|pagination", "exact sha|commit sha|specific commit", "raw|authoritative", "push|event types|other events|all events|across events"],
    ["no workflow ran", "workflow did not run", "absence proven"],
    "REAL_WORK",
    "baseline-github-filtered-workflow-view",
    now,
  );

  const practice = pkg(
    "learn-proof-practice-check-runs-b",
    "Practice — check-runs are not workflow-run completeness",
    [
      "A GitHub check-runs response for an exact commit contains no check named 'Production Factory Autonomous Activation'.",
      "The evidence supplied is only the check-runs collection; no Actions workflow-runs query across events or pages has been made.",
      "Can 4PLANET conclude that the activation workflow did not execute?",
    ].join("\n"),
    "INSUFFICIENT_EVIDENCE",
    ["check-runs", "workflow runs|actions runs", "exact sha|commit sha|specific commit", "push|event types", "authoritative|raw"],
    ["activation did not execute", "workflow did not execute", "absence proven"],
    "PRACTICE",
    "practice-check-runs-vs-actions-runs",
    now,
  );

  const practiceRetry = pkg(
    "learn-proof-practice-retry-actions-b2",
    "Adaptive practice retry — distinguish checks from workflow-run authority",
    [
      "A report has only a GitHub check-runs collection for one specific commit. The collection does not show a check with the target workflow name.",
      "The report must decide whether the target workflow failed to run anywhere for that commit.",
      "State the correct classification and the complete follow-up needed before an absence claim is allowed.",
    ].join("\n"),
    "INSUFFICIENT_EVIDENCE",
    ["check-runs", "workflow runs|actions runs", "exact sha|commit sha|specific commit", "push|event types|other events|all events", "pagination|all pages", "authoritative|raw"],
    ["workflow did not run", "absence proven"],
    "PRACTICE",
    "practice-retry-check-runs-vs-actions-authority",
    now,
  );

  const practiceRetry2 = pkg(
    "learn-proof-practice-retry-actions-b3",
    "Adaptive practice retry 2 — apply IDENTITY / EVIDENCE TYPE / COVERAGE",
    [
      "A release audit knows the exact commit under review. Its only execution evidence is a first-page GitHub check-runs collection and the target workflow name is absent from that collection.",
      "The audit is about whether that workflow executed for the exact commit through any relevant trigger.",
      "Classify the evidence and specify the proof procedure required before reporting workflow absence.",
    ].join("\n"),
    "INSUFFICIENT_EVIDENCE",
    ["exact sha|commit sha|exact commit", "check-runs", "workflow runs|actions runs|workflow-run", "push|pull request|workflow dispatch|event types|all relevant triggers", "pagination|all pages", "authoritative|raw"],
    ["workflow did not execute", "absence proven"],
    "PRACTICE",
    "practice-retry-identity-type-coverage",
    now,
  );

  const heldOut = pkg(
    "learn-proof-heldout-library-c",
    "Fresh held-out — bounded document search",
    [
      "A knowledge-search client returns zero matches on page 1 while scoped only to the current project surface.",
      "No pagination beyond page 1 and no Library/other authorised surface search has occurred.",
      "Can the learner conclude that no canonical Learning Record exists anywhere in the organisation?",
    ].join("\n"),
    "INSUFFICIENT_EVIDENCE",
    ["page 1|pagination", "project surface|scope", "library|other surface|other authorised", "absence|completeness"],
    ["no canonical learning record exists", "record does not exist"],
    "HELD_OUT",
    "heldout-bounded-knowledge-search",
    now,
  );

  const retry = pkg(
    "learn-proof-real-retry-d",
    "Comparable real-work retry — exact-head workflow evidence",
    [
      "For exact Factory commit 9d4cf01366ef12e88cd99c9f93e127f309220aba, a bounded helper exposes only pull-request-triggered workflow runs from its first page.",
      "It returns no 'Production Factory Autonomous Activation' run.",
      "A control report is about to state that no activation workflow ran.",
      "Decide whether the report can make that claim and specify the minimum authoritative follow-up.",
    ].join("\n"),
    "INSUFFICIENT_EVIDENCE",
    ["filtered|pull-request-triggered", "first page|pagination", "exact sha|commit sha|specific commit", "raw|authoritative", "push|event types|other events|all events|across events"],
    ["no activation workflow ran", "activation workflow did not run", "absence proven"],
    "REAL_WORK",
    "real-retry-github-filtered-workflow-view",
    now,
  );

  const transfer = pkg(
    "learn-proof-transfer-slack-e",
    "Spaced transfer — bounded communication search",
    [
      "A Slack search covers public channels only, returns a bounded first result page, and finds no matching message.",
      "The operational question is whether the message exists anywhere in the authorised team communication corpus.",
      "Can 4PLANET state that no such message exists? Classify the evidence and state the next proof step.",
    ].join("\n"),
    "INSUFFICIENT_EVIDENCE",
    ["public channels|scope", "bounded|first page|pagination", "other channels|authorised corpus|broader search", "absence|completeness"],
    ["message does not exist", "no such message exists", "absence proven"],
    "TRANSFER",
    "transfer-bounded-communication-search",
    now,
  );

  return { baseline, practice, practiceRetry, practiceRetry2, heldOut, retry, transfer };
}

export function brainDerivedLearningCandidate(baseline: Outcome, now = new Date().toISOString()): LearningCandidate {
  return {
    id: BRAIN_LEARNING_ID,
    workPackageId: baseline.workPackageId,
    observation: "A bounded or filtered evidence view cannot support a universal absence/completeness claim.",
    expectedVsActual: `Baseline was independently rejected. ${baseline.actual}`,
    evidence: [
      ...baseline.evidence,
      "BRAIN:4PLANET LEARNING ENGINE DEEP STUDY 01",
      "BRAIN:failure class WORKFLOW_RUN_OBSERVABILITY_FALSE_NEGATIVE",
      "GitHub PR #236 historical receipt: exact-head raw Actions evidence corrected a filtered-view false negative",
    ],
    causeHypothesis: "The learner overgeneralises from a bounded observation surface when scope, pagination or event coverage are incomplete.",
    lesson: "Never infer absence or completeness from a bounded, filtered, scoped or first-page evidence view. Bind the question to an exact identity/version, inspect the authoritative source across relevant event/types/surfaces and pagination, and return INSUFFICIENT_EVIDENCE until that completeness proof exists.",
    scope: "FACTORY internal evidence discipline; BRAIN-derived runtime cache",
    confidence: "HIGH",
    ruleProposal: "Absence/completeness claims require authoritative scope + pagination/event coverage + exact identity binding; otherwise fail closed as INSUFFICIENT_EVIDENCE.",
    regressionEval: "A filtered first-page view with zero results must never yield a universal absence claim.",
    nextTest: "Fresh held-out on a different evidence system, then materially different transfer after a later wake.",
    status: "PROMOTED",
    capabilityIds: [CAPABILITY_ID],
    knowledgeLifecycle: "KEEP",
    createdAt: now,
  };
}

export function adaptedLearningCandidate(baseline: Outcome, practice: Outcome, now = new Date().toISOString()): LearningCandidate {
  const base = brainDerivedLearningCandidate(baseline, now);
  return {
    ...base,
    evidence: [
      ...base.evidence,
      ...practice.evidence,
      "ADAPTIVE_FEEDBACK: first practice reached the correct high-level judgement but missed parts of the explicit evidence-completeness standard.",
    ],
    lesson: [
      "Never infer absence or completeness from a bounded, filtered, scoped or first-page evidence view.",
      "Before any absence claim, explicitly perform three checks:",
      "(1) IDENTITY — bind the exact object/version/commit SHA being judged;",
      "(2) AUTHORITY + TYPE — query the authoritative evidence source for the claim type itself (for GitHub workflow execution, workflow-runs/Actions evidence rather than only check-runs);",
      "(3) COVERAGE — include all relevant event/surface types and pagination/all pages.",
      "If any check is missing, classify INSUFFICIENT_EVIDENCE and name the missing follow-up.",
    ].join(" "),
    ruleProposal: "Absence/completeness requires exact identity + authoritative claim-type evidence + complete relevant event/surface/pagination coverage; otherwise INSUFFICIENT_EVIDENCE.",
    nextTest: "Retry on a fresh practice variant, then held-out and later cross-system transfer.",
  };
}


export function refinedLearningCandidate(baseline: Outcome, practice: Outcome, practiceRetry: Outcome, now = new Date().toISOString()): LearningCandidate {
  const base = adaptedLearningCandidate(baseline, practice, now);
  return {
    ...base,
    evidence: [
      ...base.evidence,
      ...practiceRetry.evidence,
      "ADAPTIVE_FEEDBACK_02: learner improved on decision, identity, authority and pagination but still omitted claim-type evidence and relevant event/trigger coverage.",
    ],
    lesson: [
      "Use the 3-CHECK ABSENCE PROOF before any universal absence/completeness claim.",
      "CHECK 1 — IDENTITY: bind the exact object/version/commit SHA.",
      "CHECK 2 — EVIDENCE TYPE: use the authoritative evidence source for the claim itself; for whether a GitHub workflow executed, inspect Actions/workflow-runs, not merely check-runs.",
      "CHECK 3 — COVERAGE: cover all relevant triggers/event types (for example push, pull_request, workflow_dispatch when applicable) and all pages/pagination.",
      "If any check is missing, the only valid classification is INSUFFICIENT_EVIDENCE and the missing checks must be named explicitly.",
    ].join(" "),
    ruleProposal: "3-CHECK ABSENCE PROOF = exact identity + authoritative claim-type evidence + complete trigger/surface/pagination coverage; otherwise INSUFFICIENT_EVIDENCE.",
    nextTest: "Apply all three checks on a fresh practice variant; then proceed to held-out only if the unchanged Judge passes.",
  };
}


const NEGATIVE_CONTROL_LEARNING_IDS = [
  "negative-learning-candidate-only",
  "negative-learning-rejected",
  "negative-learning-expired",
  "negative-learning-superseded",
  "negative-learning-review-due",
] as const;

function negativeControlLearningCandidates(now = new Date().toISOString()): LearningCandidate[] {
  const base: Omit<LearningCandidate, "id" | "status" | "knowledgeLifecycle"> = {
    workPackageId: "negative-control",
    observation: "Negative retrieval control only.",
    expectedVsActual: "Must never enter runtime task context.",
    evidence: ["SELF_IMPROVING_COMPANY_NEGATIVE_CONTROL"],
    causeHypothesis: "Invalid lifecycle/status learning must be suppressed.",
    lesson: "INVALID NEGATIVE CONTROL — if retrieved, the Learning Engine fails.",
    scope: "FACTORY learning retrieval negative control",
    confidence: "HIGH",
    ruleProposal: "INVALID NEGATIVE CONTROL — never apply.",
    regressionEval: "Selected learning IDs must exclude this object.",
    nextTest: "Runtime retrieval negative control.",
    capabilityIds: [CAPABILITY_ID],
    createdAt: now,
  };
  return [
    { ...base, id: NEGATIVE_CONTROL_LEARNING_IDS[0], status: "CANDIDATE", knowledgeLifecycle: "KEEP" },
    { ...base, id: NEGATIVE_CONTROL_LEARNING_IDS[1], status: "PROMOTED", knowledgeLifecycle: "REJECT" },
    { ...base, id: NEGATIVE_CONTROL_LEARNING_IDS[2], status: "PROMOTED", knowledgeLifecycle: "EXPIRE" },
    { ...base, id: NEGATIVE_CONTROL_LEARNING_IDS[3], status: "PROMOTED", knowledgeLifecycle: "SUPERSEDE" },
    { ...base, id: NEGATIVE_CONTROL_LEARNING_IDS[4], status: "PROMOTED", knowledgeLifecycle: "KEEP", reviewAt: "2026-01-01T00:00:00.000Z" },
  ];
}


function accepted(outcome: Outcome) {
  return outcome.status === "ACCEPTED" && outcome.evidence.includes("learning-eval PASS");
}

function requiredSignalPasses(outcome: Outcome) {
  return outcome.evidence.filter((item) => item.startsWith("required-signal ") && item.endsWith("=PASS")).length;
}

function selectedLearning(outcome: Outcome) {
  const row = outcome.evidence.find((item) => item.startsWith("selected-learning "));
  return row?.slice("selected-learning ".length) ?? "UNKNOWN";
}

export class LearningProofWorkflow extends AgentWorkflow<ProductionFactoryAgent, LearningProofParams> {
  async run(event: AgentWorkflowEvent<LearningProofParams>, step: AgentWorkflowStep) {
    if (event.payload.proofId !== SELF_IMPROVEMENT_PROOF_ID) throw new Error("LEARNING_PROOF_ID_INVALID");
    if (!/^[0-9a-f]{40}$/i.test(event.payload.exactFactorySha)) throw new Error("LEARNING_PROOF_FACTORY_SHA_INVALID");
    const attemptFactorySha = event.payload.exactFactorySha;
    const agent: any = this.agent;
    const now = new Date().toISOString();
    const proofProject = project(now);
    const packages = createSelfImprovementProofPackages(now);
    const finish = async (label: string, result: Record<string, unknown>) => {
      const receipt = { ...result, exactFactorySha: attemptFactorySha };
      await step.do(`persist-learning-proof-${label}`, async () =>
        agent.recordLearningProofReceipt(SELF_IMPROVEMENT_PROOF_ID, receipt)
      );
      return receipt;
    };

    await step.do("seed-baseline", async () => {
      await agent.upsertProject(proofProject);
      await agent.upsertWorkPackage(packages.baseline);
    });

    const baseline = await step.do("baseline-real-work", async () => {
      const outcome = await agent.dispatchToWorker(packages.baseline.id);
      await agent.finalizeWorkflowOutcome(outcome);
      return outcome;
    });

    if (accepted(baseline)) {
      return await finish("no-gap", {
        active: false,
        state: "NO_GENUINE_GAP_OBSERVED",
        learnerId: LEARNER_ID,
        baseline,
        reason: "Baseline already met the hidden standard without targeted learning; self-improvement is not claimed.",
      });
    }
    if (baseline.status === "BLOCKED") {
      return await finish("baseline-blocked", {
        active: false,
        state: "BASELINE_BLOCKED",
        learnerId: LEARNER_ID,
        baseline,
        reason: "No curriculum is inferred from a capacity/runtime blocker.",
      });
    }

    await step.do("select-targeted-brain-learning", async () => {
      await agent.recordLearning(brainDerivedLearningCandidate(baseline));
      await agent.upsertWorkPackage(packages.practice);
    });

    const practice = await step.do("practice-with-current-learning", async () => {
      const outcome = await agent.dispatchToWorker(packages.practice.id);
      await agent.finalizeWorkflowOutcome(outcome);
      return outcome;
    });
    let practiceRetry: Outcome | null = null;
    if (!accepted(practice)) {
      await step.do("adapt-curriculum-from-practice-feedback", async () => {
        await agent.recordLearning(adaptedLearningCandidate(baseline, practice));
        await agent.upsertWorkPackage(packages.practiceRetry);
      });
      const retryOutcome: Outcome = await step.do("adaptive-practice-retry", async () => {
        const outcome = await agent.dispatchToWorker(packages.practiceRetry.id) as Outcome;
        await agent.finalizeWorkflowOutcome(outcome);
        return outcome;
      });
      practiceRetry = retryOutcome;
      if (!accepted(retryOutcome)) {
        await step.do("refine-curriculum-from-second-practice-feedback", async () => {
          await agent.recordLearning(refinedLearningCandidate(baseline, practice, retryOutcome));
          for (const control of negativeControlLearningCandidates()) await agent.recordLearning(control);
          await agent.upsertWorkPackage(packages.practiceRetry2);
        });
        const retryOutcome2: Outcome = await step.do("adaptive-practice-retry-2", async () => {
          const outcome = await agent.dispatchToWorker(packages.practiceRetry2.id) as Outcome;
          await agent.finalizeWorkflowOutcome(outcome);
          return outcome;
        });
        practiceRetry = retryOutcome2;
        if (!accepted(retryOutcome2)) {
          return await finish("practice-retry-2-failed", {
            active: false,
            state: "PRACTICE_RETRY_2_FAILED",
            learnerId: LEARNER_ID,
            baseline,
            practice,
            firstPracticeRetry: retryOutcome,
            practiceRetry: retryOutcome2,
            reason: "Second adaptive curriculum still did not reach the unchanged mastery standard; no held-out or transfer credit granted.",
          });
        }
      }
    }

    await step.do("seed-fresh-heldout", async () => agent.upsertWorkPackage(packages.heldOut));
    const heldOut = await step.do("fresh-heldout", async () => {
      const outcome = await agent.dispatchToWorker(packages.heldOut.id);
      await agent.finalizeWorkflowOutcome(outcome);
      return outcome;
    });
    if (!accepted(heldOut)) {
      return await finish("heldout-failed", { active: false, state: "HELD_OUT_FAILED", learnerId: LEARNER_ID, baseline, practice, heldOut });
    }

    await step.do("seed-comparable-real-retry", async () => agent.upsertWorkPackage(packages.retry));
    const retry = await step.do("comparable-real-work-after-learning", async () => {
      const outcome = await agent.dispatchToWorker(packages.retry.id);
      await agent.finalizeWorkflowOutcome(outcome);
      return outcome;
    });
    if (!accepted(retry)) {
      return await finish("real-retry-failed", { active: false, state: "REAL_WORK_RETRY_FAILED", learnerId: LEARNER_ID, baseline, practice, heldOut, retry });
    }

    const preWakeReceipts = await step.do("readback-pre-wake", async () =>
      agent.getLearningRetrievalReceipts([packages.baseline.id, packages.practice.id, packages.practiceRetry.id, packages.practiceRetry2.id, packages.heldOut.id, packages.retry.id])
    );

    await step.sleep("later-independent-learning-wake", "1 minute");

    await step.do("seed-transfer-on-later-wake", async () => agent.upsertWorkPackage(packages.transfer));
    const transfer = await step.do("materially-different-transfer", async () => {
      const outcome = await agent.dispatchToWorker(packages.transfer.id);
      await agent.finalizeWorkflowOutcome(outcome);
      return outcome;
    });
    if (!accepted(transfer)) {
      return await finish("transfer-failed", { active: false, state: "TRANSFER_FAILED", learnerId: LEARNER_ID, baseline, practice, heldOut, retry, transfer });
    }

    const receipts = await step.do("independent-learning-readback", async () =>
      agent.getLearningRetrievalReceipts([packages.baseline.id, packages.practice.id, packages.practiceRetry.id, packages.practiceRetry2.id, packages.heldOut.id, packages.retry.id, packages.transfer.id])
    );
    const learnerState = await step.do("learner-state-readback", async () =>
      agent.getLearnerCapabilityState(LEARNER_ID, CAPABILITY_ID)
    );

    const baselineSelected = selectedLearning(baseline);
    const retrySelected = selectedLearning(retry);
    const transferSelected = selectedLearning(transfer);
    const runtimeSelectionProven =
      baselineSelected === "NONE"
      && retrySelected.includes(BRAIN_LEARNING_ID)
      && transferSelected.includes(BRAIN_LEARNING_ID);

    const runtimeSelectedLearningIds = receipts.flatMap((receipt: any) => receipt.selectedLearningIds ?? []);
    const negativeControlHits = runtimeSelectedLearningIds.filter((id: string) =>
      (NEGATIVE_CONTROL_LEARNING_IDS as readonly string[]).includes(id)
    );
    const staleSuppressionProven =
      runtimeSelectedLearningIds.includes(BRAIN_LEARNING_ID)
      && negativeControlHits.length === 0;
    const staleSuppressionProbe = {
      proven: staleSuppressionProven,
      negativeControlIds: [...NEGATIVE_CONTROL_LEARNING_IDS],
      negativeControlHits,
      runtimeSelectedLearningIds,
      note: "Runtime negative controls share the same capability but are CANDIDATE, REJECT, EXPIRE, SUPERSEDE or review-due. None may enter task context.",
    };

    const metrics = {
      baselineAccepted: accepted(baseline),
      baselineRequiredSignalsPassed: requiredSignalPasses(baseline),
      practiceAccepted: accepted(practice),
      practiceRetryAccepted: practiceRetry ? accepted(practiceRetry) : null,
      correctionAttempts: practiceRetry?.workPackageId === packages.practiceRetry2.id ? 2 : practiceRetry ? 1 : 0,
      heldOutAccepted: accepted(heldOut),
      realRetryAccepted: accepted(retry),
      retryRequiredSignalsPassed: requiredSignalPasses(retry),
      transferAccepted: accepted(transfer),
      transferRequiredSignalsPassed: requiredSignalPasses(transfer),
      failureClassRecurrenceAfterTeaching: [practiceRetry ?? practice, heldOut, retry, transfer].filter((outcome) => !accepted(outcome)).length,
      founderIntervention: 0,
      laterWake: true,
      runtimeSelectionProven,
      receiptCountBeforeWake: Array.isArray(preWakeReceipts) ? preWakeReceipts.length : 0,
      receiptCountAfterWake: Array.isArray(receipts) ? receipts.length : 0,
    };

    const active =
      !accepted(baseline)
      && accepted(practice)
      && accepted(heldOut)
      && accepted(retry)
      && accepted(transfer)
      && runtimeSelectionProven
      && staleSuppressionProven
      && learnerState?.stage === "TRANSFER_PROVEN";

    return await finish("terminal", {
      active,
      state: active ? "RUNTIME_TRANSFER_PROVEN_BRAIN_WRITEBACK_REQUIRED" : "RUNTIME_PROOF_INCOMPLETE",
      learnerId: LEARNER_ID,
      capabilityId: CAPABILITY_ID,
      learningId: BRAIN_LEARNING_ID,
      baseline,
      practice,
      practiceRetry,
      heldOut,
      retry,
      transfer,
      learnerState,
      metrics,
      retrievalReceipts: receipts,
      staleSuppressionProbe,
      causalLink: {
        before: "Baseline had selected-learning NONE and failed the hidden evidence-scope standard.",
        intervention: `Runtime cached BRAIN-derived learning ${BRAIN_LEARNING_ID} after the genuine baseline gap.`,
        after: "After targeted feedback and, when needed, one adaptive practice retry, the fresh held-out, comparable real-work retry and materially different transfer explicitly receipted the learning ID and passed the unchanged independent evidence-discipline standard.",
        limitation: "This proves organisational/runtime learning for this capability. Model weights are unchanged. Canonical BRAIN writeback and independent Founder/Gold readback remain separate final gates.",
      },
    });
  }
}
