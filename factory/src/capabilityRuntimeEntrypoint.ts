import { getSandbox } from "@cloudflare/sandbox";
import { getAgentByName } from "agents";
export { Sandbox } from "@cloudflare/sandbox";
import portfolioRuntime from "./portfolioRuntimeEntrypoint";
import {
  type CapabilityRuntimeEnv,
  createComposioConnectionLink,
  createComposioReadOnlySession,
  createOpenAIAgentSession,
  emitLangfuseSpan,
  executeComposioReadOnlyTool,
  privateCapabilityStatus,
  publicCapabilityManifest,
  runAiGatewayProbe,
  runResearchSearch,
  type ResearchProvider,
} from "./capabilityExpansion";

export * from "./portfolioRuntimeEntrypoint";

interface CapabilityControlEnv extends CapabilityRuntimeEnv {
  FACTORY_CONTROL_TOKEN?: string;
  FACTORY_BUILD_SHA?: string;
}

interface RuntimeDelegate {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext): Promise<Response>;
  queue(batch: MessageBatch<any>, env: Cloudflare.Env, ctx: ExecutionContext): Promise<void> | void;
}

const baseRuntime = portfolioRuntime as RuntimeDelegate;
const MAX_CONTROL_BODY_BYTES = 64_000;
const FACTORY_AGENT_NAME = "shadow-primary";
const FACTORY_REPOSITORY = "https://github.com/odinskogen-dev/4Planet.05";
const SHA40 = /^[0-9a-f]{40}$/i;

async function runSandboxFactoryCheck(env: CapabilityControlEnv, reason: "PROBE" | "DAILY") {
  const buildSha = env.FACTORY_BUILD_SHA?.trim().toLowerCase() ?? "";
  if (!SHA40.test(buildSha)) throw new Error("FACTORY_BUILD_SHA_MISSING_OR_INVALID");
  const day = new Date().toISOString().slice(0, 10);
  // Each real execution attempt gets its own budgeted identity. A transient
  // container rollout failure must be retryable, but every retry still consumes
  // the same 25h/month hard-cap ledger.
  const attemptSuffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
  const runId = `sandbox-factory-${reason.toLowerCase()}-${day}-${buildSha.slice(0, 12)}-${attemptSuffix}`;
  const getByName: any = getAgentByName;
  const factory: any = await getByName((env as any).PRODUCTION_FACTORY, FACTORY_AGENT_NAME);
  const reservation = await factory.reserveSandboxRun(runId, 20);
  if (!reservation?.allowed) return { ok: false, runId, reservation, skipped: true };

  const binding = (env as any).SANDBOX;
  if (!binding) throw new Error("CLOUDFLARE_SANDBOX_BINDING_MISSING");
  const sandbox = getSandbox(binding, runId);
  const started = Date.now();
  let finalised = false;
  try {
    const command = [
      "rm -rf /workspace/4planet",
      `git clone --filter=blob:none ${FACTORY_REPOSITORY} /workspace/4planet`,
      `cd /workspace/4planet && git checkout --detach ${buildSha}`,
      "cd /workspace/4planet/factory && npm install --ignore-scripts",
      "cd /workspace/4planet/factory && npm run typecheck",
      "cd /workspace/4planet/factory && npm test",
    ].join(" && ");
    const result = await sandbox.exec(command, { timeout: 18 * 60 * 1000 });
    const usedMinutes = Math.max(1, Math.min(20, Math.ceil((Date.now() - started) / 60_000)));
    await factory.finalizeSandboxRun(runId, usedMinutes, result.success ? "COMPLETED" : "FAILED");
    finalised = true;
    return {
      ok: result.success,
      runId,
      buildSha,
      usedMinutes,
      exitCode: result.exitCode,
      stdout: result.stdout?.slice(-8_000) ?? "",
      stderr: result.stderr?.slice(-8_000) ?? "",
      reservation,
    };
  } catch (error) {
    const usedMinutes = Math.max(1, Math.min(20, Math.ceil((Date.now() - started) / 60_000)));
    if (!finalised) await factory.finalizeSandboxRun(runId, usedMinutes, "FAILED").catch(() => undefined);
    throw error;
  } finally {
    await sandbox.destroy().catch(() => undefined);
  }
}

function authorised(request: Request, env: CapabilityControlEnv): boolean {
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

function founderReleased(request: Request): boolean {
  return request.headers.get("x-founder-release")?.trim().toUpperCase() === "APPROVED";
}

function authFailure(): Response {
  return Response.json({ ok: false, error: "FACTORY_CONTROL_AUTH_REQUIRED" }, { status: 401 });
}

function releaseFailure(): Response {
  return Response.json({
    ok: false,
    error: "FOUNDER_RELEASE_REQUIRED",
    boundary: "External spend/model execution remains Founder-gated.",
  }, { status: 409 });
}

async function boundedJsonBody(request: Request): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_CONTROL_BODY_BYTES) throw new Error("CONTROL_BODY_TOO_LARGE");
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_CONTROL_BODY_BYTES) throw new Error("CONTROL_BODY_TOO_LARGE");
  if (!text) return {};
  const parsed = JSON.parse(text);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("CONTROL_BODY_OBJECT_REQUIRED");
  return parsed as Record<string, unknown>;
}

function errorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : "CAPABILITY_RUNTIME_ERROR";
  const status = message.startsWith("FOUNDER_RELEASE_REQUIRED") ? 409
    : message.endsWith("_MISSING") || message.includes("API_KEY_MISSING") ? 424
      : message.includes("INVALID") || message.includes("NOT_APPROVED") || message.includes("REQUIRED") ? 400
        : 502;
  return Response.json({ ok: false, error: message }, { status });
}

async function capabilityFetch(request: Request, env: CapabilityControlEnv): Promise<Response | undefined> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/__factory/capabilities")) return undefined;

  if (request.method === "GET" && url.pathname === "/__factory/capabilities") {
    return Response.json(publicCapabilityManifest());
  }

  if (!authorised(request, env)) return authFailure();

  try {
    if (request.method === "GET" && url.pathname === "/__factory/capabilities/private") {
      return Response.json(privateCapabilityStatus(env));
    }

    if (request.method === "POST" && url.pathname === "/__factory/capabilities/composio/session") {
      const body = await boundedJsonBody(request);
      const result = await createComposioReadOnlySession(env, body.toolkits);
      return Response.json({ ok: true, ...result });
    }

    if (request.method === "POST" && url.pathname === "/__factory/capabilities/composio/link") {
      const body = await boundedJsonBody(request);
      if (typeof body.sessionId !== "string" || typeof body.toolkit !== "string") throw new Error("COMPOSIO_LINK_INPUT_INVALID");
      const result = await createComposioConnectionLink(env, body.sessionId, body.toolkit);
      return Response.json({ ok: true, ...result });
    }

    if (request.method === "POST" && url.pathname === "/__factory/capabilities/composio/execute") {
      const body = await boundedJsonBody(request);
      if (typeof body.sessionId !== "string" || typeof body.toolSlug !== "string") throw new Error("COMPOSIO_EXECUTION_INPUT_INVALID");
      const args = typeof body.arguments === "object" && body.arguments !== null && !Array.isArray(body.arguments)
        ? body.arguments as Record<string, unknown>
        : {};
      const result = await executeComposioReadOnlyTool(env, body.sessionId, body.toolSlug, args);
      return Response.json({ ok: true, ...result });
    }

    if (request.method === "POST" && url.pathname === "/__factory/capabilities/research") {
      const body = await boundedJsonBody(request);
      if (body.provider !== "exa" && body.provider !== "tavily" && body.provider !== "firecrawl") {
        throw new Error("RESEARCH_PROVIDER_INVALID");
      }
      if (typeof body.query !== "string") throw new Error("RESEARCH_QUERY_INVALID");
      const result = await runResearchSearch(env, body.provider as ResearchProvider, body.query, body.limit);
      await emitLangfuseSpan(env, {
        name: "4planet.factory.research",
        input: { provider: body.provider, query: body.query, limit: body.limit },
        output: { ok: true },
      }).catch(() => undefined);
      return Response.json({ ok: true, ...result });
    }

    if (request.method === "POST" && url.pathname === "/__factory/capabilities/openai-agent") {
      if (!founderReleased(request)) return releaseFailure();
      const body = await boundedJsonBody(request);
      if (typeof body.input !== "string") throw new Error("OPENAI_AGENT_INPUT_INVALID");
      const result = await createOpenAIAgentSession(env, body.input);
      await emitLangfuseSpan(env, {
        name: "4planet.factory.openai_agent_session",
        input: { role: "SPECIALIST_MAKER", input: body.input.slice(0, 2_000) },
        output: { created: true, judge: "SEPARATE_REQUIRED" },
      }).catch(() => undefined);
      return Response.json({ ok: true, ...result });
    }

    if (request.method === "POST" && url.pathname === "/__factory/capabilities/sandbox/probe") {
      const result = await runSandboxFactoryCheck(env, "PROBE");
      return Response.json(result, { status: result.ok ? 200 : 409 });
    }

    if (request.method === "POST" && url.pathname === "/__factory/capabilities/ai-gateway/probe") {
      if (!founderReleased(request)) return releaseFailure();
      const result = await runAiGatewayProbe(env);
      await emitLangfuseSpan(env, {
        name: "4planet.factory.ai_gateway_probe",
        input: { gatewayId: result.gatewayId, model: result.model },
        output: { ok: true },
      }).catch(() => undefined);
      return Response.json({ ok: true, ...result });
    }

    return Response.json({ ok: false, error: "CAPABILITY_ROUTE_NOT_FOUND" }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}

async function scheduledWake(
  controller: ScheduledController,
  env: CapabilityControlEnv,
  ctx: ExecutionContext,
): Promise<void> {
  const startedAt = new Date().toISOString();
  try {
    // The existing public canary already performs exact-build recovery and the
    // portfolio entrypoint extends it with one bounded Night Shift dispatch.
    // Reusing it preserves one Conductor/Factory execution path instead of
    // introducing a second scheduler or truth store.
    const request = new Request("https://factory.internal/__factory/canary", {
      method: "GET",
      headers: { "x-factory-scheduled-wake": controller.cron },
    });
    const response = await baseRuntime.fetch(request, env, ctx);
    const body = await response.text();
    const scheduledDate = new Date(controller.scheduledTime);
    const sandboxDaily = scheduledDate.getUTCHours() === 2
      ? await runSandboxFactoryCheck(env, "DAILY").catch((error) => ({
          ok: false,
          error: error instanceof Error ? error.message : "SANDBOX_DAILY_CHECK_FAILED",
        }))
      : null;
    const output = {
      ok: response.ok,
      status: response.status,
      body: body.slice(0, 4_000),
      sandboxDaily,
    };
    console.log("FACTORY_SCHEDULED_WAKE", JSON.stringify({ cron: controller.cron, startedAt, ...output }));
    await emitLangfuseSpan(env, {
      name: "4planet.factory.scheduled_wake",
      input: { cron: controller.cron, scheduledTime: controller.scheduledTime, startedAt },
      output,
      level: response.ok ? "DEFAULT" : "ERROR",
    }).catch(() => undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : "SCHEDULED_WAKE_FAILED";
    console.error("FACTORY_SCHEDULED_WAKE_FAILED", message);
    await emitLangfuseSpan(env, {
      name: "4planet.factory.scheduled_wake",
      input: { cron: controller.cron, scheduledTime: controller.scheduledTime, startedAt },
      output: { ok: false, error: message },
      level: "ERROR",
    }).catch(() => undefined);
  }
}

export default {
  async fetch(request: Request, envInput: Cloudflare.Env, ctx: ExecutionContext) {
    const env = envInput as CapabilityControlEnv;
    const capabilityResponse = await capabilityFetch(request, env);
    if (capabilityResponse) return capabilityResponse;
    return baseRuntime.fetch(request, env, ctx);
  },

  async queue(batch: MessageBatch<any>, env: Cloudflare.Env, ctx: ExecutionContext) {
    return baseRuntime.queue(batch, env, ctx);
  },

  async scheduled(controller: ScheduledController, envInput: Cloudflare.Env, ctx: ExecutionContext) {
    const env = envInput as CapabilityControlEnv;
    ctx.waitUntil(scheduledWake(controller, env, ctx));
  },
};
