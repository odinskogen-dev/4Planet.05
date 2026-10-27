// 4PLANET bounded P0: remove only the 107 explicitly verified LIVE-404
// IMPACT project/actor sitemap <url> blocks. Exact blocklist is generated at
// release from live public sitemap after 107/107 final HTTP 404 independent
// proof, and is pinned to the release receipt SHA256. Any new legitimate
// routes not on that frozen list remain untouched. Never alter SPECIES.
const REJECTED_LIVE_404_URLS = new Set(/*__EXACT_404_LOC_LIST__*/);
const ORIGIN = "https://4planet-05.pages.dev/sitemap.xml";

export default {
  async fetch(request) {
    const u = new URL(request.url);
    if (u.hostname !== "4planet.org" || u.pathname !== "/sitemap.xml") {
      return new Response("Not Found", { status: 404 });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }
    const upstream = await fetch(ORIGIN, { headers: { accept: "application/xml" }, redirect: "follow" });
    if (!upstream.ok) return new Response("Upstream sitemap unavailable", {
      status: 503, headers: { "cache-control": "no-store" },
    });
    if (request.method === "HEAD") return new Response(null, {
      status: 200, headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
    });
    const xml = await upstream.text();
    if (!xml.startsWith('<?xml') || !xml.includes("<urlset")) {
      return new Response("Invalid upstream sitemap", { status: 503, headers: { "cache-control": "no-store" } });
    }
    const kept = xml.replace(/<url>[\s\S]*?<\/url>\s*/g, (block) => {
      const match = block.match(/<loc>([^<]+)<\/loc>/);
      return match && REJECTED_LIVE_404_URLS.has(match[1]) ? "" : block;
    });
    return new Response(kept, {
      status: 200,
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300",
        "x-4planet-seo-p0": "2026-10-27-dead-impact-sitemap-urls-removed",
      },
    });
  },
};
