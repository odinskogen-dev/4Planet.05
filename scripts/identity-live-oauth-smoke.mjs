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
const bundles = [];
for (const url of scripts) {
  const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (resp.ok) bundles.push(await resp.text());
}
const full = bundles.join("\n");
assert.ok(full.includes("skipBrowserRedirect"), "LIVE asset is missing the P0 single-navigation Google fix");
assert.ok(full.includes("unpkg.com/@supabase/supabase-js@2.115.0"), "LIVE asset is missing the repaired SDK loader");
console.log("PASS: Live ID bundle serves the Google P0 fix and supported Supabase SDK fallback");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let oauthRequests = 0;
  await page.route("**/auth/v1/authorize?**", async route => {
    oauthRequests++;
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
} finally {
  await browser.close();
}
