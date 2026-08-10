import { json, productionConfigured, type ProductionEnv } from "../_shared/production";

/**
 * Coarse health/readiness endpoint for uptime checks.
 * Never returns secret values, project URLs, database identifiers or personal data.
 */
export const onRequestGet = async (ctx: { env: ProductionEnv }): Promise<Response> => {
  const { env } = ctx;
  const intakeEnabled = env.PUBLIC_INTAKE_ENABLED === "true";
  const measurementEnabled = env.MEASUREMENT_ENABLED === "true";
  const paymentsEnabled = env.PAYMENTS_ENABLED === "true";
  const databaseConfigured = productionConfigured(env);

  const safe = !paymentsEnabled && (!intakeEnabled || databaseConfigured) && (!measurementEnabled || databaseConfigured);
  return json({
    ok: safe,
    releaseState: "PRE_PRODUCTION",
    intake: intakeEnabled ? (databaseConfigured ? "CONFIGURED" : "MISCONFIGURED") : "DISABLED",
    measurement: measurementEnabled ? (databaseConfigured ? "CONFIGURED" : "MISCONFIGURED") : "DISABLED",
    payments: paymentsEnabled ? "UNEXPECTEDLY_ENABLED" : "DISABLED",
    buildSha: env.CF_PAGES_COMMIT_SHA || "UNAVAILABLE",
  }, safe ? 200 : 503);
};

export const onRequest = async (ctx: { request: Request; env: ProductionEnv }): Promise<Response> => {
  if (ctx.request.method === "GET" || ctx.request.method === "HEAD") return onRequestGet(ctx);
  return json({ ok: false, error: "method_not_allowed" }, 405, { allow: "GET, HEAD" });
};
