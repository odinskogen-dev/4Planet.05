/**
 * GET /api/company-eu-projects?orgnr={9 digits}
 *
 * Public CORDIS/EURIO research-project intelligence. Company identity is first
 * resolved from the exact BRREG entity; the SPARQL query uses that legal name.
 * An exact name match is required before a CORDIS organisation record is joined.
 */

interface PagesContext { request: Request; }

const BRREG = "https://data.brreg.no/enhetsregisteret/api/enheter/";
const CORDIS_SPARQL = "https://cordis.europa.eu/datalab/sparql";
const ORG = /^\d{9}$/;
const MAX_RESULTS = 24;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=1800",
    "x-content-type-options": "nosniff",
  },
});

const clean = (value: unknown, max = 500) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";

const sparqlString = (value: string) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, " ");

function bindingValue(row: any, key: string) {
  return clean(row?.[key]?.value, 600) || null;
}

export const onRequestGet = async ({ request }: PagesContext): Promise<Response> => {
  const url = new URL(request.url);
  const orgnr = clean(url.searchParams.get("orgnr"), 20);
  if (!ORG.test(orgnr)) return json({ ok: false, error: "VALID_ORGNR_REQUIRED" }, 400);

  let entity: any;
  try {
    const response = await fetch(BRREG + orgnr, {
      headers: { accept: "application/vnd.brreg.enhetsregisteret.enhet.v2+json", "user-agent": "4PLANET/1.0 (https://4planet.org)" },
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return json({ ok: false, error: `BRREG_ENTITY_${response.status}` }, response.status === 404 ? 404 : 502);
    entity = await response.json();
  } catch {
    return json({ ok: false, error: "BRREG_SOURCE_UNAVAILABLE" }, 503);
  }

  if (clean(entity?.organisasjonsnummer, 20) !== orgnr) return json({ ok: false, error: "ENTITY_IDENTITY_MISMATCH" }, 502);
  const legalName = clean(entity?.navn, 240);
  if (!legalName) return json({ ok: false, error: "LEGAL_NAME_UNAVAILABLE" }, 502);

  const literal = sparqlString(legalName.toLowerCase());
  const query = `PREFIX eurio: <http://data.europa.eu/s66#>
SELECT DISTINCT ?project ?id ?title ?start ?end ?orgName ?funding
WHERE {
  ?project a eurio:Project ;
           eurio:identifier ?id ;
           eurio:title ?title ;
           eurio:hasInvolvedParty ?role .
  ?role eurio:isRoleOf ?organisation .
  ?organisation eurio:legalName ?orgName .
  OPTIONAL { ?project eurio:startDate ?start . }
  OPTIONAL { ?project eurio:endDate ?end . }
  OPTIONAL {
    ?role eurio:isRecipientOf ?grant .
    ?grant eurio:hasPaymentAmount ?payment .
    ?payment eurio:value ?funding .
  }
  FILTER(LCASE(STR(?orgName)) = "${literal}")
}
ORDER BY DESC(?start)
LIMIT ${MAX_RESULTS}`;

  try {
    const response = await fetch(CORDIS_SPARQL, {
      method: "POST",
      headers: {
        accept: "application/sparql-results+json",
        "content-type": "application/x-www-form-urlencoded; charset=utf-8",
        "user-agent": "4PLANET/1.0 public-company-intelligence (https://4planet.org)",
      },
      body: new URLSearchParams({ query, format: "application/sparql-results+json" }).toString(),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return json({ ok: false, error: `CORDIS_UPSTREAM_${response.status}` }, 502);
    const payload = await response.json() as any;
    const rows = Array.isArray(payload?.results?.bindings) ? payload.results.bindings : [];
    const projects = rows.map((row: any) => {
      const id = bindingValue(row, "id");
      const title = bindingValue(row, "title");
      const orgName = bindingValue(row, "orgName");
      if (!id || !title || !orgName || orgName.trim().toLowerCase() !== legalName.toLowerCase()) return null;
      const fundingRaw = bindingValue(row, "funding");
      const funding = fundingRaw !== null && Number.isFinite(Number(fundingRaw)) ? Number(fundingRaw) : null;
      return {
        id,
        title,
        startDate: bindingValue(row, "start"),
        endDate: bindingValue(row, "end"),
        organisationName: orgName,
        fundingAmount: funding,
        sourceUrl: `https://cordis.europa.eu/project/id/${encodeURIComponent(id)}`,
      };
    }).filter(Boolean);

    return json({
      ok: true,
      state: projects.length ? "EXACT_LEGAL_NAME_PROJECTS" : "NO_EXACT_MATCH",
      company: { organizationNumber: orgnr, legalName },
      projects,
      source: {
        publisher: "CORDIS / European Commission",
        product: "EURIO Knowledge Graph public SPARQL endpoint",
        endpoint: CORDIS_SPARQL,
        retrievedAt: new Date().toISOString(),
        identityRule: "EXACT_CASE_INSENSITIVE_LEGAL_NAME_AFTER_BRREG_RESOLUTION",
      },
      truthBoundary: "CORDIS participation is evidence of an EU research-project relationship for an organisation with the exact legal name. Funding amounts, when present, are source values attached to the CORDIS role/grant model; they are not automatically company revenue, cash received, profit or current funding availability.",
    });
  } catch (error) {
    return json({ ok: false, error: "CORDIS_SOURCE_UNAVAILABLE", detail: error instanceof Error ? error.message : "CORDIS query unavailable" }, 503);
  }
};

export const onRequest = async (ctx: PagesContext) =>
  ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
