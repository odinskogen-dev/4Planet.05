import { getAgentByName } from "agents";
import activeRuntime from "./activeRuntime";
import type { ProjectProjection, WorkPackage } from "./contracts";
import { receiverAuthorityCurrent, requireCurrentReceiver } from "./receiverAuthority";
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
const REPOSITORY = "odinskogen-dev/4Planet.05";
const TEST_BRANCH = "king/test";
const SHA40 = /^[0-9a-f]{40}$/i;

interface RuntimeEnv extends Cloudflare.Env {
  FACTORY_BUILD_SHA?: string;
  FACTORY_GITHUB_TOKEN?: string;
  FACTORY_TEST_KING_BASE_SHA?: string;
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

async function currentTestKingSha(env: RuntimeEnv): Promise<string> {
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
  const sha = body.object?.sha?.trim().toLowerCase() ?? "";
  if (!SHA40.test(sha)) throw new Error("CURRENT_TEST_KING_SHA_INVALID");
  return sha;
}

async function failClosedStaleActiveReceiver(env: RuntimeEnv): Promise<{ baseSha: string; currentSha: string; demoted: boolean }> {
  const baseSha = env.FACTORY_TEST_KING_BASE_SHA?.trim().toLowerCase() ?? "";
  const currentSha = await currentTestKingSha(env);
  const agent = await factoryAgent(env);
  const state = await agent.getFactoryState() as FactoryStateView;
  const current = receiverAuthorityCurrent(baseSha, currentSha);
  if (state.state.mode === "ACTIVE" && !current) {
    await agent.setMode("SHADOW");
    return { baseSha, currentSha, demoted: true };
  }
  return { baseSha, currentSha, demoted: false };
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
  const exactOutcomes = await agent.getOutcomesByIds([...ORCHESTRA_PACKAGE_IDS]) as Array<{ workPackageId: string }>;
  const recorded = new Set(exactOutcomes.map((item) => item.workPackageId));
  const markerPresent = markerId ? state.projects.some((project) => project.id === markerId) : false;
  const recoveryIds = planBuildBoundShadowReadyDrain({
    mode: state.state.mode,
    factoryBuildSha: buildSha,
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

  for (const pkg of packages) await agent.upsertWorkPackage({ ...pkg, status: "DISPATCHED" });

  try {
    await env.FACTORY_QUEUE.sendBatch(
      packages.map((pkg) => ({ body: queueMessageFor(pkg, nowIso) })),
    );
  } catch (error) {
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

    if (url.pathname.startsWith("/__factory/")) {
      try {
        await failClosedStaleActiveReceiver(env);
      } catch (error) {
        const agent = await factoryAgent(env);
        const state = await agent.getFactoryState() as FactoryStateView;
        if (state.state.mode === "ACTIVE") await agent.setMode("SHADOW");
        return Response.json({
          ok: false,
          active: false,
          error: error instanceof Error ? error.message : "TEST_KING_AUTHORITY_REVALIDATION_FAILED",
        }, { status: 409 });
      }
    }

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

    if (request.method === "POST" && url.pathname === "/__factory/activation-proof/status") {
      const response = await activeRuntime.fetch(request, env, ctx);
      const body = await response.clone().json().catch(() => null) as Record<string, unknown> | null;
      if (response.ok && body?.active === true) {
        try {
          const baseSha = env.FACTORY_TEST_KING_BASE_SHA?.trim().toLowerCase() ?? "";
          const terminalTestSha = await currentTestKingSha(env);
          requireCurrentReceiver(baseSha, terminalTestSha, "TERMINAL_ACTIVE");
        } catch (error) {
          const agent = await factoryAgent(env);
          await agent.setMode("SHADOW");
          return Response.json({
            ...(body ?? {}),
            ok: false,
            active: false,
            gate: { ready: false, missing: ["TERMINAL_TEST_KING_AUTHORITY"] },
            error: error instanceof Error ? error.message : "TERMINAL_TEST_KING_AUTHORITY_FAILED",
          }, { status: 409 });
        }
      }
      return response;
    }

    return activeRuntime.fetch(request, env, ctx);
  },

  async queue(batch: MessageBatch<any>, env: Cloudflare.Env, ctx: ExecutionContext) {
    return activeRuntime.queue(batch, env, ctx);
  },
};
