import { getAgentByName } from "agents";
import activeRuntime from "./activeRuntime";
import type { ProjectProjection, WorkPackage } from "./contracts";
import {
  createShadowOrchestraPackages,
  ORCHESTRA_PACKAGE_IDS,
  queueMessageFor,
} from "./shadowOrchestra";
import {
  buildReadyDrainMarkerId,
  planBuildBoundShadowReadyDrain,
} from "./shadowReadyRecovery";

export * from "./activeRuntime";

const FACTORY_AGENT_NAME = "shadow-primary";
const SHA40 = /^[0-9a-f]{40}$/i;

interface RuntimeEnv extends Cloudflare.Env {
  FACTORY_BUILD_SHA?: string;
}

interface FactoryStateView {
  state: { mode: string };
  projects: Array<{ id: string }>;
  work: Array<{ id: string; status: string }>;
  outcomes: Array<{ work_package_id: string }>;
}

interface ReadyRecoveryObservation {
  exactBuild: string | null;
  selectedIds: string[];
  queuedIds: string[];
  receiptId: string | null;
}

async function factoryAgent(env: RuntimeEnv): Promise<any> {
  const getByName: any = getAgentByName;
  return getByName(env.PRODUCTION_FACTORY, FACTORY_AGENT_NAME);
}

function recoveryReceipt(factoryBuildSha: string, recoveredIds: string[], nowIso: string): ProjectProjection {
  const markerId = buildReadyDrainMarkerId(factoryBuildSha);
  if (!markerId) throw new Error("BUILD_BOUND_READY_RECOVERY_INVALID_SHA");
  return {
    id: markerId,
    name: "Orchestra exact-build READY recovery receipt",
    northStar: "Keep the single SHADOW Factory canary re-entrant across durable state without weakening acceptance or creating parallel execution authority.",
    goal: "Record bounded exact-build re-enqueue evidence for unresolved allowlisted Orchestra rows that are durably READY but no longer represented by a live Queue delivery.",
    current: `Exact-build SHADOW READY recovery queued: ${recoveredIds.join(", ") || "none"}.`,
    gold: "The deployed canary can re-enqueue unresolved READY Orchestra state after transient delivery/tool failure while the READY-to-DISPATCHED transition prevents duplicate concurrent recovery.",
    gap: "Runtime proof remains required; this receipt is observability evidence, not activation evidence.",
    priority: "P0",
    user: "4PLANET Production Factory control",
    authorityRefs: ["FD-2026-09-02", "FACT-G02", "FACT-G07", "Production Factory Autonomous Activation #202"],
    lastMaterialProgressAt: nowIso,
  };
}

async function recoverBuildBoundReadyOrchestra(env: RuntimeEnv): Promise<ReadyRecoveryObservation> {
  const buildSha = env.FACTORY_BUILD_SHA?.trim().toLowerCase() ?? "";
  if (!SHA40.test(buildSha)) {
    return { exactBuild: null, selectedIds: [], queuedIds: [], receiptId: null };
  }

  const markerId = buildReadyDrainMarkerId(buildSha) ?? null;
  const agent = await factoryAgent(env);
  const state = await agent.getFactoryState() as FactoryStateView;
  const recorded = new Set(state.outcomes.map((item) => item.work_package_id));
  const markerPresent = markerId ? state.projects.some((project) => project.id === markerId) : false;
  const recoveryIds = planBuildBoundShadowReadyDrain({
    mode: state.state.mode,
    factoryBuildSha: buildSha,
    // One exact-build recovery enqueue is enough. Once queued, Cloudflare Queue
    // owns bounded retry/backoff. The canary must not race that retry authority
    // by creating fresh duplicate deliveries every few seconds.
    markerPresent,
    orchestraPackageIds: ORCHESTRA_PACKAGE_IDS,
    work: state.work,
    recordedOutcomeIds: recorded,
  });
  if (recoveryIds.length === 0) {
    return {
      exactBuild: buildSha,
      selectedIds: [],
      queuedIds: [],
      receiptId: markerId,
    };
  }

  const nowIso = new Date().toISOString();
  const packageMap = new Map(createShadowOrchestraPackages(nowIso).map((pkg) => [pkg.id, pkg] as const));
  const packages = recoveryIds
    .map((id) => packageMap.get(id))
    .filter((pkg): pkg is WorkPackage => Boolean(pkg));
  if (packages.length !== recoveryIds.length) throw new Error("BUILD_BOUND_READY_RECOVERY_PACKAGE_MISMATCH");

  // Move each exact allowlisted row out of READY before enqueue so repeated
  // public canary reads cannot flood the Queue while the first delivery waits.
  for (const pkg of packages) await agent.upsertWorkPackage({ ...pkg, status: "DISPATCHED" });

  try {
    await env.FACTORY_QUEUE.sendBatch(
      packages.map((pkg) => ({ body: queueMessageFor(pkg, nowIso) })),
    );
  } catch (error) {
    // Send failure must not strand the package in a false in-flight state.
    for (const pkg of packages) await agent.upsertWorkPackage({ ...pkg, status: "READY" });
    throw error;
  }

  await agent.upsertProject(recoveryReceipt(buildSha, recoveryIds, nowIso));
  return {
    exactBuild: buildSha,
    selectedIds: recoveryIds,
    queuedIds: recoveryIds,
    receiptId: markerId,
  };
}

export default {
  async fetch(request: Request, envInput: Cloudflare.Env, ctx: ExecutionContext) {
    const env = envInput as RuntimeEnv;
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/__factory/canary") {
      const before = await recoverBuildBoundReadyOrchestra(env);
      const response = await activeRuntime.fetch(request, env, ctx);
      if (!response.ok) return response;
      const body = await response.json() as Record<string, unknown>;
      const after = await recoverBuildBoundReadyOrchestra(env);
      return Response.json({
        ...body,
        exactBuildReadyRecovery: { before, after },
      }, { status: response.status });
    }
    return activeRuntime.fetch(request, env, ctx);
  },

  async queue(batch: MessageBatch<any>, env: Cloudflare.Env, ctx: ExecutionContext) {
    return activeRuntime.queue(batch, env, ctx);
  },
};
