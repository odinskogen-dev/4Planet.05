/**
 * Shared country read path: World Bank WDI (/api/worldbank-country) → shared CountrySeries contract.
 * Consumers: 4NATION (profile, signature, compare) and S4PIENS (country context).
 * Not a store. Rank = position among economies that report the indicator in this source.
 */
import type { Attribution, CountryMetric, CountrySeries, Limitation } from "./unescoOpenData";

export const WB_SOURCE = {
  label: "World Bank",
  long: "World Bank — World Development Indicators (API v2)",
  licence: "CC BY 4.0",
  url: "https://databank.worldbank.org/source/world-development-indicators",
  limitation: "National annual indicators. Latest year differs by indicator and country. A national figure is not a local condition, and modelled estimates can be revised.",
} as const;

const attribution: Attribution = { provider: "World Bank", text: "World Bank, World Development Indicators", licence: "CC BY 4.0", licenceUrl: "https://creativecommons.org/licenses/by/4.0/", sourceUrl: WB_SOURCE.url };
const limitations: Limitation[] = [
  { code: "COUNTRY_AGGREGATE", text: "Country-level values do not describe every place or group." },
  { code: "MIXED_VINTAGE", text: "Each value keeps its own year." },
  { code: "MISSING_NOT_ZERO", text: "Missing values are unknown, never zero." },
];

type SeriesBody = { ok: true; country: string; retrievedAt: string; indicators: Record<string, [string, string, boolean]>; series: Record<string, [string, number][]> };
type RankBody = { ok: true; retrievedAt: string; indicators: Record<string, [string, string, boolean]>; values: Record<string, [string, number, string][]> };

export interface WbCountry { retrievedAt: string; series: Record<string, CountrySeries> }

const seriesCache = new Map<string, Promise<WbCountry>>();
export function fetchWbCountry(iso3: string): Promise<WbCountry> {
  if (!seriesCache.has(iso3)) {
    seriesCache.set(iso3, fetch(`/api/worldbank-country?country=${iso3}`).then((r) => r.json()).then((b: SeriesBody) => {
      if (!b || b.ok !== true) throw new Error("WORLDBANK_UNAVAILABLE");
      const series: Record<string, CountrySeries> = {};
      for (const [id, rows] of Object.entries(b.series)) {
        const [label, unit] = b.indicators[id] ?? [id, ""];
        series[id] = {
          countryId: `country:iso3:${iso3.toLowerCase()}`, metricId: id, label, unit,
          observations: rows.map(([year, value]): CountryMetric => ({
            countryId: `country:iso3:${iso3.toLowerCase()}`, metricId: id, label, value, unit, period: year,
            sourceDataset: "wdi", sourceUrl: `https://data.worldbank.org/indicator/${id}?locations=${iso3}`,
            vintage: { period: year, retrievedAt: b.retrievedAt }, attribution, limitations,
          })),
        };
      }
      return { retrievedAt: b.retrievedAt, series };
    }).catch((e) => { seriesCache.delete(iso3); throw e; }));
  }
  return seriesCache.get(iso3)!;
}

export interface WbRanks { retrievedAt: string; labels: Record<string, [string, string]>; values: Record<string, Map<string, { value: number; year: string }>> }
let rankPromise: Promise<WbRanks> | null = null;
/** Global latest values; `allowed` restricts to real countries/territories (filters out regional aggregates). */
export function fetchWbRanks(allowed: Set<string>): Promise<WbRanks> {
  rankPromise ??= fetch("/api/worldbank-country?rank=1").then((r) => r.json()).then((b: RankBody) => {
    if (!b || b.ok !== true) throw new Error("WORLDBANK_RANK_UNAVAILABLE");
    const values: WbRanks["values"] = {};
    for (const [id, rows] of Object.entries(b.values)) {
      const m = new Map<string, { value: number; year: string }>();
      for (const [iso3, value, year] of rows) if (allowed.has(iso3)) m.set(iso3, { value, year });
      values[id] = m;
    }
    const labels: WbRanks["labels"] = {};
    for (const [id, [l, u]] of Object.entries(b.indicators)) labels[id] = [l, u];
    return { retrievedAt: b.retrievedAt, labels, values };
  }).catch((e) => { rankPromise = null; throw e; });
  return rankPromise;
}

export interface RankPosition { rank: number; of: number; value: number; year: string; /** 0 = lowest, 1 = highest */ pct: number }
export function positionOf(ranks: WbRanks | undefined, id: string, iso3: string): RankPosition | null {
  const m = ranks?.values[id];
  const own = m?.get(iso3);
  if (!m || !own) return null;
  let higher = 0;
  for (const v of m.values()) if (v.value > own.value) higher++;
  const of = m.size;
  return { rank: higher + 1, of, value: own.value, year: own.year, pct: of > 1 ? 1 - higher / (of - 1) : 0.5 };
}

/** Plain-language ordinal, British English. */
export const ordinal = (n: number) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
