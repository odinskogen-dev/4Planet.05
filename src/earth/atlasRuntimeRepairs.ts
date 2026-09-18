import { C, LAYERS } from "./layers";

/**
 * Bounded runtime corrections for defects found during zero-loss archaeology.
 * This mutates the existing canonical layer descriptor in place; it does not
 * create a second registry or duplicate the layer/source model.
 */
export function repairAtlasLayerRegistry() {
  const emissions = (LAYERS as any[]).find((layer) => layer.id === "emissions");
  if (emissions && !emissions.color) emissions.color = C.amber;

  // Human-facing search already calls this source EARTHQUAKES. Keep the source
  // registry aligned with ordinary language instead of exposing the internal
  // stylised legacy label QU4KES in the layer console.
  const quakes = (LAYERS as any[]).find((layer) => layer.id === "quakes");
  if (quakes && quakes.label !== "EARTHQUAKES") quakes.label = "EARTHQUAKES";
}
