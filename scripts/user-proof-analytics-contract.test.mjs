import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shared = readFileSync(new URL("../src/analytics/ProductAnalytics.ts", import.meta.url), "utf8");
const analytics = readFileSync(new URL("../src/analytics/Analytics.tsx", import.meta.url), "utf8");

const requiredEvents = [
  "product_entry",
  "meaningful_use",
  "product_completion",
  "deeper_exploration",
  "share_referral",
  "join_interest",
];

test("user proof funnel is broader than page views", () => {
  for (const eventName of requiredEvents) assert.ok(shared.includes(`\"${eventName}\"`), `missing ${eventName}`);
});

test("shared analytics contract rejects free-text and precise-location fields by design", () => {
  assert.doesNotMatch(shared, /\b(email|name|query_text|free_text|latitude|longitude|coordinates)\s*:/i);
  assert.match(shared, /safeToken/);
  assert.match(shared, /Never pass names, email addresses,\s*\n \* free-text queries, exact coordinates/);
});

test("GA4 remains gated by explicit consent and a real measurement id", () => {
  assert.match(analytics, /VITE_GA_MEASUREMENT_ID/);
  assert.match(analytics, /readConsent\(\) !== \"granted\"/);
  assert.match(analytics, /allow_google_signals: false/);
  assert.match(analytics, /allow_ad_personalization_signals: false/);
});
