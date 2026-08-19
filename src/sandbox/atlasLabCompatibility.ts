import { LAYERS } from "@/earth/layers";

/**
 * Sandbox-only compatibility hardening for the inherited V36/V40 layer model.
 *
 * Current World renders legend colour stops while several legacy layer entries
 * still carry the older CSS `ramp` representation. Normalise those definitions
 * before World mounts so opening an information drawer cannot throw because a
 * legend is missing `stops`. No scientific values are invented: the colours are
 * extracted verbatim from the already-declared CSS gradient.
 */
export function hardenAtlasLegacyLayerMetadata() {
  let repairedLegends = 0;

  for (const layer of LAYERS as any[]) {
    const legend = layer?.legend;
    if (!legend || Array.isArray(legend.stops) || typeof legend.ramp !== "string") continue;

    const colours = legend.ramp.match(/#[0-9a-fA-F]{3,8}/g) || [];
    if (colours.length >= 2) {
      legend.stops = colours;
      repairedLegends += 1;
    }
  }

  return { repairedLegends };
}
