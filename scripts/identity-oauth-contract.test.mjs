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
  assert.ok(flow.includes('redirectTo: identityCallbackUrl("login", returnTo, "google")'));
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
  assert.ok(startup.includes('event === "SIGNED_IN"'));
  assert.ok(startup.includes('event === "INITIAL_SESSION"'));
  assert.ok(!startup.includes("bootstrapped"));
  assert.ok(startup.includes("queueHandoff(next)"));
  assert.ok(startup.includes("queueHandoff(active)"));
  assert.ok(startup.includes("window.setTimeout(() => {"));
  assert.ok(startup.indexOf("queueHandoff(active)") < startup.indexOf('if (mode === "account") await hydrateAccount(active)'), "handoff must precede profile hydration");
  assert.ok(!startup.includes("await hydrateAccount(result.data.session)"));
  assert.ok(startup.includes("ingen innlogget sesjon ble funnet"));
  assert.ok(client.includes('url.searchParams.set("auth_return", "google")'));
  assert.ok(startup.includes("recoverOAuthSessionFromLocation()"));
  assert.ok(client.includes("await client.auth.setSession("));
  assert.ok(client.includes('window.history.replaceState({}, "", window.location.pathname + window.location.search)'));
});

test("return_to never forwards OAuth secrets or contact details to the identity host", () => {
  const match = client.match(/export function safeReturnTo\([^\n]+\) \{([\s\S]*?)\n\}\n\nexport function identityLoginUrl/);
  assert.ok(match, "safeReturnTo implementation should be testable");
  // Evaluate this bounded helper only, with a known, fixed site origin.
  const executableBody = match[1].replace("(input: string)", "(input)");
  const safeReturnTo = new Function(
    "window",
    "TRUSTED_RETURN_ORIGINS",
    'return function safeReturnTo(value, fallback = "https://4planet.org/") {' + executableBody + '}',
  )(
    { location: { origin: "https://4planet.org" } },
    new Set(["https://4planet.org", "https://4planetatlas.com"]),
  );
  assert.equal(
    safeReturnTo("https://4planetatlas.com/atlas?m=OCE4N&l=whales&z=3.1#access_token=private"),
    "https://4planetatlas.com/atlas?m=OCE4N&l=whales&z=3.1",
  );
  const result = safeReturnTo(
    "https://4planet.org/atlas?access_token=private&refresh_token=private&code=secret&state=secret&email=person%40example.org&m=PLANET",
  );
  assert.equal(result, "https://4planet.org/atlas?m=PLANET");
  assert.equal(safeReturnTo("https://4planet.org/?q=person%40example.org&year=2026"), "https://4planet.org/?year=2026");
  assert.equal(safeReturnTo("https://4planet.org/?note=access_token%3Dsecret&year=2026"), "https://4planet.org/?year=2026");
  assert.equal(safeReturnTo("https://4planet.org/auth/4planet/callback?code=secret"), "https://4planet.org/");
  assert.equal(safeReturnTo("https://4planet.org/%61uth/4planet/callback?next=atlas"), "https://4planet.org/");
  assert.equal(safeReturnTo("https://4planet.org/%253Faccess_token%253Dsecret"), "https://4planet.org/");
  assert.equal(safeReturnTo("https://4planet.org/share/person%2540example.org"), "https://4planet.org/");
  assert.equal(safeReturnTo("https://4planet.org/atlas?next=access_token%253Dsecret&m=PLANET"), "https://4planet.org/atlas?m=PLANET");
  assert.equal(safeReturnTo("https://malicious.example/?next=https://4planet.org/"), "https://4planet.org/");
});
