// 4PLANET scoped P0 operational workaround. Serves only the known-missing
// https://4planet.org/news-sitemap.xml URL. Does NOT proxy or modify pages,
// species, Atlas, magazine, cookies, sessions, authentication or site HTML.
// Remove the exact-path route when the canonical public origin serves valid
// News XML itself. No invented publications or publication dates.
const XML = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
  + 'xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n'
  + '</urlset>\n';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname !== "4planet.org" || url.pathname !== "/news-sitemap.xml") {
      return new Response("Not Found", { status: 404 });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405, headers: { allow: "GET, HEAD" },
      });
    }
    return new Response(request.method === "HEAD" ? null : XML, {
      status: 200,
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300",
        "x-4planet-seo-p0": "2026-10-27-news-sitemap",
      },
    });
  },
};
