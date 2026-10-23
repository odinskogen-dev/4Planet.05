import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

function decodeXmlText(value) {
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, (entity, name) => {
    if (name[0] === "#") {
      const hexadecimal = name[1]?.toLowerCase() === "x";
      const codePoint = Number.parseInt(name.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
        throw new Error(`Invalid XML character reference: ${entity}`);
      }
      return String.fromCodePoint(codePoint);
    }
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[name.toLowerCase()];
  });
}

function findXmlTagEnd(xml, start) {
  let quote = null;
  for (let index = start; index < xml.length; index += 1) {
    const character = xml[index];
    if (quote) {
      if (character === quote) quote = null;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === ">") {
      return index;
    }
  }
  throw new Error("Unterminated XML tag");
}

function sitemapLocationTexts(xml) {
  const locations = [];
  const stack = [];
  let cursor = 0;
  let locationText = null;
  let rootSeen = false;

  while (cursor < xml.length) {
    if (xml[cursor] !== "<") {
      const nextTag = xml.indexOf("<", cursor);
      const end = nextTag === -1 ? xml.length : nextTag;
      if (locationText !== null) locationText += xml.slice(cursor, end);
      cursor = end;
      continue;
    }

    if (xml.startsWith("<!--", cursor)) {
      const end = xml.indexOf("-->", cursor + 4);
      if (end === -1) throw new Error("Unterminated XML comment");
      cursor = end + 3;
      continue;
    }

    if (xml.startsWith("<![CDATA[", cursor)) {
      const end = xml.indexOf("]]>", cursor + 9);
      if (end === -1) throw new Error("Unterminated XML CDATA section");
      if (locationText !== null) locationText += xml.slice(cursor + 9, end);
      cursor = end + 3;
      continue;
    }

    if (xml.startsWith("<?", cursor)) {
      const end = xml.indexOf("?>", cursor + 2);
      if (end === -1) throw new Error("Unterminated XML processing instruction");
      cursor = end + 2;
      continue;
    }

    if (xml.startsWith("<!", cursor)) {
      throw new Error("Unsupported XML declaration in sitemap");
    }

    const tagEnd = findXmlTagEnd(xml, cursor + 1);
    const tag = xml.slice(cursor + 1, tagEnd).trim();
    const closing = tag.startsWith("/");
    const selfClosing = tag.endsWith("/");
    const nameMatch = tag.match(/^\/?\s*([A-Za-z_][\w:.-]*)/);
    if (!nameMatch) throw new Error(`Malformed XML tag: <${tag}>`);
    const localName = nameMatch[1].split(":").at(-1).toLowerCase();

    if (closing) {
      if (selfClosing || stack.at(-1) !== localName) {
        throw new Error(`Mismatched XML closing tag: ${localName}`);
      }
      if (localName === "loc" && locationText !== null) {
        locations.push(decodeXmlText(locationText.trim()));
        locationText = null;
      }
      stack.pop();
    } else {
      if (locationText !== null) throw new Error("Sitemap <loc> must contain text only");
      stack.push(localName);
      if (stack.length === 1) {
        if (localName !== "urlset" || rootSeen) throw new Error("Sitemap must contain one <urlset> root");
        rootSeen = true;
      }
      if (localName === "loc" && stack.length === 3 && stack[0] === "urlset" && stack[1] === "url") {
        locationText = "";
      }
      if (selfClosing) stack.pop();
    }
    cursor = tagEnd + 1;
  }

  if (!rootSeen || stack.length > 0 || locationText !== null) throw new Error("Incomplete sitemap XML structure");
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
  ...routeCoverage.flatMap((row) => row.nonCanonicalLocations.map((location) => `NON_CANONICAL_SITEMAP_ORIGIN:${location}`)),
  ...routeCoverage.flatMap((row) => row.nonCanonicalUrlIdentities.map((location) => `NON_CANONICAL_SITEMAP_URL:${location}`)),
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
