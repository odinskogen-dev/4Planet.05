import { OSLOFJORD_PRIMARY_WATERBODY_ID } from "@/data/oslofjordenSpatial";

const LAYER_URL = "https://arcgis001.miljodirektoratet.no/arcgis/rest/services/vann_nett_ekstern/Vannmiljo/MapServer/1";

export type GeoJsonPolygon = {
  type: "Polygon" | "MultiPolygon";
  coordinates: unknown;
};

export interface WaterbodyGeometryRecord {
  id: string;
  waterBodyId: string;
  name: string;
  geometry: GeoJsonPolygon;
  sourceCrs: "EPSG:25833";
  deliveredCrs: "EPSG:4326";
  ecologicalStatusId?: string;
  chemicalStatusId?: string;
  sourceLastChangedAt?: string;
  sourceUrl: string;
  checkedAt: string;
  rights: "PUBLIC_SERVICE_REUSE_REVIEW_REQUIRED";
  limitation: string;
}

export type WaterbodyGeometryResult =
  | { ok: true; record: WaterbodyGeometryRecord }
  | { ok: false; checkedAt: string; error: "SOURCE_UNAVAILABLE" | "TIMEOUT" | "NO_RECORDS" | "INVALID_RESPONSE" };

const validWaterBodyId = (value: string) => /^[0-9A-Za-z-]{4,32}$/.test(value);

/**
 * Fetches one official Vann-Nett coastal-waterbody polygon at runtime.
 * The polygon is retained as WATERBODY_STATUS geography only. It is not cached
 * or converted into a canonical Oslofjorden boundary by this adapter.
 */
export async function fetchWaterbodyGeometry(
  waterBodyId = OSLOFJORD_PRIMARY_WATERBODY_ID,
): Promise<WaterbodyGeometryResult> {
  const checkedAt = new Date().toISOString();
  if (!validWaterBodyId(waterBodyId)) return { ok: false, checkedAt, error: "INVALID_RESPONSE" };

  const query = new URLSearchParams({
    where: `WaterBodyID='${waterBodyId}'`,
    outFields: "WaterBodyID,Name,Lat,Lon,LCDateTime,EcologicalStatusId,ChemicalStatusId",
    returnGeometry: "true",
    outSR: "4326",
    geometryPrecision: "5",
    f: "geojson",
  });

  const sourceUrl = `${LAYER_URL}/query?${query.toString()}`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(sourceUrl, { signal: controller.signal });
    if (!response.ok) return { ok: false, checkedAt, error: "SOURCE_UNAVAILABLE" };
    const json = await response.json();
    if (!json || !Array.isArray(json.features)) return { ok: false, checkedAt, error: "INVALID_RESPONSE" };
    if (!json.features.length) return { ok: false, checkedAt, error: "NO_RECORDS" };

    const feature = json.features[0];
    if (!feature?.geometry || !["Polygon", "MultiPolygon"].includes(feature.geometry.type)) {
      return { ok: false, checkedAt, error: "INVALID_RESPONSE" };
    }

    const p = feature.properties ?? {};
    return {
      ok: true,
      record: {
        id: `geometry:vann-nett:${waterBodyId}`,
        waterBodyId: String(p.WaterBodyID ?? waterBodyId),
        name: String(p.Name ?? "Unnamed coastal waterbody"),
        geometry: feature.geometry,
        sourceCrs: "EPSG:25833",
        deliveredCrs: "EPSG:4326",
        ecologicalStatusId: p.EcologicalStatusId ? String(p.EcologicalStatusId) : undefined,
        chemicalStatusId: p.ChemicalStatusId ? String(p.ChemicalStatusId) : undefined,
        sourceLastChangedAt: p.LCDateTime ? new Date(Number(p.LCDateTime)).toISOString() : undefined,
        sourceUrl,
        checkedAt,
        rights: "PUBLIC_SERVICE_REUSE_REVIEW_REQUIRED",
        limitation: "This is the official geometry of one Vann-Nett coastal waterbody. It is not the semantic, ecological, regulatory, display or universal boundary of Oslofjorden.",
      },
    };
  } catch (error: any) {
    return { ok: false, checkedAt, error: error?.name === "AbortError" ? "TIMEOUT" : "SOURCE_UNAVAILABLE" };
  } finally {
    window.clearTimeout(timeout);
  }
}
