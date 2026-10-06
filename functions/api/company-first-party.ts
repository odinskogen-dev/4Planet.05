/**
 * GET /api/company-first-party?orgnr={9 digits}
 *
 * Rights-safe first-party source discovery. The official website is taken from
 * the exact BRREG legal-entity record, never from a user supplied URL. Returned
 * text is treated as company-published material / claim context, not independent fact.
 */

interface PagesContext { request: Request; }

const BRREG = "https://data.brreg.no/enhetsregisteret/api/enheter/";
const ORG = /^\d{9}$/;
const MAX_LINKS = 12;
const MAX_FETCHED_PAGES = 6;
const KEYWORDS = [
  "investor","investors","ir","annual","report","reports","sustainability","esg",
  "product","products","service","services","news","press","media","strategy","about",
  "investor-relations","arsrapport","årsrapport","bærekraft","baerekraft","nyheter",
];

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=1800",
    "x-content-type-options": "nosniff",
  },
});

const clean = (value: unknown, max = 500) =>
  typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&#39;/g, "'").replace(/&quot;/gi, '"').replace(/\s+/g, " ").trim().slice(0, max) : "";

function safeWebsite(raw: unknown): URL | null {
  const value = clean(raw, 320);
  if (!value) return null;
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    if (!host || host === "localhost" || host.endsWith(".localhost")) return null;
    if (/^(?:127\.|0\.|10\.|192\.168\.|169\.254\.)/.test(host)) return null;
    if (/^172\.(?:1[6-9]|2\d|3[01])\./.test(host)) return null;
    if (host === "::1" || host.startsWith("fc") || host.startsWith("fd")) return null;
    return url;
  } catch {
    return null;
  }
}

function rootHost(host: string) {
  return host.toLowerCase().replace(/^www\./, "");
}

function sameCompanyHost(a: URL, b: URL) {
  const x = rootHost(a.hostname);
  const y = rootHost(b.hostname);
  return x === y || x.endsWith("." + y) || y.endsWith("." + x);
}

function htmlMeta(html: string, url: string) {
  const title = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "", 240);
  const description =
    clean(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || "", 500) ||
    clean(html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] || "", 500) ||
    clean(html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] || "", 500);
  const h1 = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "", 280);
  return { url, title: title || null, description: description || null, h1: h1 || null };
}

function discoverLinks(html: string, base: URL) {
  const found: Array<{ url: string; label: string; category: string }> = [];
  const seen = new Set<string>();
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) && found.length < 80) {
    try {
      const url = new URL(match[1], base);
      if (!["http:", "https:"].includes(url.protocol) || !sameCompanyHost(url, base)) continue;
      url.hash = "";
      const label = clean(match[2], 180);
      const haystack = (url.pathname + " " + label).toLowerCase();
      const keyword = KEYWORDS.find((word) => haystack.includes(word));
      if (!keyword) continue;
      const canonical = url.toString();
      if (seen.has(canonical)) continue;
      seen.add(canonical);
      found.push({ url: canonical, label: label || url.pathname, category: keyword.toUpperCase() });
    } catch {
      // Ignore malformed links.
    }
  }
  return found.slice(0, MAX_LINKS);
}

async function fetchHtml(url: URL) {
  try {
    const response = await fetch(url.toString(), {
      headers: {
        accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        "user-agent": "4PLANET/1.0 public-company-source-discovery (https://4planet.org)",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(7000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return { state: "HTTP_ERROR" as const, url: url.toString(), html: "" };
      const next = safeWebsite(new URL(location, url).toString());
      if (!next || !sameCompanyHost(url, next)) return { state: "REDIRECT_BLOCKED" as const, url: url.toString(), html: "" };
      const redirected = await fetch(next.toString(), {
        headers: { accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5", "user-agent": "4PLANET/1.0 public-company-source-discovery (https://4planet.org)" },
        redirect: "manual",
        signal: AbortSignal.timeout(7000),
      });
      if (!redirected.ok) return { state: "HTTP_ERROR" as const, url: next.toString(), html: "" };
      const type = redirected.headers.get("content-type") || "";
      if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) return { state: "NON_HTML" as const, url: next.toString(), html: "" };
      return { state: "READY" as const, url: next.toString(), html: (await redirected.text()).slice(0, 1_200_000) };
    }
    if (!response.ok) return { state: "HTTP_ERROR" as const, url: url.toString(), html: "" };
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) return { state: "NON_HTML" as const, url: url.toString(), html: "" };
    return { state: "READY" as const, url: url.toString(), html: (await response.text()).slice(0, 1_200_000) };
  } catch {
    return { state: "SOURCE_UNAVAILABLE" as const, url: url.toString(), html: "" };
  }
}

export const onRequestGet = async ({ request }: PagesContext): Promise<Response> => {
  const url = new URL(request.url);
  const orgnr = clean(url.searchParams.get("orgnr"), 20);
  if (!ORG.test(orgnr)) return json({ ok: false, error: "VALID_ORGNR_REQUIRED" }, 400);

  let entityResponse: Response;
  try {
    entityResponse = await fetch(BRREG + orgnr, {
      headers: { accept: "application/vnd.brreg.enhetsregisteret.enhet.v2+json", "user-agent": "4PLANET/1.0 (https://4planet.org)" },
      signal: AbortSignal.timeout(7000),
    });
  } catch {
    return json({ ok: false, error: "BRREG_SOURCE_UNAVAILABLE" }, 503);
  }
  if (!entityResponse.ok) return json({ ok: false, error: `BRREG_ENTITY_${entityResponse.status}` }, entityResponse.status === 404 ? 404 : 502);
  const entity = await entityResponse.json() as any;
  if (clean(entity?.organisasjonsnummer, 20) !== orgnr) return json({ ok: false, error: "ENTITY_IDENTITY_MISMATCH" }, 502);

  const homepage = safeWebsite(entity?.hjemmeside);
  if (!homepage) {
    return json({
      ok: true,
      state: "NO_REGISTERED_WEBSITE",
      company: { organizationNumber: orgnr, name: clean(entity?.navn, 240) || null },
      source: { publisher: "Brønnøysundregistrene", url: BRREG + orgnr },
      pages: [],
      links: [],
      truthBoundary: "No official website was accepted because the exact BRREG entity record did not provide a usable public website. 4BRANDS does not guess a domain from the company name.",
    });
  }

  const home = await fetchHtml(homepage);
  if (home.state !== "READY") {
    return json({
      ok: true,
      state: home.state,
      company: { organizationNumber: orgnr, name: clean(entity?.navn, 240) || null, registeredWebsite: homepage.toString() },
      pages: [],
      links: [],
      truthBoundary: "The website is registered by the company in BRREG, but failure to fetch it does not establish anything about the business.",
    });
  }

  const effectiveHome = new URL(home.url);
  const links = discoverLinks(home.html, effectiveHome);
  const selected = links.slice(0, MAX_FETCHED_PAGES);
  const pageResults = await Promise.all(selected.map(async (item) => {
    const result = await fetchHtml(new URL(item.url));
    return result.state === "READY"
      ? { ...htmlMeta(result.html, result.url), category: item.category, state: "READY" as const }
      : { url: item.url, title: item.label || null, description: null, h1: null, category: item.category, state: result.state };
  }));

  return json({
    ok: true,
    state: "FIRST_PARTY_SOURCE_MAP",
    company: {
      organizationNumber: orgnr,
      name: clean(entity?.navn, 240) || null,
      registeredWebsite: homepage.toString(),
    },
    homepage: { ...htmlMeta(home.html, home.url), state: "READY" },
    links,
    pages: pageResults,
    source: {
      identityPublisher: "Brønnøysundregistrene",
      identityUrl: BRREG + orgnr,
      websiteAuthority: "BRREG_REGISTERED_WEBSITE",
      retrievedAt: new Date().toISOString(),
    },
    truthBoundary: "Website titles, descriptions, headings and linked materials are first-party company-published context / claims. They are not independently verified facts unless corroborated by another source.",
  });
};

export const onRequest = async (ctx: PagesContext) =>
  ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
