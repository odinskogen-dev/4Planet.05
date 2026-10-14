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

/* ── World Bank WDI (shared adapter) + Wikidata identity ───────────────── */
import { fetchWbCountry, fetchWbRanks, positionOf, WB_SOURCE, type RankPosition, type WbCountry, type WbRanks } from "@/data/worldBankCountry";
import { COUNTRIES } from "./geo";
export { WB_SOURCE, positionOf };
export type { RankPosition, WbCountry, WbRanks };

function useLoad<T>(key: string | null, fn: () => Promise<T>): Load<T> {
  const [s, set] = useState<Load<T>>({ status: "loading" });
  useEffect(() => {
    if (!key) return;
    let alive = true;
    set({ status: "loading" });
    fn().then((data) => alive && set({ status: "ready", data }), (e) => alive && set({ status: "error", error: String(e?.message || e) }));
    return () => { alive = false; };
  }, [key]);
  return s;
}
const ALLOWED_ISO3 = new Set(COUNTRIES.map((c) => c.iso3));
export const useWb = (iso3: string) => useLoad(iso3, () => fetchWbCountry(iso3));
export const useRanks = () => useLoad("ranks", () => fetchWbRanks(ALLOWED_ISO3));

export type Identity = { itemUrl: string; source: { retrievedAt: string; url: string }; languages: string[]; currencies: string[]; highestPoint: { name: string; elevationM: number | null } | null; anthem: string | null };
const idCache = new Map<string, Promise<Identity>>();
export const useIdentity = (iso2: string) => useLoad("id:" + iso2, () => {
  if (!idCache.has(iso2)) idCache.set(iso2, fetch(`/api/country-identity?iso2=${iso2}`).then((r) => r.json()).then((b) => { if (!b?.ok) throw new Error(b?.error || "WIKIDATA_UNAVAILABLE"); return b as Identity; }).catch((e) => { idCache.delete(iso2); throw e; }));
  return idCache.get(iso2)!;
});
export const WIKIDATA_SOURCE = { label: "Wikidata", long: "Wikidata (Wikimedia Foundation), community-edited", licence: "CC0 1.0", url: "https://www.wikidata.org/", limitation: "Community-edited structured data. Values can change and some may be contested; 4PLANET lists them as recorded and does not adjudicate." };

export const W = {
  pop: "SP.POP.TOTL", life: "SP.DYN.LE00.IN", gdppc: "NY.GDP.PCAP.CD", urban: "SP.URB.TOTL.IN.ZS", internet: "IT.NET.USER.ZS",
  elec: "EG.ELC.ACCS.ZS", renew: "EG.FEC.RNEW.ZS", forest: "AG.LND.FRST.ZS", agriLand: "AG.LND.AGRI.ZS", protected: "ER.PTD.TOTL.ZS",
  water: "ER.H2O.FWST.ZS", manuf: "NV.IND.MANF.ZS", agriGdp: "NV.AGR.TOTL.ZS", jobsAgri: "SL.AGR.EMPL.ZS", jobsInd: "SL.IND.EMPL.ZS", jobsSrv: "SL.SRV.EMPL.ZS",
} as const;

/** Neutral nouns for the signature sentence. */
export const SIGNATURE_NOUN: Record<string, string> = {
  [W.pop]: "population", [W.life]: "life expectancy", [W.gdppc]: "GDP per person", [W.urban]: "share of people in cities",
  [W.internet]: "internet use", [W.elec]: "electricity access", [W.renew]: "renewable share of energy", [W.forest]: "forest cover",
  [W.agriLand]: "share of farmland", [W.protected]: "protected share of territory", [W.water]: "water stress",
  [W.manuf]: "manufacturing share of GDP", [W.agriGdp]: "farming, forestry and fishing share of GDP",
};

export interface SignatureItem { id: string; noun: string; side: "highest" | "lowest"; place: number; of: number; year: string }
/** The 2–3 indicators where a country stands furthest from the middle. Ties and thin coverage are skipped. */
export function signatureOf(ranks: WbRanks | undefined, iso3: string, max = 3): SignatureItem[] {
  if (!ranks) return [];
  const out: (SignatureItem & { ext: number })[] = [];
  for (const id of Object.keys(SIGNATURE_NOUN)) {
    const m = ranks.values[id], own = m?.get(iso3);
    if (!m || !own || m.size < 60) continue;
    let higher = 0, equal = 0;
    for (const v of m.values()) { if (v.value > own.value) higher++; else if (v.value === own.value) equal++; }
    if (equal > 3) continue;
    const top = higher + 1, bottom = m.size - higher - equal + 1;
    const side = top <= bottom ? "highest" : "lowest";
    const place = side === "highest" ? top : bottom;
    if (place > Math.max(10, Math.round(m.size * 0.06))) continue;
    out.push({ id, noun: SIGNATURE_NOUN[id], side, place, of: m.size, year: own.year, ext: place / m.size });
  }
  return out.sort((a, b) => a.ext - b.ext).slice(0, max).map(({ ext, ...r }) => r);
}
