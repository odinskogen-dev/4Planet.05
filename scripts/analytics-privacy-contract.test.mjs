import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/analytics/Analytics.tsx", import.meta.url), "utf8");
const sourceFile = ts.createSourceFile(
  "Analytics.tsx",
  source,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TSX,
);

function functionSource(name) {
  const declaration = sourceFile.statements.find((statement) => (
    ts.isFunctionDeclaration(statement) && statement.name?.text === name
  ));
  assert.ok(declaration, `${name} must exist`);
  return declaration.getText(sourceFile);
}

const isolated = [
  "decodeForAnalyticsInspection",
  "hasUnsupportedNestedAnalyticsEncoding",
  "containsSensitiveAnalyticsMaterial",
  "privacySafeEventParameters",
].map(functionSource).join("\n\n");
const transpiled = ts.transpileModule(isolated, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { privacySafeEventParameters } = await import(
  "data:text/javascript;base64," + Buffer.from(transpiled).toString("base64")
);

test("keeps useful anonymous product events", () => {
  const row = { object_kind: "species", object_slug: "orca", product_area: "species", attempts: 2, internal: false };
  assert.deepEqual(privacySafeEventParameters(row), row);
});

test("retains bounded public IMPACT action, project and actor identity while dropping unsafe metadata", () => {
  const first = privacySafeEventParameters({
    action_id: "action:4p:impact:shared-label:a",
    action_url: "https://example.org/action/a?recipient=person@example.org",
    action_type: "external",
    project_id: "project:4p:impact:florida-coral-restoration",
    actor_id: "actor:4p:impact:coral-restoration-foundation",
  });
  const second = privacySafeEventParameters({
    action_id: "action:4p:impact:shared-label:b",
    action_url: "https://example.org/action/b",
    action_type: "external",
    project_id: "project:4p:impact:bay-of-biscay",
    actor_id: "P17-A036",
  });

  assert.deepEqual(first, {
    action_id: "action:4p:impact:shared-label:a",
    project_id: "project:4p:impact:florida-coral-restoration",
    actor_id: "actor:4p:impact:coral-restoration-foundation",
  });
  assert.deepEqual(second, {
    action_id: "action:4p:impact:shared-label:b",
    project_id: "project:4p:impact:bay-of-biscay",
    actor_id: "P17-A036",
  });
  assert.notEqual(first.action_id, second.action_id);
  assert.notEqual(first.project_id, second.project_id);
  assert.notEqual(first.actor_id, second.actor_id);
});

test("drops private, tenant and malformed context identifiers", () => {
  assert.deepEqual(privacySafeEventParameters({
    actor_id: "person@example.org",
    project_id: "project:customer:private:123",
  }), {});
  assert.deepEqual(privacySafeEventParameters({
    actor_id: "tenant:private:actor:123",
    project_id: "project:4p:impact:contains email@example.org",
  }), {});
  assert.deepEqual(privacySafeEventParameters({
    actor_id: 42,
    project_id: true,
  }), {});
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

test("drops independent-Gold authorization, cookie and nested-code bypass cases", () => {
  const clean = privacySafeEventParameters({
    product_area: "species",
    authorization: "Bearer TEST_CREDENTIAL",
    Authorization: "Bearer TEST_CREDENTIAL",
    cookie: "sessionid=TEST_CREDENTIAL",
    redirect: "https://4planet.org/?code=TEST_CREDENTIAL",
  });

  assert.deepEqual(clean, { product_area: "species" });
});

test("tracking uses sanitised payload before BOTH sinks", () => {
  const trackSegment = source.slice(
    source.indexOf("export function trackEvent"),
    source.indexOf("function dispatchAnalyticsEvent"),
  );
  assert.match(trackSegment, /const shared = privacySafeEventParameters\(\{[\s\S]*\.\.\.parameters/);
  assert.match(trackSegment, /return dispatchAnalyticsEvent\(name, shared\)/);

  const dispatchSegment = source.slice(
    source.indexOf("function dispatchAnalyticsEvent"),
    source.indexOf("export function resetAnalyticsConsent"),
  );
  assert.match(dispatchSegment, /window\.gtag\?\.\("event", name, \{/);
  assert.ok(dispatchSegment.includes("page_location: `${window.location.origin}${safePath}`"));
  assert.match(dispatchSegment, /isSensitiveAnalyticsNavigation\(\)/);
  assert.match(dispatchSegment, /capturePostHog\(name, properties\)/);
});
