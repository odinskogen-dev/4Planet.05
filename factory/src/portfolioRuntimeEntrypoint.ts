import { getAgentByName } from "agents";
import runtimeEntrypoint from "./runtimeEntrypoint";
import {
  createPortfolioFallbackQueue,
  isOnlyReceiverWriterConflict,
} from "./portfolioFallback";
import { localReadOnlyWorkflowParkDecision } from "./localInFlightPark";

export * from "./runtimeEntrypoint";

const FACTORY_AGENT_NAME = "shadow-primary";
const SHA40 = /^[0-9a-f]{40}$/i;

interface PortfolioRuntimeEnv extends Cloudflare.Env {
  FACTORY_BUILD_SHA?: string;
  FACTORY_CONTROL_TOKEN?: string;
  FACTORY_TEST_KING_BASE_SHA?: string;
}

type FactoryStateView = {
  projects?: Array<{ id?: string }>;
  work?: Array<{ id?: string; status?: string }>;
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

  for (const pkg of queue.packages) {
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
      { workPackageId: pkg.id },
      {
        id: workflowId,
        metadata: {
          portfolioFallback: true,
          authority: "4PLANET_AUTONOMOUS_VALUE_CLOSURE_02",
          projectId: pkg.projectId,
          section: pkg.section,
          exactFactorySha,
          exactTestSha,
          readOnly: true,
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
        portfolioRule: "LOCAL RECEIVER/PROVIDER BLOCK -> PARK ONLY LOCAL READ-ONLY CAPABILITY -> DISPATCH NEXT LEGAL PACKAGE",
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