import { onRequestGet as worldbank } from "../../functions/api/worldbank-country";
import { onRequestGet as identity } from "../../functions/api/country-identity";
import { onRequestGet as unescoCountry, onRequestOptions as unescoCountryOptions } from "../../functions/api/unesco-country";
import { onRequestGet as unescoData, onRequestOptions as unescoDataOptions } from "../../functions/api/unesco-data";
import { onRequestGet as climateTrace, onRequestOptions as climateTraceOptions } from "../../functions/api/climate-trace";

type Ctx = { request: Request; env: Record<string, unknown>; waitUntil: (p: Promise<unknown>) => void };

export async function dispatchReleaseApi(request: Request, env: Record<string, unknown>, ctx: ExecutionContext): Promise<Response | null> {
  const u = new URL(request.url);
  if (!u.pathname.startsWith("/api/")) return null;
  if (request.method === "OPTIONS") {
    if (u.pathname === "/api/unesco-country") return unescoCountryOptions();
    if (u.pathname === "/api/unesco-data") return unescoDataOptions();
    if (u.pathname === "/api/climate-trace") return climateTraceOptions();
    return new Response(null,{headers:{"access-control-allow-origin":"*","access-control-allow-methods":"GET, OPTIONS","access-control-max-age":"86400"}});
  }
  if (request.method !== "GET") return new Response("Method not allowed",{status:405});
  const c: Ctx = { request, env, waitUntil: (p) => ctx.waitUntil(p) };
  if (u.pathname === "/api/worldbank-country") return worldbank(c);
  if (u.pathname === "/api/country-identity") return identity(c);
  if (u.pathname === "/api/unesco-country") return unescoCountry(c);
  if (u.pathname === "/api/unesco-data") return unescoData(c);
  if (u.pathname === "/api/climate-trace") return climateTrace(c as any);
  return null;
}
