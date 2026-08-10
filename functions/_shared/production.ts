export interface ProductionEnv {
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  PUBLIC_INTAKE_ENABLED?: string;
  MEASUREMENT_ENABLED?: string;
  PAYMENTS_ENABLED?: string;
  PUBLIC_ENVIRONMENT?: string;
  PUBLIC_ORIGIN?: string;
  TURNSTILE_SECRET_KEY?: string;
  CF_PAGES_COMMIT_SHA?: string;
}

export const MAX_BODY_BYTES = 16_384;

export const EVENT_NAMES = [
  "landing",
  "gold_vertical_entry",
  "atlas_interaction",
  "species_interaction",
  "source_open",
  "relationship_reveal",
  "impact_member_cta",
  "signup_start",
  "signup_completion",
  "contact_enquiry",
  "return_visit",
  "content_referral",
  "payment_intent",
  "checkout",
  "payment_success",
  "payment_failure",
  "payment_refund",
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export const PAYMENT_EVENTS = new Set<EventName>([
  "payment_intent",
  "checkout",
  "payment_success",
  "payment_failure",
  "payment_refund",
]);

const FUNCTION_HEADERS: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), payment=(), usb=()",
  "x-frame-options": "DENY",
  "cross-origin-resource-policy": "same-origin",
};

export function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...FUNCTION_HEADERS, ...extra },
  });
}

export function clean(value: unknown, max = 400): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function nullable(value: unknown, max: number): string | null {
  const v = clean(value, max);
  return v ? v : null;
}

export function emailOk(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function bodyWithinLimit(request: Request): boolean {
  const value = request.headers.get("content-length");
  if (!value) return true;
  const bytes = Number(value);
  return Number.isFinite(bytes) && bytes >= 0 && bytes <= MAX_BODY_BYTES;
}

export function sameOrigin(request: Request, env: ProductionEnv): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestOrigin = new URL(request.url).origin;
  const approved = new Set([requestOrigin]);
  if (env.PUBLIC_ORIGIN) approved.add(env.PUBLIC_ORIGIN.replace(/\/$/, ""));
  return approved.has(origin.replace(/\/$/, ""));
}

export async function sha256(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function idempotencyFrom(request: Request, fallback: string): string {
  const raw = clean(request.headers.get("idempotency-key"), 160);
  if (/^[A-Za-z0-9._:-]{16,160}$/.test(raw)) return raw;
  return fallback;
}

export function productionConfigured(env: ProductionEnv): env is ProductionEnv & { SUPABASE_URL: string; SUPABASE_SECRET_KEY: string } {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SECRET_KEY);
}

function apiUrl(env: ProductionEnv & { SUPABASE_URL: string }, path: string): string {
  return `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${path}`;
}

export async function supabaseGet(
  env: ProductionEnv & { SUPABASE_URL: string; SUPABASE_SECRET_KEY: string },
  path: string,
): Promise<Response> {
  return fetch(apiUrl(env, path), {
    method: "GET",
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      accept: "application/json",
    },
  });
}

export async function supabaseInsert(
  env: ProductionEnv & { SUPABASE_URL: string; SUPABASE_SECRET_KEY: string },
  table: string,
  payload: unknown,
): Promise<Response> {
  return fetch(apiUrl(env, table), {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
}

export async function verifyTurnstile(request: Request, secret: string, token: string): Promise<boolean> {
  if (!token) return false;
  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  const cfConnectingIp = request.headers.get("CF-Connecting-IP");
  if (cfConnectingIp) form.set("remoteip", cfConnectingIp);

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

const SENSITIVE_KEYS = new Set([
  "email",
  "name",
  "phone",
  "telephone",
  "address",
  "street",
  "useragent",
  "user_agent",
  "ip",
  "ipaddress",
  "ip_address",
  "fingerprint",
  "fullreferrer",
  "full_referrer",
]);

export function containsSensitiveAnalyticsKey(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some(containsSensitiveAnalyticsKey);
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) return true;
    if (containsSensitiveAnalyticsKey(nested)) return true;
  }
  return false;
}

export function boundedProperties(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  if (containsSensitiveAnalyticsKey(value)) return null;
  const encoded = JSON.stringify(value);
  if (new TextEncoder().encode(encoded).byteLength > 4096) return null;
  return value as Record<string, unknown>;
}

export function validOccurredAt(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const now = Date.now();
  if (date.getTime() > now + 5 * 60_000) return null;
  if (date.getTime() < now - 7 * 24 * 60 * 60_000) return null;
  return date.toISOString();
}

export function environment(env: ProductionEnv): "PREVIEW" | "PRODUCTION" {
  return env.PUBLIC_ENVIRONMENT === "PRODUCTION" ? "PRODUCTION" : "PREVIEW";
}
