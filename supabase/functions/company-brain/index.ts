import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const URL = Deno.env.get("SUPABASE_URL") || "";
const KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const ALLOWED = new Set([
  "https://test.4planet.org",
  "https://4planet.org",
  "https://www.4planet.org",
  "https://4brand.org",
  "https://www.4brand.org",
  "https://4brands.org",
  "https://www.4brands.org",
]);

function originAllowed(origin: string) {
  if (ALLOWED.has(origin)) return true;
  try {
    const u = new URL(origin);
    return u.protocol === "https:" && u.hostname.endsWith(".4planet-05.pages.dev");
  } catch {
    return false;
  }
}

function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": originAllowed(origin) ? origin : "https://test.4planet.org",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function out(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function clean(value: unknown, max = 200) {
  return String(value ?? "").trim().slice(0, max);
}

function internalHeaders(token?: string) {
  return {
    apikey: KEY,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function authenticatedUser(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  const response = await fetch(`${URL}/auth/v1/user`, { headers: internalHeaders(token) });
  if (!response.ok) return null;
  const user = await response.json();
  return user?.id ? { id: String(user.id), token } : null;
}

async function rpc(token: string, name: string, args: Record<string, unknown> = {}) {
  const response = await fetch(`${URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: internalHeaders(token),
    body: JSON.stringify(args),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload && typeof payload === "object"
      ? clean((payload as Record<string, unknown>).message || (payload as Record<string, unknown>).hint, 240)
      : "";
    throw new Error(`RPC_${name}_${response.status}_${detail}`);
  }
  return payload;
}


async function auditRead(token: string, userId: string, companyId: string, action: string) {
  const allowed = new Set(["snapshot_viewed", "value_report_viewed", "compounding_metrics_viewed"]);
  if (!allowed.has(action)) return;
  const response = await fetch(URL + "/rest/v1/four_brands_audit_events", {
    method: "POST",
    headers: { ...internalHeaders(token), Prefer: "return=minimal" },
    body: JSON.stringify({
      company_id: companyId,
      actor_user_id: userId,
      object_type: "company_brain",
      object_id: companyId,
      action,
      before_state: null,
      after_state: { measurement_version: "CAV-01", source: "company-brain" },
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("AUDIT_" + response.status + "_" + clean(detail, 180));
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("Origin") || "";
  if (req.method === "OPTIONS") {
    return originAllowed(origin)
      ? new Response("ok", { headers: cors(req) })
      : new Response("forbidden", { status: 403, headers: cors(req) });
  }
  if (req.method !== "POST") return out(req, { ok: false, state: "METHOD_NOT_ALLOWED" }, 405);
  if (!originAllowed(origin)) return out(req, { ok: false, state: "ORIGIN_FORBIDDEN" }, 403);

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const action = clean(body.action, 80);

  try {
    if (action === "send_magic_link") {
      const email = clean(body.email, 320).toLowerCase();
      const redirectTo = clean(body.redirect_to, 500);
      if (!email.includes("@")) return out(req, { ok: false, state: "EMAIL_REQUIRED" }, 400);
      let redirect: URL;
      try { redirect = new URL(redirectTo); } catch { return out(req, { ok: false, state: "REDIRECT_INVALID" }, 400); }
      if (!originAllowed(redirect.origin) || redirect.pathname !== "/4brand") {
        return out(req, { ok: false, state: "REDIRECT_FORBIDDEN" }, 400);
      }
      const response = await fetch(`${URL}/auth/v1/otp?redirect_to=${encodeURIComponent(redirect.toString())}`, {
        method: "POST",
        headers: internalHeaders(),
        body: JSON.stringify({ email, create_user: false }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return out(req, { ok: false, state: "AUTH_LINK_FAILED", detail: clean((payload as any)?.msg || (payload as any)?.message, 180) }, response.status);
      return out(req, { ok: true, state: "MAGIC_LINK_SENT" });
    }

    if (action === "refresh_session") {
      const refreshToken = clean(body.refresh_token, 4096);
      if (!refreshToken) return out(req, { ok: false, state: "REFRESH_TOKEN_REQUIRED" }, 400);
      const response = await fetch(`${URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: internalHeaders(),
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return out(req, { ok: false, state: "SESSION_REFRESH_FAILED" }, 401);
      return out(req, { ok: true, state: "SESSION_REFRESHED", session: payload });
    }

    const user = await authenticatedUser(req);
    if (!user) return out(req, { ok: false, state: "UNAUTHENTICATED" }, 401);

    if (action === "sign_out") {
      await fetch(`${URL}/auth/v1/logout?scope=local`, { method: "POST", headers: internalHeaders(user.token) });
      return out(req, { ok: true, state: "SIGNED_OUT" });
    }

    const map: Record<string, { name: string; args: () => Record<string, unknown> }> = {
      list_workspaces: { name: "four_brands_company_brain_list_workspaces", args: () => ({}) },
      create_workspace: { name: "four_brands_company_brain_create_workspace", args: () => ({ p_display_name: clean(body.display_name, 200), p_legal_name: clean(body.legal_name, 240) || null }) },
      snapshot: { name: "four_brands_company_brain_snapshot", args: () => ({ p_company_id: clean(body.company_id, 80) }) },
      save_twin: { name: "four_brands_company_brain_save_twin", args: () => ({ p_company_id: clean(body.company_id, 80), p_twin: body.twin || {} }) },
      sync_analysis: { name: "four_brands_company_brain_sync_analysis", args: () => ({ p_company_id: clean(body.company_id, 80), p_analysis: body.analysis || {}, p_ledger: body.ledger || {} }) },
      value_report: { name: "four_brands_company_value_report", args: () => ({ p_company_id: clean(body.company_id, 80) }) },
      compounding_metrics: { name: "four_brands_compounding_metrics", args: () => ({ p_company_id: clean(body.company_id, 80) }) },
      sync_value_cell: { name: "four_brands_company_brain_sync_value_cell", args: () => ({
        p_company_id: clean(body.company_id, 80),
        p_opportunity: body.opportunity || {},
        p_state: clean(body.state, 80) || "REVIEWED",
        p_baseline: body.baseline || {},
      }) },
      start_intervention: { name: "four_brands_company_brain_start_intervention", args: () => ({
        p_company_id: clean(body.company_id, 80),
        p_decision_id: clean(body.decision_id, 80),
        p_title: clean(body.title, 240),
        p_expected_value_low: typeof body.expected_value_low === "number" ? body.expected_value_low : null,
        p_expected_value_high: typeof body.expected_value_high === "number" ? body.expected_value_high : null,
        p_currency: clean(body.currency, 12) || null,
        p_measurement_window: body.measurement_window || {},
      }) },
      record_result: { name: "four_brands_company_brain_record_result", args: () => ({
        p_company_id: clean(body.company_id, 80),
        p_intervention_id: clean(body.intervention_id, 80),
        p_metric_key: clean(body.metric_key, 160) || null,
        p_baseline_value: typeof body.baseline_value === "number" ? body.baseline_value : null,
        p_measured_value: typeof body.measured_value === "number" ? body.measured_value : null,
        p_attributable_value: typeof body.attributable_value === "number" ? body.attributable_value : null,
        p_currency: clean(body.currency, 12) || null,
        p_attribution_strength: clean(body.attribution_strength, 80) || "IDENTIFIED",
        p_conclusion: clean(body.conclusion, 2000) || null,
        p_evidence: Array.isArray(body.evidence) ? body.evidence : [],
        p_learning: clean(body.learning, 2000) || null,
      }) },
    };
    const contract = map[action];
    if (!contract) return out(req, { ok: false, state: "UNKNOWN_ACTION" }, 400);
    const data = await rpc(user.token, contract.name, contract.args());
    const companyId = clean(body.company_id, 80);
    if (companyId) {
      if (action === "snapshot") await auditRead(user.token, user.id, companyId, "snapshot_viewed");
      if (action === "value_report") await auditRead(user.token, user.id, companyId, "value_report_viewed");
      if (action === "compounding_metrics") await auditRead(user.token, user.id, companyId, "compounding_metrics_viewed");
    }
    return out(req, { ok: true, state: "COMPLETE", data, runtime: "COMPANY_BRAIN_V02_COMPOUNDING" });
  } catch (error) {
    console.error("company-brain", error);
    const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
    const status = code.includes("42501") || code.includes("FORBIDDEN") ? 403 : 500;
    return out(req, { ok: false, state: "INTERNAL_ERROR", error_code: clean(code, 220) }, status);
  }
});
