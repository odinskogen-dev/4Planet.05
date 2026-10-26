import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/analytics/Analytics.tsx", import.meta.url), "utf8");
const productAnalyticsSource = readFileSync(new URL("../src/analytics/ProductAnalytics.ts", import.meta.url), "utf8");
const sourceFile = ts.createSourceFile(
  "Analytics.tsx",
  source,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TSX,
);
const productAnalyticsSourceFile = ts.createSourceFile(
  "ProductAnalytics.ts",
  productAnalyticsSource,
  ts.ScriptTarget.ES2022,
  true,
  ts.ScriptKind.TS,
);

function functionSource(name) {
  const declaration = sourceFile.statements.find((statement) => (
    ts.isFunctionDeclaration(statement) && statement.name?.text === name
  ));
  assert.ok(declaration, `${name} must exist`);
  return declaration.getText(sourceFile);
}

function productFunctionSource(name) {
  const declaration = productAnalyticsSourceFile.statements.find((statement) => (
    ts.isFunctionDeclaration(statement) && statement.name?.text === name
  ));
  assert.ok(declaration, `${name} must exist in ProductAnalytics.ts`);
  return declaration.getText(productAnalyticsSourceFile);
}

let analyticsRuntimeSequence = 0;

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

function embeddedSurfaceRuntime() {
  const runtimeSource = [
    "function isAtlasEmbedKind(value) { return ['news', 'species', 'place', 'impact', 'nation', 'brands', 'personal', 'solutions', 's4piens'].includes(value); }",
    functionSource("isEmbeddedAnalyticsSurface"),
    "export { isEmbeddedAnalyticsSurface };",
  ].join("\n\n");
  const runtimeTranspiled = ts.transpileModule(runtimeSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  return import("data:text/javascript;base64," + Buffer.from(runtimeTranspiled).toString("base64"));
}

test("keeps consent UI and analytics out of valid first-party Atlas embeds", async () => {
  const { isEmbeddedAnalyticsSurface } = await embeddedSurfaceRuntime();

  assert.equal(isEmbeddedAnalyticsSurface("/embed/atlas", "?embed=news&surface=discovery"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/embed/atlas/", "?embed=news&surface=discovery"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/atlas", "?embed=species"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/atlas/", "?embed=species"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/ATLAS", "?embed=species"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/ATLAS/", "?embed=species"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/EMBED/ATLAS", "?embed=news"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/embed/ATLAS/", "?embed=news"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/%61tlas", "?embed=species"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/atl%61s", "?embed=species"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/embed/atl%61s", "?embed=news"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/%65mbed/atlas", "?embed=news"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/atlas%2Fextra", "?embed=species"), false);
  assert.equal(isEmbeddedAnalyticsSurface("/embed%2Fatlas", "?embed=news"), false);
  assert.equal(isEmbeddedAnalyticsSurface("/atlas%ZZ", "?embed=species"), true);
  assert.equal(isEmbeddedAnalyticsSurface("/embed/atlas", "?embed=unknown"), false);
  assert.equal(isEmbeddedAnalyticsSurface("/now/", "?embed=news"), false);

  const analyticsComponent = functionSource("Analytics");
  assert.match(analyticsComponent, /isEmbeddedAnalyticsSurface\(location\.pathname, location\.search\)/);
  assert.match(analyticsComponent, /if \(!allowedHost \|\| !id \|\| internalTraffic \|\| embeddedSurface\) return;/);
  assert.match(analyticsComponent, /if \(!allowedHost \|\| !id \|\| internalTraffic \|\| embeddedSurface \|\| consent !== null/);
});

function analyticsRuntime(pathname = "/species/orca") {
  const runtimeSource = [
    "const ga4Events = [];",
    "const postHogEvents = [];",
    `const window = { location: { hostname: '4planet.org', pathname: ${JSON.stringify(pathname)}, search: '', hash: '', origin: 'https://4planet.org' }, gtag: (...args) => ga4Events.push(args) };`,
    "const document = { getElementById: (id) => id === '4planet-ga4' ? {} : null };",
    "function readConsent() { return 'granted'; }",
    "function isInternalAnalyticsBrowser() { return false; }",
    "function isAnalyticsHostAllowed() { return true; }",
    "function canonicalHost(host) { return host; }",
    "function capturePostHog(name, properties) { postHogEvents.push([name, properties]); return true; }",
    "function isAtlasEmbedKind(value) { return ['news', 'species', 'place', 'impact', 'nation', 'brands', 'personal', 'solutions', 's4piens'].includes(value); }",
    ...[
      "decodeForAnalyticsInspection",
      "hasUnsupportedNestedAnalyticsEncoding",
      "containsSensitiveAnalyticsMaterial",
      "isSensitiveAnalyticsNavigation",
      "privacySafeEventParameters",
      "isEmbeddedAnalyticsSurface",
      "trackEvent",
      "dispatchAnalyticsEvent",
    ].map(functionSource),
    "export { trackEvent, ga4Events, postHogEvents };",
  ].join("\n\n");
  const runtimeTranspiled = ts.transpileModule(runtimeSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  analyticsRuntimeSequence += 1;
  return import("data:text/javascript;base64," + Buffer.from(runtimeTranspiled).toString("base64") + `#runtime=${analyticsRuntimeSequence}`);
}

function routeAnalyticsRuntime({
  pathname,
  search = "",
  consent = "granted",
  internal = false,
  allowedHost = true,
  hostname = "4planet.org",
} = { pathname: "/species/orca" }) {
  const runtimeSource = [
    "const ga4Events = [];",
    "const postHogEvents = [];",
    `const window = { location: { hostname: ${JSON.stringify(hostname)}, pathname: ${JSON.stringify(pathname)}, search: ${JSON.stringify(search)}, hash: '', origin: 'https://4planet.org' }, gtag: (...args) => ga4Events.push(args) };`,
    "const document = { getElementById: (id) => id === '4planet-ga4' ? {} : null };",
    `function readConsent() { return ${JSON.stringify(consent)}; }`,
    `function isInternalAnalyticsBrowser() { return ${JSON.stringify(internal)}; }`,
    `function isAnalyticsHostAllowed() { return ${JSON.stringify(allowedHost)}; }`,
    "function canonicalHost(host) { return host; }",
    "function capturePostHog(name, properties) { postHogEvents.push([name, properties]); return true; }",
    "function isAtlasEmbedKind(value) { return ['news', 'species', 'place', 'impact', 'nation', 'brands', 'personal', 'solutions', 's4piens'].includes(value); }",
    ...[
      "decodeForAnalyticsInspection",
      "hasUnsupportedNestedAnalyticsEncoding",
      "containsSensitiveAnalyticsMaterial",
      "isSensitiveAnalyticsNavigation",
      "privacySafeEventParameters",
      "isEmbeddedAnalyticsSurface",
      "trackEvent",
      "dispatchAnalyticsEvent",
    ].map(functionSource),
    ...[
      "safeToken",
      "trackProductEntry",
      "trackMeaningfulUse",
    ].map(productFunctionSource),
    "export { trackEvent, trackProductEntry, trackMeaningfulUse, ga4Events, postHogEvents };",
  ].join("\n\n");
  const runtimeTranspiled = ts.transpileModule(runtimeSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  analyticsRuntimeSequence += 1;
  return import("data:text/javascript;base64," + Buffer.from(runtimeTranspiled).toString("base64") + `#route-runtime=${analyticsRuntimeSequence}`);
}

test("route analytics cannot bypass the valid Atlas embed boundary", async () => {
  for (const [pathname, search] of [
    ["/embed/atlas", "?embed=news&surface=discovery"],
    ["/embed/atlas/", "?embed=news&surface=discovery"],
    ["/atlas", "?embed=species"],
    ["/atlas/", "?embed=species"],
    ["/ATLAS", "?embed=species"],
    ["/ATLAS/", "?embed=species"],
    ["/EMBED/ATLAS", "?embed=news&surface=discovery"],
    ["/embed/ATLAS/", "?embed=news&surface=discovery"],
    ["/%61tlas", "?embed=species"],
    ["/atl%61s", "?embed=species"],
    ["/embed/atl%61s", "?embed=news&surface=discovery"],
    ["/%65mbed/atlas", "?embed=news&surface=discovery"],
  ]) {
    const runtime = await routeAnalyticsRuntime({ pathname, search });
    assert.equal(runtime.trackProductEntry("atlas", pathname, "internal"), false);
    assert.equal(runtime.trackEvent("return_visit", { product_area: "atlas" }), false);
    assert.equal(runtime.trackMeaningfulUse("atlas", "engaged_time", "route"), false);
    assert.equal(runtime.ga4Events.length, 0);
    assert.equal(runtime.postHogEvents.length, 0);
  }

  for (const control of [
    { pathname: "/species/orca", search: "" },
    { pathname: "/embed/atlas", search: "?embed=unknown" },
    { pathname: "/now/", search: "?embed=news" },
    { pathname: "/atlas%2Fextra", search: "?embed=species" },
    { pathname: "/embed%2Fatlas", search: "?embed=news" },
  ]) {
    const runtime = await routeAnalyticsRuntime(control);
    assert.equal(runtime.trackProductEntry("species", control.pathname, "direct"), true);
    assert.equal(runtime.trackEvent("return_visit", { product_area: "species" }), true);
    assert.equal(runtime.trackMeaningfulUse("species", "engaged_time", "route"), true);
    assert.equal(runtime.ga4Events.length, 3);
    assert.equal(runtime.postHogEvents.length, 3);
  }

  for (const control of [
    { pathname: "/species/orca", consent: "denied" },
    { pathname: "/species/orca", consent: null },
    { pathname: "/species/orca", internal: true },
    { pathname: "/species/orca", allowedHost: false },
    { pathname: "/auth/4planet/callback", search: "?code=TEST_CREDENTIAL" },
    { pathname: "/atlas%ZZ", search: "?embed=species" },
  ]) {
    const runtime = await routeAnalyticsRuntime(control);
    assert.equal(runtime.trackProductEntry("species", control.pathname, "direct"), false);
    assert.equal(runtime.ga4Events.length, 0);
    assert.equal(runtime.postHogEvents.length, 0);
  }
});

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

test("enforces public value semantics for identity and canonical ID fields", () => {
  assert.deepEqual(privacySafeEventParameters({
    legal_identity: "brreg_exact",
    source_id: "source:imr_no",
    object_id: "orca-profile",
    product_key: "summit-at-sunset-fine-art-print",
  }), {
    legal_identity: "brreg_exact",
    source_id: "source:imr_no",
    object_id: "orca-profile",
    product_key: "summit-at-sunset-fine-art-print",
  });

  assert.deepEqual(privacySafeEventParameters({
    legal_identity: "11029912345",
    source_id: "11029912345",
    object_id: "4798765432",
    product_key: "4111111111111111",
  }), {});
});

test("rejects identity-shaped values in every returned identifier field", () => {
  assert.deepEqual(privacySafeEventParameters({
    actor_id: "actor:4p:impact:11029912345",
    project_id: "project:4p:impact:4111111111111111",
    action_id: "action:4p:impact:11029912345",
    campaign_id: "11029912345",
    object_slug: "11029912345",
    event_id: "4111111111111111",
  }), {});
});

test("rejects Gold-returned digit shapes across every allowlisted string field", () => {
  assert.deepEqual(privacySafeEventParameters({
    destination: "11029912345",
    action_kind: "4111111111111111",
    error_kind: "4798765432",
    content_group: "11029912345",
    placement: "4111111111111111",
    product_area: "11029912345",
    decision_state: "11029912345",
    actor_id: "actor:4p:impact:110299-12345",
    project_id: "project:4p:impact:4111-1111-1111-1111",
    action_id: "action:4p:impact:110299-12345",
    campaign_id: "campaign:110299-12345",
  }), {});
});

test("preserves legitimate public values while rejecting punctuation-separated digit payloads", () => {
  assert.deepEqual(privacySafeEventParameters({
    destination: "impact",
    action_kind: "external",
    error_kind: "source_unavailable",
    content_group: "species",
    placement: "atlas_embed",
    product_area: "impact",
    decision_state: "evidence_ready",
    actor_id: "P17-A036",
    project_id: "project:4p:impact:bay-of-biscay",
    action_id: "action:4p:impact:shared-label:a",
    campaign_id: "campaign:orca-return",
  }), {
    destination: "impact",
    action_kind: "external",
    error_kind: "source_unavailable",
    content_group: "species",
    placement: "atlas_embed",
    product_area: "impact",
    decision_state: "evidence_ready",
    actor_id: "P17-A036",
    project_id: "project:4p:impact:bay-of-biscay",
    action_id: "action:4p:impact:shared-label:a",
    campaign_id: "campaign:orca-return",
  });
});

test("admits only bounded non-negative integer counters", () => {
  assert.deepEqual(privacySafeEventParameters({
    attempts: 0,
    evidence_ready_items: 2,
    item_count: 12,
    opportunity_count: 3,
    option_count: 4,
    result_count: 5,
    source_count: 6,
    unsupported_items: 7,
    decision_states: 8,
  }), {
    attempts: 0,
    evidence_ready_items: 2,
    item_count: 12,
    opportunity_count: 3,
    option_count: 4,
    result_count: 5,
    source_count: 6,
    unsupported_items: 7,
    decision_states: 8,
  });

  assert.deepEqual(privacySafeEventParameters({
    attempts: 479876543,
    source_count: 110299123,
    item_count: 411111111,
    destination: 12345,
    result_count: -1,
    option_count: 1.5,
    unsupported_items: 100001,
  }), {});
});

const remainingUrlPunctuationSeparators = [
  ["!", "%21"],
  ["$", "%24"],
  ["'", "%27"],
  ["(", "%28"],
  [")", "%29"],
  ["*", "%2A"],
  ["=", "%3D"],
];

const remainingUrlPunctuationPaths = remainingUrlPunctuationSeparators.flatMap(([literal, encoded]) => [
  `/profile/11${literal}02${literal}99${literal}12345`,
  `/profile/11${encoded}02${encoded}99${encoded}12345`,
  `/profile/11%25${encoded.slice(1)}02%25${encoded.slice(1)}99%25${encoded.slice(1)}12345`,
]);

const unicodeIdentityPaths = [
  "/profile/١١٠٢٩٩١٢٣٤٥",
  "/profile/۱۱۰۲۹۹۱۲۳۴۵",
  "/profile/११०२९९१२३४५",
  "/profile/１１０２９９１２３４５",
  "/profile/১১০২৯৯১২৩৪৫",
  "/profile/๑๑๐๒๙๙๑๒๓๔๕",
  "/profile/١١-٠٢-٩٩-١٢٣٤٥",
  "/profile/１１／０２／９９／１２３４５",
  "/profile/11٠٢99١٢٣٤٥",
  "/profile/person@example.中国",
  "/profile/pérson@example.org",
  "/profile/person@例子.org",
].map((path) => encodeURI(path));

const decomposedUnicodeIdentityPaths = [
  "/profile/person\u0301@example.org",
  "/profile/person@examp\u0301le.org",
  "/profile/person@example.o\u0301rg",
  "/profile/e\u0301@example.org",
  "/profile/cafe\u0301@example.org",
  "/profile/user@cafe\u0301.org",
].map((path) => encodeURI(path));

test("rejects encoded identity-shaped values in every path field", () => {
  const raw = "/profile/11029912345";
  const encoded = "/profile/%31%31%30%32%39%39%31%32%33%34%35";
  const doubleEncoded = "/profile/%2531%2531%2530%2532%2539%2539%2531%2532%2533%2534%2535";
  const punctuated = "/profile/%31%31%30-%32%39%39/%31%32%33%34%35";
  const separatorVariants = [
    "/profile/11+02+99+12345",
    "/profile/11%2B02%2B99%2B12345",
    "/profile/11%2002%2099%2012345",
    "/profile/11%252B02%252B99%252B12345",
    "/profile/11%252002%252099%252012345",
    "/profile/11~02~99~12345",
    "/profile/11;02;99;12345",
    "/profile/11,02,99,12345",
    "/profile/11@02@99@12345",
  ];

  for (const path of [raw, encoded, doubleEncoded, punctuated, ...separatorVariants, ...remainingUrlPunctuationPaths]) {
    assert.deepEqual(privacySafeEventParameters({
      page_path: path,
      entry_path: path,
      landing_path: path,
    }), {});
  }

  assert.deepEqual(privacySafeEventParameters({
    page_path: "/species/orca",
    entry_path: "/atlas/place/bergen",
    landing_path: "/livingsystems",
  }), {
    page_path: "/species/orca",
    entry_path: "/atlas/place/bergen",
    landing_path: "/livingsystems",
  });
});

test("rejects Gold-returned Unicode identities in every path field", () => {
  for (const path of unicodeIdentityPaths) {
    assert.deepEqual(privacySafeEventParameters({
      page_path: path,
      entry_path: path,
      landing_path: path,
    }), {}, path);
  }
});

test("rejects decomposed Unicode email identities in every path field", () => {
  for (const path of decomposedUnicodeIdentityPaths) {
    assert.deepEqual(privacySafeEventParameters({
      page_path: path,
      entry_path: path,
      landing_path: path,
    }), {}, path);
  }
});

test("unsafe current pathname suppresses BOTH sinks without caller path properties", async () => {
  const paths = [
    "/profile/11029912345",
    "/profile/%31%31%30%32%39%39%31%32%33%34%35",
    "/profile/%2531%2531%2530%2532%2539%2539%2531%2532%2533%2534%2535",
    "/profile/%31%31%30-%32%39%39/%31%32%33%34%35",
    "/profile/11+02+99+12345",
    "/profile/11%2B02%2B99%2B12345",
    "/profile/11%2002%2099%2012345",
    "/profile/11%252B02%252B99%252B12345",
    "/profile/11%252002%252099%252012345",
    "/profile/11~02~99~12345",
    "/profile/11;02;99;12345",
    "/profile/11,02,99,12345",
    "/profile/11@02@99@12345",
    ...remainingUrlPunctuationPaths,
  ];

  for (const path of paths) {
    const { trackEvent, ga4Events, postHogEvents } = await analyticsRuntime(path);
    assert.equal(trackEvent("audit_test", { product_area: "impact" }), false, path);
    assert.equal(ga4Events.length, 0, path);
    assert.equal(postHogEvents.length, 0, path);
  }
});

test("Unicode identity pathnames suppress BOTH sinks and page_location", async () => {
  for (const path of unicodeIdentityPaths) {
    const { trackEvent, ga4Events, postHogEvents } = await analyticsRuntime(path);
    assert.equal(trackEvent("audit_test", { product_area: "impact" }), false, path);
    assert.equal(ga4Events.length, 0, path);
    assert.equal(postHogEvents.length, 0, path);
  }
});

test("decomposed Unicode email pathnames suppress BOTH sinks and page_location", async () => {
  for (const path of decomposedUnicodeIdentityPaths) {
    const { trackEvent, ga4Events, postHogEvents } = await analyticsRuntime(path);
    assert.equal(trackEvent("audit_test", { product_area: "impact" }), false, path);
    assert.equal(ga4Events.length, 0, path);
    assert.equal(postHogEvents.length, 0, path);
  }
});

test("legitimate public routes still reach BOTH analytics sinks", async () => {
  const paths = [
    "/species/orca",
    "/atlas/place/bergen",
    "/livingsystems",
    "/impact",
    "/magazine/forest-health",
    encodeURI("/species/épaulard"),
    encodeURI("/atlas/place/北京"),
  ];

  for (const path of paths) {
    const { trackEvent, ga4Events, postHogEvents } = await analyticsRuntime(path);
    assert.equal(trackEvent("audit_test", { product_area: "impact" }), true, path);
    assert.equal(ga4Events.length, 1, path);
    assert.equal(postHogEvents.length, 1, path);
    assert.equal(ga4Events[0][2].page_location, `https://4planet.org${path}`, path);
  }
});

test("drops identity-shaped values before BOTH analytics sinks", async () => {
  const { trackEvent, ga4Events, postHogEvents } = await analyticsRuntime();
  assert.equal(trackEvent("test_event", {
    product_area: "species",
    legal_identity: "11029912345",
    source_id: "11029912345",
    object_id: "4798765432",
    product_key: "4111111111111111",
  }), true);

  assert.equal(ga4Events.length, 1);
  assert.equal(postHogEvents.length, 1);
  assert.deepEqual(ga4Events[0][2], {
    product_area: "species",
    site_host: "4planet.org",
    page_location: "https://4planet.org/species/orca",
  });
  assert.deepEqual(postHogEvents[0][1], {
    product_area: "species",
    site_host: "4planet.org",
  });
});

test("drops returned identifier bypasses before BOTH analytics sinks", async () => {
  const { trackEvent, ga4Events, postHogEvents } = await analyticsRuntime();
  assert.equal(trackEvent("test_event", {
    product_area: "impact",
    actor_id: "actor:4p:impact:11029912345",
    project_id: "project:4p:impact:4111111111111111",
    action_id: "action:4p:impact:11029912345",
    campaign_id: "11029912345",
    object_slug: "11029912345",
    event_id: "4111111111111111",
  }), true);

  assert.equal(ga4Events.length, 1);
  assert.equal(postHogEvents.length, 1);
  assert.deepEqual(ga4Events[0][2], {
    product_area: "impact",
    site_host: "4planet.org",
    page_location: "https://4planet.org/species/orca",
  });
  assert.deepEqual(postHogEvents[0][1], {
    product_area: "impact",
    site_host: "4planet.org",
  });
});

test("drops all Gold-returned generic and formatted values before BOTH analytics sinks", async () => {
  const { trackEvent, ga4Events, postHogEvents } = await analyticsRuntime();
  assert.equal(trackEvent("audit_test", {
    destination: "11029912345",
    action_kind: "4111111111111111",
    error_kind: "4798765432",
    content_group: "11029912345",
    placement: "4111111111111111",
    product_area: "11029912345",
    decision_state: "11029912345",
    actor_id: "actor:4p:impact:110299-12345",
    project_id: "project:4p:impact:4111-1111-1111-1111",
    action_id: "action:4p:impact:110299-12345",
    campaign_id: "campaign:110299-12345",
  }), true);

  assert.equal(ga4Events.length, 1);
  assert.equal(postHogEvents.length, 1);
  assert.deepEqual(ga4Events[0][2], {
    site_host: "4planet.org",
    page_location: "https://4planet.org/species/orca",
  });
  assert.deepEqual(postHogEvents[0][1], {
    site_host: "4planet.org",
  });
});

test("drops oversized numeric values before BOTH analytics sinks", async () => {
  const { trackEvent, ga4Events, postHogEvents } = await analyticsRuntime();
  assert.equal(trackEvent("audit_test", {
    attempts: 479876543,
    source_count: 110299123,
    item_count: 411111111,
    destination: 12345,
    result_count: -1,
    option_count: 1.5,
    unsupported_items: 100001,
    product_area: "impact",
  }), true);

  assert.equal(ga4Events.length, 1);
  assert.equal(postHogEvents.length, 1);
  assert.deepEqual(ga4Events[0][2], {
    product_area: "impact",
    site_host: "4planet.org",
    page_location: "https://4planet.org/species/orca",
  });
  assert.deepEqual(postHogEvents[0][1], {
    product_area: "impact",
    site_host: "4planet.org",
  });
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
