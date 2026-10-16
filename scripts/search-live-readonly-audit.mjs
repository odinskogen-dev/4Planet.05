#!/usr/bin/env node
// Read-only public SEO probe. No cookies, logins, tokens, mutations or index submissions.
import fs from "node:fs";
const origins = [
  "https://4planet.org", "https://4species.com", "https://4planetatlas.com",
  "https://4sapien.com", "https://s4piens.com", "https://4brands.org",
  "https://4nation.org", "https://4planetmagazine.com", "https://4planetmarket.com",
];
const special = {
  "4planet.org": ["/atlas/earth", "/atlas/fires", "/atlas/whales", "/species/orca", "/livingsystems/species/polar-bear/", "/games/"],
  "4species.com": ["/orca", "/gray-wolf", "/asian-elephant", "/hippopotamus", "/explore"],
  "4planetatlas.com": ["/atlas", "/places", "/place/kenya"],
  "4nation.org": ["/country/norway", "/country/maldives"],
  "4brands.org": ["/company", "/reports"],
  "4sapien.com": ["/privacy", "/method"],
};
const allowed = new Set(origins.map((x) => new URL(x).hostname));
function safeText(x, n = 160) { return String(x || "").replace(/[\r\n\t]+/g, " ").slice(0, n); }
function extract(html, pattern) { return safeText(html.match(pattern)?.[1] || ""); }
async function probe(url, kind = "html") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 11000);
  try {
    const result = await fetch(url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "4PLANET-Search-QA/1.0 (public read-only check)", accept: kind === "html" ? "text/html" : "text/plain,application/xml" } });
    const dest = new URL(result.url);
    const limited = dest.origin === new URL(url).origin || allowed.has(dest.hostname);
    const type = result.headers.get("content-type") || "";
    const body = limited ? (await result.text()).slice(0, 1024 * 1024) : "";
    const common = { url, status: result.status, final: dest.origin + dest.pathname, type: safeText(type, 65), xRobots: safeText(result.headers.get("x-robots-tag")), redirected: result.redirected };
    if (kind === "robots") return { ...common, sitemapDeclarations: body.split("\n").filter((x) => /^sitemap:/i.test(x.trim())).slice(0, 15), robotsNoindex: /noindex/i.test(body) };
    if (kind === "sitemap") return { ...common, sitemapUrls: [...body.matchAll(/<loc>\s*(https?:\/\/[^<]+)<\/loc>/gi)].slice(0, 400).map(m => safeText(m[1], 220)), xml: /^\s*<\?xml|<urlset|<sitemapindex/i.test(body) };
    return { ...common, title: extract(body, /<title[^>]*>([\s\S]*?)<\/title>/i), description: extract(body, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i), canonical: extract(body, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i), htmlRobots: extract(body, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i), h1: extract(body, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]*>/g, "").slice(0, 160), hasJsonLd: /application\/ld\+json/i.test(body), hasAppShell: /id=["']root["']/.test(body) };
  } catch (e) { return { url, error: safeText(e?.name || e?.message || String(e)) }; }
  finally { clearTimeout(timer); }
}
const all = [];
for (const origin of origins) {
  const h = new URL(origin).hostname;
  const tasks = [
    probe(origin + "/", "html"),
    probe(origin + "/robots.txt", "robots"),
    probe(origin + "/sitemap.xml", "sitemap"),
    ...((special[h] || []).map(p => probe(origin + p))),
  ];
  all.push(...await Promise.all(tasks));
}
const report = { generated: new Date().toISOString(), method: "read-only public HTTP; NOT Google indexing verification", results: all };
fs.writeFileSync("search-live-audit.json", JSON.stringify(report, null, 2));
for (const v of all) {
  if (v.sitemapUrls) console.log("SITEMAP", v.url, "HTTP", v.status, "URLS", v.sitemapUrls.length, "XML", v.xml, "sample", v.sitemapUrls.slice(0, 5).join(" | "));
  else if (v.sitemapDeclarations) console.log("ROBOTS", v.url, "HTTP", v.status, "SITEMAPS", v.sitemapDeclarations.join(" | "));
  else console.log("PAGE", v.url, v.status ?? v.error, "→", v.final || "-", "robots="+(v.xRobots || v.htmlRobots || "none"), "canonical="+(v.canonical || "none"), "h1="+(v.h1 || "none"));
}
console.log("READONLY SEO AUDIT:", all.length, "public requests; no user credentials; zero writes to websites.");
