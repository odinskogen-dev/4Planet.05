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
  MARKET_FOUNDER_SAMPLE_TOKEN_SHA256?: string;
}

type Handler = (ctx: { request: Request; env: Env }) => Promise<Response>;

const FOUNDER_SAMPLE_PRODUCT_ID = "market:amalie:a14";
const FOUNDER_SAMPLE_ATTEMPT_ID = "founderA14PhysicalSample01";

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function founderTokenValid(token: string, env: Env) {
  const expected = env.MARKET_FOUNDER_SAMPLE_TOKEN_SHA256?.trim() ?? "";
  if (!token || expected.length !== 64) return false;
  return constantTimeEqual(await sha256Hex(token), expected);
}

async function founderSampleCheckout(ctx: { request: Request; env: Env }): Promise<Response> {
  if (ctx.request.method !== "POST") return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), { status: 405, headers: { "content-type": "application/json" } });
  let body: { token?: unknown };
  try { body = await ctx.request.json(); } catch { return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), { status: 400, headers: { "content-type": "application/json" } }); }
  const founderToken = typeof body.token === "string" ? body.token : "";
  if (!(await founderTokenValid(founderToken, ctx.env))) return new Response(JSON.stringify({ ok: false, error: "founder_sample_not_authorized" }), { status: 401, headers: { "content-type": "application/json" } });
  if (!ctx.env.MARKET_LIVE_CANARY_TOKEN) return new Response(JSON.stringify({ ok: false, error: "live_canary_closed" }), { status: 503, headers: { "content-type": "application/json" } });

  const internalRequest = new Request("https://4planetmarket.com/api/market-canary-checkout", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      productId: FOUNDER_SAMPLE_PRODUCT_ID,
      token: ctx.env.MARKET_LIVE_CANARY_TOKEN,
      attemptId: FOUNDER_SAMPLE_ATTEMPT_ID,
    }),
  });
  return canaryCheckout({ request: internalRequest, env: ctx.env });
}

async function founderSamplePage(request: Request, env: Env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  if (!(await founderTokenValid(token, env))) return new Response("Not found", { status: 404 });
  const price = env.MARKET_CANARY_PRICE_NOK || "3";
  const safeToken = JSON.stringify(token);
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Frog Treehouse — private sample</title>
<style>body{margin:0;background:#f5f2e8;color:#111;font-family:Arial,Helvetica,sans-serif}main{max-width:1120px;margin:0 auto;padding:24px}.top{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.12em;border-bottom:1px solid #111;padding-bottom:14px}.grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:42px;padding-top:32px}img{width:100%;display:block;background:#ddd}.eyebrow{font-size:12px;letter-spacing:.12em}.title{font-size:clamp(42px,7vw,88px);line-height:.9;margin:20px 0 18px;font-weight:700}.meta{font-size:15px;line-height:1.6}.price{font-size:34px;margin:28px 0 6px}.note{font-size:13px;line-height:1.5;max-width:460px}.buy{margin-top:24px;width:100%;padding:18px;border:0;background:#111;color:#fff;font-size:15px;font-weight:700;letter-spacing:.08em;cursor:pointer}.buy:disabled{opacity:.55}.status{margin-top:14px;font-size:13px}.back{display:inline-block;margin-top:24px;color:#111}@media(max-width:760px){.grid{grid-template-columns:1fr;gap:24px}.title{font-size:48px}}</style></head>
<body><main><div class="top"><strong>4PLANET_ MARKET</strong><span>PRIVATE PHYSICAL SAMPLE</span></div><div class="grid"><div><img src="/market/amalie/a14-frog-treehouse-snake-mole.jpg" alt="Frog Treehouse / Snake / Mole — Amalie Marie Myrtvedt"></div><div><div class="eyebrow">AMALIE MARIE MYRTVEDT · ART PRINT</div><h1 class="title">FROG<br>TREEHOUSE.</h1><div class="meta">6 × 8 IN / 15 × 20 CM<br>Enhanced Matte Art Paper · 200 gsm<br>Standard shipping · Norway</div><div class="price">NOK ${price}</div><div class="note">Founder sample price. This is a real live payment and a real Prodigi print order. Prodigi production and shipping are charged separately to the 4PLANET Prodigi account.</div><button class="buy" id="buy">BUY SAMPLE →</button><div class="status" id="status"></div><a class="back" href="/">← 4PLANET MARKET</a></div></div></main>
<script>const token=${safeToken};const b=document.getElementById('buy');const s=document.getElementById('status');b.addEventListener('click',async()=>{b.disabled=true;b.textContent='OPENING SECURE CHECKOUT…';s.textContent='';try{const r=await fetch('/api/market-founder-sample-checkout',{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({token})});const p=await r.json();if(!r.ok||!p.url)throw new Error(p.error||'checkout_unavailable');location.assign(p.url)}catch(e){s.textContent='Checkout could not be opened. No payment was taken.';b.disabled=false;b.textContent='BUY SAMPLE →'}});</script></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow, noarchive" } });
}

const routes: Record<string, Handler> = {
  "/api/market-commerce-status": commerceStatus as Handler,
  "/api/market-checkout": publicCheckout as Handler,
  "/api/market-canary-checkout": canaryCheckout as Handler,
  "/api/market-founder-sample-checkout": founderSampleCheckout as Handler,
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
    if (url.pathname === "/sample/a14") {
      return withMarketHeaders(await founderSamplePage(request, env), env);
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
