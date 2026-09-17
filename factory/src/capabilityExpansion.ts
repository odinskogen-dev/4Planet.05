import { APPROVED_FACTORY_AI_MODEL } from "./aiBudgetPolicy";

export const AUTONOMY_CAPABILITY_VERSION = "AUTONOMY_CAPABILITY_EXPANSION_01";

const COMPOSIO_BASE_URL = "https://backend.composio.dev/api/v3.1";
const COMPOSIO_USER_ID = "4planet-factory";
const MAX_EXTERNAL_RESPONSE_BYTES = 1_000_000;
const MAX_RESEARCH_RESULTS = 8;
const DEFAULT_OPENAI_AGENT_MODEL = "gpt-6-astra";
const DEFAULT_LANGFUSE_BASE_URL = "https://cloud.langfuse.com";

const COMPOSIO_TOOLKITS = new Set(["github", "gmail", "googledrive"]);
const READ_ONLY_ACTION_PREFIXES = [
  "GET_",
  "LIST_",
  "SEARCH_",
  "FIND_",
  "READ_",
  "LOOKUP_",
  "RETRIEVE_",
  "FETCH_",
  "DOWNLOAD_",
  "EXPORT_",
  "CHECK_",
  "BATCH_GET_",
];
const MUTATING_ACTION_TOKENS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "SEND",
  "PUBLISH",
  "POST",
  "COMMENT",
  "REPLY",
  "FORWARD",
  "MERGE",
  "APPROVE",
  "INVITE",
  "UPLOAD",
  "MOVE",
  "RENAME",
  "ARCHIVE",
  "TRASH",
  "ADD_",
  "REMOVE_",
  "INSERT",
  "CLEAR",
  "COPY",
  "SUBMIT",
  "SCHEDULE",
  "PAY",
  "REFUND",
  "TRANSFER",
  "EXECUTE",
  "RUN_",
  "WRITE",
  "EDIT",
  "SET_",
];

export type ResearchProvider = "exa" | "tavily" | "firecrawl";

export interface CapabilityRuntimeEnv extends Cloudflare.Env {
  COMPOSIO_API_KEY?: string;
  OPENAI_API_KEY?: string;
  OPENAI_AGENTS_MODEL?: string;
  LANGFUSE_PUBLIC_KEY?: string;
  LANGFUSE_SECRET_KEY?: string;
  LANGFUSE_BASE_URL?: string;
  EXA_API_KEY?: string;
  TAVILY_API_KEY?: string;
  FIRECRAWL_API_KEY?: string;
  FACTORY_AI_GATEWAY_ID?: string;
}

interface AiGatewayBinding {
  run(model: string, input: unknown, options?: { gateway?: { id: string } }): Promise<unknown>;
}

function secret(env: CapabilityRuntimeEnv, key: keyof CapabilityRuntimeEnv): string {
  const value = env[key];
  return typeof value === "string" ? value.trim() : "";
}

function configured(value: string): "CONFIGURED" | "BLOCKED_SECRET" {
  return value ? "CONFIGURED" : "BLOCKED_SECRET";
}

export function publicCapabilityManifest() {
  return {
    ok: true,
    version: AUTONOMY_CAPABILITY_VERSION,
    architecture: {
      cloudflareAgents: "EXISTING",
      cloudflareWorkflows: "EXISTING",
      browserRun: "EXISTING",
      workersAi: "EXISTING",
      makerJudgeSeparation: "PRESERVED",
      founderRelease: "PRESERVED",
    },
    integrations: {
      composio: "BOUND_OPTIONAL_SECRET",
      openaiAgents: "BOUND_OPTIONAL_SECRET_FOUNDER_RELEASE",
      langfuse: "BOUND_OPTIONAL_SECRET",
      aiGateway: "BOUND_EXISTING_AI",
      research: ["exa", "tavily", "firecrawl"],
    },
    safety: {
      composio: "READ_ONLY_SESSION_AND_LOCAL_TOOL_POLICY",
      openaiAgents: "NO_TOOLS_NO_SANDBOX_AUTORUN; FOUNDER_RELEASE_REQUIRED",
      research: "READ_ONLY; NEVER_AUTORUN_WITHOUT_KEY",
      scheduledWake: "EXISTING_SHADOW_CANARY_AND_NIGHT_SHIFT_ONLY",
    },
  };
}

export function privateCapabilityStatus(env: CapabilityRuntimeEnv) {
  return {
    ...publicCapabilityManifest(),
    readiness: {
      composio: configured(secret(env, "COMPOSIO_API_KEY")),
      openaiAgents: configured(secret(env, "OPENAI_API_KEY")),
      langfuse: secret(env, "LANGFUSE_PUBLIC_KEY") && secret(env, "LANGFUSE_SECRET_KEY")
        ? "CONFIGURED"
        : "BLOCKED_SECRET",
      exa: configured(secret(env, "EXA_API_KEY")),
      tavily: configured(secret(env, "TAVILY_API_KEY")),
      firecrawl: configured(secret(env, "FIRECRAWL_API_KEY")),
      aiGateway: "CONFIGURED",
      aiGatewayId: secret(env, "FACTORY_AI_GATEWAY_ID") || "default",
    },
  };
}

export function normaliseComposioToolkits(toolkits: unknown): string[] {
  const requested = Array.isArray(toolkits) && toolkits.length > 0
    ? toolkits.filter((item): item is string => typeof item === "string")
    : ["github", "gmail", "googledrive"];
  const normalised = [...new Set(requested.map((item) => item.trim().toLowerCase()).filter(Boolean))];
  if (normalised.length === 0) throw new Error("COMPOSIO_TOOLKIT_REQUIRED");
  for (const toolkit of normalised) {
    if (!COMPOSIO_TOOLKITS.has(toolkit)) throw new Error(`COMPOSIO_TOOLKIT_NOT_APPROVED:${toolkit}`);
  }
  return normalised;
}

export function isComposioReadOnlyToolSlug(toolSlug: string): boolean {
  const slug = toolSlug.trim().toUpperCase();
  if (!slug || slug.startsWith("COMPOSIO_")) return false;
  if (MUTATING_ACTION_TOKENS.some((token) => slug.includes(`_${token}`) || slug.endsWith(`_${token}`))) return false;
  const underscore = slug.indexOf("_");
  if (underscore < 1 || underscore === slug.length - 1) return false;
  const action = slug.slice(underscore + 1);
  return READ_ONLY_ACTION_PREFIXES.some((prefix) => action.startsWith(prefix));
}

async function readBoundedText(response: Response, maxBytes = MAX_EXTERNAL_RESPONSE_BYTES): Promise<string> {
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (declared > maxBytes) throw new Error(`CAPABILITY_RESPONSE_TOO_LARGE:${maxBytes}`);
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel("bounded capability response limit exceeded");
        throw new Error(`CAPABILITY_RESPONSE_TOO_LARGE:${maxBytes}`);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return text;
  } finally {
    reader.releaseLock();
  }
}

async function jsonRequest(
  label: string,
  url: string,
  init: RequestInit,
  maxBytes = MAX_EXTERNAL_RESPONSE_BYTES,
): Promise<unknown> {
  const response = await fetch(url, init);
  const text = await readBoundedText(response, maxBytes);
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text.slice(0, 8_000) };
    }
  }
  if (!response.ok) {
    const summary = typeof body === "object" && body !== null ? JSON.stringify(body).slice(0, 1_200) : String(body).slice(0, 1_200);
    throw new Error(`${label}_HTTP_${response.status}:${summary}`);
  }
  return body;
}

function composioHeaders(env: CapabilityRuntimeEnv): HeadersInit {
  const apiKey = secret(env, "COMPOSIO_API_KEY");
  if (!apiKey) throw new Error("COMPOSIO_API_KEY_MISSING");
  return {
    "content-type": "application/json",
    "x-api-key": apiKey,
  };
}

export async function createComposioReadOnlySession(env: CapabilityRuntimeEnv, requestedToolkits?: unknown) {
  const toolkits = normaliseComposioToolkits(requestedToolkits);
  const body = await jsonRequest(
    "COMPOSIO_SESSION",
    `${COMPOSIO_BASE_URL}/tool_router/session`,
    {
      method: "POST",
      headers: composioHeaders(env),
      body: JSON.stringify({
        user_id: COMPOSIO_USER_ID,
        toolkits: { enable: toolkits },
        tags: { enable: ["readOnlyHint"] },
        manage_connections: {
          enable: true,
          enable_wait_for_connections: false,
          enable_connection_removal: false,
        },
        search: { enable: true },
        execute: { enable_multi_execute: false },
        workbench: { enable: false, enable_proxy_execution: false },
      }),
    },
  );
  return { toolkits, session: body };
}

export async function createComposioConnectionLink(
  env: CapabilityRuntimeEnv,
  sessionId: string,
  toolkitInput: string,
) {
  if (!/^trs_[A-Za-z0-9_-]+$/.test(sessionId)) throw new Error("COMPOSIO_SESSION_ID_INVALID");
  const [toolkit] = normaliseComposioToolkits([toolkitInput]);
  const body = await jsonRequest(
    "COMPOSIO_LINK",
    `${COMPOSIO_BASE_URL}/tool_router/session/${encodeURIComponent(sessionId)}/link`,
    {
      method: "POST",
      headers: composioHeaders(env),
      body: JSON.stringify({ toolkit }),
    },
  );
  return { toolkit, link: body };
}

export async function executeComposioReadOnlyTool(
  env: CapabilityRuntimeEnv,
  sessionId: string,
  toolSlug: string,
  args: Record<string, unknown> = {},
) {
  if (!/^trs_[A-Za-z0-9_-]+$/.test(sessionId)) throw new Error("COMPOSIO_SESSION_ID_INVALID");
  if (!isComposioReadOnlyToolSlug(toolSlug)) throw new Error(`FOUNDER_RELEASE_REQUIRED:${toolSlug}`);
  const body = await jsonRequest(
    "COMPOSIO_EXECUTE",
    `${COMPOSIO_BASE_URL}/tool_router/session/${encodeURIComponent(sessionId)}/execute`,
    {
      method: "POST",
      headers: composioHeaders(env),
      body: JSON.stringify({ tool_slug: toolSlug.trim().toUpperCase(), arguments: args }),
    },
  );
  return { toolSlug: toolSlug.trim().toUpperCase(), result: body };
}

function clampResearchLimit(limit: unknown): number {
  const value = typeof limit === "number" && Number.isFinite(limit) ? Math.floor(limit) : 5;
  return Math.max(1, Math.min(MAX_RESEARCH_RESULTS, value));
}

export async function runResearchSearch(
  env: CapabilityRuntimeEnv,
  provider: ResearchProvider,
  queryInput: string,
  limitInput?: unknown,
) {
  const query = queryInput.trim();
  if (query.length < 3 || query.length > 500) throw new Error("RESEARCH_QUERY_INVALID");
  const limit = clampResearchLimit(limitInput);

  if (provider === "exa") {
    const apiKey = secret(env, "EXA_API_KEY");
    if (!apiKey) throw new Error("EXA_API_KEY_MISSING");
    const data = await jsonRequest("EXA_SEARCH", "https://api.exa.ai/search", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ query, type: "fast", numResults: limit }),
    });
    return { provider, query, limit, data };
  }

  if (provider === "tavily") {
    const apiKey = secret(env, "TAVILY_API_KEY");
    if (!apiKey) throw new Error("TAVILY_API_KEY_MISSING");
    const data = await jsonRequest("TAVILY_SEARCH", "https://api.tavily.com/search", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: limit,
        include_answer: false,
        include_raw_content: false,
      }),
    });
    return { provider, query, limit, data };
  }

  const apiKey = secret(env, "FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY_MISSING");
  const data = await jsonRequest("FIRECRAWL_SEARCH", "https://api.firecrawl.dev/v2/search", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ query, limit }),
  });
  return { provider, query, limit, data };
}

export async function createOpenAIAgentSession(env: CapabilityRuntimeEnv, inputText: string) {
  const apiKey = secret(env, "OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");
  const input = inputText.trim();
  if (input.length < 3 || input.length > 12_000) throw new Error("OPENAI_AGENT_INPUT_INVALID");
  const model = secret(env, "OPENAI_AGENTS_MODEL") || DEFAULT_OPENAI_AGENT_MODEL;
  const data = await jsonRequest("OPENAI_AGENTS", "https://api.openai.com/v1/agents/sessions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      environment: { type: "none" },
      agent: {
        model,
        instructions: "You are a bounded specialist worker inside 4PLANET Factory. Produce evidence and analysis only. Do not release externally, spend money, mutate production, promote Canon, or judge your own work.",
        multi_agent: { enabled: true, max_concurrent_subagents: 3 },
      },
      input,
      metadata: {
        system: "4PLANET_FACTORY",
        role: "SPECIALIST_MAKER",
        judge: "SEPARATE_REQUIRED",
        release: "FOUNDER_GATED",
      },
    }),
  });
  return { provider: "OPENAI", model, session: data };
}

export async function runAiGatewayProbe(env: CapabilityRuntimeEnv) {
  const ai = (env as CapabilityRuntimeEnv & { AI?: AiGatewayBinding }).AI;
  if (!ai?.run) throw new Error("CLOUDFLARE_AI_BINDING_MISSING");
  const gatewayId = secret(env, "FACTORY_AI_GATEWAY_ID") || "default";
  const data = await ai.run(
    APPROVED_FACTORY_AI_MODEL,
    {
      messages: [
        { role: "system", content: "Return strict JSON only." },
        { role: "user", content: "Return {\"ok\":true,\"purpose\":\"4PLANET Factory AI Gateway capability probe\"}." },
      ],
      temperature: 0,
      max_completion_tokens: 96,
      response_format: { type: "json_object" },
    },
    { gateway: { id: gatewayId } },
  );
  return { gatewayId, model: APPROVED_FACTORY_AI_MODEL, data };
}

function randomHex(bytes: number): string {
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return [...values].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function boundedJson(value: unknown): string {
  const text = JSON.stringify(value ?? null);
  return text.length <= 4_000 ? text : `${text.slice(0, 3_980)}…`;
}

export async function emitLangfuseSpan(
  env: CapabilityRuntimeEnv,
  span: { name: string; input?: unknown; output?: unknown; level?: "DEFAULT" | "ERROR" },
): Promise<{ sent: boolean; status?: number }> {
  const publicKey = secret(env, "LANGFUSE_PUBLIC_KEY");
  const secretKey = secret(env, "LANGFUSE_SECRET_KEY");
  if (!publicKey || !secretKey) return { sent: false };
  const baseUrl = (secret(env, "LANGFUSE_BASE_URL") || DEFAULT_LANGFUSE_BASE_URL).replace(/\/$/, "");
  const traceId = randomHex(16);
  const spanId = randomHex(8);
  const start = BigInt(Date.now()) * 1_000_000n;
  const end = start + 1_000_000n;
  const body = {
    resourceSpans: [{
      resource: {
        attributes: [
          { key: "service.name", value: { stringValue: "4planet-production-factory" } },
          { key: "service.version", value: { stringValue: AUTONOMY_CAPABILITY_VERSION } },
        ],
      },
      scopeSpans: [{
        scope: { name: "4planet.factory.autonomy" },
        spans: [{
          traceId,
          spanId,
          name: span.name,
          startTimeUnixNano: start.toString(),
          endTimeUnixNano: end.toString(),
          attributes: [
            { key: "langfuse.observation.input", value: { stringValue: boundedJson(span.input) } },
            { key: "langfuse.observation.output", value: { stringValue: boundedJson(span.output) } },
            { key: "langfuse.observation.level", value: { stringValue: span.level ?? "DEFAULT" } },
          ],
        }],
      }],
    }],
  };
  const auth = btoa(`${publicKey}:${secretKey}`);
  const response = await fetch(`${baseUrl}/api/public/otel/v1/traces`, {
    method: "POST",
    headers: {
      authorization: `Basic ${auth}`,
      "content-type": "application/json",
      "x-langfuse-ingestion-version": "4",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await readBoundedText(response, 16_000).catch(() => "");
    console.error("LANGFUSE_EXPORT_FAILED", response.status, text.slice(0, 1_000));
    return { sent: false, status: response.status };
  }
  await response.body?.cancel().catch(() => undefined);
  return { sent: true, status: response.status };
}
