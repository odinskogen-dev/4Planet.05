// Bound to two exact public SEO canonical URLs; no Pages build, merge to main,
// SPECIES release, product-data edit, project publication, or wildcard route.
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import worker from "./4planet-canonical-journeys-20261030.js";

const ROOT = "https://4planet.org";
const CF = "https://api.cloudflare.com/client/v4";
const SCRIPT = "4planet-canonical-journeys-20261030";
const ROUTES = ["/impact", "/wildfires"];
const UA = "4PLANET-exact-SEO-repair-20261030";
const MASK = "canonical-journeys-20261030";

function fail(reason) { throw new Error("FAIL_CLOSED: " + reason); }
async function checkedFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally { clearTimeout(timer); }
}
function cleanToken(raw) {
  let value = (raw || "").trim().replaceAll("\r", "").replaceAll("\n", "");
  for (const prefix of ["Bearer ", "bearer ", "CLOUDFLARE_API_TOKEN=", "CF_API_TOKEN="])
    if (value.startsWith(prefix)) value = value.slice(prefix.length);
  return value.trim().replace(/^["']|["']$/g, "");
}
async function cloudflare(token, method, path, body) {
  const r = await checkedFetch(CF + path, {
    method,
    headers: { authorization: "Bearer " + token, "content-type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let result;
  try { result = await r.json(); } catch { result = {}; }
  return { status: r.status, data: result };
}
async function publicResponse(url, redirect = "follow", method = "GET") {
  return await checkedFetch(url, { method, redirect, headers: { "user-agent": UA, "cache-control": "no-cache" } });
}
async function htmlOf(url) {
  const r = await publicResponse(url);
  if (r.status !== 200 || !(r.headers.get("content-type") || "").includes("text/html")) fail("HTML target " + url + " HTTP " + r.status);
  return await r.text();
}
function assertCanonical(html, route) {
  const target = ROOT + route;
  const tags = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi) || [];
  if (tags.length !== 1 || !tags[0].includes(target + '"') && !tags[0].includes(target + "'"))
    fail("exact canonical absent or multiple for " + route);
  if (!/<h1(?:\s|>)/i.test(html)) fail("no server HTML H1 for " + route);
}
async function offlineContract() {
  const previous = globalThis.fetch;
  const requested = [];
  try {
    globalThis.fetch = async (url) => {
      requested.push(String(url));
      return new Response('<html><head><link rel="canonical" href="' + String(url).replace(/\/\??.*$/, "") + '"></head><body><h1>Public</h1></body></html>', {
        status: 200, headers: { "content-type": "text/html; charset=utf-8", "content-length": "60" },
      });
    };
    for (const route of ROUTES) {
      const result = await worker.fetch(new Request(ROOT + route + "?src=test"));
      assert.equal(result.status, 200);
      assert.equal(result.headers.get("x-4planet-seo-p0"), MASK);
      assert.equal(result.headers.get("content-length"), null);
      assert.match(await result.text(), /<h1>Public<\/h1>/);
      const head = await worker.fetch(new Request(ROOT + route, { method: "HEAD" }));
      assert.equal(head.status, 200);
      assert.equal(await head.text(), "");
      assert.equal((await worker.fetch(new Request(ROOT + route, { method: "POST" }))).status, 405);
      assert.ok(requested.includes(ROOT + route + "/?src=test"), "query must be preserved for " + route);
    }
    for (const wrong of [ROOT + "/", ROOT + "/impact/", ROOT + "/wildfires/", "https://4species.com/impact"])
      assert.equal((await worker.fetch(new Request(wrong))).status, 404);
  } finally { globalThis.fetch = previous; }
  console.log("OFFLINE_EXACT_ROUTE_CONTRACT_PASS");
}
async function verifyProtectedSpecies() {
  const raw = fs.readFileSync("ops/discovery/4species-router.js", "utf8");
  const part = raw.split("CURRENT_PUBLIC_SPECIES_SLUGS = new Set([", 2)[1];
  if (!part) fail("species inventory boundary absent");
  const slugs = [...part.split("]);", 1)[0].matchAll(/"([a-z0-9-]+)"/g)].map(x => x[1]);
  if (slugs.length !== 57 || new Set(slugs).size !== 57) fail("57 protected species invariant changed");
  // Controlled batches, so origin does not receive 57 concurrent fetches.
  for (let i = 0; i < slugs.length; i += 7) {
    const batch = await Promise.all(slugs.slice(i, i + 7).map(async slug => {
      try {
        const r = await publicResponse("https://4species.com/" + slug);
        const status = r.status; await r.body?.cancel(); return [slug, status];
      } catch { return [slug, 0]; }
    }));
    const bad = batch.filter(x => x[1] !== 200);
    if (bad.length) fail("protected SPECIES readback " + JSON.stringify(bad));
  }
  console.log("PROTECTED_57_SPECIES_HTTP_200_PASS");
}
async function verifySitemapAndRelated() {
  const sitemap = await publicResponse(ROOT + "/sitemap.xml");
  if (sitemap.status !== 200) fail("existing sitemap HTTP " + sitemap.status);
  const xml = await sitemap.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (locs.length !== 171 || new Set(locs).size !== 171) fail("171 published sitemap URL preservation changed: " + locs.length);
  if (locs.some(u => u.includes("/impact/project/") || u.includes("/impact/actors/")))
    fail("old candidate IMPACT profiles reappeared in sitemap");
  for (const page of [ROOT + "/", ROOT + "/now", ROOT + "/news-sitemap.xml", "https://4planetmagazine.com/", "https://4species.com/orca"]) {
    const response = await publicResponse(page);
    if (response.status !== 200) fail("protected page response " + page + " " + response.status);
    await response.body?.cancel();
  }
  console.log("SITEMAP_171_AND_EXISTING_PUBLIC_SURFACES_PASS");
}

let token, zone, account;
async function preflight() {
  const tokens = [...new Set(["CF_PRIMARY", "CF_FALLBACK", "CF_ALT"].map(key => cleanToken(process.env[key])).filter(Boolean))];
  for (const candidate of tokens) {
    let found;
    try { found = await cloudflare(candidate, "GET", "/zones?name=4planet.org"); } catch { continue; }
    const active = (found.data?.result || []).filter(z => z.name === "4planet.org" && z.status === "active");
    if (found.status === 200 && found.data?.success && active.length === 1) {
      token = candidate; zone = active[0].id; account = active[0].account?.id; break;
    }
  }
  if (!token || !zone || !account) fail("authorised Cloudflare zone/account unavailable");
  console.log("::add-mask::" + token);
  const routes = await cloudflare(token, "GET", "/zones/" + zone + "/workers/routes");
  if (routes.status !== 200 || !routes.data?.success) fail("cannot read existing Cloudflare routes");
  const active = routes.data.result || [];
  for (const route of ROUTES) {
    const exact = "4planet.org" + route;
    if (active.some(r => r.pattern === exact)) fail("route already owned " + exact);
    const original = await publicResponse(ROOT + route, "manual");
    if (![301, 308].includes(original.status)) fail(route + " should currently redirect; observed HTTP " + original.status);
    const location = new URL(original.headers.get("location") || "", ROOT + route);
    if (location.origin !== ROOT || location.pathname !== route + "/")
      fail("unexpected slash destination for " + route);
    const html = await htmlOf(ROOT + route + "/");
    assertCanonical(html, route);
    console.log("ROUTE_ORIGIN_PROVEN " + route + " 3xx -> 200 H1 canonical");
  }
  await verifySitemapAndRelated();
  await verifyProtectedSpecies();
}
async function deploy() {
  const env = { ...process.env, CLOUDFLARE_API_TOKEN: token, CLOUDFLARE_ACCOUNT_ID: account };
  const run = spawnSync("npx", [
    "--yes", "wrangler@4.128.0", "deploy",
    "ops/exposure/4planet-canonical-journeys-20261030.js",
    "--name", SCRIPT, "--compatibility-date", "2026-10-30", "--keep-vars",
  ], { env, encoding: "utf8", timeout: 150000 });
  if (run.status !== 0) fail("scoped Worker upload failed; existing routes unchanged");
  console.log("WORKER_UPLOADED_UNATTACHED");
}
async function liveGate() {
  for (const route of ROUTES) {
    let good = false;
    for (let attempt = 0; attempt < 9; attempt++) {
      try {
        const response = await publicResponse(ROOT + route);
        if (response.status === 200 && response.headers.get("x-4planet-seo-p0") === MASK) {
          const html = await response.text();
          assertCanonical(html, route);
          good = true; break;
        }
        await response.body?.cancel();
      } catch { /* retry bounded */ }
      await delay(3000);
    }
    if (!good) fail("public exact route not confirmed " + route);
    const slash = await publicResponse(ROOT + route + "/");
    if (slash.status !== 200) fail("existing slash page lost " + route);
    await slash.body?.cancel();
    console.log("EXACT_LIVE_CANONICAL_PASS " + ROOT + route + " 200");
  }
  await verifySitemapAndRelated();
  await verifyProtectedSpecies();
}
async function main() {
  await offlineContract();
  await preflight();
  await deploy();
  const created = [];
  let verified = false;
  try {
    // Cloudflare route attachment is the only production mutation.
    for (const route of ROUTES) {
      const result = await cloudflare(token, "POST", "/zones/" + zone + "/workers/routes", {
        pattern: "4planet.org" + route, script: SCRIPT,
      });
      const id = result.data?.result?.id;
      if (![200, 201].includes(result.status) || !result.data?.success || !id)
        fail("Cloudflare exact-path registration rejected for " + route);
      created.push(id);
      console.log("EXACT_ROUTE_ATTACHED " + route);
    }
    await liveGate();
    verified = true;
    const receipt = "SEO_ONLY_LIVE_PASS: 4planet.org/impact and /wildfires serve HTTP 200 with self-canonical H1 HTML; existing slash pages and sitemap 171/171 preserved; 57/57 SPECIES remain HTTP 200; no project candidates, content, or broad application release. SHA " + process.env.GITHUB_SHA;
    console.log(receipt);
    if (process.env.GITHUB_STEP_SUMMARY)
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, "## Scoped SEO production receipt\n\n" + receipt + "\n");
  } finally {
    if (!verified) {
      let rollbackFailed = false;
      for (const id of created.reverse()) {
        try {
          const r = await cloudflare(token, "DELETE", "/zones/" + zone + "/workers/routes/" + id);
          if (r.status !== 200 || !r.data?.success) rollbackFailed = true;
        } catch { rollbackFailed = true; }
      }
      console.error(rollbackFailed ? "CRITICAL_ROLLBACK_FAILED_VERIFY_ROUTES" : "ROLLBACK_EXACT_ROUTES_SUCCESS");
    }
  }
}
main().catch(error => {
  console.error("SEO_EXACT_SCOPE_BLOCKED", error.message);
  process.exitCode = 1;
});
