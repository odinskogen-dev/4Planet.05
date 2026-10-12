export type GbifOccurrenceRightsReviewState = "PUBLIC_USE_READY" | "REVIEW_REQUIRED";

export const GBIF_FILTERED_TOTAL_SEMANTICS = "GBIF_FILTERED_PRESENT_NO_GEOSPATIAL_ISSUE" as const;

const text = (value: unknown): string | undefined => {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
};

export function gbifOccurrenceRightsReviewState(licence: unknown): GbifOccurrenceRightsReviewState {
  const value = text(licence)?.toUpperCase() ?? "";
  if (!value) return "REVIEW_REQUIRED";
  if (/\b(CC0|PUBLIC DOMAIN)\b/.test(value) || /CREATIVECOMMONS\.ORG\/PUBLICDOMAIN\/(ZERO|MARK)\//.test(value)) {
    return "PUBLIC_USE_READY";
  }
  const plainBy = /\bCC\s*BY\b/.test(value) || /CREATIVECOMMONS\.ORG\/LICENSES\/BY\//.test(value);
  if (plainBy && !/\b(NC|ND|SA)\b|\/LICENSES\/BY-(NC|ND|SA)/.test(value)) return "PUBLIC_USE_READY";
  return "REVIEW_REQUIRED";
}

export function finiteGbifCoordinate(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function isSemanticallyAdmissibleGbifOccurrence(row: any): boolean {
  return (
    row?.occurrenceStatus === "PRESENT" &&
    row?.hasGeospatialIssue !== true &&
    finiteGbifCoordinate(row?.decimalLatitude, -90, 90) &&
    finiteGbifCoordinate(row?.decimalLongitude, -180, 180)
  );
}

export function gbifOccurrenceProvenance(row: any, retrievedAt: string) {
  const licence = text(row?.license ?? row?.licence);
  return {
    licence,
    datasetKey: text(row?.datasetKey),
    datasetTitle: text(row?.datasetTitle ?? row?.datasetName),
    publisher: text(row?.publisher ?? row?.publishingOrganizationTitle ?? row?.institutionCode),
    publishingOrgKey: text(row?.publishingOrgKey),
    datasetCitation: text(row?.bibliographicCitation),
    datasetDoi: text(row?.datasetDOI ?? row?.datasetDoi),
    eventDate: text(row?.eventDate),
    retrievedAt,
    occurrenceStatus: text(row?.occurrenceStatus),
    hasGeospatialIssue: row?.hasGeospatialIssue === true,
    rightsReviewState: gbifOccurrenceRightsReviewState(licence),
  };
}
