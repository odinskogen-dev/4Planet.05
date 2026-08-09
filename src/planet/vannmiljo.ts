import { OSLOFJORD_PRIMARY_WATERBODY_ID } from "@/data/oslofjordenSpatial";
import type { RuntimeProvenanceEnvelope } from "@/planet/runtimeTruth";

const API = "https://vannmiljoapi.miljodirektoratet.no/api/Public";
const SOURCE_URL = "https://vannmiljoapi.miljodirektoratet.no/swagger/ui/index";
const LICENSE_URL = "https://data.norge.no/nlod/no/2.0";
const DATASET_URL = "https://kartkatalog.miljodirektoratet.no/dataset/Details/70";
const KNOWLEDGE_OS_SOURCE_ID = "SRC-RUNTIME-VANNMILJO-001";

export interface VannmiljoRegistration {
  id: string;
  waterRegistrationId: number;
  waterLocationId: number;
  waterLocationCode?: string;
  waterLocationName?: string;
  waterBodyId: string;
  waterBodyName?: string;
  scientificName?: string;
  parameterId?: string;
  parameterName?: string;
  mediumName?: string;
  activityName?: string;
  samplingMethodName?: string;
  analysisMethodName?: string;
  samplingTime?: string;
  registeredAt?: string;
  lastEditedAt?: string;
  value?: number;
  valueOperator?: string;
  unit?: string;
  upperDepth?: number;
  lowerDepth?: number;
  lat?: number;
  lng?: number;
  sourceId?: string;
  sourceUrl: string;
  sourcePublisher: "Miljødirektoratet";
  rights: "NLOD_2_0_ATTRIBUTION_REQUIRED";
  licenseUrl: string;
  issues: string[];
  provenance: RuntimeProvenanceEnvelope;
}

export type VannmiljoError = "SOURCE_UNAVAILABLE" | "SOURCE_CONTRACT_REJECTED" | "TIMEOUT" | "INVALID_RESPONSE";

export type VannmiljoResult =
  | {
      ok: true;
      checkedAt: string;
      source: "VANNMILJO";
      waterBodyId: string;
      total: number;
      records: VannmiljoRegistration[];
      countMeaning: "REGISTRATION_RECORDS_NOT_ECOLOGICAL_STATUS";
      query: {
        contract: "WATERBODY_ID_FILTER";
        waterBodyIds: string[];
        fromRegisteredDate?: string;
        maxReturnCount: number;
        coverage: "BOUNDED_WINDOW";
      };
    }
  | {
      ok: false;
      checkedAt: string;
      source: "VANNMILJO";
      waterBodyId: string;
      error: VannmiljoError;
    };

type JsonResult = { ok: true; data: any } | { ok: false; error: VannmiljoError };

const cleanDate = (value: unknown): string | undefined => {
  if (!value) return undefined;
  const raw = String(value);
  return raw.length >= 10 ? raw.slice(0, 10) : raw;
};

const postJson = async (path: string, body: Record<string, unknown>): Promise<JsonResult> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 14000);
  try {
    const response = await fetch(`${API}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (response.status === 400) return { ok: false, error: "SOURCE_CONTRACT_REJECTED" };
    if (!response.ok) return { ok: false, error: "SOURCE_UNAVAILABLE" };
    const data = await response.json();
    if (!data || !Array.isArray(data.Result)) return { ok: false, error: "INVALID_RESPONSE" };
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error?.name === "AbortError" ? "TIMEOUT" : "SOURCE_UNAVAILABLE" };
  } finally {
    window.clearTimeout(timeout);
  }
};

/**
 * Reads source registrations linked by Vannmiljø itself to one official
 * Vann-Nett WaterBodyID. No 4PLANET polygon or point-in-polygon inference is
 * involved in membership. Coordinates are attached from Vannmiljø's own water
 * location result when available.
 *
 * Official Vannmiljø API documentation accepts WaterBodyIDFilter and the
 * Miljødirektoratet dataset catalogue lists the Vannmiljø dataset under NLOD.
 * A source-side HTTP 400 is therefore surfaced as SOURCE_CONTRACT_REJECTED,
 * never as zero records.
 */
export async function fetchVannmiljoRegistrations(options: {
  waterBodyId?: string;
  limit?: number;
  fromRegisteredDate?: string;
} = {}): Promise<VannmiljoResult> {
  const checkedAt = new Date().toISOString();
  const waterBodyId = options.waterBodyId ?? OSLOFJORD_PRIMARY_WATERBODY_ID;
  const limit = Math.min(Math.max(options.limit ?? 80, 1), 250);
  const fromRegisteredDate = options.fromRegisteredDate?.slice(0, 10);

  const registrationBody: Record<string, unknown> = {
    MaxReturnCount: limit,
    RegType: 1,
    WaterBodyIDFilter: [waterBodyId],
    WaterLocationCategoryFilter: ["C"],
  };
  if (fromRegisteredDate) registrationBody.FromRegDate = fromRegisteredDate;

  const [registrations, locations] = await Promise.all([
    postJson("GetRegistrations", registrationBody),
    postJson("GetWaterLocations", {
      MaxReturnCount: 1000,
      WaterBodyIDFilter: [waterBodyId],
      WaterLocationCategoryFilter: ["C"],
      HasWaterRegistrations: true,
    }),
  ]);

  if (!registrations.ok) {
    return { ok: false, checkedAt, source: "VANNMILJO", waterBodyId, error: registrations.error };
  }

  const locationById = new Map<number, any>();
  if (locations.ok) {
    for (const row of locations.data.Result) {
      if (typeof row?.WaterLocationID === "number") locationById.set(row.WaterLocationID, row);
    }
  }

  const records: VannmiljoRegistration[] = registrations.data.Result
    .filter((row: any) => typeof row?.WaterRegistrationID === "number")
    .map((row: any) => {
      const location = locationById.get(Number(row.WaterLocationID));
      const lat = typeof location?.CoordY_dg === "number" ? location.CoordY_dg : undefined;
      const lng = typeof location?.CoordX_dg === "number" ? location.CoordX_dg : undefined;
      const issues: string[] = [];
      if (lat == null || lng == null) issues.push("NO_WGS84_LOCATION_RETURNED");
      if (!row.SamplingTime) issues.push("NO_SAMPLING_TIME_RETURNED");
      if (!row.VitenskapligNavn) issues.push("NOT_A_SPECIES_REGISTRATION");
      const samplingTime = cleanDate(row.SamplingTime);
      const registeredAt = cleanDate(row.RegDate);
      const lastEditedAt = cleanDate(row.LastEditDate);
      const waterRegistrationId = Number(row.WaterRegistrationID);
      const sourceRecordId = `observation:vannmiljo:${waterRegistrationId}`;

      const provenance: RuntimeProvenanceEnvelope = {
        sourceRecordId,
        sourceId: KNOWLEDGE_OS_SOURCE_ID,
        provider: "Miljødirektoratet / Vannmiljø",
        originalPublisher: "Miljødirektoratet",
        dataset: "Miljøtilstand i vann / Vannmiljø",
        upstreamRecordId: String(waterRegistrationId),
        retrievedAt: checkedAt,
        observationTime: samplingTime,
        eventTime: samplingTime,
        sourceProductDate: lastEditedAt ?? registeredAt,
        datasetFreshness: samplingTime
          ? { kind: "OBSERVATION_TIME", label: `SAMPLED ${samplingTime}`, asOf: samplingTime }
          : { kind: "UNKNOWN", label: "SAMPLING DATE NOT RETURNED" },
        licence: "NLOD 2.0",
        rightsState: "CLEARED",
        attribution: "Miljødirektoratet / Vannmiljø",
        spatialPrecision: lat != null && lng != null ? "UNKNOWN" : "SOURCE_SUPPRESSED",
        geographicScope: `Source-linked to Vann-Nett WaterBodyID ${String(row.WaterBodyID ?? waterBodyId)}; not a 4PLANET polygon inference.`,
        temporalScope: samplingTime ? `Sampling event ${samplingTime}` : "Sampling time not returned",
        limitations: [
          "Registration record, not a complete ecological-status assessment or current condition by itself.",
          "Source-reported station coordinates are not promoted to exact spatial precision without an explicit source precision field.",
          `Dataset catalogue: ${DATASET_URL}`,
        ],
        sensitiveLocationPolicy: "PUBLIC_SOURCE_COORDINATES_ONLY",
      };

      return {
        id: sourceRecordId,
        waterRegistrationId,
        waterLocationId: Number(row.WaterLocationID ?? 0),
        waterLocationCode: row.WaterLocationCode ? String(row.WaterLocationCode) : undefined,
        waterLocationName: row.Name ? String(row.Name) : undefined,
        waterBodyId: String(row.WaterBodyID ?? waterBodyId),
        waterBodyName: row.WaterBody ? String(row.WaterBody) : undefined,
        scientificName: row.VitenskapligNavn ? String(row.VitenskapligNavn) : undefined,
        parameterId: row.ParameterID ? String(row.ParameterID) : undefined,
        parameterName: row.ParameterName ? String(row.ParameterName) : undefined,
        mediumName: row.MediumName ? String(row.MediumName) : undefined,
        activityName: row.ActivityName ? String(row.ActivityName) : undefined,
        samplingMethodName: row.SamplingMethodName ? String(row.SamplingMethodName) : undefined,
        analysisMethodName: row.AnalysisMethodName ? String(row.AnalysisMethodName) : undefined,
        samplingTime,
        registeredAt,
        lastEditedAt,
        value: typeof row.RegValue === "number" ? row.RegValue : undefined,
        valueOperator: row.ValueOperator ? String(row.ValueOperator) : undefined,
        unit: row.Unit ? String(row.Unit) : undefined,
        upperDepth: typeof row.UpperDepth === "number" ? row.UpperDepth : undefined,
        lowerDepth: typeof row.LowerDepth === "number" ? row.LowerDepth : undefined,
        lat,
        lng,
        sourceId: row.SourceID ? String(row.SourceID) : undefined,
        sourceUrl: SOURCE_URL,
        sourcePublisher: "Miljødirektoratet" as const,
        rights: "NLOD_2_0_ATTRIBUTION_REQUIRED" as const,
        licenseUrl: LICENSE_URL,
        issues,
        provenance,
      };
    });

  return {
    ok: true,
    checkedAt,
    source: "VANNMILJO",
    waterBodyId,
    total: typeof registrations.data.ResultCount === "number" ? registrations.data.ResultCount : records.length,
    records,
    countMeaning: "REGISTRATION_RECORDS_NOT_ECOLOGICAL_STATUS",
    query: {
      contract: "WATERBODY_ID_FILTER",
      waterBodyIds: [waterBodyId],
      fromRegisteredDate,
      maxReturnCount: limit,
      coverage: "BOUNDED_WINDOW",
    },
  };
}
