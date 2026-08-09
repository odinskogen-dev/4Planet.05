export type PlaceGeometryUse =
  | "DISPLAY"
  | "SCIENTIFIC"
  | "MANAGEMENT"
  | "WATERBODY"
  | "QUERY"
  | "ADMINISTRATIVE"
  | "REGULATORY";

/**
 * Canonical product-facing role. The same real-world polygon may legitimately
 * appear in more than one source, but 4PLANET never silently promotes one role
 * into another. In particular, SEMANTIC_IDENTITY is not a query polygon.
 */
export type PlaceGeometryRole =
  | "SEMANTIC_IDENTITY"
  | "DISPLAY"
  | "BIODIVERSITY_QUERY"
  | "SCIENTIFIC_AREA"
  | "WATERBODY_STATUS"
  | "REGULATORY"
  | "ADMINISTRATIVE";

export type GeometryAvailability =
  | "INGESTED"
  | "RUNTIME_SOURCE"
  | "SOURCE_AVAILABLE_NOT_INGESTED"
  | "NOT_SELECTED"
  | "NOT_AVAILABLE";

export type SupersessionState = "CURRENT" | "SUPERSEDED" | "UNKNOWN";

export interface PlaceSourceRef {
  id: string;
  label: string;
  publisher: string;
  url: string;
  checkedAt: string;
  publishedAt?: string;
  sourceVersion?: string;
}

export interface GeometryRights {
  status: "OPEN" | "PUBLIC_SERVICE" | "REVIEW_REQUIRED" | "RESTRICTED" | "UNKNOWN";
  label: string;
  url?: string;
  reuseNote?: string;
}

export interface PlaceGeometryRef {
  id: string;
  /** Legacy adapter field retained while ATLAS moves to role. */
  use: PlaceGeometryUse;
  role: PlaceGeometryRole;
  label: string;
  availability: GeometryAvailability;
  source?: PlaceSourceRef;
  sourceRecordId?: string;
  geometryType?: "POINT" | "BOUNDING_BOX" | "POLYGON" | "MULTIPOLYGON" | "WATERBODY_SET";
  crs?: string;
  sourceVersion?: string;
  effectiveAt?: string;
  rights?: GeometryRights;
  intendedUse: string;
  precision?: string;
  resolution?: string;
  supersessionState: SupersessionState;
  /** Product-facing explanation of exactly what this geometry can and cannot mean. */
  limitation: string;
}

/**
 * Source-backed relation between two place identities. A hierarchy edge is not
 * a geometry edge: PART_OF never licenses 4PLANET to manufacture a polygon for
 * the child or parent.
 */
export interface PlaceRelationRef {
  id: string;
  relation: "PART_OF" | "CONTAINS" | "OVERLAPS" | "ADJACENT_TO";
  fromPlaceId: string;
  toPlaceId: string;
  label: string;
  source: PlaceSourceRef;
  sourceRecordId: string;
  representativePoint?: {
    lat: number;
    lng: number;
    crs: string;
  };
  limitation: string;
}

export interface PlaceIdentity {
  id: string;
  name: string;
  kind: "FJORD" | "MARINE_AREA" | "CITY" | "REGION" | "FOREST" | "RIVER" | "OTHER";
  source: PlaceSourceRef;
  sourceRecordId: string;
  representativePoint?: {
    lat: number;
    lng: number;
    precisionMetres?: number;
    crs: string;
  };
  altNames?: string[];
  geometries: PlaceGeometryRef[];
  /** One sentence preventing semantic identity from silently becoming spatial membership. */
  identityLimitation: string;
}

export const geometryByUse = (place: PlaceIdentity, use: PlaceGeometryUse) =>
  place.geometries.filter((geometry) => geometry.use === use);

export const geometryByRole = (place: PlaceIdentity, role: PlaceGeometryRole) =>
  place.geometries.filter((geometry) => geometry.role === role);

export const canQueryPlace = (place: PlaceIdentity) =>
  geometryByRole(place, "BIODIVERSITY_QUERY").some((geometry) =>
    geometry.availability === "INGESTED" || geometry.availability === "RUNTIME_SOURCE",
  );
