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
  const row = { object_kind: "species", object_slug: "orca", product_area: "species", clicks: 2, internal: false };
  assert.deepEqual(privacySafeEventParameters(row), row);
});

test("retains bounded canonical action identity while dropping unsafe action metadata", () => {
  const first = privacySafeEventParameters({
    action_id: "action:4p:impact:shared-label:a",
    action_url: "https://example.org/action/a?recipient=person@example.org",
    action_type: "external",
    project_id: "project:4p:impact:a",
  });
  const second = privacySafeEventParameters({
    action_id: "action:4p:impact:shared-label:b",
    action_url: "https://example.org/action/b",
    action_type: "external",
    project_id: "project:4p:impact:b",
  });

  assert.deepEqual(first, { action_id: "action:4p:impact:shared-label:a" });
  assert.deepEqual(second, { action_id: "action:4p:impact:shared-label:b" });
  assert.notEqual(first.action_id, second.action_id);
});

test("drops credentials, personal values and long free text before GA4/PostHog", () => {
  const clean = privacySafeEventParameters({
    access_token: "token", refreshToken: "token", idToken: "token",
    user_email: "person@example.org", phoneNumber: "123456",
    note: "contact person@example.org", stringValue: "access_token=secret",
    jwt_value: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.signature",
    long_details: "X".repeat(300),
    public_slug: "orca",
    attempts: 7,
  });
  assert.deepEqual(clean, { public_slug: "orca", attempts: 7 });
});

test("tracking uses sanitised payload before BOTH sinks", () => {
  assert.match(source, /\.\.\.privacySafeEventParameters\(parameters\)/);
  const segment = source.slice(source.indexOf("export function trackEvent"), source.indexOf("export function resetAnalyticsConsent"));
  assert.match(segment, /window\.gtag\?\.\("event", name, shared\)/);
  assert.match(segment, /capturePostHog\(name, shared\)/);
});
