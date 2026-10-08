import { strict as assert } from "node:assert";
import { chromium } from "@playwright/test";

const origin = "http://127.0.0.1:4178";
const url = origin + "/id/login?auth_return=google&return_to=https%3A%2F%2F4planet.org%2F";
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  let calls = 0;
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  await page.addInitScript(() => {
    // Deliberately deliver SIGNED_IN before getSession returns null.
    // This is the exact early callback scenario we must not discard.
    const fakeSession = {
      access_token: "synthetic-test-only-token",
      refresh_token: "synthetic-test-only-refresh",
      user: { id: "synthetic-only", email: "test@example.invalid" },
    };
    window.supabase = {
      createClient: () => ({
        auth: {
          onAuthStateChange(callback) {
            callback("SIGNED_IN", fakeSession);
            return { data: { subscription: { unsubscribe() {} } } };
          },
          async getSession() { return { data: { session: null }, error: null }; },
          getUserIdentities() { return new Promise(() => {}); },
        },
      }),
    };
  });
  await page.route("**/functions/v1/four-planet-id-bridge", async route => {
    calls += 1;
    const request = route.request();
    assert.equal(request.method(), "POST");
    assert.equal(JSON.parse(request.postData()).target_origin, "https://4planet.org");
    await route.fulfill({
      status: 200,
      headers: {
        "access-control-allow-origin": origin,
        "content-type": "application/json",
      },
      body: JSON.stringify({ token_hash: "synthetic-test-only-hash" }),
    });
  });
  await page.route("https://4planet.org/**", async route => route.fulfill({
    status: 200, contentType: "text/html", body: "<title>Synthetic callback captured</title>",
  }));
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  const deadline = Date.now() + 12000;
  while (calls !== 1 && Date.now() < deadline) await page.waitForTimeout(100);
  assert.equal(calls, 1, "An early SIGNED_IN event must bridge exactly once");
  assert.deepEqual(errors, [], "No uncaught errors expected");
  console.log("PASS early SIGNED_IN bridges immediately, before any profile hydration");

  // Fallback: browser returns with implicit OAuth fragment but the SDK misses it.
  const recovery = await browser.newPage();
  let recoveredBridge = 0;
  await recovery.addInitScript(() => {
    window.supabase = {
      createClient: () => ({
        auth: {
          onAuthStateChange(callback) {
            callback("INITIAL_SESSION", null);
            return { data: { subscription: { unsubscribe() {} } } };
          },
          async getSession() { return { data: { session: null }, error: null }; },
          async setSession(tokens) {
            if (tokens.access_token !== "synthetic-access" || tokens.refresh_token !== "synthetic-refresh") {
              return { data: { session: null }, error: { message: "test tokens missing" } };
            }
            return {
              data: { session: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                user: { id: "synthetic-only", email: "test@example.invalid" },
              }},
              error: null,
            };
          },
        },
      }),
    };
  });
  await recovery.route("**/functions/v1/four-planet-id-bridge", async route => {
    recoveredBridge++;
    await route.fulfill({
      status: 200,
      headers: { "access-control-allow-origin": origin, "content-type": "application/json" },
      body: JSON.stringify({ token_hash: "synthetic-test-only-hash" }),
    });
  });
  await recovery.route("https://4planet.org/**", async route => route.fulfill({
    status: 200, contentType: "text/html", body: "<title>Recovered OAuth callback captured</title>",
  }));
  await recovery.goto(url + "#access_token=synthetic-access&refresh_token=synthetic-refresh", {
    waitUntil: "domcontentloaded", timeout: 30000,
  });
  const recoveryDeadline = Date.now() + 12000;
  while (recoveredBridge !== 1 && Date.now() < recoveryDeadline) await recovery.waitForTimeout(100);
  assert.equal(recoveredBridge, 1, "Implicit Google OAuth fragment must be validated and bridged");
  console.log("PASS missed Google fragment is validated by Supabase setSession and bridged");

  const noSession = await browser.newPage();
  await noSession.addInitScript(() => {
    window.supabase = {
      createClient: () => ({
        auth: {
          onAuthStateChange(callback) {
            callback("INITIAL_SESSION", null);
            return { data: { subscription: { unsubscribe() {} } } };
          },
          async getSession() { return { data: { session: null }, error: null }; },
        },
      }),
    };
  });
  await noSession.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await noSession.getByText("Google returnerte til 4PLANET, men ingen innlogget sesjon ble funnet.", { exact: false }).waitFor({ state: "visible", timeout: 10000 });
  console.log("PASS missing Google callback session shows human-readable error, not silent login loop");
} finally {
  await browser.close();
}
