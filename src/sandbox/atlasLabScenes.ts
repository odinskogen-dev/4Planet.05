import { ATLAS_LAB_SCENES } from "@/sandbox/atlasLabRegistry";

/**
 * Resolve one bounded founder-testing scene into the canonical ATLAS URL state.
 * A scene is a layer preset, not a new product mode. This distinction matters:
 * PLANET/OCE4N/E4RTH/S4PIENS remain domain modes, while scenes are reusable
 * combinations of layers for a question or journey.
 */
export function applyAtlasLabSceneFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("scene");
  const scene = ATLAS_LAB_SCENES.find((candidate) => candidate.id === requested)
    ?? ATLAS_LAB_SCENES[0];

  if (requested) {
    // Explicit scene owns mode + layer stack for deterministic comparison.
    params.set("m", scene.mode);
    params.set("l", scene.layers.join(","));
  } else {
    if (!params.has("m")) params.set("m", scene.mode);
    if (!params.has("l")) params.set("l", scene.layers.join(","));
  }

  if (!params.has("z")) params.set("z", "3.40");
  if (!params.has("c")) params.set("c", "8.00,57.00");

  window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  return scene;
}
