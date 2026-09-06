// 4PLANET CNS Gateway / MCP-compatible JSON-RPC transport
// Server-side only. No credentials are committed. Runtime requires DB, gateway and GitHub secrets.
// Current code claims fail closed unless active GitHub state is verified live first.

import postgres from "npm:postgres@3.4.5";

const DB_URL = Deno.env.get("SUPABASE_DB_URL");
const GATEWAY_TOKEN = Deno.env.get("CNS_GATEWAY_TOKEN");
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
if (!DB_URL || !GATEWAY_TOKEN || !GITHUB_TOKEN) {
  throw new Error("CNS_GATEWAY_FAIL_CLOSED: required runtime secrets missing");
}

const sql = postgres(DB_URL, { max: 5, prepare: false, idle_timeout: 20 });

type DbRow = Record<string, unknown>;
type GitHubJson = Record<string, unknown>;

const tools = [
  ["brain.get_project", "Read generated Project Home after live code verification"],
  ["brain.get_current_state", "Read fresh operational project projection after live code verification"],
  ["brain.get_context", "Compile deterministic L0-L4 context snapshot after live code verification"],
  ["brain.get_dependencies", "Read open project dependencies"],
  ["brain.get_memory", "Read active scoped memory"],
  ["brain.search_history", "Search immutable project event history"],
  ["work.get_next", "Read next eligible queued work"],
  ["work.acquire_lease", "Acquire collision-safe work scopes"],
  ["work.heartbeat", "Refresh an active lease"],
  ["work.release_lease", "Release an active lease"],
  ["code.get_current_line", "Live-verify GitHub and return active code line"],
  ["code.sync_live", "Force live GitHub reconciliation for a project"],
  ["prototype.get_current", "Read active/fixed/production prototype identities"],
  ["event.commit", "Append immutable event"],
  ["health.check", "Run Doctor deterministic invariants"],
  ["health.get_incidents", "Read open health incidents"],
  ["librarian.propose", "Create deduplicated memory candidate"],
  ["librarian.promote", "Promote a reviewed memory candidate"],
  ["evaluator.get_run", "Read independent evaluator run/assertions"]
].map(([name, description]) => ({
  name,
  description,
  inputSchema: { type: "object", additionalProperties: true }
}));

function requireString(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`CNS_GATEWAY_INVALID_${key.toUpperCase()}`);
  }
  return value;
}

async function githubJson(url: string): Promise<GitHubJson | GitHubJson[]> {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "4planet-cns-gateway"
    }
  });
  if (!response.ok) {
    throw new Error(`CNS_GITHUB_LIVE_REQUIRED:${response.status}`);
  }
  return await response.json();
}

function asObject(value: unknown): GitHubJson {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("CNS_GITHUB_INVALID_RESPONSE");
  }
  return value as GitHubJson;
}

function nestedString(obj: GitHubJson, first: string, second: string): string | null {
  const child = obj[first];
  if (!child || typeof child !== "object" || Array.isArray(child)) return null;
  const value = (child as GitHubJson)[second];
  return typeof value === "string" ? value : null;
}

async function readGitHubCodeState(line: DbRow) {
  const repository = String(line.repository ?? "");
  const branch = String(line.branch ?? "");
  const codeLineId = String(line.code_line_id ?? "");
  if (!repository || !branch || !codeLineId || !repository.includes("/")) {
    throw new Error("CNS_GITHUB_CODE_LINE_INCOMPLETE");
  }

  const commitRaw = await githubJson(
    `https://api.github.com/repos/${repository}/commits/${encodeURIComponent(branch)}`
  );
  const commit = asObject(commitRaw);
  const observedSha = typeof commit.sha === "string" ? commit.sha : null;
  if (!observedSha) throw new Error("CNS_GITHUB_SHA_REQUIRED");

  let prState = "NO_PR";
  let mergeState = "NO_PR";
  let prRevision = "no-pr";
  const prNumber = Number(line.pr_number ?? 0);

  if (Number.isInteger(prNumber) && prNumber > 0) {
    const pr = asObject(await githubJson(`https://api.github.com/repos/${repository}/pulls/${prNumber}`));
    const prHeadSha = nestedString(pr, "head", "sha");
    if (prHeadSha && prHeadSha !== observedSha) {
      throw new Error("CNS_GITHUB_HEAD_MISMATCH");
    }
    prState = typeof pr.state === "string" ? pr.state.toUpperCase() : "UNKNOWN";
    if (pr.merged === true) mergeState = "MERGED";
    else if (pr.mergeable === true) mergeState = "MERGEABLE";
    else if (pr.mergeable === false) mergeState = "CONFLICTING";
    else mergeState = "UNKNOWN";
    prRevision = typeof pr.updated_at === "string" ? pr.updated_at : "unknown";
  }

  let deploymentState = "UNVERIFIED";
  let deploymentRef: string | null = null;
  const deploymentsRaw = await githubJson(
    `https://api.github.com/repos/${repository}/deployments?sha=${encodeURIComponent(observedSha)}&per_page=1`
  );
  if (!Array.isArray(deploymentsRaw)) throw new Error("CNS_GITHUB_DEPLOYMENTS_INVALID");
  if (deploymentsRaw.length > 0) {
    const deployment = asObject(deploymentsRaw[0]);
    deploymentRef = deployment.id === undefined ? null : String(deployment.id);
    const statusesUrl = typeof deployment.statuses_url === "string" ? deployment.statuses_url : null;
    if (statusesUrl?.startsWith("https://api.github.com/")) {
      const statusesRaw = await githubJson(`${statusesUrl}?per_page=1`);
      if (!Array.isArray(statusesRaw)) throw new Error("CNS_GITHUB_DEPLOYMENT_STATUS_INVALID");
      if (statusesRaw.length > 0) {
        const status = asObject(statusesRaw[0]);
        deploymentState = typeof status.state === "string" ? status.state.toUpperCase() : "UNKNOWN";
      } else {
        deploymentState = "NO_STATUS";
      }
    }
  }

  const sourceRevision = `github:${observedSha}:${prRevision}:${deploymentRef ?? "none"}:${deploymentState}`;
  const idempotencyKey = `github-live:${codeLineId}:${sourceRevision}`;

  await sql`select cns.observe_code_state(
    ${codeLineId},
    ${observedSha},
    ${prState},
    ${mergeState},
    ${deploymentState},
    ${deploymentRef},
    ${sourceRevision},
    ${idempotencyKey},
    300
  ) as event_id`;

  return { codeLineId, observedSha, prState, mergeState, deploymentState, deploymentRef };
}

async function syncProjectCode(projectId: string) {
  const lines = await sql`
    select * from cns.code_lines
    where project_id=${projectId}
      and role in ('ACTIVE_DEVELOPMENT','PRODUCTION')
    order by seam, role
  `;
  const states = [];
  for (const line of lines) states.push(await readGitHubCodeState(line as DbRow));
  return states;
}

async function callTool(name: string, a: Record<string, unknown>) {
  switch (name) {
    case "brain.get_project": {
      const id = requireString(a, "project_id");
      await syncProjectCode(id);
      return await sql`select * from cns.v_project_home where project_id=${id}`;
    }
    case "brain.get_current_state": {
      const id = requireString(a, "project_id");
      await syncProjectCode(id);
      const rows = await sql`select * from cns.project_current_state where project_id=${id}`;
      if (!rows[0]) throw new Error("CNS_CURRENT_STATE_REQUIRED");
      if (new Date(String(rows[0].stale_after)).getTime() <= Date.now()) {
        throw new Error("CNS_CURRENT_STATE_STALE");
      }
      return rows;
    }
    case "brain.get_context": {
      const id = requireString(a, "project_id");
      await syncProjectCode(id);
      const intent = requireString(a, "intent");
      const depth = Number(a.depth ?? 2);
      const budget = Number(a.token_budget ?? 12000);
      const ttl = Number(a.ttl_seconds ?? 900);
      const r = await sql`select cns.compile_project_context(${id},${intent},${depth},${budget},${ttl}) as context_snapshot_id`;
      return await sql`select * from cns.context_snapshots where context_snapshot_id=${r[0].context_snapshot_id}`;
    }
    case "brain.get_dependencies": {
      const id = requireString(a, "project_id");
      return await sql`select * from cns.dependencies where project_id=${id} and state='OPEN' order by dependency_id`;
    }
    case "brain.get_memory": {
      const id = requireString(a, "project_id");
      const depth = Number(a.depth ?? 2);
      return await sql`select * from cns.memory_items where (project_id=${id} or project_id is null) and state='ACTIVE' and depth<=${depth} order by depth,updated_at desc limit 500`;
    }
    case "brain.search_history": {
      const id = requireString(a, "project_id");
      const eventType = typeof a.event_type === "string" ? a.event_type : null;
      const limit = Math.min(Number(a.limit ?? 100), 1000);
      return eventType
        ? await sql`select * from cns.events where project_id=${id} and event_type=${eventType} order by event_id desc limit ${limit}`
        : await sql`select * from cns.events where project_id=${id} order by event_id desc limit ${limit}`;
    }
    case "work.get_next": {
      const limit = Math.min(Number(a.limit ?? 20), 100);
      return await sql`select * from cns.jobs where state='QUEUED' and available_at<=now() order by priority,available_at limit ${limit}`;
    }
    case "work.acquire_lease": {
      const project = requireString(a, "project_id");
      const agent = requireString(a, "agent_id");
      const task = typeof a.task_id === "string" ? a.task_id : null;
      const scopes = Array.isArray(a.scope_keys) ? a.scope_keys.map(String) : [];
      if (scopes.length === 0) throw new Error("CNS_LEASE_SCOPE_REQUIRED");
      const baseSha = typeof a.base_sha === "string" ? a.base_sha : null;
      const ttl = Number(a.ttl_seconds ?? 3600);
      return await sql`select cns.acquire_lease(${project},${task},${agent},${scopes},${baseSha},${ttl}) as lease_id`;
    }
    case "work.heartbeat": {
      return await sql`select cns.heartbeat_lease(${requireString(a,"lease_id")}::uuid,${Number(a.ttl_seconds ?? 3600)}) as ok`;
    }
    case "work.release_lease": {
      return await sql`select cns.release_lease(${requireString(a,"lease_id")}::uuid) as ok`;
    }
    case "code.get_current_line": {
      const id = requireString(a, "project_id");
      const seam = typeof a.seam === "string" ? a.seam : "default";
      await syncProjectCode(id);
      const rows = await sql`
        select * from cns.code_lines
        where project_id=${id} and seam=${seam}
          and role in ('ACTIVE_DEVELOPMENT','PRODUCTION','FIXED_REVIEW')
        order by case role when 'ACTIVE_DEVELOPMENT' then 1 when 'PRODUCTION' then 2 else 3 end
      `;
      for (const row of rows) {
        const role = String(row.role ?? "");
        if ((role === "ACTIVE_DEVELOPMENT" || role === "PRODUCTION") &&
            (!row.github_verified_at || !row.stale_after || new Date(String(row.stale_after)).getTime() <= Date.now())) {
          throw new Error("CNS_GITHUB_CURRENT_STATE_STALE");
        }
      }
      return rows;
    }
    case "code.sync_live": {
      return await syncProjectCode(requireString(a, "project_id"));
    }
    case "prototype.get_current": {
      const id = requireString(a, "project_id");
      return await sql`select * from cns.v_prototype_safe where project_id=${id} order by version desc`;
    }
    case "event.commit": {
      return await sql`select cns.append_event(
        ${typeof a.project_id === "string" ? a.project_id : null},${requireString(a,"entity_type")},${requireString(a,"entity_id")},${requireString(a,"event_type")},
        ${JSON.stringify(a.payload ?? {})}::jsonb,${JSON.stringify(a.evidence_refs ?? [])}::jsonb,${requireString(a,"actor_type")},
        ${typeof a.actor_id === "string" ? a.actor_id : null},${requireString(a,"authority")},${typeof a.source_id === "string" ? a.source_id : null},
        ${typeof a.source_revision === "string" ? a.source_revision : null},${requireString(a,"idempotency_key")}) as event_id`;
    }
    case "health.check": {
      const scan = await sql`select cns.doctor_scan() as touched`;
      const incidents = await sql`select * from cns.health_incidents where state in ('OPEN','ACKNOWLEDGED') order by case severity when 'P0' then 1 when 'P1' then 2 when 'P2' then 3 else 4 end,last_seen_at desc limit 500`;
      return { scan: scan[0], incidents };
    }
    case "health.get_incidents": {
      return await sql`select * from cns.health_incidents where state in ('OPEN','ACKNOWLEDGED') order by case severity when 'P0' then 1 when 'P1' then 2 when 'P2' then 3 else 4 end,last_seen_at desc limit 1000`;
    }
    case "librarian.propose": {
      return await sql`select cns.librarian_propose_memory(${requireString(a,"memory_id")},${typeof a.project_id === "string" ? a.project_id : null},${requireString(a,"memory_type")},${Number(a.depth ?? 2)},${requireString(a,"title")},${JSON.stringify(a.content ?? {})}::jsonb,${requireString(a,"authority")},${typeof a.source_id === "string" ? a.source_id : null},${typeof a.source_revision === "string" ? a.source_revision : null}) as fingerprint`;
    }
    case "librarian.promote": {
      return await sql`select cns.librarian_promote_memory(${requireString(a,"memory_id")},${Number(a.event_id)}) as ok`;
    }
    case "evaluator.get_run": {
      const id = requireString(a, "evaluation_run_id");
      const run = await sql`select * from cns.evaluation_runs where evaluation_run_id=${id}::uuid`;
      const assertions = await sql`select * from cns.evaluation_assertions where evaluation_run_id=${id}::uuid order by assertion_key`;
      return { run: run[0] ?? null, assertions };
    }
    default:
      throw new Error("CNS_GATEWAY_UNKNOWN_TOOL");
  }
}

Deno.serve(async (req) => {
  if (req.method === "GET" && new URL(req.url).pathname.endsWith("/health")) {
    try {
      const r = await sql`select value from cns.system_meta where key='authority_mode'`;
      return Response.json({ ok: true, authority: r[0]?.value ?? null, githubLiveRequired: true });
    } catch {
      return Response.json({ ok: false, code: "CNS_DATABASE_UNAVAILABLE" }, { status: 503 });
    }
  }

  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${GATEWAY_TOKEN}`) return Response.json({ error: "unauthorized" }, { status: 401 });

  let rpc: Record<string, unknown>;
  try {
    rpc = await req.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }

  try {
    if (rpc.method === "initialize") {
      return Response.json({ jsonrpc: "2.0", id: rpc.id, result: { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "4planet-cns", version: "0.2.1-shadow" } } });
    }
    if (rpc.method === "tools/list") return Response.json({ jsonrpc: "2.0", id: rpc.id, result: { tools } });
    if (rpc.method !== "tools/call") throw new Error("METHOD_NOT_SUPPORTED");
    const params = asObject(rpc.params ?? {});
    const name = String(params.name ?? "");
    const args = (params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments))
      ? params.arguments as Record<string, unknown>
      : {};
    const result = await callTool(name, args);
    return Response.json({ jsonrpc: "2.0", id: rpc.id, result: { content: [{ type: "text", text: JSON.stringify(result) }] } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CNS_GATEWAY_ERROR";
    return Response.json({ jsonrpc: "2.0", id: rpc?.id ?? null, error: { code: -32000, message } }, { status: 409 });
  }
});
