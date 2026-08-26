import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const shared = read("src/analytics/ProductAnalytics.ts");
const analytics = read("src/analytics/Analytics.tsx");
const routeAnalytics = read("src/analytics/ProductRouteAnalytics.tsx");
const foodChoiceProof = read("src/food/PickAlternatives.tsx");
const foodProductProof = read("src/food/PickPrototype.tsx");
const companyProof = read("src/content/companyProof.ts");
const companyProofPage = read("src/pages/sapiens/CompanyProof.tsx");
const router = read("src/routes/router.tsx");
const sitemap = read("scripts/generate-sitemap.mjs");
const robots = read("public/robots.txt");

const requiredEvents = [
  "product_entry",
  "meaningful_use",
  "product_completion",
  "deeper_exploration",
  "share_referral",
  "join_interest",
  "choice_started",
  "choice_result",
  "choice_feedback",
  "payment_signal",
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
  "/journey/orca/",
];

test("user proof funnel is broader than page views", () => {
  for (const eventName of requiredEvents) assert.ok(shared.includes(`\"${eventName}\"`), `missing ${eventName}`);
  assert.match(routeAnalytics, /trackProductEntry/);
  assert.match(routeAnalytics, /return_visit/);
  assert.match(routeAnalytics, /20_000|20000/);
});

test("4SAPIEN is measured as its own repeat-utility surface", () => {
  assert.match(shared, /\"4sapien\"/);
  assert.match(routeAnalytics, /pathname\.startsWith\(\"\/4sapien\"\)/);
  assert.match(routeAnalytics, /trackChoiceStarted/);
  assert.match(routeAnalytics, /choice_food|choice_\$\{domain\}/);
});

test("FOOD closes the bounded utility proof without inventing a recommendation", () => {
  assert.match(foodChoiceProof, /trackChoiceResult\(\"food\"/);
  assert.match(foodChoiceProof, /\"recommendation\"/);
  assert.match(foodChoiceProof, /\"withheld\"/);
  assert.match(foodChoiceProof, /\"insufficient_evidence\"/);
  assert.match(foodChoiceProof, /trackChoiceFeedback\(\"food\"/);
  assert.match(foodChoiceProof, /\"helpful\"/);
  assert.match(foodChoiceProof, /\"not_helpful\"/);
  assert.match(foodChoiceProof, /No payment occurs/);
  assert.match(foodChoiceProof, /not proven willingness to pay/);
  assert.match(shared, /\"consumer_interest\"/);
});

test("Company Proof reuses a product-to-company projection without minting fake Actor identity", () => {
  for (const company of ["TINE SA", "Oatly Group AB", "Orkla ASA", "Mowi ASA", "Yara International ASA"]) assert.ok(companyProof.includes(company), `missing company proof: ${company}`);
  assert.match(companyProof, /Company remains an Actor/);
  assert.match(companyProof, /ACTOR_ID_UNRESOLVED/);
  assert.match(companyProof, /7038010055652/);
  assert.match(companyProof, /marketIncentiveState:\s*\"HYPOTHESIS_ONLY\"/);
  assert.match(companyProof, /outcomeState:\s*\"UNKNOWN\"/);
  assert.match(companyProof, /must never be represented as caused by 4SAPIEN demand signals/);
  assert.match(foodProductProof, /companyProofForProduct/);
  assert.match(foodProductProof, /OPEN S4PIENS COMPANY PROOF/);
  assert.match(companyProofPage, /Company intelligence/);
  assert.match(companyProofPage, /Payment, partnership, advertising or sponsorship cannot change evidence state, ranking or recommendation eligibility/);
  assert.match(router, /\/domains\/s4piens\/company-proof/);
});

test("AI-premium choice events stay categorical and privacy-safe", () => {
  assert.match(shared, /ChoiceDomain/);
  assert.match(shared, /ChoiceResult/);
  assert.match(shared, /ChoiceFeedback/);
  assert.match(shared, /PaymentSignal/);
  const choiceAnalytics = `${shared}\n${foodChoiceProof}`;
  assert.doesNotMatch(choiceAnalytics, /barcode\s*:|registration(?:Number|_number)?\s*:|address\s*:|health(?:Context|_context)?\s*:|prompt\s*:/i);
});

test("shared analytics contract rejects free-text and precise-location fields by design", () => {
  const combined = `${shared}\n${routeAnalytics}\n${foodChoiceProof}`;
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

test("canonical discovery routes remain generated and crawlable", () => {
  for (const route of requiredRoutes) assert.ok(sitemap.includes(JSON.stringify(route)), `sitemap missing ${route}`);
  assert.match(robots, /User-agent:\s*\*/i);
  assert.match(robots, /Allow:\s*\//i);
  assert.match(robots, /Sitemap:\s*https:\/\/4planet\.org\/sitemap\.xml/i);
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