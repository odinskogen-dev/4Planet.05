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

import type { RuntimeProvenanceEnvelope } from "@/planet/runtimeTruth";

export interface DatasetOccurrenceRecord {
  gbifId: string;
  datasetKey: string;
  datasetTitle?: string;
  publishingOrgKey?: string;
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
  provenance: RuntimeProvenanceEnvelope;
}

export type DatasetOccurrenceResult =
  | {
      ok: true;
      checkedAt: string;
      total: number;
      records: DatasetOccurrenceRecord[];
      countMeaning: "OCCURRENCE_RECORDS_NOT_POPULATION";
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

const recordSpatialPrecision = (issues: string[]) =>
  issues.some((issue) => /COORDINATE_ROUNDED|COORDINATE_UNCERTAINTY/i.test(issue)) ? "GENERALIZED" as const : "UNKNOWN" as const;

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
      .map((row: any): DatasetOccurrenceRecord => {
        const gbifId = String(row.key ?? row.gbifID ?? "");
        const resolvedDatasetKey = String(row.datasetKey ?? datasetKey);
        const datasetTitle = row.datasetTitle ? String(row.datasetTitle) : undefined;
        const publishingOrgKey = row.publishingOrgKey ? String(row.publishingOrgKey) : undefined;
        const eventDate = cleanDate(row.eventDate);
        const issues = Array.isArray(row.issues) ? row.issues.map(String) : [];
        const license = row.license ? String(row.license) : undefined;
        const coordinateUncertaintyInMeters = typeof row.coordinateUncertaintyInMeters === "number" ? row.coordinateUncertaintyInMeters : undefined;
        const sourceUrl = row.key ? `https://www.gbif.org/occurrence/${row.key}` : "https://www.gbif.org/";
        const limitations = [
          "Occurrence record, not a current position, abundance estimate or trend.",
          "GBIF is the access/aggregation layer; upstream dataset identity and licence remain material.",
          ...(coordinateUncertaintyInMeters != null ? [`Source reports coordinate uncertainty of ${coordinateUncertaintyInMeters} m.`] : ["Coordinate precision is not established as exact by this adapter."]),
        ];

        const provenance: RuntimeProvenanceEnvelope = {
          sourceRecordId: gbifId ? `gbif:occurrence:${gbifId}` : undefined,
          sourceId: "SRC-W02-GBIF-API-001",
          provider: "GBIF",
          originalPublisher: publishingOrgKey ? `GBIF publishing organisation ID ${publishingOrgKey}` : undefined,
          dataset: datasetTitle ?? resolvedDatasetKey,
          upstreamDataset: resolvedDatasetKey,
          upstreamRecordId: row.occurrenceID ? String(row.occurrenceID) : gbifId,
          retrievedAt: checkedAt,
          observationTime: eventDate,
          datasetFreshness: eventDate
            ? { kind: "OBSERVATION_TIME", label: `OBSERVED ${eventDate}`, asOf: eventDate }
            : { kind: "UNKNOWN", label: "OBSERVATION DATE NOT STATED" },
          licence: license,
          rightsState: license ? "DATASET_DEPENDENT" : "REVIEW_REQUIRED",
          attribution: row.institutionCode ? String(row.institutionCode) : datasetTitle,
          spatialPrecision: recordSpatialPrecision(issues),
          geographicScope: "Source-reported coordinates; not automatic semantic Oslofjorden membership.",
          temporalScope: eventDate ? `Occurrence event ${eventDate}` : "Occurrence time not established",
          limitations,
          sensitiveLocationPolicy: "PUBLIC_SOURCE_COORDINATES_ONLY",
        };

        return {
          gbifId,
          datasetKey: resolvedDatasetKey,
          datasetTitle,
          publishingOrgKey,
          occurrenceId: row.occurrenceID ? String(row.occurrenceID) : undefined,
          scientificName: String(row.scientificName ?? row.species ?? row.acceptedScientificName ?? "Unidentified taxon"),
          acceptedScientificName: row.acceptedScientificName ? String(row.acceptedScientificName) : undefined,
          taxonKey: typeof row.taxonKey === "number" ? row.taxonKey : typeof row.speciesKey === "number" ? row.speciesKey : undefined,
          eventDate,
          year: typeof row.year === "number" ? row.year : undefined,
          lat: row.decimalLatitude,
          lng: row.decimalLongitude,
          coordinateUncertaintyInMeters,
          basisOfRecord: row.basisOfRecord ? String(row.basisOfRecord) : undefined,
          occurrenceStatus: row.occurrenceStatus ? String(row.occurrenceStatus) : undefined,
          locality: row.locality ? String(row.locality) : undefined,
          waterBody: row.waterBody ? String(row.waterBody) : undefined,
          recordedBy: row.recordedBy ? String(row.recordedBy) : undefined,
          catalogNumber: row.catalogNumber ? String(row.catalogNumber) : undefined,
          license,
          rightsHolder: row.rightsHolder ? String(row.rightsHolder) : undefined,
          issues,
          sourceUrl,
          provenance,
        };
      })
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
      countMeaning: "OCCURRENCE_RECORDS_NOT_POPULATION",
    };
  } catch (error: any) {
    return { ok: false, checkedAt, error: error?.name === "AbortError" ? "TIMEOUT" : "SOURCE_UNAVAILABLE" };
  } finally {
    window.clearTimeout(timeout);
  }
}
