import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { SaxesParser } from "saxes";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));
const canonicalSiteOrigin = "https://4planet.org";

const requiredDiscoveryRoutes = [
  "/",
  "/atlas",
  "/species",
  "/livingsystems/",
  "/impact",
  "/missions",
  "/magazine",
  "/journey/jaguar",
  "/journey/orca",
  "/join",
];

const journeyEntries = [
  { route: "/journey/jaguar", file: "public/journey/jaguar/index.html", returnNeedles: ["/species/jaguar", "/species", "/"] },
  { route: "/journey/orca", file: "public/journey/orca/index.html", returnNeedles: ["/species/orca", "/species", "/"] },
];

const analytics = exists("src/analytics/ProductAnalytics.ts") ? read("src/analytics/ProductAnalytics.ts") : "";
const routeAnalytics = exists("src/analytics/ProductRouteAnalytics.tsx") ? read("src/analytics/ProductRouteAnalytics.tsx") : "";
const sitemapNamespace = "http://www.sitemaps.org/schemas/sitemap/0.9";

function sitemapLocationTexts(xml) {
  const locations = [];
  const stack = [];
  let locationText = null;
  let sitemapValueText = null;
  let currentUrlLocCount = null;
  let rootSeen = false;
  const optionalUrlValues = new Set(["lastmod", "changefreq", "priority"]);
  const parser = new SaxesParser({
    xmlns: true,
    defaultXMLVersion: "1.0",
    forceXMLVersion: true,
  });
  const appendText = (text) => {
    if (locationText !== null) locationText += text;
    else if (sitemapValueText !== null) sitemapValueText += text;
    else if (text.trim()) throw new Error("XML text is not allowed outside sitemap values");
  };

  parser.on("text", appendText);
  parser.on("cdata", appendText);
  parser.on("doctype", () => {
    throw new Error("Unsupported XML declaration in sitemap");
  });
  parser.on("opentag", (tag) => {
    if (locationText !== null || sitemapValueText !== null) {
      throw new Error("Sitemap values must contain text only");
    }
    stack.push(tag);
    if (stack.length === 1) {
      if (tag.local !== "urlset" || tag.uri !== sitemapNamespace || rootSeen) {
        throw new Error("Sitemap must contain one namespaced <urlset> root");
      }
      rootSeen = true;
    } else if (stack.length === 2) {
      if (tag.uri === sitemapNamespace && tag.local !== "url") {
        throw new Error(`Unexpected sitemap element: <${tag.local}>`);
      }
      if (tag.uri === sitemapNamespace) currentUrlLocCount = 0;
    } else if (stack.length === 3
      && stack[1].local === "url"
      && stack[1].uri === sitemapNamespace) {
      if (tag.uri === sitemapNamespace && tag.local === "loc") {
        currentUrlLocCount += 1;
        if (currentUrlLocCount > 1) {
          throw new Error("Each sitemap <url> must contain exactly one non-empty <loc>");
        }
        locationText = "";
      } else if (tag.uri === sitemapNamespace && optionalUrlValues.has(tag.local)) {
        sitemapValueText = "";
      } else if (tag.uri === sitemapNamespace) {
        throw new Error(`Unexpected sitemap element: <${tag.local}>`);
      }
    } else if (tag.uri === sitemapNamespace) {
      throw new Error(`Unexpected sitemap element: <${tag.local}>`);
    }
  });
  parser.on("closetag", (tag) => {
    if (tag.local === "loc" && tag.uri === sitemapNamespace && locationText !== null) {
      const location = locationText.trim();
      if (!location) {
        throw new Error("Each sitemap <url> must contain exactly one non-empty <loc>");
      }
      locations.push(location);
      locationText = null;
    } else if (tag.uri === sitemapNamespace
      && optionalUrlValues.has(tag.local)
      && sitemapValueText !== null) {
      sitemapValueText = null;
    } else if (tag.local === "url"
      && tag.uri === sitemapNamespace
      && stack.length === 2) {
      if (currentUrlLocCount !== 1) {
        throw new Error("Each sitemap <url> must contain exactly one non-empty <loc>");
      }
      currentUrlLocCount = null;
    }
    stack.pop();
  });

  try {
    parser.write(xml).close();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const unboundPrefix = message.match(/unbound namespace prefix:\s*"([^"]+)"/i);
    if (unboundPrefix) throw new Error(`Unbound XML namespace prefix: ${unboundPrefix[1]}`);
    if (/unquoted attribute value/i.test(message)) throw new Error("XML attributes must be quoted");
    if (/text data outside of root node/i.test(message)) {
      throw new Error("XML text is not allowed outside sitemap values");
    }
    throw new Error(`Invalid sitemap XML: ${message}`);
  }

  if (!rootSeen || stack.length > 0 || locationText !== null || sitemapValueText !== null) {
    throw new Error("Incomplete sitemap XML structure");
  }
  return locations;
}

function emittedSitemapRoutes() {
  const generatedFiles = [
    "public/sitemap.xml",
    "public/news-sitemap.xml",
    "public/rss.xml",
    "public/robots.txt",
  ];
  const priorFiles = new Map(generatedFiles.map((relativePath) => [
    relativePath,
    exists(relativePath) ? read(relativePath) : null,
  ]));

  try {
    const result = spawnSync(process.execPath, [path.join(root, "scripts/generate-sitemap.mjs")], {
      cwd: root,
      encoding: "utf8",
    });
    if (result.status !== 0) {
      throw new Error(`Sitemap generation failed (${result.status}): ${result.stderr || result.stdout}`);
    }

    const sitemap = read("public/sitemap.xml");
    const rawLocations = sitemapLocationTexts(sitemap);
    if (rawLocations.length === 0) throw new Error("Generated sitemap contains no <loc> entries");
    return rawLocations.map((rawLocation) => ({ rawLocation, url: new URL(rawLocation) }));
  } finally {
    for (const [relativePath, priorContent] of priorFiles) {
      const absolutePath = path.join(root, relativePath);
      if (priorContent === null) {
        if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
      } else {
        fs.writeFileSync(absolutePath, priorContent, "utf8");
      }
    }
  }
}

const generatedSitemapLocations = emittedSitemapRoutes();
const robots = exists("public/robots.txt") ? read("public/robots.txt") : "";

const sitemapLocationIntegrity = generatedSitemapLocations.map(({ rawLocation, url }) => {
  const canonicalUrl = `${canonicalSiteOrigin}${url.pathname}`;
  const hasCanonicalOrigin = url.protocol === "https:" && url.origin === canonicalSiteOrigin;
  const hasCanonicalIdentity = !url.username
    && !url.password
    && !url.search
    && !url.hash
    && rawLocation === canonicalUrl;
  return {
    rawLocation,
    hasCanonicalOrigin,
    hasCanonicalIdentity,
  };
});

const routeCoverage = requiredDiscoveryRoutes.map((route) => {
  const expectedUrl = new URL(route, canonicalSiteOrigin).href;
  const matchingLocations = generatedSitemapLocations.filter(({ url }) => url.pathname === route);
  return {
    route,
    declaredInSitemapGenerator: matchingLocations.some(({ rawLocation }) => rawLocation === expectedUrl),
    nonCanonicalLocations: matchingLocations
      .filter(({ url }) => url.origin !== canonicalSiteOrigin)
      .map(({ rawLocation }) => rawLocation),
    nonCanonicalUrlIdentities: matchingLocations
      .filter(({ rawLocation, url }) => url.origin === canonicalSiteOrigin && rawLocation !== expectedUrl)
      .map(({ rawLocation }) => rawLocation),
  };
});

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

const robotsContract = {
  present: Boolean(robots),
  allowsCrawl: /User-agent:\s*\*[\s\S]*Allow:\s*\//i.test(robots),
  sitemapDeclared: /Sitemap:\s*https:\/\/4planet\.org\/sitemap\.xml/i.test(robots),
};

const hardFailures = [
  ...sitemapLocationIntegrity
    .filter((row) => !row.hasCanonicalOrigin)
    .map((row) => `NON_CANONICAL_SITEMAP_ORIGIN:${row.rawLocation}`),
  ...sitemapLocationIntegrity
    .filter((row) => row.hasCanonicalOrigin && !row.hasCanonicalIdentity)
    .map((row) => `NON_CANONICAL_SITEMAP_URL:${row.rawLocation}`),
  ...routeCoverage.filter((row) => !row.declaredInSitemapGenerator).map((row) => `MISSING_SITEMAP_ROUTE:${row.route}`),
  ...journeys.filter((row) => !row.physicalEntryPresent).map((row) => `MISSING_ENTRY:${row.route}`),
  ...journeys.filter((row) => !row.returnPathPresent).map((row) => `DEAD_END:${row.route}`),
  ...Object.entries(analyticsContract).filter(([, ok]) => !ok).map(([key]) => `ANALYTICS_GAP:${key}`),
  ...Object.entries(robotsContract).filter(([, ok]) => !ok).map(([key]) => `ROBOTS_GAP:${key}`),
];

const improvementQueue = journeys.flatMap((row) => [
  !row.descriptionPresent ? `${row.route}:meta-description` : null,
  !row.canonicalPresent ? `${row.route}:canonical` : null,
  !row.openGraphPresent ? `${row.route}:open-graph` : null,
].filter(Boolean));

const report = {
  generatedAt: new Date().toISOString(),
  status: hardFailures.length ? "FAIL" : "PASS_WITH_IMPROVEMENTS",
  sitemapLocationIntegrity,
  routeCoverage,
  journeys,
  analyticsContract,
  robotsContract,
  hardFailures,
  improvementQueue,
  truthBoundary: "Discovery readiness and instrumentation presence do not prove indexing, traffic, users, completion, return or referral.",
};

console.log(JSON.stringify(report, null, 2));
if (hardFailures.length) process.exitCode = 1;
