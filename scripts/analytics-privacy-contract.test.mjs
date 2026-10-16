import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/analytics/Analytics.tsx", import.meta.url), "utf8");
const match = source.match(/export function privacySafeEventParameters[\s\S]*?\n}\n\nexport function trackEvent/);
assert.ok(match, "privacy-safe event helper must exist");
const isolated = match[0].replace(/\n\nexport function trackEvent$/, "");
const transpiled = ts.transpileModule(isolated, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { privacySafeEventParameters } = await import(
  "data:text/javascript;base64," + Buffer.from(transpiled).toString("base64")
);

test("keeps useful anonymous product events", () => {
  const row = { object_kind: "species", object_slug: "orca", product_area: "species", result_count: 2, internal: false };
  assert.deepEqual(privacySafeEventParameters(row), row);
});

test("drops credentials, personal values, arbitrary fields and long free text before GA4/PostHog", () => {
  const clean = privacySafeEventParameters({
    access_token: "token", refreshToken: "token", idToken: "token",
    user_email: "person@example.org", phoneNumber: "123456",
    note: "contact person@example.org", stringValue: "access_token=secret",
    jwt_value: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature",
    long_details: "X".repeat(300), arbitrary_public_text: "looks harmless",
    public_slug: "orca",
    attempts: 7,
  });
  assert.deepEqual(clean, { public_slug: "orca", attempts: 7 });
});

test("rejects phone, address and bearer-like strings even under approved structured keys", () => {
  assert.deepEqual(privacySafeEventParameters({
    object_slug: "+47 999 88 777",
    canonical_entity: "47 Main Street",
    destination: "Bearer abcdefghijklmnop",
    product_area: "species",
  }), { product_area: "species" });
});

test("approved paths and hosts are bounded and query-free", () => {
  assert.deepEqual(privacySafeEventParameters({
    page_path: "/species/orca",
    landing_path: "/atlas?token=secret",
    site_host: "www.4planet.org",
    source_host: "bad host.example",
  }), { page_path: "/species/orca", site_host: "4planet.org" });
});

test("tracking uses sanitised payload before BOTH sinks", () => {
  assert.match(source, /privacySafeEventParameters\(\{[\s\S]*?\.\.\.parameters,[\s\S]*?site_host:/);
  const segment = source.slice(source.indexOf("export function trackEvent"), source.indexOf("export function resetAnalyticsConsent"));
  assert.match(segment, /window\.gtag\?\.\("event", name, shared\)/);
  assert.match(segment, /capturePostHog\(name, shared\)/);
  assert.match(segment, /return true/);
});

test("pageview and discovery use the shared sanitiser for GA4 and PostHog", () => {
  const discovery = source.slice(source.indexOf("function trackDiscoveryEntryOnce"), source.indexOf("function configuredDomains"));
  assert.match(discovery, /trackEvent\("discovery_entry"/);
  assert.doesNotMatch(discovery, /window\.gtag|capturePostHog/);

  const page = source.slice(source.indexOf("const sharedPageProperties"), source.indexOf("trackDiscoveryEntryOnce(location.pathname)") + 45);
  assert.match(page, /privacySafeEventParameters/);
  assert.match(page, /window\.gtag\?\.\("event", "page_view", sharedPageProperties\)/);
  assert.match(page, /capturePostHog\("\$pageview", sharedPageProperties\)/);
  assert.doesNotMatch(page, /page_title|location\.search|location\.hash/);
});
