export type PlaceGeometryUse =
  | "DISPLAY"
  | "SCIENTIFIC"
  | "MANAGEMENT"
  | "WATERBODY"
  | "QUERY"
  | "ADMINISTRATIVE"
  | "REGULATORY";

export type GeometryAvailability =
  | "INGESTED"
  | "SOURCE_AVAILABLE_NOT_INGESTED"
  | "NOT_SELECTED"
  | "NOT_AVAILABLE";

export interface PlaceSourceRef {
  id: string;
  label: string;
  publisher: string;
  url: string;
  checkedAt: string;
  publishedAt?: string;
}

export interface PlaceGeometryRef {
  id: string;
  use: PlaceGeometryUse;
  label: string;
  availability: GeometryAvailability;
  source?: PlaceSourceRef;
  sourceRecordId?: string;
  geometryType?: "POINT" | "BOUNDING_BOX" | "POLYGON" | "MULTIPOLYGON" | "WATERBODY_SET";
  /** Product-facing explanation of exactly what this geometry can and cannot mean. */
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

export const canQueryPlace = (place: PlaceIdentity) =>
  geometryByUse(place, "QUERY").some((geometry) => geometry.availability === "INGESTED");
