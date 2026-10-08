import { strict as assert } from "node:assert";
import { chromium } from "@playwright/test";

const loginUrl = "https://id.4planet.org/login?auth_return=google&return_to=https%3A%2F%2F4planet.org%2F";
const home = await fetch(loginUrl, { signal: AbortSignal.timeout(20000) });
assert.equal(home.status, 200, "ID live homepage HTTP status");
const html = await home.text();
const jsPaths = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js(?:\?[^"']*)?)["']/gi)].map(m => new URL(m[1], home.url));
let checked = 0;
for (const jsUrl of jsPaths) {
  if (jsUrl.origin !== new URL(loginUrl).origin) continue;
  const response = await fetch(jsUrl, { signal: AbortSignal.timeout(20000) });
  const code = response.ok ? await response.text() : "";
  const hasGoogleRecovery = code.includes("Google returnerte til 4PLANET") && code.includes("auth_return") && code.includes("Innlogging bekreftet.");
  console.log("ID_JS", jsUrl.pathname, "HTTP", response.status, "BYTES", code.length, "GOOGLE_RETURN_FIX", hasGoogleRecovery);
  if (hasGoogleRecovery) checked++;
}
assert.ok(checked > 0, "LIVE ID still serves stale JS without the Google session return fix");
console.log("PASS LIVE SOURCE: Google callback recovery and visible status deployed");

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  let bridgeCalls = 0;
  await page.addInitScript(() => {
    const session = { access_token: "test-nonreal", refresh_token: "test-nonreal", user: { id: "synthetic", email: "test@example.invalid" } };
    window.supabase = { createClient: () => ({ auth: {
      onAuthStateChange(cb) { cb("SIGNED_IN", session); return { data: { subscription: { unsubscribe() {} } } }; },
      async getSession() { return { data: { session: null }, error: null }; },
      getUserIdentities() { return new Promise(() => {}); },
    } }) };
  });
  await page.route("**/functions/v1/four-planet-id-bridge", async route => {
    bridgeCalls++;
    assert.equal(route.request().method(), "POST");
    assert.equal(JSON.parse(route.request().postData()).target_origin, "https://4planet.org");
    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/json", "access-control-allow-origin": "https://id.4planet.org" },
      body: JSON.stringify({ token_hash: "test-only" }),
    });
  });
  await page.route("https://4planet.org/**", async route => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Test return</title>" }));
  await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  const timeout = Date.now() + 12000;
  while (bridgeCalls < 1 && Date.now() < timeout) await page.waitForTimeout(100);
  assert.equal(bridgeCalls, 1, "LIVE early SIGNED_IN did not invoke first-party session bridge");
  console.log("PASS LIVE BROWSER: Early authenticated callback triggers exactly one cross-domain bridge");
} finally {
  await browser.close();
}
