import test from "node:test";
import ts from "typescript";
import vm from "node:vm";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const shared = read("src/analytics/ProductAnalytics.ts");
const analytics = read("src/analytics/Analytics.tsx");
const posthog = read("src/analytics/PostHogSink.ts");
const routeAnalytics = read("src/analytics/ProductRouteAnalytics.tsx");
const market = read("src/pages/v5/CreatorMarket.tsx");
const sapien = read("src/pages/sapien/FourSapien.tsx");
const fourbrands = read("src/pages/partners/FourBrand.tsx");
const companyBrain = read("src/pages/partners/CompanyBrainControls.tsx");
const identity = read("src/pages/identity/IdentityApp.tsx");
const pantry = read("src/pages/sapien/PantryChoice.tsx");
const species = read("src/pages/integrated/Species.tsx");
const atlas = read("src/earth/World.tsx");
const sitemap = read("scripts/generate-sitemap.mjs");
const userEntryAudit = read("scripts/user-entry-audit.mjs");
const robots = read("public/robots.txt");

const requiredEvents = [
  "product_entry",
  "meaningful_use",
  "product_completion",
  "deeper_exploration",
  "share_referral",
  "join_interest",
];

const requiredAnalyticsHosts = [
  "4planet.org",
  "id.4planet.org",
  "labs.4planet.org",
  "4sapien.com",
  "4planetatlas.com",
  "4brain.app",
  "4planetmagazine.com",
  "s4piens.com",
  "4species.com",
  "4brands.org",
  "cre4tor.com",
  "cre4tor.4planet.org",
  "cre4tors.com",
  "4planetmarket.com",
];

const requiredRoutes = [
  "/",
  "/atlas",
  "/species",
  "/species/orca",
  "/4sapien",
  "/4sapien/food",
  "/4sapien/finance",
  "/4brands",
  "/livingsystems/",
  "/impact",
  "/impact/actions/bay-of-biscay-survey",
  "/market",
  "/cre4tor/odin",
  "/missions",
  "/magazine",
  "/join",
  "/journey/jaguar",
  "/journey/orca",
];

function evaluateProductClassifier(sourceText, functionName, pathname, hostname = "4planet.org") {
  const canonicalHostSource = sourceText.match(/function canonicalHost\([\s\S]*?\n}\n/);
  const classifierSource = sourceText.match(new RegExp(`function ${functionName}\\([\\s\\S]*?\\n}\\n`));
  assert.ok(canonicalHostSource, "canonicalHost helper must be extractable");
  assert.ok(classifierSource, `${functionName} must be extractable`);
  const isolated = `${canonicalHostSource[0]}\n${classifierSource[0]}\nglobalThis.__result = ${functionName}(globalThis.__path, globalThis.__host);`;
  const js = ts.transpileModule(isolated, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  const context = { __path: pathname, __host: hostname, __result: null };
  vm.runInNewContext(js, context);
  return context.__result;
}

function evaluatePrivacyParameters(parameters) {
  const decodeSource = analytics.match(/function decodeForAnalyticsInspection\([\s\S]*?\n}\n/);
  const nestedSource = analytics.match(/function hasUnsupportedNestedAnalyticsEncoding\([\s\S]*?\n}\n/);
  const sensitiveSource = analytics.match(/function containsSensitiveAnalyticsMaterial\([\s\S]*?\n}\n/);
  const privacySource = analytics.match(/export function privacySafeEventParameters\([\s\S]*?\n}\n/);
  assert.ok(decodeSource, "decodeForAnalyticsInspection must be extractable");
  assert.ok(nestedSource, "hasUnsupportedNestedAnalyticsEncoding must be extractable");
  assert.ok(sensitiveSource, "containsSensitiveAnalyticsMaterial must be extractable");
  assert.ok(privacySource, "privacySafeEventParameters must be extractable");
  const isolated = `${decodeSource[0]}\n${nestedSource[0]}\n${sensitiveSource[0]}\n${privacySource[0].replace("export function", "function")}\nglobalThis.__result = privacySafeEventParameters(globalThis.__parameters);`;
  const js = ts.transpileModule(isolated, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  const context = { __parameters: parameters, __result: null };
  vm.runInNewContext(js, context);
  return JSON.parse(JSON.stringify(context.__result));
}

test("canonical Living Systems routes resolve consistently in both analytics classifiers", () => {
  for (const pathname of ["/livingsystems", "/livingsystems/", "/livingsystems/orca"]) {
    assert.equal(evaluateProductClassifier(analytics, "productArea", pathname), "living_systems");
    assert.equal(evaluateProductClassifier(routeAnalytics, "classifyProduct", pathname), "living_systems");
  }
  assert.equal(evaluateProductClassifier(analytics, "productArea", "/livingsystems-extra"), "4planet");
  assert.equal(evaluateProductClassifier(routeAnalytics, "classifyProduct", "/livingsystems-extra"), "4planet");
  assert.equal(evaluateProductClassifier(analytics, "productArea", "/living-systems"), "living_systems");
  assert.equal(evaluateProductClassifier(routeAnalytics, "classifyProduct", "/living-systems"), "living_systems");
});

test("the user-entry audit checks the public Living Systems canonical instead of its redirect alias", () => {
  assert.match(userEntryAudit, /^\s*"\/livingsystems\/",\s*$/m);
  assert.doesNotMatch(userEntryAudit, /^\s*"\/living-systems",\s*$/m);
  assert.match(sitemap, /^\s*"\/livingsystems\/",\s*$/m);
});

function runUserEntryAuditFixture(mutateSitemap) {
  const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
  const fixtureRoot = mkdtempSync(join(tmpdir(), "4planet-user-entry-audit-"));
  const fixturePaths = [
    "scripts/generate-sitemap.mjs",
    "scripts/magazine-content.mjs",
    "public/robots.txt",
    "public/journey/jaguar/index.html",
    "public/journey/orca/index.html",
    "src/analytics/ProductAnalytics.ts",
    "src/analytics/ProductRouteAnalytics.tsx",
    "src/content/stories.ts",
    "src/data/discoveryInventory.json",
    "src/data/atlasDiscovery.json",
    "src/data/discoveryTopics.json",
    "src/data/impactDiscovery.json",
  ];

  try {
    for (const relativePath of fixturePaths) {
      const destination = join(fixtureRoot, relativePath);
      mkdirSync(dirname(destination), { recursive: true });
      cpSync(join(repositoryRoot, relativePath), destination);
    }
    mkdirSync(join(fixtureRoot, "public"), { recursive: true });
    symlinkSync(join(repositoryRoot, "node_modules"), join(fixtureRoot, "node_modules"), "dir");

    const sitemapFixture = join(fixtureRoot, "scripts/generate-sitemap.mjs");
    const sitemapSource = readFileSync(sitemapFixture, "utf8");
    const mutatedSource = mutateSitemap(sitemapSource);
    assert.notEqual(mutatedSource, sitemapSource, "fixture mutation must change sitemap evidence");
    writeFileSync(sitemapFixture, mutatedSource, "utf8");

    return spawnSync(process.execPath, [join(repositoryRoot, "scripts/user-entry-audit.mjs")], {
      cwd: fixtureRoot,
      encoding: "utf8",
    });
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

test("the user-entry audit rejects a canonical route that survives only inside a sitemap comment", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    /^\s*"\/livingsystems\/",\s*$/m,
    '  // "/livingsystems/",',
  ));
  assert.equal(result.status, 1, `audit must fail when route is commented out; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /MISSING_SITEMAP_ROUTE:\/livingsystems\//);
});

test("the user-entry audit rejects a route removed from the final emitted sitemap", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    /^const routes = (\[.*\]);$/m,
    'const routes = $1.filter((route) => route !== "/livingsystems/");',
  ));
  assert.equal(result.status, 1, `audit must inspect final sitemap output; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /MISSING_SITEMAP_ROUTE:\/livingsystems\//);
});

test("the user-entry audit ignores loc-like markup inside an emitted XML comment", () => {
  const result = runUserEntryAuditFixture((source) => source
    .replace(
      /^const routes = (\[.*\]);$/m,
      'const routes = $1.filter((route) => route !== "/livingsystems/");',
    )
    .replace(
      "${sitemapUrls}\\n</urlset>",
      "${sitemapUrls}\\n<!-- <url><loc>https://4planet.org/livingsystems/</loc></url> -->\\n</urlset>",
    ));
  assert.equal(result.status, 1, `audit must ignore comment text; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /MISSING_SITEMAP_ROUTE:\/livingsystems\//);
});

test("the user-entry audit ignores loc-like markup inside emitted CDATA", () => {
  const result = runUserEntryAuditFixture((source) => source
    .replace(
      /^const routes = (\[.*\]);$/m,
      'const routes = $1.filter((route) => route !== "/livingsystems/");',
    )
    .replace(
      "${sitemapUrls}\\n</urlset>",
      "${sitemapUrls}\\n<![CDATA[<url><loc>https://4planet.org/livingsystems/</loc></url>]]>\\n</urlset>",
    ));
  assert.equal(result.status, 1, `audit must ignore CDATA markup; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /MISSING_SITEMAP_ROUTE:\/livingsystems\//);
});

test("the user-entry audit rejects a sitemap without the sitemap namespace", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "<urlset>",
  ));
  assert.equal(result.status, 1, `audit must require the sitemap namespace; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stderr, /namespaced <urlset> root/);
});

test("the user-entry audit rejects an unbound XML namespace prefix", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    "<url><loc>${escapeXml(`${origin}${route}`)}</loc></url>",
    "<url><fake:loc>${escapeXml(`${origin}${route}`)}</fake:loc></url>",
  ));
  assert.equal(result.status, 1, `audit must reject unbound namespace prefixes; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stderr, /Unbound XML namespace prefix: fake/);
});

test("the user-entry audit rejects unquoted XML attributes", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    "<url><loc>${escapeXml(`${origin}${route}`)}</loc></url>",
    "<url><loc audit=true>${escapeXml(`${origin}${route}`)}</loc></url>",
  ));
  assert.equal(result.status, 1, `audit must reject unquoted XML attributes; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stderr, /XML attributes must be quoted/);
});

test("the user-entry audit rejects non-whitespace text after the root element", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    "${sitemapUrls}\\n</urlset>",
    "${sitemapUrls}\\n</urlset>not-xml",
  ));
  assert.equal(result.status, 1, `audit must reject trailing document text; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stderr, /XML text is not allowed outside sitemap values/);
});

test("the user-entry audit treats sitemap element names as case-sensitive", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    "<url><loc>${escapeXml(`${origin}${route}`)}</loc></url>",
    "<URL><LOC>${escapeXml(`${origin}${route}`)}</LOC></URL>",
  ));
  assert.equal(result.status, 1, `audit must reject uppercase sitemap elements; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stderr, /XML text is not allowed outside sitemap values/);
});

const standardsInvalidSitemapFixtures = [
  {
    name: "duplicate expanded-name attributes",
    mutate: (source) => source.replace(
      "<url><loc>${escapeXml(`${origin}${route}`)}</loc></url>",
      '<url xmlns:a="urn:duplicate" xmlns:b="urn:duplicate" a:value="1" b:value="2"><loc>${escapeXml(`${origin}${route}`)}</loc></url>',
    ),
  },
  {
    name: "a prefix bound to the reserved xmlns namespace",
    mutate: (source) => source.replace(
      "<url><loc>${escapeXml(`${origin}${route}`)}</loc></url>",
      '<url xmlns:bad="http://www.w3.org/2000/xmlns/"><loc>${escapeXml(`${origin}${route}`)}</loc></url>',
    ),
  },
  {
    name: "a non-xml prefix bound to the reserved XML namespace",
    mutate: (source) => source.replace(
      "<url><loc>${escapeXml(`${origin}${route}`)}</loc></url>",
      '<url xmlns:bad="http://www.w3.org/XML/1998/namespace"><loc>${escapeXml(`${origin}${route}`)}</loc></url>',
    ),
  },
  {
    name: "a raw U+0001 control character in the urlset attributes",
    mutate: (source) => source.replace(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" audit="\u0001">',
    ),
  },
  {
    name: "a raw U+0002 control character in a url attribute",
    mutate: (source) => source.replace(
      "<url><loc>${escapeXml(`${origin}${route}`)}</loc></url>",
      '<url audit="\u0002"><loc>${escapeXml(`${origin}${route}`)}</loc></url>',
    ),
  },
];

for (const fixture of standardsInvalidSitemapFixtures) {
  test(`the user-entry audit rejects ${fixture.name}`, () => {
    const result = runUserEntryAuditFixture(fixture.mutate);
    assert.equal(result.status, 1, `standards-invalid sitemap must fail; stdout=${result.stdout}; stderr=${result.stderr}`);
    assert.match(result.stderr, /XML|xml|namespace|attribute|character/);
  });
}

test("the user-entry audit ignores a nested shadow staticRoutes declaration", () => {
  const result = runUserEntryAuditFixture((source) => `${source.replace(
    /^\s*"\/livingsystems\/",\s*$/m,
    '  // "/livingsystems/",',
  )}\nfunction shadowedRouteFixture() { const staticRoutes = ["/livingsystems/"]; return staticRoutes; }\n`);
  assert.equal(result.status, 1, `audit must ignore nested shadow declarations; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /MISSING_SITEMAP_ROUTE:\/livingsystems\//);
});

test("the user-entry audit rejects a required path emitted under a foreign origin", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    '"https://4planet.org"',
    '"https://example.invalid"',
  ));
  assert.equal(result.status, 1, `audit must reject a required path under a foreign origin; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /NON_CANONICAL_SITEMAP_ORIGIN:https:\/\/example\.invalid\/livingsystems\//);
});

test("the user-entry audit rejects a required canonical URL with a query string", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    "`${origin}${route}`",
    "`${origin}${route}?audit=1`",
  ));
  assert.equal(result.status, 1, `audit must reject query-bearing canonical URLs; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /NON_CANONICAL_SITEMAP_URL:https:\/\/4planet\.org\/livingsystems\/\?audit=1/);
});

test("the user-entry audit rejects a required canonical URL with a fragment", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    "`${origin}${route}`",
    "`${origin}${route}#audit`",
  ));
  assert.equal(result.status, 1, `audit must reject fragment-bearing canonical URLs; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /NON_CANONICAL_SITEMAP_URL:https:\/\/4planet\.org\/livingsystems\/#audit/);
});

test("the user-entry audit rejects a required canonical URL with userinfo", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    '"https://4planet.org"',
    '"https://audit@4planet.org"',
  ));
  assert.equal(result.status, 1, `audit must reject userinfo-bearing canonical URLs; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /NON_CANONICAL_SITEMAP_URL:https:\/\/audit@4planet\.org\/livingsystems\//);
});

test("the user-entry audit rejects a raw canonical URL with a dot segment", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    "`${origin}${route}`",
    'route === "/livingsystems/" ? `${origin}/./livingsystems/` : `${origin}${route}`',
  ));
  assert.equal(result.status, 1, `audit must reject raw dot-segment URLs; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /NON_CANONICAL_SITEMAP_URL:https:\/\/4planet\.org\/\.\/livingsystems\//);
});

test("the user-entry audit rejects a raw canonical URL with an encoded dot segment", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    "`${origin}${route}`",
    'route === "/livingsystems/" ? `${origin}/%2e/livingsystems/` : `${origin}${route}`',
  ));
  assert.equal(result.status, 1, `audit must reject raw encoded-dot URLs; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /NON_CANONICAL_SITEMAP_URL:https:\/\/4planet\.org\/%2e\/livingsystems\//i);
});

test("the user-entry audit rejects a raw canonical URL with a parent segment", () => {
  const result = runUserEntryAuditFixture((source) => source.replace(
    "`${origin}${route}`",
    'route === "/livingsystems/" ? `${origin}/species/../livingsystems/` : `${origin}${route}`',
  ));
  assert.equal(result.status, 1, `audit must reject raw parent-segment URLs; stdout=${result.stdout}; stderr=${result.stderr}`);
  assert.match(result.stdout, /NON_CANONICAL_SITEMAP_URL:https:\/\/4planet\.org\/species\/\.\.\/livingsystems\//);
});

test("analytics privacy boundary rejects encoded credentials and unknown properties", () => {
  assert.deepEqual(evaluatePrivacyParameters({
    page_path: "/livingsystems/orca",
    site_host: "www.4planet.org",
    content_group: "living_systems",
    item_count: 2,
  }), {
    page_path: "/livingsystems/orca",
    site_host: "4planet.org",
    content_group: "living_systems",
    item_count: 2,
  });

  assert.deepEqual(evaluatePrivacyParameters({
    actor_type: "PERSON",
    lifecycle_stage: "PROOF",
    evidence_state: "SOURCE_REFERENCED",
    returning: true,
  }), {
    actor_type: "PERSON",
    lifecycle_stage: "PROOF",
    evidence_state: "SOURCE_REFERENCED",
    returning: true,
  });
  assert.deepEqual(evaluatePrivacyParameters({
    actor_type: "ADMIN",
    lifecycle_stage: "PURCHASE",
    evidence_state: "VERIFIED",
    returning: "true",
  }), {});

  for (const page_path of [
    "/reset/alice%40example.com",
    "/%61ccess_token%3Dsecret",
    "/%2561ccess_token%253Dsecret",
    "/%252561ccess_token%25253Dsecret",
    "/reset/alice%252540example.com",
    "/livingsystems/orca%25253Fcode%25253Dsecret",
    "/livingsystems/orca?code=secret",
  ]) {
    assert.equal(evaluatePrivacyParameters({ page_path }).page_path, undefined, page_path);
  }
  assert.deepEqual(evaluatePrivacyParameters({
    free_text: "private answer",
    email: "alice@example.com",
    page_title: "Alice private dashboard",
  }), {});
  assert.match(analytics, /\^\[a-z\]\[a-z0-9_\]\{0,39\}\$/);
  assert.match(analytics, /isInternalAnalyticsBrowser\(\)/);
});

function evaluateAnalyticsDispatch({ ga4Installed, posthogAccepted, sensitiveNavigation = false }) {
  const dispatchSource = analytics.match(/function dispatchAnalyticsEvent\([\s\S]*?\n}\n/);
  assert.ok(dispatchSource, "dispatchAnalyticsEvent must be extractable");
  const js = ts.transpileModule(`${dispatchSource[0]}\nexports.dispatchAnalyticsEvent = dispatchAnalyticsEvent;`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  let ga4Calls = 0;
  let posthogCalls = 0;
  const context = {
    exports: {},
    window: {
      location: { origin: "https://4planet.org", pathname: "/livingsystems/species/orca/" },
      gtag: ga4Installed ? (_command, _event, props) => {
        assert.equal(props?.page_location, "https://4planet.org/livingsystems/species/orca/");
        ga4Calls += 1;
      } : undefined,
    },
    document: { getElementById: () => ga4Installed ? {} : null },
    privacySafeEventParameters: ({ page_path }) => ({ page_path }),
    isSensitiveAnalyticsNavigation: () => sensitiveNavigation,
    capturePostHog: () => { posthogCalls += 1; return posthogAccepted; },
  };
  vm.runInNewContext(js, context);
  const delivered = context.exports.dispatchAnalyticsEvent("value_action", { product_area: "4planet" });
  return { delivered, ga4Calls, posthogCalls };
}

test("delivery acknowledgement reflects actual configured transports", () => {
  assert.deepEqual(evaluateAnalyticsDispatch({ ga4Installed: false, posthogAccepted: false }), {
    delivered: false, ga4Calls: 0, posthogCalls: 1,
  });
  assert.deepEqual(evaluateAnalyticsDispatch({ ga4Installed: true, posthogAccepted: false }), {
    delivered: true, ga4Calls: 1, posthogCalls: 1,
  });
  assert.deepEqual(evaluateAnalyticsDispatch({ ga4Installed: false, posthogAccepted: true }), {
    delivered: true, ga4Calls: 0, posthogCalls: 1,
  });
  assert.deepEqual(evaluateAnalyticsDispatch({ ga4Installed: true, posthogAccepted: true }), {
    delivered: true, ga4Calls: 1, posthogCalls: 1,
  });
  assert.match(routeAnalytics, /if \(entryDelivered\) window\.sessionStorage\.setItem\(routeKey, "1"\)/);
  assert.match(routeAnalytics, /if \(sessionDelivered\) \{/);
  assert.match(routeAnalytics, /const delivered = trackMeaningfulUse/);
  assert.match(routeAnalytics, /if \(!delivered\) return;/);
});

test("sensitive OAuth navigation suppresses GA4 even with consented tag", () => {
  assert.deepEqual(evaluateAnalyticsDispatch({
    ga4Installed: true, posthogAccepted: false, sensitiveNavigation: true,
  }), { delivered: false, ga4Calls: 0, posthogCalls: 1 });
});

test("user proof funnel is broader than page views", () => {
  for (const eventName of requiredEvents) assert.ok(shared.includes(`\"${eventName}\"`), `missing ${eventName}`);
  assert.match(routeAnalytics, /trackProductEntry/);
  assert.match(routeAnalytics, /return_visit/);
  assert.match(routeAnalytics, /20_000|20000/);
});

test("shared analytics contract rejects free-text and precise-location fields by design", () => {
  const combined = `${shared}\n${routeAnalytics}`;
  assert.doesNotMatch(combined, /\b(email|name|query_text|free_text|latitude|longitude|coordinates)\s*:/i);
  assert.match(shared, /safeToken/);
  assert.match(shared, /Never pass names, email addresses,\s*\n \* free-text queries, exact coordinates/);
});

test("GA4 remains gated by explicit consent and a real measurement id", () => {
  assert.match(analytics, /VITE_GA_MEASUREMENT_ID/);
  assert.match(analytics, /G-Q79Y9HJRL8/);
  assert.match(analytics, /readConsent\(\) !== \"granted\"/);
  assert.match(analytics, /allow_google_signals: false/);
  assert.match(analytics, /allow_ad_personalization_signals: false/);
});

test("analytics page telemetry strips query strings and fragments", () => {
  assert.doesNotMatch(analytics, /page_location:\s*window\.location\.href/);
  assert.doesNotMatch(analytics, /page_path:\s*`\$\{location\.pathname\}\$\{location\.search\}`/);
  assert.match(analytics, /const safeConfig = privacySafeEventParameters\(\{ page_path: window\.location\.pathname \}\)/);
  assert.match(analytics, /page_location:\s*`\$\{window\.location\.origin\}\$\{safePath\}`/);
  assert.match(analytics, /const sharedPageProperties = privacySafeEventParameters\(\{/);
  assert.match(analytics, /page_path:\s*location\.pathname/);
  assert.match(analytics, /window\.gtag\?\.\("event", "page_view", \{/);
  assert.ok(analytics.includes("page_location: `${window.location.origin}${sharedPageProperties.page_path}`"));
  assert.match(analytics, /window\.gtag\?\.\("event", name, \{/);
});

test("PostHog reuses the same consented event spine and fails closed without configuration", () => {
  assert.match(analytics, /capturePostHog\(name, properties\)/);
  assert.match(analytics, /capturePostHog\(\"\$pageview\", sharedPageProperties\)/);
  assert.match(posthog, /VITE_POSTHOG_PROJECT_KEY/);
  assert.match(posthog, /VITE_POSTHOG_HOST/);
  assert.match(posthog, /if \(!apiKey/);
  assert.match(posthog, /\$process_person_profile: false/);
  assert.match(posthog, /\/i\/v0\/e\//);
  assert.doesNotMatch(posthog, /phc_[A-Za-z0-9]+/);
});

test("analytics is fail-closed to the approved production product-domain set", () => {
  for (const host of requiredAnalyticsHosts) assert.ok(analytics.includes(`\"${host}\"`), `analytics host missing: ${host}`);
  assert.match(analytics, /\.pages\.dev/);
  assert.match(analytics, /\.workers\.dev/);
  assert.match(analytics, /test\.4planet\.org/);
  assert.match(analytics, /localhost/);
  assert.match(analytics, /isAnalyticsHostAllowed/);
});

test("product attribution covers person, company, commerce and creator surfaces", () => {
  for (const token of ["4sapien", "s4piens", "4brands", "market", "creator"]) {
    assert.ok(shared.includes(`"${token}"`), `ProductArea missing: ${token}`);
    assert.ok(routeAnalytics.includes(`"${token}"`), `route classifier missing: ${token}`);
    assert.ok(analytics.includes(`"${token}"`), `page classifier missing: ${token}`);
  }
});

test("canonical discovery routes remain generated and crawlable", () => {
  for (const route of requiredRoutes) assert.ok(sitemap.includes(JSON.stringify(route)), `sitemap missing ${route}`);
  assert.doesNotMatch(sitemap, /"\/journey\/(?:jaguar|orca)\/"/, "journey sitemap paths must match their no-trailing-slash runtime canonicals");
  assert.match(robots, /User-agent:\s*\*/i);
  assert.match(robots, /Allow:\s*\//i);
  assert.match(robots, /Sitemap:\s*https:\/\/4planet\.org\/sitemap\.xml/i);
});

test("4SAPIEN and 4BRANDS value actions are measurable without sending user/company free text", () => {
  assert.match(sapien, /trackEvent\("activation"/);
  assert.match(sapien, /activation_kind: "shopping_list_analysis"/);
  assert.match(sapien, /activation_kind: "ask_embla"/);
  assert.match(sapien, /trackEvent\("decision_saved"/);
  assert.doesNotMatch(sapien, /trackEvent\([^\n]*prompt/);
  assert.doesNotMatch(sapien, /trackEvent\([^\n]*shoppingList/);

  assert.match(fourbrands, /trackEvent\("company_analysis"/);
  assert.match(fourbrands, /analysis_status:/);
  assert.match(fourbrands, /source_count:/);
  assert.match(fourbrands, /opportunity_count:/);
  assert.match(fourbrands, /trackEvent\("company_twin_saved"/);
  assert.doesNotMatch(fourbrands, /trackEvent\([^\n]*company,/);
});

test("4MARKET HEIR exposes the five verified live Fourthwall products without claiming purchase", () => {
  for (const slug of [
    "summit-at-sunset-fine-art-print",
    "northern-harbour-fine-art-print",
    "purple-shore-fine-art-print",
    "bergen-reflections-fine-art-print",
    "bergen-blue-hour-fine-art-print",
  ]) assert.ok(market.includes(slug), `missing live product ${slug}`);
  assert.match(market, /market_product_open/);
  for (const token of [
    "utm_source=4planetmarket",
    "utm_medium=market",
    "utm_campaign=first_creator_proof",
    "utm_content=",
  ]) assert.ok(market.includes(token), `Fourthwall attribution missing: ${token}`);
  assert.match(market, /target="_blank"/);
  assert.match(market, /rel="noopener noreferrer"/);
  assert.match(market, /VERIFIED 27 SEP 2026/);
  assert.match(market, /Product availability, price and fulfilment are owned by the live Fourthwall offer/);
  assert.match(market, /completed Fourthwall sales can be reconciled by source/);
  assert.match(market, /still does not treat a click as a purchase or delivery record/);
});

test("flagship journey entries physically exist and retain a return path", () => {
  const entries = [
    ["public/journey/jaguar/index.html", ["/species/jaguar", "/species", "/"]],
    ["public/journey/orca/index.html", ["/species/orca", "/species", "/"]],
  ];
  for (const [path, returnNeedles] of entries) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `missing ${path}`);
    const html = read(path);
    assert.match(html, /<title>[^<]+<\/title>/i, `${path} missing title`);
    assert.ok(returnNeedles.some((needle) => html.includes(`href=\"${needle}`) || html.includes(`href='${needle}`)), `${path} has no return path`);
  }
});

test("flagship journey source HTML carries complete unique search and share metadata", () => {
  const entries = [
    {
      path: "public/journey/jaguar/index.html",
      canonical: "https://4planet.org/journey/jaguar",
      subject: "jaguar",
    },
    {
      path: "public/journey/orca/index.html",
      canonical: "https://4planet.org/journey/orca",
      subject: "orca",
    },
  ];

  const descriptions = [];
  for (const { path, canonical, subject } of entries) {
    const html = read(path);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"\s*\/>/i)?.[1];
    descriptions.push(description);

    assert.ok(title, `${path} missing title`);
    assert.match(description ?? "", new RegExp(subject, "i"), `${path} description must identify its journey`);
    assert.match(html, new RegExp(`<link\\s+rel="canonical"\\s+href="${canonical}"\\s*\\/>`, "i"));
    assert.match(html, new RegExp(`<meta\\s+property="og:title"\\s+content="${title.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}"\\s*\\/>`, "i"));
    assert.match(html, new RegExp(`<meta\\s+property="og:description"\\s+content="${description?.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}"\\s*\\/>`, "i"));
    assert.match(html, new RegExp(`<meta\\s+property="og:url"\\s+content="${canonical}"\\s*\\/>`, "i"));
  }
  assert.notEqual(descriptions[0], descriptions[1], "journey descriptions must stay unique");
});


test("convergence funnel exposes the required privacy-safe value events", () => {
  for (const token of ["signup_started", "signup_completed", "login"]) assert.ok(identity.includes(token), `identity event missing ${token}`);
  for (const token of ["value_action", "memory_written", "return_value", "value_reached"]) assert.ok(pantry.includes(token), `4SAPIEN event missing ${token}`);
  for (const token of ["company_claim_started", "company_brain_created", "value_action"]) assert.ok(companyBrain.includes(token), `4BRANDS event missing ${token}`);
  for (const token of ["species_opened", "source_opened", "cross_product_navigation"]) assert.ok(species.includes(token), `SPECIES event missing ${token}`);
  assert.match(atlas, /atlas_object_opened/);
  assert.doesNotMatch(atlas, /trackEvent\([^\n]*(lat|lng|latitude|longitude|coordinates)/i);
});

test("priority product hosts are first-class analytics surfaces", () => {
  for (const host of ["id.4planet.org", "4sapien.com", "4planetatlas.com", "4species.com", "4brands.org", "4brain.app"]) {
    assert.ok(analytics.includes(`"${host}"`), `priority analytics host missing: ${host}`);
  }
  assert.match(analytics, /host === "4sapien\.com"/);
  assert.match(analytics, /host === "4planetatlas\.com"/);
});

test("discovery attribution records only bounded channel labels, never raw referrer or query payloads", () => {
  assert.match(analytics, /discovery_entry/);
  assert.match(analytics, /AI_CHATGPT/);
  assert.match(analytics, /SEARCH_GOOGLE/);
  assert.match(analytics, /SOCIAL_INSTAGRAM/);
  assert.match(analytics, /new URLSearchParams\(window\.location\.search\)\.get\("utm_source"\)/);
  assert.match(analytics, /safeHostname\(document\.referrer\)/);
  assert.doesNotMatch(analytics, /discovery_(entry|channel)[\s\S]{0,500}document\.referrer/);
  assert.doesNotMatch(analytics, /discovery_(entry|channel)[\s\S]{0,500}window\.location\.search/);
});


test("OAuth credential-bearing URLs never start measurement", () => {
  assert.match(analytics, /export function isSensitiveAnalyticsNavigation\(\): boolean/);
  assert.match(analytics, /isSensitiveAnalyticsNavigation\(\) \|\| document\.getElementById/);
  assert.match(analytics, /consent !== "granted" \|\| isSensitiveAnalyticsNavigation\(\)/);
  assert.match(analytics, /readConsent\(\) !== "granted"[\s\S]{0,300}isSensitiveAnalyticsNavigation\(\)/);
  assert.match(analytics, /const safeConfig = privacySafeEventParameters\(\{ page_path: window\.location\.pathname \}\)/);
  assert.match(analytics, /page_location:.*window\.location\.origin.*safePath/);
  const decodeSource = analytics.match(/function decodeForAnalyticsInspection\([\s\S]*?\n}\n/)?.[0];
  const nestedSource = analytics.match(/function hasUnsupportedNestedAnalyticsEncoding\([\s\S]*?\n}\n/)?.[0];
  const sensitiveSource = analytics.match(/function containsSensitiveAnalyticsMaterial\([\s\S]*?\n}\n/)?.[0];
  const navigationSource = analytics.match(/export function isSensitiveAnalyticsNavigation\(\): boolean \{[\s\S]*?\n\}/)?.[0];
  assert.ok(decodeSource && nestedSource && sensitiveSource && navigationSource, "missing encoded OAuth navigation guard");
  const js = ts.transpileModule(`${decodeSource}\n${nestedSource}\n${sensitiveSource}\n${navigationSource}`, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS
  }}).outputText;
  const check = (url) => {
    const context = { exports: {}, window: { location: new URL(url) }, decodeURIComponent };
    vm.runInNewContext(js, context);
    return context.exports.isSensitiveAnalyticsNavigation();
  };
  for (const url of [
    "https://id.4planet.org/login#access_token=TEST",
    "https://id.4planet.org/login?auth_return=google",
    "https://4planet.org/auth/4planet/callback#token_hash=TEST",
    "https://id.4planet.org/oauth/consent?authorization_id=TEST",
    "https://4planet.org/?code=TEST",
    "https://4planet.org/?state=TEST",
    "https://4planet.org/#refresh_token=TEST",
    "https://4planet.org/%61uth/callback",
    "https://4planet.org/livingsystems?%61ccess_token=TEST",
    "https://4planet.org/livingsystems#%2561ccess_token%253DTEST",
    "https://4planet.org/%252561uth%25252Fcallback",
    "https://4planet.org/livingsystems?%252561ccess_token%25253DTEST",
    "https://4planet.org/livingsystems#%252561ccess_token%25253DTEST"
  ]) assert.equal(check(url), true);
  for (const url of [
    "https://4planet.org/oslofjord",
    "https://4planet.org/atlas?utm_source=chatgpt.com",
    "https://4planetmagazine.com/magazine"
  ]) assert.equal(check(url), false);
});
test("GA4 admin push never silently modifies the property", () => {
  const yaml = read(".github/workflows/ga4-admin-control.yml");
  assert.match(yaml, /default: audit/);
  assert.match(yaml, /inputs\.mode == 'apply' && inputs\.founder_release == 'enig send'/);
  assert.match(yaml, /Reject unapproved GA4 configuration writes/);
  assert.doesNotMatch(yaml, /inputs\.mode == 'audit' && 'false' \|\| 'true'/);
});


test("measurement integrity isolates internal traffic and expands discovery attribution", () => {
  assert.match(analytics, /INTERNAL_ANALYTICS_STORAGE_KEY/);
  assert.match(analytics, /4p_internal/);
  assert.match(analytics, /ignore_referrer:/);
  assert.match(analytics, /INTERNAL_4PLANET/);
  assert.match(analytics, /AUTH_OR_INFRA/);
  assert.match(analytics, /SEARCH_ECOSIA/);
  assert.match(analytics, /SEARCH_DUCKDUCKGO/);
  assert.match(analytics, /AI_CLAUDE/);
  assert.match(analytics, /AI_GEMINI/);
  assert.match(analytics, /AI_COPILOT/);
  assert.match(routeAnalytics, /isInternalOrInfrastructureReferrer/);
});

test("public URLs cannot persist or clear internal-traffic classification", () => {
  const start = analytics.indexOf("function applyInternalAnalyticsControl(): boolean {");
  const end = analytics.indexOf("\n}\n\nfunction isInternalAnalyticsBrowser", start);
  assert.ok(start >= 0 && end > start, "missing internal analytics control");
  const source = `const INTERNAL_ANALYTICS_STORAGE_KEY = "4planet.analytics.internal.v1";
const INTERNAL_ANALYTICS_QUERY_KEY = "4p_internal";
${analytics.slice(start, end + 2)}
exports.applyInternalAnalyticsControl = applyInternalAnalyticsControl;`;
  const js = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS
  }}).outputText;

  const check = (url, provisioned) => {
    let marker = provisioned ? "1" : null;
    let replacement = null;
    const context = {
      exports: {},
      URLSearchParams,
      window: {
        location: new URL(url),
        localStorage: {
          getItem: () => marker,
          setItem: () => assert.fail("public URL must not provision internal traffic"),
          removeItem: () => assert.fail("public URL must not clear internal traffic"),
        },
        history: {
          state: null,
          replaceState: (_state, _title, nextUrl) => { replacement = nextUrl; },
        },
      },
    };
    vm.runInNewContext(js, context);
    return {
      internal: context.exports.applyInternalAnalyticsControl(),
      replacement,
      marker,
    };
  };

  assert.deepEqual(
    check("https://4planet.org/?4p_internal=1&utm_source=external", false),
    { internal: false, replacement: "/?utm_source=external", marker: null },
  );
  assert.deepEqual(
    check("https://4planet.org/?4p_internal=0&utm_source=external", true),
    { internal: true, replacement: "/?utm_source=external", marker: "1" },
  );
});

test("Search Console first-party probe is read-only, existing-identity scoped and fails closed", () => {
  const python = read("scripts/ga4-admin-control.py");
  const workflow = read(".github/workflows/ga4-admin-control.yml");
  assert.match(python, /def audit_search_console_readonly\(info\):/);
  assert.match(python, /https:\/\/www\.googleapis\.com\/auth\/webmasters\.readonly/);
  assert.match(python, /reader\.get\(/);
  assert.match(python, /https:\/\/www\.googleapis\.com\/webmasters\/v3\/sites/);
  assert.match(python, /GSC_READONLY_STATUS=UNAVAILABLE_HTTP_/);
  assert.doesNotMatch(python, /reader\.(put|post|patch|delete)\(/);
  assert.match(workflow, /python -m py_compile scripts\/ga4-admin-control\.py/);
  assert.match(workflow, /GSC properties visible to existing service identity/);
});
