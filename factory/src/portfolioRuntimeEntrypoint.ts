import { getAgentByName } from "agents";
import runtimeEntrypoint from "./runtimeEntrypoint";
import {
  createPortfolioFallbackQueue,
  isOnlyReceiverWriterConflict,
} from "./portfolioFallback";
import { localReadOnlyWorkflowParkDecision } from "./localInFlightPark";
import {
  buildTaskContractV1,
  verifyRuntimeSnapshot,
  type BoundTaskContract,
  type RuntimeAuthoritySnapshot,
} from "./amendmentMRuntime";
import {
  createNightShiftPortfolio,
  NIGHT_SHIFT_AUTHORITY,
  NIGHT_SHIFT_PROJECT_ID,
} from "./nightShiftPortfolio";
import type { WorkPackage } from "./contracts";

export * from "./runtimeEntrypoint";

const FACTORY_AGENT_NAME = "shadow-primary";
const REPOSITORY = "odinskogen-dev/4Planet.05";
const RECEIVER_REF = "king/test";
const LIVE_CONTROL_REF = "release/one-interface-sprint2-6bbfebb";
const FOUNDER_AUTHORITY_REVISION = "FOUNDER_DECISION_AMENDMENT_M+L_CURRENT_2026-09-09";
const PROGRAMME_STATE_REVISION = "CSR-2026-09-08-05";
const EVALUATOR_ID = "AXE_PROGRAMME_QA_INDEPENDENT";
const SHA40 = /^[0-9a-f]{40}$/i;

interface PortfolioRuntimeEnv extends Cloudflare.Env {
  FACTORY_BUILD_SHA?: string;
  FACTORY_CONTROL_TOKEN?: string;
  FACTORY_GITHUB_TOKEN?: string;
  FACTORY_TEST_KING_BASE_SHA?: string;
}

type FactoryStateView = {
  projects?: Array<{ id?: string }>;
  work?: Array<{ id?: string; status?: string }>;
};

type ContractedNightPackage = WorkPackage & {
  amendmentM: BoundTaskContract;
};

function authorised(request: Request, env: PortfolioRuntimeEnv): boolean {
  const expected = env.FACTORY_CONTROL_TOKEN?.trim();
  if (!expected || expected.length < 32) return false;
  const supplied = request.headers.get("x-factory-control")?.trim() ?? "";
  if (supplied.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ supplied.charCodeAt(index);
  }
  return difference === 0;
}

function exactIdentity(env: PortfolioRuntimeEnv) {
  const exactFactorySha = env.FACTORY_BUILD_SHA?.trim().toLowerCase() ?? "";
  const exactTestSha = env.FACTORY_TEST_KING_BASE_SHA?.trim().toLowerCase() ?? "";
  if (!SHA40.test(exactFactorySha)) throw new Error("PORTFOLIO_FALLBACK_FACTORY_SHA_MISSING_OR_INVALID");
  if (!SHA40.test(exactTestSha)) throw new Error("PORTFOLIO_FALLBACK_TEST_SHA_MISSING_OR_INVALID");
  return { exactFactorySha, exactTestSha };
}

function githubHeaders(env: PortfolioRuntimeEnv): HeadersInit {
  const token = env.FACTORY_GITHUB_TOKEN?.trim();
  if (!token) throw new Error("FACTORY_GITHUB_TOKEN_MISSING");
  return {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${token}`,
    "x-github-api-version": "2022-11-28",
    "user-agent": "4PLANET-Production-Factory/1.0",
  };
}

async function currentRefSha(env: PortfolioRuntimeEnv, ref: string): Promise<string> {
  const encoded = ref.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/git/ref/heads/${encoded}`, {
    headers: githubHeaders(env),
  });
  if (!response.ok) throw new Error(`RUNTIME_AUTHORITY_REF_LOOKUP_FAILED:${ref}:${response.status}`);
  const body = await response.json() as { object?: { sha?: string } };
  const sha = body.object?.sha?.trim().toLowerCase() ?? "";
  if (!SHA40.test(sha)) throw new Error(`RUNTIME_AUTHORITY_REF_SHA_INVALID:${ref}`);
  return sha;
}

async function freshAuthority(env: PortfolioRuntimeEnv): Promise<RuntimeAuthoritySnapshot> {
  const [receiverSha, liveControlSha] = await Promise.all([
    currentRefSha(env, RECEIVER_REF),
    currentRefSha(env, LIVE_CONTROL_REF),
  ]);
  return {
    founder_authority_revision: FOUNDER_AUTHORITY_REVISION,
    programme_state_revision: PROGRAMME_STATE_REVISION,
    receiver_ref: RECEIVER_REF,
    receiver_sha: receiverSha,
    live_control_ref: LIVE_CONTROL_REF,
    live_control_sha: liveControlSha,
  };
}

async function agent(env: PortfolioRuntimeEnv): Promise<any> {
  const getByName: any = getAgentByName;
  return getByName(env.PRODUCTION_FACTORY, FACTORY_AGENT_NAME);
}

async function portfolioStatus(env: PortfolioRuntimeEnv) {
  const { exactFactorySha, exactTestSha } = exactIdentity(env);
  const factory: any = await agent(env);
  const queue = createPortfolioFallbackQueue(exactTestSha, exactFactorySha);
  const outcomes = await factory.getOutcomesByIds(queue.packages.map((pkg) => pkg.id));
  const state = await factory.getFactoryState() as FactoryStateView;
  const work = new Map((state.work ?? []).map((row) => [row.id, row.status] as const));
  const outcomeById = new Map((outcomes as Array<{ workPackageId: string; status: string }>).map((outcome) => [outcome.workPackageId, outcome] as const));
  return {
    ok: true,
    lane: "A1_BOUNDED_READ_ONLY_PORTFOLIO_FALLBACK",
    exactFactorySha,
    exactTestSha,
    packages: queue.packages.map((pkg) => ({
      id: pkg.id,
      projectId: pkg.projectId,
      status: outcomeById.get(pkg.id)?.status ?? work.get(pkg.id) ?? "NOT_INGESTED",
      targetUrl: pkg.execution?.targetUrl ?? null,
    })),
    outcomes,
    boundaries: {
      writeScopes: 0,
      modelCalls: 0,
      live: false,
      testMutation: false,
      canon: false,
      outreach: false,
      spend: false,
    },
  };
}

async function buildNightShiftQueue(env: PortfolioRuntimeEnv) {
  const { exactFactorySha, exactTestSha } = exactIdentity(env);
  const fresh = await freshAuthority(env);
  if (fresh.receiver_sha !== exactTestSha) {
    throw new Error(`HEIR_DRIFT:deployed=${exactTestSha}:current=${fresh.receiver_sha}`);
  }

  const base = createNightShiftPortfolio(exactTestSha, exactFactorySha);
  const packages: ContractedNightPackage[] = [];
  for (const pkg of base.packages) {
    const makerId = `FACTORY_CLOUDFLARE_WORKER:${pkg.section}:${pkg.id}`;
    const amendmentM = await buildTaskContractV1(pkg, {
      founderAuthorityRevision: FOUNDER_AUTHORITY_REVISION,
      programmeStateRevision: PROGRAMME_STATE_REVISION,
      factoryBuildSha: exactFactorySha,
      receiverRef: RECEIVER_REF,
      receiverSha: exactTestSha,
      liveControlRef: fresh.live_control_ref,
      liveControlSha: fresh.live_control_sha,
      makerId,
      evaluatorId: EVALUATOR_ID,
      physicalEnvironmentContainmentVerified: false,
    });
    const failures = verifyRuntimeSnapshot(amendmentM.contract, fresh);
    if (failures.length > 0) throw new Error(`STALE_CONTEXT:${failures.join(",")}`);
    packages.push({ ...pkg, amendmentM });
  }
  return { ...base, packages, exactFactorySha, exactTestSha, fresh };
}

async function nightShiftStatus(env: PortfolioRuntimeEnv) {
  const queue = await buildNightShiftQueue(env);
  const factory: any = await agent(env);
  const outcomes = await factory.getOutcomesByIds(queue.packages.map((pkg) => pkg.id)) as Array<{
    workPackageId: string;
    status: string;
    evidence?: string[];
    completedAt?: string;
    actual?: string;
    limitation?: string;
  }>;
  const state = await factory.getFactoryState() as FactoryStateView;
  const work = new Map((state.work ?? []).map((row) => [row.id, row.status] as const));
  const outcomeById = new Map(outcomes.map((outcome) => [outcome.workPackageId, outcome] as const));
  const terminalFailures = queue.packages.flatMap((pkg) => verifyRuntimeSnapshot(pkg.amendmentM.contract, queue.fresh));
  const packageRows = queue.packages.map((pkg) => ({
    id: pkg.id,
    projectId: pkg.projectId,
    status: outcomeById.get(pkg.id)?.status ?? work.get(pkg.id) ?? "NOT_INGESTED",
    targetUrl: pkg.execution?.targetUrl ?? null,
    viewport: pkg.execution?.viewport ?? null,
    contextHash: pkg.amendmentM.fingerprint.context_hash,
    maker: pkg.amendmentM.contract.evaluator.maker_id,
    evaluator: pkg.amendmentM.contract.evaluator.evaluator_id,
    autonomyCeiling: pkg.amendmentM.autonomy_ceiling,
  }));
  const terminalCount = packageRows.filter((row) => ["ACCEPTED", "BLOCKED", "REJECTED"].includes(row.status)).length;
  return {
    ok: true,
    lane: "FACTORY_CLOUD_WORKERS_NIGHT_SHIFT_01",
    sourceWorkPackage: NIGHT_SHIFT_PROJECT_ID,
    authority: NIGHT_SHIFT_AUTHORITY,
    exactFactorySha: queue.exactFactorySha,
    exactTestSha: queue.exactTestSha,
    productionControlProjection: `${queue.fresh.live_control_ref}@${queue.fresh.live_control_sha}`,
    founderAuthorityRevision: FOUNDER_AUTHORITY_REVISION,
    programmeStateRevision: PROGRAMME_STATE_REVISION,
    taskContractVersion: "V1",
    physicalEnvironmentContainmentVerified: false,
    autonomyCeiling: "B0.5",
    complete: terminalCount === packageRows.length && packageRows.length > 0,
    terminalAuthorityReread: {
      pass: terminalFailures.length === 0,
      failures: [...new Set(terminalFailures)],
      receiver: `${queue.fresh.receiver_ref}@${queue.fresh.receiver_sha}`,
      productionControlProjection: `${queue.fresh.live_control_ref}@${queue.fresh.live_control_sha}`,
    },
    packages: packageRows,
    outcomes,
    boundaries: {
      wip: 1,
      writeScopes: 0,
      modelCalls: 0,
      liveMutation: false,
      heirMutation: false,
      canon: false,
      outreach: false,
      spend: false,
      automatedQaIsHumanGold: false,
      workerReportIsTruth: false,
    },
  };
}

async function dispatchNextNightShift(env: PortfolioRuntimeEnv) {
  const queue = await buildNightShiftQueue(env);
  const factory: any = await agent(env);
  const state = await factory.getFactoryState() as FactoryStateView;
  const projectIds = new Set((state.projects ?? []).map((project) => project.id).filter(Boolean));
  const activeWork = new Map((state.work ?? []).map((row) => [row.id, row.status] as const));
  const outcomes = await factory.getOutcomesByIds(queue.packages.map((pkg) => pkg.id)) as Array<{ workPackageId: string; status: string }>;
  const outcomeById = new Map(outcomes.map((outcome) => [outcome.workPackageId, outcome] as const));

  for (const project of queue.projects) {
    if (!projectIds.has(project.id)) await factory.upsertProject(project);
  }
  for (const pkg of queue.packages) {
    if (!outcomeById.has(pkg.id) && !activeWork.has(pkg.id)) await factory.upsertWorkPackage(pkg);
  }

  for (let index = 0; index < queue.packages.length; index += 1) {
    const pkg = queue.packages[index];
    if (outcomeById.has(pkg.id)) continue;
    const workflowId = `factory-night-shift-${pkg.id}`;
    const tracked = await factory.getWorkflow?.(workflowId) as { status?: string; createdAt?: string } | undefined;
    if (tracked) {
      return {
        status: "IN_FLIGHT",
        workPackageId: pkg.id,
        workflowId,
        trackedStatus: tracked.status ?? "UNKNOWN",
        contextHash: pkg.amendmentM.fingerprint.context_hash,
        exactFactorySha: queue.exactFactorySha,
        exactTestSha: queue.exactTestSha,
      };
    }

    const preDispatchFresh = await freshAuthority(env);
    const preDispatchFailures = verifyRuntimeSnapshot(pkg.amendmentM.contract, preDispatchFresh);
    if (preDispatchFailures.length > 0) {
      throw new Error(`STALE_CONTEXT_PRE_DISPATCH:${preDispatchFailures.join(",")}`);
    }

    await factory.runWorkflow(
      "WORK_PACKAGE_WORKFLOW",
      {
        workPackageId: pkg.id,
        portfolioFallback: {
          exactFactorySha: queue.exactFactorySha,
          exactTestSha: queue.exactTestSha,
          index,
          packages: queue.packages,
        },
      },
      {
        id: workflowId,
        metadata: {
          nightShift: true,
          amendmentM: true,
          authority: NIGHT_SHIFT_AUTHORITY,
          sourceWorkPackage: NIGHT_SHIFT_PROJECT_ID,
          projectId: pkg.projectId,
          section: pkg.section,
          exactFactorySha: queue.exactFactorySha,
          exactTestSha: queue.exactTestSha,
          contextHash: pkg.amendmentM.fingerprint.context_hash,
          evaluator: EVALUATOR_ID,
          readOnly: true,
          terminalContinuation: true,
        },
        agentBinding: "PRODUCTION_FACTORY",
      },
    );

    return {
      status: "DISPATCHED",
      projectId: pkg.projectId,
      workPackageId: pkg.id,
      workflowId,
      contextHash: pkg.amendmentM.fingerprint.context_hash,
      exactFactorySha: queue.exactFactorySha,
      exactTestSha: queue.exactTestSha,
      productionControlProjection: `${preDispatchFresh.live_control_ref}@${preDispatchFresh.live_control_sha}`,
      writeScopes: pkg.writeScopes,
      execution: pkg.execution,
    };
  }

  return {
    status: "EXHAUSTED",
    exactFactorySha: queue.exactFactorySha,
    exactTestSha: queue.exactTestSha,
    terminalOutcomes: outcomes.map((outcome) => ({ id: outcome.workPackageId, status: outcome.status })),
  };
}

async function dispatchNextPortfolioFallback(env: PortfolioRuntimeEnv) {
  const { exactFactorySha, exactTestSha } = exactIdentity(env);
  const factory: any = await agent(env);
  const queue = createPortfolioFallbackQueue(exactTestSha, exactFactorySha);
  const outcomeRows = await factory.getOutcomesByIds(queue.packages.map((pkg) => pkg.id)) as Array<{ workPackageId: string; status: string }>;
  const outcomeById = new Map(outcomeRows.map((outcome) => [outcome.workPackageId, outcome] as const));
  const state = await factory.getFactoryState() as FactoryStateView;
  const projectIds = new Set((state.projects ?? []).map((project) => project.id).filter(Boolean));
  const activeWork = new Map((state.work ?? []).map((row) => [row.id, row.status] as const));
  const locallyParked: Array<{ workPackageId: string; workflowId: string; trackedStatus: string; reason: string }> = [];

  for (const project of queue.projects) {
    if (!projectIds.has(project.id)) await factory.upsertProject(project);
  }
  for (const pkg of queue.packages) {
    if (!outcomeById.has(pkg.id) && !activeWork.has(pkg.id)) await factory.upsertWorkPackage(pkg);
  }

  for (let index = 0; index < queue.packages.length; index += 1) {
    const pkg = queue.packages[index];
    if (outcomeById.has(pkg.id)) continue;
    const workflowId = `factory-portfolio-fallback-${pkg.id}`;
    const tracked = await factory.getWorkflow?.(workflowId) as { status?: string; createdAt?: string } | undefined;
    if (tracked) {
      const trackedStatus = tracked.status ?? "UNKNOWN";
      const park = localReadOnlyWorkflowParkDecision({
        status: trackedStatus,
        createdAt: tracked.createdAt ?? null,
        writeScopes: pkg.writeScopes,
      });
      if (!park.park) {
        return {
          status: "IN_FLIGHT",
          projectId: pkg.projectId,
          workPackageId: pkg.id,
          workflowId,
          trackedStatus,
          trackedCreatedAt: tracked.createdAt ?? null,
          parkReason: park.reason,
          exactFactorySha,
          exactTestSha,
        };
      }
      locallyParked.push({ workPackageId: pkg.id, workflowId, trackedStatus, reason: park.reason });
      continue;
    }

    await factory.runWorkflow(
      "WORK_PACKAGE_WORKFLOW",
      {
        workPackageId: pkg.id,
        portfolioFallback: {
          exactFactorySha,
          exactTestSha,
          index,
          packages: queue.packages,
        },
      },
      {
        id: workflowId,
        metadata: {
          portfolioFallback: true,
          authority: "4PLANET_FACTORY_PREMIUM_AUTONOMOUS_PRODUCTION_MARATHON_04",
          projectId: pkg.projectId,
          section: pkg.section,
          exactFactorySha,
          exactTestSha,
          readOnly: true,
          terminalContinuation: true,
        },
        agentBinding: "PRODUCTION_FACTORY",
      },
    );

    return {
      status: "DISPATCHED",
      projectId: pkg.projectId,
      workPackageId: pkg.id,
      workflowId,
      exactFactorySha,
      exactTestSha,
      writeScopes: pkg.writeScopes,
      execution: pkg.execution,
      locallyParked,
    };
  }

  return {
    status: "EXHAUSTED",
    exactFactorySha,
    exactTestSha,
    terminalOutcomes: outcomeRows.map((outcome) => ({ id: outcome.workPackageId, status: outcome.status })),
    locallyParked,
  };
}

export default {
  async fetch(request: Request, envInput: Cloudflare.Env, ctx: ExecutionContext) {
    const env = envInput as PortfolioRuntimeEnv;
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/__factory/portfolio-fallback") {
      try {
        return Response.json(await portfolioStatus(env));
      } catch (error) {
        return Response.json({
          ok: false,
          error: error instanceof Error ? error.message : "PORTFOLIO_FALLBACK_STATUS_FAILED",
        }, { status: 409 });
      }
    }

    if (request.method === "GET" && url.pathname === "/__factory/night-shift") {
      try {
        return Response.json({ runtimeUrl: url.origin, ...(await nightShiftStatus(env)) });
      } catch (error) {
        return Response.json({
          ok: false,
          lane: "FACTORY_CLOUD_WORKERS_NIGHT_SHIFT_01",
          runtimeUrl: url.origin,
          error: error instanceof Error ? error.message : "NIGHT_SHIFT_STATUS_FAILED",
        }, { status: 409 });
      }
    }

    if (request.method === "GET" && url.pathname === "/__factory/canary") {
      const response = await runtimeEntrypoint.fetch(request, env, ctx);
      if (!response.ok) return response;
      const body = await response.clone().json().catch(() => null) as Record<string, unknown> | null;
      try {
        const dispatch = await dispatchNextNightShift(env);
        const status = await nightShiftStatus(env);
        return Response.json({
          ...(body ?? {}),
          nightShift: {
            runtimeUrl: url.origin,
            dispatch,
            status,
          },
        }, { status: response.status });
      } catch (error) {
        return Response.json({
          ...(body ?? {}),
          nightShift: {
            runtimeUrl: url.origin,
            ok: false,
            error: error instanceof Error ? error.message : "NIGHT_SHIFT_DISPATCH_FAILED",
          },
        }, { status: 409 });
      }
    }

    const response = await runtimeEntrypoint.fetch(request, env, ctx);
    if (
      request.method !== "POST"
      || url.pathname !== "/__factory/activation-proof/start"
      || response.status !== 409
      || !authorised(request, env)
    ) {
      return response;
    }

    const body = await response.clone().json().catch(() => null);
    if (!isOnlyReceiverWriterConflict(body)) return response;

    try {
      const fallback = await dispatchNextPortfolioFallback(env);
      const original = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
      return Response.json({
        ...original,
        portfolioFallback: fallback,
        portfolioRule: "LOCAL RECEIVER/PROVIDER BLOCK -> PARK ONLY LOCAL READ-ONLY CAPABILITY -> DISPATCH NEXT LEGAL PACKAGE -> TERMINAL EVENT CONTINUES QUEUE",
      }, { status: 409 });
    } catch (error) {
      const original = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
      return Response.json({
        ...original,
        portfolioFallback: {
          status: "ERROR",
          error: error instanceof Error ? error.message : "PORTFOLIO_FALLBACK_DISPATCH_FAILED",
        },
      }, { status: 409 });
    }
  },

  async queue(batch: MessageBatch<any>, env: Cloudflare.Env, ctx: ExecutionContext) {
    return runtimeEntrypoint.queue(batch, env, ctx);
  },
};
