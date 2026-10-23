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
const sitemapNamespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
const xmlNamespace = "http://www.w3.org/XML/1998/namespace";
const xmlNamePattern = "[A-Za-z_][\\w.-]*(?::[A-Za-z_][\\w.-]*)?";

function decodeXmlText(value) {
  if (/&(?!#x[0-9a-f]+;|#[0-9]+;|amp;|lt;|gt;|quot;|apos;)/i.test(value)) {
    throw new Error("Invalid XML entity reference");
  }
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos);/gi, (entity, name) => {
    if (name[0] === "#") {
      const hexadecimal = name[1]?.toLowerCase() === "x";
      const codePoint = Number.parseInt(name.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      const validXmlCharacter = codePoint === 0x09
        || codePoint === 0x0a
        || codePoint === 0x0d
        || (codePoint >= 0x20 && codePoint <= 0xd7ff)
        || (codePoint >= 0xe000 && codePoint <= 0xfffd)
        || (codePoint >= 0x10000 && codePoint <= 0x10ffff);
      if (!Number.isInteger(codePoint) || !validXmlCharacter) {
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

function splitXmlName(name) {
  const separator = name.indexOf(":");
  return separator === -1
    ? { prefix: "", localName: name }
    : { prefix: name.slice(0, separator), localName: name.slice(separator + 1) };
}

function parseXmlStartTag(tag, inheritedNamespaces) {
  const selfClosing = tag.endsWith("/");
  const content = (selfClosing ? tag.slice(0, -1) : tag).trimEnd();
  const nameMatch = content.match(new RegExp(`^(${xmlNamePattern})`));
  if (!nameMatch) throw new Error(`Malformed XML tag: <${tag}>`);

  const qName = nameMatch[1];
  const attributes = [];
  const attributeNames = new Set();
  let remainder = content.slice(qName.length);
  const attributePattern = new RegExp(`^(${xmlNamePattern})\\s*=\\s*(["'])([^<]*?)\\2`);

  while (remainder.length > 0) {
    if (!/^\s/.test(remainder)) throw new Error(`Malformed XML attributes: <${tag}>`);
    remainder = remainder.trimStart();
    if (!remainder) break;
    const attributeMatch = remainder.match(attributePattern);
    if (!attributeMatch) throw new Error(`XML attributes must be quoted: <${tag}>`);
    const [, name, , rawValue] = attributeMatch;
    if (attributeNames.has(name)) throw new Error(`Duplicate XML attribute: ${name}`);
    attributeNames.add(name);
    attributes.push({ name, value: decodeXmlText(rawValue) });
    remainder = remainder.slice(attributeMatch[0].length);
  }

  const namespaces = new Map(inheritedNamespaces);
  for (const { name, value } of attributes) {
    if (name === "xmlns") namespaces.set("", value);
    if (name.startsWith("xmlns:")) {
      const prefix = name.slice(6);
      if (prefix === "xml" && value !== xmlNamespace) throw new Error("The xml prefix has a fixed namespace");
      if (prefix === "xmlns" || value === "") throw new Error(`Invalid XML namespace declaration: ${name}`);
      namespaces.set(prefix, value);
    }
  }

  const { prefix, localName } = splitXmlName(qName);
  if (prefix && !namespaces.has(prefix)) throw new Error(`Unbound XML namespace prefix: ${prefix}`);
  for (const { name } of attributes) {
    if (name === "xmlns" || name.startsWith("xmlns:")) continue;
    const attributePrefix = splitXmlName(name).prefix;
    if (attributePrefix && !namespaces.has(attributePrefix)) {
      throw new Error(`Unbound XML namespace prefix: ${attributePrefix}`);
    }
  }

  return {
    qName,
    localName,
    namespace: prefix ? namespaces.get(prefix) : (namespaces.get("") ?? ""),
    namespaces,
    selfClosing,
  };
}

function sitemapLocationTexts(xml) {
  const locations = [];
  const stack = [];
  let cursor = 0;
  let locationText = null;
  let rootSeen = false;
  let rootClosed = false;
  const baseNamespaces = new Map([["xml", xmlNamespace]]);

  while (cursor < xml.length) {
    if (xml[cursor] !== "<") {
      const nextTag = xml.indexOf("<", cursor);
      const end = nextTag === -1 ? xml.length : nextTag;
      const text = xml.slice(cursor, end);
      if (locationText !== null) locationText += decodeXmlText(text);
      else if (text.trim()) throw new Error("XML text is not allowed outside sitemap values");
      cursor = end;
      continue;
    }

    if (xml.startsWith("<!--", cursor)) {
      const end = xml.indexOf("-->", cursor + 4);
      if (end === -1) throw new Error("Unterminated XML comment");
      if (xml.slice(cursor + 4, end).includes("--")) throw new Error("Malformed XML comment");
      cursor = end + 3;
      continue;
    }

    if (xml.startsWith("<![CDATA[", cursor)) {
      const end = xml.indexOf("]]>", cursor + 9);
      if (end === -1) throw new Error("Unterminated XML CDATA section");
      if (stack.length === 0) throw new Error("XML CDATA must be inside the root element");
      if (locationText !== null) locationText += xml.slice(cursor + 9, end);
      cursor = end + 3;
      continue;
    }

    if (xml.startsWith("<?", cursor)) {
      const end = xml.indexOf("?>", cursor + 2);
      if (end === -1) throw new Error("Unterminated XML processing instruction");
      const instruction = xml.slice(cursor + 2, end).trim();
      if (/^xml(?:\s|$)/i.test(instruction) && (cursor !== 0 || !/^xml\s+version=(?:"1\.0"|'1\.0')(?:\s+encoding=(?:"UTF-8"|'UTF-8'))?$/i.test(instruction))) {
        throw new Error("Malformed or misplaced XML declaration");
      }
      cursor = end + 2;
      continue;
    }

    if (xml.startsWith("<!", cursor)) {
      throw new Error("Unsupported XML declaration in sitemap");
    }

    const tagEnd = findXmlTagEnd(xml, cursor + 1);
    const tag = xml.slice(cursor + 1, tagEnd).trim();
    const closing = tag.startsWith("/");

    if (closing) {
      const closingMatch = tag.match(new RegExp(`^/(${xmlNamePattern})\\s*$`));
      if (!closingMatch || stack.at(-1)?.qName !== closingMatch[1]) {
        throw new Error(`Mismatched XML closing tag: ${tag}`);
      }
      const current = stack.at(-1);
      if (current.localName === "loc" && current.namespace === sitemapNamespace && locationText !== null) {
        locations.push(locationText.trim());
        locationText = null;
      }
      stack.pop();
      if (stack.length === 0) rootClosed = true;
    } else {
      if (rootClosed) throw new Error("Sitemap must contain exactly one root element");
      if (locationText !== null) throw new Error("Sitemap <loc> must contain text only");
      const current = parseXmlStartTag(tag, stack.at(-1)?.namespaces ?? baseNamespaces);
      stack.push(current);
      if (stack.length === 1) {
        if (current.localName !== "urlset" || current.namespace !== sitemapNamespace || rootSeen) {
          throw new Error("Sitemap must contain one namespaced <urlset> root");
        }
        rootSeen = true;
      }
      if (current.localName === "loc"
        && current.namespace === sitemapNamespace
        && stack.length === 3
        && stack[0].localName === "urlset"
        && stack[0].namespace === sitemapNamespace
        && stack[1].localName === "url"
        && stack[1].namespace === sitemapNamespace) {
        locationText = "";
      }
      if (current.selfClosing) {
        if (locationText !== null) {
          locations.push("");
          locationText = null;
        }
        stack.pop();
        if (stack.length === 0) rootClosed = true;
      }
    }
    cursor = tagEnd + 1;
  }

  if (!rootSeen || !rootClosed || stack.length > 0 || locationText !== null) throw new Error("Incomplete sitemap XML structure");
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
