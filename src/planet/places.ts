/* ═══════════════════════════════════════════════════════════════════════════
   4PLANET_ — ADAPTATION LAYER — PLACE REGISTRY
   STATUS: SEEDED. NOT CANON. (Brief §28, §52)

   Brief §52: "Initial integrated proof location: BERGEN, NORWAY. Bergen is a
   proof location. It is not the permanent geographic centre of 4PLANET."
   Brief §28: "The architecture must not hardcode Norway as the global geography
   model. GLOBAL BY ARCHITECTURE. LOCAL BY CONTEXT."

   So: Bergen is proven deepest, but the registry is global and the *shape* is
   geography-agnostic. There is no Norway branch anywhere in the code.

   WHY A SEEDED REGISTRY AND NOT A GEOCODER:
   A geocoder (Nominatim, Mapbox, Google) would give us thousands of places for
   free. It would also give us thousands of places with no ecological identity,
   no living-system link, no coverage story and — in Nominatim's case — a usage
   policy we have not assessed (Brief §35: an API existing is not permission).
   A place with no system context is a pin, and a pin is not intelligence.

   Fourteen real places, each with a declared kind, a bbox and a system link, is
   a better proof of PLACE than a million pins. Widen this list, or swap it for a
   geocoder + entity-resolution layer, once Codex owns the Place contract.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { Place } from "./types";
import { placeId, systemId, pressureId } from "./ids";

export const PLACES: Place[] = [
  {
    id: placeId("bergen"),
    name: "Bergen",
    kind: "CITY",
    lat: 60.3913,
    lng: 5.3221,
    bbox: [4.95, 60.2, 5.75, 60.55],
    zoom: 9.4,
    geometryKind: "BOUNDING_BOX",
    altNames: ["Bjørgvin"],
    blurb:
      "A coastal city on the western edge of Norway, built into a fjord system that opens directly onto the North Sea. What happens in the water here is not separate from what happens in the streets.",
    livingSystemIds: [systemId("coastal-sea"), systemId("pollination")],
    pressureIds: [pressureId("warming-water"), pressureId("habitat-loss")],
  },
  {
    id: placeId("norwegian-sea"),
    name: "Norwegian Sea",
    kind: "MARINE_AREA",
    lat: 67.0,
    lng: 3.0,
    bbox: [-8, 62, 18, 74],
    zoom: 4.2,
    geometryKind: "BOUNDING_BOX",
    blurb:
      "A deep marine basin between Norway, Iceland and Svalbard. A migration corridor for large cetaceans and one of the most productive cold-water systems on the planet.",
    livingSystemIds: [systemId("coastal-sea")],
    pressureIds: [pressureId("warming-water"), pressureId("overexploitation")],
  },
  {
    id: placeId("svalbard"),
    name: "Svalbard",
    kind: "REGION",
    lat: 78.2,
    lng: 15.6,
    bbox: [10, 76.4, 25, 80.2],
    zoom: 5,
    geometryKind: "BOUNDING_BOX",
    blurb: "High Arctic archipelago. Sea ice here is not scenery — it is habitat.",
    livingSystemIds: [systemId("coastal-sea")],
    pressureIds: [pressureId("warming-water")],
  },
  {
    id: placeId("oslo"),
    name: "Oslo",
    kind: "CITY",
    lat: 59.9139,
    lng: 10.7522,
    bbox: [10.5, 59.8, 11.0, 60.05],
    zoom: 9.6,
    geometryKind: "BOUNDING_BOX",
    livingSystemIds: [systemId("pollination")],
    pressureIds: [pressureId("habitat-loss"), pressureId("pesticide-pressure")],
  },
  {
    id: placeId("amazon"),
    name: "Amazon Basin",
    kind: "FOREST",
    lat: -4.0,
    lng: -62.0,
    bbox: [-79, -18, -44, 6],
    zoom: 3.4,
    geometryKind: "BOUNDING_BOX",
    blurb:
      "The largest continuous rainforest on Earth, and a machine that moves water through the atmosphere at continental scale.",
    livingSystemIds: [systemId("tropical-forest")],
    pressureIds: [pressureId("habitat-loss"), pressureId("fire")],
  },
  {
    id: placeId("great-barrier-reef"),
    name: "Great Barrier Reef",
    kind: "MARINE_AREA",
    lat: -18.2,
    lng: 147.5,
    bbox: [142, -24.5, 154, -10],
    zoom: 4.6,
    geometryKind: "BOUNDING_BOX",
    blurb: "The largest coral system on the planet, and the most heat-stressed.",
    livingSystemIds: [systemId("coral-reef")],
    pressureIds: [pressureId("warming-water")],
  },
  {
    id: placeId("congo-basin"),
    name: "Congo Basin",
    kind: "FOREST",
    lat: 0.5,
    lng: 20.0,
    bbox: [8, -8, 32, 6],
    zoom: 3.8,
    geometryKind: "BOUNDING_BOX",
    livingSystemIds: [systemId("tropical-forest")],
    pressureIds: [pressureId("habitat-loss")],
  },
  {
    id: placeId("borneo"),
    name: "Borneo",
    kind: "FOREST",
    lat: 0.9,
    lng: 114.0,
    bbox: [108.5, -4.5, 119.5, 7.5],
    zoom: 5,
    geometryKind: "BOUNDING_BOX",
    livingSystemIds: [systemId("tropical-forest")],
    pressureIds: [pressureId("habitat-loss"), pressureId("fire")],
  },
  {
    id: placeId("california"),
    name: "California",
    kind: "REGION",
    lat: 37.2,
    lng: -119.5,
    bbox: [-124.5, 32.5, -114, 42],
    zoom: 4.8,
    geometryKind: "BOUNDING_BOX",
    livingSystemIds: [systemId("pollination")],
    pressureIds: [pressureId("fire"), pressureId("pesticide-pressure")],
  },
  {
    id: placeId("london"),
    name: "London",
    kind: "CITY",
    lat: 51.5072,
    lng: -0.1276,
    bbox: [-0.51, 51.28, 0.33, 51.69],
    zoom: 9.4,
    geometryKind: "BOUNDING_BOX",
    livingSystemIds: [systemId("pollination")],
    pressureIds: [pressureId("habitat-loss")],
  },
  {
    id: placeId("new-york"),
    name: "New York",
    kind: "CITY",
    lat: 40.7128,
    lng: -74.006,
    bbox: [-74.3, 40.49, -73.7, 40.92],
    zoom: 9.6,
    geometryKind: "BOUNDING_BOX",
    livingSystemIds: [systemId("pollination"), systemId("coastal-sea")],
    pressureIds: [pressureId("habitat-loss")],
  },
  {
    id: placeId("galapagos"),
    name: "Galápagos",
    kind: "MARINE_AREA",
    lat: -0.7,
    lng: -90.5,
    bbox: [-92.2, -1.6, -89, 0.8],
    zoom: 6.4,
    geometryKind: "BOUNDING_BOX",
    livingSystemIds: [systemId("coastal-sea")],
    pressureIds: [pressureId("warming-water"), pressureId("overexploitation")],
  },
  {
    id: placeId("great-plains"),
    name: "Great Plains",
    kind: "REGION",
    lat: 41.0,
    lng: -100.0,
    bbox: [-106, 32, -95, 49],
    zoom: 4.2,
    geometryKind: "BOUNDING_BOX",
    blurb: "Industrial-scale agriculture — the clearest place on Earth to see the food system depend on pollination.",
    livingSystemIds: [systemId("pollination")],
    pressureIds: [pressureId("pesticide-pressure"), pressureId("habitat-loss")],
  },
  {
    id: placeId("antarctic-peninsula"),
    name: "Antarctic Peninsula",
    kind: "REGION",
    lat: -66.0,
    lng: -62.0,
    bbox: [-70, -70, -55, -62],
    zoom: 4.4,
    geometryKind: "BOUNDING_BOX",
    livingSystemIds: [systemId("coastal-sea")],
    pressureIds: [pressureId("warming-water")],
  },
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const placeById = (id: string): Place | undefined => PLACES.find((p) => p.id === id);

export const searchPlaces = (q: string): Place[] => {
  const t = norm(q.trim());
  if (t.length < 2) return [];
  return PLACES.map((p) => {
    const names = [p.name, ...(p.altNames ?? [])].map(norm);
    const best = names.reduce(
      (s, n) => Math.min(s, n.startsWith(t) ? 0 : n.includes(t) ? 1 : 9),
      9,
    );
    return { p, score: best };
  })
    .filter((x) => x.score < 9)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.p);
};

/** Rough great-circle distance, km. */
export const distanceKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number => {
  const R = 6371;
  const p = Math.PI / 180;
  const dLa = (b.lat - a.lat) * p;
  const dLo = (b.lng - a.lng) * p;
  const h =
    Math.sin(dLa / 2) ** 2 +
    Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Radius used to decide whether a signal "happened in" a place. */
export const placeRadiusKm = (p: Place): number => {
  const [w, s, e, n] = p.bbox;
  const diag = distanceKm({ lat: s, lng: w }, { lat: n, lng: e });
  return Math.max(60, diag / 2);
};

export const bboxWkt = (p: Place): string => {
  const [w, s, e, n] = p.bbox;
  return `POLYGON((${w} ${s},${e} ${s},${e} ${n},${w} ${n},${w} ${s}))`;
};
