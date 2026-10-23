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
const xmlnsNamespace = "http://www.w3.org/2000/xmlns/";
const xmlSchemaInstanceNamespace = "http://www.w3.org/2001/XMLSchema-instance";

function isValidSitemapLastmod(value) {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/,
  );
  if (!match) return false;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, timezone] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  if (year === 0 || month < 1 || month > 12) return false;
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  if (day < 1 || day > daysInMonth) return false;

  if (hourText !== undefined) {
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const second = Number(secondText);
    if (hour > 23 || minute > 59 || second > 59) return false;
  }

  if (timezone && timezone !== "Z") {
    const timezoneHour = Number(timezone.slice(1, 3));
    const timezoneMinute = Number(timezone.slice(4, 6));
    if (timezoneHour > 14 || timezoneMinute > 59 || (timezoneHour === 14 && timezoneMinute !== 0)) {
      return false;
    }
  }
  return true;
}

function sitemapLocationTexts(xml) {
  const locations = [];
  const stack = [];
  let locationText = null;
  let sitemapValueText = null;
  let currentUrlLocCount = null;
  let currentUrlElementOrder = null;
  let currentUrlElements = null;
  let rootSeen = false;
  const optionalUrlValues = new Set(["lastmod", "changefreq", "priority"]);
  const urlElementOrder = new Map([
    ["loc", 0],
    ["lastmod", 1],
    ["changefreq", 2],
    ["priority", 3],
  ]);
  const allowedChangeFrequencies = new Set([
    "always",
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "never",
  ]);
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
  const assertAllowedAttributes = (tag, allowSchemaLocation = false) => {
    for (const attribute of Object.values(tag.attributes)) {
      const isNamespaceDeclaration = attribute.uri === xmlnsNamespace;
      const isSchemaLocation = allowSchemaLocation
        && attribute.uri === xmlSchemaInstanceNamespace
        && attribute.local === "schemaLocation";
      if (!isNamespaceDeclaration && !isSchemaLocation) {
        throw new Error(`Sitemap <${tag.local}> must not contain attribute: ${attribute.name}`);
      }
    }
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
      assertAllowedAttributes(tag, true);
      rootSeen = true;
    } else if (stack.length === 2) {
      if (tag.uri === sitemapNamespace && tag.local !== "url") {
        throw new Error(`Unexpected sitemap element: <${tag.local}>`);
      }
      if (tag.uri !== sitemapNamespace) {
        throw new Error("Sitemap <urlset> may contain only sitemap <url> elements");
      }
      assertAllowedAttributes(tag);
      currentUrlLocCount = 0;
      currentUrlElementOrder = -1;
      currentUrlElements = new Set();
    } else if (stack.length === 3
      && stack[1].local === "url"
      && stack[1].uri === sitemapNamespace) {
      if (tag.uri !== sitemapNamespace) {
        throw new Error("Sitemap <url> may contain only sitemap elements");
      }
      if (!urlElementOrder.has(tag.local)) {
        throw new Error(`Unexpected sitemap element: <${tag.local}>`);
      }
      assertAllowedAttributes(tag);
      if (tag.local === "loc") {
        currentUrlLocCount += 1;
        if (currentUrlLocCount > 1) {
          throw new Error("Each sitemap <url> must contain exactly one non-empty <loc>");
        }
        if (currentUrlElementOrder !== -1) {
          throw new Error("Sitemap <loc> must be the first child of each <url>");
        }
        currentUrlElementOrder = 0;
        currentUrlElements.add("loc");
        locationText = "";
      } else if (optionalUrlValues.has(tag.local)) {
        if (currentUrlLocCount !== 1) {
          throw new Error("Sitemap <loc> must be the first child of each <url>");
        }
        if (currentUrlElements.has(tag.local)) {
          throw new Error(`Sitemap <${tag.local}> may appear at most once per <url>`);
        }
        const elementOrder = urlElementOrder.get(tag.local);
        if (elementOrder < currentUrlElementOrder) {
          throw new Error("Sitemap <url> child elements must follow loc, lastmod, changefreq, priority order");
        }
        currentUrlElementOrder = elementOrder;
        currentUrlElements.add(tag.local);
        sitemapValueText = "";
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
      const value = sitemapValueText.trim();
      if (tag.local === "changefreq" && !allowedChangeFrequencies.has(value)) {
        throw new Error(`Invalid sitemap <changefreq> value: ${value || "(empty)"}`);
      }
      if (tag.local === "lastmod" && !isValidSitemapLastmod(value)) {
        throw new Error(`Invalid sitemap <lastmod> value: ${value || "(empty)"}`);
      }
      if (tag.local === "priority"
        && !/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/.test(value)) {
        throw new Error("Sitemap <priority> must be a decimal from 0.0 to 1.0");
      }
      sitemapValueText = null;
    } else if (tag.local === "url"
      && tag.uri === sitemapNamespace
      && stack.length === 2) {
      if (currentUrlLocCount !== 1) {
        throw new Error("Each sitemap <url> must contain exactly one non-empty <loc>");
      }
      currentUrlLocCount = null;
      currentUrlElementOrder = null;
      currentUrlElements = null;
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
