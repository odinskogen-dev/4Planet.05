/*
  4PLANET_ — SOURCE-DATASET OCCURRENCE CONNECTOR

  Purpose: retrieve exact occurrence records from one already-admitted GBIF
  dataset without inventing a place polygon. This is useful when the dataset
  itself has a defensible published geographic scope, as with the Inner
  Oslofjorden Phytoplankton Database.

  Truth rules:
  - dataset record ≠ current position
  - record count ≠ abundance
  - occurrence ≠ trend
  - source geographic scope ≠ universal 4PLANET place boundary
  - failed source ≠ zero records
*/

export interface DatasetOccurrenceRecord {
  gbifId: string;
  datasetKey: string;
  occurrenceId?: string;
  scientificName: string;
  acceptedScientificName?: string;
  taxonKey?: number;
  eventDate?: string;
  year?: number;
  lat: number;
  lng: number;
  coordinateUncertaintyInMeters?: number;
  basisOfRecord?: string;
  occurrenceStatus?: string;
  locality?: string;
  waterBody?: string;
  recordedBy?: string;
  catalogNumber?: string;
  license?: string;
  rightsHolder?: string;
  issues: string[];
  sourceUrl: string;
}

export type DatasetOccurrenceResult =
  | {
      ok: true;
      checkedAt: string;
      total: number;
      records: DatasetOccurrenceRecord[];
    }
  | {
      ok: false;
      checkedAt: string;
      error: "SOURCE_UNAVAILABLE" | "TIMEOUT" | "INVALID_RESPONSE";
    };

const cleanDate = (value: unknown): string | undefined => {
  if (!value) return undefined;
  const raw = String(value);
  return raw.length >= 10 ? raw.slice(0, 10) : raw;
};

export async function fetchDatasetOccurrences(
  datasetKey: string,
  options: { limit?: number; requestLimit?: number } = {},
): Promise<DatasetOccurrenceResult> {
  const checkedAt = new Date().toISOString();
  const requestLimit = Math.min(Math.max(options.requestLimit ?? 120, 1), 300);
  const displayLimit = Math.min(Math.max(options.limit ?? 12, 1), requestLimit);
  const query = new URLSearchParams({
    datasetKey,
    hasCoordinate: "true",
    limit: String(requestLimit),
  });

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`https://api.gbif.org/v1/occurrence/search?${query.toString()}`, {
      signal: controller.signal,
    });
    if (!response.ok) return { ok: false, checkedAt, error: "SOURCE_UNAVAILABLE" };
    const json = await response.json();
    if (!json || !Array.isArray(json.results)) return { ok: false, checkedAt, error: "INVALID_RESPONSE" };

    const records = json.results
      .filter((row: any) => typeof row?.decimalLatitude === "number" && typeof row?.decimalLongitude === "number")
      .map((row: any): DatasetOccurrenceRecord => ({
        gbifId: String(row.key ?? row.gbifID ?? ""),
        datasetKey: String(row.datasetKey ?? datasetKey),
        occurrenceId: row.occurrenceID ? String(row.occurrenceID) : undefined,
        scientificName: String(row.scientificName ?? row.species ?? row.acceptedScientificName ?? "Unidentified taxon"),
        acceptedScientificName: row.acceptedScientificName ? String(row.acceptedScientificName) : undefined,
        taxonKey: typeof row.taxonKey === "number" ? row.taxonKey : typeof row.speciesKey === "number" ? row.speciesKey : undefined,
        eventDate: cleanDate(row.eventDate),
        year: typeof row.year === "number" ? row.year : undefined,
        lat: row.decimalLatitude,
        lng: row.decimalLongitude,
        coordinateUncertaintyInMeters: typeof row.coordinateUncertaintyInMeters === "number" ? row.coordinateUncertaintyInMeters : undefined,
        basisOfRecord: row.basisOfRecord ? String(row.basisOfRecord) : undefined,
        occurrenceStatus: row.occurrenceStatus ? String(row.occurrenceStatus) : undefined,
        locality: row.locality ? String(row.locality) : undefined,
        waterBody: row.waterBody ? String(row.waterBody) : undefined,
        recordedBy: row.recordedBy ? String(row.recordedBy) : undefined,
        catalogNumber: row.catalogNumber ? String(row.catalogNumber) : undefined,
        license: row.license ? String(row.license) : undefined,
        rightsHolder: row.rightsHolder ? String(row.rightsHolder) : undefined,
        issues: Array.isArray(row.issues) ? row.issues.map(String) : [],
        sourceUrl: row.key ? `https://www.gbif.org/occurrence/${row.key}` : "https://www.gbif.org/",
      }))
      .filter((row: DatasetOccurrenceRecord) => row.gbifId)
      .sort((a: DatasetOccurrenceRecord, b: DatasetOccurrenceRecord) => {
        const aTime = a.eventDate ? Date.parse(a.eventDate) : 0;
        const bTime = b.eventDate ? Date.parse(b.eventDate) : 0;
        return bTime - aTime;
      })
      .slice(0, displayLimit);

    return {
      ok: true,
      checkedAt,
      total: typeof json.count === "number" ? json.count : records.length,
      records,
    };
  } catch (error: any) {
    return { ok: false, checkedAt, error: error?.name === "AbortError" ? "TIMEOUT" : "SOURCE_UNAVAILABLE" };
  } finally {
    window.clearTimeout(timeout);
  }
}
