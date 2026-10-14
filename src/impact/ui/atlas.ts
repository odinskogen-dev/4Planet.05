import type { AtlasView } from "@/earth/atlasViewContract";
import { placeById } from "@/planet/places";
import { humanise, type ImpactPlace } from "@/impact/livingActionNetworkGraph";

/**
 * Builds a view over the ONE existing ATLAS. Never a second map, never invented geometry.
 * Preference: a canonical ATLAS place id → a NATUREBRAIN reference point (navigation
 * camera only) → no map (AtlasEmbed then states that no defensible context exists).
 */
export function impactAtlasView(input: {
  title: string;
  entityId: string;
  atlasPlaceId?: string | null;
  places: ImpactPlace[];
  description?: string;
}): AtlasView | null {
  const candidates = [input.atlasPlaceId, ...input.places.map((place) => place.id)].filter((id): id is string => Boolean(id));
  const registered = candidates.find((id) => Boolean(placeById(id)));
  const pointPlace = input.places.find((place) => place.referencePoint);
  const statusPlace = input.places.find((place) => place.id === registered) ?? pointPlace ?? input.places[0];
  const status = statusPlace?.geometryStatus;
  const limitation =
    (status ? "Map context: " + humanise(status).toLowerCase() + ". " : "") +
    "This is navigation context, not a project, legal or ecological boundary." +
    (input.places.length > 1 ? " The project spans more places than one map view can show." : "");

  if (registered) {
    return { kind: "IMPACT", title: input.title, description: input.description, placeId: registered, entityId: input.entityId, limitation };
  }
  if (pointPlace?.referencePoint) {
    const { lng, lat, zoom } = pointPlace.referencePoint;
    return { kind: "IMPACT", title: input.title, description: input.description, camera: { lng, lat, zoom }, entityId: input.entityId, limitation };
  }
  return null;
}
