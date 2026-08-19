import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const analytics = fs.readFileSync("src/analytics/analytics.ts", "utf8");
const consent = fs.readFileSync("src/analytics/AnalyticsConsent.tsx", "utf8");
const provider = fs.readFileSync("src/analytics/AnalyticsProvider.tsx", "utf8");
const app = fs.readFileSync("src/App.tsx", "utf8");

test("GA4 is consent-gated and advertising signals stay disabled", () => {
  assert.match(analytics, /getAnalyticsConsent\(\) !== "granted"/);
  assert.match(analytics, /analytics_storage: "denied"/);
  assert.match(analytics, /ad_storage: "denied"/);
  assert.match(analytics, /ad_user_data: "denied"/);
  assert.match(analytics, /ad_personalization: "denied"/);
  assert.match(analytics, /allow_google_signals: false/);
  assert.match(analytics, /allow_ad_personalization_signals: false/);
  assert.match(analytics, /send_page_view: false/);
});

test("analytics remains dormant when GA4 is not configured", () => {
  assert.match(analytics, /VITE_GA4_MEASUREMENT_ID/);
  assert.match(consent, /!isGa4Configured\(\)/);
});

test("app tracks SPA routes and supports explicit custom interaction events", () => {
  assert.match(provider, /location\.pathname/);
  assert.match(provider, /trackPageView/);
  assert.match(provider, /trackSurfaceView/);
  assert.match(provider, /data-analytics-event/);
  assert.match(provider, /outbound_click/);
  assert.match(app, /<AnalyticsProvider \/>/);
  assert.match(app, /<AnalyticsConsent \/>/);
});
