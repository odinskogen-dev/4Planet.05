const ORIGIN = "https://4planet-05.pages.dev";

const RESERVED = new Set([
  "labs","os","story","domains","missions","atlas","lens","food","s4piens","4sapien",
  "impact","checkout","join","people","brands","partners","actors","get-involved","funders",
  "living-systems","reports","about","magazine","stories","privacy","culture","m","marketplace",
  "store","cart","members","ambassadors","portal","sponsors","oce4n","e4rth","4culture","system","404"
]);

const INDEXABLE_SPECIES = [
  "orca","humpback-whale","western-honey-bee","sperm-whale","harbour-porpoise",
  "bottlenose-dolphin","atlantic-cod","blue-mussel","jaguar","hyacinth-macaw",
  "blue-whale","african-savanna-elephant","asian-elephant","lion","tiger","cheetah",
  "polar-bear","giant-panda","whale-shark","green-sea-turtle"
];

const ASSET_PREFIXES = ["/assets/","/api/","/fonts/","/images/","/icons/","/static/","/data/","/media/","/.well-known/"];

function isAsset(path) {
  if (ASSET_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
  if (["/favicon.ico","/manifest.webmanifest"].includes(path)) return true;
  return (path.split("/").pop() || "").includes(".");
}

function first(path) {
  return path.split("/").filter(Boolean)[0] || "";
}

function redirect(url, status = 308) {
  return Response.redirect(url, status);
}

function canonicalFor(path) {
  if (path === "/species" || path === "/species/") return "https://4species.com/species/";
  return `https://4species.com${path}`;
}

function robots() {
  return [
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    "Sitemap: https://4species.com/sitemap.xml",
    "",
  ].join("\n");
}

function sitemap() {
  const urls = [
    "https://4species.com/species/",
    ...INDEXABLE_SPECIES.map((slug) => `https://4species.com/species/${slug}`),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`;
}

async function proxyRaw(request, targetPath) {
  const incoming = new URL(request.url);
  const target = new URL(ORIGIN);
  target.pathname = targetPath;
  target.search = incoming.search;
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-4planet-public-product-proxy", "species");
  return fetch(new Request(target.toString(), {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "follow",
  }));
}

async function proxyPage(request, targetPath, publicPath) {
  const upstream = await proxyRaw(request, targetPath);
  const headers = new Headers(upstream.headers);
  for (const key of ["x-robots-tag","content-length","content-encoding","etag"]) headers.delete(key);
  headers.set("cache-control", "public, max-age=90, must-revalidate");

  const type = headers.get("content-type") || "";
  if (!type.toLowerCase().includes("text/html") || request.method === "HEAD") {
    return new Response(request.method === "HEAD" ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  }

  const canonical = canonicalFor(publicPath);
  return new HTMLRewriter()
    .on('script[src="/host-indexing-policy.js"]', { element(el) { el.remove(); } })
    .on('meta[name="robots"]', { element(el) { el.setAttribute("content", "index,follow,max-image-preview:large"); } })
    .on('link[rel="canonical"]', { element(el) { el.setAttribute("href", canonical); } })
    .on('meta[property="og:url"]', { element(el) { el.setAttribute("content", canonical); } })
    .on("head", { element(el) { el.append(`<link rel="canonical" href="${canonical}">`, { html: true }); } })
    .transform(new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    }));
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();
    const path = url.pathname || "/";

    if (host === "www.4species.com") return redirect(`https://4species.com${path}${url.search}`);
    if (path === "/" || path === "") return redirect(`https://4species.com/species/${url.search}`);
    if (path === "/species") return redirect(`https://4species.com/species/${url.search}`);
    if (path === "/atlas" || path.startsWith("/atlas/")) return redirect(`https://4planetatlas.com/${url.search}`.replace("/?", "?"));

    if (path === "/robots.txt") {
      return new Response(robots(), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=300" } });
    }
    if (path === "/sitemap.xml") {
      return new Response(sitemap(), { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" } });
    }

    if (isAsset(path)) return proxyRaw(request, path);
    if (path === "/species/" || path.startsWith("/species/")) return proxyPage(request, path, path);
    if (RESERVED.has(first(path))) return redirect(`https://4planet.org${path}${url.search}`);

    return redirect(`https://4species.com/species${path}${url.search}`);
  },
};
