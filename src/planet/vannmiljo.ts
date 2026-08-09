import { OSLOFJORD_PRIMARY_WATERBODY_ID } from "@/data/oslofjordenSpatial";

const API = "https://vannmiljoapi.miljodirektoratet.no/api/Public";
const SOURCE_URL = "https://vannmiljoapi.miljodirektoratet.no/swagger/ui/index";

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
  rights: "SOURCE_TERMS_REVIEW_REQUIRED";
  issues: string[];
}

export type VannmiljoResult =
  | {
      ok: true;
      checkedAt: string;
      source: "VANNMILJO";
      waterBodyId: string;
      total: number;
      records: VannmiljoRegistration[];
      query: {
        contract: "WATERBODY_ID_FILTER";
        waterBodyIds: string[];
        fromRegisteredDate?: string;
        maxReturnCount: number;
      };
    }
  | {
      ok: false;
      checkedAt: string;
      source: "VANNMILJO";
      waterBodyId: string;
      error: "SOURCE_UNAVAILABLE" | "TIMEOUT" | "INVALID_RESPONSE";
    };

type JsonResult = { ok: true; data: any } | { ok: false; error: "SOURCE_UNAVAILABLE" | "TIMEOUT" | "INVALID_RESPONSE" };

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
      return {
        id: `observation:vannmiljo:${row.WaterRegistrationID}`,
        waterRegistrationId: Number(row.WaterRegistrationID),
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
        samplingTime: cleanDate(row.SamplingTime),
        registeredAt: cleanDate(row.RegDate),
        lastEditedAt: cleanDate(row.LastEditDate),
        value: typeof row.RegValue === "number" ? row.RegValue : undefined,
        valueOperator: row.ValueOperator ? String(row.ValueOperator) : undefined,
        unit: row.Unit ? String(row.Unit) : undefined,
        upperDepth: typeof row.UpperDepth === "number" ? row.UpperDepth : undefined,
        lowerDepth: typeof row.LowerDepth === "number" ? row.LowerDepth : undefined,
        lat,
        lng,
        sourceId: row.SourceID ? String(row.SourceID) : undefined,
        sourceUrl: SOURCE_URL,
        rights: "SOURCE_TERMS_REVIEW_REQUIRED" as const,
        issues,
      };
    });

  return {
    ok: true,
    checkedAt,
    source: "VANNMILJO",
    waterBodyId,
    total: typeof registrations.data.ResultCount === "number" ? registrations.data.ResultCount : records.length,
    records,
    query: {
      contract: "WATERBODY_ID_FILTER",
      waterBodyIds: [waterBodyId],
      fromRegisteredDate,
      maxReturnCount: limit,
    },
  };
}
