import { placeById } from "@/planet/places";
import { atlasHrefFromState, canonicalReturnState, type AtlasState } from "@/product/productContext";

/** A View is a read configuration over the existing MapLibre ATLAS and PLANETBRAIN. */
export const ATLAS_VIEW_KINDS = [
  "NEWS", "SPECIES", "PLACE", "IMPACT", "NATION", "BRANDS", "PERSONAL", "SOLUTIONS",
] as const;
export type AtlasViewKind = (typeof ATLAS_VIEW_KINDS)[number];

export interface AtlasView {
  kind: AtlasViewKind;
  title: string;
  description?: string;
  /** Existing canonical 4PLANET PLACE id, not a new coordinate record. */
  placeId?: string;
  /** Existing canonical Taxon/Actor/Source entity id. */
  entityId?: string;
  recordId?: string;
  /** Existing ATLAS layer keys. */
  layers?: readonly string[];
  /** Required source/geometry limitation, visible alongside the map. */
  limitation: string;
  /** PRIVATE views require a tenant-scoped server read and must not enter a public iframe URL. */
  access?: "PUBLIC" | "PRIVATE";
}

export function isAtlasEmbedKind(value: string | null): boolean {
  return value !== null && ATLAS_VIEW_KINDS.some((kind) => kind.toLowerCase() === value);
}

export function atlasHrefForView(view: AtlasView): string | null {
  if (view.access === "PRIVATE") return null;
  const place = view.placeId ? placeById(view.placeId) : undefined;
  if (view.placeId && !place) return null;
  if (!place && !view.entityId && !view.recordId) return null;
  const state: AtlasState = {};
  const layers = (view.layers ?? ["bluemarble"])
    .filter((layer) => /^[a-z0-9-]+$/.test(layer))
    .slice(0, 8);
  state.l = layers.length ? layers.join(",") : "bluemarble";
  if (place) {
    // Navigation extent is not an official ecological, drainage or decision boundary.
    state.c = String(place.lng) + "," + String(place.lat);
    state.z = String(place.zoom);
  }
  if (view.entityId) state.entity = view.entityId;
  else if (place) state.entity = place.id;
  if (view.recordId) state.record = view.recordId;
  return atlasHrefFromState(canonicalReturnState(state));
}

export function atlasEmbedHref(view: AtlasView): string | null {
  const full = atlasHrefForView(view);
  if (!full) return null;
  const query = new URLSearchParams(full.split("?")[1] ?? "");
  query.set("embed", view.kind.toLowerCase());
  return "/atlas?" + query.toString();
}


/** On standalone product domains, plain /atlas is owned by that product's router.
 * An embedded map stays first-party there, but the full explorer opens the
 * canonical 4PLANET ATLAS with unchanged (public, reconstructable) query state.
 */
export function atlasFullDestination(fullHref: string, hostname: string): string {
  if (!fullHref.startsWith("/atlas?") && fullHref !== "/atlas") return "/atlas";
  const h = hostname.toLowerCase();
  const sharedAtlasHost = h === "4planet.org" || h === "www.4planet.org" ||
    h === "test.4planet.org" || h === "localhost" || h === "127.0.0.1" ||
    h === "4planet-05.pages.dev" || h.endsWith(".4planet-05.pages.dev");
  return sharedAtlasHost ? fullHref : "https://4planet.org" + fullHref;
}
