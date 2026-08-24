import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const sitemap = read("scripts/generate-sitemap.mjs");
const robots = read("public/robots.txt");
const analytics = read("src/analytics/ProductAnalytics.ts");
const routeAnalytics = read("src/analytics/ProductRouteAnalytics.tsx");

const routes = ["/", "/atlas", "/species", "/living-systems", "/impact", "/missions", "/magazine", "/join", "/journey/jaguar/", "/journey/orca/"];
const journeys = [
  ["public/journey/jaguar/index.html", ["/species/jaguar", "/species", "/"]],
  ["public/journey/orca/index.html", ["/species/orca", "/species", "/"]],
];

test("canonical discovery routes remain in sitemap generation", () => {
  for (const route of routes) assert.ok(sitemap.includes(JSON.stringify(route)), `sitemap missing ${route}`);
});

test("robots permits crawl and declares canonical sitemap", () => {
  assert.match(robots, /User-agent:\s*\*/i);
  assert.match(robots, /Allow:\s*\//i);
  assert.match(robots, /Sitemap:\s*https:\/\/4planet\.org\/sitemap\.xml/i);
});

test("flagship standalone journeys are real entries with return paths", () => {
  for (const [path, returnNeedles] of journeys) {
    assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `missing ${path}`);
    const html = read(path);
    assert.match(html, /<title>[^<]+<\/title>/i, `${path} missing title`);
    assert.ok(returnNeedles.some((needle) => html.includes(`href=\"${needle}`) || html.includes(`href='${needle}`)), `${path} has no return path`);
  }
});

test("user proof distinguishes entry, meaningful use, completion and return", () => {
  for (const eventName of ["product_entry", "meaningful_use", "product_completion", "deeper_exploration", "share_referral", "join_interest"]) {
    assert.ok(analytics.includes(`\"${eventName}\"`), `analytics missing ${eventName}`);
  }
  assert.match(routeAnalytics, /trackProductEntry/);
  assert.match(routeAnalytics, /return_visit/);
  assert.match(routeAnalytics, /20_000|20000/);
});

test("discovery instrumentation does not collect obvious free-text or precise-location fields", () => {
  const combined = `${analytics}\n${routeAnalytics}`;
  assert.doesNotMatch(combined, /\b(query_text|free_text|latitude|longitude|coordinates|email_address)\s*:/i);
});
