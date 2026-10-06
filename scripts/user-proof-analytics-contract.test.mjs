import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

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
  "/journey/jaguar/",
  "/journey/orca/",
];

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
  assert.match(analytics, /safePageLocation = `\$\{window\.location\.origin\}\$\{location\.pathname\}`/);
  assert.match(analytics, /page_location:\s*safePageLocation/);
  assert.match(analytics, /page_path:\s*location\.pathname/);
});

test("PostHog reuses the same consented event spine and fails closed without configuration", () => {
  assert.match(analytics, /capturePostHog\(name, shared\)/);
  assert.match(analytics, /capturePostHog\(\"\$pageview\", pageProperties\)/);
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
