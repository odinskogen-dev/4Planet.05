const SUPABASE_URL = String((import.meta as any).env?.VITE_SUPABASE_URL || "https://ghvdzetmplqkdtfqiror.supabase.co").replace(/\/$/, "");
const SUPABASE_KEY = String((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_H6TT_u7YO4DVlvQdCJ06mA_VEvgxsOE");
const SESSION_KEY = "4sapien.embla.session.v1";

export type EmblaSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: { id: string; email?: string };
};

export type EmblaTurn = {
  ok: boolean;
  state: string;
  conversation_id?: string;
  message_id?: string;
  answer?: string;
  tools_used?: string[];
  model?: { provider?: string; id?: string };
  streaming?: boolean;
  error_code?: string;
};

export type EmblaMemory = {
  id: string;
  memory_type: "preference" | "goal" | "durable_fact" | "decision" | "constraint";
  content: string;
  state: "proposed" | "active" | "superseded" | "deleted";
  confirmation_state?: string | null;
  updated_at?: string | null;
};

function headers(session?: EmblaSession, extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_KEY,
    "Content-Type": "application/json",
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...extra,
  };
}

async function readJson(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error_description || body?.msg || body?.message || body?.error_code || body?.state || `HTTP_${response.status}`;
    throw new Error(String(message));
  }
  return body;
}

function saveSession(session: EmblaSession | null) {
  if (typeof window === "undefined") return;
  if (!session) window.localStorage.removeItem(SESSION_KEY);
  else window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getStoredSession(): EmblaSession | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
    return parsed?.access_token && parsed?.user?.id ? parsed as EmblaSession : null;
  } catch {
    return null;
  }
}

export async function signInEmbla(email: string, password: string): Promise<EmblaSession> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  const body = await readJson(response);
  const session: EmblaSession = {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    expires_at: body.expires_at,
    user: { id: body.user.id, email: body.user.email },
  };
  saveSession(session);
  return session;
}

export async function refreshEmblaSession(session: EmblaSession): Promise<EmblaSession> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  const body = await readJson(response);
  const refreshed: EmblaSession = {
    access_token: body.access_token,
    refresh_token: body.refresh_token || session.refresh_token,
    expires_at: body.expires_at,
    user: { id: body.user.id, email: body.user.email },
  };
  saveSession(refreshed);
  return refreshed;
}

export async function ensureEmblaSession(session: EmblaSession): Promise<EmblaSession> {
  if (!session.expires_at || session.expires_at * 1000 > Date.now() + 60_000) return session;
  return refreshEmblaSession(session);
}

export function signOutEmbla() {
  saveSession(null);
}

export async function runEmblaTurn(session: EmblaSession, message: string, conversationId?: string | null): Promise<{ session: EmblaSession; turn: EmblaTurn }> {
  const active = await ensureEmblaSession(session);
  const response = await fetch(`${SUPABASE_URL}/functions/v1/embla-core-preview`, {
    method: "POST",
    headers: headers(active),
    body: JSON.stringify({ message, conversation_id: conversationId || undefined }),
  });
  const turn = await readJson(response) as EmblaTurn;
  return { session: active, turn };
}

export async function listEmblaMemories(session: EmblaSession): Promise<{ session: EmblaSession; memories: EmblaMemory[] }> {
  const active = await ensureEmblaSession(session);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/four_sapien_embla_memories?state=in.(active,proposed)&select=id,memory_type,content,state,confirmation_state,updated_at&order=updated_at.desc&limit=50`, {
    headers: headers(active),
  });
  return { session: active, memories: await readJson(response) as EmblaMemory[] };
}

async function rpc(session: EmblaSession, name: string, args: Record<string, unknown>) {
  const active = await ensureEmblaSession(session);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: headers(active),
    body: JSON.stringify(args),
  });
  return { session: active, result: await readJson(response) };
}

export function confirmEmblaMemory(session: EmblaSession, id: string) {
  return rpc(session, "four_sapien_confirm_memory", { p_memory_id: id });
}

export function deleteEmblaMemory(session: EmblaSession, id: string) {
  return rpc(session, "four_sapien_delete_memory", { p_memory_id: id });
}

export function supersedeEmblaMemory(session: EmblaSession, memory: EmblaMemory, content: string) {
  return rpc(session, "four_sapien_supersede_memory", {
    p_memory_id: memory.id,
    p_memory_type: memory.memory_type,
    p_content: content,
    p_value: {},
  });
}

export function setFoodFinancePermission(session: EmblaSession, allowed: boolean) {
  return rpc(session, "four_sapien_set_permission", {
    p_consumer_world: "food",
    p_provider_world: "finance",
    p_capability: "read_budget_context",
    p_state: allowed ? "allowed" : "revoked",
  });
}

export async function readFoodFinancePermission(session: EmblaSession): Promise<{ session: EmblaSession; allowed: boolean }> {
  const active = await ensureEmblaSession(session);
  const response = await fetch(`${SUPABASE_URL}/rest/v1/four_sapien_permissions?consumer_world=eq.food&provider_world=eq.finance&capability=eq.read_budget_context&select=state&limit=1`, {
    headers: headers(active),
  });
  const rows = await readJson(response) as Array<{ state: string }>;
  return { session: active, allowed: rows?.[0]?.state === "allowed" };
}
