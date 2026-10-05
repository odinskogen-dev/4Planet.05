import { fetchBrregExact, BRREG_API_BASE } from "../../products/4sapien/supabase/functions/_shared/brreg";

interface PagesContext { request: Request; }

type SourceState = "READY" | "NO_MATCH" | "SOURCE_UNAVAILABLE" | "SOURCE_HTTP_ERROR" | "NOT_APPLICABLE";

type SourceRecord = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  retrievedAt: string;
  state: SourceState;
  note: string;
};

const ACCOUNTS_BASE = "https://data.brreg.no/regnskapsregisteret/regnskap/aarsregnskap";
const FINANCIALS_BASE = "https://data.brreg.no/regnskapsregisteret/regnskap";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=900",
    "x-content-type-options": "nosniff",
  },
});

const clean = (value: unknown, max = 320) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";

const asBool = (value: unknown) => value === true;
const asNumber = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;

function normaliseAddress(value: any) {
  if (!value || typeof value !== "object") return null;
  const lines = Array.isArray(value.adresse) ? value.adresse.map((x: unknown) => clean(x, 180)).filter(Boolean) : [];
  const postnummer = clean(value.postnummer, 12);
  const poststed = clean(value.poststed, 100);
  const kommune = clean(value.kommune, 120);
  const land = clean(value.land, 120);
  const landkode = clean(value.landkode, 12);
  if (!lines.length && !postnummer && !poststed && !kommune && !land && !landkode) return null;
  return { lines, postnummer: postnummer || null, poststed: poststed || null, kommune: kommune || null, land: land || null, landkode: landkode || null };
}

async function fetchJson(url: string, accept = "application/json") {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept, "user-agent": "4PLANET/1.0 (https://4planet.org)" },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return { state: "SOURCE_UNAVAILABLE" as SourceState, payload: null as any, status: 0 };
  }
  if (response.status === 404) return { state: "NO_MATCH" as SourceState, payload: null as any, status: 404 };
  if (!response.ok) return { state: "SOURCE_HTTP_ERROR" as SourceState, payload: null as any, status: response.status };
  try {
    return { state: "READY" as SourceState, payload: await response.json(), status: response.status };
  } catch {
    return { state: "SOURCE_HTTP_ERROR" as SourceState, payload: null as any, status: response.status };
  }
}

function extractEmbeddedArray(payload: any, preferred: string[] = []) {
  if (Array.isArray(payload)) return payload;
  const embedded = payload?._embedded;
  if (embedded && typeof embedded === "object") {
    for (const key of preferred) if (Array.isArray(embedded[key])) return embedded[key];
    const first = Object.values(embedded).find(Array.isArray);
    if (Array.isArray(first)) return first;
  }
  for (const key of preferred) if (Array.isArray(payload?.[key])) return payload[key];
  return [];
}

function personName(person: any) {
  const navn = person?.navn || {};
  return [clean(navn.fornavn, 100), clean(navn.mellomnavn, 100), clean(navn.etternavn, 120)].filter(Boolean).join(" ");
}

function normaliseRoles(payload: any) {
  const groups = Array.isArray(payload?.rollegrupper) ? payload.rollegrupper : [];
  const rows: any[] = [];
  for (const group of groups) {
    const groupCode = clean(group?.type?.kode, 30) || "ROLE";
    const groupLabel = clean(group?.type?.beskrivelse, 160) || groupCode;
    for (const role of Array.isArray(group?.roller) ? group.roller : []) {
      const roleCode = clean(role?.type?.kode, 30) || "ROLE";
      const roleLabel = clean(role?.type?.beskrivelse, 160) || roleCode;
      const person = personName(role?.person);
      const entityName = clean(role?.enhet?.navn, 220);
      const entityNumber = clean(role?.enhet?.organisasjonsnummer, 20);
      const name = person || entityName;
      if (!name) continue;
      rows.push({
        groupCode,
        groupLabel,
        roleCode,
        roleLabel,
        name,
        subjectType: person ? "PERSON" : "ENTITY",
        entityOrganizationNumber: entityNumber || null,
        sequence: typeof role?.rekkefolge === "number" ? role.rekkefolge : null,
        lastChanged: clean(group?.sistEndret, 30) || null,
      });
    }
  }
  return rows.slice(0, 80);
}

function flattenGroup(node: any, depth = 0, output: any[] = []) {
  if (!node || typeof node !== "object") return output;
  if (depth > 0) {
    const orgnr = clean(node.organisasjonsnummer, 20);
    const name = clean(node.navn, 240);
    if (orgnr && name) output.push({
      level: typeof node.nivaa === "number" ? node.nivaa : depth,
      name,
      organizationNumber: orgnr,
      parentName: clean(node.parentNavn, 240) || null,
      parentOrganizationNumber: clean(node.parentOrganisasjonsnummer, 20) || null,
      relationshipCode: clean(node?.knytningsform?.kode, 40) || null,
      relationship: clean(node?.knytningsform?.beskrivelse, 160) || null,
      basis: clean(node.grunnlag, 120) || null,
      date: clean(node.dato, 30) || null,
      organizationForm: clean(node?.organisasjonsform?.kode, 30) || null,
    });
  }
  for (const child of Array.isArray(node.children) ? node.children : []) flattenGroup(child, depth + 1, output);
  return output;
}

function normaliseSubunits(payload: any) {
  return extractEmbeddedArray(payload, ["underenheter"]).map((row: any) => ({
    organizationNumber: clean(row?.organisasjonsnummer, 20),
    name: clean(row?.navn, 240),
    employees: asNumber(row?.antallAnsatte),
    industryCode: clean(row?.naeringskode1?.kode, 40) || null,
    industry: clean(row?.naeringskode1?.beskrivelse, 240) || null,
    address: normaliseAddress(row?.beliggenhetsadresse ?? row?.forretningsadresse),
    startDate: clean(row?.oppstartsdato, 30) || null,
    endDate: clean(row?.nedleggelsesdato ?? row?.slettedato, 30) || null,
    sourceUrl: row?._links?.self?.href || (row?.organisasjonsnummer ? `${BRREG_API_BASE}/underenheter/${row.organisasjonsnummer}` : null),
  })).filter((row: any) => /^\d{9}$/.test(row.organizationNumber) && row.name).slice(0, 60);
}

function normaliseUpdates(payload: any) {
  return extractEmbeddedArray(payload, ["oppdaterteEnheter", "oppdateringer", "enheter"]).map((row: any) => {
    const changes = Array.isArray(row?.endringer) ? row.endringer : Array.isArray(row?.changes) ? row.changes : [];
    return {
      id: String(row?.oppdateringsid ?? row?.id ?? ""),
      organizationNumber: clean(row?.organisasjonsnummer, 20) || null,
      timestamp: clean(row?.dato ?? row?.tidspunkt ?? row?.lastChanged ?? row?.updatedAt, 50) || null,
      changes: changes.slice(0, 20).map((change: any) => ({
        field: clean(change?.felt ?? change?.field ?? change?.navn, 120) || "REGISTER CHANGE",
        oldValue: clean(change?.gammelVerdi ?? change?.oldValue, 240) || null,
        newValue: clean(change?.nyVerdi ?? change?.newValue, 240) || null,
      })),
    };
  }).filter((row: any) => row.id || row.timestamp || row.changes.length).slice(0, 30);
}

function normaliseAccountYears(payload: any): string[] {
  const candidates: unknown[] = Array.isArray(payload) ? payload :
    Array.isArray(payload?.aar) ? payload.aar :
    Array.isArray(payload?.years) ? payload.years :
    Array.isArray(payload?.tilgjengeligeAar) ? payload.tilgjengeligeAar : [];
  return Array.from(new Set(candidates.map((value) => clean(String(value), 10)).filter((value) => /^20\d{2}$|^19\d{2}$/.test(value)))).sort().reverse();
}

function normaliseFinancials(payload: any, orgnr: string) {
  const row = Array.isArray(payload) ? payload[0] : payload?._embedded?.regnskap?.[0] ?? payload?.regnskap?.[0] ?? null;
  if (!row) return null;
  const returnedOrg = clean(row?.virksomhet?.organisasjonsnummer, 20);
  if (returnedOrg && returnedOrg !== orgnr) return null;
  const numberOrNull = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
  const revenue = numberOrNull(row?.resultatregnskapResultat?.driftsresultat?.driftsinntekter?.sumDriftsinntekter);
  const operatingResult = numberOrNull(row?.resultatregnskapResultat?.driftsresultat?.driftsresultat);
  const assets = numberOrNull(row?.eiendeler?.sumEiendeler);
  const equity = numberOrNull(row?.egenkapitalGjeld?.egenkapital?.sumEgenkapital);
  return {
    periodStart: clean(row?.regnskapsperiode?.fraDato, 30) || null,
    periodEnd: clean(row?.regnskapsperiode?.tilDato, 30) || null,
    currency: clean(row?.valuta, 12) || "NOK",
    revenue,
    operatingResult,
    annualResult: numberOrNull(row?.resultatregnskapResultat?.aarsresultat),
    resultBeforeTax: numberOrNull(row?.resultatregnskapResultat?.ordinaertResultatFoerSkattekostnad),
    assets,
    equity,
    debt: numberOrNull(row?.egenkapitalGjeld?.gjeldOversikt?.sumGjeld),
    operatingMargin: revenue !== null && operatingResult !== null && revenue !== 0 ? operatingResult / revenue : null,
    equityRatio: assets !== null && equity !== null && assets !== 0 ? equity / assets : null,
    truthClass: "FACT" as const,
  };
}

function buildCompany(raw: any, exact: any) {
  const historicalNames = (Array.isArray(raw?.historiskeNavn) ? raw.historiskeNavn : []).map((item: any) => ({
    name: clean(item?.navn, 240),
    from: clean(item?.fraDato, 30) || null,
    to: clean(item?.tilDato, 30) || null,
  })).filter((item: any) => item.name);

  const industries = [raw?.naeringskode1, raw?.naeringskode2, raw?.naeringskode3].map((item: any) => ({
    code: clean(item?.kode, 40),
    description: clean(item?.beskrivelse, 240),
  })).filter((item: any) => item.code || item.description);

  return {
    organizationNumber: exact.organizationNumber,
    name: exact.entityName,
    organizationForm: {
      code: clean(raw?.organisasjonsform?.kode, 30) || exact.organizationForm,
      description: clean(raw?.organisasjonsform?.beskrivelse, 180) || null,
    },
    registeredDate: clean(raw?.registreringsdatoEnhetsregisteret, 30) || exact.registeredDate,
    foundationDate: clean(raw?.stiftelsesdato, 30) || null,
    website: clean(raw?.hjemmeside, 300) || null,
    employees: asNumber(raw?.antallAnsatte),
    industries,
    institutionalSector: raw?.institusjonellSektorkode ? {
      code: clean(raw.institusjonellSektorkode.kode, 40) || null,
      description: clean(raw.institusjonellSektorkode.beskrivelse, 220) || null,
    } : null,
    businessAddress: normaliseAddress(raw?.forretningsadresse),
    postalAddress: normaliseAddress(raw?.postadresse),
    lastSubmittedAccounts: clean(raw?.sisteInnsendteAarsregnskap, 10) || null,
    registeredForVat: asBool(raw?.registrertIMvaregisteret),
    registeredInBusinessRegister: asBool(raw?.registrertIForetaksregisteret),
    registeredInFoundationRegister: asBool(raw?.registrertIStiftelsesregisteret),
    language: clean(raw?.maalform, 40) || null,
    historicalNames,
    status: exact.deleted ? "DELETED" : exact.bankrupt ? "BANKRUPT" : exact.liquidation ? "LIQUIDATION" : "REGISTERED",
  };
}

export const onRequestGet = async ({ request }: PagesContext): Promise<Response> => {
  const url = new URL(request.url);
  const orgnr = clean(url.searchParams.get("orgnr"), 20);
  if (!/^\d{9}$/.test(orgnr)) return json({ ok: false, error: "VALID_NINE_DIGIT_ORGANIZATION_NUMBER_REQUIRED" }, 400);

  const retrievedAt = new Date().toISOString();
  try {
    const exact = await fetchBrregExact(orgnr, { signal: AbortSignal.timeout(8000) });
    if (!exact) return json({ ok: true, state: "NOT_FOUND", profile: null });

    const exactUrl = `${BRREG_API_BASE}/enheter/${orgnr}`;
    const rolesUrl = `${exactUrl}/roller`;
    const groupUrl = `${BRREG_API_BASE}/konsernstruktur/${orgnr}`;
    const subunitsUrl = `${BRREG_API_BASE}/underenheter?overordnetEnhet=${orgnr}&size=100`;
    const updatesUrl = `${BRREG_API_BASE}/oppdateringer/enheter?organisasjonsnummer=${orgnr}&includeChanges=true&size=30&sort=id,DESC`;
    const accountYearsUrl = `${ACCOUNTS_BASE}/kopi/${orgnr}/aar`;

    const [rawResult, rolesResult, groupResult, subunitsResult, updatesResult, accountsResult] = await Promise.all([
      fetchJson(exactUrl, "application/vnd.brreg.enhetsregisteret.enhet.v2+json"),
      fetchJson(rolesUrl, "application/vnd.brreg.enhetsregisteret.rolle.v1+json"),
      fetchJson(groupUrl),
      fetchJson(subunitsUrl, "application/vnd.brreg.enhetsregisteret.underenhet.v2+json"),
      fetchJson(updatesUrl, "application/vnd.brreg.enhetsregisteret.oppdatering.enhet.v1+json"),
      fetchJson(accountYearsUrl),
    ]);

    if (rawResult.state !== "READY" || !rawResult.payload) {
      return json({ ok: false, error: "BRREG_EXACT_PROFILE_UNAVAILABLE", sourceState: rawResult.state }, 503);
    }
    if (clean(rawResult.payload?.organisasjonsnummer, 20) !== orgnr) {
      return json({ ok: false, error: "SOURCE_IDENTITY_MISMATCH" }, 502);
    }

    const company = buildCompany(rawResult.payload, exact);
    const roles = rolesResult.state === "READY" ? normaliseRoles(rolesResult.payload) : [];
    const group = groupResult.state === "READY" ? flattenGroup(groupResult.payload) : [];
    const locations = subunitsResult.state === "READY" ? normaliseSubunits(subunitsResult.payload) : [];
    const registerUpdates = updatesResult.state === "READY" ? normaliseUpdates(updatesResult.payload) : [];
    const accountYears = accountsResult.state === "READY" ? normaliseAccountYears(accountsResult.payload) : [];

    const changes = [
      ...company.historicalNames.map((item: any) => ({
        type: "HISTORICAL_NAME",
        date: item.to || item.from,
        title: `Registered name: ${item.name}`,
        detail: item.from && item.to ? `${item.from} → ${item.to}` : item.from || item.to || "Date unavailable",
        truthClass: "FACT",
        sourceId: "BRREG-ENTITY",
      })),
      ...registerUpdates.flatMap((item: any) => item.changes.length ? item.changes.map((change: any) => ({
        type: "REGISTER_UPDATE",
        date: item.timestamp,
        title: change.field,
        detail: change.oldValue || change.newValue ? `${change.oldValue || "UNKNOWN"} → ${change.newValue || "UNKNOWN"}` : "BRREG published an entity update.",
        truthClass: "FACT",
        sourceId: "BRREG-UPDATES",
      })) : [{
        type: "REGISTER_UPDATE",
        date: item.timestamp,
        title: "Entity register update",
        detail: `BRREG update ID ${item.id || "unavailable"}.`,
        truthClass: "FACT",
        sourceId: "BRREG-UPDATES",
      }]),
    ].filter((item: any) => item.title).slice(0, 40);

    const sources: SourceRecord[] = [
      { id: "BRREG-ENTITY", title: "Legal entity record", publisher: "Brønnøysundregistrene", url: exactUrl, retrievedAt, state: "READY", note: "Canonical Norwegian legal identity and registered public company facts. NLOD 2.0." },
      { id: "BRREG-ROLES", title: "Roles for this legal entity", publisher: "Brønnøysundregistrene", url: rolesUrl, retrievedAt, state: rolesResult.state, note: "Public roles for this entity only. 4BRANDS does not aggregate a person's roles across unrelated organisations." },
      { id: "BRREG-GROUP", title: "Corporate group structure", publisher: "Brønnøysundregistrene", url: groupUrl, retrievedAt, state: groupResult.state, note: "Hierarchical group structure when BRREG has a record for the requested entity." },
      { id: "BRREG-SUBUNITS", title: "Registered sub-entities / locations", publisher: "Brønnøysundregistrene", url: subunitsUrl, retrievedAt, state: subunitsResult.state, note: "Registered sub-entities linked to this main entity." },
      { id: "BRREG-UPDATES", title: "Entity register updates", publisher: "Brønnøysundregistrene", url: updatesUrl, retrievedAt, state: updatesResult.state, note: "Published update events from the Entity Register. Absence is not proof that nothing changed." },
      { id: "BRREG-ACCOUNTS", title: "Annual-account copies", publisher: "Brønnøysundregistrene / Regnskapsregisteret", url: accountYearsUrl, retrievedAt, state: accountsResult.state, note: "Availability index for annual-account copies. Financial values are not inferred from PDF availability." },
    ];

    const unknowns: string[] = [];
    if (!company.website) unknowns.push("Official website is not registered in this BRREG record.");
    if (company.employees === null) unknowns.push("Employee count is not available in the exact BRREG entity record.");
    if (!company.industries.length) unknowns.push("Industry classification is not available in the exact BRREG entity record.");
    if (!roles.length) unknowns.push("No public role records were returned in this bounded lookup.");
    if (!group.length) unknowns.push("No child group relations were returned; this does not prove the entity has no wider ownership relationships.");
    if (!locations.length) unknowns.push("No registered sub-entities were returned in this bounded lookup.");
    if (!accountYears.length) unknowns.push("No annual-account copy years were parsed from the public accounts-availability endpoint.");
    unknowns.push("Public register data does not reveal internal revenue drivers, costs, contracts, customer economics or operational performance unless separately sourced.");

    return json({
      ok: true,
      state: "PUBLIC_COMPANY_PROFILE",
      profile: {
        generatedAt: retrievedAt,
        company,
        roles,
        group,
        locations,
        changes,
        accounts: {
          availableYears: accountYears,
          latestAvailableYear: accountYears[0] || company.lastSubmittedAccounts || null,
          copies: accountYears.slice(0, 15).map((year) => ({
            year,
            url: `${ACCOUNTS_BASE}/kopi/${orgnr}/${year}`,
            format: "PDF",
          })),
        },
        coverage: {
          verifiedIdentity: true,
          sourceCount: sources.filter((item) => item.state === "READY").length,
          totalSourceLanes: sources.length,
          roleCount: roles.length,
          groupRelationCount: group.length,
          locationCount: locations.length,
          changeCount: changes.length,
          accountYearCount: accountYears.length,
        },
        sources,
        unknowns,
        truthBoundary: "This profile contains public register facts and explicitly bounded source states. A register fact is not automatically an economic conclusion, ownership-beneficial-owner claim, market assessment, environmental outcome or recommendation.",
      },
    });
  } catch (error) {
    return json({ ok: false, error: "PUBLIC_COMPANY_PROFILE_UNAVAILABLE", detail: error instanceof Error ? error.message : "Profile source unavailable." }, 503);
  }
};

export const onRequest = async (ctx: PagesContext) =>
  ctx.request.method === "GET" ? onRequestGet(ctx) : json({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405);
