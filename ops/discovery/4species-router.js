import englishOakPage from "../../public/species-data/v1/english-oak.json" with { type: "json" };
import { handleSpeciesProof, proofBootScript } from "./species-proof-router.js";
const ORIGIN = "https://4planet-05.pages.dev";

// SPECIES v53 — single canonical origin, proper pathname routing, no Orca fallback.
// Versioned Cloudflare Pages preview was built from Claude's exact source and
// verified before the founder-approved production cutover.
const SPECIES_V53_ORIGIN = "https://72494005.4planet-05.pages.dev";
const PROFILE_DATA_PREFIX = "/species-data/v1/";
const PROFILE_REVIEW_TIMEOUT_MS = 3000;
const SITEMAP_SOURCE_TIMEOUT_MS = 3000;
const SITEMAP_REVIEW_CONCURRENCY = 6;
const PHOTO_REVIEW_TIMEOUT_MS = 5000;
const MAX_APPROVED_PHOTO_BYTES = 15 * 1024 * 1024;
export const NON_PROFILE_REVIEW_STATE = "NON_PROFILE";
const PUBLIC_NON_PROFILE_PATHS = new Set(["/", "/explore", "/quiz", "/about"]);
// Production rollback baseline verified on 24 Oct 2026. These 57 profiles are
// intentionally preserved unchanged. Any later slug is a new admission and
// must pass the explicit Founder batch and independently signed photo gate.
export const CURRENT_PUBLIC_SPECIES_SLUGS = new Set([
  "orca", "lion", "tiger", "african-savanna-elephant", "asian-elephant",
  "bald-eagle", "black-rhinoceros", "blue-whale", "bornean-orangutan",
  "cheetah", "chimpanzee", "emperor-penguin", "giant-panda", "giraffe",
  "gray-wolf", "great-white-shark", "green-sea-turtle", "hippopotamus",
  "jaguar", "monarch-butterfly", "polar-bear", "english-oak",
  "western-honey-bee", "fly-agaric", "common-octopus", "atlantic-puffin",
  "sei-whale", "eurasian-lynx", "humpback-whale", "sperm-whale",
  "harbour-porpoise", "bottlenose-dolphin", "atlantic-cod", "blue-mussel",
  "whale-shark", "leopard", "eastern-gorilla", "acropora-palmata",
  "hyacinth-macaw", "koala", "quokka", "capybara", "red-fox",
  "giant-anteater", "giant-otter", "walrus", "common-kingfisher",
  "secretary-bird", "scarlet-macaw", "peregrine-falcon", "ocean-sunfish",
  "giant-manta-ray", "greater-blue-ringed-octopus", "peacock-mantis-shrimp",
  "venus-flytrap", "titan-arum", "giant-sequoia",
]);

// Fail closed. A new slug is added only by an exact Founder-authorised batch
// change after independent science, photograph, rights and byte verification.
const FOUNDER_AUTHORISED_NEW_PROFILE_BATCH = new Set([]);

// Trusted admission records live outside mutable species-page JSON. This map
// remains empty until an exact Founder batch and independent rights/photo
// review add the same slug, URL, licence, creator, source and byte digest.
export const APPROVED_NEW_SPECIES_PHOTOS = new Map([]);

function permitsPhotoReuse(licence) {
  return /^(?:CC0 1\.0|CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|PUBLIC DOMAIN(?: \([^)]+\))?|USED WITH PERMISSION)$/i.test(licence);
}

export function hasApprovedNewSpeciesPhoto(page, approval, actualPhotoSha256) {
  const hero = page?.hero;
  if (!hero || typeof hero !== "object" || !approval || typeof approval !== "object") return false;
  let photo;
  let source;
  let photoReviewEvidence;
  let rightsReviewEvidence;
  try {
    photo = new URL(hero.url);
    source = new URL(hero.sourcePage);
    photoReviewEvidence = new URL(approval.photoReviewEvidence);
    rightsReviewEvidence = new URL(approval.rightsReviewEvidence);
  } catch {
    return false;
  }
  const licence = String(approval.licence || "").trim();
  return photo.protocol === "https:" && /\.(?:avif|jpe?g|png|webp)$/i.test(photo.pathname) &&
    source.protocol === "https:" && photoReviewEvidence.protocol === "https:" && rightsReviewEvidence.protocol === "https:" &&
    page.slug === approval.slug && hero.url === approval.imageUrl && hero.sourcePage === approval.sourcePage &&
    String(hero.credit || "").trim() === String(approval.creator || "").trim() &&
    String(hero.licence || "").trim() === licence && permitsPhotoReuse(licence) &&
    /^[a-f0-9]{64}$/i.test(String(approval.photoSha256 || "")) &&
    String(actualPhotoSha256 || "").toLowerCase() === String(approval.photoSha256).toLowerCase();
}

export async function verifyApprovedNewSpeciesPhoto(
  slug,
  page,
  fetchImpl = fetch,
  approvedPhotos = APPROVED_NEW_SPECIES_PHOTOS,
) {
  const approval = approvedPhotos.get(slug);
  if (!approval || approval.slug !== slug) return false;
  try {
    const response = await fetchImpl(approval.imageUrl, {
      headers: { accept: "image/avif,image/jpeg,image/png,image/webp" },
      signal: AbortSignal.timeout(PHOTO_REVIEW_TIMEOUT_MS),
    });
    if (!response.ok || !/^image\/(?:avif|jpeg|png|webp)(?:;|$)/i.test(response.headers.get("content-type") || "")) return false;
    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > MAX_APPROVED_PHOTO_BYTES) return false;
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > MAX_APPROVED_PHOTO_BYTES) return false;
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const actualPhotoSha256 = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
    return hasApprovedNewSpeciesPhoto(page, approval, actualPhotoSha256);
  } catch {
    return false;
  }
}

function isProfilePathCandidate(pathname) {
  if (typeof pathname !== "string" || PUBLIC_NON_PROFILE_PATHS.has(pathname)) return false;
  return /^\/[^/.]+$/.test(pathname) ||
    /^\/+[a-z0-9]+(?:-[a-z0-9]+)*(?:\/+[a-z0-9]+(?:-[a-z0-9]+)*)*\/*$/.test(pathname);
}

function hasNonCanonicalIndexQuery(searchParams) {
  // Form decoders commonly express repeated/structured fields as preview[] or
  // draft[0]. Those are still preview/draft namespaces and must never inherit
  // the clean profile's indexable review state. Ordinary tracking keys remain
  // canonical-safe.
  return Array.from(searchParams.keys()).some((key) =>
    /^(?:preview|draft)(?:\[[^\]]*\])?$/i.test(key)
  );
}

function missingSpeciesProfile(method) {
  const headers = {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store, max-age=0, must-revalidate",
    "x-robots-tag": "noindex, nofollow, noarchive",
    "x-4species-index-gate": "review-unreviewed",
  };
  const body = method === "HEAD" ? null : "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex,nofollow,noarchive\"><title>Species profile not found — 4SPECIES</title></head><body><main><h1>No species profile exists at this address.</h1><p>Explore the source-backed species profiles that are currently available.</p><p><a href=\"/explore\">Explore species</a></p></main></body></html>";
  return new Response(body, { status: 404, headers });
}

export function publicSpeciesCanonical(pathname) {
  if (PUBLIC_NON_PROFILE_PATHS.has(pathname)) return `https://4species.com${pathname}`;
  if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)) return null;
  return `https://4species.com${pathname}`;
}

// Founder override, 2026-10-17: publish complete source-bearing original
// Claude premium profiles regardless of editorial draft label. Preserve
// DRAFT provenance honestly, do not confer Gold/REVIEWED approval.
export function permitsSpeciesIndexing(reviewState) {
  return reviewState === NON_PROFILE_REVIEW_STATE || reviewState === "REVIEWED" || reviewState === "DRAFT";
}

async function profileReviewResult(pathname, fetchImpl = fetch) {
  // Index authority belongs only to an exact canonical pathname. Never
  // collapse redundant slashes, remove dot segments, strip query/fragment
  // data or decode an encoded variant before making the review decision:
  // doing so can turn a malformed or alternate route into an allowlisted one.
  if (typeof pathname !== "string" || !pathname.startsWith("/") ||
      pathname.includes("?") || pathname.includes("#")) return { state: "UNREVIEWED", sourceAvailable: true };
  if (PUBLIC_NON_PROFILE_PATHS.has(pathname)) return { state: NON_PROFILE_REVIEW_STATE, sourceAvailable: true };
  if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)) return { state: "UNREVIEWED", sourceAvailable: true };
  const slug = pathname.slice(1);
  const existingPublicProfile = CURRENT_PUBLIC_SPECIES_SLUGS.has(slug);
  try {
    const response = await fetchImpl(`${SPECIES_V53_ORIGIN}${PROFILE_DATA_PREFIX}${encodeURIComponent(slug)}.json`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(PROFILE_REVIEW_TIMEOUT_MS),
    });
    if (!response.ok) return { state: "UNREVIEWED", sourceAvailable: !existingPublicProfile };
    const page = await response.json();
    // A search-visible species must have real canonical profile data and
    // source-linked claims in Claude's original 4PLANET_SPECIES_PAGE_01.
    if (page?.schema !== "4PLANET_SPECIES_PAGE_01" || page?.slug !== slug ||
        !page?.identity?.scientificName || !page?.identity?.commonName) {
      return { state: "UNREVIEWED", sourceAvailable: !existingPublicProfile };
    }
    const containsSource = (value) => {
      if (!value || typeof value !== "object") return false;
      if (value.source?.url?.startsWith?.("https://")) return true;
      return Object.values(value).some(containsSource);
    };
    if (!containsSource(page)) return { state: "UNREVIEWED", sourceAvailable: !existingPublicProfile };
    if (!existingPublicProfile &&
        (!FOUNDER_AUTHORISED_NEW_PROFILE_BATCH.has(slug) ||
          !await verifyApprovedNewSpeciesPhoto(slug, page, fetchImpl))) {
      return { state: "UNREVIEWED", sourceAvailable: true };
    }
    return {
      state: page.provenance?.review === "REVIEWED" ? "REVIEWED" : "DRAFT",
      sourceAvailable: true,
    };
  } catch {
    return { state: "UNREVIEWED", sourceAvailable: !existingPublicProfile };
  }
}

export async function profileReviewState(pathname, fetchImpl = fetch) {
  return (await profileReviewResult(pathname, fetchImpl)).state;
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

function unavailableSpeciesSitemap(method) {
  return new Response(method === "HEAD" ? null : "Species sitemap source temporarily unavailable", {
    status: 503,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store, max-age=0, must-revalidate",
      "x-robots-tag": "noindex, nofollow, noarchive",
      "x-4species-index-gate": "source-unavailable",
    },
  });
}

function completeSpeciesSitemapBlocks(xml) {
  if (typeof xml !== "string") return null;
  const document = xml.trim();
  if (!/^(?:<\?xml[\s\S]*?\?>\s*)?<urlset(?:\s[^>]*)?>[\s\S]*<\/urlset>$/.test(document)) return null;
  const openingUrls = document.match(/<url(?:\s|>)/g) || [];
  const blocks = document.match(/<url(?:\s[^>]*)?>[\s\S]*?<\/url>/g) || [];
  if (!blocks.length || blocks.length !== openingUrls.length) return null;

  const publicSlugs = new Set();
  for (const block of blocks) {
    const locations = [...block.matchAll(/<loc>([^<]+)<\/loc>/g)];
    if (locations.length !== 1) return null;
    let pathname;
    try {
      pathname = new URL(locations[0][1]).pathname.replace(/\/+$/, "") || "/";
    } catch {
      return null;
    }
    const slugPath = pathname.startsWith("/species/") ? pathname.replace(/^\/species\//, "/") : pathname;
    const slug = slugPath.match(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)$/)?.[1];
    if (slug && CURRENT_PUBLIC_SPECIES_SLUGS.has(slug)) publicSlugs.add(slug);
  }

  // This is a source-integrity preservation baseline, not an editorial Gold
  // award. Each entry still has to pass the independent profile review below.
  return [...CURRENT_PUBLIC_SPECIES_SLUGS].every((slug) => publicSlugs.has(slug)) ? blocks : null;
}

function isSchemaValidEmittedSpeciesSitemap(body, expectedEntries) {
  if (typeof body !== "string" || !/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset\b[^>]*>[\s\S]*<\/urlset>\n$/.test(body)) return false;
  const openingTags = body.match(/<url(?:\s[^>]*)?>/g) || [];
  if (openingTags.length !== expectedEntries || openingTags.some((tag) => tag !== "<url>")) return false;
  const blocks = body.match(/<url>[\s\S]*?<\/url>/g) || [];
  if (blocks.length !== expectedEntries) return false;
  return blocks.every((block) => {
    const locations = [...block.matchAll(/<loc>([^<]+)<\/loc>/g)];
    return locations.length === 1 && /^https:\/\/4species\.com\/(?:|[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(locations[0][1]);
  });
}

async function reviewedSpeciesSitemap(request) {
  let xml;
  try {
    const upstream = await fetch(`${SPECIES_V53_ORIGIN}/species-sitemap.xml`, {
      method: "GET",
      headers: { accept: "application/xml,text/xml" },
      signal: AbortSignal.timeout(SITEMAP_SOURCE_TIMEOUT_MS),
    });
    if (!upstream.ok) return unavailableSpeciesSitemap(request.method);
    xml = await upstream.text();
  } catch {
    return unavailableSpeciesSitemap(request.method);
  }
  const blocks = completeSpeciesSitemapBlocks(xml);
  if (!blocks) return unavailableSpeciesSitemap(request.method);
  const reviewedBlocks = await mapWithConcurrency(blocks, SITEMAP_REVIEW_CONCURRENCY, async (block) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1];
    if (!loc) return { block: null, sourceAvailable: true };
    let slugPath;
    try {
      const pathname = new URL(loc).pathname.replace(/\/+$/, "") || "/";
      slugPath = pathname.startsWith("/species/") ? pathname.replace(/^\/species\//, "/") : pathname;
    } catch { return { block: null, sourceAvailable: true }; }
    if (!/^\/[a-z0-9-]*$/.test(slugPath)) return { block: null, sourceAvailable: true };
    const reviewResult = await profileReviewResult(slugPath);
    if (!reviewResult.sourceAvailable) return { block: null, sourceAvailable: false };
    const review = reviewResult.state;
    if (!permitsSpeciesIndexing(review)) return { block: null, sourceAvailable: true };
    // Avoid publishing any v53 preview-domain URL or obsolete /species/ aliases.
    const canonical = "https://4species.com" + slugPath;
    return {
      block: block
        .replace(/^<url(?:\s[^>]*)?>/, "<url>")
        .replace(/<loc>[^<]+<\/loc>/, "<loc>" + canonical + "</loc>"),
      sourceAvailable: true,
    };
  });
  if (reviewedBlocks.some((result) => !result.sourceAvailable)) {
    return unavailableSpeciesSitemap(request.method);
  }
  const kept = reviewedBlocks.map((result) => result.block).filter(Boolean);
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${kept.join("\n")}\n</urlset>\n`;
  if (!isSchemaValidEmittedSpeciesSitemap(body, kept.length)) {
    return unavailableSpeciesSitemap(request.method);
  }
  return new Response(request.method === "HEAD" ? null : body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=300, must-revalidate",
      "x-4species-index-gate": "human-review-v1",
    },
  });
}

async function proxySpeciesV53(request) {
  if (request.method !== "GET" && request.method !== "HEAD")
    return new Response("Method not allowed", {status:405});
  const incoming = new URL(request.url);
  if (incoming.pathname === "/species-sitemap.xml") return reviewedSpeciesSitemap(request);
  const target = new URL(incoming.pathname+incoming.search, SPECIES_V53_ORIGIN);
  // Preview and draft variants are not canonical public profiles. Include the
  // query in the review key so profileReviewState rejects it before the
  // canonical/index headers can be inherited from the clean pathname.
  const reviewKey = hasNonCanonicalIndexQuery(incoming.searchParams)
    ? incoming.pathname + incoming.search
    : incoming.pathname;
  const reviewState = await profileReviewState(reviewKey);
  // The immutable SPA origin serves its application shell with HTTP 200 even
  // when no source-bearing profile exists. Fail closed at the public edge so
  // crawlers and people receive a real not-found response instead of a soft 404.
  if (reviewState === "UNREVIEWED" && isProfilePathCandidate(incoming.pathname)) {
    return missingSpeciesProfile(request.method);
  }
  const headers = new Headers();
  for(const name of ["accept","accept-language","user-agent"]) {
    const value = request.headers.get(name); if(value) headers.set(name,value);
  }
  const upstream = await fetch(target.toString(), {method:request.method,headers,redirect:"follow"});
  const out = new Headers(upstream.headers);
  const canonical = permitsSpeciesIndexing(reviewState) ? publicSpeciesCanonical(incoming.pathname) : null;
  out.delete("set-cookie");
  out.delete("content-length");
  out.delete("content-encoding");
  out.set("x-4species-release", "species-v53-immutable-72494005-restore-20261017");
  if (canonical) out.set("link", `<${canonical}>; rel="canonical"`);
  // Pages preview emits preview-only noindex; never forward it to a completed
  // public Claude profile, while still enforcing noindex for missing profiles.
  if (permitsSpeciesIndexing(reviewState)) out.delete("x-robots-tag");
  if((out.get("content-type")||"").includes("text/html")) {
    // v53 is a versioned SPA: a stale HTML shell can reference JS hashes
    // removed by the next Pages deploy and leave iOS browsers on a blank page.
    // Do not cache HTML; bundled assets remain versioned and cacheable.
    out.set("cache-control", "no-store, max-age=0, must-revalidate");
    for (const name of ["etag", "last-modified", "expires"]) out.delete(name);
    const csp = out.get("content-security-policy");
    if (csp && !/(?:^|;)\s*frame-src\b/i.test(csp)) {
      out.set("content-security-policy", csp.replace(/;?\s*$/, "") +
        "; frame-src 'self' https://4planetatlas.com https://www.4planetatlas.com");
    }
    out.set("x-4species-html-cache", "no-store-v53-hotfix");
    if (!permitsSpeciesIndexing(reviewState)) {
      out.set("x-robots-tag", "noindex, nofollow, noarchive");
      out.set("x-4species-index-gate", `review-${reviewState.toLowerCase()}`);
    }
  }
  let response = new Response(request.method==="HEAD"?null:upstream.body, {status:upstream.status,statusText:upstream.statusText,headers:out});
  if (request.method === "GET" && canonical && (out.get("content-type")||"").includes("text/html")) {
    response = new HTMLRewriter()
      .on('link[rel="canonical"]', { element(el) { el.remove(); } })
      .on('meta[property="og:url"]', { element(el) { el.setAttribute("content", canonical); } })
      .on("head", { element(el) { el.append(`<link rel="canonical" href="${canonical}">`, { html: true }); } })
      .transform(response);
  }
  if (request.method === "GET" && !permitsSpeciesIndexing(reviewState) && (out.get("content-type")||"").includes("text/html")) {
    return new HTMLRewriter()
      .on('meta[name="robots"]', { element(el) { el.setAttribute("content", "noindex,nofollow,noarchive"); } })
      .on("head", { element(el) { el.append('<meta name="googlebot" content="noindex,nofollow,noarchive">', { html: true }); } })
      .transform(response);
  }
  if ((incoming.pathname === "/" || incoming.pathname === "") && request.method === "GET" && (out.get("content-type")||"").includes("text/html")) {
    return new HTMLRewriter()
      .on("body", { element(el) { el.append('<a class="wild-orca-play" href="https://4planet.org/games" data-wild-orca-cta style="position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:2147483000;padding:11px 16px;border-radius:999px;background:#08181c;color:#f6ffff;border:1px solid rgba(230,255,255,.22);box-shadow:0 8px 28px rgba(0,0,0,.25);font:800 11px/1 ui-sans-serif,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;letter-spacing:.06em;text-decoration:none">Play WILD: ORCA</a>', { html: true }); } })
      .transform(response);
  }
  return response;
}

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
    .on('head', { element(el) { el.prepend('<script src="/__species_oak/boot.js"></script>', { html: true }); } })
    .on('title', { element(el) { el.setInnerContent('English oak — SPECIES'); } })
    .on('script[src]', { element(el) { rewriteAsset(el, 'src'); } })
    .on('link[href]', { element(el) { rewriteAsset(el, 'href'); } })
    .transform(new Response(upstream.body, { status: upstream.status, headers }));
}

async function serveEnglishOakAsset(request, pathname) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
  const relative = pathname.slice(OAK_PREFIX.length);
  if (relative === 'boot.js') {
    const script = proofBootScript('english-oak','English oak');
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

    // Canonical clean public URLs: root homepage and /{species-slug}.
    // Legacy /species/{slug} redirects to exactly one canonical URL.
    if (path === "/species" || path === "/species/") return redirect("https://4species.com/explore" + url.search, 301);
    if (/^\/species\/[^/]+\/?$/.test(path)) {
      const slug = path.split("/").filter(Boolean)[1];
      return redirect("https://4species.com/" + encodeURIComponent(slug) + url.search, 301);
    }
    if (/^\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(path))
      return redirect(`https://4species.com${path.slice(0, -1)}${url.search}`, 308);
    if (path === "/labs/species" || path === "/labs/species/")
      return redirect("https://4species.com/" + url.search, 301);
    if (path.startsWith("/labs/species/")) {
      const rest = path.slice("/labs/species/".length);
      return redirect("https://4species.com/" + rest + url.search, 301);
    }
    if (path === "/atlas" || path.startsWith("/atlas/"))
      return redirect("https://4planetatlas.com/" + url.search, 308);
    if (path.startsWith("/.well-known/")) return proxyRaw(request,path);
    if (path.startsWith("/api/")) {
      // v53 Pages carries the matching public Species/ATLAS API. The legacy
      // 4PLANET Pages origin returns HTML and breaks Safari JSON fetching.
      return request.method === "GET" || request.method === "HEAD"
        ? proxySpeciesV53(request) : proxyRaw(request,path);
    }
    if (path === "/robots.txt")
      return new Response("User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://4species.com/sitemap.xml\n", {headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=300"}});
    if (path === "/sitemap.xml") return reviewedSpeciesSitemap(request);
    if (path === `/${INDEXNOW_KEY}.txt`) return new Response(INDEXNOW_KEY, {
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" }
    });
    return proxySpeciesV53(request);

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

    const proofResult = await handleSpeciesProof(request,path,SPECIES_V51_PREVIEW_ORIGIN);
    if (proofResult) return proofResult;
    if (path === "/species/english-oak" || path === "/species/english-oak/") return redirect("https://4species.com/english-oak",302);
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

