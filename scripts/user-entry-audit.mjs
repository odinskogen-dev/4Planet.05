import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));

const requiredDiscoveryRoutes = [
  "/",
  "/atlas",
  "/species",
  "/living-systems",
  "/impact",
  "/missions",
  "/magazine",
  "/journey/jaguar/",
  "/journey/orca/",
  "/join",
];

const journeyEntries = [
  { route: "/journey/jaguar/", file: "public/journey/jaguar/index.html", returnNeedles: ["/species/jaguar", "/species"] },
  { route: "/journey/orca/", file: "public/journey/orca/index.html", returnNeedles: ["/species/orca", "/species"] },
];

const sitemapGenerator = read("scripts/generate-sitemap.mjs");
const robots = exists("public/robots.txt") ? read("public/robots.txt") : "";
const analytics = exists("src/analytics/ProductAnalytics.ts") ? read("src/analytics/ProductAnalytics.ts") : "";
const routeAnalytics = exists("src/analytics/ProductRouteAnalytics.tsx") ? read("src/analytics/ProductRouteAnalytics.tsx") : "";

const routeCoverage = requiredDiscoveryRoutes.map((route) => ({
  route,
  declaredInSitemapGenerator: sitemapGenerator.includes(JSON.stringify(route)),
}));

const journeys = journeyEntries.map((entry) => {
  const present = exists(entry.file);
  const html = present ? read(entry.file) : "";
  return {
    route: entry.route,
    physicalEntryPresent: present,
    titlePresent: /<title>[^<]+<\/title>/i.test(html),
    descriptionPresent: /<meta\s+name=["']description["']/i.test(html),
    canonicalPresent: /<link\s+rel=["']canonical["']/i.test(html),
    openGraphPresent: /property=["']og:(title|description|url|image)["']/i.test(html),
    returnPathPresent: entry.returnNeedles.some((needle) => html.includes(`href=\"${needle}`) || html.includes(`href='${needle}`)),
  };
});

const analyticsContract = {
  productEntry: analytics.includes('trackEvent("product_entry"'),
  meaningfulUse: analytics.includes('trackEvent("meaningful_use"'),
  completion: analytics.includes('trackEvent("product_completion"'),
  deeperExploration: analytics.includes('trackEvent("deeper_exploration"'),
  shareReferral: analytics.includes('trackEvent("share_referral"'),
  joinInterest: analytics.includes('trackEvent("join_interest"'),
  routeEntryRuntime: routeAnalytics.includes("trackProductEntry"),
  returnVisitRuntime: routeAnalytics.includes("return_visit"),
};

const hardFailures = [
  ...routeCoverage.filter((row) => !row.declaredInSitemapGenerator).map((row) => `MISSING_SITEMAP_ROUTE:${row.route}`),
  ...journeys.filter((row) => !row.physicalEntryPresent).map((row) => `MISSING_ENTRY:${row.route}`),
  ...journeys.filter((row) => !row.returnPathPresent).map((row) => `DEAD_END:${row.route}`),
  ...Object.entries(analyticsContract).filter(([, ok]) => !ok).map(([key]) => `ANALYTICS_GAP:${key}`),
];

const improvementQueue = journeys.flatMap((row) => [
  !row.descriptionPresent ? `${row.route}:meta-description` : null,
  !row.canonicalPresent ? `${row.route}:canonical` : null,
  !row.openGraphPresent ? `${row.route}:open-graph` : null,
].filter(Boolean));

const report = {
  generatedAt: new Date().toISOString(),
  status: hardFailures.length ? "FAIL" : "PASS_WITH_IMPROVEMENTS",
  routeCoverage,
  journeys,
  analyticsContract,
  hardFailures,
  improvementQueue,
  truthBoundary: "Discovery readiness and instrumentation presence do not prove indexing, traffic, users, completion, return or referral.",
};

console.log(JSON.stringify(report, null, 2));
if (hardFailures.length) process.exitCode = 1;
