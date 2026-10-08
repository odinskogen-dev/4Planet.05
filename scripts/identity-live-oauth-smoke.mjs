import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const ID_URL = "https://id.4planet.org/login?return_to=https%3A%2F%2F4planet.org%2F";
const res = await fetch(ID_URL, { redirect: "follow", signal: AbortSignal.timeout(30000) });
assert.equal(res.status, 200, `ID landing HTTP ${res.status}`);
const html = await res.text();
const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js(?:\?[^"']*)?)["']/gi)]
  .map(match => new URL(match[1], res.url))
  .filter(url => url.origin === new URL(ID_URL).origin);
assert.ok(scripts.length, "No same-origin 4PLANET ID JavaScript assets found");
console.log("LIVE_ID_HTTP", res.status, res.url, "HTML_LEN", html.length);
console.log("LIVE_SCRIPT_URLS", scripts.map(u => u.href));
const bundles = [];
const queued = [...scripts];
const scanned = new Set();
while (queued.length && scanned.size < 40) {
  const url = queued.shift();
  if (scanned.has(url.href)) continue;
  scanned.add(url.href);
  const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
  const code = resp.ok ? await resp.text() : "";
  console.log("ASSET", url.href, "HTTP", resp.status, "BYTES", code.length,
    "REDIRECT_FIX", code.includes("skipBrowserRedirect"),
    "SDK_FALLBACK", code.includes("unpkg.com/@supabase/supabase-js@2.115.0"),
    "IDENTITY", code.includes("Fortsett med Google"));
  if (resp.ok) bundles.push(code);
  for (const m of code.matchAll(/["']([^"'\\s]+\\.js(?:\\?[^"'\\s]*)?)["']/g)) {
    try {
      const linked = new URL(m[1], url);
      if (linked.origin === url.origin && !scanned.has(linked.href)) queued.push(linked);
    } catch { /* external string, not an asset */ }
  }
}
const full = bundles.join("\n");
assert.ok(full.includes("skipBrowserRedirect"), "LIVE asset graph is missing the P0 single-navigation Google fix");
assert.ok(full.includes("unpkg.com/@supabase/supabase-js@2.115.0"), "LIVE asset graph is missing the repaired SDK loader");
console.log("PASS: Live ID bundle serves the Google P0 fix and supported Supabase SDK fallback");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let oauthRequests = 0;
  let authorizeUrl = "";
  await page.route("**/auth/v1/authorize?**", async route => {
    oauthRequests++;
    authorizeUrl = route.request().url();
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>OAuth gateway intercepted</title>",
    });
  });
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.goto(ID_URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  const button = page.getByRole("button", { name: "Fortsett med Google" });
  await button.waitFor({ state: "visible", timeout: 20000 });
  await assert.doesNotReject(() => button.click({ timeout: 20000 }));
  await page.waitForURL(/supabase\.co\/auth\/v1\/authorize\?/, { timeout: 30000 });
  assert.equal(oauthRequests, 1, "Expected exactly one Google OAuth launch");
  assert.equal(errors.length, 0, "Uncaught ID browser errors: " + errors.join(" | "));
  console.log("PASS: Live mobile browser Google button navigates to Supabase authorize exactly once");
  // Verify the real provider leg without accessing or signing into a Google account.
  assert.ok(authorizeUrl.startsWith("https://ghvdzetmplqkdtfqiror.supabase.co/auth/v1/authorize?"));
  const provider = await fetch(authorizeUrl, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  assert.ok(provider.status >= 300 && provider.status < 400, "Supabase authorize did not redirect to provider: " + provider.status);
  const destination = provider.headers.get("location");
  assert.ok(destination && new URL(destination).hostname === "accounts.google.com",
    "Supabase authorize did not direct to real Google sign-in");
  console.log("PASS: Supabase OAuth authorize redirects to accounts.google.com (without user credentials)");
} finally {
  await browser.close();
}
