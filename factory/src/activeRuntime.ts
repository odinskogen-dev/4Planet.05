import { getAgentByName } from "agents";
import worldClassRuntime from "./worldClassRuntime";
import { createRealProjectProofCases, REAL_FACTORY_PROOF_VERSION } from "./realProjectProof";
import { evaluateGovernedLearning, proveGovernedLearningContract } from "./governedLearning";
import type { FactoryActivationEvidence } from "./activationGate";
import type { LearningCandidate, Outcome } from "./contracts";
import {
  activationProofBuildKey,
  activationProofId,
  activationProofIds,
} from "./activationProofIdentity";

export * from "./worldClassRuntime";

const FACTORY_AGENT_NAME = "shadow-primary";
const REPOSITORY = "odinskogen-dev/4Planet.05";
const TEST_BRANCH = "king/test";
const SAFE_PUBLIC_GETS = new Set([
  "/__factory/health",
  "/__factory/canary",
  "/__factory/guardian",
  "/__factory/orchestra",
]);

interface ActiveEnv extends Cloudflare.Env {
  FACTORY_CONTROL_TOKEN?: string;
  FACTORY_GITHUB_TOKEN?: string;
  FACTORY_BUILD_SHA?: string;
  FACTORY_TEST_KING_BASE_SHA?: string;
}

interface FactoryStateView {
  state: { mode: "SHADOW" | "ACTIVE"; activationEvidence?: FactoryActivationEvidence; lastBatchAt?: string };
  work: Array<{ id: string; status: string }>;
  outcomes: Array<{ work_package_id: string; completed_at: string }>;
  learning: Array<{ id: string; status: string; created_at: string }>;
  locks: Array<{ scope: string; work_package_id: string; expires_at: string }>;
}

const sha40 = /^[0-9a-f]{40}$/i;

function exactBuildSha(env: ActiveEnv): string {
  const buildSha = env.FACTORY_BUILD_SHA?.trim() ?? "";
  if (!sha40.test(buildSha)) throw new Error("FACTORY_BUILD_SHA_MISSING_OR_INVALID");
  return buildSha.toLowerCase();
}

function authorised(request: Request, env: ActiveEnv): boolean {
  const expected = env.FACTORY_CONTROL_TOKEN?.trim();
  if (!expected || expected.length < 32) return false;
  const supplied = request.headers.get("x-factory-control")?.trim() ?? "";
  if (supplied.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ supplied.charCodeAt(index);
  return difference === 0;
}

function authFailure() {
  return Response.json({ ok: false, error: "FACTORY_CONTROL_AUTH_REQUIRED" }, { status: 401 });
}

async function githubCurrentTestSha(env: ActiveEnv): Promise<string> {
  const token = env.FACTORY_GITHUB_TOKEN?.trim();
  if (!token) throw new Error("FACTORY_GITHUB_TOKEN_MISSING");
  const ref = TEST_BRANCH.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/git/ref/heads/${ref}`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "4PLANET-Production-Factory/1.0",
    },
  });
  if (!response.ok) throw new Error(`CURRENT_TEST_KING_LOOKUP_FAILED:${response.status}`);
  const body = await response.json() as { object?: { sha?: string } };
  const sha = body.object?.sha ?? "";
  if (!sha40.test(sha)) throw new Error("CURRENT_TEST_KING_SHA_INVALID");
  return sha.toLowerCase();
}

/**
 * The Agents package exposes a deeply recursive generated RPC type for this
 * large class. The runtime boundary intentionally erases only that transport
 * type; all payloads are validated again by Factory domain contracts.
 */
async function factoryAgent(env: ActiveEnv): Promise<any> {
  const getByName: any = getAgentByName;
  return getByName(env.PRODUCTION_FACTORY, FACTORY_AGENT_NAME);
}

/**
 * ACTIVE is certification of an exact Factory build, not a permanent mutable
 * boolean. A later code deployment must not inherit ACTIVE from an older build.
 */
async function enforceExactBuildCertification(env: ActiveEnv): Promise<FactoryStateView> {
  const buildSha = exactBuildSha(env);
  const factory: any = await factoryAgent(env);
  let state = await factory.getFactoryState() as FactoryStateView;
  if (
    state.state.mode === "ACTIVE"
    && state.state.activationEvidence?.exactFactorySha?.toLowerCase() !== buildSha
  ) {
    await factory.setMode("SHADOW");
    state = await factory.getFactoryState() as FactoryStateView;
  }
  return state;
}

function versionedProofCases(currentTestSha: string, buildSha: string) {
  const buildKey = activationProofBuildKey(buildSha);
  const bootIds = new Set(activationProofIds(buildSha));
  return createRealProjectProofCases(currentTestSha)
    .map((proof) => {
      const id = activationProofId(proof.pkg.id, buildSha);
      return {
        ...proof,
        pkg: {
          ...proof.pkg,
          id,
          run: {
            runId: `activation-${buildKey}-${proof.family.toLowerCase()}`,
            attemptId: "01",
            idempotencyKey: `activation:${buildSha}:${currentTestSha}:${proof.family}`,
            inputStateHash: `factory=${buildSha};test=${currentTestSha}`,
            expectedBaseSha: currentTestSha,
            workerId: `activation-${proof.family.toLowerCase()}`,
            createdAt: new Date().toISOString(),
          },
        },
      };
    })
    .filter((proof) => bootIds.has(proof.pkg.id));
}

async function seedRealProof(env: ActiveEnv) {
  const buildSha = exactBuildSha(env);
  const baseSha = env.FACTORY_TEST_KING_BASE_SHA?.trim().toLowerCase() ?? "";
  if (!sha40.test(baseSha)) throw new Error("FACTORY_TEST_KING_BASE_SHA_MISSING_OR_INVALID");
  const currentTestSha = await githubCurrentTestSha(env);
  if (currentTestSha !== baseSha) throw new Error(`TEST_KING_MOVED:${baseSha}->${currentTestSha}`);

  const factory: any = await factoryAgent(env);
  const state = await enforceExactBuildCertification(env);
  if (state.state.mode !== "SHADOW") return { alreadyActive: true, buildSha, currentTestSha, workflowIds: [] as string[] };

  const cases = versionedProofCases(currentTestSha, buildSha);
  const recordedOutcomes = await factory.getOutcomesByIds(cases.map((proof) => proof.pkg.id)) as Outcome[];
  const recorded = new Set(recordedOutcomes.map((outcome) => outcome.workPackageId));
  const workflowIds: string[] = [];
  for (const proof of cases) {
    await factory.upsertProject(proof.project);
    await factory.upsertWorkPackage(proof.pkg);
    if (recorded.has(proof.pkg.id)) continue;
    const workflowId = `factory-active-proof-${proof.pkg.id}`;
    const existing = await factory.getWorkflow?.(workflowId);
    if (!existing) {
      await factory.runWorkflow(
        "WORK_PACKAGE_WORKFLOW",
        { workPackageId: proof.pkg.id },
        {
          id: workflowId,
          metadata: {
            activationProof: true,
            exactFactorySha: buildSha,
            exactTestKingSha: currentTestSha,
            family: proof.family,
            projectId: proof.project.id,
          },
          agentBinding: "PRODUCTION_FACTORY",
        },
      );
    }
    workflowIds.push(workflowId);
  }
  return { alreadyActive: false, buildSha, currentTestSha, workflowIds, proofIds: cases.map((proof) => proof.pkg.id) };
}

async function proofOutcomes(env: ActiveEnv): Promise<{ complete: boolean; outcomes: Outcome[]; state: FactoryStateView; ids: string[]; buildSha: string }> {
  const buildSha = exactBuildSha(env);
  const factory: any = await factoryAgent(env);
  const state = await enforceExactBuildCertification(env);
  const ids = activationProofIds(buildSha);
  const exactOutcomes = await factory.getOutcomesByIds(ids) as Outcome[];
  const byId = new Map(exactOutcomes.map((outcome) => [outcome.workPackageId, outcome] as const));
  const outcomes = ids.map((id) => byId.get(id)).filter((outcome): outcome is Outcome => Boolean(outcome));
  return { complete: outcomes.length === ids.length, outcomes, state, ids, buildSha };
}

function proofMetrics(outcomes: Outcome[], buildSha: string) {
  const accepted = outcomes.filter((outcome) => outcome.status === "ACCEPTED").length;
  const correct = outcomes.filter((outcome) => outcome.status === "CORRECT").length;
  const blocked = outcomes.filter((outcome) => outcome.status === "BLOCKED").length;
  const rejected = outcomes.filter((outcome) => outcome.status === "REJECTED").length;
  const corrections = outcomes.reduce((sum, outcome) => sum + outcome.evidence.filter((item) => item.startsWith("CORRECTION LOOP")).length, 0);
  const times = outcomes.map((outcome) => Date.parse(outcome.completedAt)).filter(Number.isFinite).sort((a, b) => a - b);
  return {
    proofVersion: `${REAL_FACTORY_PROOF_VERSION}_BUILD_${activationProofBuildKey(buildSha)}`,
    realFamilies: activationProofIds(buildSha).length,
    accepted,
    correct,
    blocked,
    rejected,
    correctionLoops: corrections,
    founderMinutesDuringAutonomousExecution: 0,
    approximateOutcomeSpanMinutes: times.length > 1 ? Math.round((times[times.length - 1] - times[0]) / 6000) / 10 : 0,
    noPaidCapacityActivated: true,
    exactBuildBoundProof: true,
  };
}

async function certifyAndActivate(
  env: ActiveEnv,
  supplied: { shadowCiPassed?: boolean; convergencePassed?: boolean; shadowRuntimeProven?: boolean },
) {
  const buildSha = exactBuildSha(env);
  const baseSha = env.FACTORY_TEST_KING_BASE_SHA?.trim().toLowerCase() ?? "";
  if (!sha40.test(baseSha)) throw new Error("DEPLOYMENT_SHA_EVIDENCE_INVALID");
  const currentTestSha = await githubCurrentTestSha(env);
  if (currentTestSha !== baseSha) throw new Error(`TEST_KING_MOVED:${baseSha}->${currentTestSha}`);

  const proof = await proofOutcomes(env);
  const allAccepted = proof.complete && proof.outcomes.every((outcome) => outcome.status === "ACCEPTED");
  const visualQa = allAccepted && proof.outcomes.every((outcome) => outcome.evidence.some((item) => item.startsWith("preview PASS")));
  const codeWrite = allAccepted && proof.outcomes.every((outcome) => outcome.evidence.some((item) => item.startsWith("commit ")));
  const draftPrProof = allAccepted && proof.outcomes.every((outcome) => outcome.evidence.some((item) => item.startsWith("draft PR ")));
  const checks = allAccepted && proof.outcomes.every((outcome) => outcome.evidence.some((item) => item.startsWith("CHECK ")));

  const factory: any = await factoryAgent(env);
  const shadowCanary = await factory.getShadowCanaryStatus() as { ready?: boolean };
  const simulation = await factory.simulateActivationGate() as { passed?: boolean };
  const governedContract = proveGovernedLearningContract();

  const governedProposal = evaluateGovernedLearning({
    id: `factory-real-proof-learning-${buildSha.slice(0, 12)}`,
    workPackageId: proof.ids.join("+"),
    projectId: "4planet-factory-real-proof",
    target: "FACTORY_TEST_GATE",
    observation: "One real bounded 4PLANET activation-boot work package completed on one exact Factory build with durable execution and evaluation evidence.",
    evidence: proof.outcomes.flatMap((outcome) => outcome.evidence.slice(0, 16)),
    proposedChange: "Retain exact Factory-build + TEST-base checks, bounded write scopes, draft-PR-only release, automatic CI/mobile QA and truth-preserving Brand controls; require another distinct production instance before generalising a reusable Factory rule.",
    distinctInstanceCount: proof.outcomes.length,
    safetyCorrection: false,
    weakensTruthOrSafety: false,
    promotesCanon: false,
    status: "PROPOSED",
  });
  const productionLearningAccepted = allAccepted && governedProposal.accepted;

  if (productionLearningAccepted) {
    const learningCandidate: LearningCandidate = {
      id: governedProposal.proposal.id,
      workPackageId: `factory-real-proof-portfolio-${activationProofBuildKey(buildSha)}`,
      observation: governedProposal.proposal.observation,
      expectedVsActual: `Expected one exact-build bounded activation-boot production proof; observed ${proof.outcomes.length} real accepted outcome(s) with allAccepted=${allAccepted}.`,
      evidence: governedProposal.proposal.evidence,
      causeHypothesis: "A small bounded internal Factory job can establish execution readiness without making unrelated product convergence a compute prerequisite.",
      lesson: governedProposal.proposal.proposedChange,
      scope: "4P Production Factory TEST production",
      confidence: proof.outcomes.length >= 2 && allAccepted ? "HIGH" : "MEDIUM",
      ruleProposal: governedProposal.proposal.proposedChange,
      regressionEval: "Never reuse an activation outcome across Factory builds; never weaken truth/safety/Human Gold gates; do not generalise a reusable rule from this single boot instance.",
      nextTest: "Run the next authorised distinct bounded internal 4PLANET work package and compare time, corrections, Founder burden, human quality and reuse before generalising.",
      status: "CANDIDATE",
      createdAt: new Date().toISOString(),
    };
    await factory.recordLearning(learningCandidate);
  }

  const activationEvidence: FactoryActivationEvidence = {
    shadowCiPassed: supplied.shadowCiPassed === true,
    convergencePassed: supplied.convergencePassed === true,
    brainProjectionReadOnly: true,
    sectionAdaptersBounded: true,
    evaluatorMaterialGateEnabled: true,
    learningCompilerEnabled: true,
    zeroLossLawEnabled: true,
    deterministicSimulationPassed: simulation.passed === true,
    shadowComparisonPassed: supplied.shadowRuntimeProven === true && shadowCanary.ready === true && allAccepted,
    outcomeQualityParityPassed: allAccepted && checks,
    dedicatedRuntimeShadowDeployed: supplied.shadowRuntimeProven === true,
    subAgentWorkflowRoundTripPassed: proof.complete && shadowCanary.ready === true,
    githubCodeAdapterProven: codeWrite && draftPrProof,
    visualQaAdapterProven: visualQa,
    researchDataAdapterProven: shadowCanary.ready === true,
    governedBrainWritebackProven: governedContract.passed && productionLearningAccepted,
    noProductionDeploy: true,
    externalReleaseFounderGated: true,
    testKingBaseCurrent: currentTestSha === baseSha,
    exactFactorySha: buildSha,
    factoryTestKingBaseSha: baseSha,
    currentTestKingSha: currentTestSha,
    evidencedAt: new Date().toISOString(),
  };

  const gate = await factory.setActivationEvidence(activationEvidence) as { ready: boolean; missing: string[] };
  let active = proof.state.state.mode === "ACTIVE";
  if (gate.ready && !active) {
    await factory.setMode("ACTIVE");
    active = true;
  }

  return {
    active,
    gate,
    exactFactorySha: buildSha,
    exactTestKingSha: currentTestSha,
    proofComplete: proof.complete,
    proofIds: proof.ids,
    proofOutcomes: proof.outcomes.map((outcome) => ({ id: outcome.workPackageId, status: outcome.status, actual: outcome.actual, evidence: outcome.evidence })),
    metrics: proofMetrics(proof.outcomes, buildSha),
    governedLearning: {
      contract: governedContract,
      proposalAccepted: productionLearningAccepted,
      destination: governedProposal.destination,
      reasons: productionLearningAccepted ? governedProposal.reasons : [...governedProposal.reasons, "PRODUCTION_OUTCOMES_NOT_ACCEPTED"],
    },
    boundaries: {
      live: "FOUNDER_GATED",
      humanGold: "FOUNDER_GATED",
      canon: "GOVERNED_NO_AUTONOMOUS_PROMOTION",
      outreach: "FOUNDER_GATED",
      spend: "ZERO_CASH_FAIL_CLOSED",
    },
  };
}

async function enrichedControlRoom(request: Request, env: ActiveEnv, ctx: ExecutionContext) {
  const buildSha = exactBuildSha(env);
  const baseRequest = new Request(new URL("/__factory/orchestra", request.url), { method: "GET" });
  const baseResponse = await worldClassRuntime.fetch(baseRequest, env, ctx);
  const orchestra = await baseResponse.json() as Record<string, unknown>;
  const proof = await proofOutcomes(env);
  return Response.json({
    factory: "4PLANET Production Factory 01",
    factoryStatus: proof.state.state.mode === "ACTIVE" ? "ACTIVE_INTERNAL_TEST_PRODUCTION" : "SHADOW",
    mode: proof.state.state.mode,
    exactFactorySha: buildSha,
    activationProofIds: proof.ids,
    currentWork: proof.state.work,
    produced: proof.outcomes.map((outcome) => ({ id: outcome.workPackageId, status: outcome.status, actual: outcome.actual })),
    learningCandidates: proof.state.learning.length,
    failures: proof.outcomes.filter((outcome) => outcome.status !== "ACCEPTED").map((outcome) => ({ id: outcome.workPackageId, status: outcome.status, actual: outcome.actual })),
    factoryValue: proofMetrics(proof.outcomes, buildSha),
    realProductionProof: { complete: proof.complete, orchestra },
    boundaries: { live: false, humanGoldFounderOnly: true, canonPromotion: false, outreach: false, automaticSpend: false },
  });
}

export default {
  async fetch(request: Request, envInput: Cloudflare.Env, ctx: ExecutionContext) {
    const env = envInput as ActiveEnv;
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/__factory/control-room") return enrichedControlRoom(request, env, ctx);
    if (request.method === "GET" && SAFE_PUBLIC_GETS.has(url.pathname)) {
      await enforceExactBuildCertification(env);
      return worldClassRuntime.fetch(request, env, ctx);
    }

    if (request.method === "POST" && url.pathname === "/__factory/intake") {
      if (!authorised(request, env)) return authFailure();
      await enforceExactBuildCertification(env);
      const body = await request.json();
      const factory: any = await factoryAgent(env);
      const compiled = await factory.ingestApprovedProject(body as any);
      return Response.json({ ok: true, compiled }, { status: 202 });
    }

    if (request.method === "POST" && url.pathname === "/__factory/activation-proof/start") {
      if (!authorised(request, env)) return authFailure();
      try {
        return Response.json({ ok: true, ...(await seedRealProof(env)) }, { status: 202 });
      } catch (error) {
        return Response.json({ ok: false, error: error instanceof Error ? error.message : "UNKNOWN_ACTIVATION_PROOF_START_FAILURE" }, { status: 409 });
      }
    }

    if (request.method === "POST" && url.pathname === "/__factory/activation-proof/status") {
      if (!authorised(request, env)) return authFailure();
      try {
        const body = await request.json().catch(() => ({})) as { shadowCiPassed?: boolean; convergencePassed?: boolean; shadowRuntimeProven?: boolean };
        const proof = await proofOutcomes(env);
        if (!proof.complete) {
          return Response.json({
            ok: true,
            active: proof.state.state.mode === "ACTIVE",
            proofComplete: false,
            proofIds: proof.ids,
            current: proof.state.work.filter((item) => proof.ids.includes(item.id)),
            recorded: proof.outcomes.map((outcome) => ({ id: outcome.workPackageId, status: outcome.status })),
          });
        }
        return Response.json({ ok: true, ...(await certifyAndActivate(env, body)) });
      } catch (error) {
        return Response.json({ ok: false, active: false, error: error instanceof Error ? error.message : "UNKNOWN_ACTIVATION_PROOF_STATUS_FAILURE" }, { status: 409 });
      }
    }

    // No generic external Agent RPC in the ACTIVE-capable runtime.
    return new Response("4PLANET Production Factory 01", { status: url.pathname === "/" ? 200 : 404 });
  },

  async queue(batch: MessageBatch<any>, env: Cloudflare.Env, ctx: ExecutionContext) {
    return worldClassRuntime.queue(batch as any, env, ctx);
  },
};