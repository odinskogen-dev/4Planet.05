export const ORCA_ASSET_FAMILY = Object.freeze({
  id: "4p:species:orca:asset-pack:v1",
  entityId: "taxon:gbif:2440483",
  slug: "orca",
  scientificName: "Orcinus orca",
  manifestUrl: "/assets/species/orca/ASSET-MANIFEST.json",
  publicManifestUrl: "https://4planet.org/assets/species/orca/ASSET-MANIFEST.json",
  scientificState: "MIXED_ASSET_FAMILY" as const,
  truthBoundary: "The asset family contains production media, reference-grounded reconstruction, real audio/reference material and source records. Shared identity does not make every asset measured anatomy or observation evidence.",
});

export const isOrcaScientificName = (value: unknown) =>
  String(value ?? "").trim().toLowerCase() === ORCA_ASSET_FAMILY.scientificName.toLowerCase();
