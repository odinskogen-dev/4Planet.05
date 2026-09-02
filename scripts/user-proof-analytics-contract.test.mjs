import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const shared = read("src/analytics/ProductAnalytics.ts");
const analytics = read("src/analytics/Analytics.tsx");
const routeAnalytics = read("src/analytics/ProductRouteAnalytics.tsx");
const sitemap = read("scripts/generate-sitemap.mjs");
const robots = read("public/robots.txt");
const redirects = read("public/_redirects");
const headers = read("public/_headers");
const publicCoreMatrixPath = "docs/control/PUBLIC_CORE_01_LIVE_MATRIX.md";
const publicCoreScoped = existsSync(new URL(`../${publicCoreMatrixPath}`, import.meta.url));

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
  "4planetmagazine.com",
  "s4piens.com",
  "4species.com",
  "cre4tors.com",
  "4planetmarket.com",
];

const requiredRoutes = [
  "/",
  "/atlas",
  "/species",
  "/living-systems",
  "/impact",
  "/missions",
  "/magazine",
  "/join",
  "/journey/jaguar/",
];

const legacyFlagshipRoutes = ["/journey/orca/"];

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

test("analytics is fail-closed to the approved live-domain set", () => {
  for (const host of requiredAnalyticsHosts) assert.ok(analytics.includes(`\"${host}\"`), `analytics host missing: ${host}`);
  assert.match(analytics, /\.pages\.dev/);
  assert.match(analytics, /localhost/);
  assert.match(analytics, /isAnalyticsHostAllowed/);
});

test("canonical PUBLIC CORE discovery remains generated, crawlable and excludes held flagship routes", () => {
  for (const route of requiredRoutes) assert.ok(sitemap.includes(JSON.stringify(route)), `sitemap missing ${route}`);

  if (publicCoreScoped) {
    for (const route of legacyFlagshipRoutes) assert.ok(!sitemap.includes(JSON.stringify(route)), `held route must not be discoverable: ${route}`);
    assert.match(redirects, /^\/journey\/orca(?:\/\*)?\s+\/species\/orca\s+302$/m, "held ORCA journey must fail closed at the release edge");
    assert.match(headers, /\/journey\/orca\/\*\n\s+X-Robots-Tag: noindex, nofollow, noarchive/, "held ORCA journey must be noindex/nofollow");
  } else {
    for (const route of legacyFlagshipRoutes) assert.ok(sitemap.includes(JSON.stringify(route)), `sitemap missing ${route}`);
  }

  assert.match(robots, /User-agent:\s*\*/i);
  assert.match(robots, /Allow:\s*\//i);
  assert.match(robots, /Sitemap:\s*https:\/\/4planet\.org\/sitemap\.xml/i);
});

test("flagship journey entries physically exist and retain a return path even when a release holds one from public discovery", () => {
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
