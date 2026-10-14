/**
 * GET /api/unesco-data?dataset=mab001
 *
 * Bounded, allowlisted UNESCO DataHub adapter for shared 4PLANET consumers.
 * This is intentionally NOT a generic proxy and NOT a bulk-mirroring service.
 *
 * Rights: the allowlisted datasets are currently published as CC BY-SA 4.0.
 * Upstream identity remains explicit in the response. Cached responses remain
 * source data; caching never turns them into 4PLANET-owned data.
 */

type DatasetKey = "mab001" | "whc001" | "eg0001" | "ioc001" | "cou001";

const DATASETS: Record<DatasetKey, {
  maxRecords: number;
  select: string;
  attribution: string;
}> = {
  mab001: {
    maxRecords: 900,
    select: "mab_id,title_en,iso2,country_title_en,date,introduction_en,coordinates,uuid",
    attribution: "UNESCO",
  },
  whc001: {
    maxRecords: 1400,
    select: "name_en,uuid,id_no,coordinates,category,states_names,iso_codes,date_inscribed,short_description_en",
    attribution: "UNESCO",
  },
  eg0001: {
    maxRecords: 300,
    select: "uuid,ugg_id,title_en,countries,date,introduction_en,coordinates,url,website",
    attribution: "UNESCO",
  },
  ioc001: {
    maxRecords: 2000,
    select: "uuid,area_id,area_name,area_type,country_iso2,coordinates,n_observations,n_species,n_taxa,n_datasets,n_threatened_species,pct_threatened,year_first,year_last,source_url,country_title_en,regional_group",
    attribution: "OBIS",
  },
  cou001: {
    maxRecords: 250,
    select: "country_title_en,capital_en,regional_group,membership,coordinates,iso2,iso3,uuid",
    attribution: "UNESCO",
  },
};

const json = (body: unknown, status = 200, maxAge = 21600) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
      "access-control-allow-origin": "*",
    },
  });

const API = "https://data.unesco.org/api/explore/v2.1/catalog/datasets";
const PAGE_SIZE = 100;

const upstreamUrl = (dataset: DatasetKey, offset: number) => {
  const cfg = DATASETS[dataset];
  const q = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
    select: cfg.select,
  });
  return `${API}/${dataset}/records?${q.toString()}`;
};

const fetchPage = async (dataset: DatasetKey, offset: number) => {
  const response = await fetch(upstreamUrl(dataset, offset), {
    headers: {
      accept: "application/json",
      "user-agent": "4PLANET-ATLAS/1.0 (+https://4planet.org)",
    },
    cf: { cacheTtl: 21600 } as RequestInit["cf"],
  });
  if (!response.ok) throw new Error(`UPSTREAM_${response.status}`);
  const data: any = await response.json();
  if (!data || !Array.isArray(data.results)) throw new Error("CONTRACT_MISMATCH");
  return {
    totalCount: Number.isFinite(Number(data.total_count)) ? Number(data.total_count) : null,
    results: data.results as unknown[],
  };
};

export const onRequestGet = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const dataset = url.searchParams.get("dataset") as DatasetKey | null;
  if (!dataset || !(dataset in DATASETS)) {
    return json({ ok: false, error: "UNSUPPORTED_DATASET" }, 400, 60);
  }

  const cfg = DATASETS[dataset];
  const records: unknown[] = [];
  let totalCount: number | null = null;

  try {
    for (let offset = 0; offset < cfg.maxRecords; offset += PAGE_SIZE) {
      const page = await fetchPage(dataset, offset);
      if (totalCount === null) totalCount = page.totalCount;
      records.push(...page.results);

      if (page.results.length < PAGE_SIZE) break;
      if (totalCount !== null && records.length >= totalCount) break;
    }

    if (records.length > cfg.maxRecords) records.length = cfg.maxRecords;
    const truncated = totalCount !== null ? totalCount > records.length : records.length >= cfg.maxRecords;

    return json({
      ok: true,
      dataset,
      retrievedAt: new Date().toISOString(),
      totalCount,
      truncated,
      records,
      rights: {
        licence: "CC BY-SA 4.0",
        licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        attribution: cfg.attribution,
        shareAlike: true,
        termsCheckedAt: "2026-10-13",
      },
    });
  } catch (error) {
    return json({
      ok: false,
      dataset,
      error: String((error as Error)?.message || error),
      records: [],
    }, 502, 60);
  }
};

export const onRequestOptions = () => new Response(null, {
  headers: {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-max-age": "86400",
  },
});
