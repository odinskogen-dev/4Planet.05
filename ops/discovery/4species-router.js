import englishOakPage from "../../public/species-data/v1/english-oak.json" with { type: "json" };
const ORIGIN = "https://4planet-05.pages.dev";
const SPECIES_V51_PREVIEW_ORIGIN = 'https://species-v50-orca-preview-3blykp.v2.appdeploy.ai';
const SPECIES_V51_ASSET_PREFIX = '/__species_v51/';

// Founder-authorised, path-isolated Orca v51 LIVE preview.
// The legacy /species catalog and other product routes remain unchanged.
// No visitor cookies or Authorization are ever forwarded to the preview host.
async function serveOrcaV51(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405 });
  }
  const upstream = await fetch(SPECIES_V51_PREVIEW_ORIGIN + '/', {
    method: request.method,
    headers: { Accept: 'text/html' },
    redirect: 'follow',
  });
  if (!upstream.ok) {
    return new Response('SPECIES Orca temporarily unavailable', {
      status: 503,
      headers: { 'cache-control': 'no-store' },
    });
  }
  const headers = new Headers(upstream.headers);
  for (const key of ['set-cookie', 'content-length', 'content-encoding', 'etag', 'content-security-policy']) {
    headers.delete(key);
  }
  headers.set('cache-control', 'no-store');
  headers.set('x-robots-tag', 'noindex, nofollow'); // v51 Orca facts are not yet human-reviewed.
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  headers.set('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data: blob:; connect-src 'self' https://api.gbif.org https://api.obis.org https://api.inaturalist.org https://ghvdzetmplqkdtfqiror.supabase.co; font-src 'self' https: data:; frame-src 'self' https://4planetatlas.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  if (request.method === 'HEAD') return new Response(null, { status: 200, headers });
  const rewritePath = (element, attr) => {
    const value = element.getAttribute(attr);
    if (!value) return;
    const resource = new URL(value, SPECIES_V51_PREVIEW_ORIGIN + '/');
    if (resource.origin !== SPECIES_V51_PREVIEW_ORIGIN || !resource.pathname.startsWith('/assets/')) return;
    element.setAttribute(attr, SPECIES_V51_ASSET_PREFIX + resource.pathname.slice(1));
  };
  return new HTMLRewriter()
    .on('script[src]', { element(element) { rewritePath(element, 'src'); } })
    .on('link[href]', { element(element) { rewritePath(element, 'href'); } })
    .transform(new Response(upstream.body, { status: upstream.status, headers }));
}

async function serveOrcaV51Asset(request, targetPath) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  const suffix = targetPath.slice(SPECIES_V51_ASSET_PREFIX.length);
  if (!suffix || suffix.includes('..') || !suffix.startsWith('assets/')) return new Response('Not found', { status: 404 });
  const target = new URL(suffix, SPECIES_V51_PREVIEW_ORIGIN + '/');
  const upstream = await fetch(target, { method: request.method, redirect: 'follow' });
  const headers = new Headers(upstream.headers);
  headers.delete('set-cookie');
  headers.delete('content-security-policy');
  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
}

async function serveOrcaV51Data(request, path) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
  if (path !== '/species-data/v1/orca.json' && path !== '/species-data/v1/index.json') return new Response('Not found', { status: 404 });
  const upstream = await fetch(SPECIES_V51_PREVIEW_ORIGIN + path, { method: request.method, redirect: 'follow' });
  const headers = new Headers(upstream.headers);
  headers.delete('set-cookie');
  headers.set('cache-control', 'no-store');
  return new Response(request.method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}
// Source-grounded, unreviewed oak proof on the same v52 UI as /orca.
// Source of truth: public/species-data/v1/english-oak.json; bundled by Wrangler.
const OAK_ORIGIN = 'https://species-v50-orca-preview-3blykp.v2.appdeploy.ai';
const OAK_PREFIX = '/__species_oak/';

async function serveEnglishOak(request) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
  const upstream = await fetch(OAK_ORIGIN + '/', { method: request.method, headers: { Accept: 'text/html' }, redirect: 'follow' });
  if (!upstream.ok) return new Response('SPECIES oak preview unavailable', { status: 503, headers: { 'cache-control': 'no-store' } });
  const headers = new Headers(upstream.headers);
  for (const h of ['set-cookie', 'content-length', 'content-encoding', 'etag', 'content-security-policy']) headers.delete(h);
  headers.set('cache-control', 'no-store');
  headers.set('x-robots-tag', 'noindex, nofollow');
  headers.set('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' https: data: blob:; connect-src 'self' https://api.gbif.org https://api.obis.org https://api.inaturalist.org https://ghvdzetmplqkdtfqiror.supabase.co; font-src 'self' https: data:; frame-src 'self' https://4planetatlas.com; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  if (request.method === 'HEAD') return new Response(null, { status: 200, headers });
  const rewriteAsset = (el, name) => {
    const value = el.getAttribute(name);
    if (!value) return;
    const target = new URL(value, OAK_ORIGIN + '/');
    if (target.origin === OAK_ORIGIN && target.pathname.startsWith('/assets/')) {
      el.setAttribute(name, OAK_PREFIX + target.pathname.slice(1));
    }
  };
  return new HTMLRewriter()
    .on('head', { element(el) { el.append('<script src="/__species_oak/boot.js"></script>', { html: true }); } })
    .on('title', { element(el) { el.setInnerContent('English oak — SPECIES'); } })
    .on('script[src]', { element(el) { rewriteAsset(el, 'src'); } })
    .on('link[href]', { element(el) { rewriteAsset(el, 'href'); } })
    .transform(new Response(upstream.body, { status: upstream.status, headers }));
}

async function serveEnglishOakAsset(request, pathname) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
  const relative = pathname.slice(OAK_PREFIX.length);
  if (relative === 'boot.js') {
    const script = "if (!location.hash.startsWith('#/labs/species/english-oak')) location.hash = '#/labs/species/english-oak';";
    return new Response(request.method === 'HEAD' ? null : script, { status: 200, headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-store' } });
  }
  if (!relative.startsWith('assets/') || relative.includes('..')) return new Response('Not found', { status: 404 });
  const target = new URL(relative, OAK_ORIGIN + '/');
  const upstream = await fetch(target, { method: request.method, redirect: 'follow' });
  const headers = new Headers(upstream.headers);
  for (const h of ['set-cookie', 'content-security-policy']) headers.delete(h);
  if (!upstream.ok || request.method === 'HEAD' || !relative.endsWith('.js')) {
    return new Response(request.method === 'HEAD' ? null : upstream.body, { status: upstream.status, headers });
  }
  // This existing v52 standalone preview has an Orca-specific media adapter.
  // Temporarily correct *only the oak-serving bundle*, never the /orca build.
  // Eventually replace this bounded adapter with the canonical shared media service.
  const oakImages = [englishOakPage.hero, ...englishOakPage.gallery];
  const changes = [
    ['https://upload.wikimedia.org/wikipedia/commons/1/17/Orcinus_orca_282690764.jpg', oakImages[0].url],
    ['https://upload.wikimedia.org/wikipedia/commons/3/37/Killerwhales_jumping.jpg', oakImages[1].url],
    ['https://commons.wikimedia.org/wiki/File:Orcinus_orca_282690764.jpg', oakImages[0].sourcePage],
    ['https://commons.wikimedia.org/wiki/File:Killerwhales_jumping.jpg', oakImages[1].sourcePage],
    ['Robert Pittman / NOAA', oakImages[1].credit],
    ['steve b', oakImages[0].credit],
    ['Public domain (US federal government)', oakImages[1].licence],
    ['Wild orca', 'English oak'],
    ['Orcas live in every ocean, with distinct social cultures and hunting strategies. This preview uses the referenced NOAA source document for its published facts.', 'English oaks grow in temperate woodlands and support many forms of life. For detailed facts, consult the sourced botanical profile.'],
    ['https://www.fisheries.noaa.gov/species/killer-whale', 'https://www.kew.org/plants/oak-tree'],
    ['commonName:"Orca"', 'commonName:"English oak"'],
    ['title:"Orca"', 'title:"English oak"'],
  ];
  let js = await upstream.text();
  for (const [from, to] of changes) js = js.replaceAll(from, to);
  for (const h of ['content-length', 'content-encoding', 'etag']) headers.delete(h);
  headers.set('content-type', 'application/javascript; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(js, { status: upstream.status, headers });
}

function serveEnglishOakData(request) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(englishOakPage), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
  });
}
const INDEXNOW_KEY = "8f4c2d91a7b64e3fa1c9d0b6e5274a83";

const RESERVED = new Set([
  "labs","os","story","domains","missions","atlas","lens","food","s4piens","4sapien",
  "impact","checkout","join","people","brands","partners","actors","get-involved","funders",
  "living-systems","reports","about","magazine","stories","privacy","culture","m","marketplace",
  "store","cart","members","ambassadors","portal","sponsors","oce4n","e4rth","4culture","system","404"
]);

const SPECIES_PLACE_RELATIONS = {
  "african-savanna-elephant": { label: "Kenya", url: "https://4planetatlas.com/place/kenya" },
  "lion": { label: "Kenya", url: "https://4planetatlas.com/place/kenya" },
  "cheetah": { label: "Kenya", url: "https://4planetatlas.com/place/kenya" },
};

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
  const slug = publicPath.startsWith("/species/") ? publicPath.slice("/species/".length).replace(/\/+$/, "") : "";
  const placeRelation = SPECIES_PLACE_RELATIONS[slug] || null;
  return new HTMLRewriter()
    .on('script[src="/host-indexing-policy.js"]', { element(el) { el.remove(); } })
    .on('meta[name="robots"]', { element(el) { el.setAttribute("content", "index,follow,max-image-preview:large"); } })
    .on('link[rel="canonical"]', { element(el) { el.remove(); } })
    .on('meta[property="og:url"]', { element(el) { el.setAttribute("content", canonical); } })
    .on("head", { element(el) { el.append(`<link rel="canonical" href="${canonical}">`, { html: true }); } })
    .on("body", { element(el) {
      if (!placeRelation) return;
      el.append(`<nav data-4planet-related-place aria-label="Related place intelligence"><p>Related place intelligence: <a href="${placeRelation.url}">${placeRelation.label} in 4PLANET ATLAS</a>. This link reflects an existing curated species–place relationship; occurrence does not imply local abundance or complete range.</p></nav>`, { html: true });
    } })
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

    if (path === `/${INDEXNOW_KEY}.txt`) {
      return new Response(INDEXNOW_KEY, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" } });
    }
    if (path === "/robots.txt") {
      return new Response(robots(), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=300" } });
    }
    if (path === "/sitemap.xml") {
      return new Response(sitemap(), { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" } });
    }

    if (path === "/orca" || path === "/orca/") return serveOrcaV51(request);
    if (path === "/english-oak" || path === "/english-oak/") return serveEnglishOak(request);
    if (path.startsWith(OAK_PREFIX)) return serveEnglishOakAsset(request, path);
    if (path === "/species-data/v1/english-oak.json") return serveEnglishOakData(request);
    if (path.startsWith(SPECIES_V51_ASSET_PREFIX)) return serveOrcaV51Asset(request, path);
    if (path === "/species-data/v1/orca.json" || path === "/species-data/v1/index.json") return serveOrcaV51Data(request, path);
    if (isAsset(path)) return proxyRaw(request, path);
    if (path === "/species/" || path.startsWith("/species/")) return proxyPage(request, path, path);
    if (RESERVED.has(first(path))) return redirect(`https://4planet.org${path}${url.search}`);

    return redirect(`https://4species.com/species${path}${url.search}`);
  },
};
