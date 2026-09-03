import { C, LAYERS } from "./layers";

/**
 * Bounded runtime corrections for defects found during zero-loss archaeology.
 * This mutates the existing canonical layer descriptor in place; it does not
 * create a second registry or duplicate the layer/source model.
 */
export function repairAtlasLayerRegistry() {
  const emissions = (LAYERS as any[]).find((layer) => layer.id === "emissions");
  if (emissions && !emissions.color) emissions.color = C.amber;
}
