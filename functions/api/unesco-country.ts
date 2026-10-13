/**
 * GET /api/unesco-country?dataset=wdi001&country=NO
 *
 * Country-scoped authoritative-data adapter.
 * It intentionally refuses unbounded/global WDI reads: one country, at most
 * 100 annual rows, selected fields only.
 */

type DatasetKey = "wdi001";

const DATASETS: Record<DatasetKey, {
  countryField: string;
  select: string;
  attribution: string;
}> = {
  wdi001: {
    countryField: "country",
    select: [
      "year","regional_group","country_title_en","gdp_total","gdp_growth_rate","gdp_per_capita",
      "youth_literacy_rate","adult_literacy_rate","primary_school_enrollment","secondary_school_enrollment",
      "tertiary_school_enrollment","labor_force_female","labor_force_male","labor_force_total",
      "unemployment_rate","life_expectancy","population_0_14","population_15_64","population_65_up",
      "population_total","female_population","male_population","coordinates","country","membership"
    ].join(","),
    attribution: "World Bank",
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

export const onRequestGet = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const dataset = url.searchParams.get("dataset") as DatasetKey | null;
  const country = String(url.searchParams.get("country") || "").trim().toUpperCase();

  if (!dataset || !(dataset in DATASETS)) {
    return json({ ok: false, error: "UNSUPPORTED_DATASET" }, 400, 60);
  }
  if (!/^[A-Z]{2}$/.test(country)) {
    return json({ ok: false, error: "INVALID_COUNTRY_ISO2" }, 400, 60);
  }

  const cfg = DATASETS[dataset];
  const q = new URLSearchParams({
    limit: "100",
    select: cfg.select,
    where: `${cfg.countryField}="${country}"`,
    order_by: "year desc",
  });

  try {
    const response = await fetch(`${API}/${dataset}/records?${q.toString()}`, {
      headers: {
        accept: "application/json",
        "user-agent": "4PLANET-COUNTRY/1.0 (+https://4planet.org)",
      },
      cf: { cacheTtl: 21600 } as RequestInit["cf"],
    });
    if (!response.ok) return json({ ok: false, dataset, country, error: `UPSTREAM_${response.status}` }, 502, 60);

    const data: any = await response.json();
    if (!data || !Array.isArray(data.results)) {
      return json({ ok: false, dataset, country, error: "CONTRACT_MISMATCH" }, 502, 60);
    }

    return json({
      ok: true,
      dataset,
      country,
      retrievedAt: new Date().toISOString(),
      totalCount: Number.isFinite(Number(data.total_count)) ? Number(data.total_count) : null,
      records: data.results,
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
      country,
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
