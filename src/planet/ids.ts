/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — ADAPTATION LAYER — IDENTITY
   STATUS: ADAPTATION. NOT CANON. (Brief §24)

   One rule, and it is the whole point of this file:

     THE SAME ENTITY HAS THE SAME ID IN EVERY LENS.

   Earth, Search, Context, Follow, Watch, Now and Place all address the world
   through these strings. V36 had no such thing — a GBIF hit inside the search
   box and a GBIF hit inside the SPECIES layer were unrelated objects that
   happened to share a Latin name. That is the bug this file kills.

   Shape:  <type>:<authority>:<authority's own id>

   The authority segment preserves the external identifier (Brief §24: "Source
   IDs are preserved. Source IDs do not replace canonical identity."). When
   BRAIN issues real 4PLANET ids, this becomes a resolver, not a formatter.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { EntityId, EntityType } from "./types";

/** GBIF taxonKey → taxon:gbif:2440728 */
export const taxonId = (gbifKey: number | string): EntityId => `taxon:gbif:${gbifKey}`;

/** WoRMS AphiaID (OBIS records) → taxon:worms:137205 */
export const taxonIdWorms = (aphiaId: number | string): EntityId => `taxon:worms:${aphiaId}`;

/** Seeded 4PLANET place registry → place:4p:bergen */
export const placeId = (slug: string): EntityId => `place:4p:${slug}`;

/** Seeded living-system graph → living-system:4p:pollination */
export const systemId = (slug: string): EntityId => `living-system:4p:${slug}`;
export const pressureId = (slug: string): EntityId => `pressure:4p:${slug}`;
export const solutionId = (slug: string): EntityId => `solution:4p:${slug}`;
export const missionId = (slug: string): EntityId => `mission:4p:${slug}`;
export const functionId = (slug: string): EntityId => `function:4p:${slug}`;
export const humanSystemId = (slug: string): EntityId => `human-system:4p:${slug}`;

/** Signals keep the feed's own record id. Brief §22 SOURCE RECORD. */
export const signalId = (source: "eonet" | "usgs" | "gbif", recordId: string): EntityId =>
  `signal:${source}:${recordId}`;

/** A raw click on the globe is still an addressable thing. */
export const coordId = (lng: number, lat: number): EntityId =>
  `coordinate:wgs84:${lng.toFixed(4)},${lat.toFixed(4)}`;

export const typeOf = (id: EntityId): EntityType => {
  const head = id.split(":")[0];
  switch (head) {
    case "taxon":
      return "TAXON";
    case "place":
      return "PLACE";
    case "living-system":
      return "LIVING_SYSTEM";
    case "signal":
      return "SIGNAL";
    case "observation":
      return "OBSERVATION";
    case "pressure":
      return "PRESSURE";
    case "solution":
      return "SOLUTION";
    case "mission":
      return "MISSION";
    case "coordinate":
      return "COORDINATE";
    default:
      // P0/P1 (V38R): an unrecognised prefix is UNKNOWN, not a silent coordinate.
      // FUNCTION / HUMAN_SYSTEM graph nodes and any future type land here rather
      // than being falsely treated as a spatial point.
      return "UNKNOWN";
  }
};

/** The authority's own id, recovered. Used to re-query the source. */
export const sourceKeyOf = (id: EntityId): string => id.split(":").slice(2).join(":");
export const authorityOf = (id: EntityId): string => id.split(":")[1] ?? "";

export const isTaxon = (id: EntityId) => typeOf(id) === "TAXON";
export const isPlace = (id: EntityId) => typeOf(id) === "PLACE";
export const isSystem = (id: EntityId) => typeOf(id) === "LIVING_SYSTEM";
