import { getAgentByName } from "agents";
import baseFactoryWorker from "./index";
import type { Outcome, WorkPackage } from "./contracts";
import {
  AI_COST_CONTROL,
  evaluateGuardian,
  independentQualityDecision,
  releaseAuthorityFor,
} from "./worldClassControl";
import {
  createShadowOrchestraPackages,
  createShadowOrchestraProjects,
  ORCHESTRA_PACKAGE_IDS,
  queueMessageFor,
  SHADOW_ORCHESTRA_ID,
  type FactoryQueueMessage,
} from "./shadowOrchestra";

export * from "./index";

const FACTORY_AGENT_NAME = "shadow-primary";
const ORCHESTRA_PACKAGE_SET = new Set<string>(ORCHESTRA_PACKAGE_IDS);

interface FactoryStateView {
  state: { mode: string; lastBatchAt?: string; lastBatchIds?: string[]; lastWorkflowIds?: string[] };
  work: Array<{ id: string; status: string }>;
  outcomes: Array<{ work_package_id: string; completed_at: string }>;
  learning: Array<{ id: string; status: string; created_at: string }>;
  locks: Array<{ scope: string; work_package_id: string; expires_at: string }>;
  workers: unknown[];
}

interface RuntimeHealthView {
  mode: string;
  hourlyScheduleConfigured: boolean;
  lastBatchAt: string | null;
  queue: Array<{ status: string; count: number }>;
  workerCount: number;
  noLiveAuthority: boolean;
}

function packageById(id: string, nowIso = new Date().toISOString()): WorkPackage | undefined {
  return createShadowOrchestraPackages(nowIso).find((pkg) => pkg.id === id);
}

async function factoryAgent(env: Cloudflare.Env) {
  return getAgentByName(env.PRODUCTION_FACTORY, FACTORY_AGENT_NAME);
}

async function orchestraStatus(env: Cloudflare.Env) {
  const agent = await factoryAgent(env);
  const state = (await agent.getFactoryState()) as FactoryStateView;
  const outcomeIds = new Set(state.outcomes.map((outcome) => outcome.work_package_id));
  const active = new Map(state.work.map((work) => [work.id, work.status] as const));
  const packages = createShadowOrchestraPackages();

  const outcomes: Outcome[] = [];
  for (const pkg of packages) {
    if (!outcomeIds.has(pkg.id)) continue;
    // dispatchToWorker is idempotent: when an outcome is already recorded it
    // returns that persisted outcome without re-running the specialist.
    outcomes.push(await agent.dispatchToWorker(pkg.id));
  }

  const accepted = outcomes.filter((outcome) => outcome.status === "ACCEPTED").length;
  const correct = outcomes.filter((outcome) => outcome.status === "CORRECT").length;
  const rejected = outcomes.filter((outcome) => outcome.status === "REJECTED").length;
  const blocked = outcomes.filter((outcome) => outcome.status === "BLOCKED").length;
  const completedIds = new Set(outcomes.map((outcome) => outcome.workPackageId));

  return {
    orchestraId: SHADOW_ORCHESTRA_ID,
    mode: state.state.mode,
    packageCount: packages.length,
    complete: completedIds.size,
    accepted,
    correct,
    rejected,
    blocked,
    firstPassYield: outcomes.length > 0 ? accepted / outcomes.length : null,
    ready: completedIds.size === packages.length && accepted === packages.length,
    packages: packages.map((pkg) => ({
      id: pkg.id,
      projectId: pkg.projectId,
      section: pkg.section,
      productionLine: pkg.productionLine?.lineId ?? null,
      stage: pkg.productionLine?.stage ?? null,
      status: completedIds.has(pkg.id) ? "OUTCOME_RECORDED" : active.get(pkg.id) ?? "NOT_STARTED",
    })),
    traceability: "trace:<orchestra>:<project>:<work-package> is persisted in accepted outcome evidence",
    humanGold: "NOT_PROVEN_BY_ORCHESTRA — browser/source evidence can never self-promote Human Gold",
  };
}

async function startOrchestra(env: Cloudflare.Env) {
  const agent = await factoryAgent(env);
  const health = (await agent.getRuntimeHealth()) as RuntimeHealthView;
  if (health.mode !== "SHADOW") throw new Error("Real orchestra V01 is intentionally restricted to SHADOW");
  if (!health.noLiveAuthority) throw new Error("Real orchestra blocked: runtime unexpectedly has LIVE authority");

  const state = (await agent.getFactoryState()) as FactoryStateView;
  const recorded = new Set(state.outcomes.map((outcome) => outcome.work_package_id));
  const nowIso = new Date().toISOString();
  const projects = createShadowOrchestraProjects(nowIso);
  const packages = createShadowOrchestraPackages(nowIso);

  for (const project of projects) await agent.upsertProject(project);

  const pending = packages.filter((pkg) => !recorded.has(pkg.id));
  for (const pkg of pending) await agent.upsertWorkPackage(pkg);

  if (pending.length > 0) {
    await env.FACTORY_QUEUE.sendBatch(
      pending.map((pkg) => ({ body: queueMessageFor(pkg, nowIso) })),
    );
  }

  return {
    acceptedIntoQueue: pending.length,
    alreadyCompleted: packages.length - pending.length,
    packageCount: packages.length,
    orchestraId: SHADOW_ORCHESTRA_ID,
    mode: "SHADOW",
    liveAuthority: false,
  };
}

async function processQueueMessage(message: Message<FactoryQueueMessage>, env: Cloudflare.Env) {
  const body = message.body;
  if (body.kind !== "WORK_PACKAGE" || body.orchestraId !== SHADOW_ORCHESTRA_ID) {
    message.ack();
    return;
  }
  if (!ORCHESTRA_PACKAGE_SET.has(body.workPackageId)) {
    message.ack();
    return;
  }

  const pkg = packageById(body.workPackageId, body.enqueuedAt);
  if (!pkg) {
    message.ack();
    return;
  }

  try {
    const agent = await factoryAgent(env);
    const health = (await agent.getRuntimeHealth()) as RuntimeHealthView;
    if (health.mode !== "SHADOW" || !health.noLiveAuthority) {
      throw new Error("Andon: queue execution is permitted only in safe SHADOW mode");
    }

    const specialistOutcome = await agent.dispatchToWorker(pkg.id);
    const quality = independentQualityDecision(pkg, specialistOutcome);
    const release = releaseAuthorityFor(pkg, specialistOutcome);
    const gatedOutcome: Outcome = {
      ...specialistOutcome,
      status:
        quality.decision === "ACCEPT"
          ? specialistOutcome.status
          : quality.decision === "REJECT"
            ? "REJECTED"
            : "CORRECT",
      evidence: [
        ...quality.evidence,
        `TRACE ${body.traceId}`,
        `QUEUE-DELIVERY at-least-once idempotency-key=${pkg.id}`,
        `RELEASE-AUTHORITY ${release}`,
      ],
      materialDelta:
        quality.decision === "ACCEPT"
          ? `${specialistOutcome.materialDelta} Independent Quality Authority accepted the bounded evidence package.`
          : `${specialistOutcome.materialDelta} Independent Quality Authority requires correction before acceptance.`,
      actual: `${specialistOutcome.actual} QUALITY=${quality.decision}; RELEASE=${release}; TRACE=${body.traceId}`,
    };

    await agent.finalizeWorkflowOutcome(gatedOutcome);
    message.ack();
  } catch {
    // Cloudflare Queue is at-least-once. Fixed package IDs + recorded outcomes
    // make retries idempotent; after max_retries Wrangler sends the message to DLQ.
    message.retry();
  }
}

async function controlRoom(env: Cloudflare.Env) {
  const agent = await factoryAgent(env);
  const health = (await agent.getRuntimeHealth()) as RuntimeHealthView;
  const state = (await agent.getFactoryState()) as FactoryStateView;
  const orchestra = await orchestraStatus(env);
  const guardian = evaluateGuardian({
    mode: health.mode,
    hourlyScheduleConfigured: health.hourlyScheduleConfigured,
    noLiveAuthority: health.noLiveAuthority,
    queueCounts: health.queue,
    workerCount: health.workerCount,
  });

  return {
    factory: "4PLANET Production Factory 01",
    factoryHealth: guardian,
    mode: health.mode,
    now: {
      hourly24x7: health.hourlyScheduleConfigured,
      lastBatchAt: health.lastBatchAt,
      queue: health.queue,
      workers: health.workerCount,
      locks: state.locks.length,
    },
    output: {
      recentPersistedOutcomes: state.outcomes.length,
      firstRealOrchestra: orchestra,
    },
    quality: {
      makerIsNotJudge: true,
      technicalPassCannotOverrideHumanGold: true,
      founderIsPrimaryHumanTesterUntilFounderGold: true,
      acceptedProductionIsQualityAdjusted: true,
    },
    learning: {
      recentCandidates: state.learning.length,
      promotionLaw: "candidate → repeated distinct instance → governed rule/test → BRAIN; no autonomous Canon promotion",
    },
    cost: AI_COST_CONTROL,
    observability: {
      workerTracing: "CLOUDFLARE_NATIVE_ENABLED",
      workPackageTraceIds: true,
      queueDelivery: "AT_LEAST_ONCE_WITH_IDEMPOTENT_PACKAGE_IDS",
      dlq: "4planet-production-factory-v01-shadow-dlq",
    },
    release: {
      current: "SHADOW_ONLY",
      globalActive: false,
      liveRelease: false,
      externalOutreach: false,
      founderReleaseRequired: true,
    },
    autonomy: {
      durableAgent: true,
      persistentSpecialists: true,
      hourlyScheduler: health.hourlyScheduleConfigured,
      queueTransport: true,
      automaticRetries: true,
      deadLetterQueue: true,
      selfLearningCandidates: true,
      autonomousCanonPromotion: false,
    },
    odin: guardian.severity === "RED"
      ? ["Factory line-stop requires Founder/AXE review before broader activation"]
      : ["No routine operational action required; Founder remains Human Gold judge and external/LIVE release authority"],
  };
}

export default {
  async fetch(request: Request, env: Cloudflare.Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/__factory/control-room") {
      return Response.json(await controlRoom(env));
    }
    if (request.method === "GET" && url.pathname === "/__factory/guardian") {
      const agent = await factoryAgent(env);
      const health = (await agent.getRuntimeHealth()) as RuntimeHealthView;
      return Response.json(
        evaluateGuardian({
          mode: health.mode,
          hourlyScheduleConfigured: health.hourlyScheduleConfigured,
          noLiveAuthority: health.noLiveAuthority,
          queueCounts: health.queue,
          workerCount: health.workerCount,
        }),
      );
    }
    if (request.method === "GET" && url.pathname === "/__factory/orchestra") {
      return Response.json(await orchestraStatus(env));
    }
    if (request.method === "POST" && url.pathname === "/__factory/orchestra/start") {
      return Response.json(await startOrchestra(env));
    }

    return baseFactoryWorker.fetch(request, env);
  },

  async queue(batch: MessageBatch<FactoryQueueMessage>, env: Cloudflare.Env, _ctx: ExecutionContext) {
    await Promise.all(batch.messages.map((message) => processQueueMessage(message, env)));
  },
};
