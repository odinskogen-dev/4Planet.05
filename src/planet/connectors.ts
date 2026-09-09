/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — ADAPTATION LAYER — CONNECTORS
   STATUS: ADAPTATION. NOT THE CANONICAL CONNECTOR CONTRACT. (Brief §80)

   Every function here does exactly one thing: take a real external feed and
   return a 4PLANET-shaped record with its provenance attached. Nothing in this
   file interprets, ranks, promotes or infers. That is deliberate.

   Rules observed:
     - No source-specific field escapes this file. (Brief §85: "SOURCE-SPECIFIC
       FIELDS LEAKING THROUGH THE ENTIRE CORE MODEL" is a named anti-pattern.
       V36 leaked GBIF's `speciesKey` and OBIS's `aphiaID` straight into map
       feature properties and into popup HTML strings. Stops here.)
     - A failure returns an empty result AND a status. It never returns a lie.
     - checkedAt is stamped on every record, because "when did 4PLANET ask" is
       a different time from "when did it happen". (Brief §27.)
   ═══════════════════════════════════════════════════════════════════════════ */

import type { Occurrence, Signal } from "./types";
import { signalId, taxonId } from "./ids";

const now = () => new Date().toISOString();
const titleCase = (s: string) =>
  String(s ?? "").replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());

/** Every network call goes through here, so failure is uniform and honest. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const getJson = async (url: string, ms = 12000): Promise<Result<any>> => {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) return { ok: false, error: `HTTP ${r.status}` };
    return { ok: true, data: await r.json() };
  } catch (e: any) {
    return { ok: false, error: e?.name === "AbortError" ? "TIMEOUT" : "NETWORK" };
  } finally {
    clearTimeout(t);
  }
};

/* ── GBIF ────────────────────────────────────────────────────────────────── */

export interface TaxonHit {
  id: string; // canonical: taxon:gbif:<key>
  gbifKey: number;
  scientificName: string;
  commonName?: string;
  rank?: string;
  kingdom?: string;
}

type TaxonQueryAlias = { scientificName: string; commonName: string };

/*
 * Search aliases are query-expansion only. They do not create taxon identity.
 * GBIF still resolves the canonical key and accepted scientific name. These few
 * high-intent public terms prevent the most important 4PLANET journeys from
 * depending on whether a provider happened to include one English vernacular
 * name in a particular autocomplete payload.
 */
const TAXON_QUERY_ALIASES: Record<string, TaxonQueryAlias> = {
  orca: { scientificName: "Orcinus orca", commonName: "Orca" },
  "killer whale": { scientificName: "Orcinus orca", commonName: "Killer Whale" },
  "humpback": { scientificName: "Megaptera novaeangliae", commonName: "Humpback Whale" },
  "humpback whale": { scientificName: "Megaptera novaeangliae", commonName: "Humpback Whale" },
  jaguar: { scientificName: "Panthera onca", commonName: "Jaguar" },
  "sperm whale": { scientificName: "Physeter macrocephalus", commonName: "Sperm Whale" },
  "fin whale": { scientificName: "Balaenoptera physalus", commonName: "Fin Whale" },
  "blue whale": { scientificName: "Balaenoptera musculus", commonName: "Blue Whale" },
};

const normaliseTaxonQuery = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export function expandTaxonQuery(q: string): { raw: string; search: string; preferredCommonName?: string } {
  const raw = q.trim();
  const alias = TAXON_QUERY_ALIASES[normaliseTaxonQuery(raw)];
  return {
    raw,
    search: alias?.scientificName ?? raw,
    preferredCommonName: alias?.commonName,
  };
}

const taxonSearchCache = new Map<string, { at: number; result: Result<TaxonHit[]> }>();
const TAXON_SEARCH_CACHE_MS = 5 * 60 * 1000;

/**
 * Species suggest. The original V36 insight remains: one broad GBIF query can
 * bury the animal a normal person means. This version keeps the broad +
 * vertebrate merge, adds canonical query expansion for high-intent journeys,
 * and caches short-lived results so reopening the same species does not feel
 * like a fresh network round trip every time.
 */
export const searchTaxa = async (q: string): Promise<Result<TaxonHit[]>> => {
  const expanded = expandTaxonQuery(q);
  if (expanded.raw.length < 3) return { ok: true, data: [] };

  const cacheKey = normaliseTaxonQuery(expanded.raw);
  const cached = taxonSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < TAXON_SEARCH_CACHE_MS) return cached.result;

  const rawLower = expanded.raw.toLowerCase();
  const searchLower = expanded.search.toLowerCase();
  const url = (query: string, extra = "") =>
    `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(
      query,
    )}&rank=SPECIES&status=ACCEPTED${extra}&limit=20`;

  const requests: Array<Promise<Result<any>>> = [
    getJson(url(expanded.raw)),
    getJson(url(expanded.search, "&highertaxonKey=44")),
  ];
  if (normaliseTaxonQuery(expanded.search) !== cacheKey) requests.push(getJson(url(expanded.search)));
  if (expanded.preferredCommonName) {
    requests.push(getJson(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(expanded.search)}&strict=true`));
  }

  const responses = await Promise.all(requests);
  const successful = responses.filter((result): result is { ok: true; data: any } => result.ok);
  if (!successful.length) return { ok: false, error: "GBIF unreachable" };

  const rows: any[] = [];
  for (const result of successful) {
    if (Array.isArray(result.data?.results)) rows.push(...result.data.results);
    else if (result.data?.usageKey && result.data?.scientificName) {
      rows.unshift({
        ...result.data,
        key: result.data.usageKey,
        vernacularNames: expanded.preferredCommonName
          ? [{ language: "eng", vernacularName: expanded.preferredCommonName }]
          : [],
      });
    }
  }

  const seen = new Set<number>();
  const aliasScientific = expanded.preferredCommonName ? searchLower : "";
  const hits = rows
    .filter((h: any) => h.key && h.scientificName && !seen.has(h.key) && seen.add(h.key))
    .map((h: any) => {
      const sci = String(h.scientificName).toLowerCase();
      const vn = (h.vernacularNames ?? []).find(
        (v: any) => v.language === "eng" && v.vernacularName,
      );
      const providerCommon = vn ? titleCase(vn.vernacularName) : undefined;
      const preferredCommon = aliasScientific && sci === aliasScientific ? expanded.preferredCommonName : undefined;
      const commonName = preferredCommon ?? providerCommon;
      const common = (commonName ?? "").toLowerCase();

      let score = 50;
      if (aliasScientific && sci === aliasScientific) score = -20;
      else if (common === rawLower) score = -12;
      else if (sci === rawLower) score = -10;
      else if (common.startsWith(rawLower)) score = 0;
      else if (common.includes(rawLower)) score = 2;
      else if (sci.startsWith(rawLower)) score = 4;
      else if (sci.includes(rawLower)) score = 6;
      else if (sci.startsWith(searchLower)) score = 8;
      else if (sci.includes(searchLower)) score = 10;

      return {
        hit: {
          id: taxonId(h.key),
          gbifKey: h.key,
          scientificName: h.scientificName,
          commonName,
          rank: h.rank,
          kingdom: h.kingdom,
        } as TaxonHit,
        score,
      };
    })
    .sort((a, b) => a.score - b.score || a.hit.scientificName.localeCompare(b.hit.scientificName))
    .slice(0, 7)
    .map((x) => x.hit);

  const result: Result<TaxonHit[]> = { ok: true, data: hits };
  taxonSearchCache.set(cacheKey, { at: Date.now(), result });
  return result;
};

export const taxonVernacular = async (gbifKey: number | string): Promise<string | undefined> => {
  const r = await getJson(`https://api.gbif.org/v1/species/${gbifKey}/vernacularNames?limit=60`);
  if (!r.ok) return undefined;
  const en = (r.data.results ?? []).find((v: any) => v.language === "eng" && v.vernacularName);
  return en ? titleCase(en.vernacularName) : undefined;
};

const toOccurrence = (o: any): Occurrence | null => {
  if (typeof o.decimalLatitude !== "number" || typeof o.decimalLongitude !== "number") return null;
  // Only accept a media image when the record also carries a licence, so the
  // observation panel never shows an image without rights (ORCA-05, §13E).
  const media = Array.isArray(o.media)
    ? o.media.find((m: any) => m?.type === "StillImage" && m?.identifier && (m?.license || m?.rights))
    : undefined;
  return {
    lat: o.decimalLatitude,
    lng: o.decimalLongitude,
    scientificName: o.scientificName ?? o.species ?? "Unidentified",
    commonName: o.vernacularName || undefined,
    eventDate: o.eventDate ? String(o.eventDate).slice(0, 10) : undefined,
    sourceRecordId: o.key ? String(o.key) : undefined,
    sourceUrl: o.key ? `https://www.gbif.org/occurrence/${o.key}` : undefined,
    taxonKey: typeof o.taxonKey === "number" ? o.taxonKey : undefined,
    coordinateUncertaintyM:
      typeof o.coordinateUncertaintyInMeters === "number" ? o.coordinateUncertaintyInMeters : undefined,
    mediaUrl: media?.identifier,
    mediaLicence: media?.license || media?.rights,
    mediaAttribution: media?.rightsHolder || media?.creator || "GBIF contributor",
  };
};

/** Where has this taxon been recorded? Brief: records are records, not range. */
export const taxonOccurrences = async (
  gbifKey: number | string,
  limit = 300,
): Promise<Result<{ rows: Occurrence[]; total: number }>> => {
  const r = await getJson(
    `https://api.gbif.org/v1/occurrence/search?taxonKey=${gbifKey}&hasCoordinate=true&limit=${limit}`,
  );
  if (!r.ok) return { ok: false, error: r.error };
  const rows = (r.data.results ?? []).map(toOccurrence).filter(Boolean) as Occurrence[];
  return { ok: true, data: { rows, total: r.data.count ?? rows.length } };
};

/** Recent records of a taxon, anywhere. Used by WATCH — see watch.ts for the caveat. */
export const taxonOccurrencesSince = async (
  gbifKey: number | string,
  sinceIso: string,
  limit = 60,
): Promise<Result<{ rows: Occurrence[]; total: number }>> => {
  const today = new Date().toISOString().slice(0, 10);
  const r = await getJson(
    `https://api.gbif.org/v1/occurrence/search?taxonKey=${gbifKey}&hasCoordinate=true` +
      `&eventDate=${sinceIso},${today}&limit=${limit}`,
  );
  if (!r.ok) return { ok: false, error: r.error };
  const rows = (r.data.results ?? []).map(toOccurrence).filter(Boolean) as Occurrence[];
  return { ok: true, data: { rows, total: r.data.count ?? rows.length } };
};

/** What life has been recorded inside this polygon? Powers PLACE. */
export const occurrencesInWkt = async (
  wkt: string,
  opts: { taxonKey?: number | string; limit?: number; sinceIso?: string } = {},
): Promise<Result<{ rows: Occurrence[]; total: number; names: string[] }>> => {
  const q = new URLSearchParams();
  q.set("hasCoordinate", "true");
  q.set("geometry", wkt);
  q.set("limit", String(opts.limit ?? 300));
  if (opts.taxonKey) q.set("taxonKey", String(opts.taxonKey));
  if (opts.sinceIso) q.set("eventDate", `${opts.sinceIso},${new Date().toISOString().slice(0, 10)}`);

  const r = await getJson(`https://api.gbif.org/v1/occurrence/search?${q.toString()}`);
  if (!r.ok) return { ok: false, error: r.error };
  const rows = (r.data.results ?? []).map(toOccurrence).filter(Boolean) as Occurrence[];
  const names = [...new Set(rows.map((o) => o.scientificName))].filter(Boolean);
  return { ok: true, data: { rows, total: r.data.count ?? rows.length, names } };
};

/* ── OBIS ────────────────────────────────────────────────────────────────── */

export const cetaceanOccurrences = async (size = 800): Promise<Result<Occurrence[]>> => {
  const r = await getJson(
    `https://api.obis.org/v3/occurrence?scientificname=Cetacea&hascoordinate=true&size=${size}`,
  );
  if (!r.ok) return { ok: false, error: r.error };
  const rows: Occurrence[] = (r.data.results ?? [])
    .filter((o: any) => o.decimalLatitude && o.decimalLongitude)
    .map((o: any) => ({
      lat: o.decimalLatitude,
      lng: o.decimalLongitude,
      scientificName: o.scientificName ?? "Cetacea",
      commonName: o.vernacularName ? titleCase(o.vernacularName) : undefined,
      eventDate: o.eventDate ? String(o.eventDate).slice(0, 10) : undefined,
      // P0 (V38R): SOURCE ≠ SOURCE RECORD. An AphiaID is a WoRMS *taxon* identity,
      // not the identity of this OBIS occurrence. Use OBIS's own record id where
      // it exists; otherwise leave it undefined rather than substitute a taxon id.
      sourceRecordId: o.id ? String(o.id) : undefined,
      // Link to the OBIS occurrence record when OBIS gives us an id. We do NOT
      // link a concrete observation to a WoRMS taxon page and call it the record.
      sourceUrl: o.id ? `https://obis.org/occurrence/${o.id}` : undefined,
    }));
  return { ok: true, data: rows };
};

/* ── SIGNALS: NASA EONET ─────────────────────────────────────────────────── */

const eonetClass = (cat: string): "FIRE_ACTIVITY" | "NATURAL_EVENT" =>
  /fire|wildfire/i.test(cat) ? "FIRE_ACTIVITY" : "NATURAL_EVENT";

const eonetKind = (cat: string) =>
  /storm/i.test(cat)
    ? "SEVERE STORM"
    : /ice/i.test(cat)
      ? "ICEBERG / SEA ICE"
      : /volcano/i.test(cat)
        ? "VOLCANIC ACTIVITY"
        : /fire/i.test(cat)
          ? "ACTIVE WILDFIRE"
          : cat.toUpperCase();

export const eonetSignals = async (limit = 300): Promise<Result<Signal[]>> => {
  const r = await getJson(
    `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=${limit}`,
  );
  if (!r.ok) return { ok: false, error: r.error };
  const checkedAt = now();

  const out: Signal[] = [];
  for (const e of r.data.events ?? []) {
    const g = (e.geometry ?? []).slice(-1)[0];
    if (!g || !Array.isArray(g.coordinates) || typeof g.coordinates[0] !== "number") continue;
    const cat = e.categories?.[0]?.title ?? "Event";
    out.push({
      id: signalId("eonet", String(e.id)),
      cls: eonetClass(cat),
      title: eonetKind(cat),
      summary: e.title ?? "",
      lng: g.coordinates[0],
      lat: g.coordinates[1],
      significance: "UNCLASSIFIED",
      provenance: {
        sourceId: "eonet",
        sourceRecordId: String(e.id),
        sourceUrl: e.link ?? e.sources?.[0]?.url,
        interpretation: "SOURCE_RECORD",
        // The event is open in NASA's feed. Its ecological meaning is not established.
        confidence: "MEDIUM",
        occurredAt: g.date ?? undefined,
        checkedAt,
      },
    });
  }
  return { ok: true, data: out };
};

/* ── SIGNALS: USGS ───────────────────────────────────────────────────────── */

export const usgsSignals = async (): Promise<Result<Signal[]>> => {
  const r = await getJson(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  );
  if (!r.ok) return { ok: false, error: r.error };
  const checkedAt = now();

  const out: Signal[] = (r.data.features ?? [])
    .filter((f: any) => f?.geometry?.coordinates)
    .map((f: any) => ({
      id: signalId("usgs", String(f.id)),
      cls: "SEISMIC" as const,
      title: `M ${f.properties.mag ?? "?"}`,
      summary: f.properties.place ?? "",
      lng: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      significance: "UNCLASSIFIED" as const,
      provenance: {
        sourceId: "usgs",
        sourceRecordId: String(f.id),
        sourceUrl: f.properties.url,
        interpretation: "SOURCE_RECORD" as const,
        confidence: "HIGH" as const,
        occurredAt: f.properties.time ? new Date(f.properties.time).toISOString() : undefined,
        checkedAt,
      },
      /** magnitude is kept out of the canonical shape; the title carries it. */
    }));
  return { ok: true, data: out };
};

/* ── iNaturalist photo (reference imagery only) ──────────────────────────── */

export interface TaxonPhoto {
  url: string;
  attribution: string;
}

/**
 * Preserved from V36, including its bug fix: iNat fuzzy-matches, and asking for
 * "Cetacea" once returned a deer. Only an exact scientific-name match is trusted.
 */
export const taxonPhoto = async (scientificName: string): Promise<TaxonPhoto | null> => {
  const q = String(scientificName ?? "").trim();
  if (!q) return null;
  const r = await getJson(
    `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(q)}&per_page=5`,
    8000,
  );
  if (!r.ok) return null;
  const want = q.toLowerCase();
  const t = (r.data.results ?? []).find((x: any) => String(x.name ?? "").toLowerCase() === want);
  const url = t?.default_photo?.medium_url ?? t?.default_photo?.square_url;
  if (!url) return null;
  return {
    url,
    attribution: String(t.default_photo.attribution ?? "iNaturalist").replace(/<[^>]*>/g, ""),
  };
};