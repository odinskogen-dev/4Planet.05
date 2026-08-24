export type SupabaseEnv = {
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

export type AuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: AuthUser;
};

const ACCESS_COOKIE = "4p_access";
const REFRESH_COOKIE = "4p_refresh";

export function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

export function configured(env: SupabaseEnv) {
  const url = env.SUPABASE_URL?.replace(/\/$/, "");
  const key = env.SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

export function readCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function cookie(name: string, value: string, maxAge: number) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function sessionCookieHeaders(session: AuthSession) {
  const accessAge = Math.max(60, Math.min(Number(session.expires_in ?? 3600), 3600));
  return [
    cookie(ACCESS_COOKIE, session.access_token, accessAge),
    cookie(REFRESH_COOKIE, session.refresh_token, 60 * 60 * 24 * 30),
  ];
}

export function clearCookieHeaders() {
  return [
    `${ACCESS_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    `${REFRESH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  ];
}

async function authFetch(env: SupabaseEnv, path: string, init: RequestInit = {}) {
  const cfg = configured(env);
  if (!cfg) return null;
  const headers = new Headers(init.headers);
  headers.set("apikey", cfg.key);
  if (!headers.has("content-type") && init.body) headers.set("content-type", "application/json");
  return fetch(`${cfg.url}/auth/v1/${path}`, { ...init, headers });
}

export async function getUserFromAccess(env: SupabaseEnv, accessToken: string | null) {
  if (!accessToken) return null;
  const response = await authFetch(env, "user", { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response?.ok) return null;
  return await response.json() as AuthUser;
}

export async function refreshSession(env: SupabaseEnv, refreshToken: string | null) {
  if (!refreshToken) return null;
  const response = await authFetch(env, "token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response?.ok) return null;
  const payload = await response.json() as AuthSession;
  return payload.access_token && payload.refresh_token ? payload : null;
}

export async function requestSession(request: Request, env: SupabaseEnv) {
  const access = readCookie(request, ACCESS_COOKIE);
  const user = await getUserFromAccess(env, access);
  if (user) return { user, accessToken: access as string, refreshed: null as AuthSession | null };

  const refreshed = await refreshSession(env, readCookie(request, REFRESH_COOKIE));
  if (!refreshed?.access_token) return null;
  const refreshedUser = refreshed.user ?? await getUserFromAccess(env, refreshed.access_token);
  if (!refreshedUser) return null;
  return { user: refreshedUser, accessToken: refreshed.access_token, refreshed };
}

export async function rest(
  env: SupabaseEnv,
  accessToken: string,
  path: string,
  init: RequestInit = {},
) {
  const cfg = configured(env);
  if (!cfg) return null;
  const headers = new Headers(init.headers);
  headers.set("apikey", cfg.key);
  headers.set("authorization", `Bearer ${accessToken}`);
  if (!headers.has("content-type") && init.body) headers.set("content-type", "application/json");
  return fetch(`${cfg.url}/rest/v1/${path}`, { ...init, headers });
}

export async function serviceRest(env: SupabaseEnv, path: string, init: RequestInit = {}) {
  const cfg = configured(env);
  const service = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!cfg || !service) return null;
  const headers = new Headers(init.headers);
  headers.set("apikey", service);
  headers.set("authorization", `Bearer ${service}`);
  if (!headers.has("content-type") && init.body) headers.set("content-type", "application/json");
  return fetch(`${cfg.url}/rest/v1/${path}`, { ...init, headers });
}
