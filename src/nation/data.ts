/**
 * 4NATION read hooks over the SHARED country/source contracts.
 * No new store: WDI via UNESCO DataHub (/api/unesco-country) and UNESCO
 * designations (/api/unesco-data) — the same read path ATLAS and S4PIENS use.
 */
import { useEffect, useState } from "react";
import { fetchCountryDevelopmentContext, WDI_DATASET, type CountryDevelopmentContext } from "@/data/unescoCountryContext";
import { fetchUnescoDataset, normaliseUnescoAtlasRecord, UNESCO_DATASETS, type CountryMetric, type CountrySeries, type UnescoAtlasRecord } from "@/data/unescoOpenData";

export type Load<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error"; error: string };

const wdiCache = new Map<string, Promise<CountryDevelopmentContext | null>>();
export function useCountryContext(iso2: string): Load<CountryDevelopmentContext | null> {
  const [s, set] = useState<Load<CountryDevelopmentContext | null>>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    set({ status: "loading" });
    if (!wdiCache.has(iso2)) wdiCache.set(iso2, fetchCountryDevelopmentContext(iso2).catch((e) => { wdiCache.delete(iso2); throw e; }));
    wdiCache.get(iso2)!.then((data) => alive && set({ status: "ready", data }), (e) => alive && set({ status: "error", error: String(e?.message || e) }));
    return () => { alive = false; };
  }, [iso2]);
  return s;
}

type SiteSet = "whc001" | "mab001" | "eg0001" | "ioc001";
export type CountrySites = Record<SiteSet, { records: UnescoAtlasRecord[]; retrievedAt: string } | { error: string }>;
const siteCache = new Map<SiteSet, Promise<{ records: UnescoAtlasRecord[]; retrievedAt: string }>>();
function loadSet(id: SiteSet) {
  if (!siteCache.has(id)) {
    siteCache.set(id, fetchUnescoDataset(id).then((r) => ({
      retrievedAt: r.retrievedAt,
      records: r.records.map((x) => normaliseUnescoAtlasRecord(id, x)).filter((x): x is UnescoAtlasRecord => Boolean(x)),
    })).catch((e) => { siteCache.delete(id); throw e; }));
  }
  return siteCache.get(id)!;
}
const matches = (x: UnescoAtlasRecord, iso2: string, name: string) => {
  const codes = (x.iso2 || "").split(/[,;|/\s]+/).filter(Boolean);
  if (codes.includes(iso2)) return true;
  const n = name.toUpperCase();
  return (x.iso2 || "").includes(n) || (x.country || "").toUpperCase().split(/[,;|/]+/).map((t) => t.trim()).includes(n);
};
export function useCountrySites(iso2: string, name: string): Load<CountrySites> {
  const [s, set] = useState<Load<CountrySites>>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    set({ status: "loading" });
    const ids: SiteSet[] = ["whc001", "mab001", "eg0001", "ioc001"];
    Promise.allSettled(ids.map(loadSet)).then((results) => {
      if (!alive) return;
      const out = {} as CountrySites;
      results.forEach((r, i) => {
        out[ids[i]] = r.status === "fulfilled"
          ? { retrievedAt: r.value.retrievedAt, records: r.value.records.filter((x) => matches(x, iso2, name)) }
          : { error: String((r.reason as Error)?.message || "UNAVAILABLE") };
      });
      set({ status: "ready", data: out });
    });
    return () => { alive = false; };
  }, [iso2, name]);
  return s;
}

/* ── metric helpers ────────────────────────────────────────────────────── */
export const seriesOf = (ctx: CountryDevelopmentContext | null | undefined, metricId: string): CountrySeries | undefined =>
  ctx?.series.find((s) => s.metricId === metricId);
export const latestOf = (ctx: CountryDevelopmentContext | null | undefined, metricId: string): CountryMetric | undefined => {
  const s = seriesOf(ctx, metricId);
  return s?.observations[s.observations.length - 1];
};
export const num = (m?: CountryMetric) => (m && typeof m.value === "number" && Number.isFinite(m.value) ? m.value : null);

export const M = {
  pop: "SP.POP.TOTL", pop014: "SP.POP.0014.TO", pop1564: "SP.POP.1564.TO", pop65: "SP.POP.65UP.TO",
  female: "SP.POP.TOTL.FE.ZS", gdp: "NY.GDP.MKTP.CD", growth: "NY.GDP.MKTP.KD.ZG", gdppc: "NY.GDP.PCAP.CD",
  life: "SP.DYN.LE00.IN", unemp: "SL.UEM.TOTL.ZS", lfp: "SL.TLF.CACT.ZS", lfpF: "SL.TLF.CACT.FE.ZS", lfpM: "SL.TLF.CACT.MA.ZS",
  prim: "SE.PRM.ENRR", sec: "SE.SEC.ENRR", ter: "SE.TER.ENRR", lit: "SE.ADT.LITR.ZS", ylit: "SE.ADT.1524.LT.ZS",
} as const;

export const SOURCE_LINES = {
  wdi: { label: "World Bank · UNESCO", long: "World Bank WDI via UNESCO DataHub", licence: WDI_DATASET.licence, url: WDI_DATASET.officialDatasetUrl, limitation: WDI_DATASET.limitation },
  whc001: { label: "UNESCO World Heritage List", licence: "CC BY-SA 4.0", url: UNESCO_DATASETS.whc001.officialDatasetUrl, limitation: UNESCO_DATASETS.whc001.limitation },
  mab001: { label: "UNESCO Man and the Biosphere", licence: "CC BY-SA 4.0", url: UNESCO_DATASETS.mab001.officialDatasetUrl, limitation: UNESCO_DATASETS.mab001.limitation },
  eg0001: { label: "UNESCO Global Geoparks", licence: "CC BY-SA 4.0", url: UNESCO_DATASETS.eg0001.officialDatasetUrl, limitation: UNESCO_DATASETS.eg0001.limitation },
  ioc001: { label: "IOC-UNESCO / OBIS", licence: "CC BY-SA 4.0", url: UNESCO_DATASETS.ioc001.officialDatasetUrl, limitation: UNESCO_DATASETS.ioc001.limitation },
} as const;

/* ── formatting (British English) ──────────────────────────────────────── */
const nf = (d = 0) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: d, minimumFractionDigits: d });
export function compact(n: number): { value: string; unit: string } {
  const a = Math.abs(n);
  if (a >= 1e12) return { value: nf(a >= 1e13 ? 1 : 2).format(n / 1e12), unit: "trillion" };
  if (a >= 1e9) return { value: nf(a >= 1e11 ? 0 : 1).format(n / 1e9), unit: "billion" };
  if (a >= 1e6) return { value: nf(a >= 1e8 ? 0 : 1).format(n / 1e6), unit: "million" };
  if (a >= 1e4) return { value: nf(0).format(n / 1e3), unit: "thousand" };
  return { value: nf(0).format(n), unit: "" };
}
export const fmt = {
  int: (n: number) => nf(0).format(n),
  d1: (n: number) => nf(1).format(n),
  pct: (n: number) => nf(1).format(n) + "%",
  usd: (n: number) => "US$" + nf(0).format(n),
};
