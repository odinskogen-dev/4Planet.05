import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../src/pages/identity/IdentityApp.tsx", import.meta.url), "utf8");
const client = readFileSync(new URL("../src/identity/identityClient.ts", import.meta.url), "utf8");

test("Google OAuth on 4PLANET ID has exactly one browser redirect", () => {
  const start = app.indexOf("async function google()");
  const end = app.indexOf("async function saveAccount()", start);
  assert.ok(start >= 0 && end > start);
  const flow = app.slice(start, end);
  assert.match(flow, /skipBrowserRedirect:\s*true/);
  assert.match(flow, /provider:\s*"google"/);
  assert.match(flow, /redirectTo:\\s*identityCallbackUrl\\("login",\\s*returnTo,\\s*"google"\\)/);
  assert.equal((flow.match(/window\.location\.assign\(/g) || []).length, 1);
  assert.match(flow, /if \(!result\.data\.url\) throw/);
  assert.match(flow, /oauthUrl\.origin/);
  assert.match(flow, /oauthUrl\.pathname/);
  assert.doesNotMatch(flow, /window\.location\.assign\(result\.data\.url\)/);
});

test("Auth SDK uses pinned official UMD CDN entry and safe fallback", () => {
  assert.match(client, /cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2\.115\.0"/);
  assert.match(client, /unpkg\.com\/@supabase\/supabase-js@2\.115\.0"/);
  assert.doesNotMatch(client, /dist\/umd\/supabase\.min\.js/);
  assert.match(client, /clientPromise/);
  assert.match(client, /sdkPromise = null/);
  assert.match(client, /Auth SDK failed to load/);
});

test("Cross-domain session bridge and OAuth callback remain intact", () => {
  assert.match(client, /four-planet-id-bridge/);
  assert.match(client, /verifyOtp\(\{ token_hash: tokenHash, type: "email" \}\)/);
  assert.match(client, /detectSessionInUrl: true/);
  assert.match(app, /event === "SIGNED_IN"/);
  assert.match(app, /consumeBridgeFromLocation\(\)/);
  assert.match(app, /redirectInProgress/);
});

test("Google return never waits on profile hydration or loses early auth events", () => {
  const startup = app.slice(app.indexOf("  useEffect(() => {"), app.indexOf("  async function submit("));
  assert.match(startup, /event === "SIGNED_IN"/);
  assert.match(startup, /event === "INITIAL_SESSION"/);
  assert.doesNotMatch(startup, /bootstrapped/);
  assert.match(startup, /queueHandoff\\(next\\)/);
  assert.match(startup, /queueHandoff\\(active\\)/);
  assert.match(startup, /window\\.setTimeout\\(\\(\\) => \\{/);
  assert.ok(startup.indexOf("queueHandoff(active)") < startup.indexOf('if (mode === "account") await hydrateAccount(active)'), "handoff must precede profile hydration");
  assert.doesNotMatch(startup, /await hydrateAccount\\(result\\.data\\.session\\)/);
  assert.match(startup, /ingen innlogget sesjon ble funnet/);
  assert.match(client, /url\\.searchParams\\.set\\("auth_return", "google"\\)/);
});
