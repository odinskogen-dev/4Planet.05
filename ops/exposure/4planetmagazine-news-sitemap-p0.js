// 4PLANET Magazine scoped Google News sitemap repair.
// Exact missing URL only. No invented news dates or articles.
// The canonical magazine Worker, its 92-entry sitemap, published articles,
// Chrome/Safari HTML, media, security, and 57 live SPECIES pages are untouched.
const NEWS_XML = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
  + 'xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n'
  + '</urlset>\n';
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname !== "4planetmagazine.com" || url.pathname !== "/news-sitemap.xml") {
      return new Response("Not Found", { status: 404 });
    }
    if (!["GET", "HEAD"].includes(request.method)) {
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }
    return new Response(request.method === "HEAD" ? null : NEWS_XML, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300",
        "x-4planet-seo-p0": "2026-10-27-magazine-news-sitemap",
      },
    });
  },
};
