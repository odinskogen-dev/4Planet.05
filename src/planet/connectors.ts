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

/**
 * Species suggest. Preserved wholesale from V36 (Atlas.tsx `suggest`), including
 * its hard-won ranking fix — a single unfiltered GBIF query buries "orca" under
 * ants and foraminifera, so we run one query across all life and one biased to
 * vertebrates and merge. That comment in V36 was earned. It stays.
 */
export const searchTaxa = async (q: string): Promise<Result<TaxonHit[]>> => {
  const text = q.trim();
  if (text.length < 3) return { ok: true, data: [] };
  const t = text.toLowerCase();
  const url = (extra: string) =>
    `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(
      text,
    )}&rank=SPECIES&status=ACCEPTED${extra}&limit=20`;

  const [all, vert] = await Promise.all([getJson(url("")), getJson(url("&highertaxonKey=44"))]);
  if (!all.ok && !vert.ok) return { ok: false, error: "GBIF unreachable" };

  const rows = [
    ...(vert.ok ? vert.data.results ?? [] : []),
    ...(all.ok ? all.data.results ?? [] : []),
  ];
  const seen = new Set<number>();
  const hits = rows
    .filter((h: any) => h.key && h.scientificName && !seen.has(h.key) && seen.add(h.key))
    .map((h: any) => {
      const vn = (h.vernacularNames ?? []).find(
        (v: any) => v.language === "eng" && v.vernacularName,
      );
      const commonName = vn ? titleCase(vn.vernacularName) : undefined;
      const c = (commonName ?? "").toLowerCase();
      const sci = String(h.scientificName).toLowerCase();
      const score = c.startsWith(t) ? 0 : c.includes(t) ? 1 : sci.startsWith(t) ? 2 : sci.includes(t) ? 3 : 4;
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
    .sort((a, b) => a.score - b.score)
    .slice(0, 7)
    .map((x) => x.hit);

  return { ok: true, data: hits };
};

export const taxonVernacular = async (gbifKey: number | string): Promise<string | undefined> => {
  const r = await getJson(`https://api.gbif.org/v1/species/${gbifKey}/vernacularNames?limit=60`);
  if (!r.ok) return undefined;
  const en = (r.data.results ?? []).find((v: any) => v.language === "eng" && v.vernacularName);
  return en ? titleCase(en.vernacularName) : undefined;
};

const toOccurrence = (o: any): Occurrence | null => {
  if (typeof o.decimalLatitude !== "number" || typeof o.decimalLongitude !== "number") return null;
  return {
    lat: o.decimalLatitude,
    lng: o.decimalLongitude,
    scientificName: o.scientificName ?? o.species ?? "Unidentified",
    eventDate: o.eventDate ? String(o.eventDate).slice(0, 10) : undefined,
    sourceRecordId: o.key ? String(o.key) : undefined,
    sourceUrl: o.key ? `https://www.gbif.org/occurrence/${o.key}` : undefined,
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
