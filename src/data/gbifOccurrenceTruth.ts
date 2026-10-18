export type GbifOccurrenceRightsReviewState = "PUBLIC_USE_READY" | "REVIEW_REQUIRED";

export const GBIF_FILTERED_TOTAL_SEMANTICS = "GBIF_FILTERED_PRESENT_NO_GEOSPATIAL_ISSUE" as const;

const text = (value: unknown): string | undefined => {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
};

type GbifLicenceClass = "PUBLIC_DOMAIN_OR_CC0" | "CC_BY" | "REVIEW_REQUIRED";

function classifyGbifLicence(licence: unknown): GbifLicenceClass {
  const raw = text(licence);
  if (!raw) return "REVIEW_REQUIRED";

  const value = raw.trim();
  const upper = value.toUpperCase();
  if (/\b(?:NOT|NO|WITHOUT)\s+(?:A\s+)?(?:CC0|PUBLIC DOMAIN|CC\s*BY)\b/.test(upper)) {
    return "REVIEW_REQUIRED";
  }
  if (/\b(?:NC|ND|SA)\b|BY-(?:NC|ND|SA)/.test(upper)) return "REVIEW_REQUIRED";

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return "REVIEW_REQUIRED";
    const host = parsed.hostname.toLowerCase();
    if (host !== "creativecommons.org" && host !== "www.creativecommons.org") {
      return "REVIEW_REQUIRED";
    }
    const path = parsed.pathname.toLowerCase().replace(/\/+$/, "");
    if (path === "/publicdomain/zero/1.0" || path === "/publicdomain/mark/1.0") {
      return "PUBLIC_DOMAIN_OR_CC0";
    }
    if (/^\/licenses\/by\/(?:1\.0|2\.0|2\.5|3\.0|4\.0)$/.test(path)) return "CC_BY";
    return "REVIEW_REQUIRED";
  } catch {
    // Plain licence labels are handled below; partial URLs and lookalike hosts fail closed.
  }

  if (/^(?:CC0|CC0\s+1\.0|PUBLIC DOMAIN|PUBLIC DOMAIN MARK(?:\s+1\.0)?)$/i.test(value)) {
    return "PUBLIC_DOMAIN_OR_CC0";
  }
  if (/^CC\s+BY\s+(?:1\.0|2\.0|2\.5|3\.0|4\.0)$/i.test(value)) return "CC_BY";
  return "REVIEW_REQUIRED";
}

function hasGbifAttributionPath(row: any): boolean {
  const hasAttributionIdentity = Boolean(
    text(row?.publisher ?? row?.publishingOrganizationTitle ?? row?.institutionCode ?? row?.rightsHolder),
  );
  const hasDatasetIdentity = Boolean(text(row?.datasetKey));
  const hasCitationIdentity = Boolean(
    text(row?.bibliographicCitation) || text(row?.datasetDOI ?? row?.datasetDoi),
  );
  const hasOccurrenceIdentity = Boolean(text(row?.key ?? row?.occurrenceID));
  return hasAttributionIdentity && hasDatasetIdentity && hasCitationIdentity && hasOccurrenceIdentity;
}

export function gbifOccurrenceRightsReviewState(
  licence: unknown,
  row?: any,
): GbifOccurrenceRightsReviewState {
  const licenceClass = classifyGbifLicence(licence);
  if (licenceClass === "PUBLIC_DOMAIN_OR_CC0") return "PUBLIC_USE_READY";
  if (licenceClass === "CC_BY" && hasGbifAttributionPath(row)) return "PUBLIC_USE_READY";
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
  const sourceRecordId = text(row?.key ?? row?.occurrenceID);
  const occurrenceUrl = sourceRecordId
    ? /^https?:\/\//i.test(sourceRecordId)
      ? sourceRecordId
      : `https://www.gbif.org/occurrence/${encodeURIComponent(sourceRecordId)}`
    : undefined;
  let licenceUrl: string | undefined;
  try {
    const parsed = new URL(licence ?? "");
    if (parsed.protocol === "https:") licenceUrl = parsed.href;
  } catch {
    licenceUrl = undefined;
  }

  return {
    licence,
    licenceUrl,
    datasetKey: text(row?.datasetKey),
    datasetTitle: text(row?.datasetTitle ?? row?.datasetName),
    publisher: text(row?.publisher ?? row?.publishingOrganizationTitle ?? row?.institutionCode),
    publishingOrgKey: text(row?.publishingOrgKey),
    datasetCitation: text(row?.bibliographicCitation),
    datasetDoi: text(row?.datasetDOI ?? row?.datasetDoi),
    occurrenceUrl,
    eventDate: text(row?.eventDate),
    retrievedAt,
    checkedAt: retrievedAt,
    occurrenceStatus: text(row?.occurrenceStatus),
    hasGeospatialIssue: row?.hasGeospatialIssue === true,
    rightsReviewState: gbifOccurrenceRightsReviewState(licence, row),
  };
}
