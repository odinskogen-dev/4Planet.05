/**
 * Shared country-context read path for 4NATION / S4PIENS.
 *
 * This is deliberately a consumer adapter over the existing source/provenance
 * spine. It is not a new country database. WDI rows remain attributable to the
 * World Bank via UNESCO DataHub and retain their individual years.
 */

import {
  type Attribution,
  type CountryIdentity,
  type CountryMetric,
  type CountrySeries,
  type Limitation,
  findCountryIdentity,
} from "./unescoOpenData";

export const WDI_DATASET = {
  id: "wdi001",
  title: "World Development Indicators",
  provider: "UNESCO DataHub",
  publisher: "World Bank",
  officialDatasetUrl: "https://data.unesco.org/explore/dataset/wdi001/?flg=en-us",
  referenceUrl: "https://datacatalog.worldbank.org/public-licenses",
  apiPath: "/api/unesco-country?dataset=wdi001",
  licence: "CC BY-SA 4.0",
  licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  attribution: "World Bank",
  commercialUse: "YES_WITH_ATTRIBUTION_AND_SHAREALIKE",
  shareAlike: true,
  termsCheckedAt: "2026-10-13",
  limitation: "Country-level annual indicators; vintages differ by metric and country. A national average is not a local condition.",
} as const;

type WdiMetricDefinition = {
  field: string;
  metricId: string;
  label: string;
  unit: string;
};

export const WDI_METRICS: readonly WdiMetricDefinition[] = [
  { field: "population_total", metricId: "SP.POP.TOTL", label: "Population", unit: "people" },
  { field: "population_0_14", metricId: "SP.POP.0014.TO", label: "Population aged 0–14", unit: "people" },
  { field: "population_15_64", metricId: "SP.POP.1564.TO", label: "Population aged 15–64", unit: "people" },
  { field: "population_65_up", metricId: "SP.POP.65UP.TO", label: "Population aged 65+", unit: "people" },
  { field: "female_population", metricId: "SP.POP.TOTL.FE.ZS", label: "Female population", unit: "% of population" },
  { field: "male_population", metricId: "SP.POP.TOTL.MA.ZS", label: "Male population", unit: "% of population" },
  { field: "gdp_total", metricId: "NY.GDP.MKTP.CD", label: "GDP", unit: "current US$" },
  { field: "gdp_growth_rate", metricId: "NY.GDP.MKTP.KD.ZG", label: "GDP growth", unit: "%" },
  { field: "gdp_per_capita", metricId: "NY.GDP.PCAP.CD", label: "GDP per capita", unit: "current US$" },
  { field: "life_expectancy", metricId: "SP.DYN.LE00.IN", label: "Life expectancy at birth", unit: "years" },
  { field: "unemployment_rate", metricId: "SL.UEM.TOTL.ZS", label: "Unemployment", unit: "% of labour force" },
  { field: "labor_force_total", metricId: "SL.TLF.CACT.ZS", label: "Labour-force participation", unit: "%" },
  { field: "labor_force_female", metricId: "SL.TLF.CACT.FE.ZS", label: "Female labour-force participation", unit: "%" },
  { field: "labor_force_male", metricId: "SL.TLF.CACT.MA.ZS", label: "Male labour-force participation", unit: "%" },
  { field: "primary_school_enrollment", metricId: "SE.PRM.ENRR", label: "Primary school enrolment", unit: "% gross" },
  { field: "secondary_school_enrollment", metricId: "SE.SEC.ENRR", label: "Secondary school enrolment", unit: "% gross" },
  { field: "tertiary_school_enrollment", metricId: "SE.TER.ENRR", label: "Tertiary school enrolment", unit: "% gross" },
  { field: "adult_literacy_rate", metricId: "SE.ADT.LITR.ZS", label: "Adult literacy", unit: "%" },
  { field: "youth_literacy_rate", metricId: "SE.ADT.1524.LT.ZS", label: "Youth literacy", unit: "%" },
] as const;

const asFields = (record: any): Record<string, any> =>
  record && typeof record === "object" && record.fields && typeof record.fields === "object"
    ? record.fields
    : (record && typeof record === "object" ? record : {});

const attribution: Attribution = {
  provider: WDI_DATASET.provider,
  text: WDI_DATASET.attribution,
  licence: WDI_DATASET.licence,
  licenceUrl: WDI_DATASET.licenceUrl,
  sourceUrl: WDI_DATASET.officialDatasetUrl,
};

const limitations: Limitation[] = [
  { code: "COUNTRY_AGGREGATE", text: "Country-level values do not describe every place or population group within the country." },
  { code: "MIXED_VINTAGE", text: "Latest available year differs by indicator and country; always show the year with the value." },
  { code: "MISSING_NOT_ZERO", text: "Missing values are unknown/unavailable, never zero." },
];

export interface CountryDevelopmentContext {
  country: CountryIdentity;
  sourceDataset: "wdi001";
  retrievedAt: string;
  series: CountrySeries[];
}

export interface CountryContextResponse {
  ok: boolean;
  dataset: "wdi001";
  country: string;
  retrievedAt: string;
  totalCount: number | null;
  records: unknown[];
  error?: string;
}

export const normaliseWdiCountryContext = (
  country: CountryIdentity,
  records: unknown[],
  retrievedAt: string,
): CountryDevelopmentContext => {
  const series = WDI_METRICS.map((definition): CountrySeries => {
    const observations: CountryMetric[] = records
      .map(asFields)
      .filter((row) => row.country === country.iso2 && row[definition.field] !== null && row[definition.field] !== undefined && row[definition.field] !== "")
      .map((row) => ({
        countryId: country.id,
        metricId: definition.metricId,
        label: definition.label,
        value: Number.isFinite(Number(row[definition.field])) ? Number(row[definition.field]) : String(row[definition.field]),
        unit: definition.unit,
        period: String(row.year ?? "").trim() || undefined,
        sourceDataset: "wdi001",
        sourceUrl: WDI_DATASET.officialDatasetUrl,
        vintage: {
          period: String(row.year ?? "").trim() || undefined,
          retrievedAt,
        },
        attribution,
        limitations,
      }))
      .sort((a, b) => Number(a.period || 0) - Number(b.period || 0));

    return {
      countryId: country.id,
      metricId: definition.metricId,
      label: definition.label,
      unit: definition.unit,
      observations,
    };
  }).filter((item) => item.observations.length > 0);

  return {
    country,
    sourceDataset: "wdi001",
    retrievedAt,
    series,
  };
};

export const latestCountryMetrics = (context: CountryDevelopmentContext): CountryMetric[] =>
  context.series
    .map((series) => series.observations[series.observations.length - 1])
    .filter((metric): metric is CountryMetric => Boolean(metric));

export async function fetchCountryDevelopmentContext(iso2OrIso3: string): Promise<CountryDevelopmentContext | null> {
  const country = await findCountryIdentity(iso2OrIso3);
  if (!country) return null;

  const response = await fetch(`${WDI_DATASET.apiPath}&country=${encodeURIComponent(country.iso2)}`, {
    headers: { accept: "application/json" },
  });
  const body: CountryContextResponse | null = await response.json().catch(() => null);
  if (!response.ok || !body || body.ok !== true || !Array.isArray(body.records)) {
    throw new Error(String(body?.error || "WDI_COUNTRY_CONTEXT_UNAVAILABLE"));
  }
  return normaliseWdiCountryContext(country, body.records, String(body.retrievedAt ?? ""));
}
