import { onRequest as commerceStatus } from "../functions/api/market-commerce-status";
import { onRequest as publicCheckout } from "../functions/api/market-checkout";
import { onRequest as canaryCheckout } from "../functions/api/market-canary-checkout";
import { onRequest as stripeWebhook } from "../functions/api/market-stripe-webhook";
import { onRequest as orderStatus } from "../functions/api/market-order-status";
import { onRequest as prodigiCallback } from "../functions/api/market-prodigi-callback";
import type { MarketCommerceEnv } from "../functions/_lib/marketCommerce";

interface Env extends MarketCommerceEnv {
  MARKET_UPSTREAM: string;
  MARKET_SOURCE_SHA: string;
  MARKET_MARKER: string;
}

type Handler = (ctx: { request: Request; env: Env }) => Promise<Response>;

const routes: Record<string, Handler> = {
  "/api/market-commerce-status": commerceStatus as Handler,
  "/api/market-checkout": publicCheckout as Handler,
  "/api/market-canary-checkout": canaryCheckout as Handler,
  "/api/market-stripe-webhook": stripeWebhook as Handler,
  "/api/market-order-status": orderStatus as Handler,
  "/api/market-prodigi-callback": prodigiCallback as Handler,
};

function withMarketHeaders(response: Response, env: Env) {
  const headers = new Headers(response.headers);
  headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  headers.set("x-4planet-market", env.MARKET_MARKER || "4market-commerce");
  headers.set("x-4planet-market-source", env.MARKET_SOURCE_SHA || "unknown");
  headers.set("cache-control", "no-store");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function proxyMarket(request: Request, env: Env) {
  if (!env.MARKET_UPSTREAM) return new Response("Market upstream unavailable", { status: 503 });
  const incoming = new URL(request.url);
  const upstreamBase = new URL(env.MARKET_UPSTREAM);
  const upstream = new URL(incoming.pathname || "/", upstreamBase);
  upstream.search = incoming.search;
  const headers = new Headers(request.headers);
  headers.delete("authorization");
  headers.delete("cookie");
  const proxied = new Request(upstream.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  });
  return fetch(proxied);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/market-health") {
      return withMarketHeaders(new Response(JSON.stringify({ ok: true, source: env.MARKET_SOURCE_SHA }), {
        headers: { "content-type": "application/json; charset=utf-8" },
      }), env);
    }
    const handler = routes[url.pathname];
    if (handler) {
      try {
        return withMarketHeaders(await handler({ request, env }), env);
      } catch (error) {
        console.error("4MARKET commerce route failed", url.pathname, error instanceof Error ? error.message : "unknown");
        return withMarketHeaders(new Response(JSON.stringify({ ok: false, error: "market_runtime_error" }), {
          status: 500,
          headers: { "content-type": "application/json; charset=utf-8" },
        }), env);
      }
    }
    return withMarketHeaders(await proxyMarket(request, env), env);
  },
};
